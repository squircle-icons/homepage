<script lang="ts">
  import Folder from 'squircle-icons-svelte/folder';
  import StaticFolderPreview, { type Margins } from '#lib/components/StaticFolderPreview.svelte';
  let kind = $state<'outline' | 'filled'>('outline');
  let surface = $state<'light' | 'dark'>('light');
  let ink = $state<'ink' | 'indigo'>('ink');
  let grid = $state(true);
  let guides = $state(true);
  let stroke = $state(1.75);
  let sizeX = $state(100);
  let sizeY = $state(100);
  let linked = $state(false);
  let checked = $state<string[]>([]);
  let margins = $state<Margins>({
    variant: 'outline',
    left: 2.125,
    right: 2.125,
    top: 4.125,
    bottom: 4.125,
    width: 19.75,
    height: 15.75,
    sourceWidth: 18,
    sourceHeight: 14,
  });
  const color = $derived(
    ink === 'indigo'
      ? surface === 'dark'
        ? '#a5b4fc'
        : '#4f46e5'
      : surface === 'dark'
        ? '#f4f4f5'
        : '#27272a',
  );
  const lineWeight = $derived(kind === 'outline' ? stroke : 0);
  const maximumX = $derived(((24 - lineWeight) / margins.sourceWidth) * 100);
  const maximumY = $derived((margins.sourceWidth * sizeX) / margins.sourceHeight);
  const gridMaximumY = $derived(((24 - lineWeight) / margins.sourceHeight) * 100);
  const limit = (axis: 'x' | 'y') => (axis === 'x' ? maximumX : maximumY);
  const bounded = (value: number, max: number) =>
    Math.min(max, Math.max(1, Number.isFinite(value) ? value : 100));
  function resize(axis: 'x' | 'y', value: number) {
    if (margins.variant !== kind) return;
    if (linked) {
      const requested = (Number.isFinite(value) ? value : 100) / (axis === 'x' ? sizeX : sizeY);
      const ratio = Math.min(
        maximumX / sizeX,
        gridMaximumY / sizeY,
        Math.max(1 / sizeX, 1 / sizeY, requested),
      );
      sizeX *= ratio;
      sizeY *= ratio;
      return;
    }
    if (axis === 'x') {
      sizeX = bounded(value, maximumX);
      sizeY = Math.min(sizeY, (margins.sourceWidth * sizeX) / margins.sourceHeight);
    } else sizeY = bounded(value, maximumY);
  }
  function matchLeft() {
    if (margins.variant !== kind) return;
    linked = false;
    sizeY = maximumY;
  }
  // Changing style/weight can change the available space. Clamp from measured
  // source bounds, rather than imposing a shared percentage ceiling.
  $effect(() => {
    if (margins.variant !== kind) return;
    const nextX = bounded(sizeX, maximumX);
    const nextY = bounded(sizeY, (margins.sourceWidth * nextX) / margins.sourceHeight);
    if (Math.abs(nextX - sizeX) > 0.000001 || Math.abs(nextY - sizeY) > 0.000001) {
      if (linked && (nextX < sizeX || nextY < sizeY)) {
        const ratio = Math.min(nextX / sizeX, nextY / sizeY);
        sizeX *= ratio;
        sizeY *= ratio;
      } else {
        sizeX = nextX;
        sizeY = nextY;
      }
    }
  });
  function reset() {
    sizeX = sizeY = 100;
    stroke = 1.75;
    linked = false;
  }
  function measure(value: Margins) {
    margins = value;
  }
  const balanced = $derived(
    Math.abs(margins.left - margins.right) < 0.001 &&
      Math.abs(margins.top - margins.bottom) < 0.001 &&
      [margins.left, margins.right, margins.top, margins.bottom].every(
        (value) => value >= -0.00001,
      ),
  );
</script>

<svelte:head
  ><title>Folder Lab — Squircle Icons</title><meta
    name="description"
    content="A static icon workbench for outline and filled Folder designs, stroke weight, X/Y sizing and balanced spacing."
  /></svelte:head
>

<section class="lab-heading">
  <h1>Folder <span>lab</span></h1>
  <a href="/icons" aria-label="Back to icons">Back to icons <span aria-hidden="true">↗</span></a>
</section>
<div class="workbench" data-testid="folder-lab">
  <aside class="controls" aria-label="Icon settings">
    <div class="panel-title">Settings <span>Static study</span></div>
    <label class="field-label" for="lab-icon">Icon</label>
    <div class="icon-select">
      <Folder size={20} /><select id="lab-icon"
        ><option value="folder">Folder</option><option disabled>Bell — later study</option><option
          disabled>Camera — later study</option
        ><option disabled>Heart — later study</option><option disabled>Search — later study</option
        ><option disabled>Settings — later study</option></select
      >
    </div>
    <fieldset class="setting">
      <legend class="field-label">Style</legend>
      <div class="segmented">
        <button aria-pressed={kind === 'outline'} onclick={() => (kind = 'outline')}>Outline</button
        ><button aria-pressed={kind === 'filled'} onclick={() => (kind = 'filled')}>Filled</button>
      </div>
    </fieldset>
    <div class="setting">
      <label class="field-label range-label" for="lab-stroke"
        >Stroke width <output>{kind === 'outline' ? stroke.toFixed(2) : '—'}</output></label
      >
      <div class="stroke-control">
        <button
          class="small-button"
          aria-label="Decrease stroke width"
          disabled={kind === 'filled' || stroke <= 1}
          onclick={() => (stroke = Math.max(1, +(stroke - 0.25).toFixed(2)))}>−</button
        ><input
          id="lab-stroke"
          type="range"
          min="1"
          max="2.5"
          step="0.05"
          bind:value={stroke}
          disabled={kind === 'filled'}
        /><button
          class="small-button"
          aria-label="Increase stroke width"
          disabled={kind === 'filled' || stroke >= 2.5}
          onclick={() => (stroke = Math.min(2.5, +(stroke + 0.25).toFixed(2)))}>+</button
        >
      </div>
      <p class="hint">
        {kind === 'filled'
          ? 'Filled uses solid geometry with no stroke.'
          : 'Weight stays constant while resizing X/Y.'}
      </p>
    </div>
    <div class="size-section">
      <div class="size-heading">
        <span class="field-label">Shape size</span><span class="unit">%</span>
      </div>
      {#each [{ axis: 'x' as const, name: 'Size X', value: sizeX }, { axis: 'y' as const, name: 'Size Y', value: sizeY }] as item}<div
          class="axis-control"
        >
          <label for={'lab-size-' + item.axis}>{item.axis.toUpperCase()}</label><button
            class="small-button"
            aria-label={'Decrease size ' + item.axis.toUpperCase()}
            onclick={() => resize(item.axis, item.value - 5)}
            disabled={item.value <= 1.000001}>−</button
          ><input
            id={'lab-size-' + item.axis}
            type="number"
            aria-label={item.name}
            min="1"
            max={limit(item.axis)}
            step="0.01"
            value={Math.floor((item.value + 0.00000001) * 100) / 100}
            onchange={(event) => resize(item.axis, Number(event.currentTarget.value))}
          /><button
            class="small-button"
            aria-label={'Increase size ' + item.axis.toUpperCase()}
            onclick={() => resize(item.axis, item.value + 5)}
            disabled={item.value >= limit(item.axis) - 0.000001}>+</button
          >
        </div>{/each}
      <label class="checkbox-row"
        ><input type="checkbox" bind:checked={linked} /> Link X/Y proportions</label
      >
      <button class="match-spacing" onclick={matchLeft}
        >Match Y to left spacing <span aria-hidden="true">↔</span></button
      >
      <p class="hint" data-testid="y-limit">
        Y up to {maximumY.toFixed(2)}% · top/bottom match the left margin.
      </p>
    </div>
    <fieldset class="setting">
      <legend class="field-label">Surface</legend>
      <div class="segmented">
        <button aria-pressed={surface === 'light'} onclick={() => (surface = 'light')}>Light</button
        ><button aria-pressed={surface === 'dark'} onclick={() => (surface = 'dark')}>Dark</button>
      </div>
    </fieldset>
    <fieldset class="setting">
      <legend class="field-label">Color</legend>
      <div class="ink-options">
        <button
          class="swatch ink"
          aria-label="Ink color"
          aria-pressed={ink === 'ink'}
          onclick={() => (ink = 'ink')}
        ></button><button
          class="swatch indigo"
          aria-label="Indigo color"
          aria-pressed={ink === 'indigo'}
          onclick={() => (ink = 'indigo')}
        ></button><span>{ink === 'ink' ? 'Ink' : 'Indigo'}</span>
      </div>
    </fieldset>
    <label class="switch-row"
      ><span>Drawing grid</span><input type="checkbox" bind:checked={grid} /></label
    ><label class="switch-row"
      ><span>Spacing guides</span><input type="checkbox" bind:checked={guides} /></label
    >
    <button class="reset-button" onclick={reset}
      >Reset geometry <span aria-hidden="true">↺</span></button
    >
  </aside>
  <section class="canvas-panel" aria-label="Static Folder workbench">
    <div class="canvas-topline">
      <span><b>folder</b><span class="muted"> / {kind}</span></span><span class="mono"
        >24 × 24 · 7× PREVIEW</span
      >
    </div>
    <div class="canvas" class:dark={surface === 'dark'} style:color>
      <div class="drawing" class:gridded={grid} class:guided={guides}>
        <span class="axis horizontal" aria-hidden="true"></span><span
          class="axis vertical"
          aria-hidden="true"
        ></span>
        <div data-testid="main-study">
          <StaticFolderPreview
            {kind}
            x={sizeX}
            y={sizeY}
            {color}
            strokeWidth={stroke}
            label={'Folder ' + kind + ' preview'}
            onmeasure={measure}
          />
        </div>
        {#if guides}<span class="spacing top mono" data-testid="spacing-top"
            >{margins.top.toFixed(3)}</span
          ><span class="spacing bottom mono" data-testid="spacing-bottom"
            >{margins.bottom.toFixed(3)}</span
          ><span class="spacing left mono" data-testid="spacing-left"
            >{margins.left.toFixed(3)}</span
          ><span class="spacing right mono" data-testid="spacing-right"
            >{margins.right.toFixed(3)}</span
          >{/if}
      </div>
      <div class="canvas-status">
        <span class="status-dot"></span>{kind === 'outline' ? 'Outline' : 'Filled'}<span
          >{margins.width.toFixed(2)} × {margins.height.toFixed(2)} units</span
        >
      </div>
    </div>
    <div class="spacing-panel">
      <div class="spacing-title">
        <span>Visible spacing</span><span
          class:balanced
          class="balance-state"
          data-testid="balance-state"
          >{balanced ? 'Opposite sides balanced' : 'Review alignment'}</span
        >
      </div>
      <div class="spacing-values">
        <div>
          <span>Left / Right</span><output data-testid="horizontal-spacing"
            >{margins.left.toFixed(3)} / {margins.right.toFixed(3)}</output
          >
        </div>
        <div>
          <span>Top / Bottom</span><output data-testid="vertical-spacing"
            >{margins.top.toFixed(3)} / {margins.bottom.toFixed(3)}</output
          >
        </div>
      </div>
      <p class="hint">
        Measured to the visible edge, including the outline stroke. X/Y changes are local previews.
      </p>
    </div>
  </section>
</div>
<section
  class="optical-row"
  aria-label="Folder optical sizes"
  class:dark={surface === 'dark'}
  style:color
>
  <span class="optical-title">Actual size</span>
  <div class="sizes">
    {#each [16, 20, 24, 48] as size}<div class="size-sample">
        <div><StaticFolderPreview {kind} {size} x={sizeX} y={sizeY} strokeWidth={stroke} /></div>
        <span class="mono">{size}px</span>
      </div>{/each}
  </div>
  <span class="optical-note">{kind} · {sizeX}% × {sizeY}%</span>
</section>
<section class="comparison-section" aria-labelledby="style-heading">
  <div class="section-heading">
    <h2 id="style-heading">Compare styles</h2>
    <span>Same scale and X/Y settings</span>
  </div>
  <div class="comparison-grid">
    {#each ['outline', 'filled'] as style}<article
        data-testid={'style-' + style}
        class:selected={kind === style}
      >
        <div class="comparison-heading">
          <h3>{style === 'outline' ? 'Outline' : 'Filled'}</h3>
          <span>{style === 'outline' ? 'Adjustable stroke' : 'Solid geometry'}</span>
        </div>
        <div class="comparison-preview">
          <StaticFolderPreview
            kind={style as 'outline' | 'filled'}
            size={72}
            x={sizeX}
            y={sizeY}
            color="#4f46e5"
            strokeWidth={stroke}
            label={'Compare ' + style + ' Folder'}
          />
        </div>
        <button aria-pressed={kind === style} onclick={() => (kind = style as 'outline' | 'filled')}
          >{kind === style ? 'Selected' : 'Use style'}<span aria-hidden="true"
            >{kind === style ? '✓' : '↗'}</span
          ></button
        >
      </article>{/each}
  </div>
</section>
<details class="review-details">
  <summary>Visual checks <span>Geometry, weight and spacing</span></summary>
  <div class="review-panel">
    {#each ['Recognizable at 16px', 'Clean edges without doubled strokes', 'Balanced opposite spacing', 'Outline and filled feel like one family'] as item}<label
        class="review-check"
        ><input type="checkbox" value={item} bind:group={checked} /><span>{item}</span></label
      >{/each}
    <div class="review-count">
      <span class="mono">{checked.length} / 4 REVIEWED</span><span>This session only</span>
    </div>
  </div>
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
    grid-template-columns: 264px minmax(0, 1fr);
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    font-weight: 550;
    margin-bottom: 22px;
  }
  .panel-title span {
    color: #a1a1aa;
    font-size: 10px;
    font-weight: 400;
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
    background: white;
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
  fieldset {
    border: 0;
    padding: 0;
    min-width: 0;
  }
  legend {
    padding: 0;
  }
  .setting {
    margin: 18px 0 0;
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
    min-height: 29px;
  }
  .segmented button[aria-pressed='true'] {
    color: #18181b;
    background: white;
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
  output {
    font-variant-numeric: tabular-nums;
  }
  .range-label output {
    color: #6366f1;
  }
  .stroke-control {
    display: flex;
    gap: 9px;
    align-items: center;
  }
  input[type='range'] {
    width: 100%;
    min-width: 0;
    accent-color: #6366f1;
    height: 18px;
    margin: 0;
    cursor: pointer;
  }
  .small-button {
    border: 1px solid #e4e4e7;
    background: white;
    color: #71717a;
    border-radius: 5px;
    width: 28px;
    min-width: 28px;
    height: 28px;
    padding: 0;
    font-size: 15px;
  }
  .hint {
    font-size: 10px;
    color: #92929e;
    line-height: 1.65;
    margin: 9px 0 0;
  }
  .size-section {
    margin-top: 20px;
    padding-top: 18px;
    border-top: 1px solid #e4e4e7;
  }
  .size-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 9px;
  }
  .size-heading .field-label {
    margin: 0;
  }
  .unit {
    color: #a1a1aa;
    font-size: 11px;
  }
  .axis-control {
    display: grid;
    grid-template-columns: 22px 28px 1fr 28px;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
  }
  .axis-control label {
    font-size: 12px;
    color: #71717a;
  }
  input[type='number'] {
    width: 100%;
    min-width: 0;
    appearance: textfield;
    -moz-appearance: textfield;
    border: 1px solid #e4e4e7;
    border-radius: 5px;
    background: white;
    color: #27272a;
    padding: 5px;
    height: 28px;
    text-align: center;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }
  input[type='number']::-webkit-inner-spin-button {
    appearance: none;
  }
  input[type='checkbox'] {
    accent-color: #4f46e5;
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    cursor: pointer;
  }
  .match-spacing {
    width: 100%;
    border: 1px solid #e4e4e7;
    border-radius: 5px;
    background: white;
    color: #6366f1;
    padding: 7px 9px;
    margin-top: 12px;
    font-size: 11px;
    text-align: left;
    display: flex;
    justify-content: space-between;
  }
  .checkbox-row {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #71717a;
    font-size: 11px;
    cursor: pointer;
    margin-top: 12px;
  }
  .checkbox-row input {
    margin: 0;
  }
  .switch-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: #71717a;
    cursor: pointer;
    margin-top: 18px;
  }
  .switch-row + .switch-row {
    margin-top: 10px;
  }
  .reset-button {
    display: flex;
    justify-content: space-between;
    width: 100%;
    border: 1px solid #e4e4e7;
    border-radius: 5px;
    background: white;
    color: #71717a;
    padding: 7px 10px;
    font-size: 11px;
    margin-top: 20px;
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
    font-size: 10px;
    color: #a1a1aa;
    align-self: center;
  }
  .canvas {
    flex: 1;
    min-height: 420px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 54px;
    padding: 58px 48px 30px;
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
  .guided .axis {
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
  .spacing {
    position: absolute;
    font-size: 10px;
    color: #92929e;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .spacing.top {
    top: -25px;
  }
  .spacing.bottom {
    bottom: -25px;
  }
  .spacing.left {
    right: calc(100% + 14px);
  }
  .spacing.right {
    left: calc(100% + 14px);
  }
  .dark .spacing {
    color: #a5b4fc;
  }
  .canvas-status {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #92929e;
    font-size: 11px;
  }
  .canvas-status > span:last-child {
    margin-left: 8px;
    font-size: 10px;
    font-variant-numeric: tabular-nums;
  }
  .status-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #818cf8;
  }
  .spacing-panel {
    border-top: 1px solid #f0f0f2;
    padding: 22px;
  }
  .spacing-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    color: #52525b;
    font-size: 12px;
  }
  .balance-state {
    font-size: 10px;
    color: #a1a1aa;
  }
  .balance-state.balanced {
    color: #6366f1;
  }
  .spacing-values {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    padding: 18px 0 5px;
  }
  .spacing-values > div {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 11px;
    color: #a1a1aa;
  }
  .spacing-values output {
    color: #52525b;
    font-size: 14px;
  }
  .optical-row {
    display: grid;
    grid-template-columns: 242px 1fr 180px;
    align-items: center;
    padding: 22px;
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
  .size-sample {
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
  .size-sample span {
    font-size: 9px;
    color: #a1a1aa;
  }
  .optical-note {
    color: #92929e;
    font-size: 10px;
    text-align: right;
  }
  .comparison-section {
    padding-top: 28px;
  }
  .section-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  h2 {
    font-size: 16px;
    letter-spacing: -0.02em;
    margin: 0;
  }
  .section-heading > span {
    font-size: 11px;
    color: #a1a1aa;
  }
  .comparison-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  article {
    border: 1px solid #e4e4e7;
    padding: 18px;
    border-radius: 8px;
  }
  article.selected {
    border-color: #a5b4fc;
  }
  .comparison-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }
  h3 {
    margin: 0;
    font-size: 13px;
  }
  .comparison-heading > span {
    color: #a1a1aa;
    font-size: 10px;
  }
  .comparison-preview {
    height: 130px;
    display: grid;
    place-items: center;
  }
  article > button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-left: auto;
    min-width: 100px;
    border: 1px solid #e4e4e7;
    border-radius: 5px;
    background: white;
    color: #71717a;
    padding: 6px 10px;
    font-size: 11px;
  }
  article > button[aria-pressed='true'] {
    color: #4f46e5;
    border-color: #c7d2fe;
    background: #f8f9ff;
  }
  .review-details {
    border-top: 1px solid #e4e4e7;
    margin-top: 28px;
  }
  summary {
    cursor: pointer;
    padding: 18px 0;
    font-size: 13px;
    color: #52525b;
  }
  summary span {
    margin-left: 14px;
    color: #a1a1aa;
    font-size: 11px;
  }
  summary:focus-visible {
    outline: 3px solid #6366f1;
    outline-offset: 4px;
  }
  .review-panel {
    max-width: 550px;
    padding-bottom: 15px;
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
    font-size: 10px;
    color: #a1a1aa;
    margin-top: 18px;
  }
  .review-count .mono {
    color: #6366f1;
  }
  button:disabled,
  input:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  @media (hover: hover) and (pointer: fine) {
    button:not(:disabled):hover {
      border-color: #a5b4fc;
    }
  }
</style>
