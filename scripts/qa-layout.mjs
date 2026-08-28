import { createServer } from "node:http";
import { access, readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import process from "node:process";
import { chromium } from "playwright-core";

const root = join(process.cwd(), "out");
const chromeCandidates = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const mime = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

async function findChrome() {
  for (const path of chromeCandidates) {
    try {
      await access(path);
      return path;
    } catch {}
  }
  throw new Error("Chrome/Chromium не найден. Укажите CHROME_PATH.");
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const relative = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
    const safePath = normalize(relative).replace(/^(\.\.(\/|\\|$))+/, "");
    let path = join(root, safePath);
    if ((await stat(path)).isDirectory()) path = join(path, "index.html");
    response.writeHead(200, { "content-type": mime[extname(path)] ?? "application/octet-stream" });
    response.end(await readFile(path));
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ executablePath: await findChrome(), headless: true });
const page = await browser.newPage();
const viewports = [
  { width: 360, height: 844 },
  { width: 390, height: 844 },
  { width: 760, height: 1000 },
  { width: 1024, height: 1000 },
  { width: 1431, height: 1728 },
  { width: 1440, height: 1000 },
  { width: 1687, height: 1000 },
  { width: 2048, height: 1000 },
];
const themes = ["clinical", "serum"];
const views = ["full-catalog", "full-guide", "onepage"];
const failures = [];

try {
  for (const viewport of viewports) {
    const { width, height } = viewport;
    await page.setViewportSize(viewport);
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await page.goto(`${baseUrl}/?qa=${width}`, { waitUntil: "networkidle" });
    await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important}[data-reveal]{opacity:1!important;transform:none!important}" });

    for (let themeIndex = 0; themeIndex < themes.length; themeIndex += 1) {
      await page.locator(".theme-button").nth(themeIndex).click();
      await page.waitForTimeout(30);
      const theme = themes[themeIndex];
      for (const view of views) {
        if (view === "onepage") {
          await page.locator(".site-mode-switcher button").nth(0).click();
        } else {
          await page.locator(".site-mode-switcher button").nth(1).click();
          await page.locator(".shopping-tabs button").nth(view === "full-catalog" ? 0 : 1).click();
        }
        await page.waitForTimeout(30);
        const result = await page.evaluate(() => {
        const visible = (element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
        };
        const intersects = (first, second) => {
          const a = first.getBoundingClientRect();
          const b = second.getBoundingClientRect();
          return Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
            Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
        };
        const paintsOutside = (element) => {
          const boundary = element.getBoundingClientRect();
          const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
          let node = walker.nextNode();
          while (node) {
            if (node.textContent?.trim()) {
              const range = document.createRange();
              range.selectNodeContents(node);
              for (const rect of range.getClientRects()) {
                if (rect.left < boundary.left - 1 || rect.right > boundary.right + 1) return true;
              }
            }
            node = walker.nextNode();
          }
          return false;
        };
        const textOverflow = [...document.querySelectorAll("h1,h2,h3,.theme-button strong,.theme-button small,.filters button,.product-info h3,.guide-stage header p")]
          .filter(visible)
          .filter(paintsOutside)
          .map((element) => `${element.tagName.toLowerCase()}.${element.className || "-"}: ${element.textContent?.trim()}`);
        const collisions = [];
        const title = document.querySelector(".hero h1");
        const halo = document.querySelector(".product-halo");
        if (title && halo && visible(title) && visible(halo) && intersects(title, halo)) collisions.push("hero title ↔ product halo");
        document.querySelectorAll(".guide-stage").forEach((stage, index) => {
          const header = stage.querySelector("header");
          const copy = stage.querySelector(".guide-stage-copy");
          if (header && copy && visible(header) && visible(copy) && intersects(header, copy)) collisions.push(`guide stage ${index + 1}: header ↔ copy`);
        });
        document.querySelectorAll(".product-card").forEach((card, index) => {
          const image = card.querySelector(".product-media img");
          const button = card.querySelector(".quick-add");
          if (image && button && visible(image) && visible(button) && intersects(image, button)) collisions.push(`product ${index + 1}: image ↔ cart button`);
        });
        document.querySelectorAll(".care-step").forEach((card, index) => {
          if (!visible(card)) return;
          const boundary = card.getBoundingClientRect();
          card.querySelectorAll(".step-number,h3,p,small").forEach((element) => {
            if (!visible(element)) return;
            const rect = element.getBoundingClientRect();
            if (rect.left < boundary.left + 12 || rect.right > boundary.right - 12) {
              collisions.push(`care step ${index + 1}: content touches card edge`);
            }
          });
        });
        return {
          horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
          textOverflow,
          collisions,
        };
        });

        if (result.horizontalOverflow || result.textOverflow.length || result.collisions.length) {
          failures.push({ width, theme, view, ...result });
        }
      }
    }
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

if (failures.length) {
  console.error("LAYOUT QA FAILED");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log(`LAYOUT QA PASS: ${viewports.length} экранов × ${themes.length} темы × ${views.length} представления, пересечений и касаний краёв нет.`);
