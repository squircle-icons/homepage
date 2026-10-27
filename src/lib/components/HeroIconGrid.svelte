<script lang="ts">
  import { onMount } from 'svelte';
  import { catalog } from '#lib/outline-catalog.js';

  type Pose = { icon: number; style: 'outline' | 'filled' };
  const initialPose = (index: number, slot: number): Pose => ({
    icon: index % catalog.length,
    style:
      slot % 3 !== 0 && catalog[index % catalog.length].styles.includes('filled')
        ? 'filled'
        : 'outline',
  });
  let cells = $state(
    Array.from({ length: 128 }, (_, index) => {
      const pose = initialPose(index * 3 + Math.floor(index / 16), index);
      return { pose, fading: false, exitDelay: 0 };
    }),
  );
  let stage = $state<HTMLDivElement>();
  let focusedCell = $state<number | null>(null);
  let reduced = $state(true);
  let visible = $state(false);
  let hidden = $state(false);
  let mounted = $state(false);
  const running = $derived(mounted && visible && !hidden && !reduced);
  let lastCell = -1;
  let preference: MediaQueryList | undefined;

  const pending = new Map<number, Pose>();
  const holds = new Map<number, number>();
  function canChange() {
    // Recheck queued work before changing content when browser events arrive late.
    if (!running || preference?.matches || document.hidden) return false;
    const bounds = stage?.getBoundingClientRect();
    return !!bounds && bounds.bottom > 0 && bounds.top < window.innerHeight;
  }
  function focusCell(index: number) {
    focusedCell = index;
    const timeout = holds.get(index);
    if (timeout !== undefined) window.clearTimeout(timeout);
    holds.delete(index);
    pending.delete(index);
    cells[index].fading = false;
  }
  function changeCell() {
    if (!canChange()) return;
    const candidates = cells
      .map((_, index) => index)
      .filter((index) => index !== lastCell && index !== focusedCell && !pending.has(index));
    if (!candidates.length) return;
    const columns = stage ? getComputedStyle(stage).gridTemplateColumns.split(/\s+/).length : 16;
    const rowLoads = Array(Math.ceil(cells.length / columns)).fill(0) as number[];
    for (const index of pending.keys()) rowLoads[Math.floor(index / columns)]++;
    const lightest = Math.min(...candidates.map((index) => rowLoads[Math.floor(index / columns)]));
    const balanced = candidates.filter(
      (index) => rowLoads[Math.floor(index / columns)] === lightest,
    );
    const index = balanced[Math.floor(Math.random() * balanced.length)];
    const cell = cells[index];
    const icon =
      (cell.pose.icon + 1 + Math.floor(Math.random() * (catalog.length - 1))) % catalog.length;
    const style =
      catalog[icon].styles.includes('filled') && Math.random() < 0.5 ? 'filled' : 'outline';
    cell.exitDelay = 500 + Math.round(Math.random() * 500);
    cell.fading = true;
    pending.set(index, { icon, style });
    lastCell = index;
  }
  function finishFade(index: number, event: TransitionEvent) {
    if (
      event.target !== event.currentTarget ||
      event.propertyName !== 'opacity' ||
      !cells[index].fading ||
      holds.has(index)
    )
      return;
    const next = pending.get(index);
    if (!next) return;
    const delay = 800 + Math.round(Math.random() * 500);
    holds.set(
      index,
      window.setTimeout(() => {
        holds.delete(index);
        pending.delete(index);
        if (canChange()) cells[index].pose = next;
        cells[index].fading = false;
      }, delay),
    );
  }
  $effect(() => {
    if (!running || catalog.length < 2) return;
    let timer = 0;
    function scheduleNext() {
      timer = window.setTimeout(
        () => {
          changeCell();
          scheduleNext();
        },
        160 + Math.round(Math.random() * 160),
      );
    }
    scheduleNext();
    return () => {
      window.clearTimeout(timer);
      for (const timeout of holds.values()) window.clearTimeout(timeout);
      holds.clear();
      for (const index of pending.keys()) {
        cells[index].fading = false;
      }
      pending.clear();
    };
  });
  onMount(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    preference = media;
    const updateMotion = () => (reduced = media.matches);
    const updateVisibility = () => (hidden = document.hidden);
    updateMotion();
    updateVisibility();
    media.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    if (stage) observer.observe(stage);
    mounted = true;
    return () => {
      observer.disconnect();
      media.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  });
</script>

<div
  class="hero-grid-showcase page-appear"
  style="--appear-duration: 600ms; --appear-delay: 180ms"
  data-testid="hero-icon-grid"
>
  <div class="hero-icon-grid" role="group" aria-label="Icon previews" bind:this={stage}>
    {#each cells as cell, index}
      {@const current = cell.pose}
      {@const icon = catalog[current.icon]}
      <a
        class="hero-icon-card"
        onfocus={() => focusCell(index)}
        onblur={() => {
          if (focusedCell === index) focusedCell = null;
        }}
        class:fading={cell.fading}
        style:--fade-delay={`${cell.fading ? cell.exitDelay : 0}ms`}
        ontransitionend={(event) => finishFade(index, event)}
        href={'/icons#' + icon.name}
        aria-label={`Explore ${icon.name} icon`}
        data-icon={icon.name}
        data-style={current.style}
      >
        <icon.component size={24} strokeWidth="regular" style={current.style} />
      </a>
    {/each}
  </div>
</div>

<style>
  .hero-grid-showcase {
    position: relative;
    isolation: isolate;
    margin: 112px auto 0;
  }
  .hero-grid-showcase::after {
    content: '';
    position: absolute;
    z-index: -1;
    inset: -56px 0 -40px;
    background-image: radial-gradient(var(--faint) 0.7px, transparent 1px);
    background-size: 18px 18px;
    opacity: 0.28;
    mask-image: radial-gradient(ellipse at center, #000 18%, #0009 50%, transparent 74%);
    pointer-events: none;
  }
  .hero-icon-grid {
    display: grid;
    grid-template-columns: repeat(16, minmax(0, 1fr));
    gap: 8px;
    mask-image:
      linear-gradient(to right, transparent, #000 8%, #000 92%, transparent),
      linear-gradient(to bottom, #000 70%, transparent);
    mask-composite: intersect;
  }
  .hero-icon-grid:focus-within {
    mask-image: none;
  }
  .hero-icon-card {
    position: relative;
    display: grid;
    place-items: center;
    aspect-ratio: 1;
    border: 1px solid var(--border);
    border-radius: var(--radius-card-small);
    background: var(--surface);
    color: var(--text);
    box-shadow: inset 0 1px var(--edge-highlight);
    opacity: 1;
    transition: opacity var(--fade-duration, 2200ms) cubic-bezier(0.37, 0, 0.63, 1)
      var(--fade-delay, 0ms);
  }
  .hero-icon-card.fading {
    --fade-duration: 1800ms;
    opacity: 0;
  }
  @media (hover: hover) and (pointer: fine) {
    .hero-icon-card:hover {
      background: var(--surface-subtle);
      border-color: var(--border-strong);
    }
  }
  @media (max-width: 900px) {
    .hero-icon-grid {
      grid-template-columns: repeat(8, minmax(0, 1fr));
    }
  }
  @media (max-width: 650px) {
    .hero-icon-grid {
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 10px;
    }
    .hero-icon-card {
      border-radius: var(--radius-card-small);
    }
    .hero-icon-card :global(svg) {
      width: 24px;
      height: 24px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .hero-icon-card {
      transition: none;
    }
  }
</style>
