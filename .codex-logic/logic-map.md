# Logic Graph - xsANESTET_site

This file is the curated map that sits above Graphify. Graphify tracks code symbols and paths; this map explains the durable project logic.

## Core Logic Boundaries

- Strategy logic:
- Data ingestion and normalization:
- Feature engineering:
- Model / forecast gateway:
- Risk engine:
- Portfolio allocator:
- Execution gateway:
- Live/backtest parity:
- Monitoring and compliance:

## Model And Weight Provenance

- Weight or policy name:
- Purpose:
- Training data sources:
- Feature set:
- Train window:
- Validation/test window:
- Walk-forward protocol:
- Retraining cadence:
- Leakage/lookahead controls:
- Live deployment guardrails:

## Graphify Discipline

- Run `update_graph` after meaningful logic changes.
- Use `query_graph`, `path_query`, or `affected` before edits that cross module boundaries.
- Record results in `.codex-logic/logic-ledger.jsonl` through `write_logic_ledger`.

## 2026-09-01T05:11:33.523Z - G1 Storefront structure lineage

Supersedes the earlier old/one-page/full switcher. The approved storefront is one full commerce site only; legacy site and motion query parameters are normalized away. Catalog and care guide remain internal sections.

Files: app/storefront.tsx, app/globals.css, scripts/qa-layout.mjs
Validation: Build and 11-width layout gate in both themes required before release.
Risks: Unreleased 13.2.0 until final gate and VPS verification.

## 2026-09-01T05:11:33.657Z - G2 Approved visual themes

The earlier three-theme experiment was reduced by user correction. Exactly two supported themes remain: Future Beauty dark blue and Clinical Luxury light. Every structural design correction must propagate to both.

Files: app/storefront.tsx, app/globals.css
Validation: Desktop and mobile browser screenshots plus layout QA in both themes.
Risks: Theme-specific overrides can drift and must be audited together.

## 2026-09-01T05:11:33.772Z - G3 Hero motion and copy lineage

The initial soft swap and rejected particles/portal experiments were superseded by one position-stable Prism transition. Hero copy now uses product-derived titles and source-derived descriptions, a consistent blur transition, seven-second dwell, and synchronized price/label changes.

Files: app/storefront.tsx, app/globals.css
Validation: No geometry jump, text clipping, font swap, or shadow discontinuity during transition.
Risks: CSS filter keyframes must retain the site-generated drop shadow for the full transition.

## 2026-09-01T05:11:33.886Z - G4 GetLayers Opaline and exclusive fallback

Future Beauty uses one full-width GetLayers Opaline scene behind the product. The fallback is mutually exclusive and activates only when WebGL is unavailable, reduced motion applies, or the compact viewport disables the iframe. The current fallback reuses a large animated optical halo rather than a separate white pedestal.

Files: public/assets/getlayers/opaline/index.html, app/storefront.tsx, app/globals.css
Validation: Child frame posts ready after first rendered frame; parent hides fallback when ready. Browser must show data-graphics=active, fallback opacity absent, and one visible graphic.
Risks: A WebGL context loss must switch to fallback without leaving both layers visible.

## 2026-09-01T05:11:34.005Z - G5 Product assets and shadows

All 23 product packshots use deterministic transparent restored v2 assets. AI reconstructions that changed labels were rejected. Raster shadows are not accepted; visual depth is generated in CSS, preserving Russian labels and authentic packaging.

Files: public/assets/img/restored/packshots-v13, app/products.ts, app/globals.css
Validation: RGBA/contact-sheet audit and product-card browser review.
Risks: Do not overwrite approved packshots with generative edits or baked shadows.

## 2026-09-01T05:11:34.121Z - G6 Founder About composition

Alexander Ermolaev remains the authentic supplied portrait without generated legs. The oversized empty capsule was superseded by compact shared proportions, larger readable name plate, and bottom-aligned composition. The current name is Alexander Ermolaev, founder of the company.

Files: app/storefront.tsx, app/globals.css, public/assets/img/partners/alexander-founder-cropped-v3.webp
Validation: Shared desktop/mobile visual QA in both themes; no empty lower gap or clipping.
Risks: Theme overrides must not reintroduce divergent portrait heights.

## 2026-09-01T05:11:34.236Z - G7 Brand hierarchy correction

The former large footer brand stage with separate oversized ANESTET and circular Queen Key marks is superseded. The hero now identifies the current product context: Anestet with registered-mark symbol for non-Queen-Key products, and the compact Queen Key Cosmetic lockup without circular mark for Queen Key. The footer retains only the animated ANESTET / Clinical Care / Queen Key line and compact service information.

Files: app/storefront.tsx, app/globals.css, public/assets/img/logo-footer.svg
Validation: Verify brand lockup changes with hero product and does not collide at control widths.
Risks: Product brand mapping treats Queen Key explicitly; all other current brands use the Anestet umbrella lockup.

## 2026-09-01T05:11:34.348Z - G8 Commerce and care navigation

The full store preserves persistent cart and favorites, authoritative 23-product prices, new/discount badges, unknown-stock marker, callbacks, server-side order validation, and care-stage deep links that focus the requested product.

Files: app/storefront.tsx, app/products.ts, server/order-api.mjs
Validation: Admin smoke, catalog API and layout gate.
Risks: Real stock and order routing remain intentionally fail-closed until official 1C and service credentials exist.

## 2026-09-01T05:11:34.481Z - G9 Admin and connector security

The custom admin manages catalog data and future 1C/CDEK/Bitrix connectors. VK integration adds encrypted AES-256-GCM token storage, safe masked status, save/link controls, connection tests, manual synchronization, publication review, and product mapping. No secret is returned to the browser or logs.

Files: app/admin, lib/admin/connector-secret-store.mjs, lib/admin/vk-connector.mjs, lib/admin/vk-feed-store.mjs, lib/admin/server.mjs, scripts/admin-smoke.mjs
Validation: qa:admin must pass encrypted-at-rest, redaction, CSRF, origin, normalize/map/publish and fail-closed cases.
Risks: Real VK feed remains externally blocked until an official company token is entered in admin.

## 2026-09-01T05:11:34.600Z - G10 VK-only editorial feed

Static Telegram and Taplink cards in News, video and formulas were superseded. The section now renders only real VK video or photo publications from the public API endpoint. Taplink stays in the header; an empty feed shows one honest official-VK state rather than invented cards.

Files: app/storefront.tsx, app/admin/admin-vk-feed.tsx, lib/admin/vk-feed-store.mjs, lib/admin/vk-connector.mjs
Validation: Validate photo-post links, video modal player, empty state and source allowlists.
Risks: No real token means no real feed evidence yet.

## 2026-09-01T05:11:34.713Z - G11 Release and QA gate

Every preview or VPS release requires npm run build and npm run qa:layout across eleven control widths, two themes and both catalog/guide views, plus local Codex browser visual review, console/network checks, admin smoke, accessibility and performance evidence. Horizontal overflow and all defined collisions are release blockers.

Files: AGENTS.md, scripts/qa-layout.mjs, scripts/admin-smoke.mjs, docs/releases
Validation: Record immutable VPS release path, symlink target, rollback candidate, live release identifier and smoke results.
Risks: Desktop GetLayers cold-start performance remains variable and must be reported as REVIEW if Lighthouse is unstable.

## 2026-09-01T05:11:34.827Z - G12 Historical graph backfill

Backfilled the correction lineage from v10 through v13.1.3-r3 and the current 13.2.0 candidate using git history, CHANGELOG, release notes, correction register and task state. Key chronology: d20c251 -> fe61571 -> eb38c39 -> e2f9fa8 -> b99c411 -> 77dbfe5 -> fc4de3b -> 8f91751 -> 6e3e64f -> dirty 13.2.0.

Files: CHANGELOG.codex.md, docs/releases, .codex-memory/correction-register.md, .codex-memory/task-state.md
Validation: Graph update and query must expose the active approved implementation and superseded alternatives.
Risks: Graphify runtime is currently unavailable because the shared canonical executable is missing and the only discovered wrapper is a dataless symlink target; ledger remains usable while graph generation is blocked.

## 2026-09-01T05:17:14.919Z - G13 Graphify runtime recovery and active project graph

Recovered the canonical shared Python 3.12 Graphify runtime at ~/CodexProjects/runtime/xs-tools/graphify/graphify_venv with graphifyy 0.8.35. Generated the xsANESTET_site graph and visual tree: 18,437 nodes and 26,359 edges, plus thematic deploy, docs, Codex-governance and tools graphs. The correction ledger is now populated and graph queries are saved under .codex-logic/queries.

Files: .codex-logic/logic-ledger.jsonl, .codex-logic/logic-map.md, graphify-out/graph.json, graphify-out/GRAPH_TREE.html, graphify-out/topics/INDEX.md
Validation: MCP Python runtime check PASS on Python 3.12.13.; Graphify health PASS.; Graph update generated graph.json, GRAPH_TREE.html and topic graphs with canonical-root hygiene PASS.
Risks: Graph queries over generic Russian terms can return broad documentation nodes; use code symbol names or constrained paths for architecture questions.

## 2026-09-01T05:57:13.775Z - VK official channel continuous news rail

The verified official community domain is queenkeyanestet at vk.ru. The storefront renders synchronized photo/video publications as a continuously moving square-card rail with real posters, titles and excerpts. Sync paginates wall.get up to the configured safe cap, publishes new official items by default, allows hiding, and keeps product linkage optional. No scraping fallback is used because VK returns an anti-bot challenge; an official token remains required and encrypted server-side.

Files: app/storefront.tsx, app/globals.css, app/admin/admin-vk-feed.tsx, lib/admin/vk-connector.mjs, lib/admin/vk-feed-store.mjs, scripts/admin-smoke.mjs, deploy/anestet-admin-api.env.example, docs/releases/2026.09.01-v13.2.0.md
Validation: npm run build PASS; npm run qa:layout PASS 11x2x2; npm run qa:admin PASS; npx tsc --noEmit PASS; npm audit --omit=dev 0 vulnerabilities; Public vk.ru page returned VK anti-bot challenge without API authorization; scraping rejected.
Risks: Real populated feed remains unverified until the company supplies a VK access token.; VK API rate limits can constrain large historical imports; VK_POST_LIMIT defaults to 1000 and caps at 5000.

## 2026-09-01T09:42:25.300Z - System-aware Day Night themes and registered brand lockups

The two approved themes remain Future Beauty and Clinical Luxury. The large top selector and its extra layout strip are superseded by one compact accessible Day/Night control integrated into the header. Before hydration, URL or persisted manual choice wins; otherwise the browser/OS color preference selects the theme. Raw catalog keys remain unchanged for API compatibility, while visible ANESTET brand labels receive the registered mark. Queen Key Cosmetic is dark on Clinical Luxury and light on Future Beauty.

Files: app/layout.tsx, app/storefront.tsx, app/icons.tsx, app/globals.css, scripts/qa-layout.mjs
Validation: TypeScript; production build; 11 widths x 2 themes x 2 views; visual desktop/mobile QA; Queen Key computed filter.
Risks: Manual theme selection intentionally persists and overrides later OS changes until the saved choice is cleared.

## 2026-09-01 — Stable product-centred hero composition and details

The Future Beauty WebGL scene does not derive its centre from the active product. All 23 normalized packshots were measured once; their alpha-weighted mean vertical centre is 49.7174%. The stable `.hero-packshot-frame` maps that point into iframe-normalized coordinates, and the Opaline group plus halo share the resulting Three.js world position. Product changes therefore cannot move the sphere, while responsive layout changes move packshot and sphere together. Product packshots/titles open official-source detail dialogs; cart controls remain separate. Hero price layers are temporally exclusive and use real Open Sans bold tabular numerals.

Files: app/product-details.ts, app/storefront.tsx, app/globals.css, public/assets/getlayers/opaline/index.html, scripts/qa-layout.mjs
Validation: measured 23-packshot alpha centre; TypeScript; 11 widths x 2 themes x 2 views; anchor stability; price transition; detail/cart independence.
Risk: If the normalized packshot asset pipeline changes from the shared 1000px canvas, recompute the mean centre before release.

## 2026-09-01 — Vector packshot edge reconstruction

The first shadow-free v2 cutouts preserved official RGB but nine products retained 12-level, visibly stair-stepped alpha edges. A Gaussian alpha experiment was rejected by the user before release. Those nine silhouettes are now product-specific SVG paths built from straight side walls, semicircular cap/bottom arcs, shoulder curves, pump paths and dropper curves. They are rasterized at 4x only for vector antialiasing, then downsampled; blur is never applied. CopyOpacity changes alpha only, and QA requires zero changed RGB pixels against v2. The fourteen already continuous v2 packshots remain untouched.

Files: scripts/polish-product-packshot-edges.mjs, scripts/qa-packshots.mjs, app/products.ts, public/assets/img/restored/packshots-v13
Validation: 9/9 vector silhouettes; zero RGB delta; 23/23 transparent masters/cards; 11 widths x 2 themes x 2 views; local dark/light/mobile browser review.
Risk: A future source crop or canvas normalization change requires refitting that product's SVG geometry rather than applying a generic smoothing filter.
