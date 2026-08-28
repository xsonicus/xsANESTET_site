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
Release 2026.08.28-v11 adds the original Open Sans and Unbounded typography, novelty-only Queen Key hero rotation with balanced packshot scale, source-derived About content and official social/support links, complete delivery checkout, and a server-side order API that validates catalog prices and stores order records on the VPS.