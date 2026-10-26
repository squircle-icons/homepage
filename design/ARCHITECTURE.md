# Split repository architecture

- **core** owns original SVGs, metadata, named-part motion recipes, validation, and framework-independent controller/types.
- **svelte** consumes a pinned core artifact, generates native Svelte components and internal core copies, packages exports/declarations, and validates isolated consumers, bundles, SSR/hydration, and lifecycle behavior.
- **homepage** consumes a pinned packed Svelte artifact, generates browsing metadata from its catalog export, and implements the SvelteKit website. It never copies icon implementation source.

Alpha dependencies are checked-in build artifacts, with source commit and SHA-256 recorded in `dependency-lock.json`. They are refreshed only by explicit sync commands against committed clean source checkouts. Each CI build therefore works from one repository without cross-repository credentials or a published npm dependency. The trade-off is that source updates require a reviewed sync commit in each downstream repository.

Core catalog/source exports are internal build contracts. The final public package names and license remain undecided. Later frameworks can consume the same core artifact; no other adapter is implemented yet.

Generated files are deterministic and checked against their generator. The Svelte adapter owns lifecycle and preference listeners; core owns motion styles after mount. Static imports remain isolated from animation runtime. The first six icons use no DOM IDs and motion is explicit, finite, and reduced-motion aware.
