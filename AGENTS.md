<!-- WEBSITE_DESIGN_LAB_START -->
## Website Design Lab

- Use website-design-lab before building or materially restyling websites, landing pages and animated web experiences.
- Read the bundled UI/UX Pro Max and Anthropic Frontend Design skills for visual or motion work: use the first for evidence and the second for subject-grounded art direction and self-critique.
- Start from purpose, audience, truthful content and a subject-specific art direction; do not copy reference sites or default to generic card grids.
- Use real, supplied, searched or generated bitmap assets that reveal the actual subject. Record source/license provenance.
- Motion must support hierarchy or interaction, honor reduced-motion, preserve native navigation and stay within performance budgets.
- Verify desktop and mobile with browser screenshots, no-overlap/text-fit checks, console/network checks, accessibility, Lighthouse and Core Web Vitals. Missing evidence is REVIEW/BLOCK, never READY.
<!-- WEBSITE_DESIGN_LAB_END -->

## ANESTET release gate

- Before every preview or VPS release, run `npm run build && npm run qa:layout`.
- Treat any horizontal overflow, text clipping, text-to-text collision, hero-title/product collision, or product/cart-button collision as a release blocker at all seven control widths in both light and dark themes.
- Do not waive the gate based on one screenshot; both automated geometry checks and visual desktop/mobile review must pass.
