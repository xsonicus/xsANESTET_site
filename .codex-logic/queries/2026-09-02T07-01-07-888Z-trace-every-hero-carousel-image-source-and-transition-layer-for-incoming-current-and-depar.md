# Graphify Query

Question: Trace every hero carousel image source and transition layer for incoming, current, and departing products. Identify where a clean high-resolution asset could be replaced by a lower-resolution master/card asset after the transition, including Next Image src and sizes.
Graph: /Users/xsonicus/CodexRuntime/xsANESTET_site/graphify-out/graph.json

```text
Graph: graphify-out/graph.json (2656 nodes) | Traversal: BFS depth=2 | Start: ['getImageSizeForSource()', 'ext-static_highlight.js', '2026-08-28T13:26:27.148Z - Extend the hero promise to always and everywhere', '.until_after()', 'assets:detail', 'productCardPackshot()', 'clean()', 'currentCatalog()', 'heroEyebrow()', 'identify()', 'Image()', 'sync-getlayers-three.mjs', 'next', 'products', 'moduleResolution', 'source()'] | 180 nodes found

[!] TRUNCATED: showing 16 of 180 nodes (~120-token budget). The answer may be among the 164 cut nodes — raise the token budget (CLI: --budget) or narrow the query (e.g. context_filter=['call'], or get_node for a specific symbol).

NODE getImageSizeForSource() [src=original_site/assets/components/ace/emmet/emmet.js loc=L9963 community=]
NODE ext-static_highlight.js [src=original_site/assets/components/ace/ace/ext-static_highlight.js loc=L1 community=]
NODE 2026-08-28T13:26:27.148Z - Extend the hero promise to always and everywhere [src=CHANGELOG.codex.md loc=L179 community=]
NODE .until_after() [src=original_site/assets/components/ace/ace/beautifier.js loc=L1370 community=]
NODE assets:detail [src=package.json loc=L14 community=]
NODE productCardPackshot() [src=app/storefront.tsx loc=L266 community=]
NODE clean() [src=server/order-api.mjs loc=L44 community=]
NODE currentCatalog() [src=server/order-api.mjs loc=L67 community=]
NODE heroEyebrow() [src=app/storefront.tsx loc=L108 community=]
NODE identify() [src=scripts/polish-product-packshot-edges.mjs loc=L90 community=]
NODE Image() [src=original_site/assets/js/swiper-bundle.min.js loc=L13 community=]
NODE sync-getlayers-three.mjs [src=scripts/sync-getlayers-three.mjs loc=L1 community=]
NODE next [src=package.json loc=L20 community=]
NODE products [src=app/products.ts loc=L14 community=]
NODE moduleResolution [src=tsconfig.json loc=L15 community=]
NODE source() [src=app/product-details.ts loc=L10 community=]
... (truncated — 164 more nodes cut by ~120-token budget. Narrow with context_filter=['call'] or use get_node for a specific symbol)

```
