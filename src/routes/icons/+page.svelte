<script lang="ts">
  import { onMount, tick } from 'svelte';
  import * as Select from '#lib/components/ui/select/index.js';
  import ColorPicker from '#lib/components/ColorPicker.svelte';
  import { catalog, strokeWeights } from '#lib/public-catalog.js';
  import { paginate } from '#lib/pagination.js';
  import { serializeIconSvg } from '#lib/svg-export.js';
  import Search from '@squircle-icons/svelte/search';
  import Check from '@squircle-icons/svelte/check';
  import X from '@squircle-icons/svelte/x';
  import Copy from '@squircle-icons/svelte/copy';
  import Download from '@squircle-icons/svelte/download';
  import Camera from '@squircle-icons/svelte/camera';

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'interface', label: 'Interface' },
    { id: 'media', label: 'Media' },
    { id: 'files', label: 'Files' },
    { id: 'nature', label: 'Nature' },
  ] as const;
  type Category = (typeof categories)[number]['id'];
  let category = $state<Category>('all');
  function iconCategory(tags: string[]): Category {
    if (tags.some((tag) => ['photo', 'image', 'video', 'audio'].includes(tag))) return 'media';
    if (tags.some((tag) => ['files', 'directory', 'document'].includes(tag))) return 'files';
    if (tags.some((tag) => ['weather', 'nature'].includes(tag))) return 'nature';
    return 'interface';
  }
  function categoryKeys(event: KeyboardEvent, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % categories.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + categories.length) % categories.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = categories.length - 1;
    else return;
    event.preventDefault();
    category = categories[next].id;
    document.getElementById(`category-${category}`)?.focus({ preventScroll: true });
  }
  let query = $state('');
  let currentPage = $state(1);
  let search = $state<HTMLInputElement>();
  let selected = $state(catalog[0]?.name ?? '');
  let kind = $state<'outline' | 'filled'>('outline');
  let size = $state(24);
  let color = $state('#27272a');
  let customColor = $state(false);
  let strokeWidth = $state(strokeWeights.regular);
  let drawer = $state<HTMLDialogElement>();
  let preview = $state<HTMLDivElement>();
  let details = $state<HTMLDivElement>();
  let previewSide = $state(140);
  let closeButton = $state<HTMLButtonElement>();
  let trigger: HTMLButtonElement | undefined;
  let animateEntrance = $state(false);
  let drawerOpen = $state(false);
  let feedback = $state('');
  let failed = $state(false);
  let copying = $state(false);
  let operation = 0;
  let exitAnimation: Animation | undefined;
  let motionPreference: MediaQueryList | undefined;

  $effect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => (feedback = ''), failed ? 6000 : 3500);
    return () => clearTimeout(timeout);
  });

  const visible = $derived(
    catalog.filter(
      (icon) =>
        (category === 'all' || iconCategory(icon.tags) === category) &&
        `${icon.name} ${icon.tags.join(' ')} ${icon.description}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    ),
  );
  const pagination = $derived(paginate(visible, currentPage));
  $effect(() => {
    query;
    category;
    currentPage = 1;
  });
  const entry = $derived(catalog.find((icon) => icon.name === selected) ?? catalog[0]);
  const hasFilled = $derived(!!entry?.styles.includes('filled'));
  const SelectedIcon = $derived(entry?.component);
  const name = $derived(
    selected
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(''),
  );
  const adjustableStroke = $derived(kind === 'outline' || selected === 'folder');
  const strokePreset = $derived(
    Object.entries(strokeWeights).find(([, value]) => value === strokeWidth)?.[0],
  );
  const styleSelection = $derived(kind === 'filled' ? 'filled' : (strokePreset ?? 'custom'));
  const styleOptions = $derived([
    ...Object.keys(strokeWeights).map((value) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
    })),
    ...(!strokePreset ? [{ value: 'custom', label: 'Custom' }] : []),
    ...(hasFilled ? [{ value: 'filled', label: 'Filled' }] : []),
  ]);
  const strokeAttribute = $derived(
    strokePreset
      ? `strokeWidth="${strokePreset}"`
      : `strokeWidth={${Number(strokeWidth.toFixed(2))}}`,
  );
  const snippet = $derived(
    `<${name} size={${size}} color="${color}"${kind === 'filled' ? ' style="filled"' : ''}${adjustableStroke ? ` ${strokeAttribute}` : ''} />`,
  );
  const signature = $derived(`${selected}:${kind}:${size}:${color}:${strokeWidth}`);
  $effect(() => {
    signature;
    operation++;
    copying = false;
    feedback = '';
    failed = false;
  });
  $effect(() => {
    if (!details) return;
    let frame = 0;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry.contentRect.height) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => (previewSide = entry.contentRect.height));
    });
    observer.observe(details);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  });

  async function showIcon(icon: string, event?: MouseEvent) {
    const nextIcon = catalog.find((item) => item.name === icon);
    if (!nextIcon) return;
    cancelExit();
    operation++;
    copying = false;
    selected = icon;
    if (kind === 'filled' && !nextIcon.styles.includes('filled')) kind = 'outline';
    feedback = '';
    failed = false;
    trigger = event?.currentTarget instanceof HTMLButtonElement ? event.currentTarget : undefined;
    animateEntrance = !!event?.detail;
    await tick();
    if (drawer && !drawer.open) drawer.show();
    drawerOpen = true;
    closeButton?.focus({ preventScroll: true });
  }
  function cancelExit() {
    if (!exitAnimation) return;
    exitAnimation.onfinish = null;
    exitAnimation.cancel();
    exitAnimation = undefined;
  }
  function finishClose() {
    cancelExit();
    drawer?.close();
  }
  function closeDrawer() {
    if (!drawer?.open || exitAnimation) return;
    if (!animateEntrance || motionPreference?.matches) {
      finishClose();
      return;
    }
    const pose = getComputedStyle(drawer);
    const animation = drawer.animate(
      [
        { transform: pose.transform, opacity: pose.opacity },
        { transform: 'translateY(calc(100% + 32px))', opacity: 0 },
      ],
      { id: 'drawer-exit', duration: 220, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' },
    );
    exitAnimation = animation;
    animation.onfinish = () => {
      if (exitAnimation === animation) finishClose();
    };
  }
  function windowKeys(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    if (event.key === 'Escape' && drawer?.open) {
      event.preventDefault();
      closeDrawer();
    }
  }
  function afterClose() {
    cancelExit();
    drawerOpen = false;
    operation++;
    copying = false;
    feedback = '';
    const target = trigger?.isConnected ? trigger : document.getElementById(selected);
    if (target instanceof HTMLButtonElement) target.focus({ preventScroll: true });
    else search?.focus({ preventScroll: true });
  }
  async function svgText() {
    await tick();
    const svg = preview?.querySelector('svg');
    if (!svg) throw new Error('Preview unavailable');
    return serializeIconSvg(svg, size, name);
  }
  async function copy(format: 'svg' | 'svelte') {
    if (copying) return;
    const current = ++operation;
    copying = true;
    failed = false;
    feedback = '';
    try {
      const text = format === 'svg' ? await svgText() : snippet;
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      if (operation === current)
        feedback = format === 'svg' ? 'SVG copied.' : 'Svelte code copied.';
    } catch {
      if (operation === current) {
        failed = true;
        feedback = 'Could not copy. Allow clipboard access and try again.';
      }
    } finally {
      if (operation === current) copying = false;
    }
  }
  async function downloadSvg() {
    feedback = '';
    failed = false;
    try {
      const text = await svgText();
      const url = URL.createObjectURL(new Blob([text], { type: 'image/svg+xml;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selected}${kind === 'filled' ? '-filled' : ''}.svg`;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      feedback = 'Download started.';
    } catch {
      failed = true;
      feedback = 'Could not create the SVG. Please try again.';
    }
  }
  onMount(() => {
    const followTheme = () => {
      if (!customColor)
        color = document.documentElement.dataset.theme === 'dark' ? '#f4f4f5' : '#27272a';
    };
    followTheme();
    window.addEventListener('squircle:theme-change', followTheme);
    motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const preferenceChanged = () => {
      if (motionPreference?.matches && exitAnimation) finishClose();
    };
    motionPreference.addEventListener('change', preferenceChanged);
    try {
      const icon = decodeURIComponent(window.location.hash.slice(1));
      if (icon) void showIcon(icon);
    } catch {
      // A malformed fragment should leave the gallery usable.
    }
    return () => {
      cancelExit();
      window.removeEventListener('squircle:theme-change', followTheme);
      motionPreference?.removeEventListener('change', preferenceChanged);
    };
  });
</script>

<svelte:head><title>Icons — Squircle Icons</title></svelte:head>
<svelte:window onkeydown={windowKeys} />
<div class="gallery-layout">
  <div class="gallery-toolbar page-appear" aria-label="Gallery toolbar">
    <label class="search-field"
      ><Search size={18} /><input
        type="search"
        aria-label="Search icons"
        placeholder="Search icons…"
        bind:this={search}
        bind:value={query}
      /></label
    >
    <aside class="gallery-sidebar" aria-label="Icon controls">
      <div class="detail-controls">
        <label class="size-field"
          >Size<span>{size}px</span><input
            aria-label="Export size"
            aria-valuetext={`${size} pixels`}
            type="range"
            min="16"
            max="64"
            step="4"
            style:--range-progress={`${((size - 16) / 48) * 100}%`}
            bind:value={size}
          /></label
        >
        <label class="stroke-field"
          >{kind === 'filled' && selected === 'folder' ? 'Gap' : 'Stroke'}
          <span>{strokeWidth.toFixed(2)}</span><input
            aria-label="Stroke width"
            type="range"
            min="1"
            max="2.5"
            step="0.05"
            style:--range-progress={`${((strokeWidth - 1) / 1.5) * 100}%`}
            bind:value={strokeWidth}
            disabled={!adjustableStroke}
          /></label
        >
        <Select.Root
          type="single"
          value={styleSelection}
          items={styleOptions}
          onValueChange={(preset) => {
            if (preset === 'filled') {
              kind = 'filled';
              return;
            }
            const value = strokeWeights[preset as keyof typeof strokeWeights];
            if (value !== undefined || preset === 'custom') {
              kind = 'outline';
              if (value !== undefined) strokeWidth = value;
            }
          }}
        >
          <Select.Trigger aria-label="Icon style">
            {styleOptions.find((option) => option.value === styleSelection)?.label ?? 'Custom'}
          </Select.Trigger>
          <Select.Content aria-label="Icon styles">
            {#each styleOptions as option}
              <Select.Item value={option.value} label={option.label}>
                <span class="style-option-preview">
                  <Camera
                    size={20}
                    strokeWidth={option.value === 'filled'
                      ? strokeWeights.regular
                      : (strokeWeights[option.value as keyof typeof strokeWeights] ?? strokeWidth)}
                    style={option.value === 'filled' ? 'filled' : 'outline'}
                  />
                  {option.label}
                </span>
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
        <ColorPicker bind:value={color} onchange={() => (customColor = true)} />
      </div>
    </aside>
  </div>
  <section
    class="icon-browser"
    class:has-drawer={drawerOpen}
    class:custom-color={customColor}
    aria-label="Icon gallery"
  >
    <h1 class="sr-only">Icons</h1>
    <div class="category-row page-appear" style="--appear-delay: 40ms">
      <div
        class="category-tabs"
        role="tablist"
        aria-label="Icon categories"
        style:--category-index={categories.findIndex((item) => item.id === category)}
      >
        {#each categories as item, index}
          <button
            id={`category-${item.id}`}
            role="tab"
            aria-selected={category === item.id}
            aria-controls="category-results"
            tabindex={category === item.id ? 0 : -1}
            onclick={() => (category = item.id)}
            onkeydown={(event) => categoryKeys(event, index)}>{item.label}</button
          >
        {/each}
      </div>
      <span class="result-count" aria-live="polite"
        >{visible.length} {visible.length === 1 ? 'icon' : 'icons'}</span
      >
    </div>
    <div
      class="page-appear"
      style="--appear-delay: 80ms"
      id="category-results"
      role="tabpanel"
      aria-labelledby={`category-${category}`}
      tabindex="0"
    >
      <div class="icon-grid">
        {#each pagination.items as icon}
          <button
            id={icon.name}
            class="icon-button"
            aria-label={'View ' + icon.name + ' icon'}
            title={icon.styles.includes('filled') ? 'Filled style available' : 'Outline only'}
            aria-haspopup="dialog"
            aria-pressed={drawerOpen && selected === icon.name}
            onclick={(event) => showIcon(icon.name, event)}
          >
            <span class="icon-glyph" aria-hidden="true">
              <icon.component
                {size}
                {color}
                {strokeWidth}
                style={kind === 'filled' && icon.styles.includes('filled') ? 'filled' : 'outline'}
              />
            </span>
            <span class="icon-name">{icon.name}</span>
          </button>
        {/each}
      </div>
      {#if pagination.pageCount > 1}<nav class="pagination" aria-label="Icon pages">
          <button
            disabled={pagination.page === 1}
            onclick={() => (currentPage = pagination.page - 1)}>Previous</button
          >
          <span aria-live="polite">Page {pagination.page} of {pagination.pageCount}</span>
          <button
            disabled={pagination.page === pagination.pageCount}
            onclick={() => (currentPage = pagination.page + 1)}>Next</button
          >
        </nav>{/if}
      {#if visible.length === 0}<p class="empty-state">
          No icons found. Try another category or search term.
        </p>{/if}
    </div>
  </section>
</div>

<div class="drawer-position">
  <dialog
    bind:this={drawer}
    class="icon-drawer"
    class:animated={animateEntrance}
    aria-labelledby="icon-drawer-title"
    onclose={afterClose}
  >
    {#if entry && SelectedIcon}
      <div class="drawer-inner">
        <div class="drawer-heading">
          <div>
            <span class="drawer-kicker">SQUIRCLE ICONS</span>
            <h2 id="icon-drawer-title">{name}</h2>
          </div>
          <button
            bind:this={closeButton}
            class="close-button"
            onclick={closeDrawer}
            aria-label="Close icon details"
            title="Close"><X size={18} /></button
          >
        </div>
        <div class="drawer-content" style:--preview-side={`${previewSide}px`}>
          <div class="drawer-preview" bind:this={preview} data-testid="drawer-preview">
            <SelectedIcon size={72} {color} {strokeWidth} style={kind} />
          </div>
          <div class="drawer-details" bind:this={details}>
            <span class="code-language">Svelte</span>
            <div class="code-panel" id="icon-code-panel" role="region" aria-label="Svelte code">
              <pre class="usage-code"><code>{snippet}</code></pre>
              <button
                class="code-copy"
                aria-label="Copy Svelte code"
                title="Copy code"
                onclick={() => copy('svelte')}
                disabled={copying}
              >
                <Copy size={18} />
              </button>
            </div>
            <div class="drawer-actions">
              <button class="action primary" onclick={downloadSvg}
                ><Download size={16} />Download SVG</button
              >
              <button class="action" onclick={() => copy('svg')} disabled={copying}
                ><Copy size={16} />Copy SVG</button
              >
            </div>
          </div>
        </div>
      </div>
    {/if}
  </dialog>
</div>

<div
  class="notification-toast"
  class:visible={!!feedback}
  class:error={failed}
  role="status"
  aria-live="polite"
  aria-atomic="true"
  aria-hidden={!feedback}
>
  {#if feedback}
    {#if failed}<X size={20} />{:else}<Check size={20} />{/if}
    <span>{feedback}</span>
    <button aria-label="Dismiss notification" onclick={() => (feedback = '')}
      ><X size={16} /></button
    >
  {/if}
</div>

<style>
  .gallery-layout {
    display: block;
    padding: 36px 0 64px;
    min-height: calc(100dvh - 84px);
    font-size: 14px;
  }
  .pagination {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: center;
    margin-top: 24px;
  }
  .pagination button {
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--surface);
    padding: 6px 12px;
  }
  .pagination button:disabled {
    opacity: 0.4;
  }
  .icon-browser {
    min-width: 0;
  }
  .icon-browser.has-drawer {
    padding-bottom: 380px;
  }
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
  .gallery-toolbar {
    position: sticky;
    top: calc(var(--site-header-height, 92px) + 12px);
    z-index: 25;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 24px;
    padding: 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    background: var(--surface);
    box-shadow: 0 4px 20px #00000008;
  }
  .category-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
  }
  .category-tabs {
    position: relative;
    isolation: isolate;
    padding: 4px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: color-mix(in srgb, var(--surface-subtle) 75%, var(--border));
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    min-width: 0;
  }
  .category-tabs::before {
    content: '';
    position: absolute;
    z-index: -1;
    inset: 4px auto 4px 4px;
    width: calc((100% - 8px) / 5);
    border-radius: 999px;
    background: var(--selection-bg);
    transform: translateX(calc(var(--category-index, 0) * 100%));
    transition: transform 220ms var(--ease-out);
  }
  .category-tabs button {
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--muted);
    padding: 6px 18px;
    font-size: 14px;
    transition: color 160ms ease;
  }
  .category-tabs button:hover {
    color: var(--text);
  }
  .category-tabs button[aria-selected='true'] {
    color: var(--selection-fg);
  }
  .search-field {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 180px;
    border: 1px solid var(--border);
    border-radius: calc(var(--radius-card) - 12px);
    background: var(--surface);
    padding: 10px 16px;
    color: var(--faint);
  }
  .search-field:focus-within {
    border-color: var(--color-amber-500);
    outline: 2px solid color-mix(in srgb, var(--color-amber-500) 18%, transparent);
  }
  .search-field input {
    border: 0;
    background: none;
    outline: 0 !important;
    width: 100%;
    min-width: 0;
    font-size: 14px;
    color: var(--text);
  }
  .result-count {
    color: var(--muted);
    white-space: nowrap;
    text-align: right;
  }
  .icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
    gap: 12px;
  }
  .icon-button {
    position: relative;
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    justify-items: center;
    gap: 12px;
    aspect-ratio: 1;
    min-width: 0;
    padding: 12px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-card-small);
    background: var(--surface);
    color: var(--text);
  }
  .icon-button:hover {
    background: var(--surface-subtle);
    border-color: var(--border-strong);
    color: var(--text);
  }
  .icon-button[aria-pressed='true'] {
    background: var(--surface-subtle);
    border-color: var(--selection-bg);
  }
  .icon-glyph {
    display: grid;
    place-items: center;
    align-self: stretch;
    min-height: 0;
  }
  .icon-button .icon-name {
    white-space: nowrap;
    font-size: 14px;
    line-height: 1.5;
    color: var(--muted);
    text-align: center;
  }
  .icon-button:hover .icon-name,
  .icon-button[aria-pressed='true'] .icon-name {
    color: var(--text);
  }
  .empty-state {
    margin: 72px 0;
    text-align: center;
    color: var(--muted);
  }
  .gallery-sidebar {
    flex: 0 0 auto;
    min-width: 0;
  }
  .detail-controls {
    display: grid;
    grid-template-columns: 180px 180px 128px 144px;
    align-items: center;
    gap: 16px;
    font-size: 14px;
  }
  .style-option-preview {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  .size-field,
  .stroke-field {
    display: grid;
    grid-template-columns: auto minmax(48px, 1fr) auto;
    align-items: center;
    gap: 10px;
    color: var(--muted);
  }
  .size-field span,
  .stroke-field span {
    grid-column: 3;
    grid-row: 1;
    color: var(--text);
  }
  .size-field input,
  .stroke-field input {
    grid-column: 2;
    grid-row: 1;
    min-width: 0;
    appearance: none;
    -webkit-appearance: none;
    width: 100%;
    height: 18px;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: linear-gradient(
        to right,
        var(--color-amber-500) 0%,
        var(--color-amber-500) var(--range-progress),
        var(--border-strong) var(--range-progress),
        var(--border-strong) 100%
      )
      center / 100% 4px no-repeat;
    cursor: pointer;
  }
  .size-field input::-webkit-slider-runnable-track,
  .stroke-field input::-webkit-slider-runnable-track {
    height: 4px;
    background: transparent;
    border: 0;
  }
  .size-field input::-webkit-slider-thumb,
  .stroke-field input::-webkit-slider-thumb {
    appearance: none;
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    margin-top: -4px;
    border: 0;
    border-radius: 50%;
    background: var(--color-amber-500);
    box-shadow: none;
  }
  .size-field input::-moz-range-track,
  .stroke-field input::-moz-range-track {
    height: 4px;
    border: 0;
    background: transparent;
  }
  .size-field input::-moz-range-progress,
  .stroke-field input::-moz-range-progress {
    height: 4px;
    background: transparent;
  }
  .size-field input::-moz-range-thumb,
  .stroke-field input::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border: 0;
    border-radius: 50%;
    background: var(--color-amber-500);
    box-shadow: none;
  }
  .stroke-field input:disabled {
    opacity: 0.3;
    cursor: default;
  }
  .drawer-position {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    width: min(1184px, calc(100% - 96px));
    pointer-events: none;
    z-index: 30;
  }
  .icon-drawer {
    position: static;
    margin: 0;
    width: 100%;
    max-width: none;
    max-height: min(70dvh, 520px);
    overflow-y: auto;
    overscroll-behavior: contain;
    border: 1px solid var(--border);
    border-radius: var(--radius-card-large);
    padding: 24px;
    background: var(--surface);
    color: var(--text);
    font-size: 14px;
    pointer-events: auto;
    box-shadow:
      0 8px 40px #18181b12,
      0 2px 8px #18181b06;
  }
  .icon-drawer.animated[open] {
    animation: drawer-enter 320ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .drawer-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 20px;
  }
  .drawer-kicker {
    font-size: 14px;
    color: var(--muted);
  }
  .drawer-heading h2 {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.5;
    margin: 4px 0 0;
    letter-spacing: 0;
  }
  .close-button {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    border: 1px solid var(--border);
    border-radius: 7px;
    background: var(--surface);
    color: var(--muted);
    padding: 0;
    font-size: 14px;
  }
  .close-button:hover {
    color: var(--text);
    background: var(--surface-subtle);
  }
  .drawer-content {
    display: grid;
    grid-template-columns: var(--preview-side) minmax(0, 1fr);
    gap: 24px;
  }
  .drawer-preview {
    display: grid;
    place-items: center;
    align-self: start;
    width: var(--preview-side);
    aspect-ratio: 1;
    border: 1px solid var(--border);
    border-radius: var(--radius-card-small);
    background-color: var(--surface);
    background-image:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 14px 14px;
  }
  .drawer-preview :global(svg) {
    width: 70%;
    height: 70%;
  }
  .drawer-details {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .code-language {
    align-self: flex-start;
    padding: 5px 16px;
    border-radius: 999px;
    background: var(--selection-bg);
    color: var(--selection-fg);
    font-size: 14px;
  }
  .code-panel {
    display: flex;
    align-items: flex-start;
    position: relative;
    min-width: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius-card-small);
    background: var(--surface-subtle);
    overflow: hidden;
  }
  .code-copy {
    flex-shrink: 0;
    margin: 12px 12px 12px 0;
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    color: var(--text);
  }
  .code-copy:hover {
    border-color: var(--border-strong);
  }
  .code-copy:disabled {
    opacity: 0.5;
    cursor: wait;
  }
  .drawer-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: auto 0 0;
  }
  .action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid var(--border);
    border-radius: var(--radius-control);
    padding: 8px 12px;
    background: var(--surface);
    color: var(--text-secondary);
    font-size: 14px;
    transition:
      background-color 150ms ease,
      border-color 150ms ease;
  }
  .action.primary {
    background: var(--color-amber-500);
    color: var(--accent-foreground);
    border-color: var(--color-amber-500);
  }
  .action:hover {
    border-color: var(--color-amber-500);
  }
  @media (hover: hover) {
    .action.primary:enabled:hover {
      background: color-mix(in oklab, var(--color-amber-500) 88%, black);
      border-color: color-mix(in oklab, var(--color-amber-500) 88%, black);
    }
  }
  .action:disabled {
    opacity: 0.5;
    cursor: wait;
  }
  .usage-code {
    flex: 1;
    min-width: 0;
    margin: 0;
    overflow: auto;
    padding: 16px;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.6;
  }
  .usage-code code {
    font-size: 14px;
  }
  .notification-toast {
    position: fixed;
    z-index: 100;
    right: 24px;
    bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: min(440px, calc(100vw - 48px));
    padding: 14px 16px;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-card-small);
    background: var(--surface);
    box-shadow: 0 8px 32px #0002;
    color: var(--text);
    font-size: 14px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(12px);
    transition:
      opacity 220ms ease,
      transform 220ms ease,
      visibility 0s linear 220ms;
  }
  .notification-toast.visible {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    transition-delay: 0s;
  }
  .notification-toast.error {
    border-color: var(--accent-text);
  }
  .notification-toast button {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--muted);
  }
  .notification-toast button:hover {
    background: var(--surface-subtle);
    color: var(--text);
  }
  @keyframes drawer-enter {
    from {
      transform: translateY(calc(100% + 32px));
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  @media (max-width: 1100px) {
    .gallery-toolbar {
      flex-wrap: wrap;
    }
    .gallery-toolbar .search-field {
      flex-basis: 100%;
      max-width: none;
    }
    .gallery-sidebar {
      flex: 1;
    }
    .detail-controls {
      grid-template-columns: minmax(180px, 1fr) minmax(180px, 1fr) 128px 144px;
    }
  }
  @media (max-width: 1100px) {
    .drawer-content {
      grid-template-columns: 1fr;
    }
    .drawer-preview {
      width: min(var(--preview-side), 100%);
    }
  }
  @media (max-width: 760px) {
    .gallery-layout {
      padding-top: 24px;
    }
    .drawer-position {
      width: calc(100% - 44px);
      grid-template-columns: minmax(0, 1fr);
    }
    .drawer-content {
      grid-template-columns: 1fr;
      gap: 18px;
    }
    .drawer-preview {
      width: min(var(--preview-side), 100%);
    }
    .icon-drawer {
      padding: 20px;
    }
    .gallery-toolbar {
      flex-wrap: wrap;
      gap: 10px;
    }
    .search-field {
      flex-basis: 100%;
    }
  }
  @media (max-width: 620px) {
    .category-row {
      flex-wrap: wrap;
    }
    .category-tabs button {
      padding-inline: 8px;
    }
    .detail-controls {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .icon-grid {
      gap: 10px;
      grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
    }
    .drawer-position {
      display: block;
      width: calc(100% - 40px);
      bottom: 20px;
    }
    .icon-drawer {
      max-height: 72dvh;
    }
    .usage-code {
      max-height: 160px;
      overflow: auto;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .notification-toast {
      transform: none;
      transition: none;
    }
    .category-tabs button,
    .category-tabs::before,
    .action {
      transition: none;
    }
    .icon-drawer.animated[open] {
      animation: none;
    }
  }
</style>
