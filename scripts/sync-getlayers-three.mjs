import { cp, mkdir } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";

const root = process.cwd();
const threeRoot = join(root, "node_modules", "three");
const vendorRoot = join(root, "public", "assets", "getlayers", "vendor");
const getLayersRoot = join(root, "public", "assets", "getlayers");

await mkdir(join(vendorRoot, "jsm"), { recursive: true });
await cp(join(threeRoot, "build", "three.module.js"), join(vendorRoot, "three.module.js"));
await cp(join(threeRoot, "examples", "jsm", "postprocessing"), join(vendorRoot, "jsm", "postprocessing"), { recursive: true });
await cp(join(threeRoot, "examples", "jsm", "shaders"), join(vendorRoot, "jsm", "shaders"), { recursive: true });

// Static hosts commonly redirect `scene.html` to a clean URL. Give each scene
// a real directory index so an iframe can never fall through to the site's SPA
// fallback and recursively render the storefront inside itself.
for (const scene of ["opaline", "shoal"]) {
  const sceneDirectory = join(getLayersRoot, scene);
  await mkdir(sceneDirectory, { recursive: true });
  await cp(join(getLayersRoot, `${scene}.html`), join(sceneDirectory, "index.html"));
}
