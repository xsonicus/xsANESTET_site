# ANESTET current task state

## Live release
- Version: `2026.08.28-v11.1.0`
- Site: `https://anestet.139-180-214-133.sslip.io/?site=full&v=20260828-v11.1.0#top`
- GitHub release: `https://github.com/xsonicus/xsANESTET_site/releases/tag/2026.08.28-v11.1.0`
- Web symlink: `/var/www/anestet/releases/20260828-v11.1.0`
- Rollback release preserved: `/var/www/anestet/releases/20260828-v11.0.1`
- Order API: active; `/api/health` HTTP 200
- Controlled production QA order: `AN-20260828-154CBD`, explicitly marked not to process.

## Complete
- New customer journey is autonomous: no customer-facing links to qkcosmetic.ru; partner, delivery/payment, certificates and contacts are internal accessible tabs.
- Hero rotates all eight current novelties every 4.6 seconds, with manual controls, proportional alpha packshots, price and direct cart action.
- All 23 product cards use normalized genuine-alpha WebP packshots; product/button safe zones and mobile filters pass.
- Working cart includes quantities, recipient data and five delivery choices; order API recomputes catalog prices server-side.
- Top VK, Telegram and Support controls work; support opens internal contacts with email.
- Two themes remain: Clinical Luxe light and Chromatic Serum navy; browser preference selects automatically.

## Release evidence
- `npm run build && npm run qa:layout` PASS: 10 widths × 2 themes × 3 views.
- GitHub CI PASS for final release source.
- Live Playwright: cart, support, version, console 0, failed requests 0.
- Live Lighthouse: Performance 95, Accessibility 100, Best Practices 100, SEO 100; TBT 3.5 ms, CLS 0.023, LCP 2529.5 ms.
- Website Design Lab: REVIEW with no blockers; sole review is LCP 29.5 ms above its strict 2500 ms threshold.
- `npm audit --omit=dev`: 0 vulnerabilities.

## External integration boundary
- CDEK live tariff/labels, YooKassa acquiring, 1C/Bitrix stock/order sync, VK feed API and WhatsApp Business API remain fail-closed until verified production endpoints, credentials and SKU rules are supplied.
- Secrets must remain server-side under `/etc/anestet/*.env`; never copy or expose keys from an unrelated or inaccessible source.

## Superseding navigation rule — v11.1.2
- The top comparison switcher must contain exactly `Старый сайт / Одностраничный / Полный сайт`.
- `Старый сайт` is the sole intentional customer-facing link to `https://qkcosmetic.ru/` and opens it in a new tab for comparison.
- All catalogue, support, company, delivery, certificate and checkout journeys inside the new storefront remain internal; no other legacy-site handoff is allowed.
