import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { basename, join } from "node:path";
import process from "node:process";

const root = process.cwd();
const restoredDir = join(root, "public/assets/img/restored/packshots-v13");
const reportDir = join(root, ".codex-web-design/packshot-edge-audit");
const maskDir = join(reportDir, "vector-masks-v4");

const airlessPath = ({ cx, top, bottom, capLeft, capRight, bodyLeft, bodyRight, shoulder }) => `
  M ${capLeft + 5} ${top + 15}
  C ${capLeft} ${top + 21}, ${capLeft} ${top + 30}, ${capLeft} ${top + 42}
  L ${capLeft} ${shoulder - 22}
  C ${capLeft} ${shoulder - 8}, ${bodyLeft} ${shoulder - 2}, ${bodyLeft} ${shoulder + 18}
  L ${bodyLeft} ${bottom - 25}
  C ${bodyLeft} ${bottom - 8}, ${bodyLeft + 24} ${bottom + 1}, ${cx} ${bottom + 1}
  C ${bodyRight - 24} ${bottom + 1}, ${bodyRight} ${bottom - 8}, ${bodyRight} ${bottom - 25}
  L ${bodyRight} ${shoulder + 18}
  C ${bodyRight} ${shoulder - 2}, ${capRight} ${shoulder - 8}, ${capRight} ${shoulder - 22}
  L ${capRight} ${top + 42}
  C ${capRight} ${top + 30}, ${capRight} ${top + 21}, ${capRight - 5} ${top + 15}
  Q ${cx} ${top - 9}, ${capLeft + 5} ${top + 15}
  Z`;

const pumpPaths = ({ bodyLeft, bodyRight, bodyTop, bottom, collarLeft, collarRight, stemLeft, stemRight, nozzleLeft, nozzleRight, nozzleTop }) => [
  `M ${bodyLeft + 14} ${bodyTop} L ${bodyRight - 14} ${bodyTop}
   Q ${bodyRight} ${bodyTop}, ${bodyRight} ${bodyTop + 14}
   L ${bodyRight} ${bottom - 26}
   C ${bodyRight} ${bottom - 9}, ${bodyRight - 22} ${bottom}, 500 ${bottom}
   C ${bodyLeft + 22} ${bottom}, ${bodyLeft} ${bottom - 9}, ${bodyLeft} ${bottom - 26}
   L ${bodyLeft} ${bodyTop + 14} Q ${bodyLeft} ${bodyTop}, ${bodyLeft + 14} ${bodyTop} Z`,
  `M ${collarLeft + 7} ${bodyTop - 78} L ${collarRight - 7} ${bodyTop - 78}
   Q ${collarRight} ${bodyTop - 78}, ${collarRight} ${bodyTop - 70}
   L ${collarRight} ${bodyTop} L ${collarLeft} ${bodyTop}
   L ${collarLeft} ${bodyTop - 70} Q ${collarLeft} ${bodyTop - 78}, ${collarLeft + 7} ${bodyTop - 78} Z`,
  `M ${stemLeft} ${nozzleTop + 24} L ${stemRight} ${nozzleTop + 24} L ${stemRight} ${bodyTop - 78}
   L ${stemLeft} ${bodyTop - 78} Z`,
  `M ${nozzleLeft + 30} ${nozzleTop}
   C ${nozzleLeft + 49} ${nozzleTop - 1}, ${nozzleRight - 32} ${nozzleTop}, ${nozzleRight - 20} ${nozzleTop + 4}
   L ${nozzleRight - 3} ${nozzleTop + 7} Q ${nozzleRight + 3} ${nozzleTop + 8}, ${nozzleRight} ${nozzleTop + 14}
   C ${nozzleRight - 19} ${nozzleTop + 19}, ${stemRight + 18} ${nozzleTop + 20}, ${stemRight} ${nozzleTop + 21}
   L ${stemRight} ${nozzleTop + 30} L ${stemLeft} ${nozzleTop + 30}
   L ${stemLeft} ${nozzleTop + 22} L ${nozzleLeft} ${nozzleTop + 19}
   Q ${nozzleLeft - 4} ${nozzleTop + 15}, ${nozzleLeft + 2} ${nozzleTop + 12}
   L ${nozzleLeft + 30} ${nozzleTop} Z`,
];

const dropperPath = ({ cx, top, bottom, tipHalf, shoulderHalf, bottleLeft, bottleRight }) => `
  M ${cx - tipHalf} ${top}
  Q ${cx - tipHalf - 5} ${top + 4}, ${cx - tipHalf - 6} ${top + 15}
  C ${cx - tipHalf - 9} ${top + 51}, ${cx - shoulderHalf + 23} ${top + 96}, ${cx - shoulderHalf + 8} ${top + 113}
  C ${cx - shoulderHalf + 3} ${top + 119}, ${cx - shoulderHalf} ${top + 126}, ${cx - shoulderHalf} ${top + 137}
  L ${cx - shoulderHalf} ${top + 225}
  C ${cx - shoulderHalf} ${top + 234}, ${bottleLeft + 9} ${top + 243}, ${bottleLeft + 5} ${top + 253}
  C ${bottleLeft + 2} ${top + 263}, ${bottleLeft + 2} ${top + 292}, ${bottleLeft + 2} ${top + 304}
  C ${bottleLeft + 2} ${top + 315}, ${bottleLeft + 18} ${top + 321}, ${bottleLeft + 31} ${top + 324}
  C ${bottleLeft + 13} ${top + 329}, ${bottleLeft + 3} ${top + 337}, ${bottleLeft} ${top + 347}
  L ${bottleLeft} ${bottom - 29}
  C ${bottleLeft} ${bottom - 10}, ${bottleLeft + 22} ${bottom}, ${cx} ${bottom}
  C ${bottleRight - 22} ${bottom}, ${bottleRight} ${bottom - 10}, ${bottleRight} ${bottom - 29}
  L ${bottleRight} ${top + 347}
  C ${bottleRight - 3} ${top + 337}, ${bottleRight - 13} ${top + 329}, ${bottleRight - 31} ${top + 324}
  C ${bottleRight - 18} ${top + 321}, ${bottleRight - 2} ${top + 315}, ${bottleRight - 2} ${top + 304}
  C ${bottleRight - 2} ${top + 292}, ${bottleRight - 2} ${top + 263}, ${bottleRight - 5} ${top + 253}
  C ${bottleRight - 9} ${top + 243}, ${cx + shoulderHalf} ${top + 234}, ${cx + shoulderHalf} ${top + 225}
  L ${cx + shoulderHalf} ${top + 137}
  C ${cx + shoulderHalf} ${top + 126}, ${cx + shoulderHalf - 3} ${top + 119}, ${cx + shoulderHalf - 8} ${top + 113}
  C ${cx + shoulderHalf - 23} ${top + 96}, ${cx + tipHalf + 9} ${top + 51}, ${cx + tipHalf + 6} ${top + 15}
  Q ${cx + tipHalf + 5} ${top + 4}, ${cx + tipHalf} ${top} Z`;

const widePumpPaths = () => [
  `M 278 350 C 286 335, 306 330, 335 329 L 397 329
   C 405 329, 410 321, 410 311 L 410 188
   C 410 180, 417 175, 425 175 L 557 175
   C 566 175, 573 181, 573 190 L 573 311
   C 573 321, 579 329, 588 329 L 664 329
   C 716 329, 741 340, 743 366 L 743 919
   C 743 939, 730 948, 709 949 L 288 949
   C 267 948, 255 938, 255 919 L 255 368
   C 255 359, 263 352, 278 350 Z`,
  `M 421 128 L 566 128 L 566 175 L 421 175 Z`,
  `M 288 54 C 339 50, 456 51, 542 52
   C 559 52, 567 59, 567 72 L 567 126
   L 421 126 L 421 130 L 322 130
   C 300 130, 288 119, 286 99 L 286 68
   C 286 61, 286 57, 288 54 Z`,
];

const tubePath = () => `
  M 322 142 Q 500 138, 678 142
  L 677 188
  C 674 257, 665 359, 654 463
  L 642 574
  C 640 596, 633 614, 628 625
  L 628 765 L 625 774 L 625 837
  C 625 849, 617 856, 604 856
  L 396 856 C 383 856, 375 849, 375 837
  L 375 774 L 372 765 L 372 625
  C 367 614, 360 596, 358 574
  L 346 463 C 335 359, 326 257, 323 188 Z`;

const geometries = {
  17: [airlessPath({ cx: 500, top: 144, bottom: 855, capLeft: 380, capRight: 619, bodyLeft: 376, bodyRight: 623, shoulder: 401 })],
  34: [airlessPath({ cx: 499, top: 144, bottom: 855, capLeft: 381, capRight: 617, bodyLeft: 379, bodyRight: 619, shoulder: 401 })],
  35: [airlessPath({ cx: 499, top: 144, bottom: 855, capLeft: 381, capRight: 617, bodyLeft: 380, bodyRight: 617, shoulder: 401 })],
  37: [airlessPath({ cx: 499, top: 144, bottom: 855, capLeft: 374, capRight: 621, bodyLeft: 371, bodyRight: 627, shoulder: 390 })],
  39: [airlessPath({ cx: 500, top: 144, bottom: 855, capLeft: 382, capRight: 617, bodyLeft: 377, bodyRight: 622, shoulder: 390 })],
  33: pumpPaths({ bodyLeft: 404, bodyRight: 595, bodyTop: 218, bottom: 930, collarLeft: 453, collarRight: 547, stemLeft: 472, stemRight: 528, nozzleLeft: 462, nozzleRight: 606, nozzleTop: 55 }),
  36: pumpPaths({ bodyLeft: 406, bodyRight: 593, bodyTop: 218, bottom: 944, collarLeft: 453, collarRight: 543, stemLeft: 468, stemRight: 527, nozzleLeft: 460, nozzleRight: 586, nozzleTop: 54 }),
  38: [dropperPath({ cx: 500, top: 224, bottom: 775, tipHalf: 9, shoulderHalf: 82, bottleLeft: 402, bottleRight: 597 })],
  40: [dropperPath({ cx: 500, top: 224, bottom: 774, tipHalf: 10, shoulderHalf: 81, bottleLeft: 401, bottleRight: 598 })],
  57: widePumpPaths(),
  58: [tubePath()],
  59: widePumpPaths(),
};

const run = (args) => {
  const result = spawnSync("magick", args, { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`ImageMagick failed: ${result.stderr || result.stdout}`);
  return `${result.stdout || ""}${result.stderr || ""}`.trim();
};

const identify = (path) => run(["identify", "-format", "%wx%h|%[channels]|%[opaque]|%b", path]);
const alphaLevels = (path) => run([path, "-alpha", "extract", "-format", "%c", "histogram:info:-"])
  .split("\n").filter(Boolean).length;

await mkdir(maskDir, { recursive: true });
const results = [];

for (const [idText, paths] of Object.entries(geometries)) {
  const id = Number(idText);
  const previous = join(restoredDir, `${id}-alpha-restored-v2.png`);
  const vectorMask = join(maskDir, `${id}-silhouette.svg`);
  const rasterMask = join(maskDir, `${id}-silhouette-4x-aa.png`);
  const outputPng = join(restoredDir, `${id}-alpha-restored-v4.png`);
  const outputWebp = join(restoredDir, `${id}-alpha-restored-v4.webp`);
  const outputCard = join(restoredDir, `${id}-card-v4.webp`);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">
  <rect width="1000" height="1000" fill="black"/>
  <g fill="white">${paths.map((path) => `<path d="${path.replace(/\s+/g, " ").trim()}"/>`).join("")}</g>
</svg>\n`;
  await writeFile(vectorMask, svg);

  // Render the fitted lines and curves at 4x, then downsample. This is vector
  // antialiasing; the rejected jagged alpha is neither blurred nor reused.
  run(["-background", "black", "-density", "384", vectorMask, "-resize", "1000x1000!", "-colorspace", "Gray", rasterMask]);
  run([previous, "(", rasterMask, "-alpha", "copy", ")", "-compose", "CopyOpacity", "-composite", "-define", "png:color-type=6", outputPng]);
  run([outputPng, "-define", "webp:lossless=true", outputWebp]);
  run([outputPng, "-filter", "Lanczos", "-resize", "600x600", "-define", "webp:lossless=true", outputCard]);

  const levels = alphaLevels(outputWebp);
  const changedRgbPixels = Number.parseFloat(run(["compare", "-metric", "AE", "-alpha", "off", previous, outputPng, "null:"]));
  const silhouetteDelta = Number(run([
    previous, "-alpha", "extract", "-threshold", "50%",
    rasterMask, "-threshold", "50%", "-compose", "difference", "-composite",
    "-format", "%[fx:mean]", "info:",
  ]));
  if (levels < 64) throw new Error(`Vector antialiasing failed for ${id}: ${levels} alpha levels`);
  if (changedRgbPixels !== 0) throw new Error(`RGB drift for ${id}: ${changedRgbPixels} pixels changed`);
  if (silhouetteDelta > 0.012) throw new Error(`Vector silhouette drift for ${id}: ${silhouetteDelta}`);
  if (!identify(outputWebp).startsWith("1000x1000|srgba 4.0|False|")) throw new Error(`Invalid master ${id}: ${identify(outputWebp)}`);
  if (!identify(outputCard).startsWith("600x600|srgba 4.0|False|")) throw new Error(`Invalid card ${id}: ${identify(outputCard)}`);

  results.push({
    id,
    officialRgbSource: basename(previous),
    vectorMask: basename(vectorMask),
    master: basename(outputWebp),
    card: basename(outputCard),
    alphaLevels: levels,
    changedRgbPixels,
    fullCanvasSilhouetteDelta: silhouetteDelta,
    method: "product-specific SVG silhouette; single fitted top/bottom curves; 4x vector rasterization; Lanczos downsample; lossless WebP",
  });
}

await writeFile(join(reportDir, "edge-polish-report.json"), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  correction: "Vector geometry replaces the rejected Gaussian alpha approach.",
  products: results,
}, null, 2)}\n`);

console.log(`PACKSHOT VECTOR EDGE PASS: ${results.length} products rebuilt from ideal lines and curves.`);
