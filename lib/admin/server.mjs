import { createServer } from "node:http";
import { loadConfig } from "./config.mjs";
import {
  clearLoginFailures,
  createSession,
  destroySession,
  expiredSessionCookie,
  isLoginRateLimited,
  readSession,
  recordLoginFailure,
  sessionCookie,
  validateAuthConfig,
  verifyCredentials,
} from "./auth.mjs";
import { createProduct, listProducts, updateProduct } from "./catalog-store.mjs";
import { checkIntegration, listIntegrationStatuses } from "./integrations.mjs";
import { validateExpectedRevision, validateProduct } from "./validation.mjs";

const config = loadConfig();
validateAuthConfig(config);

function send(response, status, body, headers = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    ...headers,
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  if (!String(request.headers["content-type"] || "").toLowerCase().startsWith("application/json")) {
    const error = new Error("Ожидается application/json");
    error.status = 415;
    throw error;
  }
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > config.maxBodyBytes) {
      const error = new Error("Слишком большой запрос");
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Некорректный JSON");
    error.status = 400;
    throw error;
  }
}

function clientAddress(request) {
  return request.headers["x-real-ip"] || request.socket.remoteAddress || "unknown";
}

function requireOrigin(request) {
  if (request.headers.origin !== config.origin) {
    const error = new Error("Запрос отклонён политикой origin");
    error.status = 403;
    throw error;
  }
}

function requireSession(request) {
  const session = readSession(config, request.headers.cookie);
  if (!session) {
    const error = new Error("Требуется вход");
    error.status = 401;
    throw error;
  }
  return session;
}

function requireMutationAuth(request) {
  requireOrigin(request);
  const session = requireSession(request);
  if (request.headers["x-csrf-token"] !== session.csrfToken) {
    const error = new Error("Некорректный CSRF-токен");
    error.status = 403;
    throw error;
  }
  return session;
}

function asValidation(operation) {
  try {
    return operation();
  } catch (error) {
    error.status = error.status || 422;
    throw error;
  }
}

async function login(request, response) {
  requireOrigin(request);
  const address = clientAddress(request);
  if (isLoginRateLimited(address)) return send(response, 429, { ok: false, error: "Слишком много попыток. Повторите позже" });
  const body = await readJson(request);
  if (!verifyCredentials(config, body?.username, body?.password)) {
    recordLoginFailure(address);
    return send(response, 401, { ok: false, error: "Неверный логин или пароль" });
  }
  clearLoginFailures(address);
  const session = createSession(config);
  return send(response, 201, {
    ok: true,
    authenticated: true,
    username: config.username,
    csrfToken: session.csrfToken,
    expiresAt: new Date(session.expiresAt).toISOString(),
  }, { "Set-Cookie": sessionCookie(config, session.token, session.expiresAt) });
}

async function route(request, response) {
  const url = new URL(request.url || "/", "http://localhost");
  if (request.method === "GET" && url.pathname === "/api/admin/health") {
    return send(response, 200, { ok: true, service: "anestet-admin-api", schemaVersion: 1 });
  }
  if (request.method === "GET" && url.pathname === "/api/catalog") {
    const catalog = await listProducts(config);
    return send(response, 200, { ok: true, catalogRevision: catalog.catalogRevision, products: catalog.products.filter((product) => product.active) });
  }
  if (request.method === "POST" && url.pathname === "/api/admin/session") return login(request, response);
  if (request.method === "GET" && url.pathname === "/api/admin/session") {
    const session = readSession(config, request.headers.cookie);
    if (!session) return send(response, 200, { ok: true, authenticated: false });
    return send(response, 200, {
      ok: true,
      authenticated: true,
      username: session.username,
      csrfToken: session.csrfToken,
      expiresAt: new Date(session.expiresAt).toISOString(),
    });
  }
  if (request.method === "DELETE" && url.pathname === "/api/admin/session") {
    const session = requireMutationAuth(request);
    destroySession(session);
    return send(response, 200, { ok: true }, { "Set-Cookie": expiredSessionCookie(config) });
  }
  if (request.method === "GET" && url.pathname === "/api/admin/products") {
    requireSession(request);
    return send(response, 200, { ok: true, ...(await listProducts(config)) });
  }
  if (request.method === "GET" && url.pathname === "/api/admin/integrations") {
    requireSession(request);
    return send(response, 200, { ok: true, integrations: listIntegrationStatuses() });
  }
  const integrationMatch = url.pathname.match(/^\/api\/admin\/integrations\/([a-z0-9-]+)\/check$/);
  if (request.method === "POST" && integrationMatch) {
    const session = requireMutationAuth(request);
    const result = await checkIntegration(config, session.username, integrationMatch[1]);
    return send(response, result.status, result.body);
  }
  if (request.method === "POST" && url.pathname === "/api/admin/products") {
    const session = requireMutationAuth(request);
    const body = await readJson(request);
    const product = asValidation(() => validateProduct(body));
    return send(response, 201, { ok: true, ...(await createProduct(config, session.username, product)) });
  }
  const productMatch = url.pathname.match(/^\/api\/admin\/products\/(\d+)$/);
  if (request.method === "PATCH" && productMatch) {
    const session = requireMutationAuth(request);
    const body = await readJson(request);
    const expectedRevision = asValidation(() => validateExpectedRevision(body?.revision));
    const product = asValidation(() => validateProduct(body?.product));
    return send(response, 200, {
      ok: true,
      ...(await updateProduct(config, session.username, Number(productMatch[1]), expectedRevision, product)),
    });
  }
  return send(response, 404, { ok: false, error: "Not found" });
}

const server = createServer(async (request, response) => {
  try {
    await route(request, response);
  } catch (error) {
    const status = error?.status || ({ CONFLICT: 409, STALE_REVISION: 409, NOT_FOUND: 404 }[error?.code] ?? 500);
    const message = status >= 500 ? "Внутренняя ошибка сервиса" : (error instanceof Error ? error.message : "Некорректный запрос");
    if (status >= 500) console.error("Admin API error", error);
    send(response, status, { ok: false, error: message, code: error?.code });
  }
});

server.listen(config.port, config.host, () => {
  console.log(`ANESTET admin API listening on http://${config.host}:${config.port}`);
});
