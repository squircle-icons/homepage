# Initial design proposal

**Awaiting owner review. These are working rules, not an approved visual identity.**

Use a 24×24 drawing grid, default Regular stroke 1.70 (Thin 1.25, Bold 2.25), and approximately two drawing units of optical padding. The padding is optical rather than a rigid mathematical box; bell's clapper and heart's lobes may overshoot to balance perceived weight. Stroke scales with the SVG, with no non-scaling-stroke behavior in v1.

Use continuous Bézier transitions where a silhouette benefits from softness. Rounded caps and joins support the drawing but do not define its character by themselves. The squircle idea applies to the form, never to a compulsory frame around every symbol. Lens, search, gear, and heart retain their recognizable geometry.

| Icon     | Construction study                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------- |
| Camera   | Broad continuous body shoulders, raised shutter housing, optically lowered circular lens.                           |
| Folder   | Independent tab/back shell and a gently bowed front lid; motion reveals more of the body without morphing geometry. |
| Bell     | Full shoulders that become upright walls, a broad lip, and a separate clapper.                                      |
| Heart    | Symmetric full lobes, shallow notch, and softened lower point.                                                      |
| Search   | Circular lens with a short 45-degree handle; clarity takes priority over squareness.                                |
| Settings | Six recognizable teeth with curved shoulders and a circular central opening.                                        |

Every SVG was constructed specifically for this project. No third-party icon paths were imported or adapted. Metadata records per-icon notes; this records construction provenance, not a claim that familiar symbols can have no visual similarity to existing icons.

## Website palette

The owner selected a white, black, and amber theme. Use white surfaces, near-black icon strokes and text, neutral gray supporting text, and amber accents for selection, buttons, and motion studies. Icon consumers can still set any color or inherit `currentColor`.

## Website presentation

The website takes presentation cues from the owner’s witnd product: a fading dot grid, layered panels and soft ambient light, within Squircle’s white/black/Amber 500 palette. The current hero emphasizes soft, rounded shapes and uses an icon-only grid of real library components. Random cards fade out completely before their replacement fades in; reduced-motion preferences stop the loop, while pointer hover keeps it running and keyboard focus freezes only the focused card. The centered header navigation and Alpha pill have been removed by owner direction. Typography loads Google Sans for interface text and JetBrains Mono for code through Google Fonts, with variable weights, preconnected font origins and `display=swap`. Both families use their separate OFL-1.1 licenses. The owner also supplied [movingicons.dev](https://www.movingicons.dev/) as a landing reference. No reference artwork or implementation was copied. See LANDING.md for the current hero behavior.

## Review requested

Review the six silhouettes at 16, 20, 24, and 48 pixels. Assess consistent apparent weight, internal spacing, camera/folder corner softness, bell/clapper separation, heart balance, and gear readability. Test folder opening and the brief bell ring in `/icons`.

The default ring excursion is 12 degrees at the bell body and 16 degrees at the clapper, settling in 600 ms. Folder lid compresses around its lower pivot over 220 ms. Both timings and artwork remain alpha proposals. Stop here before adding icons or a React adapter.

## Interface colors

Use neutral black, white and gray for surfaces, navigation, framework choices, package-manager choices, style switches and weight switches. Selected controls use a black surface with white text in Light, and a white surface with black text in Dark. Keep numeric control values neutral. Use Amber 500 for primary CTAs, range progress and focus accents; syntax highlighting has its own readable palette.
