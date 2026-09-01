# Codex Changelog

Project: xsANESTET_site

## 2026-08-31T22:20:00.000Z - Version 13.1.0

- Previous version: 13.0.0
- Bump: patch
- Category: fix
- Files: app/storefront.tsx, app/globals.css, app/layout.tsx, app/products.ts, app/admin, lib/admin, public/assets/getlayers/opaline.html, public/assets/img/restored, scripts/qa-layout.mjs, scripts/admin-smoke.mjs, docs
- Verification: `npm run build && npm run qa:layout`; `npm run qa:admin`; `npx tsc --noEmit`; `git diff --check`; production Codex Browser dark/light/admin with zero console warnings/errors; Lighthouse desktop 90/100/100/100, mobile 81/100/100/100
- Risk/Rollback: local candidate only; VPS was not changed. Roll back to the local v13.0.0 source state if required.
- Issue/Request: cumulative visual corrections required the Opaline sphere behind the product without a layer seam, shadow-free authentic packshots, compact founder spacing, correct Queen Key footer hierarchy, mobile enrichment, new-first sorting and a MODX-class administration surface.

Promoted the corrected v2 packshots, fixed production-safe Opaline positioning through a hash-bound embedded mode, completed the protected catalog administration surface, restored the approved footer brand hierarchy, shortened the mobile hero, and documented the browser-extension hydration cause.

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

## 2026-08-28T13:25:24.258Z - Version 11.1.1

- Previous version: 11.1.0
- Bump: explicit
## 2026-08-28T13:26:27.148Z - Extend the hero promise to always and everywhere
- ID: 2026-08-28T13-26-27-148Z-extend-the-hero-promise-to-always-and-everywhere
- Version: 11.1.1
- Category: fix
- Branch: main
- Head: 8e0c486
- Files: app/storefront.tsx, package.json, package-lock.json, README.md, docs/RELEASE_HISTORY.md, docs/releases/2026.08.28-v11.1.1.md
- Verification: npm run build; npm run qa:layout: 10 widths x 2 themes x 3 views; desktop and mobile visual screenshots; git diff --check
- Risk/Rollback: low; rollback to immutable v11.1.0 release
- Issue/Request: User requested adding «и везде» after «всегда» everywhere.
Updated the shared hero copy for Clinical Luxe and Chromatic Serum so every site presentation ends the headline with «всегда и везде»; bumped the storefront patch release to 11.1.1 and revalidated all responsive safe zones.

## 2026-08-28T13:35:23.555Z - Version 11.1.2

- Previous version: 11.1.1
- Bump: explicit
## 2026-08-28T13:36:46.879Z - Restore the three-way site comparison switcher
- ID: 2026-08-28T13-36-46-879Z-restore-the-three-way-site-comparison-switcher
- Version: 11.1.2
- Category: fix
- Branch: main
- Head: eedfd81
- Files: app/storefront.tsx, README.md, docs/RELEASE_HISTORY.md, docs/releases/2026.08.28-v11.1.2.md, .codex-archive, .codex-memory, package.json, package-lock.json
- Verification: qkcosmetic.ru HTTP 200; npm run build; npm run qa:layout: 10 widths x 2 themes x 3 views; Playwright verified exact three labels, target=_blank, onepage/full state and retained company info section; git diff --check
- Risk/Rollback: low; comparison link is isolated to the top switcher; rollback to immutable v11.1.1
- Issue/Request: User clarified that the top control exists to compare old, one-page and full-site variants, not to open the internal information section.
Replaced the top Information shortcut with a verified external Старый сайт link, retained internal one-page and full-site mode controls, and documented the legacy-link boundary so all other storefront journeys remain internal.

## 2026-08-28T13:52:04.516Z - Version 11.1.3

- Previous version: 11.1.2
- Bump: patch
## 2026-08-28T13:53:57.960Z - Stabilize the mobile header action row
- ID: 2026-08-28T13-53-57-960Z-stabilize-the-mobile-header-action-row
- Version: 11.1.3
- Category: fix
- Branch: main
- Head: ab31ef1
- Files: app/globals.css, scripts/qa-layout.mjs, app/storefront.tsx, package.json, package-lock.json, README.md, docs/RELEASE_HISTORY.md, docs/releases/2026.08.28-v11.1.3.md
- Verification: npm run build; npm run qa:layout: 11 widths x 2 themes x 3 views; Playwright visual review at 644px Clinical Luxe, 390px Chromatic Serum, and 360px Clinical Luxe; Playwright header interaction check: no overflow, all controls within header, 44px touch targets, keyboard focus, cart opens, no console/network errors; git diff --check
- Risk/Rollback: low; CSS-only responsive header change with immutable rollback to v11.1.2
- Issue/Request: User reported that at a small/intermediate resolution the round social controls moved upward and the cart was pushed out of the viewport; requested smaller centered circles and the ANESTET mark shifted left.
Reworked the mobile header into a shrink-safe two-column grid, aligned the ANESTET wordmark to the left, normalized VK, Telegram, support, and cart controls to accessible 44px circles, moved the cart count into a compact badge, and expanded layout QA with an exact 644px viewport plus per-control viewport/header collision assertions.

## 2026-08-31T15:22:23.000Z - QK Cosmetic three-direction Design Lab

- ID: 2026-08-31T15-22-23-000Z-qk-cosmetic-three-direction-design-lab
- Version: 12.0.0
- Category: feature
- Branch: main
- Files: app/storefront.tsx, app/globals.css, app/layout.tsx, scripts/qa-layout.mjs, scripts/sync-getlayers-three.mjs, public/assets/getlayers, getlayers.json, docs/GETLAYERS_PROVENANCE.md, deploy/anestet.139-180-214-133.sslip.io.conf, AGENTS.md, README.md
- Verification: npm run build; npm run qa:layout: 11 screens x 3 designs x 3 presentations; Codex in-app Browser desktop/mobile review; live GetLayers iframe canvas; cart state retained across design changes; zero console errors; Lighthouse with production compression 99/100/100/100, LCP 1.8 s, TBT 20 ms, CLS 0; npm audit 0 vulnerabilities
- Risk/Rollback: medium; local release candidate only, no VPS deployment was performed. Roll back to the previous immutable release if the candidate is later promoted.
- Issue/Request: User requested a stronger storefront built from the latest GetLayers work, three switchable visual versions, truthful unknown-stock treatment, and preservation of the existing catalog and order flow.

Introduced Clinical Luxury, Beauty Editorial and Future Beauty as persistent visual systems over one shared 23-product commerce core; localized Shoal and Opaline GetLayers scenes with mobile/reduced-motion fallbacks; added the availability question-mark convention; hardened the 3-design layout gate; and made the Codex local Browser the project-default visual QA surface.

## 2026-08-31T19:30:00.000Z - Commerce administration, authentic packshots and prism motion

- ID: 2026-08-31T19-30-00-000Z-commerce-administration-authentic-packshots-prism-motion
- Version: 13.0.0
- Category: feature
- Branch: main
- Files: app/storefront.tsx, app/globals.css, app/products.ts, app/admin, lib/admin, server/order-api.mjs, deploy, public/assets/img/restored, docs/admin, docs/releases/2026.08.31-v13.0.0.md
- Verification: npm run build; npm run qa:layout: 11 screens x 3 designs x 3 presentations; Codex in-app Browser visual review; admin catalog/integration smoke tests; browser-bundle/API/audit fake-secret leak scan
- Risk/Rollback: medium; local candidate only, no VPS deployment. Roll back to v12.1.0 if the candidate is not promoted.
- Issue/Request: User requested refined Future Beauty composition, authentic transparent product edges, promotion/favourites/callback flows, a practical admin and future 1С/CDEK connector settings.

Added a shared runtime catalog and protected admin, persistent favourites, callback intake, Queen Key sale pricing, official brand lockup, founder optical scene and a single position-stable prism hero transition. Rejected generative packshot variants that altered label text and promoted deterministic alpha-only restorations instead.


## 2026-08-31T20:35:12.233Z - Version 13.1.1

- Previous version: 11.1.3
- Bump: explicit
## 2026-08-31T20:35:22.368Z - Complete two-theme ANESTET storefront, authentic packshots and protected admin
- ID: 2026-08-31T20-35-22-368Z-complete-two-theme-anestet-storefront-authentic-packshots-and-protected-admin
- Version: 13.1.1
- Category: feature
- Branch: main
- Head: 8165868
- Files: app/storefront.tsx, app/globals.css, app/products.ts, app/admin, lib/admin, server/order-api.mjs, public/assets/getlayers, public/assets/img/restored/packshots-v13, public/assets/img/partners/alexander-founder-cropped-v3.webp, scripts/qa-layout.mjs, scripts/admin-smoke.mjs, scripts/sync-getlayers-three.mjs, deploy, docs, README.md, AGENTS.md, .codex-memory, .codex-archive, serve.qa.json, package.json, package-lock.json
- Verification: npm run build && npm run qa:layout: PASS, 11 widths x 2 themes x 3 presentations; npm run qa:admin: PASS; npx tsc --noEmit: PASS; npm audit --omit=dev: 0 vulnerabilities; git diff --check: PASS; 23/23 lossless WebP masters decode to identical verified PNG RGBA; Codex local Browser/Playwright desktop and mobile review with standalone GetLayers canvas
- Risk/Rollback: medium; deploy as immutable static, Order API and Admin API releases with atomic symlinks and preserve v11.1.3 rollback
- Issue/Request: Cumulative user corrections from visual review, product-image authenticity, responsive layout, promotion/favourites/callback, administration, connector readiness, Comet hydration warning and VPS publication.
Finalized Future Beauty and Clinical Luxury across desktop/mobile, locked the hero to the Prism transition, placed the local GetLayers Opaline layer beneath the product without a visible seam or recursive iframe fallback, restored readable ANESTET/Queen Key footer hierarchy, promoted 23 exact lossless WebP packshots with CSS-only shadows, and added persistent favourites, callback, promotions, shared catalog administration and fail-closed 1C/CDEK connector readiness.

## 2026-08-31T21:24:03.302Z - Publish ANESTET v13.1.2 with clean admin session and durable release governance
- ID: 2026-08-31T21-24-03-302Z-publish-anestet-v13.1.2-with-clean-admin-session-and-durable-release-governance
- Version: 13.1.2
- Category: release
- Branch: main
- Head: 8165868
- Files: app, lib/admin, server, public/assets, deploy, scripts, docs, README.md, AGENTS.md, .github/workflows/quality.yml, .codex-memory, .codex-archive, .codex-skill-lab, package.json, package-lock.json, getlayers.json
- Verification: npm run build && npm run qa:layout: PASS, 11 widths x 2 themes x 3 presentations; npm run qa:admin: PASS including anonymous session 200 false and protected resources 401; npx tsc --noEmit; npm audit --omit=dev; git diff --check: PASS; Public health, catalog=23, id60=890/1190, authenticated admin login/logout and connector status PASS; Codex Browser public storefront, standalone Opaline canvas and admin console warnings/errors=0; Root-only VPS backup archive 0600 contains live data plus env/nginx/systemd configuration; Lighthouse Accessibility/Best Practices/SEO=100; synthetic performance retained as REVIEW
- Risk/Rollback: medium; active immutable release 20260901-v13.1.2 with previous 20260831-v13.1.1 and v11.1.3 releases preserved for atomic rollback
- Issue/Request: Complete all cumulative visual, product image, admin, connector, responsive, console and VPS publication corrections; preserve the correction workflow for future websites.
Published the complete two-theme ANESTET storefront, 23 authentic shadow-free packshots, Prism hero, shared catalog, protected admin and fail-closed connectors to immutable VPS releases. Removed the expected anonymous admin 401 from browser console without weakening protected endpoints, aligned local image validation, expanded root-only backups, updated CI and installed the reusable website-correction-lineage skill.


## 2026-08-31T22:21:19.241Z - Version 13.1.3

- Previous version: 13.1.2
- Bump: patch
## 2026-08-31T22:42:40.588Z - Compact ANESTET layout, source-faithful hero copy and interactive care guide
- ID: 2026-08-31T22-42-40-588Z-compact-anestet-layout-source-faithful-hero-copy-and-interactive-care-guide
- Version: 13.1.3
- Category: fix
- Branch: main
- Head: ed2484d
- Files: app/storefront.tsx, app/globals.css, .codex-memory/correction-register.md, docs/RELEASE_HISTORY.md, docs/releases/2026.09.01-v13.1.3.md, package.json, package-lock.json, .codex-versioning/VERSION
- Verification: npm run build && npm run qa:layout: PASS, 11 widths x 2 themes x 3 presentations; npm run qa:admin: PASS; npx tsc --noEmit: PASS; npm audit --omit=dev: 0 vulnerabilities; git diff --check: PASS; Codex in-app Browser hero/founder visual QA with overflow=false; Local Chrome interaction smoke: stage 02 -> four products, product 39 focused and targeted, console warnings/errors=0
- Risk/Rollback: low-to-medium; static storefront patch only. Roll back the /var/www/anestet/current symlink to immutable 20260901-v13.1.2; Order API and Admin API remain unchanged.
- Issue/Request: Cumulative user visual corrections requested product-led hero wording from the previous storefront, animated headline replacement, a larger founder nameplate, smaller oversized sections and fully clickable care-stage product navigation.
Replaced the abstract hero slogan with product-specific source descriptions and synchronized wind-out/type-in copy motion with the approved Prism transition; enlarged the Alexander Ermolaev founder caption while preserving the original portrait and reducing empty space; shortened evidence and footer scenes with restrained runway/silk motion; reduced the care-guide heading; and added stage-scoped catalog navigation plus focused product deep links.## 2026-08-31T22:49:25.974Z - Mark ANESTET v13.1.3 active production state
- ID: 2026-08-31T22-49-25-974Z-mark-anestet-v13.1.3-active-production-state
- Version: 13.1.3
- Category: release
- Branch: main
- Head: 3725c9b
- Files: README.md, .codex-memory/task-state.md, .codex-memory/correction-register.md
- Verification: Public storefront and /admin returned 200; Order API and Admin API health returned ok; Anonymous admin session returned 200 authenticated false; Public catalog returned 23 products and id60 price 890 compareAtPrice 1190; Public Codex Browser showed release 13.1.3, full founder name, product-led hero and overflow=false; Public Chrome interaction smoke selected product 39 with no console warnings/errors or request failures
- Risk/Rollback: documentation-only follow-up; no runtime code change
- Issue/Request: Deployment status documentation must reflect the exact active immutable static release while distinguishing unchanged Order/Admin API releases.
Updated the durable task state, correction lineage and README after atomic VPS promotion and successful public storefront, API, catalog, responsive and interaction smoke checks.## 2026-08-31T22:52:49.539Z - Stabilize Future Beauty hero packshot safe zone
- ID: 2026-08-31T22-52-49-539Z-stabilize-future-beauty-hero-packshot-safe-zone
- Version: 13.1.3
- Category: responsive-layout
- Branch: main
- Head: 9c3f949
- Files: app/globals.css, .codex-memory/correction-register.md
- Verification: npm run build; npm run qa:layout; npm run qa:admin; npx tsc --noEmit; npm audit --omit=dev; git diff --check
- Risk/Rollback: low
- Issue/Request: GitHub Actions layout QA detected hero image to product label collisions at 1687x1000 and 1912x1858 although the local visual matrix passed.
Increase the Future Beauty hero packshot bottom inset from 18% to 23% so Linux Chromium CI keeps the product image clear of the product label at all control widths without changing the Prism transition, image, scale, or center.## 2026-08-31T23:20:41.279Z - Refine hero transition timing and label fit
- ID: 2026-08-31T23-20-41-279Z-refine-hero-transition-timing-and-label-fit
- Version: 13.1.3
- Category: ui
- Branch: main
- Head: 9c3f949
- Files: app/storefront.tsx, app/globals.css, scripts/qa-layout.mjs
- Verification: npm run build; npm run qa:layout (3 consecutive passes); Computed-style transition smoke at 40ms/290ms; All 8 hero labels fit at 900px
- Risk/Rollback: low
- Issue/Request: Hero copy briefly changed typography during product transitions, long labels were clipped, and the carousel advanced before users could comfortably read the copy.
Replaced the unstable intermediate hero typography with a consistent blur transition, extended product dwell time to seven seconds, and allowed all hero product labels to wrap without truncation.## 2026-08-31T23:20:41.397Z - Compact founder composition and optimize motion graphics
- ID: 2026-08-31T23-20-41-397Z-compact-founder-composition-and-optimize-motion-graphics
- Version: 13.1.3
- Category: performance
- Branch: main
- Head: 9c3f949
- Files: app/globals.css, app/storefront.tsx, public/assets/getlayers/opaline.html, public/assets/getlayers/opaline/index.html, public/assets/img/optimized/anestet-logo-blue-990-lossless.webp, public/assets/img/optimized/queen-key-mark-512-lossless.webp
- Verification: Founder image reaches the lower navigation underlay at desktop width; Opaline data-motion-active becomes false after scrolling off hero; Desktop Lighthouse 95-96 performance x3, accessibility 100, LCP 1.40s, TBT 0; npm audit --omit=dev reports 0 vulnerabilities
- Risk/Rollback: medium
- Issue/Request: The founder section retained excessive empty space below the portrait, while oversized logo textures and an always-running high-density WebGL scene added unnecessary rendering cost.
Removed the empty floor beneath Alexander Ermolaev, anchored the portrait into the navigation underlay, optimized logo assets, and paused/reduced the Opaline renderer outside the visible hero.## 2026-08-31T23:29:24.400Z - Publish and verify immutable v13.1.3-r2 storefront
- ID: 2026-08-31T23-29-24-400Z-publish-and-verify-immutable-v13.1.3-r2-storefront
- Version: 13.1.3
- Category: release
- Branch: main
- Head: bd38475
- Files: README.md, docs/releases/2026.09.01-v13.1.3.md, .codex-memory/task-state.md, .codex-memory/correction-register.md
- Verification: Active symlink /var/www/anestet/releases/20260901-v13.1.3-r2; nginx and both API services active; Public storefront/admin/Opaline/API HTTP 200 and 23 products; Public Browser console/page/request errors 0; Public Lighthouse mobile 97 and desktop 87-91; Accessibility 100
- Risk/Rollback: low
- Issue/Request: The final local corrections required a verifiable production artifact and exact rollback-safe deployment evidence.
Published the final optimized static bundle to a new immutable VPS directory, atomically switched nginx, and recorded public storefront, API, browser, and Lighthouse evidence.## 2026-08-31T23:43:35.010Z - Remove zero-strength Opaline bloom pass
- ID: 2026-08-31T23-43-35-010Z-remove-zero-strength-opaline-bloom-pass
- Version: 13.1.3
- Category: performance
- Branch: main
- Head: 2970812
- Files: public/assets/getlayers/opaline.html, public/assets/getlayers/opaline/index.html, README.md, docs/releases/2026.09.01-v13.1.3.md, .codex-memory/task-state.md, .codex-memory/correction-register.md
- Verification: Visual A/B confirms approved brightness and color preserved with gamma pass; npm run build; npm run qa:layout: 11 widths x 2 themes x 3 presentations; Local desktop Lighthouse 95/96/96, LCP 1.4s, TBT 0, 46 requests; Console errors 0 and WebGL canvas present
- Risk/Rollback: medium
- Issue/Request: Independent post-deploy audit found occasional desktop cold-start long tasks even after DPR, mesh, visibility, and asset optimizations; bloom was configured to zero but still allocated and executed.
Preserved the approved gamma-corrected Opaline appearance while removing the zero-strength bloom pass, its shader import, and extra render targets to reduce cold desktop WebGL work.## 2026-08-31T23:47:02.283Z - Record r3 public performance evidence
- ID: 2026-08-31T23-47-02-283Z-record-r3-public-performance-evidence
- Version: 13.1.3
- Category: release
- Branch: main
- Head: a737486
- Files: docs/releases/2026.09.01-v13.1.3.md, .codex-memory/task-state.md
- Verification: Public r3 Lighthouse desktop 93/88/68; Accessibility 100 all runs; TBT 0 all runs; Public Playwright console/page/request errors 0
- Risk/Rollback: low
- Issue/Request: Production evidence needed to distinguish resolved WebGL main-thread work from remaining public network variability.
Recorded final public cold/warm desktop measurements after the zero-bloom release, including stable zero TBT and remaining network/Speed Index variance.

## 2026-09-01T04:32:51.526Z - Version 13.2.0

- Previous version: 13.1.3
- Bump: minor
## 2026-09-01T07:49:34.133Z - Release v13.2.0: approved storefront, VK feed and durable logic graph
- ID: 2026-09-01T07-49-34-133Z-release-v13.2.0-approved-storefront-vk-feed-and-durable-logic-graph
- Version: 13.2.0
- Category: release
- Branch: main
- Head: 834538b
- Files: app/storefront.tsx, app/globals.css, app/admin/admin-client.tsx, app/admin/admin-integrations.tsx, app/admin/admin-vk-feed.tsx, app/admin/admin.module.css, lib/admin/config.mjs, lib/admin/contract.ts, lib/admin/integrations.mjs, lib/admin/server.mjs, lib/admin/connector-secret-store.mjs, lib/admin/vk-connector.mjs, lib/admin/vk-feed-store.mjs, public/assets/getlayers/opaline.html, public/assets/getlayers/opaline/index.html, scripts/qa-layout.mjs, scripts/admin-smoke.mjs, deploy/anestet-admin-api.env.example, deploy/anestet-backup.sh, deploy/anestet.139-180-214-133.sslip.io.conf, deploy/anestet.139-180-214-133.sslip.io.production.conf, .codex-logic, .graphifyignore, graphify-out, docs/LOGIC_GRAPH_RU.md, docs/releases/2026.09.01-v13.2.0.md, README.md, docs/RELEASE_HISTORY.md
- Verification: npm run build; npm run qa:layout (11 control widths x 2 themes x 2 views); npm run qa:admin; npx tsc --noEmit; npm audit --omit=dev (0 vulnerabilities); git diff --check; Codex Browser desktop/mobile visual and console review; Production TLS/API/nginx/systemd smoke tests
- Risk/Rollback: Medium: broad storefront motion/layout and admin API changes; mitigated by eleven-width geometry QA across both themes/views, browser visual review, protected API smoke tests, TypeScript/build checks, immutable VPS releases and rollback preservation.
- Issue/Request: Complete the accumulated design, motion, responsive, product-media, admin connector, VK publishing, performance, correction-lineage and VPS release corrections without regressing either approved theme.
Finalized the two-theme ANESTET storefront and admin release: approved Prism hero motion, responsive product/about/footer refinements, mutually exclusive Opaline and lightweight fallback graphics, authentic transparent product media, encrypted VK connector with public moving news rail for queenkeyanestet, cumulative correction lineage and Graphify logic graph. Deployed immutable storefront 20260901-v13.2.0-r2 and Admin API 20260901-v13.2.0 to production.