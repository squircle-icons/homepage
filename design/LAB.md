# Folder motion lab

`/lab` is a desktop review workbench without the site app bar or footer for the existing Folder, using real exports from the pinned Svelte artifact. Other icon choices are explicitly unavailable until they have a study. No library geometry or motion recipe is changed by this page.

The workspace uses a fixed desktop layout. Additional behavior and visual-check tools are under the “Behavior & review” disclosure.

## Review flow

1. Inspect closed/open silhouettes and 16/20/24/48px optical sizes in light and dark.
2. Play the enlarged preview, slow it to 0.5× or 0.25×, then scrub the opening timeline. Scrubbing pauses at an exact animation time; Play resumes. Reset returns to closed.
3. Compare A (current 220ms library easing), B (280ms with more gradual acceleration), and C (160ms with an early settle). Play all for simultaneous playback, then select a study for the main timeline. Selection is local and resets the main preview.
4. Use the real-component area to try hover, repeated controlled-state changes, three synchronized instances, and unmount/remount. Reset every instance also clears hover and controlled state.
5. Review reduced motion. System preference cannot be overridden; the explicit checkbox adds reduced motion. Playback and scrubbing are disabled while reduced, with both endpoint controls available.

The review checklist records only this page session, with no persistence or automatic approval. A chosen experiment must be implemented in core, synchronized into Svelte, tested there, and then synced back into homepage before it becomes the shipped motion.

## Ownership and cleanup

`FolderStudy.svelte` wraps the actual animated Folder. The package controller owns SVG transforms. The lab modifies only its existing Animation object's timing, playback rate and currentTime. It never copies paths or writes group styles. A browser contract checks that study A's native duration/easing still match the pinned package, so dependency changes cannot silently relabel an experiment as the current default.

No motion autoplays or loops. UI animation progress is observed only during playback; the frame callback is stopped on pause/reset/reduced motion/destroy. A scoped MutationObserver updates the timeline readout. Both it and the system-preference listener are removed on teardown. An operation counter prevents pending asynchronous controls from reviving a reset or disposed study. Missing animation support retains endpoint inspection.

## Verification

Run `pnpm verify`. Lab browser tests exercise six scenarios in Chromium, Firefox, and WebKit, including production prerender, no autoplay, 1280/1440px desktop fit, precise paused times, real component exports, comparison timings, interruption, reduced motion and cleanup. Captures are generated under `.artifacts/previews/lab-*.png`; visual approval remains a human decision.
