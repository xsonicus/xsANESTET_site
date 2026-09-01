import { appendFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const EMPTY_FEED = Object.freeze({ schemaVersion: 1, revision: 0, syncedAt: null, sourceDomain: null, items: [] });

function validFeed(value) {
  return value?.schemaVersion === 1
    && Number.isInteger(value.revision)
    && Array.isArray(value.items);
}

async function readFeed(path) {
  try {
    const parsed = JSON.parse(await readFile(path, "utf8"));
    if (!validFeed(parsed)) throw new Error("VK feed store has an unsupported schema");
    return parsed;
  } catch (error) {
    if (error?.code === "ENOENT") return structuredClone(EMPTY_FEED);
    throw error;
  }
}

async function writeFeed(path, feed) {
  await mkdir(dirname(path), { recursive: true, mode: 0o750 });
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(feed, null, 2)}\n`, { encoding: "utf8", mode: 0o640 });
  await rename(temporary, path);
}

let mutationQueue = Promise.resolve();

function serializeMutation(operation) {
  const result = mutationQueue.then(operation, operation);
  mutationQueue = result.catch(() => undefined);
  return result;
}

async function audit(config, actor, action, details) {
  await mkdir(dirname(config.auditStore), { recursive: true, mode: 0o750 });
  await appendFile(config.auditStore, `${JSON.stringify({ at: new Date().toISOString(), actor, action, ...details })}\n`, { encoding: "utf8", mode: 0o640 });
}

function publicItem(item) {
  return {
    id: item.id,
    kind: item.kind,
    title: item.title,
    excerpt: item.excerpt,
    publishedAt: item.publishedAt,
    duration: item.duration,
    posterUrl: item.posterUrl,
    posterWidth: item.posterWidth,
    posterHeight: item.posterHeight,
    playerUrl: item.playerUrl,
    sourceUrl: item.sourceUrl,
    productId: item.productId,
  };
}

export async function listPublicVkFeed(config) {
  const feed = await readFeed(config.vkFeedStore);
  return {
    feedRevision: feed.revision,
    syncedAt: feed.syncedAt,
    items: feed.items.filter((item) => item.published && item.posterUrl && (item.kind === "post" || item.playerUrl)).map(publicItem),
  };
}

export async function listAdminVkFeed(config) {
  const feed = await readFeed(config.vkFeedStore);
  return { feedRevision: feed.revision, syncedAt: feed.syncedAt, sourceDomain: feed.sourceDomain, items: feed.items };
}

export async function mergeSyncedVkFeed(config, actor, sourceDomain, incoming) {
  return serializeMutation(async () => {
    const current = await readFeed(config.vkFeedStore);
    const previousById = new Map(current.items.map((item) => [item.id, item]));
    const syncedAt = new Date().toISOString();
    const items = incoming.map((item) => {
      const previous = previousById.get(item.id);
      return {
        ...item,
        productId: previous?.productId ?? null,
        published: previous ? previous.published === true : true,
        revision: previous?.revision ?? 1,
        updatedAt: previous?.updatedAt ?? syncedAt,
      };
    });
    const next = { schemaVersion: 1, revision: current.revision + 1, syncedAt, sourceDomain, items };
    await writeFeed(config.vkFeedStore, next);
    await audit(config, actor, "vk.sync", { sourceDomain, imported: incoming.length, published: items.filter((item) => item.published).length, externalRequestMade: true });
    return { feedRevision: next.revision, syncedAt, sourceDomain, items };
  });
}

export async function updateVkFeedItem(config, actor, id, expectedRevision, patch, allowedProductIds) {
  return serializeMutation(async () => {
    const current = await readFeed(config.vkFeedStore);
    const index = current.items.findIndex((item) => item.id === id);
    if (index < 0) {
      const error = new Error("Публикация не найдена");
      error.code = "NOT_FOUND";
      throw error;
    }
    const item = current.items[index];
    if (item.revision !== expectedRevision) {
      const error = new Error("Публикация уже изменена в другой сессии. Обновите список");
      error.code = "STALE_REVISION";
      throw error;
    }
    const productId = patch.productId === null ? null : Number(patch.productId);
    if (productId !== null && (!Number.isInteger(productId) || !allowedProductIds.has(productId))) {
      const error = new Error("Выбран неизвестный товар");
      error.status = 422;
      throw error;
    }
    const published = patch.published === true;
    const updated = { ...item, productId, published, revision: item.revision + 1, updatedAt: new Date().toISOString() };
    const items = [...current.items];
    items[index] = updated;
    const next = { ...current, revision: current.revision + 1, items };
    await writeFeed(config.vkFeedStore, next);
    await audit(config, actor, "vk.item.update", { itemId: id, productId, published, itemRevision: updated.revision });
    return { item: updated, feedRevision: next.revision };
  });
}
