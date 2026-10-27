<script lang="ts">
  import { onMount } from 'svelte';

  let stage = $state<HTMLDivElement>();
  let running = $state(false);
  onMount(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const update = () => (running = visible && !document.hidden && !media.matches);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    if (stage) observer.observe(stage);
    media.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      media.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  });
</script>

<div class="hero-aura" data-testid="hero-aura" aria-hidden="true" bind:this={stage}>
  <div class="glow-colors" class:running></div>
</div>
<div class="hero-dot-field" aria-hidden="true"></div>

<style>
  .hero-dot-field {
    position: absolute;
    z-index: -1;
    top: 0;
    left: 50%;
    width: 100vw;
    height: 560px;
    transform: translateX(-50%);
    pointer-events: none;
    background-image: radial-gradient(circle, var(--faint) 0.75px, transparent 0.9px);
    background-size: 24px 24px;
    opacity: 0.22;
    mask-image: radial-gradient(
      ellipse 65% 100% at 50% 0%,
      #000 0%,
      #0009 32%,
      #0003 58%,
      transparent 88%
    );
  }
  .hero-aura {
    --glow-gain: 1.5;
    position: absolute;
    z-index: -1;
    top: calc(-1 * var(--site-header-height));
    left: 50%;
    width: 100vw;
    height: calc(660px + var(--site-header-height));
    transform: translateX(-50%);
    pointer-events: none;
    overflow: clip;
    mask-image: radial-gradient(
      ellipse 85% 100% at 50% -12%,
      color-mix(in srgb, #000 calc(18% * var(--glow-gain)), transparent),
      color-mix(in srgb, #000 calc(16% * var(--glow-gain)), transparent) 15%,
      color-mix(in srgb, #000 calc(12% * var(--glow-gain)), transparent) 30%,
      color-mix(in srgb, #000 calc(8% * var(--glow-gain)), transparent) 45%,
      color-mix(in srgb, #000 calc(4.5% * var(--glow-gain)), transparent) 60%,
      color-mix(in srgb, #000 calc(2% * var(--glow-gain)), transparent) 72%,
      color-mix(in srgb, #000 calc(0.65% * var(--glow-gain)), transparent) 84%,
      color-mix(in srgb, #000 calc(0.15% * var(--glow-gain)), transparent) 94%,
      transparent 100%
    );
  }
  .glow-colors {
    position: absolute;
    inset: 0 auto 0 0;
    width: 200%;
    background: linear-gradient(
      90deg,
      #818cf8 0%,
      var(--color-amber-500) 25%,
      #818cf8 50%,
      var(--color-amber-500) 75%,
      #818cf8 100%
    );
    transform: translateX(-50%);
    animation: glow-flow 40s linear infinite;
    animation-play-state: paused;
  }
  :global(html:not([data-theme='dark'])) .hero-aura {
    mask-image: radial-gradient(
      ellipse 85% 100% at 50% -12%,
      #00000045 0%,
      #00000038 16%,
      #00000026 32%,
      #00000014 50%,
      #00000007 68%,
      #00000001 84%,
      transparent 96%
    );
  }
  :global(html:not([data-theme='dark'])) .hero-aura::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse 85% 100% at 50% -12%,
      rgb(255 255 255 / 0) 18%,
      rgb(255 255 255 / 0.12) 32%,
      rgb(255 255 255 / 0.4) 48%,
      rgb(255 255 255 / 0.76) 64%,
      rgb(255 255 255 / 0.96) 80%,
      #ffffff 94%
    );
  }
  .glow-colors.running {
    animation-play-state: running;
  }
  @keyframes glow-flow {
    from {
      transform: translateX(-50%);
    }
    to {
      transform: translateX(0);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .glow-colors {
      animation: none;
    }
  }
</style>
