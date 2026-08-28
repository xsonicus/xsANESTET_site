# Current task state — ANESTET storefront

## Rule
Every correction is tracked as: requirement → implementation → verification → current status. Shared capabilities must be applied to both one-page and full modes unless explicitly scoped.

## Completed and retained
- Two production themes: Clinical Luxe (light) and Chromatic Serum (dark), auto-selected from browser preference with manual override.
- Full catalog with transparent product PNGs, product shadows, responsive two-row filters, safe product/button spacing.
- Working local cart: add, quantity, remove, clear, persistence, subtotal and WhatsApp handoff.
- One-page mode and commerce-first full mode with original-site switch.
- New Queen Key hero rotation every 4.6 seconds, direct add-to-cart and bold price.
- Separate thematic care guide; stage cards link to relevant catalog filters.
- Original MODX snapshot preserved locally without secrets.
- GitHub versioning/release history and immutable VPS releases.
- Tall portrait fix: serum halo centered; vertical note/title gap increased; 1431×1728 included in QA.
- Hero product label contrast hardened over pale halo.

## In progress
- Source-faithful About/Brand section using original text and original Alexander/about image.
- Real social links and support mailto in both site modes.
- Exact new-product badges and hero wording requested by user.
- Checkout delivery/payment selection, address fields and order handoff.
- Original navigation/content inventory and full-mode content architecture.

## External integration boundary
- 1C stock sync, live CDEK rates/PVZ selection, payment acquiring and real order submission require production credentials, API endpoints, SKU mapping and business rules.
- Legacy remains values are inconsistent (only 3 of 23 products positive); do not expose them as authoritative real-time stock.
- Until integrations are supplied, checkout may collect a complete order and delivery choice and hand it to the authorized support/order channel, but must label live quotes/payment as unavailable rather than simulate them.

## Acceptance checks
- No text, control or product overlap at the 8-screen matrix across 2 themes and 3 views.
- Keyboard focus, contrast and reduced-motion behavior pass.
- Social/support links resolve to source-verified destinations.
- New badges and hero rotation are limited to products identified as new in source content.
- Delivery/payment form validates required fields and includes them in the order handoff.
- GitHub Actions, production build, npm audit, layout QA and live browser verification pass before deploy.
