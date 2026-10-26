<script lang="ts">
  import { catalog } from '#lib/catalog.ts';
  import Folder from 'squircle-icons-svelte/animated/folder';
  import Bell from 'squircle-icons-svelte/animated/bell';
  import Search from 'squircle-icons-svelte/search';
  let query = $state('');
  let size = $state(24);
  let color = $state('#27272a');
  let strokeWidth = $state(1.75);
  let selected = $state('camera');
  let hover = $state(false);
  let open = $state(false);
  let reducedMotion = $state<'system' | 'always'>('system');
  let bell = $state<{ play(): void; reset(): void }>();
  let folder = $state<{ reset(): void }>();
  const visible = $derived(
    catalog.filter((icon) => `${icon.name} ${icon.tags.join(' ')}`.includes(query.toLowerCase())),
  );
  const SelectedIcon = $derived(catalog.find((icon) => icon.name === selected)!.component);
  const pascal = (value: string) => value[0].toUpperCase() + value.slice(1);
</script>

<svelte:head><title>Icons — Squircle Icons</title></svelte:head>
<section class="page-heading">
  <div class="eyebrow">The first collection <span class="pill">Design proposal</span></div>
  <h1>Six familiar faces.</h1>
  <p>
    Explore the curves, check the details, and find a little movement. Every icon starts with an
    original SVG.
  </p>
</section>
<div class="catalog-layout">
  <section aria-label="Icon gallery">
    <div class="gallery-toolbar">
      <label class="search-field"
        ><Search size={17} /><input
          type="search"
          aria-label="Search icons"
          placeholder="Search icons…"
          bind:value={query}
        /><kbd>6</kbd></label
      ><span class="result-count">{visible.length} icons</span>
    </div>
    <div class="icon-grid">
      {#each visible as icon}<button
          id={icon.name}
          class="icon-card"
          class:selected={selected === icon.name}
          onclick={() => (selected = icon.name)}
          aria-pressed={selected === icon.name}
          aria-label={'Select ' + icon.name}
          ><div class="large-preview" style:color><icon.component size={76} {strokeWidth} /></div>
          <div class="actual-preview" style:color>
            <icon.component {size} {strokeWidth} /><span>{size}px</span>
          </div>
          <div class="card-caption">
            <span>{icon.name}</span><span class="mono"
              >{icon.name === 'bell' || icon.name === 'folder' ? '↝' : '↗'}</span
            >
          </div></button
        >{/each}
    </div>
    {#if visible.length === 0}<div class="empty-state">
        No icons match “{query}”. Try “photo”, “files”, or “gear”.
      </div>{/if}
    <div class="optical-row">
      <span class="mono">OPTICAL CHECK</span>
      <div style:color>
        {#each [16, 20, 24, 48] as n}<div>
            <SelectedIcon size={n} {strokeWidth} /><small>{n}px</small>
          </div>{/each}
      </div>
      <span class="optical-note">One drawing.<br />Everyday sizes.</span>
    </div>
  </section>
  <aside aria-label="Preview controls">
    <div class="aside-heading">
      <h2>Make it yours</h2>
      <span class="mono">PREVIEW</span>
    </div>
    <label class="control-label" for="icon-size">Size <span>{size}px</span></label><input
      id="icon-size"
      type="range"
      min="16"
      max="48"
      step="1"
      bind:value={size}
    />
    <div class="size-presets">
      {#each [16, 20, 24, 48] as n}<button class:active={size === n} onclick={() => (size = n)}
          >{n}</button
        >{/each}
    </div>
    <label class="control-label" for="icon-stroke">Stroke <span>{strokeWidth}</span></label><input
      id="icon-stroke"
      type="range"
      min="1"
      max="2.5"
      step="0.25"
      bind:value={strokeWidth}
    /><label class="control-label" for="icon-color">Color</label>
    <div class="color-field">
      <input id="icon-color" type="color" bind:value={color} /><span class="mono">{color}</span>
    </div>
    <div class="aside-divider"></div>
    <h3>Use {selected}</h3>
    <pre><code
        >{`import ${pascal(selected)} from\n'squircle-icons-svelte/${selected}';\n\n<${pascal(selected)}\n  size={${size}}\n  color="${color}"\n  strokeWidth={${strokeWidth}}\n/>`}</code
      ></pre>
    <p class="aside-note">
      Decorative by default. Add a <code>label</code> when the icon carries meaning.
    </p>
    <a class="text-link" href="/docs#accessibility">Accessibility guide ↗</a>
  </aside>
</div>
<section id="motion" class="motion-section">
  <div class="section-head">
    <div>
      <div class="eyebrow">Motion studies</div>
      <h2>Small moves. Clear states.</h2>
      <p>Nothing plays on mount. Nothing loops by default.</p>
    </div>
    <span class="pill">2 animated icons</span>
  </div>
  <div class="motion-toolbar">
    <label><input type="checkbox" bind:checked={hover} /> Enable hover previews</label><label
      ><input
        type="checkbox"
        checked={reducedMotion === 'always'}
        onchange={(event) => (reducedMotion = event.currentTarget.checked ? 'always' : 'system')}
      /> Always reduce motion</label
    ><span>System preferences are always respected.</span>
  </div>
  <div class="motion-grid">
    <article class="motion-demo folder-demo">
      <div class="motion-stage" style:color>
        <Folder bind:this={folder} size={92} {strokeWidth} {open} {hover} {reducedMotion} />
      </div>
      <div class="motion-info">
        <div>
          <h3>folder <span class="pill">State</span></h3>
          <p>A controlled opening. A settled ending.</p>
        </div>
        <div class="demo-buttons">
          <button class="button" onclick={() => (open = !open)} aria-pressed={open}
            >{open ? 'Close folder' : 'Open folder'}</button
          ><button class="button subtle" onclick={() => folder?.reset()}>Reset folder</button>
        </div>
      </div>
      <code>&lt;Folder open=&#123;{String(open)}&#125; /&gt;</code>
    </article>
    <article class="motion-demo bell-demo">
      <div class="motion-stage" style:color>
        <Bell bind:this={bell} size={92} {strokeWidth} {hover} {reducedMotion} />
      </div>
      <div class="motion-info">
        <div>
          <h3>bell <span class="pill">One shot</span></h3>
          <p>A brief ring, then back to rest.</p>
        </div>
        <div class="demo-buttons">
          <button class="button" onclick={() => bell?.play()}>Ring bell</button><button
            class="button subtle"
            onclick={() => bell?.reset()}>Reset bell</button
          >
        </div>
      </div>
      <code>bell.play();</code>
    </article>
  </div>
  <p class="motion-footnote">
    Hover is a visual preview. App actions belong on accessible buttons. <a href="/docs#motion"
      >Read the motion contract ↗</a
    >
  </p>
</section>

<style>
  .catalog-layout {
    display: grid;
    grid-template-columns: 1fr 254px;
    gap: 34px;
  }
  .gallery-toolbar {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
  }
  .search-field {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #fff;
    border: 1px solid #e4e4e7;
    border-radius: 10px;
    padding: 10px 13px;
    flex: 1;
    color: #a1a1aa;
  }
  .search-field input {
    border: 0;
    background: none;
    outline: 0 !important;
    width: 100%;
    font-size: 13px;
    color: #27272a;
  }
  .search-field kbd {
    font-size: 10px;
    border: 1px solid #e4e4e7;
    border-radius: 4px;
    padding: 0 5px;
    color: #a1a1aa;
  }
  .result-count {
    font-size: 11px;
    color: #a1a1aa;
  }
  .icon-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
  .icon-card {
    position: relative;
    border: 1px solid #e4e4e7;
    border-radius: 15px;
    background: #ffffff;
    padding: 18px;
    min-height: 227px;
    text-align: left;
    transition: background 0.15s;
  }
  .icon-card:hover {
    background: #fafafa;
  }
  .icon-card.selected {
    border-color: #6366f1;
    background: #eef2ff;
    box-shadow: 0 0 0 1px #6366f120;
  }
  .large-preview {
    height: 114px;
    display: grid;
    place-items: center;
  }
  .actual-preview {
    height: 47px;
    display: flex;
    align-items: center;
    gap: 9px;
    justify-content: center;
  }
  .actual-preview span {
    font: 9px monospace;
    color: #a1a1aa;
  }
  .card-caption {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    font: 11px monospace;
    color: #71717a;
  }
  .card-caption > span:last-child {
    color: #818cf8;
  }
  .optical-row {
    border: 1px solid #e4e4e7;
    border-radius: 12px;
    margin-top: 18px;
    display: flex;
    align-items: center;
    padding: 18px 20px;
    gap: 24px;
    min-height: 113px;
  }
  .optical-row > span:first-child {
    font-size: 9px;
    letter-spacing: 0.1em;
    color: #a1a1aa;
  }
  .optical-row > div {
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    gap: 22px;
    flex: 1;
  }
  .optical-row > div > div {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 8px;
  }
  .optical-row small {
    font: 9px monospace;
    color: #a1a1aa;
  }
  .optical-note {
    font-size: 10px;
    color: #a1a1aa;
  }
  .empty-state {
    border: 1px dashed #c7d2fe;
    padding: 70px 20px;
    text-align: center;
    border-radius: 12px;
    color: #71717a;
  }
  aside {
    background: #fafafa;
    border: 1px solid #e4e4e7;
    border-radius: 15px;
    padding: 23px;
    align-self: start;
  }
  .aside-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 28px;
  }
  .aside-heading h2 {
    font-size: 16px;
    margin: 0;
  }
  .aside-heading > span {
    font-size: 8px;
    letter-spacing: 0.1em;
    color: #a1a1aa;
  }
  .control-label {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    margin-top: 24px;
    margin-bottom: 9px;
    color: #52525b;
  }
  .control-label span {
    font: 10px monospace;
    color: #71717a;
  }
  input[type='range'] {
    width: 100%;
    accent-color: #6366f1;
    height: 3px;
    display: block;
    margin: 16px 0;
  }
  .size-presets {
    display: flex;
    gap: 7px;
    margin-top: 17px;
  }
  .size-presets button {
    border: 1px solid #e4e4e7;
    background: transparent;
    border-radius: 6px;
    font: 10px monospace;
    padding: 4px 11px;
    color: #71717a;
    flex: 1;
  }
  .size-presets button.active {
    background: #e0e7ff;
    border-color: #a5b4fc;
    color: #4f46e5;
  }
  .color-field {
    display: flex;
    gap: 10px;
    align-items: center;
    border: 1px solid #e4e4e7;
    background: #ffffff;
    padding: 7px 9px;
    border-radius: 7px;
  }
  .color-field input {
    border: 0;
    background: none;
    padding: 0;
    width: 22px;
    height: 23px;
    cursor: pointer;
  }
  .color-field span {
    font-size: 10px;
    color: #52525b;
  }
  .aside-divider {
    height: 1px;
    background: #e4e4e7;
    margin: 25px 0;
  }
  aside h3 {
    font-size: 12px;
    margin-bottom: 13px;
  }
  aside pre {
    background: #f4f4f5;
    border-color: #e4e4e7;
    font-size: 9px;
    padding: 12px;
    line-height: 1.85;
    border-radius: 8px;
  }
  .aside-note {
    font-size: 10px;
    color: #71717a;
    line-height: 1.8;
  }
  aside .text-link {
    font-size: 10px;
  }
  .motion-section {
    margin-top: 62px;
    scroll-margin-top: 30px;
  }
  .motion-toolbar {
    border: 1px solid #e4e4e7;
    border-radius: 10px;
    padding: 13px 17px;
    display: flex;
    align-items: center;
    gap: 25px;
    margin-bottom: 20px;
    font-size: 11px;
    color: #52525b;
  }
  .motion-toolbar label {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .motion-toolbar input {
    accent-color: #6366f1;
  }
  .motion-toolbar > span {
    margin-left: auto;
    font-size: 10px;
    color: #a1a1aa;
  }
  .motion-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .motion-demo {
    border: 1px solid #e0e7ff;
    border-radius: 16px;
    padding: 26px;
    background: #fafafa;
  }
  .bell-demo {
    background: #eef2ff;
    border-color: #e0e7ff;
  }
  .motion-stage {
    height: 170px;
    display: grid;
    place-items: center;
  }
  .motion-info {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  .motion-info h3 {
    font: 13px monospace;
    margin: 0 0 7px;
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .motion-info p {
    font-size: 11px;
    color: #71717a;
    margin: 0;
  }
  .demo-buttons {
    display: flex;
    gap: 8px;
  }
  .demo-buttons .button {
    font-size: 11px;
    padding: 8px 13px;
    background: #ffffff55;
  }
  .demo-buttons .subtle {
    border-color: transparent;
    background: transparent;
    color: #71717a;
  }
  .motion-demo > code {
    display: block;
    border-top: 1px solid #e0e7ff;
    margin-top: 20px;
    padding-top: 15px;
    font-size: 10px;
    color: #6366f1;
  }
  .bell-demo > code {
    border-color: #c7d2fe;
    color: #6366f1;
  }
  .motion-footnote {
    font-size: 11px;
    color: #71717a;
    margin-top: 19px;
  }
  .motion-footnote a {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
  @media (max-width: 1000px) {
    .catalog-layout {
      grid-template-columns: 1fr 220px;
      gap: 20px;
    }
    .icon-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .optical-note {
      display: none;
    }
    .motion-toolbar {
      flex-wrap: wrap;
      gap: 10px 22px;
    }
    .motion-toolbar > span {
      margin-left: 0;
      width: 100%;
    }
  }
  @media (max-width: 640px) {
    .catalog-layout {
      display: flex;
      flex-direction: column;
    }
    aside {
      width: 100%;
      display: block;
    }
    .icon-grid {
      gap: 10px;
    }
    .icon-card {
      padding: 14px;
      min-height: 215px;
    }
    .optical-row {
      gap: 15px;
      padding: 16px 12px;
    }
    .optical-row > span:first-child {
      font-size: 8px;
      width: 45px;
    }
    .optical-row > div {
      gap: 12px;
    }
    .motion-grid {
      grid-template-columns: 1fr;
    }
    .motion-section .section-head {
      flex-direction: column;
      gap: 14px;
    }
  }

  .catalog-layout {
    gap: 29px;
  }
  .gallery-toolbar {
    margin-bottom: 20px;
  }
  .search-field {
    border-color: #e8e8ef;
    box-shadow: 0 2px 5px #18181b02;
    border-radius: 12px;
    padding: 12px 15px;
    background: #fff;
  }
  .search-field input {
    font-size: 12px;
  }
  .search-field kbd {
    border-color: #eeeef4;
    background: #fafafa;
  }
  .result-count {
    font-size: 10px;
    color: #a5a5b2;
  }
  .icon-grid {
    gap: 15px;
  }
  .icon-card {
    border-color: #e8e8ef;
    border-radius: 20px;
    padding: 20px;
    background: linear-gradient(#fff, #fefeff);
    box-shadow: 0 2px 5px #18181b02;
    transition:
      transform 0.2s,
      box-shadow 0.2s,
      border-color 0.2s;
  }
  .icon-card:hover {
    background: #fdfdff;
    transform: translateY(-2px);
    border-color: #c7d2fe;
    box-shadow: 0 10px 28px #4f46e50a;
  }
  .icon-card.selected {
    background: radial-gradient(ellipse at 50% 0%, #f0f1ff, #fcfcff);
    border-color: #b4b7fb;
    box-shadow:
      inset 0 1px #fff,
      0 3px 10px #4f46e506;
  }
  .card-caption {
    font-size: 10px;
    color: #9696a5;
  }
  .card-caption > span:last-child {
    color: #b8b8d0;
  }
  .actual-preview span {
    font-size: 8px;
    color: #b2b2c0;
  }
  .optical-row {
    border-color: #e8e8ef;
    border-radius: 15px;
    padding: 21px;
    background: #fdfdfe;
    box-shadow: 0 2px 5px #18181b02;
  }
  .optical-row > span:first-child {
    font-size: 8px;
    color: #aaaab9;
  }
  .optical-row small {
    font-size: 8px;
    color: #aaaab9;
  }
  .optical-note {
    font-size: 9px;
    color: #aaaab9;
  }
  aside {
    position: sticky;
    top: 108px;
    background: linear-gradient(#fefeff, #fafafd);
    border-color: #e8e8f0;
    border-radius: 20px;
    padding: 23px;
    box-shadow: 0 4px 20px #312e8104;
  }
  .aside-heading h2 {
    font-size: 17px;
    font-weight: 500;
  }
  .aside-heading > span {
    font-size: 7px;
    color: #b3b3c1;
  }
  .control-label {
    font-size: 10px;
    color: #7c7c8e;
  }
  .control-label span {
    font-size: 9px;
    color: #a1a1b3;
  }
  .color-field {
    border-color: #e7e7ef;
    border-radius: 8px;
    background: #fff;
  }
  .color-field span {
    font-size: 9px;
    color: #868698;
  }
  .size-presets button {
    border-radius: 6px;
    border-color: #e8e8ef;
    color: #a1a1b0;
    font-size: 9px;
    background: #fff;
  }
  .size-presets button.active {
    background: #f0f0ff;
    border-color: #c7d2fe;
    color: #6366f1;
  }
  .aside-divider {
    background: #eaeaf1;
  }
  aside pre {
    background: #f4f4f9;
    border-color: #e9e9f1;
    border-radius: 10px;
    font-size: 8px;
    padding: 15px;
  }
  aside .text-link {
    font-size: 9px;
  }
  .aside-note {
    font-size: 9px;
    color: #a0a0b0;
  }
  .motion-section {
    margin-top: 76px;
  }
  .motion-section h2 {
    font-size: 32px;
  }
  .motion-section .section-head p {
    font-size: 13px;
    color: #92929f;
  }
  .motion-toolbar {
    border-color: #e8e8ef;
    border-radius: 12px;
    background: #fcfcfe;
    font-size: 10px;
    padding: 14px 17px;
    color: #8b8b9b;
    box-shadow: 0 2px 5px #18181b02;
  }
  .motion-toolbar > span {
    font-size: 9px;
    color: #ababbb;
  }
  .motion-demo {
    border-color: #e6e7f3;
    border-radius: 22px;
    background: radial-gradient(ellipse at 50% 0%, #f3f3ff80, transparent 70%), #fdfdff;
    padding: 28px;
    box-shadow: 0 3px 12px #312e8103;
  }
  .bell-demo {
    background: radial-gradient(ellipse at 50% 0%, #eceeff, transparent 70%), #fdfdff;
  }
  .motion-stage {
    height: 183px;
  }
  .motion-info h3 {
    font-size: 12px;
    font-weight: 400;
  }
  .motion-info p {
    font-size: 11px;
    color: #a1a1b0;
  }
  .demo-buttons .button {
    font-size: 10px;
    padding: 8px 15px;
    background: #fff;
    border-color: #e6e6f0;
    box-shadow: 0 2px 4px #18181b02;
    min-height: 33px;
  }
  .demo-buttons .subtle {
    box-shadow: none;
    border-color: transparent;
    background: transparent;
    color: #a1a1b1;
  }
  .motion-demo > code {
    border-color: #e9e9f5;
    color: #9b9bc0;
    font-size: 9px;
  }
  .motion-footnote {
    font-size: 10px;
    color: #a1a1b1;
  }
  @media (max-width: 1000px) {
    .catalog-layout {
      gap: 20px;
    }
    aside {
      padding: 20px;
    }
    .icon-card {
      padding: 17px;
    }
  }
  @media (max-width: 640px) {
    aside {
      position: static;
      padding: 23px;
    }
    .icon-grid {
      gap: 11px;
    }
    .icon-card {
      padding: 14px;
      border-radius: 17px;
    }
    .motion-section {
      margin-top: 52px;
    }
    .motion-section h2 {
      font-size: 27px;
    }
    .motion-demo {
      border-radius: 19px;
      padding: 24px;
    }
  }
</style>
