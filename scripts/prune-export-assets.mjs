import { lstat, readdir, rm } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import process from "node:process";

const root = resolve(process.cwd());
const out = resolve(root, "out");
if (!out.startsWith(`${root}/`) || out === root) throw new Error(`Unsafe export root: ${out}`);

const bytes = async (path) => {
  const stat = await lstat(path);
  if (!stat.isDirectory()) return stat.size;
  const entries = await readdir(path);
  return (await Promise.all(entries.map((entry) => bytes(join(path, entry))))).reduce((sum, size) => sum + size, 0);
};

// Public retains provenance/source assets, while the deployable export excludes
// directories that the Next storefront never references and raw PNG masters
// that exist only for deterministic cutout processing.
const legacyDirectories = [
  "assets/img/products",
  "assets/img/home",
  "assets/img/advantage",
  "assets/img/promo",
  "assets/img/selection",
];
const removed = [];

for (const item of legacyDirectories) {
  const target = resolve(out, item);
  if (!target.startsWith(`${out}/`)) throw new Error(`Unsafe prune target: ${target}`);
  try {
    const size = await bytes(target);
    await rm(target, { recursive: true });
    removed.push({ path: relative(out, target), bytes: size });
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

const packshotDir = join(out, "assets/img/restored/packshots-v13");
try {
  for (const name of await readdir(packshotDir)) {
    if (!/-alpha-restored-v\d+\.png$/.test(name)) continue;
    const target = join(packshotDir, name);
    const size = await bytes(target);
    await rm(target);
    removed.push({ path: relative(out, target), bytes: size });
  }
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

const fontZip = join(out, "assets/fonts/unbounded 2.zip");
try {
  const size = await bytes(fontZip);
  await rm(fontZip);
  removed.push({ path: relative(out, fontZip), bytes: size });
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

const saved = removed.reduce((sum, entry) => sum + entry.bytes, 0);
console.log(`EXPORT PRUNE PASS: ${removed.length} unused source artifacts, ${(saved / 1024 / 1024).toFixed(2)} MiB removed from out/.`);
