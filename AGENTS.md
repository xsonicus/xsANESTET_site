<!-- WEBSITE_DESIGN_LAB_START -->
## Website Design Lab

- Use website-design-lab before building or materially restyling websites, landing pages and animated web experiences.
- Read the bundled UI/UX Pro Max and Anthropic Frontend Design skills for visual or motion work: use the first for evidence and the second for subject-grounded art direction and self-critique.
- Start from purpose, audience, truthful content and a subject-specific art direction; do not copy reference sites or default to generic card grids.
- Use real, supplied, searched or generated bitmap assets that reveal the actual subject. Record source/license provenance.
- Motion must support hierarchy or interaction, honor reduced-motion, preserve native navigation and stay within performance budgets.
- For local website QA, use the Codex in-app Browser against the local preview first. Do not substitute external pages or search results for rendering evidence; use external sources only for explicit research or official documentation.
- Verify desktop and mobile with browser screenshots, no-overlap/text-fit checks, console/network checks, accessibility, Lighthouse and Core Web Vitals. Missing evidence is REVIEW/BLOCK, never READY.
<!-- WEBSITE_DESIGN_LAB_END -->

## ANESTET release gate

- Before every preview or VPS release, run `npm run build && npm run qa:layout`.
- Treat any horizontal overflow, text clipping, text-to-text collision, hero-title/product collision, or product/cart-button collision as a release blocker at all eleven control widths in both approved themes.
- Do not waive the gate based on one screenshot; both automated geometry checks and visual desktop/mobile review must pass.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- PROJECT_LOGIC_GRAPH_START -->
## Project Logic Graph

Use `project-logic-graph` for projects where code logic must not be lost across prompts, branches, or compaction.

- At the start of a new project or major branch, attach `project-logic-graph` to the current project root and run `init_project`.
- Before changing important architecture, trading strategy, execution, risk, model-training, or data-processing logic, inspect the graph with `query_graph`, `path_query`, or `affected`.
- After meaningful logic changes, run `update_graph` and record the change with `write_logic_ledger`.
- If raw `graphify update` reports that HTML was skipped because the graph is too large, immediately run `split_graph`; never leave a large graph without `graphify-out/topics/*` visual slices.
- For ML/trading systems, document model weights as provenance and protocol: feature sources, training windows, validation windows, retraining cadence, leakage controls, walk-forward tests, and live/backtest parity. Do not store binary weights or raw datasets in `.codex-logic/`.
- Never store secrets, tokens, `.env` values, private sessions, raw market datasets, model checkpoints, or private keys in `.codex-logic/` or Graphify memory.

<!-- PROJECT_LOGIC_GRAPH_END -->
