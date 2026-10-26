# Static Folder lab

`/lab` is a desktop workbench for reviewing icon geometry. It imports real Outline and Filled Folder components from the pinned Svelte package. There is no app bar, mobile layout, timeline, playback control or animation controller in this page. Motion development is paused.

## Review flow

1. Choose Outline or Filled. Outline exposes stroke weight; Filled uses solid geometry and a deliberately drawn negative-space divider, with stroke controls disabled.
2. Adjust Size X and Size Y with their step buttons or number fields. These are percentages of the original source geometry, constrained to 50–115%. Link proportions when both axes should resize together. Reset geometry restores 100% / 100% and Outline weight 1.75.
3. Inspect the spacing readout. Left equals right and top equals bottom; the two pairs may differ to preserve the real object's proportions. At the source size and default Outline weight, both styles have visible left/right padding of 2.125 units and top/bottom padding of 4.125 units. Readouts include Outline stroke, and update from actual rendered SVG bounds.
4. Compare both styles at the same scale, then inspect the 16/20/24/48px samples in light and dark. Use ink or indigo and toggle grid/spacing guides as needed.
5. Use the session-only visual checklist. No selection or preview adjustment automatically approves or saves a drawing.

Follow the [core design rules](https://github.com/squircle-icons/core/blob/main/DESIGN_RULES.md). Folder is the first filled review candidate; no other filled icon is implied. Approved geometry must still be authored in core, then synchronized through Svelte into homepage.

## Preview ownership

`StaticFolderPreview.svelte` renders native package exports. It does not copy paths. Centered CSS transforms on the static groups preview independent X/Y changes. Outline paths use non-scaling strokes with the display magnification included, so stretching a shape does not stretch its selected line weight. Filled glyphs have no stroke. At non-default sizes or stroke weights, the two styles can have different outer bounds; the measured margins expose that difference.

SVG measurements happen after mount/update with a cancelable tick. There are no animation frames, motion styles/controllers, preference listeners or persistent storage. UI changes do not rewrite source SVGs or generated components.

## Verification

Run `pnpm verify`. Six Lab scenarios run in Chromium, Firefox and WebKit: static SSR/no playback, independent X/Y and preserved strokes, real filled cutouts, linked sizing/clamps/reset, surface/color/guides/review, and balanced opposite margins across styles and weights. Desktop captures are generated under `.artifacts/previews/lab-static-*.png`; they support human review and are not pixel baselines.
