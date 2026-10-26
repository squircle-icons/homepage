<script module lang="ts">
  export type Margins = {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
  };
</script>

<script lang="ts">
  import { tick } from 'svelte';
  import Folder from 'squircle-icons-svelte/folder';
  import FilledFolder from 'squircle-icons-svelte/filled/folder';

  let {
    kind = 'outline',
    x = 100,
    y = 100,
    strokeWidth = 1.75,
    size = 168,
    color = 'currentColor',
    label,
    onmeasure,
  }: {
    kind?: 'outline' | 'filled';
    x?: number;
    y?: number;
    strokeWidth?: number;
    size?: number;
    color?: string;
    label?: string;
    onmeasure?: (margins: Margins) => void;
  } = $props();
  let host = $state<HTMLDivElement>();

  $effect(() => {
    kind;
    x;
    y;
    strokeWidth;
    size;
    if (!host || !onmeasure) return;
    let active = true;
    void tick().then(() => {
      if (!active) return;
      const svg = host?.querySelector('svg');
      if (!svg) return;
      const box = svg.getBBox();
      const half = kind === 'outline' ? strokeWidth / 2 : 0;
      onmeasure?.({
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
  style:--scale-x={x / 100}
  style:--scale-y={y / 100}
  style:--preview-stroke={`${(strokeWidth * size) / 24}px`}
>
  {#if kind === 'outline'}<Folder {size} {color} {strokeWidth} {label} />{:else}<FilledFolder
      {size}
      {color}
      {label}
    />{/if}
</div>

<style>
  .glyph {
    display: grid;
    place-items: center;
    line-height: 0;
  }
  .glyph :global(svg > g) {
    transform-box: view-box;
    transform-origin: 12px 12px;
    transform: scale(var(--scale-x), var(--scale-y));
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
