# ANESTET current task state

## Complete
- Releases `2026.08.28-v11` and `2026.08.28-v11.0.1` are committed, tagged, published on GitHub and deployed atomically.
- Live storefront uses source Open Sans + Unbounded, exact approved slogan, novelty-only Queen Key hero rotation, balanced product scale, source-derived About block, official social links, support mailto, full catalog and stage guide.
- Mobile/desktop cart supports quantities, five delivery options, customer/address/comment fields and server-side order creation.
- Order API is active on VPS, validates product IDs and prices, rate-limits requests, stores orders in `/var/lib/anestet/orders.jsonl`, and protects admin reads with a server-only token.
- Public QA order `AN-20260828-10DD41` verified server price recomputation; marked QA/not to process.
- Build, 8x2x3 layout matrix, TypeScript, audit, Playwright live portrait review and GitHub CI passed.

## External integration boundary
- Original safe snapshot contains MiniShop2, msCDEK2, msPyooKassa and SendIt adapters but no working secrets.
- qkcosmetic.ru resolves to a different host than the controlled VPS. No unsupported access or secret copying was attempted.
- CDEK, YooKassa, 1C/Bitrix, VK Feed and WhatsApp Business remain fail-closed until working endpoints/credentials and SKU rules are supplied. Secret variable names are documented; values must live only under `/etc/anestet/*.env`.

## Active release
- Site: `https://anestet.139-180-214-133.sslip.io/?site=full&v=20260828-v11.0.1#top`
- GitHub: `https://github.com/xsonicus/xsANESTET_site/releases/tag/2026.08.28-v11.0.1`
- Web symlink: `/var/www/anestet/releases/20260828-v11.0.1`
- API service: `anestet-order-api.service` active

## Quality evidence
- Accessibility 100, Best Practices 100, SEO 100.
- Font preloading reduced synthetic CLS from 0.186 to 0.089. Synthetic performance remains affected by the explicitly required autoplay carousel becoming a later LCP candidate; no functional or visual regression was introduced to mask the metric.


Release 2026.08.28-v11.1.0 rule: the new storefront must be autonomous. No UI link may open qkcosmetic.ru or the legacy shop. Partner, delivery/payment, certificates, contacts and support live in internal accessible tabs. External links are limited to official VK, Telegram, Taplink, WhatsApp, mail, phone and GitHub release history. Hero rotates all eight current novelties every 4.6 seconds with direct add-to-cart. All 23 catalog packshots use true alpha and normalized safe zones. Release requires build + 10-width layout QA in both themes and all three views, Playwright cart/content smoke, console clean, accessibility/Lighthouse evidence and immutable VPS rollback.
