# Pre-change graph query — product detail experience

Generated before the v13.4.0 product-detail redesign. The graph establishes that the modal is an independent Storefront flow fed by `getProductDetails()` and must preserve the separate add-to-cart action.

Graph: graphify-out/graph.json (2552 nodes) | Traversal: BFS depth=2 | Start: ['details', 'Storefront()', 'Storefront', '.add()', 'CartLine', 'openTag()', 'Product'] | 84 nodes found

[!] TRUNCATED: showing 61 of 84 nodes (~1800-token budget). The answer may be among the 23 cut nodes — raise the token budget (CLI: --budget) or narrow the query (e.g. context_filter=['call'], or get_node for a specific symbol).

NODE details [src=app/product-details.ts loc=L73 community=product-details.ts]
NODE Storefront() [src=app/storefront.tsx loc=L300 community=Storefront]
NODE Storefront [src=docs/releases/2026.08.31-v13.0.0.md loc=L3 community=2026.08.31-v13.0.0]
NODE .add() [src=original_site/assets/components/minishop2/js/web/vanilajs/modules/msorder.class.js loc=L92 community=MsOrder]
NODE CartLine [src=app/storefront.tsx loc=L9 community=storefront.tsx]
NODE openTag() [src=original_site/assets/components/ace/emmet/emmet.js loc=L5888 community=emmet.js]
NODE Product [src=app/products.ts loc=L1 community=products.ts]
NODE emmet.js [src=original_site/assets/components/ace/emmet/emmet.js loc=L1 community=emmet.js]
NODE storefront.tsx [src=app/storefront.tsx loc=L1 community=storefront.tsx]
NODE product-details.ts [src=app/product-details.ts loc=L1 community=product-details.ts]
NODE MsOrder [src=original_site/assets/components/minishop2/js/web/vanilajs/modules/msorder.class.js loc=L1 community=MsOrder]
NODE 2026.08.31-v13.0.0 [src=docs/releases/2026.08.31-v13.0.0.md loc=L1 community=2026.08.31-v13.0.0]
NODE products.ts [src=app/products.ts loc=L1 community=products.ts]
NODE createMatcher() [src=original_site/assets/components/ace/emmet/emmet.js loc=L5919 community=emmet.js]
NODE .initialize() [src=original_site/assets/components/minishop2/js/web/vanilajs/modules/msorder.class.js loc=L34 community=MsOrder]
NODE .updatePayments() [src=original_site/assets/components/minishop2/js/web/vanilajs/modules/msorder.class.js loc=L62 community=MsOrder]
NODE app/page.tsx [src=app/page.tsx loc=L1 community=Storefront]
NODE getProductDetails() [src=app/product-details.ts loc=L120 community=product-details.ts]
NODE formatPrice() [src=app/products.ts loc=L40 community=products.ts]
NODE .hide() [src=original_site/assets/components/minishop2/js/web/vanilajs/modules/msorder.class.js loc=L256 community=MsOrder]
NODE heroDescription() [src=app/storefront.tsx loc=L104 community=Storefront]
NODE heroEyebrow() [src=app/storefront.tsx loc=L108 community=Storefront]
NODE heroHeadline() [src=app/storefront.tsx loc=L100 community=Storefront]
NODE isCatalogProduct() [src=app/storefront.tsx loc=L56 community=Storefront]
NODE isVkFeedItem() [src=app/storefront.tsx loc=L159 community=Storefront]
NODE parseStoredCart() [src=app/storefront.tsx loc=L40 community=Storefront]
NODE productCardPackshot() [src=app/storefront.tsx loc=L261 community=Storefront]
NODE productPackshot() [src=app/storefront.tsx loc=L260 community=Storefront]
NODE videoDuration() [src=app/storefront.tsx loc=L181 community=Storefront]
NODE .getcost() [src=original_site/assets/components/minishop2/js/web/vanilajs/modules/msorder.class.js loc=L139 community=MsOrder]
NODE .getrequired() [src=original_site/assets/components/minishop2/js/web/vanilajs/modules/msorder.class.js loc=L224 community=MsOrder]
NODE .submit() [src=original_site/assets/components/minishop2/js/web/vanilajs/modules/msorder.class.js loc=L167 community=MsOrder]
NODE icons.tsx [src=app/icons.tsx loc=L1 community=icons.tsx]
NODE matches() [src=original_site/assets/components/ace/emmet/emmet.js loc=L5977 community=emmet.js]
NODE ArrowIcon() [src=app/icons.tsx loc=L7 community=icons.tsx]
NODE BagIcon() [src=app/icons.tsx loc=L3 community=icons.tsx]
NODE CloseIcon() [src=app/icons.tsx loc=L19 community=icons.tsx]
NODE HeartIcon() [src=app/icons.tsx loc=L15 community=icons.tsx]
NODE MinusIcon() [src=app/icons.tsx loc=L23 community=icons.tsx]
NODE MoonIcon() [src=app/icons.tsx loc=L35 community=icons.tsx]
NODE PlusIcon() [src=app/icons.tsx loc=L27 community=icons.tsx]
NODE SparkIcon() [src=app/icons.tsx loc=L11 community=icons.tsx]
NODE SunIcon() [src=app/icons.tsx loc=L31 community=icons.tsx]
NODE products [src=app/products.ts loc=L14 community=products.ts]
NODE closeTag() [src=original_site/assets/components/ace/emmet/emmet.js loc=L5898 community=emmet.js]
NODE .clean() [src=original_site/assets/components/minishop2/js/web/vanilajs/modules/msorder.class.js loc=L159 community=MsOrder]
NODE .constructor() [src=original_site/assets/components/minishop2/js/web/vanilajs/modules/msorder.class.js loc=L4 community=MsOrder]
NODE .show() [src=original_site/assets/components/minishop2/js/web/vanilajs/modules/msorder.class.js loc=L262 community=MsOrder]
NODE Page() [src=app/page.tsx loc=L3 community=Storefront]
NODE lightDep [src=app/product-details.ts loc=L49 community=product-details.ts]
NODE lightDepPro [src=app/product-details.ts loc=L57 community=product-details.ts]
NODE lightFrost [src=app/product-details.ts loc=L41 community=product-details.ts]
NODE mildep [src=app/product-details.ts loc=L65 community=product-details.ts]
NODE primaryBase [src=app/product-details.ts loc=L12 community=product-details.ts]
NODE primaryFion [src=app/product-details.ts loc=L20 community=product-details.ts]
NODE ProductDetails [src=app/product-details.ts loc=L1 community=product-details.ts]
NODE secondaryBase [src=app/product-details.ts loc=L28 community=product-details.ts]
NODE secondaryFion [src=app/product-details.ts loc=L36 community=product-details.ts]
NODE source() [src=app/product-details.ts loc=L10 community=product-details.ts]
NODE BrandLabel() [src=app/storefront.tsx loc=L152 community=storefront.tsx]
NODE brandPrinciples [src=app/storefront.tsx loc=L123 community=storefront.tsx]
... (truncated — 23 more nodes cut by ~1800-token budget. Narrow with context_filter=['call'] or use get_node for a specific symbol)
Affected nodes for getProductDetails()
Relations: calls, indirect_call, references, imports, imports_from, dynamic_import, re_exports, inherits, extends, implements, uses, mixes_in, embeds, requires
Depth: 2
- Storefront() [calls] app/storefront.tsx:L348
- storefront.tsx [imports] app/storefront.tsx:L6
- app/page.tsx [imports] app/page.tsx:L1
