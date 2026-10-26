# Alpha validation record

Validated locally on **2026-10-26**, macOS 26 / Apple Silicon, Node.js 24.19.0, pnpm 10.10.0. This records observed checks, not production certification.

## Homepage repository

`pnpm verify` passed against the checked-in Svelte package artifact: provenance/SHA-256 verification, byte-identical catalog generation, zero Svelte errors or warnings, and a production build with four prerendered routes (`/`, `/icons`, `/docs`, `/lab`).

**Forty-two browser tests passed:** two website scenarios and twelve static icon Lab scenarios in each of Chromium, Firefox and WebKit. Website checks cover desktop navigation, 390/700-pixel layouts and landing controls. Lab coverage includes all six Outline/Filled pairs, fixed Filled counters and Folder's adjustable gap, presets and custom weight, free independent X/Y beyond previous caps, negative spacing, explicit spacing matching, reset, positive/negative/full-turn rotation across canvas/samples/comparisons, per-icon draft restoration, color/surfaces/guides and review controls. Style switching preserves the weight-control area, X/Y controls, canvas and optical-row position for all six icons at 1280px and 1440px widths; inactive controls are hidden from assistive technology and keyboard navigation. A rotated Search case checks tight visible bounds against an analytic circle/handle reference. There are no Lab motion controls. Captures support human review rather than pixel comparison.

The source/adapter refresh also passed 29 core unit tests, 4 adapter unit tests, bundle isolation and tarball-consumer SSR/type/hydration checks, plus 36 adapter browser tests. Updated Outline and Filled contact sheets cover all six icons at 16/20/24/48px; browser-specific baselines remain in the Svelte repository.

The homepage imports actual package exports. It does not run the core or adapter test suites; those are independently owned by their repositories. See [core](https://github.com/squircle-icons/core/actions) for SVG/recipe validation and source tests, and [svelte](https://github.com/squircle-icons/svelte/actions) for deterministic components, types, bundle isolation, packed-consumer SSR/hydration, motion lifecycle, and visual regression checks.

## Visual inspection

The pre-split white/black/indigo landing and gallery were inspected at desktop size, the landing at mobile size, all six original icons at 16/20/24/48 pixels, and folder closed/open plus paused bell motion. Captures retained in `design/previews/` document that review; browser-specific icon geometry baselines now belong to the Svelte repository.

Folder Outline and Filled were approved by the owner on 2026-10-26 at stroke 1.70 and X=100% / Y=110%; these proportions are now baked into the source. The refreshed Camera, Bell, Heart, Search and Settings pairs, rotation controls and free axes were inspected at desktop size. The five new pairs remain Needs review; no automated result or source update marks them approved.

## Limits

- No manual screen-reader, physical mobile-device, touch-device, or older-browser testing has been completed. Mobile checks use browser viewport emulation.
- SSR coverage uses production prerender and browser hydration. A hosted, on-demand SSR deployment has not been tested.
- CI uses macOS 26 for consistency with visual baselines. Hosted results are visible in each repository's Actions tab.
- Final name, visual direction, and npm release policy remain pending. Original artwork and code use the MIT license. Source repositories are public, while package publication stays disabled (`private: true` and the publication guard). No website deployment or npm publication was performed.
