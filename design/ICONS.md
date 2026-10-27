# Icon gallery

The `/icons` page uses a search field and compact buttons with one centered 24px
package component and its name. The introduction, optical comparison strip and
page footer are omitted here. Other routes keep their existing layout.

Selecting an icon opens a floating card at the bottom of the gallery column, with
24px of space below it and padding on all sides. The native dialog is nonmodal:
there is no backdrop, background scroll lock or keyboard focus trap. The gallery
and external controls stay interactive. Close and Escape dismiss the card and
restore focus to the selected icon, including after search rerenders its button.
Pointer entry slides upward with a 320ms transform/opacity transition. Dismissal
slides downward and fades out over 220ms when motion is enabled. Selecting another
icon during dismissal cancels the pending close. Keyboard entry and reduced motion
show the card immediately; reduced-motion changes during dismissal settle it
immediately. Animations and preference listeners are cleaned up on teardown.

Style, export size, stroke/gap and color controls live in a separate right sidebar,
which is 300px wide on desktop and sticks below the site header while scrolling. The floating drawer uses the same column width so it remains aligned with the gallery. Export size uses a 16–64px
slider in 4px steps. Style and stroke presets use rounded pill controls with a
220ms sliding selection background; reduced motion disables those transitions. Text throughout this gallery,
its sidebar and export card uses 14px. Header navigation and GitHub are 14px; the shared brand wordmark is 20px on every public route. Use 14px as the default for future
interface text unless the user specifies another size. Gallery icons start at 24px and follow the sidebar size, stroke and color controls.
The primary website accent is Tailwind Amber 500, defined once
as `--color-amber-500` in `src/lib/theme.css` and shared by all routes.

The drawer supports Outline/Filled where the package catalog provides both styles.
Search remains outline only. Export size, color and applicable stroke/gap controls
affect both the exported artwork and the actual icon components in the gallery.
Filled selection applies to supported icons; outline-only icons retain their outline. The preview is
a square that matches the combined height of the action buttons and code block
on desktop. Narrower layouts stack these areas. The static hint below the code is
omitted; copy/download feedback appears only after an action.

- **Download SVG** creates a local `.svg` file from the rendered package component.
- **Copy SVG** copies the same serialized SVG. Hydration comments are removed and
  the selected output dimensions and accessible name are included.
- **Copy for Svelte** copies a per-icon npm import and usage example, including the
  selected style and presentation props. It requires `@squircle-icons/svelte` in the
  consuming project.

Clipboard feedback reports success only after writing succeeds. Denied/unavailable
clipboard access produces an actionable error. SVG generation and clipboard access
run only after a user action in the browser.

`tools/generate-catalog.ts` generates the approved-icon public catalog and the twelve-icon featured catalog from the published Svelte dependency. The website owns no draft review catalog or development artifact.

## Verification

Run `pnpm generate:check`, `pnpm dependency:check`, `pnpm check`, `pnpm test:unit`,
`pnpm build`, then `pnpm test`.
The alpha.1 update passed all 90 browser checks across Chromium, Firefox and
WebKit, including gallery, landing, and docs. Six unit tests also passed. It covers geometry and presentation preservation in SVG exports, downloads,
Svelte snippets, clipboard denial, search, style availability, focus restoration,
nonmodal interaction, sticky controls, 14px text, dismissal, deep links, reduced
motion and viewport containment. Clipboard tests use an isolated browser stub and do not overwrite the user's clipboard.

The website installs the exact published npm package `@squircle-icons/svelte@0.1.0-alpha.1`.
Its published catalog contains eight approved icons. Changes remain local while
other package work is in progress in the shared checkout.

The search field is fully rounded and uses the surface color (white in Light). Category tabs share a padded, rounded secondary background; the selected tab retains the neutral black/white treatment.
