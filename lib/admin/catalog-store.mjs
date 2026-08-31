import { appendFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { randomBytes } from "node:crypto";

const EMPTY_CATALOG = Object.freeze({ schemaVersion: 1, revision: 0, products: [] });
const SEED_CATALOG_URL = new URL("./catalog.seed.json", import.meta.url);
let mutationQueue = Promise.resolve();

async function readSeedCatalog() {
  try {
    const parsed = JSON.parse(await readFile(SEED_CATALOG_URL, "utf8"));
    if (parsed?.schemaVersion !== 1 || !Number.isInteger(parsed.revision) || !Array.isArray(parsed.products)) throw new Error("Seed catalog has an unsupported schema");
    return parsed;
  } catch (error) {
    if (error?.code === "ENOENT") return structuredClone(EMPTY_CATALOG);
    throw error;
  }
}

async function readCatalog(path) {
  try {
    const parsed = JSON.parse(await readFile(path, "utf8"));
    if (parsed?.schemaVersion !== 1 || !Number.isInteger(parsed.revision) || !Array.isArray(parsed.products)) {
      throw new Error("Catalog store has an unsupported schema");
    }
    return parsed;
  } catch (error) {
    if (error?.code === "ENOENT") return readSeedCatalog();
    throw error;
  }
}

async function writeCatalog(path, catalog) {
  await mkdir(dirname(path), { recursive: true, mode: 0o750 });
  const temporary = `${path}.${process.pid}.${randomBytes(4).toString("hex")}.tmp`;
  await writeFile(temporary, `${JSON.stringify(catalog, null, 2)}\n`, { encoding: "utf8", mode: 0o640 });
  await rename(temporary, path);
}

function enqueue(operation) {
  const result = mutationQueue.then(operation, operation);
  mutationQueue = result.catch(() => undefined);
  return result;
}

async function audit(config, entry) {
  await mkdir(dirname(config.auditStore), { recursive: true, mode: 0o750 });
  await appendFile(config.auditStore, `${JSON.stringify({ at: new Date().toISOString(), ...entry })}\n`, { encoding: "utf8", mode: 0o640 });
}

export async function listProducts(config) {
  const catalog = await readCatalog(config.catalogStore);
  return { catalogRevision: catalog.revision, products: [...catalog.products].sort((a, b) => a.id - b.id) };
}

export async function createProduct(config, actor, input) {
  return enqueue(async () => {
    const catalog = await readCatalog(config.catalogStore);
    if (catalog.products.some((product) => product.id === input.id || product.sku === input.sku)) {
      const error = new Error("Товар с таким ID или SKU уже существует");
      error.code = "CONFLICT";
      throw error;
    }
    const now = new Date().toISOString();
    const product = { ...input, revision: 1, updatedAt: now };
    const next = { ...catalog, revision: catalog.revision + 1, products: [...catalog.products, product] };
    await writeCatalog(config.catalogStore, next);
    await audit(config, { actor, action: "product.create", productId: product.id, revision: product.revision });
    return { product, catalogRevision: next.revision };
  });
}

export async function updateProduct(config, actor, id, expectedRevision, input) {
  return enqueue(async () => {
    const catalog = await readCatalog(config.catalogStore);
    const index = catalog.products.findIndex((product) => product.id === id);
    if (index < 0) {
      const error = new Error("Товар не найден");
      error.code = "NOT_FOUND";
      throw error;
    }
    const current = catalog.products[index];
    if (current.revision !== expectedRevision) {
      const error = new Error("Товар уже изменён в другой сессии. Обновите список");
      error.code = "STALE_REVISION";
      throw error;
    }
    if (input.id !== id) throw new Error("ID товара нельзя изменить");
    if (catalog.products.some((product, productIndex) => productIndex !== index && product.sku === input.sku)) {
      const error = new Error("Товар с таким SKU уже существует");
      error.code = "CONFLICT";
      throw error;
    }
    const product = { ...input, revision: current.revision + 1, updatedAt: new Date().toISOString() };
    const products = [...catalog.products];
    products[index] = product;
    const next = { ...catalog, revision: catalog.revision + 1, products };
    await writeCatalog(config.catalogStore, next);
    const changed = Object.keys(input).filter((key) => input[key] !== current[key]);
    await audit(config, { actor, action: "product.update", productId: product.id, revision: product.revision, changed });
    return { product, catalogRevision: next.revision };
  });
}
