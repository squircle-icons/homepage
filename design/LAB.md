# Static icon lab

`/lab` is a desktop workbench for reviewing geometry using native exports from the pinned Svelte package. Motion work is paused; there is no app bar, timeline, or playback control.

## Review flow

1. Select an icon from the right sidebar. Folder Outline and Filled are owner-approved; the remaining five Outline icons await review. Filled is disabled until a separately authored variant exists. Each icon retains its current draft settings while switching within this page session.
2. Select Thin (1.25), Regular / default (1.70), or Bold (2.25). The slider and step buttons retain fine adjustment. In Outline this controls line weight; in Filled Folder it controls the negative-space divider while the outside contour stays fixed.
3. Adjust X/Y independently or link proportions. Values are percentages of the source. Reset restores 100% / 100% and Regular. The approved Folder's earlier Y=110% preview has been baked into its source, so its approved shape now displays at 100%.
4. Use the left margin as the Y reference. The Y limit makes top/bottom equal left/right; “Match Y to left spacing” sets the exact value. X is limited by the artboard and stroke. Linked resizing preserves the current ratio within the artboard.
5. Inspect measured spacing and actual-size 16/20/24/48px samples. Opposite sides match in pairs; horizontal and vertical padding may differ to preserve the object's proportions. At default size, approved Outline Folder has 2.150 horizontal and 3.450 vertical padding; Filled has 2.125 and 3.3375 respectively.
6. Compare available styles on light/dark surfaces, with ink/indigo colors. The visual checklist and draft adjustments are session-only. They do not approve or rewrite source artwork.

Follow the [core design rules](https://github.com/squircle-icons/core/blob/main/DESIGN_RULES.md). New approved geometry must be authored in core and synchronized through Svelte into homepage.

## Preview ownership

`StaticIconPreview.svelte` renders package exports without copying paths. It centers native artwork bounds and applies X/Y transforms only in the preview. Outline paths use non-scaling strokes including display magnification. Filled Folder's validated counter compensates for Y scaling to retain the chosen gap; at extreme heights the source gap is bounded to 0.25–6 units and the readout reports the actual gap. Source measurements happen after mount/update through a cancelable tick. There are no motion controllers or media-query listeners.

## Verification

Run `pnpm verify`. Nine Lab scenarios run in Chromium, Firefox and WebKit, covering SSR, actual-size samples, independent and linked sizing, balanced margins, geometry-derived limits, filled counters, presets and fine adjustment, sidebar switching and per-icon drafts, surfaces and review controls. Captures under `.artifacts/previews/` support human review; they are not pixel-comparison baselines.
