import { mkdir, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import process from "node:process";

const root = process.cwd();
const source = await readFile(join(root, "app/products.ts"), "utf8");
const outputDir = join(root, "public/assets/img/optimized/cards");
await mkdir(outputDir, { recursive: true });

const visibleHeightByVolume = new Map([
  [5, 560],
  [30, 720],
  [50, 760],
  [75, 790],
  [150, 840],
  [200, 870],
  [300, 900],
  [400, 900],
]);

const rows = source.split("\n").flatMap((line) => {
  const match = line.match(/\{ id: (\d+).*?compactTitle: ".*? · (\d+) мл".*?image: "([^"]+)"/);
  if (!match) return [];
  return [{ id: Number(match[1]), volume: Number(match[2]), image: match[3] }];
});

if (rows.length === 0) throw new Error("Не удалось прочитать каталог из app/products.ts");

for (const product of rows) {
  const targetHeight = visibleHeightByVolume.get(product.volume);
  if (!targetHeight) throw new Error(`Нет нормализованной высоты для ${product.volume} мл (ID ${product.id})`);

  const input = join(root, "public", product.image.replace(/^\//, ""));
  const output = join(outputDir, `${product.id}.webp`);
  const result = spawnSync("magick", [
    input,
    "-trim",
    "+repage",
    "-resize",
    `x${targetHeight}`,
    "-gravity",
    "center",
    "-background",
    "none",
    "-extent",
    "1000x1000",
    "-quality",
    "92",
    output,
  ], { encoding: "utf8" });

  if (result.status !== 0) {
    throw new Error(`ImageMagick не обработал ID ${product.id}: ${result.stderr || result.stdout}`);
  }
}

console.log(`PACKSHOT NORMALIZATION PASS: ${rows.length} товаров, alpha-canvas 1000×1000.`);
