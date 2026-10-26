# Alpha validation record

Validated locally on **2026-10-26**, macOS 26 / Apple Silicon, Node.js 24.19.0, pnpm 10.10.0. This records observed checks, not production certification.

## Homepage repository

`pnpm verify` passed against the checked-in Svelte package artifact: provenance/SHA-256 verification, byte-identical catalog generation, zero Svelte errors or warnings, and a production build with four prerendered routes (`/`, `/icons`, `/docs`, `/lab`).

**Twenty-seven browser tests passed:** two website scenarios and seven static Folder lab scenarios in each of Chromium, Firefox, and WebKit. Existing website coverage includes desktop navigation, 390/700-pixel layouts and landing controls. Lab coverage includes Outline/Filled exports, genuine filled cutouts, stroke controls, independent/linked X/Y sizing, measured left-margin-derived Y limits and exact spacing matching, clamps and reset, constant stroke weight while stretching, balanced opposite margins, surface/color/guides and a session-only visual checklist. The Lab is desktop-only and has no motion controls. Static Lab captures were visually inspected as review artifacts, not pixel-comparison baselines.

The homepage imports actual package exports. It does not run the core or adapter test suites; those are independently owned by their repositories. See [core](https://github.com/squircle-icons/core/actions) for SVG/recipe validation and source tests, and [svelte](https://github.com/squircle-icons/svelte/actions) for deterministic components, types, bundle isolation, packed-consumer SSR/hydration, motion lifecycle, and visual regression checks.

## Visual inspection

The pre-split white/black/indigo landing and gallery were inspected at desktop size, the landing at mobile size, all six original icons at 16/20/24/48 pixels, and folder closed/open plus paused bell motion. Captures retained in `design/previews/` document that review; browser-specific icon geometry baselines now belong to the Svelte repository.

These establish an alpha reference, not owner approval. Review folder panel stroke overlap/weight, bell proportions, and corner softness when deciding the visual direction.

## Limits

- No manual screen-reader, physical mobile-device, touch-device, or older-browser testing has been completed. Mobile checks use browser viewport emulation.
- SSR coverage uses production prerender and browser hydration. A hosted, on-demand SSR deployment has not been tested.
- CI uses macOS 26 for consistency with visual baselines. Hosted results are visible in each repository's Actions tab.
- Final name, visual direction, and npm release policy remain pending. Original artwork and code use the MIT license. Source repositories are public, while package publication stays disabled (`private: true` and the publication guard). No website deployment or npm publication was performed.
