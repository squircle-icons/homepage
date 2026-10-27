<script lang="ts">
  import { Popover } from 'bits-ui';
  import Check from '@squircle-icons/svelte/check';
  import X from '@squircle-icons/svelte/x';

  let { value = $bindable('#27272a'), onchange }: { value?: string; onchange?: () => void } =
    $props();
  let hue = $state(0);
  let saturation = $state(0);
  let brightness = $state(0);
  let hex = $state('#27272A');
  let lastWritten = '';
  let trigger = $state<HTMLButtonElement | null>(null);
  let anchor = $state<HTMLDivElement | null>(null);
  let restoreFocus = false;
  let open = $state(false);
  const pickerId = $props.id();
  const presets = [
    '#FFFFFF',
    '#18181B',
    '#71717A',
    '#F59E0B',
    '#EF4444',
    '#EC4899',
    '#8B5CF6',
    '#6366F1',
    '#3B82F6',
    '#06B6D4',
    '#10B981',
    '#84CC16',
  ];

  $effect(() => {
    hex = value.toUpperCase();
    if (value === lastWritten) return;
    const [r, g, b] = [1, 3, 5].map(
      (offset) => parseInt(value.slice(offset, offset + 2), 16) / 255,
    );
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b),
      delta = max - min;
    brightness = max * 100;
    saturation = max === 0 ? 0 : (delta / max) * 100;
    if (delta > 0) {
      const sector =
        max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
      hue = (sector * 60 + 360) % 360;
    }
  });

  function commit() {
    const s = saturation / 100,
      v = brightness / 100;
    const channel = (n: number) => {
      const k = (n + hue / 60) % 6;
      return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255)
        .toString(16)
        .padStart(2, '0');
    };
    lastWritten = `#${channel(5)}${channel(3)}${channel(1)}`;
    value = lastWritten;
    hex = value.toUpperCase();
    onchange?.();
  }

  function choose(color: string) {
    lastWritten = '';
    value = color.toLowerCase();
    onchange?.();
  }
  function typeHex(text: string) {
    hex = text;
    if (/^#[\da-f]{6}$/i.test(text)) choose(text);
  }

  function move(event: PointerEvent) {
    const target = event.currentTarget as HTMLDivElement;
    if (event.type === 'pointermove' && !target.hasPointerCapture(event.pointerId)) return;
    const box = target.getBoundingClientRect();
    saturation = Math.max(0, Math.min(100, ((event.clientX - box.left) / box.width) * 100));
    brightness = Math.max(0, Math.min(100, (1 - (event.clientY - box.top) / box.height) * 100));
    commit();
  }

  function areaKeys(event: KeyboardEvent) {
    const step = event.shiftKey ? 10 : 1;
    if (event.key === 'ArrowLeft') saturation = Math.max(0, saturation - step);
    else if (event.key === 'ArrowRight') saturation = Math.min(100, saturation + step);
    else if (event.key === 'ArrowUp') brightness = Math.min(100, brightness + step);
    else if (event.key === 'ArrowDown') brightness = Math.max(0, brightness - step);
    else return;
    event.preventDefault();
    commit();
  }
</script>

<Popover.Root bind:open>
  <div class="color-picker-control" class:open bind:this={anchor}>
    <Popover.Trigger
      bind:ref={trigger}
      class="color-picker-trigger"
      aria-label="Icon color"
      title="Choose icon color"
    >
      <span style:background={value}></span>
    </Popover.Trigger>
    <input
      class="inline-hex"
      role="combobox"
      aria-label="Hex color"
      aria-autocomplete="none"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={open ? pickerId : undefined}
      type="text"
      value={hex}
      placeholder="#FFFFFF"
      maxlength="7"
      spellcheck="false"
      autocomplete="off"
      onclick={() => (open = true)}
      oninput={(event) => typeHex(event.currentTarget.value)}
      onblur={() => (hex = value.toUpperCase())}
      onkeydown={(event) => {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          open = true;
        } else if (event.key === 'Escape' && open) {
          event.preventDefault();
          open = false;
        } else if (event.key === 'Enter') {
          event.currentTarget.blur();
        }
      }}
    />
  </div>
  <Popover.Portal>
    <Popover.Content
      class="color-picker-panel"
      id={pickerId}
      role="dialog"
      customAnchor={anchor}
      align="end"
      sideOffset={8}
      aria-label="Color picker"
      onOpenAutoFocus={(event) => {
        if (document.activeElement?.classList.contains('inline-hex')) event.preventDefault();
      }}
      onEscapeKeydown={() => (restoreFocus = true)}
      onCloseAutoFocus={(event) => {
        if (!restoreFocus) return;
        event.preventDefault();
        trigger?.focus({ preventScroll: true });
        restoreFocus = false;
      }}
    >
      <div class="picker-heading">
        <span>Icon color</span>
        <Popover.Close
          class="color-picker-close"
          aria-label="Close color picker"
          onclick={() => (restoreFocus = true)}><X size={16} /></Popover.Close
        >
      </div>
      <div
        class="color-area"
        style:--hue={`${hue}deg`}
        role="slider"
        tabindex="0"
        aria-label="Saturation and brightness"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={Math.round(saturation)}
        aria-valuetext={`${Math.round(saturation)}% saturation, ${Math.round(brightness)}% brightness`}
        onpointerdown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          move(event);
        }}
        onpointermove={move}
        onkeydown={areaKeys}
      >
        <span
          class="color-cursor"
          style:left={`${saturation}%`}
          style:top={`${100 - brightness}%`}
          style:background={value}
        ></span>
      </div>
      <input
        class="hue-slider"
        type="range"
        min="0"
        max="360"
        step="1"
        aria-label="Hue"
        value={hue}
        oninput={(event) => {
          hue = event.currentTarget.valueAsNumber;
          commit();
        }}
      />
      <label class="picker-hex"
        >Hex
        <input
          aria-label="Picker hex color"
          maxlength="7"
          spellcheck="false"
          autocomplete="off"
          value={hex}
          oninput={(event) => {
            hex = event.currentTarget.value;
            if (/^#[\da-f]{6}$/i.test(hex)) choose(hex);
          }}
          onblur={() => (hex = value.toUpperCase())}
          onkeydown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
          }}
        />
      </label>
      <div class="swatches" role="group" aria-label="Preset colors">
        {#each presets as preset}
          <button
            class="swatch"
            style:background={preset}
            style:color={[
              '#18181B',
              '#71717A',
              '#8B5CF6',
              '#6366F1',
              '#3B82F6',
              '#EF4444',
              '#EC4899',
            ].includes(preset)
              ? '#FFFFFF'
              : '#18181B'}
            aria-label={`Use ${preset}`}
            aria-pressed={value.toUpperCase() === preset}
            title={preset}
            onclick={() => choose(preset)}
          >
            {#if value.toUpperCase() === preset}<Check size={16} />{/if}
          </button>
        {/each}
      </div>
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>

<style>
  .color-picker-control {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    min-width: 0;
    padding: 3px;
    border: 1px solid var(--border);
    border-radius: var(--radius-control);
    background: var(--surface);
    transition:
      border-color 150ms ease,
      background 150ms ease;
  }
  .color-picker-control:hover {
    border-color: var(--border-strong);
  }
  .color-picker-control:focus-within,
  .color-picker-control.open {
    border-color: var(--color-amber-500);
  }
  .inline-hex {
    flex: 1;
    width: 0;
    min-width: 0;
    padding: 0 6px 0 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--text);
    font: inherit;
    font-size: 14px;
    text-transform: uppercase;
  }
  :global(.color-picker-trigger) {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    border: 0;
    border-radius: 8px;
    padding: 4px;
    background: transparent;
    cursor: pointer;
  }
  :global(.color-picker-trigger > span) {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    box-shadow: inset 0 0 0 1px #0000001a;
  }
  :global(.color-picker-trigger:hover) {
    background: var(--border);
  }
  :global(.color-picker-trigger:focus-visible),
  :global(.color-picker-close:focus-visible),
  .color-area:focus-visible,
  .hue-slider:focus-visible,
  .swatch:focus-visible {
    outline: 2px solid var(--color-amber-500);
    outline-offset: 3px;
  }
  :global(.color-picker-panel) {
    z-index: 90;
    width: 280px;
    max-width: calc(100vw - 32px);
    padding: 16px;
    border: 1px solid var(--border);
    border-radius: 24px;
    background: var(--surface);
    color: var(--text);
    box-shadow: 0 12px 40px #00000020;
    font-size: 14px;
    transform-origin: var(--bits-popover-content-transform-origin);
    animation: picker-appear 160ms var(--ease-out);
  }
  .picker-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    font-weight: 500;
  }
  :global(.color-picker-close) {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border: 0;
    border-radius: 8px;
    color: var(--muted);
    background: transparent;
    cursor: pointer;
  }
  :global(.color-picker-close:hover) {
    background: var(--surface-subtle);
    color: var(--text);
  }
  .color-area {
    position: relative;
    height: 164px;
    border-radius: 14px;
    cursor: crosshair;
    touch-action: none;
    background:
      linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent),
      hsl(var(--hue) 100% 50%);
  }
  .color-cursor {
    position: absolute;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 0 0 1px #0006;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  .hue-slider {
    display: block;
    appearance: none;
    width: 100%;
    height: 12px;
    margin: 18px 0;
    padding: 0;
    border: 0;
    border-radius: 999px;
    cursor: pointer;
    background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
  }
  .hue-slider::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border: 3px solid #fff;
    border-radius: 50%;
    background: transparent;
    box-shadow: 0 0 0 1px #0004;
  }
  .hue-slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border: 3px solid #fff;
    border-radius: 50%;
    background: transparent;
    box-shadow: 0 0 0 1px #0004;
  }
  .picker-hex {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--muted);
  }
  .picker-hex input {
    min-width: 0;
    width: 100%;
    height: 36px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface-subtle);
    padding: 0 10px;
    font: inherit;
    text-transform: uppercase;
    color: var(--text);
  }
  .picker-hex input:focus {
    outline: 2px solid var(--color-amber-500);
    outline-offset: 1px;
  }
  .swatches {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 8px;
    margin-top: 16px;
  }
  .swatch {
    display: grid;
    place-items: center;
    width: 100%;
    aspect-ratio: 1;
    border: 1px solid #8883;
    border-radius: 10px;
    padding: 0;
    cursor: pointer;
    transition: transform 120ms ease;
  }
  .swatch:hover {
    transform: scale(1.08);
  }
  @keyframes picker-appear {
    from {
      opacity: 0;
      transform: translateY(-4px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    :global(.color-picker-panel) {
      animation: none;
    }
    .swatch {
      transition: none;
    }
  }
</style>
