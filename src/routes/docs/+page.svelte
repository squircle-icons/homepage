<script lang="ts">
  import { onMount } from 'svelte';
  import Copy from '@squircle-icons/svelte/copy';
  import Check from '@squircle-icons/svelte/check';
  import CodeExample from '#lib/components/CodeExample.svelte';
  import { iconCount, strokeWeights } from '#lib/catalog-count.js';

  const sections = [
    { id: 'installation', label: 'Getting started' },
    { id: 'static', label: 'Using icons' },
    { id: 'props', label: 'Component props' },
    { id: 'accessibility', label: 'Accessibility' },
    { id: 'contributing', label: 'Contributing' },
  ];
  const scrollOffset = 108;
  const commands = {
    npm: 'npm install @squircle-icons/svelte@alpha',
    pnpm: 'pnpm add @squircle-icons/svelte@alpha',
  };
  let manager = $state<'npm' | 'pnpm'>('npm');
  let activeSection = $state('installation');
  let toc = $state<HTMLElement>();
  let highlight = $state({ left: 0, top: 0, width: 0, height: 0 });
  let copyState = $state<'idle' | 'copying' | 'copied' | 'error'>('idle');
  let copyOperation = 0;
  const installCommand = $derived(commands[manager]);

  function selectManager(value: 'npm' | 'pnpm') {
    manager = value;
    copyOperation++;
    copyState = 'idle';
  }
  async function copyInstall() {
    const operation = ++copyOperation;
    copyState = 'copying';
    try {
      await navigator.clipboard.writeText(installCommand);
      if (operation === copyOperation) copyState = 'copied';
    } catch {
      if (operation === copyOperation) copyState = 'error';
    }
  }
  onMount(() => {
    const elements = sections.map(({ id }) => document.getElementById(id)!);
    let frame = 0;
    let mounted = true;
    const update = () => {
      frame = 0;
      const atBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      let current = sections[0].id;
      for (const element of elements) {
        if (element.getBoundingClientRect().top <= scrollOffset + 1) current = element.id;
      }
      activeSection = atBottom ? sections.at(-1)!.id : current;
      const link = toc?.querySelector<HTMLAnchorElement>(`a[href="#${activeSection}"]`);
      if (link)
        highlight = {
          left: link.offsetLeft,
          top: link.offsetTop,
          width: link.offsetWidth,
          height: link.offsetHeight,
        };
    };
    const schedule = () => {
      if (mounted && !frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.querySelector('.docs-content')!);
    void document.fonts.ready.then(schedule);
    schedule();
    return () => {
      mounted = false;
      copyOperation++;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  });

  const frameworks = [
    { name: 'Svelte', available: true },
    { name: 'React', available: false },
    { name: 'Vue', available: false },
    { name: 'Angular', available: false },
  ];
  const usageCode =
    '<script lang="ts">\n  import Camera from \'@squircle-icons/svelte/camera\';\n<\/script>\n\n' +
    '<!-- Size: 24px by default -->\n<Camera />\n<Camera size={32} />\n\n' +
    '<!-- Style: outline by default -->\n<Camera style="outline" />\n<Camera style="filled" />\n\n' +
    `<!-- Stroke: regular (${strokeWeights.regular.toFixed(2)}) by default -->\n<Camera strokeWidth="thin" />\n<Camera strokeWidth="regular" />\n<Camera strokeWidth="bold" />`;
  const examples = [
    '<!-- The button already has a name; the icon is decorative. -->\n<button aria-label="Take a photo"><Camera /></button>\n\n<!-- The icon itself conveys meaning. -->\n<Camera label="Camera available" />',
  ];
</script>

<svelte:head><title>Documentation — Squircle Icons</title></svelte:head>
<h1 class="sr-only">Documentation</h1>
<div class="docs-layout" style:--docs-scroll-offset={`${scrollOffset}px`}>
  <nav
    aria-label="Documentation sections"
    bind:this={toc}
    class:has-highlight={highlight.height > 0}
  >
    <div
      class="toc-highlight"
      aria-hidden="true"
      style:transform={`translate(${highlight.left}px, ${highlight.top}px)`}
      style:width={`${highlight.width}px`}
      style:height={`${highlight.height}px`}
    ></div>
    <span class="mono">ON THIS PAGE</span>
    {#each sections as section}
      <a
        href={'#' + section.id}
        aria-current={activeSection === section.id ? 'location' : undefined}
        onclick={() => (activeSection = section.id)}>{section.label}</a
      >
    {/each}
  </nav>
  <div class="docs-content">
    <section id="installation">
      <h2>Getting started</h2>
      <div class="framework-choices" role="group" aria-label="Framework">
        {#each frameworks as framework}
          <button
            aria-pressed={framework.available}
            disabled={!framework.available}
            title={framework.available ? 'Svelte documentation' : 'Coming soon'}
            aria-label={framework.available ? framework.name : `${framework.name} — coming soon`}
            >{framework.name}</button
          >
        {/each}
      </div>
      <p class="framework-status">
        Svelte is available now. React, Vue and Angular are coming later.
      </p>
      <h3 class="requirements-heading">Recommended</h3>
      <ul class="requirements" aria-label="Recommended setup">
        <li>Svelte 5.0.0+ (version 5)</li>
        <li>Node.js 22+ (maintained LTS releases)</li>
        <li>npm 10+</li>
      </ul>
      <p>Use a Node.js version that meets the requirements of your chosen npm release.</p>
      <div class="install-command" role="group" aria-label="Install package">
        <div class="install-toolbar">
          <div
            class="package-managers"
            role="group"
            aria-label="Package manager"
            style:--manager-index={manager === 'pnpm' ? 1 : 0}
          >
            {#each ['npm', 'pnpm'] as const as value}
              <button aria-pressed={manager === value} onclick={() => selectManager(value)}
                >{value}</button
              >
            {/each}
          </div>
          <button
            class="copy-button"
            aria-label="Copy install command"
            title={copyState === 'copied' ? 'Copied' : 'Copy install command'}
            aria-busy={copyState === 'copying'}
            disabled={copyState === 'copying'}
            onclick={copyInstall}
          >
            {#if copyState === 'copied'}<Check size={18} />{:else}<Copy size={18} />{/if}
          </button>
        </div>
        <pre><code>{installCommand}</code></pre>
      </div>
      <p class="sr-only" role="status">
        {copyState === 'copied' ? `${manager} command copied.` : ''}
      </p>
      {#if copyState === 'error'}
        <p class="copy-error" role="alert">
          Could not copy. Select the command and copy it manually.
        </p>
      {/if}
      <p class="callout">
        Alpha APIs and artwork may change before a stable release. Original artwork and code are
        licensed under MIT.
      </p>
    </section>
    <section id="static">
      <h2>Using icons</h2>
      <p>
        Import an icon in your <code>.svelte</code> file, then add it where you want it to appear.
      </p>
      <CodeExample title="Example.svelte" code={usageCode} />
      <ul class="usage-notes" aria-label="Usage notes">
        <li>
          <strong>Icon selection:</strong> Update the component name and import path for the icon you
          want to use.
        </li>
        <li>
          <strong>Default appearance:</strong> <code>&lt;Camera /&gt;</code> renders a 24px Outline icon
          with a regular stroke. The icon inherits the surrounding text color.
        </li>
        <li>
          <strong>Size:</strong> <code>size=&#123;32&#125;</code> sets both the width and height to 32px.
        </li>
        <li>
          <strong>Filled style:</strong> Set <code>style="filled"</code> to use the solid variant.
          All
          {iconCount} icons support both styles.
        </li>
        <li>
          <strong>Accessibility:</strong> Use <code>label="Camera"</code> to provide an accessible name.
          Omit the label when the icon is decorative or its button already has a name.
        </li>
      </ul>
    </section>
    <section id="props">
      <h2>Component props</h2>
      <div class="table-scroll">
        <table>
          <thead><tr><th>Prop</th><th>Default</th><th>Purpose</th></tr></thead><tbody
            ><tr
              ><td><code>size</code></td><td><code>24</code></td><td
                >Width and height; number or CSS length.</td
              ></tr
            ><tr
              ><td><code>color</code></td><td><code>currentColor</code></td><td
                >Stroke color. Inherits text color by default.</td
              ></tr
            ><tr
              ><td><code>strokeWidth</code></td><td><code>regular</code></td><td
                >Thin ({strokeWeights.thin}), regular ({strokeWeights.regular.toFixed(2)}), bold ({strokeWeights.bold.toFixed(
                  2,
                )}), or a custom number.</td
              ></tr
            ><tr
              ><td><code>label</code></td><td>Unset</td><td
                >One accessible name for a meaningful icon.</td
              ></tr
            ><tr
              ><td><code>style</code></td><td><code>outline</code></td><td
                >Choose Outline or Filled where available.</td
              ></tr
            ><tr><td><code>class</code></td><td>Unset</td><td>Style the root SVG.</td></tr></tbody
          >
        </table>
      </div>
      <p>
        These components deliberately expose a small API. They do not forward arbitrary attributes
        or turn themselves into interactive controls.
      </p>
    </section>
    <section id="accessibility">
      <h2>Accessibility</h2>
      <p>
        Icons without a <code>label</code> are decorative and hidden from assistive technology. A
        nonempty label adds <code>role="img"</code> and a single <code>aria-label</code>. We do not
        add a duplicate SVG title.
      </p>
      <CodeExample title="Accessibility.svelte" showHeader={false} code={examples[0]} />
      <p>
        Icons never add tab stops. Use buttons or links for interaction, and provide text or
        application status for meaningful notifications.
      </p>
      <p>No global DOM work occurs on import, and icons require no DOM IDs.</p>
    </section>
    <section id="contributing">
      <h2>Contributing</h2>
      <p>
        This section is for contributors who want to report a bug, request an icon, or improve the
        project. You do not need these guides to install or use the icons.
      </p>
      <p>Read the contribution guide for the area you want to work on:</p>
      <ul class="usage-notes" aria-label="Contribution guides">
        <li>
          <a href="https://github.com/squircle-icons/core/blob/main/CONTRIBUTING.md">Icon artwork</a
          >
        </li>
        <li>
          <a href="https://github.com/squircle-icons/svelte/blob/main/CONTRIBUTING.md"
            >Svelte components</a
          >
        </li>
        <li>
          <a href="https://github.com/squircle-icons/homepage/blob/main/CONTRIBUTING.md"
            >Website and documentation</a
          >
        </li>
      </ul>
    </section>
  </div>
</div>

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
  .docs-layout {
    display: grid;
    grid-template-columns: 210px minmax(0, 1fr);
    gap: 65px;
    align-items: start;
    padding-top: 36px;
    font-size: 14px;
    animation: docs-enter 240ms ease-out;
  }
  .docs-layout > nav {
    display: flex;
    flex-direction: column;
    position: sticky;
    top: var(--docs-scroll-offset);
    padding: 0;
    gap: 5px;
  }
  .docs-layout > nav > span {
    font-size: 14px;
    letter-spacing: 0.04em;
    color: var(--muted);
    margin: 0 0 12px;
  }
  .docs-layout > nav > a {
    position: relative;
    font-size: 14px;
    color: var(--muted);
    padding: 7px 14px;
    border-radius: 8px;
    transition:
      background 150ms,
      color 150ms;
  }
  .docs-layout > nav > a:hover {
    color: var(--text);
  }
  .docs-layout > nav > a[aria-current='location'] {
    background: color-mix(in srgb, var(--color-amber-500) 12%, var(--surface));
    color: var(--accent-text);
  }
  .docs-layout > nav.has-highlight > a[aria-current='location'] {
    background: transparent;
  }
  .toc-highlight {
    position: absolute;
    top: 0;
    left: 0;
    background: color-mix(in srgb, var(--color-amber-500) 12%, var(--surface));
    border-radius: 8px;
    pointer-events: none;
    transition:
      transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
      width 220ms ease,
      height 220ms ease;
  }
  :global(html:has(.docs-layout)) {
    scroll-behavior: smooth;
  }
  .docs-content {
    max-width: 760px;
    min-width: 0;
  }
  .docs-content > section {
    border-top: 1px solid var(--border);
    padding-top: 29px;
    padding-bottom: 47px;
    scroll-margin-top: var(--docs-scroll-offset);
  }
  .docs-content > section:first-child {
    border-top: 0;
  }
  .docs-content h2 {
    font-size: 16px;
    font-weight: 700;
    line-height: 1.5;
    letter-spacing: 0;
    margin-bottom: 18px;
    animation: heading-enter 320ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .docs-content p {
    font-size: 14px;
    color: var(--muted);
    line-height: 1.8;
  }
  .requirements-heading {
    font-size: 14px;
    font-weight: 600;
    margin: 20px 0 8px;
  }
  .requirements,
  .usage-notes {
    margin: 12px 0 20px;
    padding-left: 20px;
    list-style: disc;
    font-size: 14px;
    color: var(--muted);
    line-height: 1.8;
  }
  .requirements li + li,
  .usage-notes li + li {
    margin-top: 6px;
  }
  .usage-notes a {
    color: var(--accent-text);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  #contributing .usage-notes li::marker {
    color: var(--color-amber-500);
  }
  #contributing .usage-notes a {
    font-weight: 500;
    text-decoration: none;
  }
  #contributing .usage-notes a:hover {
    color: var(--color-amber-500);
  }
  .usage-notes strong {
    color: var(--text);
    font-weight: 600;
  }
  .docs-content pre {
    font-size: 14px;
    line-height: 1.7;
    margin: 22px 0;
    padding: 24px;
    border-radius: var(--radius-card);
    background: var(--surface-subtle);
    border-color: var(--border);
    box-shadow: inset 0 1px var(--edge-highlight);
  }
  .docs-content code {
    font-size: 14px;
  }
  .framework-choices {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 20px 0 12px;
  }
  .framework-choices button {
    font-size: 14px;
    padding: 8px 16px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--surface);
    color: var(--muted);
  }
  .framework-choices button[aria-pressed='true'] {
    color: var(--selection-fg);
    border-color: var(--selection-bg);
    background: var(--selection-bg);
  }
  .framework-choices button:disabled {
    opacity: 0.45;
    cursor: default;
  }
  .framework-status {
    margin-bottom: 18px;
  }
  .install-command {
    margin: 22px 0;
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    background: var(--surface-subtle);
    overflow: hidden;
  }
  .install-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
  }
  .package-managers {
    position: relative;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: 3px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--surface-subtle);
  }
  .package-managers::before {
    content: '';
    position: absolute;
    top: 3px;
    bottom: 3px;
    left: 3px;
    width: calc((100% - 6px) / 2);
    border-radius: 999px;
    background: var(--selection-bg);
    box-shadow: 0 1px 4px #18181b0a;
    transform: translateX(calc(var(--manager-index) * 100%));
    transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .package-managers button {
    position: relative;
    min-width: 64px;
    transition: color 150ms ease;
  }
  .package-managers button,
  .copy-button {
    padding: 6px 12px;
    border: 1px solid transparent;
    border-radius: 999px;
    background: transparent;
    font-size: 14px;
    color: var(--muted);
  }
  .package-managers button[aria-pressed='true'] {
    color: var(--selection-fg);
  }
  .copy-button {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    padding: 0;
    border-color: var(--border);
    background: var(--surface);
    color: var(--text);
  }
  .copy-button:hover {
    border-color: var(--border-strong);
    color: var(--text);
  }
  .copy-button:disabled {
    cursor: wait;
    opacity: 0.6;
  }
  .install-command pre {
    margin: 0;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    background: transparent;
  }
  .install-command code {
    user-select: all;
  }
  .docs-content .copy-error {
    color: #b42318;
  }
  .docs-content .callout {
    color: var(--accent-text);
    border-left: 2px solid var(--color-amber-500);
    background: color-mix(in srgb, var(--color-amber-500) 8%, var(--surface));
    border-radius: 0 var(--radius-card-small) var(--radius-card-small) 0;
    padding: 17px 20px;
  }
  .table-scroll {
    overflow-x: auto;
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    margin: 22px 0;
    background: var(--surface);
  }
  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 14px;
    margin: 0;
  }
  thead {
    background: var(--surface-subtle);
  }
  th {
    text-align: left;
    font-weight: 600;
  }
  th,
  td {
    font-size: 14px;
    color: var(--muted);
    border-bottom: 1px solid var(--border);
    padding: 16px;
    vertical-align: top;
  }
  td:first-child {
    color: var(--text-secondary);
    min-width: 125px;
  }
  tbody tr:last-child td {
    border-bottom: 0;
  }
  @keyframes docs-enter {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes heading-enter {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @media (max-width: 760px) {
    .docs-layout {
      grid-template-columns: 1fr;
      gap: 26px;
      padding-top: 24px;
    }
    .docs-layout > nav {
      position: static;
      flex-direction: row;
      flex-wrap: wrap;
      padding: 0;
      gap: 5px 10px;
    }
    .docs-layout > nav > span {
      width: 100%;
      margin: 0 0 5px;
    }
    .docs-layout > nav > a {
      padding: 5px 8px;
    }
    .docs-content pre {
      padding: 20px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .package-managers::before,
    .package-managers button {
      transition: none;
    }
    :global(html:has(.docs-layout)) {
      scroll-behavior: auto;
    }
    .docs-layout,
    .docs-content h2 {
      animation: none;
    }
    .toc-highlight {
      transition: none;
    }
    .docs-layout > nav > a {
      transition: none;
    }
  }
</style>
