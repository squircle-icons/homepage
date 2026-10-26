<script lang="ts">
  import '@fontsource-variable/dm-sans';
  import { page } from '$app/state';
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet } = $props();
</script>

<svelte:head
  ><title>Squircle Icons — Soft curves. Clear meaning.</title><meta
    name="description"
    content="An original icon library with considered curves, native Svelte components, and purposeful motion. First collection, in progress."
  /></svelte:head
>
<div class="site-shell">
  <header class="site-header">
    <a class="brand" href="/" aria-label="Squircle Icons home"
      ><span class="brand-symbol" aria-hidden="true"><span></span></span> squircle<span
        class="brand-word">icons</span
      ></a
    >
    <nav aria-label="Main navigation">
      <a href="/" aria-current={page.url.pathname === '/' ? 'page' : undefined}>Overview</a><a
        href="/icons"
        aria-current={page.url.pathname === '/icons' ? 'page' : undefined}
        >Icons <span class="nav-count">6</span></a
      ><a href="/docs" aria-current={page.url.pathname === '/docs' ? 'page' : undefined}>Docs</a>
    </nav>
    <div class="header-end">
      <span class="alpha-label">Alpha</span><a
        href="https://github.com/squircle-icons/homepage"
        target="_blank"
        rel="noreferrer"
        class="repo-link">GitHub <span aria-hidden="true">↗</span></a
      >
    </div>
  </header>
  <main>{@render children()}</main>
  <footer>
    <a class="footer-brand" href="/">Squircle Icons</a><span
      >Drawn with intention. Built for Svelte.</span
    ><span class="footer-note">Alpha stage · MIT license</span>
  </footer>
</div>

<style>
  :global(*) {
    box-sizing: border-box;
  }
  :global(body) {
    margin: 0;
    background: #ffffff;
    color: #18181b;
    font-family:
      'DM Sans Variable',
      ui-sans-serif,
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      sans-serif;
    font-size: 15px;
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
    outline: 3px solid #6366f1;
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
  :global(pre),
  :global(.mono) {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  }
  :global(code) {
    font-size: 0.86em;
  }
  :global(pre) {
    overflow-x: auto;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    padding: 22px;
    border: 1px solid #e4e4e7;
    background: #f4f4f5;
    border-radius: 14px;
    font-size: 12px;
    line-height: 1.9;
  }
  :global(.eyebrow) {
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-weight: 650;
    color: #71717a;
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
    background: #6366f1;
  }
  :global(.muted) {
    color: #71717a;
  }
  :global(.button) {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    border: 1px solid #e4e4e7;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 550;
    background: transparent;
    color: #27272a;
    transition: background 0.15s;
  }
  :global(.button:hover) {
    background: #f4f4f5;
  }
  :global(.button.primary) {
    background: #4f46e5;
    color: #ffffff;
    border-color: #4f46e5;
  }
  :global(.button.primary:hover) {
    background: #4338ca;
  }
  :global(.pill) {
    display: inline-flex;
    align-items: center;
    border: 1px solid #e4e4e7;
    padding: 3px 9px;
    border-radius: 6px;
    font-size: 10px;
    color: #6366f1;
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
    color: #71717a;
  }
  :global(.text-link) {
    font-size: 13px;
    font-weight: 550;
    border-bottom: 1px solid #a5b4fc;
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
    color: #71717a;
    font-size: 16px;
  }
  .site-shell {
    max-width: 1280px;
    margin: auto;
    padding: 0 48px;
  }
  .site-header {
    height: 98px;
    border-bottom: 1px solid #e4e4e7;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
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
    font-size: 13px;
    color: #71717a;
    font-weight: 450;
    letter-spacing: -0.02em;
    margin-left: -4px;
  }
  .brand-symbol {
    width: 29px;
    height: 29px;
    border-radius: 10px;
    background: #4f46e5;
    display: grid;
    place-items: center;
    transform: rotate(-4deg);
  }
  .brand-symbol span {
    width: 13px;
    height: 13px;
    border: 1.5px solid #eef2ff;
    border-radius: 5px;
  }
  .site-header nav {
    display: flex;
    gap: 30px;
    align-items: center;
    font-size: 13px;
    color: #71717a;
  }
  .site-header nav a {
    padding: 12px 0;
  }
  .site-header nav a[aria-current] {
    color: #4f46e5;
    font-weight: 600;
  }
  .nav-count {
    font-size: 10px;
    background: #eef2ff;
    color: #6366f1;
    padding: 1px 5px;
    border-radius: 4px;
    margin-left: 3px;
  }
  footer {
    display: flex;
    align-items: center;
    gap: 26px;
    border-top: 1px solid #e4e4e7;
    margin-top: 80px;
    padding: 28px 0 34px;
    color: #71717a;
    font-size: 11px;
  }
  .footer-brand {
    font-weight: 650;
    color: #27272a;
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
      flex-wrap: wrap;
      gap: 8px;
      align-content: center;
    }
    .brand {
      font-size: 18px;
    }
    .site-header nav {
      gap: 18px;
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
    height: 84px;
    border-bottom: 1px solid #eeeef2;
    background: #ffffffd9;
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }
  .brand {
    font-size: 21px;
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
      inset 0 1px #ffffff1f,
      0 2px 3px #18181b0d;
  }
  .brand-symbol span {
    border-color: #f5f5ff;
  }
  .brand-word {
    font-size: 12px;
    font-weight: 400;
    color: #92929e;
  }
  .site-header nav {
    background: #f6f6f9;
    border: 1px solid #ececf2;
    border-radius: 99px;
    padding: 4px;
    gap: 2px;
    font-size: 11px;
    box-shadow: inset 0 1px #fff;
  }
  .site-header nav a {
    padding: 7px 18px;
    border-radius: 99px;
    min-height: 32px;
    display: flex;
    align-items: center;
    gap: 6px;
    transition:
      background 0.18s,
      color 0.18s;
  }
  .site-header nav a[aria-current] {
    color: #fff;
    background: #25252a;
    font-weight: 450;
    box-shadow: 0 2px 4px #18181b14;
  }
  .nav-count {
    font-size: 8px;
    background: #ececf3;
    color: #a0a0ad;
    margin-left: 0;
    padding: 0 4px;
    line-height: 1.6;
  }
  .site-header nav a[aria-current] .nav-count {
    background: #ffffff24;
    color: #d5d5ef;
  }
  .header-end {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .alpha-label {
    font-size: 9px;
    border: 1px solid #e5e7fb;
    background: #f6f7ff;
    color: #818cf8;
    padding: 1px 7px;
    border-radius: 5px;
  }
  .repo-link {
    font-size: 11px;
    color: #7d7d89;
  }
  .repo-link > span {
    margin-left: 4px;
    color: #a5a5b5;
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
    color: #a2a2ae;
  }
  :global(.eyebrow::before) {
    width: 4px;
    height: 4px;
    background: #a5b4fc;
  }
  :global(.button) {
    border-radius: 99px;
    font-size: 12px;
    font-weight: 450;
    min-height: 40px;
    padding: 10px 19px;
    border-color: #e6e6ee;
    background: #ffffff99;
    transition:
      background 0.18s,
      transform 0.18s,
      box-shadow 0.18s;
  }
  :global(.button.primary) {
    background: #242429;
    color: #fff;
    border-color: #242429;
    box-shadow:
      inset 0 1px #ffffff16,
      0 3px 6px #18181b09;
  }
  :global(.button.primary:hover) {
    background: #37373e;
    border-color: #37373e;
  }
  :global(.button:hover) {
    background: #f6f6fb;
  }
  :global(.text-link) {
    font-size: 12px;
    font-weight: 450;
    border-color: #ddddec;
    color: #7b7b8c;
  }
  :global(.text-link:hover) {
    color: #4f46e5;
    border-color: #a5b4fc;
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
    color: #92929e;
    line-height: 1.8;
  }
  :global(.page-heading .eyebrow) {
    margin-bottom: 22px;
  }
  :global(.pill) {
    font-size: 8px;
    border-color: #e4e5f3;
    background: #fafaff;
    color: #9393b3;
    border-radius: 5px;
    padding: 2px 7px;
    letter-spacing: 0.02em;
  }
  :global(pre) {
    border-radius: 13px;
    border-color: #e6e6ee;
    background: #f7f7fa;
  }
  footer {
    margin-top: 70px;
    border-color: #eeeef3;
    color: #a1a1ad;
    font-size: 10px;
    padding: 27px 0 34px;
  }
  .footer-brand {
    color: #777786;
    font-weight: 500;
  }
  @media (max-width: 760px) {
    .site-header {
      height: 76px;
    }
    .brand {
      font-size: 18px;
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
      font-size: 10px;
    }
    .site-header nav {
      font-size: 10px;
      padding: 3px;
    }
    .site-header nav a {
      padding: 6px 12px;
      min-height: 29px;
    }
    .header-end {
      display: none;
    }
    .site-shell {
      padding: 0 20px;
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
      font-size: 9px;
      gap: 9px 18px;
    }
  }
</style>
