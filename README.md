# Squircle Icons · Homepage

**Alpha stage · Open source · MIT license**

The SvelteKit website for Squircle Icons: a white/black/Amber 500 landing page, icon gallery, and documentation. It consumes the published [Svelte adapter](https://github.com/squircle-icons/svelte); artwork lives in [core](https://github.com/squircle-icons/core).

![Landing preview](design/previews/landing-hero.png)

This website installs `@squircle-icons/svelte@0.1.0-alpha.3` directly from npm with an exact version and lockfile integrity. Consumers can use `npm install @squircle-icons/svelte@0.1.0-alpha.3`. A checksum-verified copy of the published tarball and its source tag are recorded in `vendor/` and `dependency-lock.json` for provenance. The released catalog includes all 20 approved icons in both Outline and Filled styles.

## Develop

Use Node.js 24.19.0 and pnpm 10.10.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Routes: `/` landing and animated icon grid, `/icons` static icon gallery, `/docs` installation/API/accessibility guide. The generated catalog is derived from the installed package metadata, while components are imported through the package's actual exports. There is no duplicate icon implementation in this repository.

## Verify

```sh
pnpm exec playwright install chromium firefox webkit
pnpm verify
pnpm preview
```

Checks include synthetic catalog/pagination boundaries, deliberate sync-failure rollback, the pinned dependency's commit/hash, catalog generation, Svelte/TypeScript diagnostics, production prerender, navigation, controls, style and preview controls, and 390/700-pixel layouts across Chromium, Firefox, and WebKit. Adapter-specific SSR/bundle/tarball checks live in the Svelte repository; source/model tests live in core.

## Update the package

For a published release, install the exact npm version, refresh the recorded registry artifact/integrity and catalog snapshot, run `pnpm generate`, and verify the site. Keep the manifest, lockfile, provenance and generated catalogs together.

For an unreleased development build, the existing source-sync workflow remains available:

```sh
pnpm sync:svelte ../svelte
```

The committed, clean Svelte checkout is checked and built, then packed into `vendor/`. The command records its commit and SHA-256 in a content-addressed artifact, refreshes the package/lockfile, and regenerates catalog imports. It rejects source changes during verification or packing. If installation, generation or provenance validation fails, it restores the previous files and dependency; if recovery also fails, it preserves a backup and reports its path. Commit the artifact, provenance, generated catalog, and lockfile together. CI only needs this repository and the public development dependencies; it does not need cross-repository tokens.

The active provenance tarball is the exact published alpha.3 npm artifact. Source-sync development artifacts are separate from npm releases. Original artwork and code are licensed under [MIT](LICENSE); third-party assets retain their own licenses. No website deployment is performed by CI. See [migration provenance](MIGRATION.md), [design notes](design/DESIGN.md), and [third-party notices](THIRD_PARTY_NOTICES.md).

The homepage imports at most twelve approved icons for its featured collection and 128-card hero grid. The grid mixes supported Outline/Filled styles and pauses for interaction or reduced motion. The header contains the brand, theme control and GitHub link. The public gallery renders up to 48 icons per page, with category and search filters applied before pagination. Gallery components are still included in the gallery route bundle; pagination bounds rendered SVGs, while per-icon package imports remain independently tree-shakable.
