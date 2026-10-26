<script module lang="ts">
  export type Margins = {
    icon: string;
    variant: 'outline' | 'filled';
    gap?: number;
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
    sourceWidth: number;
    sourceHeight: number;
  };
</script>

<script lang="ts">
  import { tick } from 'svelte';
  import { visibleBounds } from '#lib/visible-bounds.js';
  import { catalog } from '#lib/catalog.js';

  let {
    icon = 'folder',
    kind = 'outline',
    x = 100,
    y = 100,
    rotation = 0,
    strokeWidth = 1.7,
    size = 168,
    color = 'currentColor',
    label,
    onmeasure,
  }: {
    icon?: string;
    kind?: 'outline' | 'filled';
    x?: number;
    y?: number;
    rotation?: number;
    strokeWidth?: number;
    size?: number;
    color?: string;
    label?: string;
    onmeasure?: (margins: Margins) => void;
  } = $props();
  let host = $state<HTMLDivElement>();
  let centerX = $state(12);
  let centerY = $state(12);
  const entry = $derived(catalog.find((entry) => entry.name === icon) ?? catalog[0]);
  const Icon = $derived(entry.component);
  const FilledIcon = $derived(entry.filledComponent);

  $effect(() => {
    icon;
    kind;
    centerX;
    centerY;
    x;
    y;
    rotation;
    strokeWidth;
    size;
    if (!host) return;
    let active = true;
    void tick().then(() => {
      if (!active) return;
      const svg = host?.querySelector('svg');
      if (!svg) return;
      const half = kind === 'outline' ? strokeWidth / 2 : 0;
      // Individual source shapes have no transforms; parent preview scaling
      // is excluded from local getBBox, giving untransformed reference bounds.
      const sources = Array.from(svg.querySelectorAll<SVGGraphicsElement>('path, circle')).map(
        (shape) => shape.getBBox(),
      );
      const sourceWidth =
        Math.max(...sources.map((box) => box.x + box.width)) -
        Math.min(...sources.map((box) => box.x));
      const sourceHeight =
        Math.max(...sources.map((box) => box.y + box.height)) -
        Math.min(...sources.map((box) => box.y));
      const nextCenterX = Math.min(...sources.map((box) => box.x)) + sourceWidth / 2;
      const nextCenterY = Math.min(...sources.map((box) => box.y)) + sourceHeight / 2;
      if (
        Math.abs(centerX - nextCenterX) > 0.000001 ||
        Math.abs(centerY - nextCenterY) > 0.000001
      ) {
        centerX = nextCenterX;
        centerY = nextCenterY;
        return;
      }
      if (!onmeasure) return;
      const box = visibleBounds(svg);
      onmeasure({
        icon,
        variant: kind,
        gap:
          kind === 'filled' && svg.hasAttribute('data-cutout-width')
            ? (Number(svg.getAttribute('data-cutout-width')) * y) / 100
            : undefined,
        sourceWidth,
        sourceHeight,
        left: box.x - half,
        right: 24 - box.x - box.width - half,
        top: box.y - half,
        bottom: 24 - box.y - box.height - half,
        width: box.width + half * 2,
        height: box.height + half * 2,
      });
    });
    return () => {
      active = false;
    };
  });
</script>

<div
  class="glyph"
  class:outline={kind === 'outline'}
  bind:this={host}
  style:--offset-x={`${((12 - centerX) * x) / 100}px`}
  style:--offset-y={`${((12 - centerY) * y) / 100}px`}
  style:--rotation={`${rotation % 360}deg`}
  style:--scale-x={x / 100}
  style:--scale-y={y / 100}
  style:--preview-stroke={`${(strokeWidth * size) / 24}px`}
>
  {#if kind === 'outline'}<Icon
      {size}
      {color}
      {strokeWidth}
      {label}
    />{:else if FilledIcon}<FilledIcon
      {size}
      {color}
      strokeWidth={strokeWidth / (y / 100)}
      {label}
    />{/if}
</div>

<style>
  .glyph {
    display: grid;
    place-items: center;
    line-height: 0;
  }
  .glyph :global(svg) {
    overflow: visible;
  }
  .glyph :global(svg > g) {
    transform-box: view-box;
    transform-origin: 12px 12px;
    transform: rotate(var(--rotation)) translate(var(--offset-x), var(--offset-y))
      scale(var(--scale-x), var(--scale-y));
  }
  /* Preserve the chosen stroke in screen pixels when X/Y scale independently.
     Include the preview magnification, so the same 24-unit weight is visible
     in both actual-size samples and the enlarged canvas. */
  .glyph.outline :global(path),
  .glyph.outline :global(circle) {
    vector-effect: non-scaling-stroke;
    stroke-width: var(--preview-stroke);
  }
</style>
