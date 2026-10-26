<script lang="ts">
  import { onMount, tick } from 'svelte';
  import Folder from 'squircle-icons-svelte/folder';
  import AnimatedFolder from 'squircle-icons-svelte/animated/folder';
  import FolderStudy from '#lib/components/FolderStudy.svelte';

  const variants = [
    {
      letter: 'A',
      name: 'Considered',
      duration: 220,
      easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      note: 'The current library motion. A quick response with a soft landing.',
    },
    {
      letter: 'B',
      name: 'Unhurried',
      duration: 280,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      note: 'A slower departure and a little more time to notice the gesture.',
    },
    {
      letter: 'C',
      name: 'Decisive',
      duration: 160,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      note: 'A short, immediate gesture that settles early.',
    },
  ];
  let selected = $state(0);
  let surface = $state<'light' | 'dark'>('light');
  let ink = $state<'ink' | 'indigo'>('ink');
  let grid = $state(true);
  let stroke = $state(1.75);
  let speed = $state(1);
  let forceReduced = $state(false);
  let systemReduced = $state(false);
  let supported = $state(true);
  let mounted = $state(true);
  let hover = $state(false);
  let controlled = $state(false);
  let checked = $state<string[]>([]);
  let study = $state<FolderStudy>();
  let comparisons: FolderStudy[] = [];
  let liveIcons: { reset(): void }[] = [];
  let mainHost: HTMLDivElement;
  let timeline = $state(0);
  let phase = $state('Closed');
  const variant = $derived(variants[selected]);
  const reduced = $derived(forceReduced || systemReduced);
  const color = $derived(
    ink === 'indigo'
      ? surface === 'dark'
        ? '#a5b4fc'
        : '#4f46e5'
      : surface === 'dark'
        ? '#f4f4f5'
        : '#27272a',
  );

  onMount(() => {
    supported = typeof Element.prototype.animate === 'function';
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    systemReduced = media.matches;
    const change = () => {
      systemReduced = media.matches;
    };
    media.addEventListener('change', change);
    // Observe the lab component's readout without polling or a perpetual frame loop.
    const observer = new MutationObserver(() => {
      const element = mainHost.querySelector('[data-progress]');
      timeline = Number(element?.getAttribute('data-progress') ?? 0);
      phase = element?.getAttribute('data-status') ?? 'Closed';
    });
    observer.observe(mainHost, {
      attributes: true,
      subtree: true,
      attributeFilter: ['data-progress', 'data-status'],
    });
    return () => {
      media.removeEventListener('change', change);
      observer.disconnect();
    };
  });

  async function resetAll() {
    await Promise.all([study?.reset(), ...comparisons.map((item) => item?.reset())]);
    controlled = false;
    hover = false;
    await tick();
    liveIcons.forEach((icon) => icon?.reset());
  }
  function selectVariant(index: number) {
    void study?.reset();
    selected = index;
  }
</script>

<svelte:head
  ><title>Folder Lab — Squircle Icons</title><meta
    name="description"
    content="A hands-on workbench for reviewing Squircle Folder geometry, animation timing, and real component behavior."
  /></svelte:head
>

<section class="lab-heading">
  <h1>Folder <span>lab</span></h1>
  <a href="/icons" aria-label="Back to icons">Back to icons <span aria-hidden="true">↗</span></a>
</section>

<div class="workbench" data-testid="folder-lab">
  <aside class="controls" aria-label="Study settings">
    <div class="panel-title">Settings</div>
    <label class="field-label" for="lab-icon">Icon</label>
    <div class="icon-select">
      <Folder size={20} /><select id="lab-icon"
        ><option value="folder">Folder</option><option disabled>Bell — coming next</option><option
          disabled>Camera — later study</option
        ><option disabled>Heart — later study</option><option disabled>Search — later study</option
        ><option disabled>Settings — later study</option></select
      >
    </div>

    <div class="setting">
      <span class="field-label">Surface</span>
      <div class="segmented" aria-label="Preview surface">
        <button aria-pressed={surface === 'light'} onclick={() => (surface = 'light')}>Light</button
        ><button aria-pressed={surface === 'dark'} onclick={() => (surface = 'dark')}>Dark</button>
      </div>
    </div>
    <div class="setting">
      <span class="field-label">Stroke color</span>
      <div class="ink-options">
        <button
          class="swatch ink"
          aria-label="Ink stroke"
          aria-pressed={ink === 'ink'}
          onclick={() => (ink = 'ink')}
        ></button><button
          class="swatch indigo"
          aria-label="Indigo stroke"
          aria-pressed={ink === 'indigo'}
          onclick={() => (ink = 'indigo')}
        ></button><span>{ink === 'ink' ? 'Ink' : 'Indigo'}</span>
      </div>
    </div>
    <div class="setting">
      <label class="field-label range-label" for="lab-stroke"
        >Stroke width <output>{stroke.toFixed(2)}</output></label
      ><input id="lab-stroke" type="range" min="1" max="2.5" step="0.05" bind:value={stroke} />
      <div class="range-ends mono"><span>1.00</span><span>2.50</span></div>
    </div>
    <div class="setting">
      <label class="field-label" for="lab-speed">Playback speed</label><select
        id="lab-speed"
        bind:value={speed}
        ><option value={1}>1× · Real time</option><option value={0.5}>0.5× · Slow</option><option
          value={0.25}>0.25× · Frame study</option
        ></select
      >
    </div>
    <label class="switch-row"
      ><span>Drawing grid</span><input type="checkbox" bind:checked={grid} /></label
    >
    <label class="switch-row"
      ><span>Reduce motion</span><input type="checkbox" bind:checked={forceReduced} /></label
    >
    <p class="hint preference">
      {systemReduced
        ? 'Your system requests reduced motion.'
        : 'System preference is respected automatically.'}
    </p>
  </aside>

  <section class="canvas-panel" aria-label="Folder motion workbench">
    <div class="canvas-topline">
      <span><b>folder</b><span class="muted">.svelte</span></span><span class="mono"
        >24 × 24 / {variant.letter}</span
      >
    </div>
    <div class:dark={surface === 'dark'} class="canvas" style:color>
      <div class="drawing" class:gridded={grid}>
        <span class="axis horizontal" aria-hidden="true"></span><span
          class="axis vertical"
          aria-hidden="true"
        ></span>
        <div bind:this={mainHost} data-testid="main-study">
          <FolderStudy
            bind:this={study}
            duration={variant.duration}
            easing={variant.easing}
            {speed}
            {reduced}
            {color}
            strokeWidth={stroke}
            name="Folder motion preview"
          />
        </div>
        <span class="grid-number mono">24</span>
      </div>
      <div class="state-caption" aria-live="polite">
        <span class="state-dot"></span>{phase}<span class="mono"
          >{variant.duration} ms · {speed}×</span
        >
      </div>
    </div>
    <div class="transport">
      {#if !supported}<p class="motion-notice">
          Animation playback is unavailable in this browser. Open and Closed states are still
          available.
        </p>{/if}
      <div class="transport-buttons">
        <button
          class="play-button"
          onclick={() => void study?.play()}
          disabled={reduced || !supported}><span aria-hidden="true">▶</span> Play</button
        ><button onclick={() => study?.pause()} disabled={reduced || !supported}>Pause</button
        ><button onclick={() => void study?.reset()}>Reset</button>
        <div class="state-buttons" aria-label="Folder state">
          <button onclick={() => void study?.setOpen(false)}>Closed</button><button
            onclick={() => void study?.setOpen(true)}>Open</button
          >
        </div>
      </div>
      <div class="timeline-label">
        <label for="lab-timeline">Opening timeline</label><output
          class="mono"
          for="lab-timeline"
          data-testid="timeline-value">{timeline}%</output
        >
      </div>
      <input
        id="lab-timeline"
        aria-describedby="timeline-help"
        type="range"
        min="0"
        max="100"
        step="1"
        value={timeline}
        disabled={reduced || !supported}
        oninput={(event) => void study?.seek(Number(event.currentTarget.value))}
      />
      <div class="range-ends mono"><span>0% · CLOSED</span><span>100% · OPEN</span></div>
      <p class="hint" id="timeline-help">
        {reduced
          ? 'Motion is reduced. Use Open and Closed to inspect the resting states.'
          : 'Scrub to pause at any point in the opening gesture. Play resumes from that frame.'}
      </p>
    </div>
  </section>
</div>

<section
  class="optical-row"
  aria-label="Folder optical sizes"
  style:color
  class:dark={surface === 'dark'}
>
  <div class="optical-title">Actual size</div>
  <div class="sizes">
    {#each [16, 20, 24, 48] as size}<div class="size-sample">
        <div><Folder {size} strokeWidth={stroke} /></div>
        <span class="mono">{size}px</span>
      </div>{/each}
  </div>
  <div class="endpoints">
    <div><Folder size={40} strokeWidth={stroke} /><span class="mono">CLOSED</span></div>
    <div>
      <AnimatedFolder size={40} open reducedMotion="always" strokeWidth={stroke} /><span
        class="mono">OPEN</span
      >
    </div>
  </div>
</section>

<section class="comparison-section" aria-labelledby="compare-heading">
  <div class="section-head">
    <div>
      <h2 id="compare-heading">Compare motion</h2>
    </div>
    <button
      class="button"
      onclick={() => comparisons.forEach((item) => void item.play())}
      disabled={reduced || !supported}>Play all <span aria-hidden="true">↗</span></button
    >
  </div>
  <div class="comparison-grid">
    {#each variants as item, index}<article
        class:selected={selected === index}
        data-testid={'variant-' + item.letter}
      >
        <div class="comparison-heading">
          <span class="letter mono">{item.letter}</span><span class="mono">{item.duration} ms</span
          >{#if index === 0}<span class="current-label">Library default</span>{:else}<span
              class="current-label">Experiment</span
            >{/if}
        </div>
        <div class="comparison-preview">
          <FolderStudy
            bind:this={comparisons[index]}
            duration={item.duration}
            easing={item.easing}
            {speed}
            {reduced}
            size={72}
            strokeWidth={stroke}
            color="#4f46e5"
            name={'Folder study ' + item.letter}
          />
        </div>
        <h3>{item.name}</h3>

        <div class="comparison-actions">
          <button
            onclick={() => void comparisons[index]?.play()}
            disabled={reduced || !supported}
            aria-label={'Play study ' + item.letter}>▶ Preview</button
          ><button aria-pressed={selected === index} onclick={() => selectVariant(index)}
            >{selected === index ? 'Selected' : 'Use study'}<span aria-hidden="true"
              >{selected === index ? '✓' : '↗'}</span
            ></button
          >
        </div>
      </article>{/each}
  </div>
  <p class="experiment-note">
    A uses the shipped motion. B and C change timing and easing for this lab only. Choosing a study
    does not change the library or homepage.
  </p>
</section>

<details class="checks-details">
  <summary>Behavior &amp; review <span>Hover, state, instances and visual checks</span></summary>
  <section class="checks-section" aria-label="Real component behavior">
    <div class="behavior-panel">
      <h2>Component behavior</h2>
      <p>These instances use the library’s normal controls and timing.</p>
      <div class="behavior-options">
        <label><input type="checkbox" bind:checked={hover} /> Hover to preview</label><label
          ><input type="checkbox" bind:checked={controlled} /> Keep open</label
        ><label><input type="checkbox" bind:checked={mounted} /> Mount instances</label>
      </div>
      <div class="live-stage" data-testid="live-instances">
        {#if mounted}{#each [0, 1, 2] as index}<button
              class="live-folder"
              aria-label={'Toggle live folder ' + (index + 1)}
              aria-pressed={controlled}
              onclick={() => (controlled = !controlled)}
              ><AnimatedFolder
                bind:this={liveIcons[index]}
                size={48}
                {hover}
                open={controlled}
                strokeWidth={stroke}
                reducedMotion={reduced ? 'always' : 'system'}
              /><span class="mono">0{index + 1}</span></button
            >{/each}{:else}<p class="unmounted">
            Instances unmounted. Their motion and listeners are cleaned up.
          </p>{/if}
      </div>
      <button class="text-reset" onclick={resetAll}>Reset every instance ↺</button>
    </div>
    <div class="review-panel">
      <h2>Visual checks</h2>

      {#each ['Recognizable at 16px', 'Balanced panel spacing', 'A natural start and finish', 'Clear in both light and dark'] as item}<label
          class="review-check"
          ><input type="checkbox" value={item} bind:group={checked} /><span>{item}</span></label
        >{/each}
      <div class="review-count">
        <span class="mono">{checked.length} / 4 REVIEWED</span><span>This session only</span>
      </div>
    </div>
  </section>
</details>

<style>
  .lab-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  h1 {
    font-size: 24px;
    letter-spacing: -0.04em;
    margin: 0;
    font-weight: 550;
  }
  h1 span {
    color: #a1a1aa;
    font-weight: 400;
    margin-left: 5px;
  }
  .lab-heading a {
    font-size: 12px;
    color: #71717a;
  }
  .lab-heading a span {
    margin-left: 6px;
  }
  .workbench {
    display: grid;
    grid-template-columns: 232px minmax(0, 1fr);
    border: 1px solid #e4e4e7;
    border-radius: 10px;
    overflow: hidden;
  }
  .controls {
    padding: 22px;
    background: #fafafa;
    border-right: 1px solid #e4e4e7;
  }
  .panel-title {
    font-size: 13px;
    font-weight: 550;
    margin-bottom: 22px;
  }
  .field-label {
    display: block;
    color: #71717a;
    font-size: 12px;
    margin-bottom: 8px;
  }
  select {
    width: 100%;
    border: 1px solid #e4e4e7;
    border-radius: 6px;
    padding: 8px;
    background: #fff;
    color: #27272a;
    font-size: 12px;
    min-height: 36px;
  }
  .icon-select {
    position: relative;
    display: flex;
    align-items: center;
  }
  .icon-select :global(svg) {
    position: absolute;
    left: 10px;
    color: #6366f1;
    pointer-events: none;
  }
  .icon-select select {
    padding-left: 40px;
  }
  .setting {
    margin-top: 19px;
  }
  .segmented {
    display: flex;
    padding: 3px;
    background: #eeeef1;
    border-radius: 7px;
    gap: 3px;
  }
  .segmented button {
    flex: 1;
    border: 0;
    padding: 5px;
    background: transparent;
    color: #71717a;
    border-radius: 4px;
    font-size: 12px;
  }
  .segmented button[aria-pressed='true'] {
    color: #18181b;
    background: #fff;
  }
  .ink-options {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #71717a;
  }
  .ink-options > span {
    margin-left: 5px;
  }
  .swatch {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 4px solid #fafafa;
    box-shadow: 0 0 0 1px #e4e4e7;
  }
  .swatch[aria-pressed='true'] {
    box-shadow: 0 0 0 1px #6366f1;
  }
  .ink {
    background: #27272a;
  }
  .indigo {
    background: #4f46e5;
  }
  .range-label {
    display: flex;
    justify-content: space-between;
  }
  output,
  .range-ends {
    font-variant-numeric: tabular-nums;
  }
  .range-label output {
    color: #6366f1;
  }
  input[type='range'] {
    width: 100%;
    accent-color: #6366f1;
    height: 18px;
    margin: 0;
    cursor: pointer;
  }
  .range-ends {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    color: #a1a1aa;
    margin-top: 4px;
  }
  input[type='checkbox'] {
    accent-color: #4f46e5;
    width: 15px;
    height: 15px;
    flex-shrink: 0;
    cursor: pointer;
  }
  .switch-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: #71717a;
    font-size: 12px;
    margin-top: 20px;
    cursor: pointer;
  }
  .switch-row + .switch-row {
    margin-top: 12px;
  }
  .hint {
    font-size: 11px;
    color: #92929e;
    line-height: 1.7;
    margin: 10px 0 0;
  }
  .preference {
    font-size: 10px;
  }
  .canvas-panel {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .canvas-topline {
    padding: 14px 22px;
    border-bottom: 1px solid #f0f0f2;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
  }
  .canvas-topline b {
    font-weight: 500;
  }
  .canvas-topline > .mono {
    color: #a1a1aa;
    font-size: 10px;
    align-self: center;
  }
  .canvas {
    flex: 1;
    min-height: 328px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 34px;
    padding: 36px 20px 22px;
    background: #fff;
  }
  .canvas.dark {
    background: #1c1c22;
  }
  .drawing {
    width: 168px;
    height: 168px;
    display: grid;
    place-items: center;
    position: relative;
    border: 1px solid transparent;
  }
  .drawing.gridded {
    border-color: #a5b4fc55;
    background-image:
      linear-gradient(to right, #a5b4fc24 1px, transparent 1px),
      linear-gradient(to bottom, #a5b4fc24 1px, transparent 1px);
    background-size: 7px 7px;
    background-position: center;
  }
  .axis {
    position: absolute;
    pointer-events: none;
    display: none;
    background: #818cf844;
  }
  .gridded .axis {
    display: block;
  }
  .horizontal {
    height: 1px;
    width: calc(100% + 24px);
  }
  .vertical {
    width: 1px;
    height: calc(100% + 24px);
  }
  .grid-number {
    position: absolute;
    bottom: -18px;
    right: -1px;
    font-size: 9px;
    color: #a1a1aa;
  }
  .state-caption {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 11px;
    color: #71717a;
  }
  .dark .state-caption {
    color: #b4b4c5;
  }
  .state-caption > .mono {
    font-size: 10px;
    color: #a1a1aa;
    margin-left: 10px;
  }
  .state-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #818cf8;
  }
  .transport {
    border-top: 1px solid #f0f0f2;
    padding: 20px 22px;
  }
  .transport-buttons {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 19px;
  }
  .transport button,
  .comparison-actions button {
    border: 1px solid #e4e4e7;
    border-radius: 5px;
    background: #fff;
    padding: 6px 12px;
    min-height: 32px;
    font-size: 12px;
    color: #52525b;
  }
  .transport .play-button {
    background: #27272a;
    border-color: #27272a;
    color: white;
  }
  .play-button > span {
    font-size: 9px;
    margin-right: 6px;
  }
  .state-buttons {
    display: flex;
    gap: 5px;
    margin-left: auto;
  }
  .timeline-label {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #71717a;
    margin-bottom: 6px;
  }
  .timeline-label output {
    color: #6366f1;
  }
  .motion-notice {
    font-size: 11px;
    color: #6366f1;
  }
  button:disabled,
  input:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  button {
    transition:
      border-color 0.15s,
      background-color 0.15s;
  }
  .optical-row {
    display: grid;
    grid-template-columns: 206px 1fr 180px;
    align-items: center;
    padding: 20px 22px;
    border-bottom: 1px solid #e4e4e7;
    gap: 24px;
  }
  .optical-row.dark {
    background: #1c1c22;
    border-radius: 0 0 8px 8px;
    border-color: #353540;
  }
  .optical-title {
    font-size: 12px;
    color: #92929e;
  }
  .sizes {
    display: flex;
    justify-content: space-around;
    align-items: end;
    gap: 16px;
  }
  .size-sample,
  .endpoints > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  .size-sample > div {
    min-height: 48px;
    display: grid;
    place-items: center;
  }
  .size-sample span,
  .endpoints span {
    font-size: 9px;
    color: #a1a1aa;
  }
  .endpoints {
    display: flex;
    justify-content: space-around;
    border-left: 1px solid #e4e4e7;
    padding-left: 20px;
    gap: 20px;
  }
  .comparison-section {
    padding-top: 28px;
  }
  .section-head {
    align-items: center;
    margin-bottom: 16px;
  }
  .section-head h2 {
    font-size: 16px;
    letter-spacing: -0.02em;
  }
  .section-head .button {
    font-size: 11px;
    min-height: 32px;
    padding: 6px 12px;
    border-radius: 5px;
  }
  .comparison-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }
  .comparison-grid article {
    border: 1px solid #e4e4e7;
    padding: 16px;
    border-radius: 8px;
  }
  .comparison-grid article.selected {
    border-color: #a5b4fc;
  }
  .comparison-heading {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #92929e;
    font-size: 10px;
  }
  .letter {
    font-size: 11px;
    color: #52525b;
  }
  .selected .letter {
    color: #4f46e5;
  }
  .current-label {
    margin-left: auto;
    font-size: 10px;
  }
  .comparison-preview {
    height: 110px;
    display: grid;
    place-items: center;
  }
  .comparison-grid h3 {
    font-size: 13px;
    margin-bottom: 13px;
  }
  .comparison-actions {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }
  .comparison-actions button {
    font-size: 11px;
    padding-inline: 10px;
  }
  .comparison-actions button > span {
    margin-left: 12px;
  }
  .comparison-actions button[aria-pressed='true'] {
    border-color: #c7d2fe;
    color: #4f46e5;
    background: #f8f9ff;
  }
  .experiment-note {
    color: #92929e;
    font-size: 11px;
    margin: 14px 0 0;
    max-width: 740px;
  }
  .checks-details {
    margin-top: 28px;
    border-top: 1px solid #e4e4e7;
  }
  summary {
    cursor: pointer;
    padding: 18px 0;
    font-size: 13px;
    color: #52525b;
  }
  summary span {
    margin-left: 14px;
    font-size: 11px;
    color: #a1a1aa;
  }
  summary:focus-visible {
    outline: 3px solid #6366f1;
    outline-offset: 4px;
  }
  .checks-section {
    display: grid;
    grid-template-columns: 1.15fr 1fr;
    gap: 24px;
    padding-bottom: 12px;
  }
  .behavior-panel,
  .review-panel {
    padding: 22px;
    border: 1px solid #e4e4e7;
    border-radius: 8px;
  }
  .checks-section h2 {
    font-size: 16px;
    margin-bottom: 10px;
    letter-spacing: -0.02em;
  }
  .checks-section p {
    color: #92929e;
    font-size: 11px;
    margin-bottom: 20px;
  }
  .behavior-options {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
  }
  .behavior-options label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: #71717a;
    cursor: pointer;
  }
  .live-stage {
    display: flex;
    align-items: center;
    justify-content: space-around;
    min-height: 128px;
    margin: 18px 0 10px;
    background: #fafafa;
    border-radius: 6px;
  }
  .live-folder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    border: 0;
    background: transparent;
    color: #4f46e5;
    padding: 16px 8px;
    border-radius: 5px;
  }
  .live-folder span {
    font-size: 9px;
    color: #a1a1aa;
  }
  .unmounted {
    text-align: center;
    padding: 14px;
    margin: 0 !important;
  }
  .text-reset {
    border: 0;
    color: #71717a;
    background: transparent;
    font-size: 11px;
    padding: 6px 0;
  }
  .review-check {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    font-size: 12px;
    color: #71717a;
    cursor: pointer;
    border-bottom: 1px solid #f4f4f5;
  }
  .review-check input {
    margin: 0;
  }
  .review-count {
    display: flex;
    justify-content: space-between;
    margin-top: 18px;
    font-size: 10px;
    color: #a1a1aa;
  }
  .review-count .mono {
    color: #6366f1;
  }
  @media (hover: hover) and (pointer: fine) {
    button:not(:disabled):hover {
      border-color: #a5b4fc;
    }
    .live-folder:hover {
      background: #eef2ff;
    }
  }
</style>
