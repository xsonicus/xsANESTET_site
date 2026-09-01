import { createServer } from "node:net";
import { pbkdf2Sync, randomBytes } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { normalizeVkWallResponse } from "../lib/admin/vk-connector.mjs";
import { mergeSyncedVkFeed } from "../lib/admin/vk-feed-store.mjs";

const root = resolve(import.meta.dirname, "..");
const temporary = await mkdtemp(join(tmpdir(), "anestet-admin-smoke-"));
const catalogStore = join(temporary, "catalog.json");
const auditStore = join(temporary, "audit.jsonl");
const vkFeedStore = join(temporary, "vk-feed.json");
const connectorSecretsStore = join(temporary, "connector-secrets.enc.json");
const connectorSecretsKey = randomBytes(32).toString("base64");
const vkAccessToken = `vk-${randomBytes(24).toString("hex")}`;
const username = "smoke-admin";
const password = `smoke-${randomBytes(12).toString("hex")}`;
const iterations = 310_000;
const salt = randomBytes(16);
const digest = pbkdf2Sync(password, salt, iterations, 32, "sha256");
const passwordHash = `pbkdf2-sha256$${iterations}$${salt.toString("base64url")}$${digest.toString("base64url")}`;

async function freePort() {
  return new Promise((resolvePort, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      const port = typeof address === "object" && address ? address.port : 0;
      probe.close((error) => error ? reject(error) : resolvePort(port));
    });
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function jsonFetch(url, init) {
  const response = await fetch(url, init);
  const body = await response.json();
  return { response, body };
}

const port = await freePort();
const origin = `http://127.0.0.1:${port}`;
const onecToken = `onec-${randomBytes(16).toString("hex")}`;
const normalizedVkFixture = normalizeVkWallResponse({ response: { items: [{
  id: 77,
  owner_id: -123,
  date: 1730000000,
  text: "Восстанавливающие сливки Queen Key в работе",
  attachments: [{ type: "video", video: {
    id: 45,
    owner_id: -123,
    title: "Queen Key · восстановление кожи",
    duration: 65,
    player: "https://vk.com/video_ext.php?oid=-123&id=45&hash=publichash",
    image: [{ url: "https://sun9-1.userapi.com/smoke-cover.jpg", width: 1280, height: 720 }],
  } }],
}] } });
assert(normalizedVkFixture.length === 1 && normalizedVkFixture[0].id === "video--123_45" && normalizedVkFixture[0].kind === "video", "VK wall video normalization failed");
assert(normalizeVkWallResponse({ response: { items: [{ ...{ id: 1, owner_id: -123, date: 1 }, attachments: [{ type: "video", video: { ...normalizedVkFixture[0], player: "https://evil.invalid/video_ext.php", image: [{ url: "https://sun9-1.userapi.com/x.jpg", width: 10, height: 10 }] } }] }] } }).length === 0, "Unsafe VK player URL must be rejected");
const normalizedPhotoPost = normalizeVkWallResponse({ response: { items: [{ id: 78, owner_id: -123, date: 1730000001, text: "Новость ANESTET", attachments: [{ type: "photo", photo: { sizes: [{ url: "https://sun9-1.userapi.com/news.jpg", width: 1080, height: 1350 }] } }] }] } });
assert(normalizedPhotoPost.length === 1 && normalizedPhotoPost[0].kind === "post" && normalizedPhotoPost[0].playerUrl === null, "VK wall photo post normalization failed");
await mergeSyncedVkFeed({ vkFeedStore, auditStore }, username, "queenkeyanestet", normalizedVkFixture);
const child = spawn(process.execPath, ["lib/admin/server.mjs"], {
  cwd: root,
  env: {
    ...process.env,
    ANESTET_ADMIN_HOST: "127.0.0.1",
    ANESTET_ADMIN_PORT: String(port),
    ANESTET_ADMIN_ORIGIN: origin,
    ANESTET_ADMIN_USERNAME: username,
    ANESTET_ADMIN_PASSWORD_HASH: passwordHash,
    ANESTET_CATALOG_STORE: catalogStore,
    ANESTET_VK_FEED_STORE: vkFeedStore,
    ANESTET_CONNECTOR_SECRETS_STORE: connectorSecretsStore,
    ANESTET_CONNECTOR_SECRETS_KEY: connectorSecretsKey,
    ANESTET_ADMIN_AUDIT_STORE: auditStore,
    ANESTET_ADMIN_COOKIE_SECURE: "false",
    ONEC_API_URL: "https://onec.invalid/api",
    ONEC_API_TOKEN: onecToken,
    CDEK_API_URL: "",
    CDEK_CLIENT_ID: "",
    CDEK_CLIENT_SECRET: "",
    ANESTET_CONNECTOR_URL: "",
    ANESTET_CONNECTOR_TOKEN: "",
    VK_GROUP_DOMAIN: "queenkeyanestet",
    VK_ACCESS_TOKEN: "",
    VK_API_VERSION: "5.199",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let childErrors = "";
child.stderr.on("data", (chunk) => { childErrors += String(chunk); });

try {
  let healthy = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const { response, body } = await jsonFetch(`${origin}/api/admin/health`);
      if (response.status === 200 && body.ok) {
        healthy = true;
        break;
      }
    } catch {
      await new Promise((resolveWait) => setTimeout(resolveWait, 50));
    }
  }
  assert(healthy, `Admin service did not become healthy: ${childErrors}`);

  const publicCatalog = await jsonFetch(`${origin}/api/catalog`);
  assert(publicCatalog.response.status === 200, "Public catalog must be readable");
  assert(publicCatalog.body.products.length === 23, "Seed catalog must contain 23 products");

  const initialPublicVk = await jsonFetch(`${origin}/api/content/vk`);
  assert(initialPublicVk.response.status === 200 && initialPublicVk.body.items.length === 1, "Synced official VK publication must reach the public feed by default");

  const unauthorized = await jsonFetch(`${origin}/api/admin/products`);
  assert(unauthorized.response.status === 401, "Admin catalog must require authentication");

  const anonymousSession = await jsonFetch(`${origin}/api/admin/session`);
  assert(
    anonymousSession.response.status === 200 && anonymousSession.body.authenticated === false,
    "Anonymous session probe must remain console-clean without granting access",
  );

  const wrongOrigin = await jsonFetch(`${origin}/api/admin/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://invalid.example" },
    body: JSON.stringify({ username, password }),
  });
  assert(wrongOrigin.response.status === 403, "Login must reject a foreign Origin");

  const login = await jsonFetch(`${origin}/api/admin/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify({ username, password }),
  });
  assert(login.response.status === 201 && login.body.authenticated, "Valid credentials must create a session");
  const cookie = login.response.headers.get("set-cookie")?.split(";", 1)[0];
  const csrf = login.body.csrfToken;
  assert(cookie && csrf, "Login must return an HttpOnly cookie and CSRF token");
  assert(login.response.headers.get("set-cookie")?.includes("HttpOnly"), "Session cookie must be HttpOnly");
  assert(login.response.headers.get("set-cookie")?.includes("SameSite=Strict"), "Session cookie must be SameSite=Strict");

  const adminCatalog = await jsonFetch(`${origin}/api/admin/products`, { headers: { Cookie: cookie } });
  assert(adminCatalog.response.status === 200 && adminCatalog.body.products.length === 23, "Authenticated catalog read failed");

  const adminVk = await jsonFetch(`${origin}/api/admin/vk/items`, { headers: { Cookie: cookie } });
  assert(adminVk.response.status === 200 && adminVk.body.items.length === 1, "Authenticated VK feed read failed");

  const integrationStatus = await jsonFetch(`${origin}/api/admin/integrations`, { headers: { Cookie: cookie } });
  const serializedStatus = JSON.stringify(integrationStatus.body);
  assert(integrationStatus.response.status === 200, "Integration status endpoint failed");
  assert(!serializedStatus.includes(onecToken) && !serializedStatus.includes("https://onec.invalid/api"), "Integration API leaked a server secret or endpoint");
  assert(integrationStatus.body.integrations.find((item) => item.id === "onec")?.configured === true, "Configured 1C status was not detected");
  assert(integrationStatus.body.integrations.find((item) => item.id === "cdek")?.configured === false, "Incomplete CDEK status was not fail-closed");
  assert(integrationStatus.body.integrations.find((item) => item.id === "vk")?.configured === false, "VK must remain fail-closed without a token");

  const mutationHeaders = { Cookie: cookie, Origin: origin, "X-CSRF-Token": csrf };
  const configuredCheck = await jsonFetch(`${origin}/api/admin/integrations/onec/check`, { method: "POST", headers: mutationHeaders });
  assert(configuredCheck.response.status === 501, "Configured connector without adapter must return 501");
  assert(configuredCheck.body.externalRequestMade === false && configuredCheck.body.state === "adapter_pending", "Configured connector must not make an external request");

  const incompleteCheck = await jsonFetch(`${origin}/api/admin/integrations/cdek/check`, { method: "POST", headers: mutationHeaders });
  assert(incompleteCheck.response.status === 409, "Incomplete connector must return 409");
  assert(incompleteCheck.body.externalRequestMade === false, "Incomplete connector must not make an external request");

  const vkCheck = await jsonFetch(`${origin}/api/admin/integrations/vk/check`, { method: "POST", headers: mutationHeaders });
  assert(vkCheck.response.status === 409 && vkCheck.body.externalRequestMade === false, "VK check without token must make zero external requests");

  const savedVkSettings = await jsonFetch(`${origin}/api/admin/integrations/vk/settings`, {
    method: "PUT",
    headers: { ...mutationHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ groupDomain: "queenkeyanestet", apiVersion: "5.199", accessToken: vkAccessToken }),
  });
  assert(savedVkSettings.response.status === 200 && savedVkSettings.body.settings.tokenConfigured === true, "Encrypted VK settings save failed");
  const encryptedSecrets = await readFile(connectorSecretsStore, "utf8");
  assert(!encryptedSecrets.includes(vkAccessToken) && encryptedSecrets.includes('"algorithm":"aes-256-gcm"'), "VK token was not encrypted at rest");
  const configuredVkStatus = await jsonFetch(`${origin}/api/admin/integrations`, { headers: { Cookie: cookie } });
  assert(configuredVkStatus.body.integrations.find((item) => item.id === "vk")?.configured === true, "Saved VK token was not reflected in connector status");

  const vkPublish = await jsonFetch(`${origin}/api/admin/vk/items/${encodeURIComponent("video--123_45")}`, {
    method: "PATCH",
    headers: { ...mutationHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ revision: 1, item: { productId: 60, published: true } }),
  });
  assert(vkPublish.response.status === 200 && vkPublish.body.item.published === true, "VK product mapping and publish failed");
  const publishedVk = await jsonFetch(`${origin}/api/content/vk`);
  assert(publishedVk.response.status === 200 && publishedVk.body.items.length === 1 && publishedVk.body.items[0].productId === 60, "Published VK feed did not reach the storefront contract");

  const invalidDiscount = {
    id: 998,
    sku: "SMOKE-INVALID",
    brand: "TEST",
    title: "Некорректная скидка",
    compactTitle: "Invalid discount",
    tag: "Test",
    image: "/assets/img/test.png",
    price: 100,
    compareAtPrice: null,
    isNew: false,
    isDiscount: true,
    active: false,
  };
  const invalidCreate = await jsonFetch(`${origin}/api/admin/products`, {
    method: "POST",
    headers: { ...mutationHeaders, "Content-Type": "application/json" },
    body: JSON.stringify(invalidDiscount),
  });
  assert(invalidCreate.response.status === 422, "Invalid discount must be rejected");

  const remoteImageCreate = await jsonFetch(`${origin}/api/admin/products`, {
    method: "POST",
    headers: { ...mutationHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ ...invalidDiscount, id: 997, isDiscount: false, image: "https://example.invalid/product.webp" }),
  });
  assert(remoteImageCreate.response.status === 422, "Remote product images must not bypass the storefront asset contract");

  const product = {
    ...invalidDiscount,
    id: 999,
    sku: "SMOKE-VALID",
    title: "Тестовый товар",
    compactTitle: "Smoke product",
    price: 890,
    compareAtPrice: 1190,
  };
  const created = await jsonFetch(`${origin}/api/admin/products`, {
    method: "POST",
    headers: { ...mutationHeaders, "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  assert(created.response.status === 201 && created.body.product.revision === 1, "Product create failed");

  const updatedProduct = { ...product, price: 800 };
  const updated = await jsonFetch(`${origin}/api/admin/products/999`, {
    method: "PATCH",
    headers: { ...mutationHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ revision: 1, product: updatedProduct }),
  });
  assert(updated.response.status === 200 && updated.body.product.revision === 2, "Product update failed");

  const stale = await jsonFetch(`${origin}/api/admin/products/999`, {
    method: "PATCH",
    headers: { ...mutationHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ revision: 1, product: updatedProduct }),
  });
  assert(stale.response.status === 409 && stale.body.code === "STALE_REVISION", "Stale revision must fail with 409");

  const audit = await readFile(auditStore, "utf8");
  assert(!audit.includes(onecToken) && !audit.includes(password) && !audit.includes(vkAccessToken), "Audit log leaked a secret");
  assert(audit.includes('"externalRequestMade":false'), "Integration audit must record zero external requests");
  assert(audit.includes('"action":"product.create"') && audit.includes('"action":"product.update"'), "Catalog audit entries are missing");

  console.log("Admin smoke PASS: auth/origin/CSRF, 23-product catalog, VK video/news normalize/map/publish, encrypted token store, CRUD/revision, secret redaction, connector fail-closed");
} finally {
  child.kill("SIGTERM");
  await new Promise((resolveExit) => child.once("exit", resolveExit));
  await rm(temporary, { recursive: true, force: true });
}
