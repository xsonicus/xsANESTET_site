import { createServer } from "node:http";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { randomBytes } from "node:crypto";

const host = process.env.ANESTET_API_HOST || "127.0.0.1";
const port = Number(process.env.ANESTET_API_PORT || 4317);
const orderStore = process.env.ANESTET_ORDER_STORE || "/var/lib/anestet/orders.jsonl";
const callbackStore = process.env.ANESTET_CALLBACK_STORE || "/var/lib/anestet/callbacks.jsonl";
const catalogStore = process.env.ANESTET_CATALOG_STORE || "/var/lib/anestet/catalog.json";
const adminToken = process.env.ANESTET_ADMIN_TOKEN || "";
const maxBodyBytes = 64 * 1024;

const catalog = new Map([
  [17, ["Base 01 · 30 мл", 800]], [33, ["Base 01 · 400 мл", 4900]], [34, ["Detail 01 · 30 мл", 860]],
  [35, ["FION Ultra 01 · 30 мл", 900]], [36, ["FION Ultra 01 · 400 мл", 5200]], [37, ["Base 02 · 30 мл", 2200]],
  [38, ["Base 02 · 5 мл", 450]], [39, ["FION Ultra 02 · 30 мл", 2400]], [40, ["FION Ultra 02 · 5 мл", 450]],
  [42, ["Repair Ceramide · 50 мл", 2500]], [48, ["Light Frost · 30 мл", 750]], [49, ["Light Frost · 150 мл", 2750]],
  [50, ["Light Frost · 400 мл", 5400]], [51, ["Body Gel · 30 мл", 900]], [52, ["Body Gel · 75 мл", 1600]],
  [53, ["Body Gel · 300 мл", 4350]], [54, ["Face Gel · 300 мл", 4350]], [55, ["Professional · 30 мл", 950]],
  [56, ["Professional · 300 мл", 4750]], [57, ["Анестодерм · 300 мл", 5050]], [58, ["Mildep Pro · 30 мл", 700]],
  [59, ["Mildep Pro · 300 мл", 4000]], [60, ["Recovery Milk · 200 мл", 890]],
]);

const delivery = {
  pickup: { title: "Самовывоз", cost: () => 0 },
  "moscow-courier": { title: "Курьер по Москве", cost: (subtotal) => subtotal >= 4000 ? 0 : 500 },
  "cdek-door": { title: "CDEK до двери", cost: () => null },
  "cdek-pvz": { title: "CDEK до пункта выдачи", cost: () => null },
  "ozon-pvz": { title: "OZON до пункта выдачи", cost: (subtotal) => subtotal >= 2000 ? 0 : 250 },
};

const rateLimits = new Map();

function json(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(body));
}

function clean(value, max = 500) {
  return typeof value === "string" ? value.trim().replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, max) : "";
}

function rateLimited(address) {
  const now = Date.now();
  const recent = (rateLimits.get(address) || []).filter((timestamp) => now - timestamp < 60_000);
  recent.push(now);
  rateLimits.set(address, recent);
  return recent.length > 8;
}

async function readBody(request) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBodyBytes) throw new Error("PAYLOAD_TOO_LARGE");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function currentCatalog() {
  try {
    const parsed = JSON.parse(await readFile(catalogStore, "utf8"));
    if (!Array.isArray(parsed?.products)) throw new Error("Catalog store has an unsupported schema");
    return new Map(parsed.products.filter((product) => product?.active !== false).map((product) => [Number(product.id), [clean(product.compactTitle, 120), Number(product.price)]]));
  } catch (error) {
    if (error?.code === "ENOENT") return catalog;
    throw error;
  }
}

async function validateOrder(input) {
  if (!input || typeof input !== "object") throw new Error("Некорректные данные заказа");
  const customer = input.customer || {};
  const name = clean(customer.name, 100);
  const phone = clean(customer.phone, 40);
  const email = clean(customer.email, 160).toLowerCase();
  if (name.length < 2) throw new Error("Укажите имя получателя");
  if (phone.replace(/\D/g, "").length < 10) throw new Error("Проверьте номер телефона");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Проверьте e-mail");

  const liveCatalog = await currentCatalog();
  const requestedItems = Array.isArray(input.items) ? input.items : [];
  if (!requestedItems.length || requestedItems.length > 50) throw new Error("Корзина пуста или содержит слишком много позиций");
  const items = requestedItems.map((line) => {
    const id = Number(line?.id);
    const quantity = Number(line?.quantity);
    const product = liveCatalog.get(id);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new Error("В корзине есть некорректная позиция");
    return { id, title: product[0], price: product[1], quantity, total: product[1] * quantity };
  });
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  const requestedDelivery = input.delivery || {};
  const deliveryId = clean(requestedDelivery.id, 40);
  const deliveryRule = delivery[deliveryId];
  if (!deliveryRule) throw new Error("Выберите способ доставки");
  const postalCode = clean(requestedDelivery.postalCode, 20);
  const address = clean(requestedDelivery.address, 500);
  if (deliveryId !== "pickup" && address.length < 5) throw new Error("Укажите адрес доставки или пункт выдачи");
  const deliveryCost = deliveryRule.cost(subtotal);

  return {
    customer: { name, phone, email },
    items,
    subtotal,
    delivery: { id: deliveryId, title: deliveryRule.title, postalCode, address, cost: deliveryCost, quoteRequired: deliveryCost === null },
    payment: "confirmation",
    comment: clean(input.comment, 1000),
    source: clean(input.source, 30),
    release: clean(input.release, 50),
    total: subtotal + (deliveryCost || 0),
  };
}

async function createOrder(request, response) {
  const address = request.headers["x-forwarded-for"]?.split(",")[0]?.trim() || request.socket.remoteAddress || "unknown";
  if (rateLimited(address)) return json(response, 429, { ok: false, error: "Слишком много попыток. Повторите через минуту" });
  try {
    const input = await readBody(request);
    const order = await validateOrder(input);
    const now = new Date();
    const orderId = `AN-${now.toISOString().slice(0, 10).replaceAll("-", "")}-${randomBytes(3).toString("hex").toUpperCase()}`;
    const record = { orderId, createdAt: now.toISOString(), status: "new", ...order };
    await mkdir(dirname(orderStore), { recursive: true, mode: 0o750 });
    await appendFile(orderStore, `${JSON.stringify(record)}\n`, { encoding: "utf8", mode: 0o640 });
    return json(response, 201, { ok: true, orderId, status: "new", quoteRequired: order.delivery.quoteRequired });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось создать заказ";
    return json(response, message === "PAYLOAD_TOO_LARGE" ? 413 : 400, { ok: false, error: message === "PAYLOAD_TOO_LARGE" ? "Слишком большой запрос" : message });
  }
}

async function createCallback(request, response) {
  const address = request.headers["x-forwarded-for"]?.split(",")[0]?.trim() || request.socket.remoteAddress || "unknown";
  if (rateLimited(`callback:${address}`)) return json(response, 429, { ok: false, error: "Слишком много попыток. Повторите через минуту" });
  try {
    const input = await readBody(request);
    const phone = clean(input?.phone, 40);
    if (phone.replace(/\D/g, "").length < 10) throw new Error("Проверьте номер телефона");
    if (input?.consent !== true) throw new Error("Нужно согласие на обработку персональных данных");
    const now = new Date();
    const requestId = `CALL-${now.toISOString().slice(0, 10).replaceAll("-", "")}-${randomBytes(3).toString("hex").toUpperCase()}`;
    const record = {
      requestId,
      createdAt: now.toISOString(),
      status: "new",
      phone,
      consent: true,
      marketing: input?.marketing === true,
      source: clean(input?.source, 30),
      release: clean(input?.release, 50),
    };
    await mkdir(dirname(callbackStore), { recursive: true, mode: 0o750 });
    await appendFile(callbackStore, `${JSON.stringify(record)}\n`, { encoding: "utf8", mode: 0o640 });
    return json(response, 201, { ok: true, requestId, status: "new" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось записать заявку";
    return json(response, message === "PAYLOAD_TOO_LARGE" ? 413 : 400, { ok: false, error: message === "PAYLOAD_TOO_LARGE" ? "Слишком большой запрос" : message });
  }
}

async function listOrders(request, response) {
  if (!adminToken || request.headers.authorization !== `Bearer ${adminToken}`) return json(response, 401, { ok: false, error: "Unauthorized" });
  try {
    const raw = await readFile(orderStore, "utf8");
    const orders = raw.trim().split("\n").filter(Boolean).slice(-200).reverse().map((line) => JSON.parse(line));
    return json(response, 200, { ok: true, orders });
  } catch (error) {
    if (error?.code === "ENOENT") return json(response, 200, { ok: true, orders: [] });
    return json(response, 500, { ok: false, error: "Order store is unavailable" });
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", "http://localhost");
  if (request.method === "GET" && url.pathname === "/api/health") return json(response, 200, { ok: true, service: "anestet-order-api", version: 1 });
  if (request.method === "POST" && url.pathname === "/api/orders") return createOrder(request, response);
  if (request.method === "GET" && url.pathname === "/api/orders") return listOrders(request, response);
  if (request.method === "POST" && url.pathname === "/api/callbacks") return createCallback(request, response);
  return json(response, 404, { ok: false, error: "Not found" });
});

server.listen(port, host, () => {
  console.log(`ANESTET order API listening on http://${host}:${port}`);
});
