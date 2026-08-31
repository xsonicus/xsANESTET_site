# GetLayers provenance

Release: `2026.09.01-v13.1.2`

This project uses GetLayers as a craft source for the approved QK Cosmetic Design Lab. Commerce data, product imagery, cart state and checkout remain project-owned and shared by all visual versions.

## Runtime layers

| Design | Layer | Materialization | Local artifact | Adaptation |
| --- | --- | --- | --- | --- |
| Clinical Luxury | `shoal` gradient | `dantora-style` + `porcelain-cobalt`, target `next` | `public/assets/getlayers/shoal/index.html` | Demo controls hidden; embedded as a non-interactive hero atmosphere on desktop. |
| Future Beauty | `opaline` scene | `ai-studio-style` + `cobalt-strata`, target `next` | `public/assets/getlayers/opaline/index.html` | Default dark-theme scene; demo controls hidden and Three.js imports repointed to project-local vendor files. |

Both files were materialized through the authenticated GetLayers MCP on 2026-08-31. No OAuth value, signed URL or GetLayers credential is stored in the repository.

Three.js `0.143.0` is installed as a project dependency. `scripts/sync-getlayers-three.mjs` copies the exact browser modules required by the Opaline iframe into `public/assets/getlayers/vendor/` before every production build. Production does not hotlink GetLayers or unpkg assets.

## Non-runtime design sources

- Clinical structure: `dantora-style`, retinted to the established Q&K blue rather than retaining the source mint/lime identity.
- Future Beauty composition: `halcyon-hero` framing principle with the real `opaline` scene behind the product.
- The former Beauty Editorial direction is retained only in release history and is not an active theme or runtime layer.

## Runtime safeguards

- GetLayers iframes are decorative, unfocusable and isolated from commerce controls.
- They are mounted only above 760 px and only when reduced motion is not requested.
- Product packshots, labels, prices and actions remain normal DOM content above the scene.
- CSS atmosphere remains as the static mobile and reduced-motion fallback.
- Every release still requires `npm run build && npm run qa:layout` plus desktop/mobile visual review.
