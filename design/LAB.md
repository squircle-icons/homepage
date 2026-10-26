# Static icon lab

`/lab` is a desktop workbench for reviewing native exports from the pinned Svelte package. Motion work is paused; there is no app bar, timeline or playback control.

## Review flow

1. Select an icon in the right sidebar. All six have Outline and Filled variants. Folder is owner-approved; Camera, Bell, Heart, Search and Settings are new review pairs. Each icon retains its style, weight, X/Y, rotation and checklist while switching in this page session.
2. Outline uses Thin (1.25), Regular / default (1.70) and Bold (2.25), plus fine adjustment. In Filled Folder these settings control its negative-space divider with a fixed outside contour. The other five filled studies use fixed solid geometry, so weight controls are hidden in their Filled view.
3. X and Y are independent percentages of source geometry. There is no maximum, artboard cap, aspect lock or automatic resizing when changing style or weight. Positive values from 1% are supported. Artwork may extend beyond the 24×24 grid; negative spacing and “Outside 24×24 grid” report that state.
4. Rotate around the artboard center using the degree field or ±15° buttons. Negative angles and multiple full turns are accepted. Rotation applies to the canvas, actual-size samples and style comparisons. Reset rotation returns to 0° without changing X/Y. Reset geometry restores X/Y=100%, Regular and 0°.
5. “Match Y to left spacing” remains an explicit convenience at 0°/180°. It changes Y once, without locking either axis. At other angles it is disabled because rotated asymmetric contours do not have the same spacing relationship.
6. Inspect measured margins and 16/20/24/48px samples on light/dark surfaces in ink/indigo. The checklist and draft adjustments are session-only and do not approve or rewrite source drawings.

The approved Folder's previous Y=110% preview was baked into its source. It now displays at 100%. Default Outline padding is 2.150 horizontal / 3.450 vertical; Filled padding is 2.125 / 3.3375. Opposite pairs may differ to preserve the object's proportions. After rotation, asymmetric silhouettes can have unequal bounding-box margins even though the rotation center remains fixed.

Follow the [core design rules](https://github.com/squircle-icons/core/blob/main/DESIGN_RULES.md). Approved changes must be authored in core and synchronized through Svelte into homepage.

## Preview ownership

`StaticIconPreview.svelte` renders package exports without copying paths. It centers unrotated native bounds, scales independently, then rotates around 12,12. Outline paths use non-scaling strokes including preview magnification. Filled Folder compensates its counter for Y scaling; its source counter is bounded to 0.25–6 units and the actual displayed gap is reported. Other filled counters are authored geometry, with no outside stroke. Rotated circles use analytic ellipse bounds; paths use arc-length samples with local extremum refinement to measure the visible curves rather than transformed rectangles. Measurements are preview diagnostics, rounded to 0.001 drawing units. Source measurements happen after mount/update through a cancelable tick. No motion controllers or media-query listeners are used.

## Verification

Run `pnpm verify`. Eleven Lab scenarios run in Chromium, Firefox and WebKit, covering SSR, actual sizes, free independent X/Y above former limits, explicit spacing matching, filled counters, weight presets, all six review pairs, per-icon drafts, positive/negative/full-turn rotation, margin measurement, surfaces and review controls. Captures under `.artifacts/previews/` support human review; they are not pixel-comparison baselines.
