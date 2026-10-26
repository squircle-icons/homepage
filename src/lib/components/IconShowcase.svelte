<script lang="ts">
  import Camera from '@squircle-icons/svelte/camera';
  import Folder from '@squircle-icons/svelte/animated/folder';
  import Bell from '@squircle-icons/svelte/animated/bell';
  import Heart from '@squircle-icons/svelte/heart';
  import Search from '@squircle-icons/svelte/search';
  import Settings from '@squircle-icons/svelte/settings';
  let open = $state(false);
  let bell = $state<{ play(): void; reset(): void }>();
</script>

<div class="icon-showcase" aria-label="The first six original icons" data-testid="icon-showcase">
  <div class="showcase-grid" aria-hidden="true"></div>
  <div class="showcase-glow" aria-hidden="true"></div>
  <span class="orbit-line line-a" aria-hidden="true"></span><span
    class="orbit-line line-b"
    aria-hidden="true"
  ></span>
  <button
    class="showcase-tile bell-tile"
    aria-label="Ring showcase bell"
    onclick={() => bell?.play()}
    ><Bell size={30} bind:this={bell} hover /><span class="motion-indicator" aria-hidden="true"
    ></span></button
  >
  <button
    class="showcase-tile folder-tile"
    aria-label="Toggle showcase folder"
    aria-pressed={open}
    onclick={() => (open = !open)}
    ><Folder size={32} {open} hover /><span class="motion-indicator" aria-hidden="true"
    ></span></button
  >
  <a class="showcase-tile camera-tile" href="/icons#camera" aria-label="Explore camera icon"
    ><Camera size={72} strokeWidth={1.5} /><span class="camera-label">camera</span></a
  >
  <a class="showcase-tile heart-tile" href="/icons#heart" aria-label="Explore heart icon"
    ><Heart size={29} /></a
  >
  <a class="showcase-tile search-tile" href="/icons#search" aria-label="Explore search icon"
    ><Search size={30} /></a
  >
  <a class="showcase-tile settings-tile" href="/icons#settings" aria-label="Explore settings icon"
    ><Settings size={28} /></a
  >
  <span class="showcase-note note-a">a little softer.</span><span class="showcase-note note-b"
    >a little more alive.</span
  >
</div>

<style>
  .icon-showcase {
    position: relative;
    isolation: isolate;
    width: 740px;
    max-width: 100%;
    height: 170px;
    margin: 0 auto 12px;
    color: #25252b;
  }
  .showcase-grid {
    position: absolute;
    z-index: -2;
    inset: -15px 0 -5px;
    background-image:
      linear-gradient(#e9e9f280 1px, transparent 1px),
      linear-gradient(90deg, #e9e9f280 1px, transparent 1px);
    background-size: 34px 34px;
    mask-image: radial-gradient(ellipse at center, #000 5%, transparent 69%);
    pointer-events: none;
  }
  .showcase-glow {
    position: absolute;
    z-index: -1;
    inset: 20px 30% 0;
    background: radial-gradient(ellipse, #c7d2fe66, transparent 66%);
    filter: blur(18px);
    pointer-events: none;
  }
  .showcase-tile {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 59px;
    height: 59px;
    border: 1px solid #e7e7ef;
    border-radius: 17px;
    background: linear-gradient(145deg, #ffffffeb, #f9f9fdd9);
    box-shadow:
      inset 0 1px #fff,
      0 4px 8px #18181b03,
      0 13px 25px -12px #4f46e51a;
    color: #41414a;
    transform: rotate(var(--tilt, 0deg));
    backdrop-filter: blur(8px);
    padding: 0;
  }
  .showcase-tile:focus-visible {
    outline: 2px solid #818cf8;
    outline-offset: 5px;
  }
  .camera-tile {
    width: 110px;
    height: 110px;
    left: calc(50% - 55px);
    top: 25px;
    z-index: 3;
    --tilt: -4deg;
    color: #202024;
    border-radius: 29px;
    border-color: #dcdde8;
    box-shadow:
      inset 0 1px #fff,
      0 4px 10px #18181b04,
      0 18px 38px -15px #4f46e522;
    background: linear-gradient(140deg, #fff, #f7f7ff);
  }
  .camera-label {
    position: absolute;
    bottom: -21px;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 8px;
    color: #a5a5b5;
    letter-spacing: 0.04em;
  }
  .bell-tile {
    top: 14px;
    left: calc(50% - 207px);
    --tilt: -9deg;
    color: #7b7b8c;
  }
  .folder-tile {
    top: 99px;
    left: calc(50% - 304px);
    --tilt: -5deg;
    color: #858594;
  }
  .heart-tile {
    top: 7px;
    right: calc(50% - 228px);
    --tilt: 9deg;
    color: #7f7f90;
  }
  .search-tile {
    top: 92px;
    right: calc(50% - 309px);
    --tilt: 7deg;
    color: #8a8a9b;
  }
  .settings-tile {
    top: 107px;
    left: calc(50% + 91px);
    width: 52px;
    height: 52px;
    --tilt: -7deg;
    color: #9999ad;
    border-radius: 15px;
  }
  .motion-indicator {
    position: absolute;
    right: 8px;
    top: 8px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #a5b4fc;
    box-shadow: 0 0 0 3px #eef2ff;
  }
  .orbit-line {
    position: absolute;
    height: 1px;
    background: linear-gradient(90deg, transparent, #e7e7f2, transparent);
    z-index: -1;
    transform: rotate(-7deg);
    width: 230px;
  }
  .line-a {
    left: 70px;
    top: 79px;
  }
  .line-b {
    right: 45px;
    top: 77px;
    transform: rotate(12deg);
  }
  .showcase-note {
    position: absolute;
    color: #c0c0ce;
    font-size: 8px;
    letter-spacing: 0.01em;
  }
  .note-a {
    left: calc(50% - 208px);
    top: 113px;
    transform: rotate(-5deg);
  }
  .note-b {
    right: calc(50% - 244px);
    top: 77px;
    transform: rotate(6deg);
  }
  @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
    .showcase-tile {
      transition:
        transform 0.2s,
        box-shadow 0.2s,
        border-color 0.2s;
    }
    .showcase-tile:hover {
      transform: translateY(-3px) rotate(var(--tilt, 0deg));
      border-color: #b9bdf6;
      box-shadow:
        inset 0 1px #fff,
        0 14px 26px -12px #4f46e52a;
    }
  }
  @media (max-width: 760px) {
    .icon-showcase {
      height: 158px;
      width: 590px;
    }
    .showcase-grid {
      inset-inline: 0;
    }
    .bell-tile {
      left: 14%;
      top: 10px;
    }
    .folder-tile {
      left: 1%;
      top: 91px;
    }
    .heart-tile {
      right: 12%;
      top: 1px;
    }
    .search-tile {
      right: 0;
      top: 88px;
    }
    .settings-tile {
      left: 67%;
      top: 101px;
    }
    .note-a,
    .note-b {
      display: none;
    }
    .line-a {
      left: 1%;
      width: 42%;
    }
    .line-b {
      right: 0;
      width: 40%;
    }
  }
  @media (max-width: 650px) {
    .icon-showcase {
      height: 143px;
      margin-bottom: 8px;
    }
    .showcase-tile {
      width: 48px;
      height: 48px;
      border-radius: 14px;
    }
    .showcase-tile > :global(svg) {
      width: 25px;
      height: 25px;
    }
    .camera-tile {
      height: 85px;
      width: 85px;
      left: calc(50% - 42.5px);
      top: 24px;
      border-radius: 23px;
    }
    .camera-tile > :global(svg) {
      height: 55px;
      width: 55px;
    }
    .camera-label {
      bottom: -18px;
      font-size: 7px;
    }
    .bell-tile {
      top: 8px;
      left: 15%;
    }
    .folder-tile {
      left: 0;
      top: 81px;
    }
    .heart-tile {
      right: 13%;
      top: 0;
    }
    .search-tile {
      right: 0;
      top: 76px;
    }
    .settings-tile {
      width: 42px;
      height: 42px;
      left: 66%;
      top: 97px;
      border-radius: 12px;
    }
    .settings-tile > :global(svg) {
      width: 23px;
      height: 23px;
    }
    .motion-indicator {
      height: 3px;
      width: 3px;
      right: 7px;
      top: 7px;
    }
    .showcase-grid {
      background-size: 27px 27px;
    }
  }
</style>
