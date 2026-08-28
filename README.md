# ANESTET Design Lab

Static Next.js storefront with coordinated light and dark art directions for the current ANESTET / Queen Key catalog. The repository also preserves the safe source snapshot of the original MODX / miniShop2 storefront.

## Local run

```bash
npm install
npm run dev
```

Production export:

```bash
npm run build
```

The deployable static bundle is written to `out/`.

## Visual directions

- Clinical Luxe — precise, bright, laboratory-inspired presentation.
- Chromatic Serum — the dark navy antipode of the light direction, with cold-blue accents and a milk-white product halo.

The segmented control at the top changes composition, typography, palette and motion while preserving the same catalog and functionality. Clinical Luxe and Chromatic Serum follow the browser light/dark preference by default; a visitor can switch between them manually or return to automatic mode.

The compact site-version control links three related states:

- `Было` — the original public MODX storefront;
- `Одностраничный` — the complete catalogue and care guide in one continuous page (`?site=onepage`);
- `Полный сайт` — the commerce-first view with the catalogue and thematic guide separated (`?site=full`).

The full view opens directly on products. Its hero rotates only the current blue Queen Key novelties every 4.6 seconds, supports manual navigation and adds directly to the persistent cart. The cart supports quantity changes, delivery and address selection, creates a server-side order number and keeps WhatsApp as an explicit operator fallback.

The first screen uses the original ANESTET wordmark in the header and as a low-contrast diagonal motion rail. A second, slower oversized ANESTET rail crosses it at the opposite angle with a restrained blur, creating one layered brand signature behind the readable content. The footer combines the original high-resolution ANESTET and Queen Key brand assets. All 23 catalog packshots use real transparency instead of white rectangular backplates.

## Live preview

`https://anestet.139-180-214-133.sslip.io`

The static export is deployed behind nginx with HTTPS. Releases are immutable directories under `/var/www/anestet/releases/`; `/var/www/anestet/current` is switched atomically. The pre-GitHub one-page release remains preserved as `20260828-v9`; the current GitHub-tracked release is `20260828-v11`.

## Versioning and public change history

Repository: `https://github.com/xsonicus/xsANESTET_site`

- Human-readable releases: `docs/RELEASE_HISTORY.md` and GitHub Releases.
- Detailed fix ledger: `CHANGELOG.codex.md`.
- Every release must pass the GitHub Actions build, responsive layout matrix and dependency audit.
- The site footer displays the current modification and links to Releases.

## Source provenance

- Product names, prices, images and public business information: current `qkcosmetic.ru` catalog snapshot captured on 2026-08-28.
- Original server export: `original_site/`; infrastructure boundary: `docs/ORIGINAL_INFRASTRUCTURE.md`.
- Commerce integration plan for 1C, CDEK, warehouse stock, promotions and administration: `docs/COMMERCE_BACKEND_ROADMAP.md`.
- Live adapter status and secret-handling boundary: `docs/INTEGRATION_STATUS.md`.
- No passwords, private keys, database credentials, MODX session data, cache or server logs are stored in this project.

## Verification

- Static Next.js export.
- Desktop and mobile Playwright screenshots in `output/playwright/`.
- Automated `npm run qa:layout` gate: 8 target screens × 2 themes × 3 site presentations; text clipping, safe-edge violations, heading collisions, product/button overlap and horizontal overflow are release blockers. The matrix includes the tall 1431 × 1728 viewport.
- `prefers-reduced-motion` fallback.
- Keyboard-visible focus, semantic theme selector, semantic filters and cart controls.
- Transparent WebP hero/featured packshots preserve alpha; the main hero image is 38 KB and is loaded as the high-priority LCP resource.
- The evidence photo uses the exact Queen Key Recovery Milk hero product rather than a generic dispenser.
- The last pre-commerce mobile Lighthouse baseline: Performance 95, Accessibility 100, Best Practices 100, SEO 100. Each release refreshes this evidence.
- `npm audit --omit=dev`: 0 vulnerabilities.
