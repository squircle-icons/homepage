<script lang="ts">
  import { tick, onDestroy } from 'svelte';
  import Folder from 'squircle-icons-svelte/animated/folder';

  let {
    duration = 220,
    easing = 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    speed = 1,
    reduced = false,
    size = 168,
    color = 'currentColor',
    strokeWidth = 1.75,
    name = 'Folder study',
  }: {
    duration?: number;
    easing?: string;
    speed?: number;
    reduced?: boolean;
    size?: number;
    color?: string;
    strokeWidth?: number;
    name?: string;
  } = $props();

  let host: HTMLDivElement;
  let icon: { reset(): void };
  let open = $state(false);
  let progress = $state(0);
  let status = $state('Closed');
  let running = $state(false);
  let paused = $state(false);
  let frame = 0;
  let operation = 0;
  let disposed = false;
  let from = 0;
  let target = 0;
  const animations = () => host?.querySelector('[data-part="lid"]')?.getAnimations?.() ?? [];
  const stopFrame = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };

  function observe() {
    const animation = animations()[0];
    if (!animation) {
      progress = target;
      running = false;
      paused = false;
      status = open ? 'Open' : 'Closed';
      frame = 0;
      return;
    }
    const time = Number(animation.currentTime ?? 0);
    progress = Math.round(from + (target - from) * Math.min(1, time / duration));
    frame = requestAnimationFrame(observe);
  }

  function prepare() {
    for (const animation of animations()) {
      animation.effect?.updateTiming({ duration, easing, fill: 'both' });
      animation.playbackRate = speed;
    }
  }

  export async function setOpen(next: boolean): Promise<void> {
    if (next === open) {
      if (paused) await play();
      return;
    }
    const current = ++operation;
    stopFrame();
    from = progress;
    target = next ? 100 : 0;
    open = next;
    await tick();
    if (disposed || current !== operation) return;
    prepare();
    for (const animation of animations()) animation.play();
    paused = false;
    running = animations().length > 0;
    status = running ? (next ? 'Opening' : 'Closing') : next ? 'Open' : 'Closed';
    if (running) observe();
    else progress = target;
  }

  export async function reset(): Promise<void> {
    const current = ++operation;
    stopFrame();
    open = false;
    progress = target = from = 0;
    running = paused = false;
    status = 'Closed';
    await tick();
    if (!disposed && current === operation) icon?.reset();
  }

  // The component retains ownership of its group styles. The lab changes only
  // the timing/currentTime of its actual WAAPI animation, never SVG geometry.
  export async function seek(percent: number): Promise<void> {
    const current = ++operation;
    stopFrame();
    open = false;
    await tick();
    if (disposed || current !== operation) return;
    icon?.reset();
    target = 100;
    from = 0;
    open = true;
    await tick();
    if (disposed || current !== operation) return;
    prepare();
    const active = animations();
    const value = Math.min(100, Math.max(0, percent));
    for (const animation of active) {
      animation.pause();
      animation.currentTime = (duration * value) / 100;
    }
    if (value === 0 || value === 100 || active.length === 0) {
      open = active.length === 0 ? value >= 50 : value === 100;
      await tick();
      if (disposed || current !== operation) return;
      icon?.reset();
      progress = target = open ? 100 : 0;
      running = paused = false;
      status = open ? 'Open' : 'Closed';
    } else {
      progress = value;
      running = false;
      paused = true;
      status = 'Paused';
    }
  }

  export async function play(): Promise<void> {
    if (paused && animations().length) {
      for (const animation of animations()) animation.play();
      running = true;
      paused = false;
      status = open ? 'Opening' : 'Closing';
      observe();
      return;
    }
    const current = operation + 1;
    await reset();
    if (!disposed && current === operation) await setOpen(true);
  }

  export async function pause(): Promise<void> {
    const current = ++operation;
    await tick();
    if (disposed || current !== operation) return;
    if (!animations().length) return;
    stopFrame();
    for (const animation of animations()) animation.pause();
    paused = true;
    running = false;
    status = 'Paused';
  }

  $effect(() => {
    const rate = speed;
    for (const animation of animations()) animation.playbackRate = rate;
  });
  $effect(() => {
    if (reduced) {
      stopFrame();
      icon?.reset();
      progress = target = open ? 100 : 0;
      running = paused = false;
      status = open ? 'Open' : 'Closed';
    }
  });
  onDestroy(() => {
    disposed = true;
    operation++;
    stopFrame();
  });
</script>

<div
  bind:this={host}
  class="study"
  data-status={status}
  data-progress={progress}
  data-running={running}
  data-paused={paused}
>
  <Folder
    bind:this={icon}
    {open}
    {size}
    {color}
    {strokeWidth}
    label={name}
    reducedMotion={reduced ? 'always' : 'system'}
  />
</div>

<style>
  .study {
    display: grid;
    place-items: center;
    line-height: 0;
  }
</style>
