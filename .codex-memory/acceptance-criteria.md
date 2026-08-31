# Acceptance criteria — current v13 correction lineage

- Only Future Beauty (dark-blue default) and Clinical Luxury (light) are selectable.
- Only one product transition exists: position-stable Prism; no animation selector or discarded names are visible.
- Opaline sphere/glow crosses the former column boundary and fades to full transparency before every scene edge; no vertical iframe seam at any QA width.
- Alexander is clearly visible and prominent in the animated about scene; the four company links are below the whole about block.
- Footer shows one readable ANESTET logo and one readable official QK Cosmetic logo, has pointer-follow light, and contains no crawling logo marquee.
- Every promoted packshot alpha contains only the physical product/box: no raster shadow, colour halo or white backplate; RGB interior/text/logos remain unchanged.
- Product shadows are subtle CSS-only contact shadows.
- Sale, favourites, persistent cart, callback, shared catalog and secure admin/integrations remain functional.
- `npm run build && npm run qa:layout` passes the 11 × 2 × 3 matrix.
- Codex Browser desktop/light/dark review confirms no broken local assets, overflow, clipping, collisions or scene seams.
- No VPS deployment without a separate explicit user request.
