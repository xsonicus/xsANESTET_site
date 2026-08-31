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
  { width: 644, height: 684 },
  { width: 674, height: 406 },
  { width: 760, height: 1000 },
  { width: 1024, height: 1000 },
  { width: 1431, height: 1728 },
  { width: 1440, height: 1000 },
  { width: 1687, height: 1000 },
  { width: 1912, height: 1858 },
  { width: 2048, height: 1000 },
];
const themes = ["serum", "clinical"];
const views = ["full-catalog", "full-guide", "onepage"];
const failures = [];

try {
  for (const viewport of viewports) {
    const { width, height } = viewport;
    await page.setViewportSize(viewport);
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await page.goto(`${baseUrl}/?qa=${width}`, { waitUntil: "networkidle" });
    await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important}[data-reveal]{opacity:1!important;transform:none!important}" });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
      const toggle = document.querySelector(".hero-carousel-toggle");
      if (toggle?.getAttribute("aria-pressed") === "false") toggle.click();
    });

    for (let themeIndex = 0; themeIndex < themes.length; themeIndex += 1) {
      await page.locator(".theme-button").nth(themeIndex).click();
      await page.waitForTimeout(100);
      const theme = themes[themeIndex];
      for (const view of views) {
        if (view === "onepage") {
          await page.locator(".site-mode-switcher button").nth(0).click();
        } else {
          await page.locator(".site-mode-switcher button").nth(1).click();
          await page.locator(".shopping-tabs button").nth(view === "full-catalog" ? 0 : 1).click();
        }
        await page.waitForTimeout(100);
        const result = await page.evaluate(async () => {
        const visible = (element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
        };
        const intersects = (first, second) => {
          const a = first.getBoundingClientRect();
          const b = second.getBoundingClientRect();
          return Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
            Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
        };
        const label = (element) => {
          const id = element.id ? `#${element.id}` : "";
          const classes = typeof element.className === "string" && element.className.trim()
            ? `.${element.className.trim().split(/\s+/).join(".")}`
            : "";
          return `${element.tagName.toLowerCase()}${id}${classes}`;
        };
        const collision = (collisions, description, first, second) => {
          if (first && second && visible(first) && visible(second) && intersects(first, second)) {
            collisions.push(`${description} (${label(first)} ↔ ${label(second)})`);
          }
        };
        const opaqueImageRect = async (image) => {
          const fallback = image.getBoundingClientRect();
          if (!(image instanceof HTMLImageElement)) return fallback;
          try {
            const source = image.currentSrc || image.src;
            globalThis.__qaOpaqueImageBounds ??= new Map();
            let bounds = globalThis.__qaOpaqueImageBounds.get(source);
            if (!bounds) {
              const storageKey = `qa-opaque:${new URL(source, location.href).href}`;
              const stored = sessionStorage.getItem(storageKey);
              if (stored) bounds = JSON.parse(stored);
            }
            if (!bounds) {
              const response = await fetch(source);
              if (!response.ok) return fallback;
              const bitmap = await createImageBitmap(await response.blob());
              const naturalWidth = bitmap.width;
              const naturalHeight = bitmap.height;
              const maxSampleSide = 320;
              const sampleScale = Math.min(1, maxSampleSide / Math.max(naturalWidth, naturalHeight));
              const width = Math.max(1, Math.round(naturalWidth * sampleScale));
              const height = Math.max(1, Math.round(naturalHeight * sampleScale));
              const canvas = document.createElement("canvas");
              canvas.width = width;
              canvas.height = height;
              const context = canvas.getContext("2d", { willReadFrequently: true });
              if (!context) return fallback;
              context.drawImage(bitmap, 0, 0, width, height);
              bitmap.close();
              const pixels = context.getImageData(0, 0, width, height).data;
              let minX = width;
              let minY = height;
              let maxX = -1;
              let maxY = -1;
              for (let y = 0; y < height; y += 1) {
                for (let x = 0; x < width; x += 1) {
                  if (pixels[(y * width + x) * 4 + 3] < 48) continue;
                  minX = Math.min(minX, x);
                  minY = Math.min(minY, y);
                  maxX = Math.max(maxX, x);
                  maxY = Math.max(maxY, y);
                }
              }
              bounds = maxX >= minX && maxY >= minY
                ? { left: minX / width, top: minY / height, right: (maxX + 1) / width, bottom: (maxY + 1) / height, naturalWidth, naturalHeight }
                : { left: 0, top: 0, right: 1, bottom: 1, naturalWidth, naturalHeight };
              globalThis.__qaOpaqueImageBounds.set(source, bounds);
              sessionStorage.setItem(storageKey, JSON.stringify(bounds));
            }

            const naturalRatio = bounds.naturalWidth / bounds.naturalHeight;
            const elementRatio = fallback.width / fallback.height;
            const objectFit = getComputedStyle(image).objectFit;
            let renderedWidth = fallback.width;
            let renderedHeight = fallback.height;
            if (objectFit === "contain" || objectFit === "scale-down") {
              if (naturalRatio > elementRatio) renderedHeight = fallback.width / naturalRatio;
              else renderedWidth = fallback.height * naturalRatio;
            } else if (objectFit === "cover") {
              if (naturalRatio > elementRatio) renderedWidth = fallback.height * naturalRatio;
              else renderedHeight = fallback.width / naturalRatio;
            }
            const left = fallback.left + (fallback.width - renderedWidth) / 2;
            const top = fallback.top + (fallback.height - renderedHeight) / 2;
            return {
              left: left + renderedWidth * bounds.left,
              top: top + renderedHeight * bounds.top,
              right: left + renderedWidth * bounds.right,
              bottom: top + renderedHeight * bounds.bottom,
              width: renderedWidth * (bounds.right - bounds.left),
              height: renderedHeight * (bounds.bottom - bounds.top),
            };
          } catch {
            return fallback;
          }
        };
        const collisionWithImage = async (collisions, description, image, control) => {
          if (!image || !control || !visible(image) || !visible(control)) return;
          const a = await opaqueImageRect(image);
          const b = control.getBoundingClientRect();
          if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
              Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1) {
            collisions.push(`${description} (${label(image)} ↔ ${label(control)})`);
          }
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
        const header = document.querySelector(".site-header");
        const wordmark = document.querySelector(".wordmark");
        const headerActions = document.querySelector(".header-actions");
        collision(collisions, "header wordmark ↔ actions", wordmark, headerActions);
        if (header && visible(header)) {
          const headerRect = header.getBoundingClientRect();
          for (const element of [wordmark, ...document.querySelectorAll(".header-socials a,.header-support-button,.cart-button")]) {
            if (!element || !visible(element)) continue;
            const rect = element.getBoundingClientRect();
            if (rect.left < Math.max(0, headerRect.left) - 1 || rect.right > Math.min(innerWidth, headerRect.right) + 1) {
              collisions.push(`header control outside viewport (${label(element)} [${Math.round(rect.left)}, ${Math.round(rect.right)}] / ${innerWidth})`);
            }
            if (rect.top < headerRect.top - 1 || rect.bottom > headerRect.bottom + 1) {
              collisions.push(`header control outside header vertically (${label(element)})`);
            }
          }
        }
        const title = document.querySelector(".hero h1");
        const halo = document.querySelector(".product-halo");
        collision(collisions, "hero title ↔ product halo", title, halo);

        const heroImage = document.querySelector(".hero-product-image");
        const heroLabel = document.querySelector(".hero-product-label");
        const heroControls = document.querySelector(".hero-product-controls");
        await collisionWithImage(collisions, "hero image ↔ product label", heroImage, heroLabel);
        await collisionWithImage(collisions, "hero image ↔ carousel controls", heroImage, heroControls);
        collision(collisions, "hero label ↔ carousel controls", heroLabel, heroControls);

        document.querySelectorAll(".guide-stage").forEach((stage, index) => {
          const header = stage.querySelector("header");
          const copy = stage.querySelector(".guide-stage-copy");
          if (header && copy && visible(header) && visible(copy) && intersects(header, copy)) collisions.push(`guide stage ${index + 1}: header ↔ copy`);
        });
        for (const [index, card] of [...document.querySelectorAll(".product-card")].entries()) {
          const image = card.querySelector(".product-media img");
          if (!image || !visible(image)) continue;
          for (const [selector, description] of [
            [".product-tag", "category badge"],
            [".product-new", "new badge"],
            [".quick-add", "cart button"],
          ]) {
            const control = card.querySelector(selector);
            await collisionWithImage(collisions, `product ${index + 1}: image ↔ ${description}`, image, control);
          }
        }

        document.querySelectorAll(".support-button").forEach((support) => {
          if (!visible(support) || getComputedStyle(support).position !== "fixed") return;
          document.querySelectorAll(".primary-action,.hero-product-add,.quick-add,.guide-action,.cart-checkout").forEach((cta) => {
            collision(collisions, "fixed support ↔ CTA", support, cta);
          });
          collision(collisions, "fixed support ↔ hero product label", support, heroLabel);
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
        const documentWidth = Math.max(
          document.documentElement.scrollWidth,
          document.body?.scrollWidth ?? 0,
        );
        const horizontalOverflow = Math.max(0, documentWidth - innerWidth);
        const overflowElements = horizontalOverflow
          ? [...document.querySelectorAll("body *")]
            .filter(visible)
            .filter((element) => {
              const rect = element.getBoundingClientRect();
              const position = getComputedStyle(element).position;
              if (position === "fixed") return false;
              return rect.left < -1 || rect.right > innerWidth + 1;
            })
            .slice(0, 20)
            .map((element) => {
              const rect = element.getBoundingClientRect();
              return `${label(element)} [${Math.round(rect.left)}, ${Math.round(rect.right)}]`;
            })
          : [];
        return {
          horizontalOverflow,
          overflowElements,
          textOverflow,
          collisions: [...new Set(collisions)],
          heroDiagnostics: collisions.some((item) => item.startsWith("hero image")) && heroImage && heroLabel
            ? {
                source: heroImage.currentSrc || heroImage.src,
                classes: heroImage.className,
                image: await opaqueImageRect(heroImage),
                label: heroLabel.getBoundingClientRect().toJSON(),
                title: document.querySelector(".hero-label-panel:not(.departing) strong")?.textContent?.trim() ?? "",
              }
            : undefined,
        };
        });

        if (result.horizontalOverflow || result.textOverflow.length || result.collisions.length) {
          failures.push({ width, height, theme, view, ...result });
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
