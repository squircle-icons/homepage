# Website validation

Run `pnpm verify` for the published-package website. Checks cover package provenance, deterministic public/featured catalogs, types, unit tests, production build and browser tests. The website routes are `/`, `/icons` and `/docs`.

`tests/unit/separation.test.mjs` guards the public-consumer boundary: no review routes, helpers, development dependency, draft catalogs or review sync tools may remain. It also checks that the vendor tarball is the one pinned by the public provenance record.

The extraction moved historical icon-review validation records to the standalone review application rather than treating those old counts as current website results.
