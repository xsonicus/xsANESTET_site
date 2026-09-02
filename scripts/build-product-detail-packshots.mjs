import { access, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { basename, join } from "node:path";
import process from "node:process";

const root = process.cwd();
const restoredDir = join(root, "public/assets/img/restored/packshots-v13");
const outputDir = join(restoredDir, "details-v5");
const maskDir = join(root, ".codex-web-design/packshot-edge-audit/vector-masks-v4");
const productSource = await readFile(join(root, "app/products.ts"), "utf8");
const products = [...productSource.matchAll(/\{ id: (\d+).*?image: "([^"]+)"/g)].map((match) => ({
  id: Number(match[1]),
  image: match[2],
  vector: /-alpha-restored-v4\.webp$/.test(match[2]),
}));

if (products.length !== 23) throw new Error(`Expected 23 product images, found ${products.length}`);

const run = (args) => {
  const result = spawnSync("magick", args, { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`ImageMagick failed: ${result.stderr || result.stdout}`);
  return `${result.stdout || ""}${result.stderr || ""}`.trim();
};

await mkdir(outputDir, { recursive: true });
const results = [];

for (const product of products) {
  const input = join(root, "public", product.image.replace(/^\//, ""));
  const output = join(outputDir, `${product.id}.webp`);
  const args = [input];

  if (product.vector) {
    const mask = join(maskDir, `${product.id}-silhouette.svg`);
    await access(mask);
    // The approved packages are white at their physical boundary. Flattening
    // transparent RGB to white before applying the larger vector alpha avoids
    // exposing the dark RGB fringe left by the old low-resolution cutout.
    args.push(
      "-background", "white", "-alpha", "remove", "-alpha", "off",
      "-filter", "Lanczos", "-resize", "2000x2000!",
      "(", "-background", "black", mask, "-resize", "2000x2000!", "-colorspace", "Gray", "-alpha", "copy", ")",
      "-compose", "CopyOpacity", "-composite",
    );
  } else {
    // The already-approved masks are scaled alpha-aware; no new silhouette or
    // generative pixels are introduced for these products.
    args.push("-filter", "Lanczos", "-resize", "2000x2000!");
  }

  args.push("-define", "webp:method=6", "-define", "webp:alpha-quality=100", "-quality", "92", output);
  run(args);

  const metadata = run(["identify", "-format", "%wx%h|%[channels]|%[opaque]|%b", output]);
  const size = (await stat(output)).size;
  if (!metadata.startsWith("2000x2000|srgba 4.0|False|")) throw new Error(`Invalid detail asset ${product.id}: ${metadata}`);
  if (size > 320 * 1024) throw new Error(`Detail asset ${product.id} exceeds 320 KiB: ${size}`);
  results.push({ id: product.id, source: basename(input), output: basename(output), vectorAlphaAt2x: product.vector, bytes: size });
}

await writeFile(join(outputDir, "report.json"), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  canvas: "2000x2000",
  alphaQuality: 100,
  webpQuality: 92,
  products: results,
}, null, 2)}\n`);

console.log(`DETAIL PACKSHOT PASS: ${results.length}/23 Retina assets, each <= 320 KiB.`);
