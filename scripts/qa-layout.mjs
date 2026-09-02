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
const views = ["catalog", "guide"];
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

    for (const theme of themes) {
      const currentTheme = await page.evaluate(() => document.documentElement.dataset.theme);
      if (currentTheme !== theme) await page.locator(".theme-toggle").click();
      await page.waitForTimeout(100);
      const resolvedTheme = await page.evaluate(() => document.documentElement.dataset.theme);
      if (resolvedTheme !== theme) {
        failures.push({ width, height, theme, view: "theme-toggle", resolvedTheme, collisions: ["theme toggle did not resolve requested theme"], horizontalOverflow: 0, overflowElements: [], textOverflow: [] });
        continue;
      }
      for (const view of views) {
        await page.locator(".shopping-tabs button").nth(view === "catalog" ? 0 : 1).click();
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
        const textOverflow = [...document.querySelectorAll("h1,h2,h3,.theme-toggle-option,.filters button,.product-info h3,.guide-stage header p")]
          .filter(visible)
          .filter(paintsOutside)
          .map((element) => `${element.tagName.toLowerCase()}.${element.className || "-"}: ${element.textContent?.trim()}`);
        const collisions = [];
        const themeToggle = document.querySelector(".theme-toggle");
        if (themeToggle && visible(themeToggle)) {
          const toggleRect = themeToggle.getBoundingClientRect();
          if (toggleRect.width < 44 || toggleRect.height < 44) collisions.push("theme toggle touch target is smaller than 44px");
        }
        const header = document.querySelector(".site-header");
        const wordmark = document.querySelector(".wordmark");
        const primaryNav = document.querySelector(".primary-nav");
        const headerActions = document.querySelector(".header-actions");
        collision(collisions, "header wordmark ↔ actions", wordmark, headerActions);
        collision(collisions, "header navigation ↔ actions", primaryNav, headerActions);
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
        const hero = document.querySelector(".hero");
        const quickRoute = document.querySelector(".hero-quick-route");
        await collisionWithImage(collisions, "hero image ↔ product label", heroImage, heroLabel);
        await collisionWithImage(collisions, "hero image ↔ carousel controls", heroImage, heroControls);
        collision(collisions, "hero label ↔ carousel controls", heroLabel, heroControls);
        if (hero && quickRoute && visible(hero) && visible(quickRoute)) {
          const heroRect = hero.getBoundingClientRect();
          const routeRect = quickRoute.getBoundingClientRect();
          if (routeRect.left < heroRect.left - 1 || routeRect.right > heroRect.right + 1 || routeRect.bottom > heroRect.bottom + 1) {
            collisions.push("quick route is not contained by the first hero section");
          }
          if (innerWidth <= 760 && innerHeight >= 680 && routeRect.bottom > innerHeight + 1) {
            collisions.push("mobile quick route is not fully visible in the first viewport");
          }
        }
        if (innerWidth <= 760) {
          if (document.querySelector(".mobile-hero-optic")) collisions.push("obsolete mobile hero optic is still rendered");
          const routeButtons = [...document.querySelectorAll(".hero-quick-route .shopping-tabs button")].filter(visible);
          if (routeButtons.some((button) => button.getBoundingClientRect().height > 72)) collisions.push("mobile quick route is taller than the compact 72px budget");
          const heroProduct = document.querySelector(".hero-product");
          if (heroProduct && visible(heroProduct) && heroProduct.getBoundingClientRect().top >= innerHeight) collisions.push("mobile product does not begin inside the first viewport");

          const firstProductInfo = document.querySelector(".product-card .product-info");
          const firstProductPrice = firstProductInfo?.querySelector(".product-price");
          const firstProductBrand = firstProductInfo?.querySelector(".product-brand-label");
          const firstProductTitle = firstProductInfo?.querySelector("h3");
          const firstAvailability = firstProductInfo?.querySelector(".availability-inline");
          if (firstProductPrice && firstProductBrand && firstProductTitle && visible(firstProductPrice)) {
            const priceRect = firstProductPrice.getBoundingClientRect();
            const brandRect = firstProductBrand.getBoundingClientRect();
            const titleRect = firstProductTitle.getBoundingClientRect();
            const copyMidpoint = (brandRect.top + titleRect.bottom) / 2;
            const priceMidpoint = (priceRect.top + priceRect.bottom) / 2;
            if (Math.abs(copyMidpoint - priceMidpoint) > 8) collisions.push("mobile catalog price is not vertically centred against brand and title");
          }
          if (firstAvailability && visible(firstAvailability) && firstAvailability.getBoundingClientRect().width > 26) collisions.push("mobile availability status is not collapsed to the compact marker");
        }

        const about = document.querySelector(".about-brand");
        const aboutPrinciples = document.querySelector(".about-principles");
        const founderImage = document.querySelector(".about-portrait img");
        if (innerWidth > 760 && about && aboutPrinciples && founderImage && visible(about) && visible(aboutPrinciples) && visible(founderImage)) {
          const aboutRect = about.getBoundingClientRect();
          const principlesRect = aboutPrinciples.getBoundingClientRect();
          const founderRect = founderImage.getBoundingClientRect();
          if (aboutRect.bottom - principlesRect.bottom > 42) collisions.push("founder section retains an excessive empty floor below the principles grid");
          if (Math.abs(aboutRect.bottom - founderRect.bottom) > 28) collisions.push("founder portrait legs do not meet the lower navigation seam");
        }

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

  const interactionPage = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  try {
    await interactionPage.emulateMedia({ colorScheme: "dark", reducedMotion: "no-preference" });
    await interactionPage.goto(`${baseUrl}/?design=cinematic&qa=motion`, { waitUntil: "networkidle" });
    await interactionPage.evaluate(() => document.fonts.ready);
    await interactionPage.waitForFunction(() => Boolean(document.querySelector(".getlayers-opaline")?.dataset.anchorY));

    const initialAnchor = await interactionPage.evaluate(() => {
      const frame = document.querySelector(".getlayers-opaline");
      const packshotFrame = document.querySelector(".hero-packshot-frame");
      if (!(frame instanceof HTMLIFrameElement) || !(packshotFrame instanceof HTMLElement)) return null;
      const frameRect = frame.getBoundingClientRect();
      const packshotRect = packshotFrame.getBoundingClientRect();
      return {
        x: Number(frame.dataset.anchorX),
        y: Number(frame.dataset.anchorY),
        sceneX: Number(frame.contentWindow?.__anestetHeroAnchor?.x),
        sceneY: Number(frame.contentWindow?.__anestetHeroAnchor?.y),
        expectedX: (packshotRect.left + packshotRect.width / 2 - frameRect.left) / frameRect.width,
        expectedY: (packshotRect.top + packshotRect.height * 0.497174 - frameRect.top) / frameRect.height,
      };
    });
    if (!initialAnchor || Math.abs(initialAnchor.x - initialAnchor.expectedX) > 0.00001 || Math.abs(initialAnchor.y - initialAnchor.expectedY) > 0.00001 || Math.abs(initialAnchor.sceneX - initialAnchor.x) > 0.00001 || Math.abs(initialAnchor.sceneY - initialAnchor.y) > 0.00001) {
      failures.push({ width: 1440, height: 1000, theme: "serum", view: "graphic-anchor", collisions: ["opaline graphic is not aligned with the fixed weighted product centre"], horizontalOverflow: 0, overflowElements: [], textOverflow: [] });
    }

    await interactionPage.locator(".hero-product-controls button:not(.previous):not(.hero-carousel-toggle)").click();
    const priceFrames = [];
    for (let sample = 0; sample < 8; sample += 1) {
      await interactionPage.waitForTimeout(90);
      priceFrames.push(await interactionPage.evaluate(() => {
        const departing = document.querySelector(".hero-label-panel.departing");
        const arriving = document.querySelector(".hero-label-panel.arriving");
        const activePrice = document.querySelector(".hero-label-panel:not(.departing) .hero-product-price b");
        const style = activePrice ? getComputedStyle(activePrice) : null;
        return {
          departing: departing ? Number(getComputedStyle(departing).opacity) : 0,
          arriving: arriving ? Number(getComputedStyle(arriving).opacity) : 0,
          fontFamily: style?.fontFamily ?? "",
          fontWeight: style?.fontWeight ?? "",
          numericVariant: style?.fontVariantNumeric ?? "",
        };
      }));
    }
    if (priceFrames.some((sample) => sample.departing > 0.035 && sample.arriving > 0.035)) {
      failures.push({ width: 1440, height: 1000, theme: "serum", view: "price-transition", collisions: ["old and new prices are visibly superimposed during transition"], horizontalOverflow: 0, overflowElements: [], textOverflow: [] });
    }
    const typography = priceFrames.at(-1);
    if (!typography?.fontFamily.includes("Open Sans") || typography.fontWeight !== "700" || !typography.numericVariant.includes("tabular-nums")) {
      failures.push({ width: 1440, height: 1000, theme: "serum", view: "price-typography", collisions: [`price typography is inconsistent (${JSON.stringify(typography)})`], horizontalOverflow: 0, overflowElements: [], textOverflow: [] });
    }

    const changedAnchor = await interactionPage.evaluate(() => {
      const frame = document.querySelector(".getlayers-opaline");
      return frame instanceof HTMLIFrameElement ? {
        x: Number(frame.dataset.anchorX),
        y: Number(frame.dataset.anchorY),
        sceneX: Number(frame.contentWindow?.__anestetHeroAnchor?.x),
        sceneY: Number(frame.contentWindow?.__anestetHeroAnchor?.y),
      } : null;
    });
    if (!initialAnchor || !changedAnchor || Math.abs(initialAnchor.x - changedAnchor.x) > 0.000001 || Math.abs(initialAnchor.y - changedAnchor.y) > 0.000001 || Math.abs(changedAnchor.sceneX - changedAnchor.x) > 0.00001 || Math.abs(changedAnchor.sceneY - changedAnchor.y) > 0.00001) {
      failures.push({ width: 1440, height: 1000, theme: "serum", view: "graphic-anchor", collisions: ["opaline graphic anchor moved when the product changed"], horizontalOverflow: 0, overflowElements: [], textOverflow: [] });
    }

    await interactionPage.locator(".hero-packshot-frame").click();
    await interactionPage.locator(".product-detail-dialog[open]").waitFor();
    const detailResult = await interactionPage.evaluate(() => {
      const dialog = document.querySelector(".product-detail-dialog[open]");
      const cart = document.querySelector(".cart-button span");
      if (!(dialog instanceof HTMLDialogElement)) return null;
      const rect = dialog.getBoundingClientRect();
      const facts = [...dialog.querySelectorAll(".product-detail-facts > span")].map((item) => item.textContent?.trim() ?? "");
      const accordions = dialog.querySelector(".product-detail-accordions");
      const accordionRect = accordions?.getBoundingClientRect();
      const sectionInsets = [...dialog.querySelectorAll(".product-detail-section-name small")].map((item) => {
        const itemRect = item.getBoundingClientRect();
        return accordionRect ? itemRect.left - accordionRect.left : -1;
      });
      return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, cart: cart?.textContent ?? "", facts, sectionInsets, hasScan: Boolean(dialog.querySelector(".product-detail-scan")), scrollable: dialog.scrollHeight >= dialog.clientHeight };
    });
    if (!detailResult || detailResult.left < -1 || detailResult.top < -1 || detailResult.right > 1441 || detailResult.bottom > 1001) {
      failures.push({ width: 1440, height: 1000, theme: "serum", view: "product-detail", collisions: ["product detail dialog is outside the viewport"], horizontalOverflow: 0, overflowElements: [], textOverflow: [] });
    }
    if (detailResult?.facts.length !== 3 || !detailResult.facts.every(Boolean) || detailResult.hasScan || !detailResult.scrollable || detailResult.sectionInsets.length < 3 || detailResult.sectionInsets.some((inset) => inset < 16)) {
      failures.push({ width: 1440, height: 1000, theme: "serum", view: "product-detail", collisions: [`product detail hierarchy, glare removal or safe section inset is incomplete (${JSON.stringify(detailResult)})`], horizontalOverflow: 0, overflowElements: [], textOverflow: [] });
    }
    const cartBefore = detailResult?.cart;
    await interactionPage.locator(".product-detail-footer button").click();
    const detailStayedOpen = await interactionPage.locator(".product-detail-dialog[open]").count();
    const cartAfter = await interactionPage.locator(".cart-button span").textContent();
    if (!detailStayedOpen || cartBefore === cartAfter) {
      failures.push({ width: 1440, height: 1000, theme: "serum", view: "product-detail", collisions: ["detail card and cart action are not independent"], horizontalOverflow: 0, overflowElements: [], textOverflow: [] });
    }
  } finally {
    await interactionPage.close();
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
