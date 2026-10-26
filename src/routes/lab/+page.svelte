<script lang="ts">
  import { catalog, strokeWeights } from '#lib/catalog.js';
  import StaticIconPreview, { type Margins } from '#lib/components/StaticIconPreview.svelte';
  let selectedIcon = $state('folder');
  const entry = $derived(catalog.find((item) => item.name === selectedIcon)!);
  const iconName = $derived(selectedIcon[0].toUpperCase() + selectedIcon.slice(1));
  const hasFilled = $derived(entry.styles.includes('filled'));
  const drafts = new Map<
    string,
    {
      kind: 'outline' | 'filled';
      stroke: number;
      x: number;
      y: number;
      rotation: number;
      checked: string[];
    }
  >();
  function selectIcon(name: string) {
    if (name === selectedIcon) return;
    drafts.set(selectedIcon, { kind, stroke, x: sizeX, y: sizeY, rotation, checked: [...checked] });
    const draft = drafts.get(name);
    selectedIcon = name;
    kind = draft?.kind ?? 'outline';
    stroke = draft?.stroke ?? strokeWeights.regular;
    sizeX = draft?.x ?? 100;
    sizeY = draft?.y ?? 100;
    rotation = draft?.rotation ?? 0;
    checked = draft?.checked ?? [];
  }
  let kind = $state<'outline' | 'filled'>('outline');
  const adjustableWeight = $derived(kind === 'outline' || entry.filledDefaultStrokeWidth !== null);
  let surface = $state<'light' | 'dark'>('light');
  let ink = $state<'ink' | 'indigo'>('ink');
  let grid = $state(true);
  let guides = $state(true);
  let stroke = $state<number>(strokeWeights.regular);
  let sizeX = $state(100);
  let sizeY = $state(100);
  let rotation = $state(0);
  const DEFAULT_ZOOM = 14;
  let zoom = $state(DEFAULT_ZOOM);
  const previewSize = $derived(24 * zoom);
  function panPreview(event: KeyboardEvent) {
    const viewport = event.currentTarget as HTMLDivElement;
    if (event.target !== viewport) return;
    const directions: Record<string, [number, number]> = {
      ArrowLeft: [-40, 0],
      ArrowRight: [40, 0],
      ArrowUp: [0, -40],
      ArrowDown: [0, 40],
    };
    const delta = directions[event.key];
    if (
      delta &&
      ((delta[0] && viewport.scrollWidth > viewport.clientWidth) ||
        (delta[1] && viewport.scrollHeight > viewport.clientHeight))
    ) {
      event.preventDefault();
      viewport.scrollBy(delta[0], delta[1]);
    }
  }
  function changeZoom(value: number) {
    zoom = Math.max(4, Math.min(24, Math.round(value)));
  }
  let checked = $state<string[]>([]);
  let margins = $state<Margins>({
    icon: 'folder',
    variant: 'outline',
    left: 2.15,
    right: 2.15,
    top: 3.45,
    bottom: 3.45,
    width: 19.7,
    height: 17.1,
    sourceWidth: 18,
    sourceHeight: 15.4,
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
  function resize(axis: 'x' | 'y', value: number) {
    if (!Number.isFinite(value) || value < 1) return;
    if (axis === 'x') sizeX = value;
    else sizeY = value;
  }
  function matchLeft() {
    if (margins.variant !== kind || margins.icon !== selectedIcon) return;
    sizeY = (margins.sourceWidth * sizeX) / margins.sourceHeight;
  }
  function rotate(value: number) {
    if (Number.isFinite(value)) rotation = value;
  }
  function reset() {
    sizeX = sizeY = 100;
    stroke = strokeWeights.regular;
    rotation = 0;
  }
  function measure(value: Margins) {
    margins = value;
  }
  // SVG bounds are float32 in browsers; normalize that noise before display rounding.
  const spacing = (value: number) => (Math.round(Math.round(value * 1e5) / 100) / 1000).toFixed(3);
  const balanced = $derived(
    Math.abs(margins.left - margins.right) < 0.001 &&
      Math.abs(margins.top - margins.bottom) < 0.001 &&
      [margins.left, margins.right, margins.top, margins.bottom].every(
        (value) => value >= -0.00001,
      ),
  );
</script>

<svelte:head
  ><title>Icon Lab — Squircle Icons</title><meta
    name="description"
    content="A static icon workbench for outline and filled icon designs, stroke weight, X/Y sizing and balanced spacing."
  /></svelte:head
>

<section class="lab-heading">
  <h1>{iconName} <span>lab</span></h1>
  <a href="/icons" aria-label="Back to icons">Back to icons <span aria-hidden="true">↗</span></a>
</section>
<div class="lab-layout">
  <div class="editor">
    <div class="workbench" data-testid="folder-lab">
      <aside class="controls" aria-label="Icon settings">
        <div class="panel-title">Settings <span>Static study</span></div>
        <fieldset class="setting">
          <legend class="field-label">Style</legend>
          <div class="segmented">
            <button aria-pressed={kind === 'outline'} onclick={() => (kind = 'outline')}
              >Outline</button
            ><button
              disabled={!hasFilled}
              aria-pressed={kind === 'filled'}
              onclick={() => (kind = 'filled')}>Filled</button
            >
          </div>
        </fieldset>
        <div class="setting weight-slot">
          <div
            class="weight-options"
            class:inactive={!adjustableWeight}
            inert={!adjustableWeight}
            aria-hidden={!adjustableWeight}
          >
            <label class="field-label range-label" for="lab-stroke"
              >Stroke width <output>{stroke.toFixed(2)}</output></label
            >
            <div class="segmented weight-presets" aria-label="Stroke weight">
              {#each [{ name: 'Thin', value: strokeWeights.thin }, { name: 'Regular', value: strokeWeights.regular }, { name: 'Bold', value: strokeWeights.bold }] as weight}
                <button
                  aria-pressed={Math.abs(stroke - weight.value) < 0.00001}
                  title={weight.name === 'Regular' ? 'Default · 1.70' : weight.value.toFixed(2)}
                  onclick={() => (stroke = weight.value)}>{weight.name}</button
                >
              {/each}
            </div>
            <div class="stroke-control">
              <button
                class="small-button"
                aria-label="Decrease stroke width"
                disabled={stroke <= 1}
                onclick={() => (stroke = Math.max(1, +(stroke - 0.25).toFixed(2)))}>−</button
              ><input
                id="lab-stroke"
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                bind:value={stroke}
              /><button
                class="small-button"
                aria-label="Increase stroke width"
                disabled={stroke >= 2.5}
                onclick={() => (stroke = Math.min(2.5, +(stroke + 0.25).toFixed(2)))}>+</button
              >
            </div>
          </div>
          {#if !adjustableWeight}<div class="solid-description">
              <span class="field-label">Fill</span><span class="solid-note">Solid geometry</span>
            </div>{/if}
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
                step="0.01"
                value={Math.floor((item.value + 0.00000001) * 100) / 100}
                onchange={(event) => {
                  resize(item.axis, Number(event.currentTarget.value));
                  event.currentTarget.value = String(item.axis === 'x' ? sizeX : sizeY);
                }}
              /><button
                class="small-button"
                aria-label={'Increase size ' + item.axis.toUpperCase()}
                onclick={() => resize(item.axis, item.value + 5)}>+</button
              >
            </div>{/each}
          <button
            class="match-spacing"
            onclick={matchLeft}
            disabled={rotation % 180 !== 0}
            title="Match spacing at 0° or 180°"
            >Match Y to left spacing <span aria-hidden="true">↔</span></button
          >
          <p class="hint">X and Y are independent. Artwork may extend beyond the grid.</p>
          <div class="rotation-section">
            <label class="field-label range-label" for="lab-rotation"
              >Rotate <span class="unit">°</span></label
            >
            <div class="rotation-control">
              <button
                class="small-button"
                aria-label="Rotate counterclockwise"
                onclick={() => rotate(rotation - 15)}>−</button
              >
              <input
                id="lab-rotation"
                type="number"
                aria-label="Rotation"
                step="1"
                value={rotation}
                onchange={(event) => rotate(Number(event.currentTarget.value))}
              />
              <button
                class="small-button"
                aria-label="Rotate clockwise"
                onclick={() => rotate(rotation + 15)}>+</button
              >
              <button
                class="small-button"
                aria-label="Reset rotation"
                onclick={() => (rotation = 0)}>↺</button
              >
            </div>
          </div>
        </div>
        <fieldset class="setting">
          <legend class="field-label">Surface</legend>
          <div class="segmented">
            <button aria-pressed={surface === 'light'} onclick={() => (surface = 'light')}
              >Light</button
            ><button aria-pressed={surface === 'dark'} onclick={() => (surface = 'dark')}
              >Dark</button
            >
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
      <section class="canvas-panel" aria-label={'Static ' + iconName + ' workbench'}>
        <div class="canvas-topline">
          <span><b>{selectedIcon}</b><span class="muted"> / {kind}</span></span>
          <div class="zoom-tools" role="group" aria-label="Preview zoom controls">
            <label for="lab-zoom">Zoom</label>
            <button
              class="zoom-button"
              aria-label="Zoom out"
              disabled={zoom <= 4}
              onclick={() => changeZoom(zoom - 2)}>−</button
            >
            <input
              id="lab-zoom"
              type="range"
              min="4"
              max="24"
              step="1"
              bind:value={zoom}
              aria-label="Preview zoom"
            />
            <output for="lab-zoom" class="mono">{zoom}×</output>
            <button
              class="zoom-button"
              aria-label="Zoom in"
              disabled={zoom >= 24}
              onclick={() => changeZoom(zoom + 2)}>+</button
            >
            <button
              class="zoom-button"
              aria-label="Reset zoom"
              title="Reset to 14×"
              onclick={() => (zoom = DEFAULT_ZOOM)}>↺</button
            >
          </div>
        </div>
        <div class="canvas" class:dark={surface === 'dark'} style:color>
          <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions (The scrollable drawing needs keyboard focus and arrow-key panning across browsers.) -->
          <div
            class="zoom-viewport"
            role="region"
            aria-label="Zoomed icon preview"
            tabindex="0"
            onkeydown={panPreview}
          >
            <div
              class="zoom-surface"
              style:--preview-size={`${previewSize}px`}
              style:--grid-step={`${zoom}px`}
            >
              <div class="drawing" class:gridded={grid} class:guided={guides}>
                <span class="axis horizontal" aria-hidden="true"></span><span
                  class="axis vertical"
                  aria-hidden="true"
                ></span>
                <div data-testid="main-study">
                  <StaticIconPreview
                    icon={selectedIcon}
                    {rotation}
                    {kind}
                    x={sizeX}
                    y={sizeY}
                    {color}
                    strokeWidth={stroke}
                    label={iconName + ' ' + kind + ' preview'}
                    size={previewSize}
                    onmeasure={measure}
                  />
                </div>
                {#if guides}<span class="spacing top mono" data-testid="spacing-top"
                    >{spacing(margins.top)}</span
                  ><span class="spacing bottom mono" data-testid="spacing-bottom"
                    >{spacing(margins.bottom)}</span
                  ><span class="spacing left mono" data-testid="spacing-left"
                    >{spacing(margins.left)}</span
                  ><span class="spacing right mono" data-testid="spacing-right"
                    >{spacing(margins.right)}</span
                  >{/if}
              </div>
            </div>
          </div>
          <div class="canvas-status">
            <span class="status-dot"></span>{kind === 'outline' ? 'Outline' : 'Filled'}<span
              >{margins.width.toFixed(2)} × {margins.height.toFixed(2)} units</span
            >
            {#if kind === 'filled' && margins.gap !== undefined}<span data-testid="filled-gap"
                >Gap {(margins.gap ?? stroke).toFixed(2)} units</span
              >{/if}
          </div>
        </div>
        <div class="spacing-panel">
          <div class="spacing-title">
            <span>Visible spacing</span><span
              class:balanced
              class="balance-state"
              data-testid="balance-state"
              >{[margins.left, margins.right, margins.top, margins.bottom].some(
                (value) => value < -0.00001,
              )
                ? 'Outside 24×24 grid'
                : balanced
                  ? 'Opposite sides balanced'
                  : 'Review alignment'}</span
            >
          </div>
          <div class="spacing-values">
            <div>
              <span>Left / Right</span><output data-testid="horizontal-spacing"
                >{spacing(margins.left)} / {spacing(margins.right)}</output
              >
            </div>
            <div>
              <span>Top / Bottom</span><output data-testid="vertical-spacing"
                >{spacing(margins.top)} / {spacing(margins.bottom)}</output
              >
            </div>
          </div>
          <p class="hint">
            Measured to the visible edge, including the outline stroke. X/Y changes are local
            previews.
          </p>
        </div>
      </section>
    </div>
    <section
      class="optical-row"
      aria-label={iconName + ' optical sizes'}
      class:dark={surface === 'dark'}
      style:color
    >
      <span class="optical-title">Actual size</span>
      <div class="sizes">
        {#each [16, 20, 24, 48] as size}<div class="size-sample">
            <div>
              <StaticIconPreview
                icon={selectedIcon}
                {rotation}
                {kind}
                {size}
                x={sizeX}
                y={sizeY}
                strokeWidth={stroke}
              />
            </div>
            <span class="mono">{size}px</span>
          </div>{/each}
      </div>
      <span class="optical-note">{kind} · {sizeX}% × {sizeY}%</span>
    </section>
    <section class="comparison-section" aria-labelledby="style-heading">
      <div class="section-heading">
        <h2 id="style-heading">Compare styles</h2>
        <span>Same scale, X/Y and rotation</span>
      </div>
      <div class="comparison-grid">
        {#each ['outline', 'filled'] as style}<article
            data-testid={'style-' + style}
            class:selected={kind === style}
          >
            <div class="comparison-heading">
              <h3>{style === 'outline' ? 'Outline' : 'Filled'}</h3>
              <span
                >{style === 'outline'
                  ? 'Adjustable stroke'
                  : entry.filledDefaultStrokeWidth !== null
                    ? 'Adjustable inner gap'
                    : 'Solid geometry'}</span
              >
            </div>
            <div class="comparison-preview">
              {#if style === 'outline' || hasFilled}<StaticIconPreview
                  icon={selectedIcon}
                  {rotation}
                  kind={style as 'outline' | 'filled'}
                  size={72}
                  x={sizeX}
                  y={sizeY}
                  color="#4f46e5"
                  strokeWidth={stroke}
                  label={'Compare ' + style + ' ' + iconName}
                />{:else}<span class="pending-style">Filled study not drawn yet</span>{/if}
            </div>
            <button
              disabled={style === 'filled' && !hasFilled}
              aria-pressed={kind === style}
              onclick={() => (kind = style as 'outline' | 'filled')}
              >{style === 'filled' && !hasFilled
                ? 'Coming later'
                : kind === style
                  ? 'Selected'
                  : 'Use style'}<span aria-hidden="true">{kind === style ? '✓' : '↗'}</span></button
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
  </div>
  <aside class="icon-sidebar" aria-label="Icon list">
    <div class="sidebar-heading">
      <h2>Icons</h2>
      <span>{catalog.length}</span>
    </div>
    <div class="icon-list">
      {#each catalog as item}
        <button
          class="icon-item"
          aria-pressed={selectedIcon === item.name}
          aria-label={'Select ' + item.name}
          onclick={() => selectIcon(item.name)}
        >
          <span class="list-glyph"
            ><item.component size={24} strokeWidth={strokeWeights.regular} /></span
          >
          <span class="list-name"
            >{item.name[0].toUpperCase() + item.name.slice(1)}<small
              class:approved={item.reviewStatus === 'approved'}
              >{item.reviewStatus === 'approved' ? 'Approved' : 'Needs review'}</small
            ></span
          >
          {#if selectedIcon === item.name}<span class="selection-dot" aria-hidden="true"
            ></span>{/if}
        </button>
      {/each}
    </div>
    <p>Folder outline and filled approved.<br />Other icons await visual review.</p>
  </aside>
</div>

<style>
  .rotation-section {
    margin-top: 18px;
  }
  .rotation-control {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr) 28px 28px;
    gap: 8px;
  }
  .solid-note {
    font-size: 12px;
    color: #71717a;
  }

  .lab-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 190px;
    gap: 24px;
    align-items: start;
  }
  .editor {
    min-width: 0;
  }
  .icon-sidebar {
    position: sticky;
    top: 28px;
    padding: 16px 0 0 20px;
    border-left: 1px solid #e4e4e7;
  }
  .sidebar-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 8px 16px;
  }
  .sidebar-heading h2 {
    font-size: 13px;
    font-weight: 550;
    margin: 0;
  }
  .sidebar-heading > span {
    font-size: 11px;
    color: #a1a1aa;
  }
  .icon-list {
    display: grid;
    gap: 5px;
  }
  .icon-item {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 11px;
    border: 1px solid transparent;
    border-radius: 7px;
    padding: 10px 8px;
    text-align: left;
    background: transparent;
    color: #71717a;
  }
  .icon-item:hover {
    background: #fafafa;
    color: #27272a;
  }
  .icon-item[aria-pressed='true'] {
    background: #f5f5ff;
    border-color: #e0e0ff;
    color: #4f46e5;
  }
  .list-glyph {
    display: grid;
    place-items: center;
  }
  .list-name {
    font-size: 12px;
    color: #27272a;
  }
  .list-name small {
    display: block;
    font-size: 9px;
    color: #a1a1aa;
    margin-top: 3px;
  }
  .list-name small.approved {
    color: #6366f1;
  }
  .selection-dot {
    margin-left: auto;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #6366f1;
  }
  .icon-sidebar p {
    font-size: 10px;
    line-height: 1.7;
    color: #a1a1aa;
    margin: 20px 8px 0;
  }
  .pending-style {
    font-size: 12px;
    color: #a1a1aa;
  }
  .weight-slot {
    display: grid;
  }
  .weight-options,
  .solid-description {
    grid-area: 1 / 1;
  }
  .weight-options.inactive {
    visibility: hidden;
  }
  .weight-presets {
    margin-bottom: 10px;
  }
  button:disabled {
    cursor: default;
    opacity: 0.4;
  }

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
    align-items: center;
    gap: 16px;
  }
  .canvas-topline b {
    font-weight: 500;
  }
  .zoom-tools {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .zoom-tools label {
    font-size: 11px;
    color: #71717a;
    margin-right: 2px;
  }
  .zoom-tools input {
    width: 88px;
  }
  .zoom-tools output {
    font-size: 11px;
    color: #6366f1;
    min-width: 27px;
    text-align: center;
  }
  .zoom-button {
    width: 26px;
    height: 26px;
    padding: 0;
    border: 1px solid #e4e4e7;
    border-radius: 5px;
    background: white;
    color: #71717a;
    font-size: 14px;
  }
  .canvas {
    flex: 1;
    min-height: 420px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: white;
  }
  .zoom-viewport {
    display: flex;
    width: 100%;
    flex: 1;
    height: 0;
    min-height: 420px;
    overflow: auto;
    overscroll-behavior: contain;
  }
  .zoom-viewport:focus-visible {
    outline: 2px solid #818cf8;
    outline-offset: -3px;
  }
  .zoom-surface {
    flex: none;
    margin: auto;
    width: calc(var(--preview-size) + 112px);
    height: calc(var(--preview-size) + 100px);
    display: grid;
    place-items: center;
  }
  .canvas.dark {
    background: #1c1c22;
  }
  .drawing {
    width: var(--preview-size);
    height: var(--preview-size);
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
    background-size: var(--grid-step) var(--grid-step);
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
    font-size: 12px;
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
    padding: 14px 22px 24px;
    flex-shrink: 0;
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
