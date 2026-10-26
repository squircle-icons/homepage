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

Routes: `/` landing and interactive playground, `/icons` gallery and motion studies, `/docs` installation/API/accessibility guide, and `/lab` the Folder review workbench. The generated catalog is derived from the installed package metadata, while components are imported through the package's actual exports. There is no duplicate icon implementation in this repository.

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

## Folder lab

Open the desktop-only `/lab` workspace (without the site app bar or footer) to review the first motion study: 16/20/24/48px optical checks, enlarged grid, light/dark surfaces, ink/indigo strokes, deterministic opening-timeline scrubbing, Play/Pause/Reset, speed controls, and three timing/easing studies. The real-component area exercises opt-in hover, controlled state, multiple instances, and mount/unmount. System and explicit reduced motion settle to endpoint states. The eye-test checklist is session-only.

Study A matches the installed package's current 220ms motion; B/C are lab-only experiments. The lab imports real package components and controls their WAAPI animation objects without changing SVG geometry, controller-owned styles, or public package APIs. Selecting a study does not promote it to the library. See [lab review notes](design/LAB.md).

![Folder lab desktop preview](design/previews/lab-desktop.png)
