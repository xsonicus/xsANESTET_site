import { mergeSyncedVkFeed } from "./vk-feed-store.mjs";
import { readConnectorSecrets } from "./connector-secret-store.mjs";

const DEFAULT_API_URL = "https://api.vk.com/method/wall.get";
const DEFAULT_API_VERSION = "5.199";

function env(name, fallback = "") {
  return process.env[name]?.trim() || fallback;
}

export async function vkSettings(config) {
  const stored = config ? (await readConnectorSecrets(config)).vk || {} : {};
  return {
    apiUrl: env("VK_API_URL", DEFAULT_API_URL),
    groupDomain: stored.groupDomain || env("VK_GROUP_DOMAIN", "queenkeyanestet"),
    accessToken: stored.accessToken || env("VK_ACCESS_TOKEN"),
    apiVersion: stored.apiVersion || env("VK_API_VERSION", DEFAULT_API_VERSION),
    postLimit: Math.min(5_000, Math.max(1, Number(env("VK_POST_LIMIT", "1000")) || 1_000)),
    timeoutMs: Math.min(30_000, Math.max(1_000, Number(env("VK_SYNC_TIMEOUT_MS", "10000")) || 10_000)),
  };
}

function cleanText(value, maxLength) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function safeHttpsUrl(value, allowedRoots) {
  if (!value || typeof value !== "string" || value.length > 2_048) return null;
  try {
    const parsed = new URL(value.startsWith("//") ? `https:${value}` : value);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) return null;
    const hostname = parsed.hostname.toLowerCase();
    if (!allowedRoots.some((root) => hostname === root || hostname.endsWith(`.${root}`))) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function safePlayerUrl(value) {
  const safe = safeHttpsUrl(value, ["vk.com", "vk.ru", "vkvideo.ru"]);
  if (!safe) return null;
  const parsed = new URL(safe);
  return parsed.pathname === "/video_ext.php" ? safe : null;
}

function bestImage(images) {
  if (!Array.isArray(images)) return null;
  const candidates = images.flatMap((image) => {
    const url = safeHttpsUrl(image?.url, ["userapi.com", "vkuser.net", "vk.com", "vk.ru", "vkvideo.ru"]);
    const width = Number(image?.width);
    const height = Number(image?.height);
    return url && Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0 ? [{ url, width, height }] : [];
  });
  return candidates.sort((first, second) => (second.width * second.height) - (first.width * first.height))[0] ?? null;
}

function postCandidates(post) {
  const history = Array.isArray(post?.copy_history) ? post.copy_history : [];
  return [post, ...history];
}

export function normalizeVkWallResponse(payload) {
  const posts = Array.isArray(payload?.response?.items) ? payload.response.items : [];
  return posts.flatMap((post) => {
    const postOwnerId = Number(post?.owner_id);
    const postId = Number(post?.id);
    if (!Number.isInteger(postOwnerId) || !Number.isInteger(postId)) return [];
    const candidates = postCandidates(post);
    const attachments = candidates.flatMap((candidate) => Array.isArray(candidate?.attachments) ? candidate.attachments : []);
    const postText = cleanText(candidates.map((candidate) => candidate?.text).find(Boolean) || post.text, 360);
    const videoItem = attachments.flatMap((attachment) => {
      if (attachment?.type !== "video" || !attachment.video) return [];
      const video = attachment.video;
      const ownerId = Number(video.owner_id);
      const videoId = Number(video.id);
      const playerUrl = safePlayerUrl(video.player);
      const poster = bestImage(video.image) ?? bestImage(video.first_frame);
      if (!Number.isInteger(ownerId) || !Number.isInteger(videoId) || !Number.isInteger(postOwnerId) || !Number.isInteger(postId) || !playerUrl || !poster) return [];
      const title = cleanText(video.title, 140) || cleanText(postText, 140) || "Видео ANESTET";
      return [{
        id: `video-${ownerId}_${videoId}`,
        kind: "video",
        ownerId,
        videoId,
        postId,
        title,
        excerpt: postText,
        publishedAt: new Date(Math.max(0, Number(post.date) || Number(video.date) || 0) * 1_000).toISOString(),
        duration: Math.max(0, Math.floor(Number(video.duration) || 0)),
        posterUrl: poster.url,
        posterWidth: poster.width,
        posterHeight: poster.height,
        playerUrl,
        sourceUrl: `https://vk.com/wall${postOwnerId}_${postId}`,
        videoUrl: `https://vk.com/video${ownerId}_${videoId}`,
      }];
    })[0];
    if (videoItem) return [videoItem];

    const photo = attachments.flatMap((attachment) => attachment?.type === "photo" && attachment.photo
      ? [bestImage(attachment.photo.sizes)]
      : []).find(Boolean);
    if (!photo) return [];
    return [{
      id: `post-${postOwnerId}_${postId}`,
      kind: "post",
      postId,
      title: cleanText(postText, 140) || "Публикация ANESTET",
      excerpt: postText,
      publishedAt: new Date(Math.max(0, Number(post.date) || 0) * 1_000).toISOString(),
      duration: 0,
      posterUrl: photo.url,
      posterWidth: photo.width,
      posterHeight: photo.height,
      playerUrl: null,
      sourceUrl: `https://vk.com/wall${postOwnerId}_${postId}`,
    }];
  });
}

async function fetchWall(config, count, offset = 0) {
  const settings = await vkSettings(config);
  if (!settings.groupDomain || !settings.accessToken) {
    const error = new Error("VK-коннектор не настроен. Исходящий запрос не выполнялся");
    error.status = 409;
    error.externalRequestMade = false;
    throw error;
  }
  const apiUrl = new URL(settings.apiUrl);
  if (apiUrl.protocol !== "https:" || apiUrl.hostname !== "api.vk.com" || apiUrl.pathname !== "/method/wall.get") {
    const error = new Error("VK_API_URL должен указывать на официальный HTTPS endpoint wall.get");
    error.status = 422;
    error.externalRequestMade = false;
    throw error;
  }
  const body = new URLSearchParams({
    domain: settings.groupDomain,
    count: String(Math.min(100, count)),
    offset: String(Math.max(0, offset)),
    filter: "owner",
    extended: "0",
    access_token: settings.accessToken,
    v: settings.apiVersion,
  });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), settings.timeoutMs);
  let response;
  try {
    response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body,
      signal: controller.signal,
    });
  } catch {
    const error = new Error("VK API недоступен или превысил время ожидания");
    error.status = 502;
    error.externalRequestMade = true;
    throw error;
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) {
    const error = new Error("VK API вернул ошибку транспорта");
    error.status = 502;
    error.externalRequestMade = true;
    throw error;
  }
  const payload = await response.json().catch(() => null);
  if (!payload || payload.error) {
    const error = new Error("VK API отклонил запрос. Проверьте домен сообщества, токен и права wall/video");
    error.status = 502;
    error.externalRequestMade = true;
    throw error;
  }
  return { payload, settings };
}

export async function checkVkConnection(config) {
  const { payload } = await fetchWall(config, 1);
  return { ok: true, postsAvailable: Number(payload?.response?.count) || 0 };
}

export async function syncVkFeed(config, actor) {
  const settings = await vkSettings(config);
  const first = await fetchWall(config, Math.min(100, settings.postLimit), 0);
  const available = Math.max(0, Number(first.payload?.response?.count) || 0);
  const target = Math.min(settings.postLimit, available || settings.postLimit);
  const payloads = [first.payload];
  for (let offset = 100; offset < target; offset += 100) {
    const page = await fetchWall(config, Math.min(100, target - offset), offset);
    payloads.push(page.payload);
  }
  const unique = new Map(payloads.flatMap(normalizeVkWallResponse).map((publication) => [publication.id, publication]));
  const publications = [...unique.values()];
  return mergeSyncedVkFeed(config, actor, settings.groupDomain, publications);
}
