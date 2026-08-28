# Codex Changelog

Project: xsANESTET_site

This file is maintained by Project Versioner. It tracks code fixes, verification, risks, and push history for Codex-assisted work.
## 2026-08-28T09:06:44.112Z - Commerce-first catalog and separate care guide
- ID: 2026-08-28T09-06-44-112Z-commerce-first-catalog-and-separate-care-guide
- Version: 1.0.0
- Category: feature
- Branch: main
- Head: (no git head)
- Files: app/storefront.tsx, app/globals.css, scripts/qa-layout.mjs
- Verification: npm run build; npm run qa:layout: 7 widths x 2 themes x 3 presentations
- Risk/Rollback: The previous one-page deployment remains available as VPS release 20260828-v9.
Made the catalogue the default shopping route, moved the detailed three-stage explanation into a separate thematic view, and preserved the complete one-page presentation as a selectable mode.## 2026-08-28T09:06:44.169Z - Persistent cart and Queen Key hero carousel
- ID: 2026-08-28T09-06-44-169Z-persistent-cart-and-queen-key-hero-carousel
- Version: 1.0.0
- Category: feature
- Branch: main
- Head: (no git head)
- Files: app/storefront.tsx, app/globals.css, app/icons.tsx
- Verification: Playwright desktop and mobile cart flow; Hero automatic and manual carousel check; npm audit --omit=dev
- Risk/Rollback: Payment, delivery and warehouse stock are explicitly not fabricated; they require real backend integrations.
Added a persistent quantity-aware cart with WhatsApp order composition and a 4.6-second hero carousel limited to the two current blue Queen Key products, including direct add-to-cart.## 2026-08-28T09:06:44.219Z - Safe-edge visual QA rule
- ID: 2026-08-28T09-06-44-219Z-safe-edge-visual-qa-rule
- Version: 1.0.0
- Category: fix
- Branch: main
- Head: (no git head)
- Files: app/globals.css, scripts/qa-layout.mjs
- Verification: npm run qa:layout
- Risk/Rollback: Low risk; visual-only spacing change.
Inset every care-step label and introduced a release-blocking automated rule requiring visible card content to stay inside a 12px safe area on all tested responsive states.## 2026-08-28T09:06:44.268Z - GitHub release infrastructure and original MODX snapshot
- ID: 2026-08-28T09-06-44-268Z-github-release-infrastructure-and-original-modx-snapshot
- Version: 1.0.0
- Category: infra
- Branch: main
- Head: (no git head)
- Files: .github/workflows/quality.yml, .gitignore, README.md, docs/RELEASE_HISTORY.md, docs/ORIGINAL_INFRASTRUCTURE.md, original_site, deploy/anestet.139-180-214-133.sslip.io.conf
- Verification: Original snapshot inventory reviewed; GitHub credentials verified; Secrets excluded by .gitignore and documentation
- Risk/Rollback: Git history begins truthfully at v10; pre-Git versions are documented as immutable VPS artifacts, not reconstructed commits.
Initialized project versioning, added public release documentation, CI quality checks, modification label in the footer, deployment configuration, and documented the safe original MODX/miniShop2 snapshot without secrets.## 2026-08-28T09:09:13.237Z - Connected original, one-page and full storefront views
- ID: 2026-08-28T09-09-13-237Z-connected-original-one-page-and-full-storefront-views
- Version: 1.0.0
- Category: feature
- Branch: main
- Head: (no git head)
- Files: app/storefront.tsx, app/globals.css, scripts/qa-layout.mjs, docs/COMMERCE_BACKEND_ROADMAP.md, docs/RELEASE_HISTORY.md, README.md
- Verification: npm run build; npm run qa:layout: 7 widths x 2 themes x 3 presentations
- Risk/Rollback: Exact stock is not exposed until a reliable source is connected; the legacy miniShop2 snapshot tracks positive remains for only 3 of 23 products.
Added a compact sticky selector for the original public storefront, the preserved one-page presentation and the commerce-first full presentation. Documented a single-source commerce backend contract for 1C, CDEK, stock, orders, promotions and administration.## 2026-08-28T09:21:25.248Z - Restore perfect accessibility score
- ID: 2026-08-28T09-21-25-248Z-restore-perfect-accessibility-score
- Version: 1.0.1
- Category: fix
- Branch: main
- Head: ef2b705
- Files: app/storefront.tsx, README.md, docs/RELEASE_HISTORY.md, docs/releases/2026.08.28-v10.1.md
- Verification: Production build; Responsive layout QA; Lighthouse accessibility rerun
- Risk/Rollback: No visual or commerce behavior change.
Removed an ARIA control reference to an unmounted dynamic panel and aligned the cart accessible name with its visible two-digit count.## 2026-08-28T09:33:03.086Z - Center serum halo on tall viewports
- ID: 2026-08-28T09-33-03-086Z-center-serum-halo-on-tall-viewports
- Version: 1.0.2
- Category: fix
- Branch: main
- Head: a1b0259
- Files: app/globals.css, app/storefront.tsx, scripts/qa-layout.mjs, README.md, docs/RELEASE_HISTORY.md, docs/releases/2026.08.28-v10.2.md
- Verification: Visual screenshot at 1431x1728; Layout QA: 8 screens x 2 themes x 3 presentations
- Risk/Rollback: Scoped responsive CSS only; mobile layout remains unchanged.
Anchored the Chromatic Serum halo to the exact center of the product column, increased the gap between the vertical side note and headline on portrait desktop/tablet ratios, and added 1431x1728 to the release QA matrix.## 2026-08-28T09:46:06.887Z - Preserve hero label contrast over animated halo
- ID: 2026-08-28T09-46-06-887Z-preserve-hero-label-contrast-over-animated-halo
- Version: 1.0.3
- Category: fix
- Branch: main
- Head: 8d24929
- Files: app/globals.css, app/storefront.tsx, README.md, docs/RELEASE_HISTORY.md, docs/releases/2026.08.28-v10.2.1.md
- Verification: npm run build; npm run qa:layout; Lighthouse accessibility audit; Live 1431x1728 Playwright inspection
- Risk/Rollback: Low; scoped typography color/weight change. Roll back by switching the VPS symlink to 20260828-v10.2.
- Issue/Request: Lighthouse found the mobile category label could sit over the pale animated halo with insufficient contrast.
Raised the hero product category label to the theme ink color with stronger weight so the light mobile halo cannot reduce readability, while retaining the tall-viewport centering and spacing fix.## 2026-08-28T10:26:12.596Z - Commerce-ready storefront with source-faithful brand content
- ID: 2026-08-28T10-26-12-596Z-commerce-ready-storefront-with-source-faithful-brand-content
- Version: 1.1.0
- Category: feature
- Branch: main
- Head: 8d24929
- Files: app/storefront.tsx, app/globals.css, app/products.ts, server/order-api.mjs, deploy/anestet-order-api.service, deploy/anestet.139-180-214-133.sslip.io.conf, deploy/anestet-order-api.env.example, docs/COMMERCE_BACKEND_ROADMAP.md, docs/INTEGRATION_STATUS.md, docs/RELEASE_HISTORY.md, docs/releases/2026.08.28-v11.md, README.md, .codex-memory, .codex-archive
- Verification: npm run build; npm run qa:layout; node --check server/order-api.mjs; local Order API accepted a valid order and recomputed totals; Playwright desktop About/social review; Playwright 390x844 cart and checkout review; npm audit --omit=dev (0 vulnerabilities)
- Risk/Rollback: medium
- Issue/Request: The redesigned storefront was visually complete but lacked a durable order capture path, full source-brand content, original typography, official social entry points, and a secure integration boundary for external commerce systems.
Release 2026.08.28-v11 adds the original Open Sans and Unbounded typography, novelty-only Queen Key hero rotation with balanced packshot scale, source-derived About content and official social/support links, complete delivery checkout, and a server-side order API that validates catalog prices and stores order records on the VPS.## 2026-08-28T10:36:35.070Z - Preload original brand fonts to eliminate hero layout shift
- ID: 2026-08-28T10-36-35-070Z-preload-original-brand-fonts-to-eliminate-hero-layout-shift
- Version: 1.1.1
- Category: performance
- Branch: main
- Head: fe61571
- Files: app/layout.tsx, app/storefront.tsx, README.md, docs/RELEASE_HISTORY.md, docs/releases/2026.08.28-v11.0.1.md
- Verification: npm run build; npm run qa:layout; git diff --check
- Risk/Rollback: low
- Issue/Request: Live Lighthouse attributed 0.186 CLS to late Open Sans and Unbounded swaps moving the mobile hero product scene.
Preloaded Open Sans and Unbounded font files from the document head so the v11 hero and product scene keep stable geometry during first paint.

## 2026-08-28T12:34:37.388Z - Version 11.1.0

- Previous version: 1.1.1
- Bump: explicit
## 2026-08-28T12:34:37.393Z - Autonomous storefront content and complete novelty experience
- ID: 2026-08-28T12-34-37-393Z-autonomous-storefront-content-and-complete-novelty-experience
- Version: 11.1.0
- Category: feature
- Branch: main
- Head: fb8a8a2
- Files: app/storefront.tsx, app/globals.css, app/products.ts, public/assets/img/optimized/cards, public/assets/img/partners/alexander-portrait-hq-v2.webp, public/assets/icons/social, public/assets/img/certificates, scripts/normalize-product-packshots.mjs
- Verification: npm run build; npm run qa:layout: 10 screens x 2 themes x 3 presentations; Playwright cart and internal company tabs; No qkcosmetic.ru link in app UI
- Risk/Rollback: medium
- Issue/Request: The new storefront still depended on legacy-site links, showed an incomplete novelty set, and had inconsistent packshot backgrounds/scales and incomplete top-level support access.
Moved partner, delivery, certificate and contact content into accessible internal tabs; removed legacy-shop navigation from the new interface; added top VK, Telegram and working support controls; rotated all eight novelties in the hero; normalized all 23 catalog packshots to true-alpha WebP; upgraded the founder portrait and social platform visuals.## 2026-08-28T12:34:37.459Z - Release-blocking layout, accessibility and LCP hardening
- ID: 2026-08-28T12-34-37-459Z-release-blocking-layout-accessibility-and-lcp-hardening
- Version: 11.1.0
- Category: fix
- Branch: main
- Head: fb8a8a2
- Files: app/storefront.tsx, app/globals.css, scripts/qa-layout.mjs, README.md, docs/RELEASE_HISTORY.md, docs/releases/2026.08.28-v11.1.0.md, package.json, package-lock.json
- Verification: npm run build; npm run qa:layout; Lighthouse Accessibility 100, Best Practices 100, SEO 100; npm audit --omit=dev: 0 vulnerabilities; git diff --check
- Risk/Rollback: low
- Issue/Request: Responsive collisions and subtle accessibility defects could pass screenshot-only review; release metadata was inconsistent with the prepared build.
Extended geometry QA to ten widths and all theme/view combinations; fixed product-label and cart safe zones, active-tab contrast, support accessible naming, branded stencil loading behavior, and animation visibility/reduced-motion controls.