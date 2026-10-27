# Menu ↔ X and Plus ↔ Minus — review record

Status: ready for owner visual review, 2026-10-27. Motion approval remains pending
for both pairs. Follow the canonical [morph playbook](../../../core/MORPH.md).

## Goal and design

- Menu ↔ X retains its authored outer-bar-to-diagonal mapping, shrinking middle
  bar and separately authored Filled topology bridge, at0.6× shared spring rate.
- Plus ↔ Minus folds the vertical arm onto a fixed horizontal arm at0.6×. Filled
  cuts out the exact analytical union of those moving Regular1.75 strokes.
- Both use current source endpoints. Boxed math Filled endpoints explicitly select
  Square; standalone math Filled remains Bold. The radius4 frame stays upright.
- Shared critically damped progress preserves position and velocity on reversal.
  Reduced motion selects endpoints directly. Both pages include manual scrubbing,
  loop, slow playback and16/20/24/48/96px inspection samples.

## Source and provenance

- Core: `bbaa2e894cadb738675c66f1b957415a248790f7`.
- Adapter: `11a46e3bd69264d0bf2c9a362595918bda235196`.
- The Lab pins this adapter independently in `lab-dependency-lock.json`.
- The approved Plus X function was sampled at101 progress positions before and
  after extracting the shared pure capsule-union helper: every frame matched
  exactly. All static core source data also matched the recorded baseline.
- Exact JSON/hash comparisons confirm all33 Lab identities, their frames, styles
  and review metadata, authored components, public package pin and public
  provenance were preserved. Unrelated working-tree documentation remains intact.

## Automated evidence

- Core `pnpm verify`: passed;80 unit tests across6 files.
- Adapter `pnpm verify`: passed;28 unit tests and321 browser cases. This includes
  package installation/declarations, static import checks, Svelte5.0 compilation
  and hydration, plus Chromium, Firefox and WebKit.
- Packed morph checks cover both styles at both endpoints, source bounds,
  exact Outline/Filled hole correspondence, mid-flight reversal, pace, manual
  scrubbing, reduced motion, hidden-tab pause/resume and unmount/remount cleanup.
- Homepage `pnpm verify`: formatting, provenance, generation, type checks, unit
  tests and production build passed. Browser suite:300 passed,12 failed.
- Every Menu X and Plus Minus homepage case passed in all three browser engines,
  including endpoints/styles, reversal, scrubbing, pair navigation, reduced motion
  and390/1280px widths.
- The12 full-site failures are outside these morph routes: Docs source-text
  expectation, Gallery drawer overflow, public-page mobile containment, and the
  landing light-motion assertion, each across3 engines. Full-site verification
  is therefore not green; these checks were not waived or changed for this work.

## Visual evidence and preview

Both updated routes were opened and visibly confirmed in the in-app browser:

- Menu ↔ X: `http://127.0.0.1:5175/lab/morph/menu-x`.
- Plus ↔ Minus: `http://127.0.0.1:5175/lab/morph/plus-minus`.

Screenshots in `.artifacts/morph-review/` capture the actual packed Lab components:
`menu-x-filled-light.jpg`, `plus-minus-outline-light.jpg`,
`plus-minus-filled-dark.jpg` and `plus-minus-preview.jpg`.
Manual inspection included intermediate silhouettes, current static endpoint
comparisons, light/dark rendering and actual-size samples. Automated raster and
geometry checks supplement this inspection; they do not establish owner approval.
