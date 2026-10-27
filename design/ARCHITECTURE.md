# Split repository architecture

- **core** owns original SVGs, metadata, validation, and framework-independent types.
- **svelte** consumes a pinned core artifact, generates native Svelte components, packages exports/declarations, and validates isolated consumers, bundles, SSR/hydration, and style selection.
- **homepage** consumes an exactly pinned published Svelte npm package, generates browsing metadata from its catalog export, and implements the SvelteKit website. It never copies icon implementation source.

The homepage installs the exact npm release `0.1.0-alpha.3`. Its lockfile records npm integrity; `dependency-lock.json` also records the verified source tag, registry tarball, SHA-512 and SHA-256, with a retained copy of the released artifact and catalog snapshot. Dependency validation checks the installed version, manifest pin, artifact integrity and catalog. The source-sync command remains available for explicitly requested unreleased development builds and records a local file dependency instead. Core-to-adapter development dependencies still use checked-in build artifacts.

Core catalog/source exports are internal build contracts. The Svelte package uses the public name `@squircle-icons/svelte`. Original artwork and code use the MIT license. Later frameworks can consume the same core artifact; no other adapter is implemented yet.

Generated files are deterministic and checked against their generator. Components are static, accept presentation/accessibility props, and select separately authored Outline/Filled drawings through `style`. Direct imports remain isolated from other icons. The library uses no DOM IDs or animation runtime.

The public website has no development review package or review routes. A separate private local application owns icon/morph inspection. Its source, build, dependencies and tests are independent of this website.
