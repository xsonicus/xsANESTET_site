# ANESTET Design Lab

Static Next.js storefront with coordinated dark Future Beauty and light Clinical Luxury themes for the current ANESTET / Queen Key catalog. The repository also preserves the safe source snapshot of the original MODX / miniShop2 storefront.

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

- Future Beauty — the default dark-blue optical presentation with a locally materialized GetLayers Opaline scene.
- Clinical Luxury — the bright, precise alternative with a locally materialized GetLayers Shoal field.

The sticky segmented control at the top switches between the two approved themes while preserving the same catalog, cart and checkout. The choice is saved in `qk-design-lab-v1` and mirrored in the `?design=` URL parameter; Future Beauty is the default.

The compact site-version control links the new site's related states:

- `Старый сайт` — opens the original `qkcosmetic.ru` storefront in a new tab for deliberate visual comparison only;
- `Одностраничный` — the complete catalogue and care guide in one continuous page (`?site=onepage`);
- `Полный сайт` — the commerce-first view with the catalogue and thematic guide separated (`?site=full`).

The full view opens directly on products. Its hero rotates all eight current novelties every 7 seconds using one position-stable prism transition, supports pause/manual navigation and adds directly to the persistent cart. The product-led heading and source-derived description change with the packshot through one consistent blur transition that preserves the final typeface from the first frame. The cart supports quantity changes, five delivery options, recipient details and address selection, creates a server-side order number and keeps WhatsApp as an explicit operator fallback.

The first screen uses the original ANESTET wordmark and real product imagery. GetLayers scenes are decorative desktop atmosphere only; mobile and reduced-motion users receive a static fallback. The footer combines the original high-resolution ANESTET and Queen Key brand assets. All 23 catalog packshots use real transparency instead of white rectangular backplates.

## Live preview

<https://anestet.139-180-214-133.sslip.io/>

The static export is deployed behind nginx with HTTPS. Releases are immutable directories under `/var/www/anestet/releases/`; `/var/www/anestet/current` is switched atomically. The pre-GitHub one-page release remains preserved as `20260828-v9`; the active storefront build is `2026.09.01-v13.1.3-r3`. Order API and Admin API remain on the compatible immutable `2026.09.01-v13.1.2` release because this patch changes only static storefront code.

## Versioning and public change history

Repository: `https://github.com/xsonicus/xsANESTET_site`

- Human-readable releases: `docs/RELEASE_HISTORY.md` and GitHub Releases.
- Detailed fix ledger: `CHANGELOG.codex.md`.
- Every release must pass the GitHub Actions build, responsive layout matrix and dependency audit.
- The site footer displays the current modification and links to Releases.

## Source provenance

- Product names, prices, images and public business information: preserved source catalog snapshot captured on 2026-08-28. The new interface does not send visitors to the legacy shop.
- Original server export: `original_site/`; infrastructure boundary: `docs/ORIGINAL_INFRASTRUCTURE.md`.
- Commerce integration plan for 1C, CDEK, warehouse stock, promotions and administration: `docs/COMMERCE_BACKEND_ROADMAP.md`.
- Live adapter status and secret-handling boundary: `docs/INTEGRATION_STATUS.md`.
- No passwords, private keys, database credentials, MODX session data, cache or server logs are stored in this project.
- The static `/admin/` client uses a separate loopback admin service. Catalog changes share one server-side catalog with the storefront and Order API. Connector credentials for 1С, CDEK and future services are server-only env/secret values; the browser receives masked readiness states only.

## Verification

- Static Next.js export.
- Desktop and mobile Playwright screenshots in `output/playwright/`.
- Local visual acceptance is performed in the Codex in-app Browser against the local preview; external pages are not used as rendering evidence.
- Automated `npm run qa:layout` gate: 11 target screens × 2 themes × 3 site presentations; text clipping, safe-edge violations, heading collisions, product/button overlap and horizontal overflow are release blockers. The matrix includes the tall 1431 × 1728 viewport.
- `prefers-reduced-motion` fallback.
- Keyboard-visible focus, semantic theme selector, semantic filters and cart controls.
- All 23 transparent lossless WebP masters decode to the exact verified PNG RGBA; 600×600 card copies reduce catalogue transfer without changing labels or edges.
- The evidence photo uses the exact Queen Key Recovery Milk hero product rather than a generic dispenser.
- Current production Lighthouse release evidence: Accessibility 100, Best Practices 100 and SEO 100. Synthetic Performance remains `REVIEW` because repeated public runs vary with response/render timing; the JSON reports are retained locally and no unstable score is presented as a release PASS.
- `npm audit --omit=dev`: 0 vulnerabilities.
