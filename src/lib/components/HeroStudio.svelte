<script lang="ts">
  import { catalog } from '#lib/catalog.ts';
  import Folder from '@squircle-icons/svelte/animated/folder';
  import Bell from '@squircle-icons/svelte/animated/bell';
  let view = $state<'collection' | 'motion' | 'code'>('collection');
  let selected = $state('camera');
  let indigo = $state(false);
  let stroke = $state(1.7);
  let open = $state(false);
  let bell = $state<{ play(): void; reset(): void }>();
  const current = $derived(catalog.find((icon) => icon.name === selected)!);
  const Component = $derived(current.component);
  const componentName = $derived(selected[0].toUpperCase() + selected.slice(1));
  const color = $derived(indigo ? '#4f46e5' : '#202024');
  const endScript = '</' + 'script>';
  const example = $derived(
    `<script lang="ts">\n  import ${componentName} from\n    '@squircle-icons/svelte/${selected}';\n${endScript}\n\n<${componentName}\n  size={24}\n  color="currentColor"\n  label="${componentName}"\n/>`,
  );
</script>

<div class="studio" data-testid="hero-studio">
  <div class="studio-aura" aria-hidden="true"></div>
  <div class="playground-heading">
    <span>A SMALL PLAYGROUND</span>
    <h2>Take one for a spin.</h2>
    <p>Try the curves. Give them a little movement.</p>
  </div>
  <div class="view-switch" role="group" aria-label="Playground view">
    <button aria-pressed={view === 'collection'} onclick={() => (view = 'collection')}
      >The collection</button
    >
    <button aria-pressed={view === 'motion'} onclick={() => (view = 'motion')}
      >In motion <span class="tab-dot"></span></button
    >
    <button aria-pressed={view === 'code'} onclick={() => (view = 'code')}>In your app</button>
  </div>
  <div class="studio-window">
    <div class="window-chrome">
      <div class="window-dots" aria-hidden="true"><i></i><i></i><i></i></div>
      <span class="window-location"><span aria-hidden="true">⌘</span> squircle / playground</span
      ><span class="live-label"><i></i> Live components</span>
    </div>
    {#if view === 'collection'}
      <div class="studio-workspace">
        <aside class="studio-sidebar" aria-label="Choose preview icon">
          <div class="sidebar-heading">THE ESSENTIALS <span>06</span></div>
          {#each catalog as icon}<button
              aria-pressed={selected === icon.name}
              onclick={() => (selected = icon.name)}
              ><icon.component size={18} /><span>{icon.name}</span>{#if selected === icon.name}<i
                ></i>{/if}</button
            >{/each}
          <div class="sidebar-foot"><span class="part-dot"></span> Original SVG artwork</div>
        </aside>
        <div class="canvas-panel">
          <div class="canvas-heading">
            <span>{selected}<small>.svg</small></span><span class="canvas-badge">24 × 24</span>
          </div>
          <div class="icon-canvas" style:color>
            <span class="canvas-cross cross-a" aria-hidden="true">+</span><span
              class="canvas-cross cross-b"
              aria-hidden="true">+</span
            >
            <div class="construction-ring" aria-hidden="true"></div>
            <Component size={148} strokeWidth={stroke} /><span class="canvas-ruler mono">24</span>
          </div>
          <div class="optical-samples" style:color>
            {#each [16, 24, 48] as n}<span
                ><Component size={n} strokeWidth={stroke} /><small>{n}px</small></span
              >{/each}
          </div>
        </div>
        <div class="studio-inspector">
          <div class="inspector-heading">
            A LITTLE PERSONALITY <span aria-hidden="true">↗</span>
          </div>
          <label class="inspector-label" for="studio-stroke"
            >Stroke width <span>{stroke}</span></label
          ><input
            id="studio-stroke"
            type="range"
            min="1"
            max="2.5"
            step="0.25"
            bind:value={stroke}
          /><span class="inspector-label">Color</span>
          <div class="color-switch" role="group" aria-label="Preview color">
            <button aria-pressed={!indigo} onclick={() => (indigo = false)}
              ><i class="ink"></i> Ink</button
            ><button aria-pressed={indigo} onclick={() => (indigo = true)}
              ><i class="indigo"></i> Indigo</button
            >
          </div>
          <div class="code-preview">
            <div><span></span> Svelte</div>
            <code
              ><span class="code-accent">import</span>
              {componentName} <span class="code-accent">from</span><br /><span class="code-string"
                >'@squircle-icons/svelte/{selected}'</span
              >;<br /><br />&lt;{componentName}<br />&nbsp; size=&#123;24&#125;<br />&nbsp;
              strokeWidth=&#123;{stroke}&#125;<br />/&gt;</code
            >
          </div>
          <p>One icon. One import.<br />Only what you need.</p>
        </div>
      </div>
    {:else if view === 'motion'}
      <div class="studio-motion">
        <div class="motion-intro">
          <span class="small-label">A LITTLE LIFE</span>
          <h3>Give it a little nudge.</h3>
          <p>One deliberate gesture. A clear place to land.</p>
        </div>
        <div class="motion-examples">
          <button
            aria-label="Toggle playground folder"
            aria-pressed={open}
            onclick={() => (open = !open)}
            ><span class="motion-icon"><Folder size={88} {open} /></span><strong
              >folder <span aria-hidden="true">↗</span></strong
            ><small>Click to {open ? 'close' : 'open'}</small></button
          ><button aria-label="Ring playground bell" onclick={() => bell?.play()}
            ><span class="motion-icon"><Bell size={88} bind:this={bell} /></span><strong
              >bell <span aria-hidden="true">↗</span></strong
            ><small>Click to ring</small></button
          >
        </div>
        <div class="motion-contract">
          <span><i></i> No autoplay</span><span><i></i> No default loop</span><span
            ><i></i> Reduced-motion aware</span
          >
        </div>
      </div>
    {:else}
      <div class="studio-code">
        <div>
          <span class="small-label">NATIVE SVELTE 5</span>
          <h3>A familiar little API.</h3>
          <p>Import an icon. Make it yours.<br />Let it inherit the color of your interface.</p>
          <a href="/docs" class="text-link">Meet the components <span aria-hidden="true">↗</span></a
          >
          <div class="code-proof">
            <Component size={38} /><span>Source SVG → native component</span>
          </div>
        </div>
        <pre><code>{example}</code></pre>
      </div>
    {/if}
    <div class="window-status">
      <span
        ><i></i> First collection <span class="status-divider">/</span> 6 icons · 2 motion studies</span
      ><span>Made for Svelte <span aria-hidden="true">↗</span></span>
    </div>
  </div>
  <p class="studio-caption">A real component, right here. Go ahead, change something.</p>
</div>

<style>
  .playground-heading {
    text-align: center;
    margin: 17px 0 27px;
  }
  .playground-heading > span {
    font-size: 8px;
    letter-spacing: 0.12em;
    color: #a5a5b5;
  }
  .playground-heading h2 {
    font-size: 29px;
    font-weight: 500;
    letter-spacing: -0.04em;
    margin: 12px 0 10px;
  }
  .playground-heading p {
    font-size: 12px;
    color: #a0a0af;
    margin: 0;
  }
  @media (max-width: 650px) {
    .playground-heading {
      margin-top: 6px;
      margin-bottom: 24px;
    }
    .playground-heading h2 {
      font-size: 26px;
    }
    .playground-heading p {
      font-size: 11px;
    }
  }

  .studio {
    position: relative;
    isolation: isolate;
    max-width: 1080px;
    margin: 50px auto 0;
  }
  .studio-aura {
    position: absolute;
    z-index: -1;
    inset: 120px 4% 20px;
    background:
      radial-gradient(ellipse at 25% 55%, #818cf84d, transparent 60%),
      radial-gradient(ellipse at 75% 45%, #c7d2fe99, transparent 60%);
    filter: blur(52px);
    pointer-events: none;
  }
  .view-switch {
    width: max-content;
    max-width: 100%;
    margin: 0 auto 26px;
    display: flex;
    padding: 5px;
    background: #fafafa;
    border: 1px solid #e6e6eb;
    border-radius: 99px;
    box-shadow:
      0 2px 2px #00000002,
      inset 0 1px #fff;
    gap: 4px;
  }
  .view-switch button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 36px;
    padding: 0 21px;
    border: 0;
    border-radius: 99px;
    background: transparent;
    color: #777780;
    font-size: 12px;
    white-space: nowrap;
    transition:
      background 0.2s,
      color 0.2s,
      box-shadow 0.2s;
  }
  .view-switch button[aria-pressed='true'] {
    background: #202024;
    color: #fff;
    box-shadow: 0 2px 5px #18181b20;
  }
  .tab-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #818cf8;
  }
  .studio-window {
    overflow: hidden;
    border: 1px solid #dfdfe7;
    border-radius: 20px;
    background: #fff;
    box-shadow:
      0 1px 2px #18181b05,
      0 16px 36px -20px #312e8124,
      0 40px 90px -42px #312e8133;
  }
  .window-chrome {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 47px;
    padding: 0 20px;
    background: linear-gradient(#fdfdfd, #f8f8fa);
    border-bottom: 1px solid #ebebf0;
    font-size: 10px;
    color: #97979f;
  }
  .window-dots {
    display: flex;
    gap: 6px;
    min-width: 104px;
  }
  .window-dots i {
    width: 8px;
    height: 8px;
    border: 1px solid #dcdce3;
    background: #e7e7ec;
    border-radius: 50%;
  }
  .window-dots i:last-child {
    background: #c7d2fe;
    border-color: #b8c2fc;
  }
  .window-location {
    padding: 3px 13px;
    background: #f0f0f4;
    border-radius: 5px;
    font-size: 9px;
    letter-spacing: 0.01em;
  }
  .window-location > span {
    margin-right: 6px;
  }
  .live-label {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 9px;
    min-width: 104px;
    justify-content: flex-end;
  }
  .live-label i,
  .window-status i,
  .part-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #818cf8;
    display: inline-block;
  }
  .studio-workspace {
    display: grid;
    grid-template-columns: 176px minmax(0, 1fr) 250px;
    min-height: 366px;
  }
  .studio-sidebar {
    border-right: 1px solid #eeeef2;
    padding: 22px 14px;
    display: flex;
    flex-direction: column;
    background: #fcfcfd;
  }
  .sidebar-heading {
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    margin-bottom: 21px;
    font-size: 8px;
    letter-spacing: 0.12em;
    color: #a1a1aa;
  }
  .sidebar-heading span {
    font-family: monospace;
    color: #b4b4bd;
  }
  .studio-sidebar button {
    display: flex;
    align-items: center;
    gap: 12px;
    text-align: left;
    border: 0;
    background: transparent;
    border-radius: 9px;
    min-height: 37px;
    padding: 0 11px;
    font-size: 11px;
    color: #7a7a84;
    margin-bottom: 4px;
  }
  .studio-sidebar button[aria-pressed='true'] {
    color: #4f46e5;
    background: #eeefff;
  }
  .studio-sidebar button i {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #6366f1;
    margin-left: auto;
  }
  .sidebar-foot {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: auto;
    padding: 16px 10px 0;
    font-size: 8px;
    color: #a2a2ad;
    white-space: nowrap;
  }
  .canvas-panel {
    padding: 23px 28px 20px;
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .canvas-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
  }
  .canvas-heading small {
    font-size: 11px;
    color: #b4b4bd;
  }
  .canvas-badge {
    font: 8px monospace;
    color: #a3a3ad;
    background: #f7f7f9;
    padding: 4px 7px;
    border: 1px solid #eeeef2;
    border-radius: 5px;
  }
  .icon-canvas {
    height: 220px;
    display: grid;
    place-items: center;
    position: relative;
    margin: 5px 0 3px;
    background-image: radial-gradient(#d4d4e3 0.65px, transparent 0.65px);
    background-size: 13px 13px;
    mask-image: linear-gradient(transparent, #000 15%, #000 85%, transparent);
  }
  .construction-ring {
    position: absolute;
    width: 154px;
    height: 154px;
    border: 1px dashed #d8d9ee;
    border-radius: 36%;
    pointer-events: none;
  }
  .canvas-cross {
    position: absolute;
    color: #a5b4fc;
    font: 13px monospace;
  }
  .cross-a {
    left: calc(50% - 83px);
    top: 25px;
  }
  .cross-b {
    right: calc(50% - 83px);
    bottom: 25px;
  }
  .canvas-ruler {
    position: absolute;
    right: calc(50% - 96px);
    top: 50%;
    font-size: 8px;
    color: #b5b5c9;
  }
  .optical-samples {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 34px;
    margin-top: auto;
    padding: 10px 0 0;
  }
  .optical-samples > span {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 9px;
    min-width: 35px;
  }
  .optical-samples small {
    font: 8px monospace;
    color: #a5a5af;
  }
  .studio-inspector {
    border-left: 1px solid #eeeef2;
    background: #fcfcfd;
    padding: 24px 21px 14px;
    display: flex;
    flex-direction: column;
  }
  .inspector-heading {
    display: flex;
    justify-content: space-between;
    font-size: 8px;
    letter-spacing: 0.1em;
    color: #a1a1aa;
    margin-bottom: 25px;
  }
  .inspector-heading > span {
    font-size: 12px;
    color: #b4b4bd;
  }
  .inspector-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 10px;
    color: #7a7a84;
    margin-bottom: 7px;
  }
  .inspector-label > span {
    font: 9px monospace;
    color: #9b9ba6;
  }
  input[type='range'] {
    width: 100%;
    height: 3px;
    accent-color: #6366f1;
    margin: 5px 0 23px;
  }
  .color-switch {
    display: flex;
    gap: 5px;
    margin: 1px 0 20px;
  }
  .color-switch button {
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid #e6e6ec;
    background: #fff;
    border-radius: 6px;
    padding: 5px 10px;
    font-size: 9px;
    color: #9b9ba6;
  }
  .color-switch button[aria-pressed='true'] {
    color: #4f46e5;
    border-color: #c7d2fe;
    background: #f1f3ff;
  }
  .color-switch i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }
  .color-switch .ink {
    background: #202024;
  }
  .color-switch .indigo {
    background: #6366f1;
  }
  .code-preview {
    background: #212125;
    border: 1px solid #29292e;
    border-radius: 10px;
    box-shadow: 0 6px 12px #18181b0c;
    padding: 11px 12px;
    color: #e4e4ea;
    font-size: 8px;
    line-height: 1.85;
    overflow: hidden;
  }
  .code-preview > div {
    font-family: monospace;
    font-size: 8px;
    color: #898993;
    border-bottom: 1px solid #35353d;
    padding-bottom: 8px;
    margin-bottom: 9px;
  }
  .code-preview > div > span {
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #818cf8;
    margin-right: 4px;
  }
  .code-preview code {
    font-size: 8px;
    overflow-wrap: anywhere;
  }
  .code-accent {
    color: #a5b4fc;
  }
  .code-string {
    color: #b9b9c9;
  }
  .studio-inspector > p {
    font-size: 8px;
    line-height: 1.6;
    color: #a1a1ad;
    margin: 12px 0 0;
  }
  .window-status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 33px;
    padding: 0 20px;
    border-top: 1px solid #ededf2;
    background: #fdfdfd;
    color: #a1a1aa;
    font-size: 8px;
  }
  .window-status > span:first-child {
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .window-status i {
    width: 4px;
    height: 4px;
  }
  .status-divider {
    margin: 0 2px;
    color: #d4d4dc;
  }
  .window-status > span:last-child {
    color: #9999a5;
  }
  .window-status > span:last-child > span {
    margin-left: 8px;
    color: #b0b0be;
  }
  .studio-caption {
    margin: 25px 0 0;
    font-size: 11px;
    color: #9696a1;
    text-align: center;
  }
  .studio-motion {
    min-height: 366px;
    padding: 28px 38px 25px;
    text-align: center;
    background: radial-gradient(ellipse at 50% 100%, #f5f5ff, transparent 70%);
  }
  .small-label {
    font-size: 8px;
    letter-spacing: 0.12em;
    color: #9898a5;
  }
  .motion-intro h3 {
    font-size: 23px;
    font-weight: 500;
    margin: 6px 0;
  }
  .motion-intro p {
    font-size: 11px;
    color: #93939f;
    margin: 0;
  }
  .motion-examples {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    max-width: 500px;
    margin: 22px auto;
  }
  .motion-examples button {
    border: 1px solid #e4e5ef;
    background: #ffffffcc;
    border-radius: 15px;
    box-shadow: 0 5px 10px #312e8103;
    padding: 20px 23px 15px;
    color: #202024;
    text-align: left;
  }
  .motion-icon {
    display: grid;
    place-items: center;
    height: 105px;
    color: #4f46e5;
  }
  .motion-examples strong {
    font-size: 11px;
    font-weight: 450;
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
  }
  .motion-examples strong > span {
    color: #a5b4fc;
  }
  .motion-examples small {
    font-size: 9px;
    color: #a1a1ad;
  }
  .motion-contract {
    display: flex;
    justify-content: center;
    gap: 25px;
    font-size: 8px;
    color: #9c9caa;
  }
  .motion-contract span {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .motion-contract i {
    height: 3px;
    width: 3px;
    border-radius: 50%;
    background: #a5b4fc;
  }
  .studio-code {
    min-height: 366px;
    padding: 46px 65px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
    background: radial-gradient(ellipse at 90% 100%, #f1f2ff, transparent 65%);
  }
  .studio-code h3 {
    font-size: 30px;
    font-weight: 500;
    line-height: 1.1;
    letter-spacing: -0.04em;
    margin: 14px 0 18px;
  }
  .studio-code p {
    font-size: 13px;
    line-height: 1.7;
    color: #93939f;
    margin-bottom: 20px;
  }
  .studio-code .text-link {
    font-size: 11px;
  }
  .studio-code pre {
    margin: 0;
    background: #212125;
    color: #d4d4df;
    border: 1px solid #30303a;
    box-shadow: 0 14px 32px #312e8114;
    font-size: 11px;
    line-height: 1.9;
    padding: 23px;
    border-radius: 13px;
  }
  .code-proof {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 28px;
    color: #6366f1;
  }
  .code-proof > span {
    font-size: 9px;
    color: #9696a5;
  }
  @media (max-width: 850px) {
    .studio-workspace {
      grid-template-columns: 140px minmax(0, 1fr) 210px;
    }
    .studio-sidebar {
      padding-inline: 8px;
    }
    .sidebar-heading {
      font-size: 7px;
      padding-inline: 6px;
    }
    .sidebar-foot {
      font-size: 7px;
      padding-inline: 6px;
    }
    .studio-sidebar button {
      font-size: 10px;
      gap: 8px;
    }
    .canvas-panel {
      padding: 23px 16px 20px;
    }
    .studio-inspector {
      padding-inline: 15px;
    }
    .studio-code {
      padding: 38px;
      gap: 25px;
    }
    .canvas-heading {
      font-size: 10px;
    }
    .construction-ring {
      width: 140px;
      height: 140px;
    }
  }
  @media (max-width: 650px) {
    .studio {
      margin-top: 34px;
    }
    .view-switch {
      padding: 4px;
      gap: 1px;
      margin-bottom: 20px;
    }
    .view-switch button {
      padding: 0 13px;
      min-height: 33px;
      font-size: 10px;
    }
    .studio-window {
      border-radius: 14px;
    }
    .window-chrome {
      padding: 0 12px;
      height: 37px;
    }
    .window-dots {
      min-width: 40px;
      gap: 4px;
    }
    .window-dots i {
      width: 6px;
      height: 6px;
    }
    .window-location {
      font-size: 7px;
      padding: 2px 8px;
    }
    .live-label {
      min-width: auto;
      font-size: 0;
      gap: 0;
    }
    .live-label i {
      width: 4px;
      height: 4px;
    }
    .studio-workspace {
      grid-template-columns: 1fr;
      min-height: 0;
    }
    .studio-sidebar {
      display: none;
    }
    .canvas-panel {
      padding: 18px 20px 20px;
    }
    .icon-canvas {
      height: 205px;
    }
    .optical-samples {
      gap: 34px;
      padding-top: 6px;
    }
    .studio-inspector {
      padding: 17px 20px;
      border-left: 0;
      border-top: 1px solid #eeeef2;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 7px 20px;
      align-items: center;
    }
    .inspector-heading,
    .code-preview,
    .studio-inspector > p {
      display: none;
    }
    .inspector-label {
      font-size: 9px;
      margin: 0;
    }
    .studio-inspector > .inspector-label:first-of-type {
      grid-column: 1;
    }
    .studio-inspector input {
      grid-column: 1;
      margin: 4px 0 0;
      grid-row: 2;
    }
    .studio-inspector > .inspector-label:nth-of-type(2) {
      grid-column: 2;
      grid-row: 1;
    }
    .color-switch {
      grid-column: 2;
      grid-row: 2;
      margin: 0;
    }
    .color-switch button {
      flex: 1;
      justify-content: center;
      padding: 4px 7px;
      font-size: 8px;
    }
    .window-status {
      padding: 0 12px;
      font-size: 7px;
      height: 29px;
    }
    .window-status > span:last-child {
      display: none;
    }
    .studio-caption {
      font-size: 10px;
      margin-top: 18px;
    }
    .studio-motion {
      padding: 23px 16px;
      min-height: 0;
    }
    .motion-intro h3 {
      font-size: 21px;
    }
    .motion-examples {
      gap: 10px;
    }
    .motion-examples button {
      padding: 14px;
    }
    .motion-icon {
      height: 100px;
    }
    .motion-contract {
      gap: 12px;
      font-size: 6px;
    }
    .studio-code {
      grid-template-columns: 1fr;
      padding: 28px 22px;
      gap: 25px;
    }
    .studio-code h3 {
      font-size: 28px;
    }
    .studio-code p {
      font-size: 12px;
    }
    .studio-code pre {
      font-size: 10px;
    }
    .code-proof {
      display: none;
    }
  }
</style>
