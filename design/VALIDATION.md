# Alpha validation record

Validated locally on **2026-10-26**, macOS 26 / Apple Silicon, Node.js 24.19.0, pnpm 10.10.0. This records observed checks, not production certification.

## Homepage repository

`pnpm verify` passed against the checked-in Svelte package artifact: provenance/SHA-256 verification, byte-identical catalog generation, zero Svelte errors or warnings, and a production build with four prerendered routes (`/`, `/icons`, `/docs`, `/lab`).

**Forty-eight browser tests passed:** two website scenarios and fourteen static icon Lab scenarios in each of Chromium, Firefox and WebKit. Website checks cover desktop navigation, 390/700-pixel layouts and landing controls. Lab coverage includes six Outline icons and five supported Filled variants, fixed Filled counters and Folder's adjustable gap, presets and custom weight, free independent X/Y beyond previous caps, negative spacing, explicit spacing matching, reset, positive/negative/full-turn rotation across canvas/samples/comparisons, per-icon draft restoration, color/surfaces/guides and review controls. Style switching preserves the weight-control area, X/Y controls, canvas and optical-row position for all five dual-style icons at 1280px and 1440px widths; inactive controls are hidden from assistive technology and keyboard navigation. A rotated Search case checks tight visible bounds against an analytic circle/handle reference. Preview zoom has separate 4×–24× controls (14× default); tests verify geometry, stroke units, spacing, actual-size samples and comparison sizes remain unchanged, zoom persists across styles, reset works, and overflow stays keyboard-scrollable within the viewport. There are no Lab motion controls. Captures support human review rather than pixel comparison.

The source/adapter refresh also passed 29 core unit tests, 4 adapter unit tests, bundle isolation and tarball-consumer SSR/type/hydration checks, plus 39 adapter browser tests. Updated Outline and Filled contact sheets cover six Outline and five Filled icons at 16/20/24/48px; browser-specific baselines remain in the Svelte repository.

The homepage imports actual package exports. It does not run the core or adapter test suites; those are independently owned by their repositories. See [core](https://github.com/squircle-icons/core/actions) for SVG/recipe validation and source tests, and [svelte](https://github.com/squircle-icons/svelte/actions) for deterministic components, types, bundle isolation, packed-consumer SSR/hydration, motion lifecycle, and visual regression checks.

## Visual inspection

The pre-split white/black/indigo landing and gallery were inspected at desktop size, the landing at mobile size, all six original icons at 16/20/24/48 pixels, and folder closed/open plus paused bell motion. Captures retained in `design/previews/` document that review; browser-specific icon geometry baselines now belong to the Svelte repository.

Owner-approved artwork includes Folder and Camera in Outline/Filled, plus Search in Outline only. Search has no Filled source, export, tarball entry or Lab option. Bell, Heart and Settings remain Needs review.

Heart retains the established upper lobes. Its lower silhouette is a slim V with a very slight outward convex bow and a compact rounded tip. Tangents remain continuous and outer bounds are unchanged. Outline and Filled were inspected at 16/20/24/48px and in the Lab at 11×. The current review screenshot includes a local Y=95% preview; that sizing has not been baked into source.

For the latest Filled Heart head alignment, 29 core tests, 4 adapter unit tests, packed-consumer checks, isolated bundles, deterministic generation and all 39 adapter browser tests passed. A new pixel-profile test compares the Filled head to the visible Regular Outline exterior: top-edge positions differ by at most one raster pixel at 40× magnification (0.025 drawing units) across Chromium, Firefox and WebKit. Filled upper curves are fitted to a 0.85-unit normal offset of the existing Outline and trimmed at the symmetric notch intersection; the lower contour is unchanged.

After the grid alignment correction, the full homepage verification passed: zero Svelte errors/warnings, production build and all 48 browser cases. A new case measures the SVG (12,12) position against both axes and the drawing-box center at 4×/7×/11×/14×/24×, in both styles, with grid on/off and a fractional desktop layout. The previous layout border offset the SVG by 1 CSS pixel in both axes; the inset frame and explicit guide anchors remove that offset. Live measurements at X/Y=95% and 11× show identical drawing, SVG and guide centers. No automated check marks a drawing approved.

## Limits

- No manual screen-reader, physical mobile-device, touch-device, or older-browser testing has been completed. Mobile checks use browser viewport emulation.
- SSR coverage uses production prerender and browser hydration. A hosted, on-demand SSR deployment has not been tested.
- CI uses macOS 26 for consistency with visual baselines. Hosted results are visible in each repository's Actions tab.
- Final name, visual direction, and npm release policy remain pending. Original artwork and code use the MIT license. Source repositories are public, while package publication stays disabled (`private: true` and the publication guard). No website deployment or npm publication was performed.
