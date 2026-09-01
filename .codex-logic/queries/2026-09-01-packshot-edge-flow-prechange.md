Graph: graphify-out/graph.json (2512 nodes) | Traversal: BFS depth=2 | Start: ['products', 'details', 'Image()', 'app/page.tsx', 'catalog', 'heroEyebrow()', 'normalize-product-packshots.mjs', 'Product'] | 83 nodes found

[i] Complete answer over budget: all 83 nodes and 120 edges shown (~5803 tokens vs the requested ~2200-token budget). Edges are never dropped once every node fits, so this is already the full answer — raising --budget further will not shrink it. Narrow with context_filter=['call'] or use get_node for a specific symbol to reduce size instead.

NODE products [src=app/products.ts loc=L14 community=products.ts]
NODE details [src=app/product-details.ts loc=L73 community=product-details.ts]
NODE Image() [src=original_site/assets/js/swiper-bundle.min.js loc=L13 community=swiper-bundle.min.js]
NODE app/page.tsx [src=app/page.tsx loc=L1 community=Storefront]
NODE catalog [src=server/order-api.mjs loc=L14 community=order-api.mjs]
NODE heroEyebrow() [src=app/storefront.tsx loc=L108 community=Storefront]
NODE normalize-product-packshots.mjs [src=scripts/normalize-product-packshots.mjs loc=L1 community=normalize-product-packshots.mjs]
NODE Product [src=app/products.ts loc=L1 community=products.ts]
NODE swiper-bundle.min.js [src=original_site/assets/js/swiper-bundle.min.js loc=L1 community=swiper-bundle.min.js]
NODE storefront.tsx [src=app/storefront.tsx loc=L1 community=storefront.tsx]
NODE order-api.mjs [src=server/order-api.mjs loc=L1 community=order-api.mjs]
NODE product-details.ts [src=app/product-details.ts loc=L1 community=product-details.ts]
NODE Storefront() [src=app/storefront.tsx loc=L298 community=Storefront]
NODE products.ts [src=app/products.ts loc=L1 community=products.ts]
NODE Page() [src=app/page.tsx loc=L3 community=Storefront]
NODE outputDir [src=scripts/normalize-product-packshots.mjs loc=L8 community=normalize-product-packshots.mjs]
NODE root [src=scripts/normalize-product-packshots.mjs loc=L6 community=normalize-product-packshots.mjs]
NODE rows [src=scripts/normalize-product-packshots.mjs loc=L22 community=normalize-product-packshots.mjs]
NODE visibleHeightByVolume [src=scripts/normalize-product-packshots.mjs loc=L11 community=normalize-product-packshots.mjs]
NODE icons.tsx [src=app/icons.tsx loc=L1 community=icons.tsx]
NODE createCallback() [src=server/order-api.mjs loc=L140 community=order-api.mjs]
NODE createOrder() [src=server/order-api.mjs loc=L122 community=order-api.mjs]
NODE json() [src=server/order-api.mjs loc=L35 community=order-api.mjs]
NODE server [src=server/order-api.mjs loc=L181 community=order-api.mjs]
NODE clean() [src=server/order-api.mjs loc=L44 community=order-api.mjs]
NODE validateOrder() [src=server/order-api.mjs loc=L78 community=order-api.mjs]
NODE getProductDetails() [src=app/product-details.ts loc=L120 community=product-details.ts]
NODE formatPrice() [src=app/products.ts loc=L40 community=products.ts]
NODE currentCatalog() [src=server/order-api.mjs loc=L67 community=order-api.mjs]
NODE listOrders() [src=server/order-api.mjs loc=L169 community=order-api.mjs]
NODE rateLimited() [src=server/order-api.mjs loc=L48 community=order-api.mjs]
NODE readBody() [src=server/order-api.mjs loc=L56 community=order-api.mjs]
NODE ArrowIcon() [src=app/icons.tsx loc=L7 community=icons.tsx]
NODE BagIcon() [src=app/icons.tsx loc=L3 community=icons.tsx]
NODE CloseIcon() [src=app/icons.tsx loc=L19 community=icons.tsx]
NODE HeartIcon() [src=app/icons.tsx loc=L15 community=icons.tsx]
NODE MinusIcon() [src=app/icons.tsx loc=L23 community=icons.tsx]
NODE MoonIcon() [src=app/icons.tsx loc=L35 community=icons.tsx]
NODE PlusIcon() [src=app/icons.tsx loc=L27 community=icons.tsx]
NODE SparkIcon() [src=app/icons.tsx loc=L11 community=icons.tsx]
NODE SunIcon() [src=app/icons.tsx loc=L31 community=icons.tsx]
NODE heroDescription() [src=app/storefront.tsx loc=L104 community=Storefront]
NODE heroHeadline() [src=app/storefront.tsx loc=L100 community=Storefront]
NODE isCatalogProduct() [src=app/storefront.tsx loc=L56 community=Storefront]
NODE isVkFeedItem() [src=app/storefront.tsx loc=L159 community=Storefront]
NODE parseStoredCart() [src=app/storefront.tsx loc=L40 community=Storefront]
NODE productCardPackshot() [src=app/storefront.tsx loc=L261 community=Storefront]
NODE productPackshot() [src=app/storefront.tsx loc=L260 community=Storefront]
NODE videoDuration() [src=app/storefront.tsx loc=L181 community=Storefront]
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
NODE CareStageId [src=app/storefront.tsx loc=L252 community=storefront.tsx]
NODE careStages [src=app/storefront.tsx loc=L186 community=storefront.tsx]
NODE CartLine [src=app/storefront.tsx loc=L9 community=storefront.tsx]
NODE certificateDocuments [src=app/storefront.tsx loc=L288 community=storefront.tsx]
NODE CompanySection [src=app/storefront.tsx loc=L264 community=storefront.tsx]
NODE companySections [src=app/storefront.tsx loc=L266 community=storefront.tsx]
NODE DeliveryId [src=app/storefront.tsx loc=L10 community=storefront.tsx]
NODE deliveryOptions [src=app/storefront.tsx loc=L115 community=storefront.tsx]
NODE HeroBrandLockup() [src=app/storefront.tsx loc=L145 community=storefront.tsx]
NODE heroSourceDescriptions [src=app/storefront.tsx loc=L89 community=storefront.tsx]
NODE initialOrderForm [src=app/storefront.tsx loc=L30 community=storefront.tsx]
NODE OrderForm [src=app/storefront.tsx loc=L11 community=storefront.tsx]
NODE partnerLogos [src=app/storefront.tsx loc=L273 community=storefront.tsx]
NODE proof [src=app/storefront.tsx loc=L254 community=storefront.tsx]
NODE ShoppingMode [src=app/storefront.tsx loc=L263 community=storefront.tsx]
NODE ThemeId [src=app/storefront.tsx loc=L84 community=storefront.tsx]
NODE ThemePreference [src=app/storefront.tsx loc=L85 community=storefront.tsx]
NODE themes [src=app/storefront.tsx loc=L79 community=storefront.tsx]
NODE VkFeedItem [src=app/storefront.tsx loc=L130 community=storefront.tsx]
NODE delivery [src=server/order-api.mjs loc=L25 community=order-api.mjs]
NODE port [src=server/order-api.mjs loc=L7 community=order-api.mjs]
NODE rateLimits [src=server/order-api.mjs loc=L33 community=order-api.mjs]
EDGE app/page.tsx --imports [EXTRACTED context=import]--> Storefront() at=app/page.tsx:L1
EDGE app/page.tsx --imports_from [EXTRACTED context=import]--> storefront.tsx at=app/page.tsx:L1
EDGE app/page.tsx --contains [EXTRACTED]--> Page() at=app/page.tsx:L3
EDGE product-details.ts --contains [EXTRACTED]--> details at=app/product-details.ts:L73
EDGE storefront.tsx --imports [EXTRACTED context=import]--> products at=app/storefront.tsx:L7
EDGE products.ts --contains [EXTRACTED]--> products at=app/products.ts:L14
EDGE swiper-bundle.min.js --contains [EXTRACTED]--> Image() at=original_site/assets/js/swiper-bundle.min.js:L13
EDGE order-api.mjs --contains [EXTRACTED]--> catalog at=server/order-api.mjs:L14
EDGE Storefront() --calls [EXTRACTED context=call]--> heroEyebrow() at=app/storefront.tsx:L1207
EDGE storefront.tsx --contains [EXTRACTED]--> heroEyebrow() at=app/storefront.tsx:L108
EDGE normalize-product-packshots.mjs --contains [EXTRACTED]--> visibleHeightByVolume at=scripts/normalize-product-packshots.mjs:L11
EDGE normalize-product-packshots.mjs --contains [EXTRACTED]--> rows at=scripts/normalize-product-packshots.mjs:L22
EDGE normalize-product-packshots.mjs --contains [EXTRACTED]--> root at=scripts/normalize-product-packshots.mjs:L6
EDGE normalize-product-packshots.mjs --contains [EXTRACTED]--> outputDir at=scripts/normalize-product-packshots.mjs:L8
EDGE storefront.tsx --imports [EXTRACTED context=import]--> Product at=app/storefront.tsx:L7
EDGE products.ts --contains [EXTRACTED]--> Product at=app/products.ts:L1
EDGE Storefront() --calls [EXTRACTED context=call]--> productCardPackshot() at=app/storefront.tsx:L1016
EDGE Storefront() --calls [EXTRACTED context=call]--> productPackshot() at=app/storefront.tsx:L1135
EDGE Storefront() --calls [EXTRACTED context=call]--> heroHeadline() at=app/storefront.tsx:L1208
EDGE Storefront() --calls [EXTRACTED context=call]--> heroDescription() at=app/storefront.tsx:L1209
EDGE Storefront() --calls [EXTRACTED context=call]--> videoDuration() at=app/storefront.tsx:L1596
EDGE Storefront() --calls [EXTRACTED context=call]--> getProductDetails() at=app/storefront.tsx:L346
EDGE Storefront() --calls [EXTRACTED context=call]--> parseStoredCart() at=app/storefront.tsx:L519
EDGE Storefront() --calls [EXTRACTED context=call]--> formatPrice() at=app/storefront.tsx:L735
EDGE Storefront() --indirect_call [INFERRED context=argument]--> isVkFeedItem() at=app/storefront.tsx:L476
EDGE Storefront() --indirect_call [INFERRED context=argument]--> isCatalogProduct() at=app/storefront.tsx:L493
EDGE product-details.ts --contains [EXTRACTED]--> ProductDetails at=app/product-details.ts:L1
EDGE product-details.ts --contains [EXTRACTED]--> source() at=app/product-details.ts:L10
EDGE product-details.ts --contains [EXTRACTED]--> primaryBase at=app/product-details.ts:L12
EDGE product-details.ts --contains [EXTRACTED]--> getProductDetails() at=app/product-details.ts:L120
EDGE product-details.ts --contains [EXTRACTED]--> primaryFion at=app/product-details.ts:L20
EDGE product-details.ts --contains [EXTRACTED]--> secondaryBase at=app/product-details.ts:L28
EDGE product-details.ts --contains [EXTRACTED]--> secondaryFion at=app/product-details.ts:L36
EDGE product-details.ts --contains [EXTRACTED]--> lightFrost at=app/product-details.ts:L41
EDGE product-details.ts --contains [EXTRACTED]--> lightDep at=app/product-details.ts:L49
EDGE product-details.ts --contains [EXTRACTED]--> lightDepPro at=app/product-details.ts:L57
EDGE product-details.ts --contains [EXTRACTED]--> mildep at=app/product-details.ts:L65
EDGE storefront.tsx --imports [EXTRACTED context=import]--> ArrowIcon() at=app/storefront.tsx:L5
EDGE storefront.tsx --imports [EXTRACTED context=import]--> BagIcon() at=app/storefront.tsx:L5
EDGE storefront.tsx --imports [EXTRACTED context=import]--> CloseIcon() at=app/storefront.tsx:L5
EDGE storefront.tsx --imports [EXTRACTED context=import]--> HeartIcon() at=app/storefront.tsx:L5
EDGE storefront.tsx --imports [EXTRACTED context=import]--> MinusIcon() at=app/storefront.tsx:L5
EDGE storefront.tsx --imports [EXTRACTED context=import]--> MoonIcon() at=app/storefront.tsx:L5
EDGE storefront.tsx --imports [EXTRACTED context=import]--> PlusIcon() at=app/storefront.tsx:L5
EDGE storefront.tsx --imports [EXTRACTED context=import]--> SparkIcon() at=app/storefront.tsx:L5
EDGE storefront.tsx --imports [EXTRACTED context=import]--> SunIcon() at=app/storefront.tsx:L5
EDGE storefront.tsx --imports [EXTRACTED context=import]--> getProductDetails() at=app/storefront.tsx:L6
EDGE storefront.tsx --imports [EXTRACTED context=import]--> formatPrice() at=app/storefront.tsx:L7
EDGE storefront.tsx --imports_from [EXTRACTED context=import]--> icons.tsx at=app/storefront.tsx:L5
EDGE storefront.tsx --contains [EXTRACTED]--> DeliveryId at=app/storefront.tsx:L10
EDGE storefront.tsx --contains [EXTRACTED]--> heroHeadline() at=app/storefront.tsx:L100
EDGE storefront.tsx --contains [EXTRACTED]--> heroDescription() at=app/storefront.tsx:L104
EDGE storefront.tsx --contains [EXTRACTED]--> OrderForm at=app/storefront.tsx:L11
EDGE storefront.tsx --contains [EXTRACTED]--> deliveryOptions at=app/storefront.tsx:L115
EDGE storefront.tsx --contains [EXTRACTED]--> brandPrinciples at=app/storefront.tsx:L123
EDGE storefront.tsx --contains [EXTRACTED]--> VkFeedItem at=app/storefront.tsx:L130
EDGE storefront.tsx --contains [EXTRACTED]--> HeroBrandLockup() at=app/storefront.tsx:L145
EDGE storefront.tsx --contains [EXTRACTED]--> BrandLabel() at=app/storefront.tsx:L152
EDGE storefront.tsx --contains [EXTRACTED]--> isVkFeedItem() at=app/storefront.tsx:L159
EDGE storefront.tsx --contains [EXTRACTED]--> videoDuration() at=app/storefront.tsx:L181
EDGE storefront.tsx --contains [EXTRACTED]--> careStages at=app/storefront.tsx:L186
EDGE storefront.tsx --contains [EXTRACTED]--> CareStageId at=app/storefront.tsx:L252
EDGE storefront.tsx --contains [EXTRACTED]--> proof at=app/storefront.tsx:L254
EDGE storefront.tsx --contains [EXTRACTED]--> productPackshot() at=app/storefront.tsx:L260
EDGE storefront.tsx --contains [EXTRACTED]--> productCardPackshot() at=app/storefront.tsx:L261
EDGE storefront.tsx --contains [EXTRACTED]--> ShoppingMode at=app/storefront.tsx:L263
EDGE storefront.tsx --contains [EXTRACTED]--> CompanySection at=app/storefront.tsx:L264
EDGE storefront.tsx --contains [EXTRACTED]--> companySections at=app/storefront.tsx:L266
EDGE storefront.tsx --contains [EXTRACTED]--> partnerLogos at=app/storefront.tsx:L273
EDGE storefront.tsx --contains [EXTRACTED]--> certificateDocuments at=app/storefront.tsx:L288
EDGE storefront.tsx --contains [EXTRACTED]--> initialOrderForm at=app/storefront.tsx:L30
EDGE storefront.tsx --contains [EXTRACTED]--> parseStoredCart() at=app/storefront.tsx:L40
EDGE storefront.tsx --contains [EXTRACTED]--> isCatalogProduct() at=app/storefront.tsx:L56
EDGE storefront.tsx --contains [EXTRACTED]--> themes at=app/storefront.tsx:L79
EDGE storefront.tsx --contains [EXTRACTED]--> ThemeId at=app/storefront.tsx:L84
EDGE storefront.tsx --contains [EXTRACTED]--> ThemePreference at=app/storefront.tsx:L85
EDGE storefront.tsx --contains [EXTRACTED]--> heroSourceDescriptions at=app/storefront.tsx:L89
EDGE storefront.tsx --contains [EXTRACTED]--> CartLine at=app/storefront.tsx:L9
EDGE order-api.mjs --contains [EXTRACTED]--> createOrder() at=server/order-api.mjs:L122
EDGE order-api.mjs --contains [EXTRACTED]--> createCallback() at=server/order-api.mjs:L140
EDGE order-api.mjs --contains [EXTRACTED]--> listOrders() at=server/order-api.mjs:L169
EDGE order-api.mjs --contains [EXTRACTED]--> server at=server/order-api.mjs:L181
EDGE order-api.mjs --contains [EXTRACTED]--> delivery at=server/order-api.mjs:L25
EDGE order-api.mjs --contains [EXTRACTED]--> rateLimits at=server/order-api.mjs:L33
EDGE order-api.mjs --contains [EXTRACTED]--> json() at=server/order-api.mjs:L35
EDGE order-api.mjs --contains [EXTRACTED]--> clean() at=server/order-api.mjs:L44
EDGE order-api.mjs --contains [EXTRACTED]--> rateLimited() at=server/order-api.mjs:L48
EDGE order-api.mjs --contains [EXTRACTED]--> readBody() at=server/order-api.mjs:L56
EDGE order-api.mjs --contains [EXTRACTED]--> currentCatalog() at=server/order-api.mjs:L67
EDGE order-api.mjs --contains [EXTRACTED]--> port at=server/order-api.mjs:L7
EDGE order-api.mjs --contains [EXTRACTED]--> validateOrder() at=server/order-api.mjs:L78
EDGE products.ts --contains [EXTRACTED]--> formatPrice() at=app/products.ts:L40
EDGE icons.tsx --contains [EXTRACTED]--> SparkIcon() at=app/icons.tsx:L11
EDGE icons.tsx --contains [EXTRACTED]--> HeartIcon() at=app/icons.tsx:L15
EDGE icons.tsx --contains [EXTRACTED]--> CloseIcon() at=app/icons.tsx:L19
EDGE icons.tsx --contains [EXTRACTED]--> MinusIcon() at=app/icons.tsx:L23
EDGE icons.tsx --contains [EXTRACTED]--> PlusIcon() at=app/icons.tsx:L27
EDGE icons.tsx --contains [EXTRACTED]--> BagIcon() at=app/icons.tsx:L3
EDGE icons.tsx --contains [EXTRACTED]--> SunIcon() at=app/icons.tsx:L31
EDGE icons.tsx --contains [EXTRACTED]--> MoonIcon() at=app/icons.tsx:L35
EDGE icons.tsx --contains [EXTRACTED]--> ArrowIcon() at=app/icons.tsx:L7
EDGE storefront.tsx --imports_from [EXTRACTED context=import]--> product-details.ts at=app/storefront.tsx:L6
EDGE storefront.tsx --imports_from [EXTRACTED context=import]--> products.ts at=app/storefront.tsx:L7
EDGE storefront.tsx --contains [EXTRACTED]--> Storefront() at=app/storefront.tsx:L298
EDGE createCallback() --calls [EXTRACTED context=call]--> clean() at=server/order-api.mjs:L145
EDGE currentCatalog() --calls [EXTRACTED context=call]--> clean() at=server/order-api.mjs:L71
EDGE validateOrder() --calls [EXTRACTED context=call]--> clean() at=server/order-api.mjs:L81
EDGE createCallback() --calls [EXTRACTED context=call]--> json() at=server/order-api.mjs:L142
EDGE createCallback() --calls [EXTRACTED context=call]--> rateLimited() at=server/order-api.mjs:L142
EDGE createCallback() --calls [EXTRACTED context=call]--> readBody() at=server/order-api.mjs:L144
EDGE server --calls [EXTRACTED context=call]--> createCallback() at=server/order-api.mjs:L186
EDGE createOrder() --calls [EXTRACTED context=call]--> json() at=server/order-api.mjs:L124
EDGE createOrder() --calls [EXTRACTED context=call]--> rateLimited() at=server/order-api.mjs:L124
EDGE createOrder() --calls [EXTRACTED context=call]--> readBody() at=server/order-api.mjs:L126
EDGE createOrder() --calls [EXTRACTED context=call]--> validateOrder() at=server/order-api.mjs:L127
EDGE server --calls [EXTRACTED context=call]--> createOrder() at=server/order-api.mjs:L184
EDGE validateOrder() --calls [EXTRACTED context=call]--> currentCatalog() at=server/order-api.mjs:L88
EDGE listOrders() --calls [EXTRACTED context=call]--> json() at=server/order-api.mjs:L170
EDGE server --calls [EXTRACTED context=call]--> json() at=server/order-api.mjs:L183
EDGE server --calls [EXTRACTED context=call]--> listOrders() at=server/order-api.mjs:L185
