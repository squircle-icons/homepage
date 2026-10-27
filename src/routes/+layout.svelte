<script lang="ts">
  import '#lib/theme.css';
  import ThemeMenu from '#lib/components/ThemeMenu.svelte';
  import { page } from '$app/state';
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet } = $props();
  const isIcons = $derived(page.url.pathname === '/icons');
</script>

<svelte:head
  ><title>Squircle Icons — Soft edges. Rounded character.</title><meta
    name="description"
    content="An original icon library with considered curves, native Svelte components, and Outline/Filled styles. First collection, in progress."
  /></svelte:head
>
<header class="site-header">
  <div class="header-content">
    <a class="brand" href="/" aria-label="Squircle Icons home"
      ><span class="brand-symbol" aria-hidden="true"><span></span></span> squircle<span
        class="brand-word">icons</span
      ></a
    >
    <div class="header-end">
      <nav aria-label="Main navigation">
        <a href="/icons" aria-current={isIcons ? 'page' : undefined}>Icons</a>
        <a href="/docs" aria-current={page.url.pathname === '/docs' ? 'page' : undefined}>Docs</a>
      </nav>
      <ThemeMenu /><a
        href="https://github.com/squircle-icons/homepage"
        target="_blank"
        rel="noreferrer"
        class="repo-link">GitHub</a
      >
    </div>
  </div>
</header>
<div class="site-shell" class:docs-shell={page.url.pathname === '/docs'}>
  <main>{@render children()}</main>
  {#if !isIcons}
    <footer>
      <div class="footer-identity">
        <a class="footer-brand" href="/">© 2026 Squircle Icons</a>
      </div>
      <span>made with 🧡 by palamto</span>
      <a class="footer-note" href="https://github.com/squircle-icons/homepage/blob/main/LICENSE"
        >MIT license</a
      >
    </footer>
  {/if}
</div>

<style>
  :global(:root) {
    --site-header-height: 92px;
  }
  .site-shell.docs-shell footer,
  .site-shell.docs-shell footer :is(a, span) {
    font-size: 14px;
  }
  :global(*) {
    box-sizing: border-box;
  }
  :global(body) {
    margin: 0;
    background: var(--page);
    color: var(--text);
    font-family:
      'Google Sans',
      ui-sans-serif,
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      sans-serif;
    font-size: 14px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  :global(button),
  :global(input),
  :global(select) {
    font: inherit;
  }
  :global(a) {
    color: inherit;
    text-decoration: none;
  }
  :global(button),
  :global(a),
  :global(input),
  :global(select) {
    -webkit-tap-highlight-color: transparent;
  }
  :global(button) {
    cursor: pointer;
  }
  :global(button:focus-visible),
  :global(a:focus-visible),
  :global(input:focus-visible),
  :global(select:focus-visible) {
    outline: 3px solid var(--color-amber-500);
    outline-offset: 4px;
  }
  :global(h1),
  :global(h2),
  :global(h3),
  :global(p) {
    margin-top: 0;
  }
  :global(h1) {
    font-size: clamp(40px, 5vw, 72px);
    line-height: 1.07;
    letter-spacing: -0.06em;
    font-weight: 550;
  }
  :global(h2) {
    font-size: 30px;
    line-height: 1.25;
    letter-spacing: -0.04em;
    font-weight: 550;
  }
  :global(h3) {
    font-weight: 550;
    letter-spacing: -0.02em;
  }
  :global(code),
  :global(pre) {
    font-family: 'JetBrains Mono', ui-monospace, 'SFMono-Regular', Consolas, monospace;
  }
  :global(.mono) {
    font-variant-numeric: tabular-nums;
  }
  :global(code) {
    font-size: 0.86em;
  }
  :global(pre) {
    overflow-x: auto;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    padding: 22px;
    border: 1px solid var(--border);
    background: var(--surface-subtle);
    border-radius: var(--radius-card);
    font-size: 12px;
    line-height: 1.9;
  }
  :global(.eyebrow) {
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-weight: 650;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 24px;
  }
  :global(.eyebrow::before) {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-amber-500);
  }
  :global(.muted) {
    color: var(--muted);
  }
  :global(.button) {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    border: 1px solid var(--border);
    border-radius: 10px;
    font-size: 13px;
    font-weight: 550;
    background: transparent;
    color: var(--text);
    transition: background 0.15s;
  }
  :global(.button:hover) {
    background: var(--surface-subtle);
  }
  :global(.button.primary) {
    background: var(--color-amber-500);
    color: var(--accent-foreground);
    border-color: var(--color-amber-500);
  }
  :global(.button.primary:hover) {
    background: var(--color-amber-500);
  }
  :global(.pill) {
    display: inline-flex;
    align-items: center;
    border: 1px solid var(--border);
    padding: 3px 9px;
    border-radius: 6px;
    font-size: 10px;
    color: var(--accent-text);
    letter-spacing: 0.03em;
  }
  :global(.section-head) {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 26px;
  }
  :global(.section-head h2) {
    margin: 0;
  }
  :global(.section-head p) {
    margin: 8px 0 0;
    font-size: 14px;
    color: var(--muted);
  }
  :global(.text-link) {
    font-size: 13px;
    font-weight: 550;
    border-bottom: 1px solid var(--color-amber-500);
    padding-bottom: 3px;
  }
  :global(.page-heading) {
    padding: 58px 0 38px;
  }
  :global(.page-heading h1) {
    font-size: 52px;
    margin-bottom: 18px;
  }
  :global(.page-heading p) {
    max-width: 580px;
    color: var(--muted);
    font-size: 16px;
  }
  .site-shell {
    max-width: 1280px;
    margin: auto;
    padding: 0 48px;
  }
  .site-header {
    height: 98px;
    border-bottom: 1px solid var(--border);
  }
  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    height: 64px;
    width: 100%;
    max-width: 1280px;
    padding: 0 48px;
    margin: auto;
    border-radius: 999px;
    background: color-mix(in srgb, var(--surface) 45%, transparent);
    -webkit-backdrop-filter: blur(20px);
    backdrop-filter: blur(20px);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--text) 6%, transparent);
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 20px;
    font-weight: 650;
    letter-spacing: -0.06em;
  }
  .brand-word {
    font-size: 20px;
    color: var(--muted);
    font-weight: 450;
    letter-spacing: -0.02em;
    margin-left: -4px;
  }
  .brand-symbol {
    width: 29px;
    height: 29px;
    border-radius: 10px;
    background: var(--color-amber-500);
    display: grid;
    place-items: center;
    transform: rotate(-4deg);
  }
  .brand-symbol span {
    width: 13px;
    height: 13px;
    border: 1.5px solid var(--border);
    border-radius: 5px;
  }
  footer {
    display: flex;
    align-items: center;
    gap: 26px;
    border-top: 1px solid var(--border);
    margin-top: 80px;
    padding: 28px 0 34px;
    color: var(--muted);
    font-size: 14px;
  }
  .footer-identity {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 14px;
  }
  .footer-brand {
    font-weight: 650;
    color: var(--text);
  }
  .footer-note {
    margin-left: auto;
  }
  @media (max-width: 760px) {
    .site-shell {
      padding: 0 22px;
    }
    .site-header {
      height: 80px;
    }
    .header-content {
      padding: 0 22px;
      flex-wrap: wrap;
      gap: 8px;
      align-content: center;
    }
    .brand {
      font-size: 20px;
    }
    footer {
      flex-wrap: wrap;
      gap: 8px 20px;
    }
    .footer-note {
      margin-left: 0;
      width: 100%;
    }
    :global(.page-heading) {
      padding-top: 38px;
    }
    :global(.page-heading h1) {
      font-size: 42px;
    }
    :global(.section-head) {
      align-items: flex-start;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    :global(*) {
      scroll-behavior: auto !important;
      transition: none !important;
    }
  }

  .site-header {
    position: sticky;
    top: 0;
    z-index: 30;
    height: var(--site-header-height);
    padding: 14px 24px;
    border: 0;
    background: transparent;
  }
  .brand {
    font-size: 20px;
    letter-spacing: -0.065em;
    font-weight: 650;
    gap: 10px;
  }
  .brand-symbol {
    width: 29px;
    height: 29px;
    background: #232328;
    border-radius: 10px;
    transform: rotate(-5deg);
    box-shadow:
      inset 0 1px color-mix(in srgb, var(--edge-highlight) 12.16%, transparent),
      0 2px 3px #18181b0d;
  }
  .brand-symbol span {
    border-color: var(--border);
  }
  .brand-word {
    font-size: 20px;
    font-weight: 400;
    color: var(--faint);
  }
  .header-end {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .header-end nav {
    display: flex;
    align-items: center;
    gap: 24px;
  }
  .header-end nav a {
    font-size: 14px;
    color: var(--muted);
    transition: color 150ms;
  }
  .header-end nav a:hover,
  .header-end nav a[aria-current='page'] {
    color: var(--text);
  }
  .repo-link {
    font-size: 14px;
    color: var(--muted);
  }
  :global(h1),
  :global(h2),
  :global(h3) {
    font-weight: 500;
  }
  :global(h2) {
    letter-spacing: -0.04em;
  }
  :global(.eyebrow) {
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.12em;
    gap: 8px;
    color: var(--faint);
  }
  :global(.eyebrow::before) {
    width: 4px;
    height: 4px;
    background: var(--color-amber-500);
  }
  :global(.button) {
    border-radius: 99px;
    font-size: 12px;
    font-weight: 450;
    min-height: 40px;
    padding: 10px 19px;
    border-color: var(--border);
    background: color-mix(in srgb, var(--surface) 60%, transparent);
    transition:
      background 0.18s,
      transform 0.18s,
      box-shadow 0.18s;
  }
  :global(.button.primary) {
    background: var(--color-amber-500);
    color: var(--accent-foreground);
    border-color: var(--color-amber-500);
    box-shadow:
      inset 0 1px color-mix(in srgb, var(--edge-highlight) 8.63%, transparent),
      0 3px 6px #18181b09;
  }
  :global(.button.primary:hover) {
    background: color-mix(in oklab, var(--color-amber-500) 92%, black);
    border-color: color-mix(in oklab, var(--color-amber-500) 92%, black);
  }
  :global(.button:hover) {
    background: var(--surface-subtle);
  }
  :global(.text-link) {
    font-size: 12px;
    font-weight: 450;
    border-color: var(--border);
    color: var(--muted);
  }
  :global(.text-link:hover) {
    color: var(--accent-text);
    border-color: var(--color-amber-500);
  }
  :global(.page-heading) {
    padding: 57px 0 38px;
    position: relative;
  }
  :global(.page-heading h1) {
    font-size: 53px;
    letter-spacing: -0.05em;
    font-weight: 500;
    line-height: 1.08;
    margin-bottom: 20px;
  }
  :global(.page-heading p) {
    font-size: 15px;
    color: var(--faint);
    line-height: 1.8;
  }
  :global(.page-heading .eyebrow) {
    margin-bottom: 22px;
  }
  :global(.pill) {
    font-size: 8px;
    border-color: var(--border);
    background: var(--surface);
    color: var(--faint);
    border-radius: 5px;
    padding: 2px 7px;
    letter-spacing: 0.02em;
  }
  :global(pre) {
    border-radius: var(--radius-card);
    border-color: var(--border);
    background: var(--surface-subtle);
  }
  footer {
    margin-top: 70px;
    border-color: var(--border);
    color: var(--muted);
    font-size: 14px;
    padding: 27px 0 34px;
  }
  .footer-brand {
    color: var(--muted);
    font-weight: 500;
  }
  @media (max-width: 760px) {
    :global(:root) {
      --site-header-height: 84px;
    }
    .site-header {
      height: var(--site-header-height);
      padding: 14px 16px;
    }
    .brand {
      font-size: 20px;
      gap: 8px;
    }
    .brand-symbol {
      height: 25px;
      width: 25px;
      border-radius: 9px;
    }
    .brand-symbol span {
      width: 12px;
      height: 12px;
    }
    .brand-word {
      font-size: 20px;
    }
    .header-end {
      display: none;
    }
    .site-shell,
    .header-content {
      padding: 0 20px;
    }
    .header-content {
      height: 56px;
    }
    :global(.page-heading) {
      padding-top: 37px;
    }
    :global(.page-heading h1) {
      font-size: 40px;
    }
    :global(.page-heading p) {
      font-size: 13px;
      max-width: 330px;
    }
    footer {
      margin-top: 50px;
      font-size: 14px;
      gap: 9px 18px;
    }
  }
</style>
