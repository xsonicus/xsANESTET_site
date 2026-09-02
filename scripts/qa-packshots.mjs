import { access, readFile, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import process from "node:process";

const root = process.cwd();
const productSource = await readFile(join(root, "app/products.ts"), "utf8");
const catalogSeed = JSON.parse(await readFile(join(root, "lib/admin/catalog.seed.json"), "utf8"));
const rows = [...productSource.matchAll(/\{ id: (\d+).*?image: "([^"]+)"/g)].map((match) => ({
  id: Number(match[1]),
  image: match[2],
}));

if (rows.length !== 23) throw new Error(`Expected 23 product images, found ${rows.length}`);
const seedById = new Map(catalogSeed.products.map((product) => [product.id, product]));

const run = (args) => {
  const result = spawnSync("magick", args, { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || args.join(" "));
  return `${result.stdout || ""}${result.stderr || ""}`.trim();
};

const alphaLevels = (path) => run([path, "-alpha", "extract", "-format", "%c", "histogram:info:-"])
  .split("\n").filter(Boolean).length;

const failures = [];
for (const product of rows) {
  if (seedById.get(product.id)?.image !== product.image) {
    failures.push(`${product.id}: admin seed image ${seedById.get(product.id)?.image ?? "missing"} differs from approved ${product.image}`);
  }
  const master = join(root, "public", product.image.replace(/^\//, ""));
  const vectorVersion = product.image.match(/-alpha-restored-(v[34])\.webp$/)?.[1];
  const cardName = vectorVersion
    ? `${product.id}-card-${vectorVersion}.webp`
    : `${product.id}-card.webp`;
  const card = join(root, "public/assets/img/restored/packshots-v13", cardName);
  const detail = join(root, "public/assets/img/restored/packshots-v13/details-v5", `${product.id}.webp`);
  await access(master);
  await access(card);
  await access(detail);

  const masterInfo = run(["identify", "-format", "%wx%h|%[channels]|%[opaque]", master]);
  const cardInfo = run(["identify", "-format", "%wx%h|%[channels]|%[opaque]", card]);
  const detailInfo = run(["identify", "-format", "%wx%h|%[channels]|%[opaque]", detail]);
  const levels = alphaLevels(master);
  if (masterInfo !== "1000x1000|srgba 4.0|False") failures.push(`${product.id}: master ${masterInfo}`);
  if (cardInfo !== "600x600|srgba 4.0|False") failures.push(`${product.id}: card ${cardInfo}`);
  if (detailInfo !== "2000x2000|srgba 4.0|False") failures.push(`${product.id}: detail ${detailInfo}`);
  if ((await stat(detail)).size > 320 * 1024) failures.push(`${product.id}: detail asset exceeds 320 KiB`);
  if (levels < 48) failures.push(`${product.id}: only ${levels} alpha levels`);

  if (vectorVersion) {
    const previous = join(root, "public/assets/img/restored/packshots-v13", `${product.id}-alpha-restored-v2.png`);
    const rebuilt = join(root, "public/assets/img/restored/packshots-v13", `${product.id}-alpha-restored-${vectorVersion}.png`);
    await access(previous);
    await access(rebuilt);
    const changedRgbPixels = Number.parseFloat(run(["compare", "-metric", "AE", "-alpha", "off", previous, rebuilt, "null:"]));
    if (changedRgbPixels !== 0) failures.push(`${product.id}: ${changedRgbPixels} RGB pixels changed; only alpha may change`);
  }
}

if (failures.length) throw new Error(`PACKSHOT QA FAIL:\n${failures.join("\n")}`);
console.log("PACKSHOT QA PASS: 23/23 approved catalog/admin sources, transparent masters, cards and 2x detail assets; antialiased alpha >= 48 levels; vector-mask RGB unchanged; detail assets <= 320 KiB.");
