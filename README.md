# Squircle Icons · Homepage

**Alpha stage · Open source · MIT license**

The SvelteKit website for Squircle Icons: a white/black/indigo landing page, icon gallery, and documentation. It consumes the real packed [Svelte adapter](https://github.com/squircle-icons/svelte); artwork and recipes live in [core](https://github.com/squircle-icons/core).

![Landing preview](design/previews/landing-hero.png)

## Develop

Use Node.js 24.19.0 and pnpm 10.10.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Routes: `/` landing and interactive playground, `/icons` gallery and motion studies, `/docs` installation/API/accessibility guide, and `/lab` the icon review workbench. The generated catalog is derived from the installed package metadata, while components are imported through the package's actual exports. There is no duplicate icon implementation in this repository.

## Verify

```sh
pnpm exec playwright install chromium firefox webkit
pnpm verify
pnpm preview
```

Checks cover the pinned dependency's commit/hash, catalog generation, Svelte/TypeScript diagnostics, production prerender, navigation, controls, playground/motion interactions, and 390/700-pixel layouts across Chromium, Firefox, and WebKit. Adapter-specific SSR/motion/bundle/tarball checks live in the Svelte repository; source/model tests live in core.

## Update the package

```sh
pnpm sync:svelte ../svelte
```

The committed, clean Svelte checkout is checked and built, then packed into `vendor/`. The command records its commit and SHA-256, refreshes the package/lockfile, and regenerates catalog imports. Commit the artifact, provenance, generated catalog, and lockfile together. CI only needs this repository and the public development dependencies; it does not need cross-repository tokens.

The included tarball is a reviewed alpha artifact, not an npm release. Original artwork and code are licensed under [MIT](LICENSE); third-party assets retain their own licenses. No website deployment is performed by CI. See [migration provenance](MIGRATION.md), [design notes](design/DESIGN.md), and [third-party notices](THIRD_PARTY_NOTICES.md).

## Icon lab

Open the desktop-only `/lab` workspace for static review. All six icons have native Outline and Filled variants. Folder is owner-approved; Camera, Bell, Heart, Search and Settings await review. Select an icon in the right sidebar and compare its 16/20/24/48px samples on light/dark surfaces with ink/indigo colors.

Outline has Thin (1.25), Regular / default (1.70) and Bold (2.25), plus fine adjustment. Filled Folder uses the same control for its inner gap; the other filled studies use fixed solid geometry. X/Y are independent positive percentages with no upper or artboard cap. Preview zoom runs from 4× to 24× (default 14×) without changing artwork or actual-size samples. Its viewport scrolls for close inspection. Rotate with a degree field or ±15° steps; the canvas, samples and comparisons stay in sync. Negative spacing reports overflow rather than preventing it. “Match Y to left spacing” is an optional one-time action at 0°/180°, not an axis lock. Per-icon drafts last for the page session. See [lab review notes](design/LAB.md).

![Folder lab desktop preview](design/previews/lab-desktop.png)
