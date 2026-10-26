# Squircle Icons · Homepage

**Alpha stage · Public source · License pending**

The SvelteKit website for Squircle Icons: a white/black/indigo landing page, icon gallery, and documentation. It consumes the real packed [Svelte adapter](https://github.com/squircle-icons/svelte); artwork and recipes live in [core](https://github.com/squircle-icons/core).

![Landing preview](design/previews/landing-hero.png)

## Develop

Use Node.js 24.19.0 and pnpm 10.10.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Routes: `/` landing and interactive playground, `/icons` gallery and motion studies, `/docs` installation/API/accessibility guide. The generated catalog is derived from the installed package metadata, while components are imported through the package's actual exports. There is no duplicate icon implementation in this repository.

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

The included tarball is a reviewed alpha artifact, not an npm release. Licensing remains undecided and no website deployment is performed by CI. See [migration provenance](MIGRATION.md), [design notes](design/DESIGN.md), and [third-party notices](THIRD_PARTY_NOTICES.md).
