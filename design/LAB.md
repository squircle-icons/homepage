# Static icon lab

`/lab` is a desktop workbench for reviewing native exports from the pinned Svelte package. Motion work is paused; there is no app bar, timeline or playback control.

## Review flow

1. Select an icon in the right sidebar. All six have Outline; five also have Filled. Folder, Camera, Heart and Settings (both styles) and Search (Outline only) are owner-approved. Search intentionally has no Filled selector or comparison. Bell review is reopened for the solid Filled clapper correction. Each icon retains its style, weight, X/Y, rotation and checklist while switching in this page session.
2. Outline uses Thin (1.25), Regular / default (1.70) and Bold (2.25), plus fine adjustment. In Filled Folder these settings control its negative-space divider with a fixed outside contour. The other four filled styles use fixed solid geometry, so weight controls are hidden in their Filled view. Their layout space is retained so the icon and controls below stay stationary while switching styles; inactive controls are inert and hidden from assistive technology.
3. X and Y are independent percentages of source geometry. There is no maximum, artboard cap, aspect lock or automatic resizing when changing style or weight. Positive values from 1% are supported. Artwork may extend beyond the 24×24 grid; negative spacing and “Outside 24×24 grid” report that state.
4. Rotate around the artboard center using the degree field or ±15° buttons. Negative angles and multiple full turns are accepted. Rotation applies to the canvas, actual-size samples and style comparisons. Reset rotation returns to 0° without changing X/Y. Reset geometry restores X/Y=100%, Regular and 0°.
5. “Match Y to left spacing” remains an explicit convenience at 0°/180°. It changes Y once, without locking either axis. At other angles it is disabled because rotated asymmetric contours do not have the same spacing relationship.
6. Use Preview zoom (4×–24×, default 14×) to inspect contours without changing source X/Y, stroke or measured margins. Buttons, a slider and reset control magnification. The scrollable viewport supports keyboard panning at large zoom. Actual-size samples and comparison cards retain their own sizes. Zoom is shared while switching icons/styles, and Reset geometry leaves it unchanged.
7. Inspect measured margins and 16/20/24/48px samples on light/dark surfaces in ink/indigo. The checklist and draft adjustments are session-only and do not approve or rewrite source drawings.

The approved Folder's previous Y=110% preview was baked into its source. It now displays at 100%. Default Outline padding is 2.150 horizontal / 3.450 vertical; Filled padding is 2.125 / 3.3375. Opposite pairs may differ to preserve the object's proportions. After rotation, asymmetric silhouettes can have unequal bounding-box margins even though the rotation center remains fixed.

Follow the [core design rules](https://github.com/squircle-icons/core/blob/main/DESIGN_RULES.md). Approved changes must be authored in core and synchronized through Svelte into homepage.

## Preview ownership

`StaticIconPreview.svelte` renders package exports without copying paths. It centers unrotated native bounds, scales independently, then rotates around 12,12. Outline paths use non-scaling strokes including preview magnification. Filled Folder compensates its counter for Y scaling; its source counter is bounded to 0.25–6 units and the actual displayed gap is reported. Other filled counters are authored geometry, with no outside stroke. Filled Heart's head and the entire Filled Settings silhouette match the visible Outline exterior at Regular 1.70 and native 100% proportions. Settings also matches the visible Outline hub opening with a fixed 2.25-unit radius counter. Custom Outline weights or X/Y stretching can introduce small differences because Outline preserves its stroke while Filled geometry scales. Rotated circles use analytic ellipse bounds; paths use arc-length samples with local extremum refinement to measure the visible curves rather than transformed rectangles. Measurements are preview diagnostics, rounded to 0.001 drawing units. Source measurements happen after mount/update through a cancelable tick. No motion controllers or media-query listeners are used.

## Verification

Run `pnpm verify`. Fourteen Lab scenarios run in Chromium, Firefox and WebKit, covering SSR, actual sizes, free independent X/Y above former limits, explicit spacing matching, filled counters, weight presets, all six icons and supported styles, per-icon drafts, positive/negative/full-turn rotation, margin measurement, independent zoom and scroll containment, aligned grid/guide/SVG centers across zoom and styles, surfaces and review controls. Captures under `.artifacts/previews/` support human review; they are not pixel-comparison baselines.

## Pixel inspection

Use native 100% proportions and Regular 1.70 as the reference when comparing the authored Outline/Filled contours, then inspect actual 16/20/24px samples. Fractional preview sizes preserve Outline stroke width while scaling Filled geometry, so they can show small edge differences in addition to antialiasing. Magnification should expose shape defects, not require identical raster pixels at every zoom.

For new and revised dual-style icons, the Filled outer contour must coincide with the visible Outline exterior at native 100% and Regular 1.70: shape, size, placement and corresponding openings. Compare an overlay and switch styles without changing settings, then inspect actual sizes and a rotated pose. Matching bounding boxes alone is insufficient. Geometry mismatches must be corrected in core.

The grid frame uses an inset shadow rather than a layout border. Its 24 cells and both guides are anchored to the SVG coordinate center (12,12); the frame must not shift the artwork by a pixel.
