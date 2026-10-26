<script lang="ts">
  import HeroStudio from '#lib/components/HeroStudio.svelte';
  import IconShowcase from '#lib/components/IconShowcase.svelte';
  import Camera from 'squircle-icons-svelte/camera';
  import Heart from 'squircle-icons-svelte/heart';
  import Folder from 'squircle-icons-svelte/animated/folder';
  import Bell from 'squircle-icons-svelte/animated/bell';
  import { catalog } from '#lib/catalog.ts';
  let open = $state(false);
  let bell = $state<{ play(): void; reset(): void }>();
  let heartColor = $state('#202024');
  const questions = [
    {
      title: 'What makes an icon “squircle”?',
      answer:
        'The character comes from the curves of the drawing itself: softer shoulders, considered transitions, and balanced space. It is not a frame around every icon. Familiar symbols keep their familiar shapes.',
    },
    {
      title: 'Can I use these in a project today?',
      answer:
        'You can build and install the local Svelte package for evaluation. This is an alpha: the artwork, API, and package name can change. The original artwork and code are available under the MIT license.',
    },
    {
      title: 'Do animated icons always move?',
      answer:
        'No. Nothing plays on mount or loops by default. Your app controls folder state and bell playback. Hover is optional, and reduced-motion preferences are respected.',
    },
    {
      title: 'What about React and other frameworks?',
      answer:
        'Svelte is the first complete path. The artwork and motion definitions are shared so future adapters can use the same sources. React is not implemented in this alpha.',
    },
  ];
</script>

<section class="hero">
  <div class="hero-texture" aria-hidden="true"></div>
  <IconShowcase />
  <div class="hero-copy">
    <a class="release-pill" href="/icons"
      ><span class="alpha-dot"></span> A small beginning <span class="release-divider"></span> Alpha
      collection <span aria-hidden="true">↗</span></a
    >
    <h1>
      Soft curves.<br /><span class="hero-emphasis"
        >Clear meaning.<svg viewBox="0 0 500 16" preserveAspectRatio="none" aria-hidden="true"
          ><path
            d="M 3 12 C 140 2 350 1 497 9"
            fill="none"
            stroke="currentColor"
            stroke-width="3.5"
            stroke-linecap="round"
          /></svg
        ></span
      >
    </h1>
    <p>
      Six original icons. Static or in motion.<br />Native Svelte components, with a character of
      their own.
    </p>
    <div class="hero-actions">
      <a class="button primary" href="/icons">Explore the icons <span aria-hidden="true">↗</span></a
      ><a class="hero-docs" href="/docs">Meet the library <span aria-hidden="true">→</span></a>
    </div>
  </div>
  <HeroStudio />
</section>
<div class="collection-facts">
  <span><i aria-hidden="true">✳</i> Made from scratch</span><span
    ><strong>06</strong> considered essentials</span
  ><span><strong>02</strong> motion studies</span><span
    ><i class="svelte-dot"></i> Native Svelte 5</span
  >
</div>
<section class="collection-section">
  <div class="section-head">
    <div>
      <div class="eyebrow">THE FIRST COLLECTION</div>
      <h2>Familiar, with feeling.</h2>
      <p>A few everyday essentials. A softer way to say something.</p>
    </div>
    <a class="text-link" href="/icons">Explore all six <span aria-hidden="true">↗</span></a>
  </div>
  <div class="collection-grid">
    {#each catalog as icon}<a href={'/icons#' + icon.name} class="mini-card"
        ><div><icon.component size={40} /></div>
        <span>{icon.name}</span><span class="mini-arrow" aria-hidden="true">↗</span
        >{#if icon.name === 'folder' || icon.name === 'bell'}<span
            class="motion-mark"
            aria-label="Motion available"><i></i></span
          >{/if}</a
      >{/each}
  </div>
</section>
<section class="details-section" aria-labelledby="details-title">
  <div class="center-heading">
    <div class="eyebrow">SMALL DETAILS. A DIFFERENT FEEL.</div>
    <h2 id="details-title">A little more considered.</h2>
    <p>From the first curve to the way it moves in your interface.</p>
  </div>
  <div class="feature-grid">
    <article class="feature-card curve-card">
      <div class="feature-copy">
        <span class="feature-kicker">01 / THE DRAWING</span>
        <h3>Drawn with intention.</h3>
        <p>
          Continuous curves, optical breathing room, and recognizable shapes. Softness without
          losing the point.
        </p>
      </div>
      <div class="curve-study">
        <div class="curve-camera">
          <div class="study-grid" aria-hidden="true"></div>
          <Camera size={138} strokeWidth={1.5} /><span
            class="curve-marker marker-a"
            aria-hidden="true">+</span
          ><span class="curve-marker marker-b" aria-hidden="true">+</span>
        </div>
        <div class="drawing-notes">
          <span><strong>24 × 24</strong>Drawing grid</span><span
            ><strong>1.75</strong>Default stroke</span
          ><span><strong>Just enough.</strong>Room to breathe</span>
        </div>
      </div>
      <div class="feature-bottom">
        <span class="tiny-dot"></span> Original geometry. One source SVG.
      </div>
    </article>
    <article class="feature-card motion-card">
      <div class="feature-copy">
        <span class="feature-kicker">02 / THE GESTURE</span>
        <h3>A little motion.<br />When you ask.</h3>
        <p>A folder opens. A bell rings.<br />Small movements that know when to stop.</p>
      </div>
      <div class="feature-motion">
        <button onclick={() => (open = !open)} aria-label="Try folder motion" aria-pressed={open}
          ><Folder size={59} {open} /><small
            >{open ? 'Close me' : 'Open me'} <span aria-hidden="true">↗</span></small
          ></button
        ><button onclick={() => bell?.play()} aria-label="Try bell motion"
          ><Bell size={59} bind:this={bell} /><small
            >Ring me <span aria-hidden="true">↗</span></small
          ></button
        >
      </div>
      <div class="feature-bottom">
        <span class="tiny-dot"></span> Respects reduced motion. Always.
      </div>
    </article>
    <article class="feature-card code-card">
      <div class="feature-copy">
        <span class="feature-kicker">03 / YOUR CODE</span>
        <h3>Fits right in.</h3>
        <p>One import. A familiar API.<br />The color and size of your interface.</p>
        <a class="text-link" href="/docs">A quick introduction <span aria-hidden="true">↗</span></a>
      </div>
      <div class="code-card-window">
        <div class="code-card-toolbar">
          <span class="file-dot"></span> YourComponent.svelte <span>Svelte 5</span>
        </div>
        <pre><code
            ><span class="syntax-keyword">import</span> Camera <span class="syntax-keyword"
              >from</span
            ><br /><span class="syntax-string">'squircle-icons-svelte/camera'</span>;<br /><br
            />&lt;Camera<br />&nbsp; size=&#123;<span class="syntax-value">24</span>&#125;<br
            />&nbsp; color=<span class="syntax-string">"currentColor"</span><br />&nbsp; label=<span
              class="syntax-string">"Camera"</span
            ><br />/&gt;</code
          ></pre>
      </div>
    </article>
    <article class="feature-card color-card">
      <div class="feature-copy">
        <span class="feature-kicker">04 / YOUR CONTEXT</span>
        <h3>Feels at home.</h3>
        <p>Let the icon follow your text.<br />Or give it a little indigo.</p>
      </div>
      <div class="color-study" style:color={heartColor}>
        <div class="heart-halo" aria-hidden="true"></div>
        <Heart size={84} strokeWidth={1.5} />
      </div>
      <div class="color-choices" role="group" aria-label="Heart preview color">
        <button
          aria-label="Use ink heart"
          aria-pressed={heartColor === '#202024'}
          onclick={() => (heartColor = '#202024')}
          style="--swatch: #202024"
        ></button><button
          aria-label="Use indigo heart"
          aria-pressed={heartColor === '#6366f1'}
          onclick={() => (heartColor = '#6366f1')}
          style="--swatch: #6366f1"
        ></button><button
          aria-label="Use muted heart"
          aria-pressed={heartColor === '#a1a1aa'}
          onclick={() => (heartColor = '#a1a1aa')}
          style="--swatch: #a1a1aa"
        ></button><span>currentColor, by default</span>
      </div>
    </article>
  </div>
</section>
<section class="faq-section">
  <div>
    <div class="eyebrow">GOOD TO KNOW</div>
    <h2>A few little<br />questions.</h2>
    <p>We're at the beginning.<br />Here's where things stand.</p>
  </div>
  <div class="faq-list">
    {#each questions as question}<details>
        <summary>{question.title}<span aria-hidden="true">+</span></summary>
        <p>{question.answer}</p>
      </details>{/each}
  </div>
</section>
<section class="closing-card">
  <div class="closing-glow" aria-hidden="true"></div>
  <div>
    <span class="closing-eyebrow">THE FIRST SIX ARE HERE.</span>
    <h2>Something small.<br />Something to build on.</h2>
    <p>Take a closer look. Tell us where the curves should go.</p>
  </div>
  <a href="/icons" class="button">Find your first icon <span aria-hidden="true">↗</span></a>
</section>

<style>
  .hero {
    position: relative;
    padding: 22px 0 0;
    isolation: isolate;
  }
  .hero-texture {
    position: absolute;
    inset: 0 -48px auto;
    height: 590px;
    z-index: -1;
    pointer-events: none;
    background-image: radial-gradient(#c7c7d7 0.7px, transparent 0.9px);
    background-size: 22px 22px;
    mask-image: radial-gradient(ellipse 55% 85% at 50% 0%, #000 20%, #0006 62%, transparent 100%);
  }
  .hero-copy {
    text-align: center;
    max-width: 830px;
    margin: auto;
    position: relative;
  }
  .release-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    border: 1px solid #e9e9ef;
    background: #ffffffc9;
    backdrop-filter: blur(12px);
    border-radius: 99px;
    padding: 5px 11px;
    font-size: 10px;
    color: #8b8b96;
    box-shadow: 0 2px 4px #18181b02;
    margin-bottom: 20px;
  }
  .alpha-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #818cf8;
  }
  .release-divider {
    height: 10px;
    width: 1px;
    background: #e4e4ec;
    margin: 0 2px;
  }
  .release-pill > span:last-child {
    color: #818cf8;
    margin-left: 3px;
  }
  .hero h1 {
    font-size: clamp(56px, 6.1vw, 78px);
    font-weight: 500;
    line-height: 1.04;
    letter-spacing: -0.055em;
    margin-bottom: 27px;
  }
  .hero-emphasis {
    position: relative;
    display: inline-block;
    color: #4f46e5;
  }
  .hero-emphasis svg {
    position: absolute;
    left: 1%;
    bottom: -9px;
    width: 98%;
    height: 13px;
    color: #a5b4fc;
    opacity: 0.8;
  }
  .hero-copy > p {
    font-size: 15px;
    line-height: 1.75;
    color: #81818c;
    letter-spacing: -0.2px;
    margin-bottom: 25px;
  }
  .hero-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 24px;
  }
  .hero-actions .button {
    font-size: 12px;
    padding: 11px 22px;
    min-height: 42px;
  }
  .hero-docs {
    font-size: 12px;
    color: #73737f;
  }
  .hero-docs > span {
    margin-left: 6px;
    display: inline-block;
  }
  .collection-facts {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 47px;
    max-width: 1030px;
    margin: 39px auto 0;
    padding: 26px 10px 31px;
    border-bottom: 1px solid #eeeef3;
    color: #9696a1;
    font-size: 10px;
  }
  .collection-facts > span {
    display: flex;
    align-items: center;
    gap: 9px;
    white-space: nowrap;
  }
  .collection-facts strong {
    font-weight: 500;
    font-size: 12px;
    color: #52525d;
  }
  .collection-facts i:not(.svelte-dot) {
    font-style: normal;
    color: #a5b4fc;
    font-size: 17px;
  }
  .svelte-dot {
    height: 6px;
    width: 6px;
    border-radius: 50%;
    background: #818cf8;
  }
  .collection-section {
    padding: 79px 0 84px;
  }
  .collection-section .section-head {
    margin-bottom: 27px;
  }
  .collection-section .eyebrow {
    margin-bottom: 13px;
  }
  .collection-section h2 {
    font-size: 34px;
  }
  .collection-section .section-head p {
    font-size: 13px;
    margin-top: 9px;
  }
  .collection-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 13px;
  }
  .mini-card {
    position: relative;
    border: 1px solid #e8e8ee;
    border-radius: 18px;
    padding: 18px 18px 15px;
    background: linear-gradient(#fff, #fdfdfe);
    box-shadow: 0 2px 5px #18181b02;
    transition:
      transform 0.2s,
      border-color 0.2s,
      box-shadow 0.2s;
  }
  .mini-card:hover {
    transform: translateY(-3px);
    border-color: #c7d2fe;
    box-shadow: 0 9px 24px #4f46e50a;
  }
  .mini-card > div {
    height: 96px;
    display: grid;
    place-items: center;
    color: #303036;
  }
  .mini-card > span {
    font-size: 10px;
    color: #9999a4;
  }
  .mini-arrow {
    position: absolute;
    right: 17px;
    bottom: 15px;
    color: #c0c0ce !important;
  }
  .mini-card .motion-mark {
    position: absolute;
    right: 14px;
    top: 15px;
    background: #f0f1ff;
    border: 1px solid #e5e7ff;
    border-radius: 5px;
    width: 15px;
    height: 15px;
    display: grid;
    place-items: center;
  }
  .motion-mark i {
    height: 4px;
    width: 4px;
    background: #a5b4fc;
    border-radius: 50%;
  }
  .center-heading {
    text-align: center;
    margin-bottom: 35px;
  }
  .center-heading .eyebrow {
    justify-content: center;
    margin-bottom: 17px;
  }
  .center-heading h2 {
    font-size: 39px;
    line-height: 1.15;
    letter-spacing: -0.045em;
    margin-bottom: 13px;
  }
  .center-heading > p {
    font-size: 14px;
    color: #92929e;
  }
  .feature-grid {
    display: grid;
    grid-template-columns: 1.35fr 1fr;
    gap: 17px;
  }
  .feature-card {
    min-width: 0;
    border: 1px solid #e7e7ef;
    border-radius: 23px;
    overflow: hidden;
    padding: 32px;
    position: relative;
    box-shadow: 0 2px 5px #18181b02;
    background: #fdfdfe;
  }
  .feature-kicker {
    font-size: 8px;
    letter-spacing: 0.12em;
    color: #aaaab7;
    display: block;
    margin-bottom: 19px;
  }
  .feature-card h3 {
    font-size: 27px;
    font-weight: 500;
    line-height: 1.17;
    letter-spacing: -0.04em;
    margin-bottom: 14px;
  }
  .feature-copy > p {
    font-size: 13px;
    color: #9696a1;
    line-height: 1.75;
    margin-bottom: 0;
    max-width: 370px;
  }
  .curve-study {
    display: grid;
    grid-template-columns: 1fr 130px;
    gap: 25px;
    align-items: center;
    margin-top: 29px;
  }
  .curve-camera {
    height: 180px;
    display: grid;
    place-items: center;
    position: relative;
    color: #333339;
  }
  .study-grid {
    position: absolute;
    width: 180px;
    height: 180px;
    border: 1px solid #e6e6f2;
    background-image:
      linear-gradient(#e7e7f1 1px, transparent 1px),
      linear-gradient(90deg, #e7e7f1 1px, transparent 1px);
    background-size: 15px 15px;
    border-radius: 12px;
    z-index: 0;
    opacity: 0.7;
  }
  .curve-camera > :global(svg) {
    z-index: 1;
  }
  .curve-marker {
    position: absolute;
    color: #a5b4fc;
    font: 13px monospace;
    z-index: 1;
  }
  .marker-a {
    left: calc(50% - 95px);
    top: -7px;
  }
  .marker-b {
    right: calc(50% - 95px);
    bottom: -7px;
  }
  .drawing-notes {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .drawing-notes > span {
    display: flex;
    flex-direction: column;
    font-size: 9px;
    color: #b1b1bc;
    gap: 3px;
  }
  .drawing-notes strong {
    font-size: 13px;
    font-weight: 450;
    color: #858593;
  }
  .feature-bottom {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 9px;
    color: #aaaab5;
    margin-top: 30px;
  }
  .tiny-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #a5b4fc;
  }
  .motion-card {
    background: radial-gradient(ellipse at 50% 100%, #ededff80, transparent 65%), #fdfdfe;
  }
  .feature-motion {
    display: flex;
    gap: 15px;
    margin-top: 26px;
  }
  .feature-motion > button {
    flex: 1;
    min-width: 0;
    border: 1px solid #e7e7f0;
    border-radius: 15px;
    background: #fff;
    box-shadow: 0 5px 15px #312e8104;
    min-height: 144px;
    padding: 22px 17px 14px;
    color: #4f46e5;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  }
  .feature-motion small {
    font-size: 8px;
    color: #a5a5b3;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: 19px;
  }
  .feature-motion small > span {
    color: #a5b4fc;
  }
  .code-card {
    background: #222226;
    color: #f4f4fa;
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    gap: 25px;
    align-items: center;
    box-shadow: inset 0 1px #ffffff0a;
    min-height: 330px;
    border-color: #2b2b33;
  }
  .code-card .feature-kicker {
    color: #7b7b8c;
  }
  .code-card .feature-copy > p {
    color: #858595;
    font-size: 12px;
    line-height: 1.9;
    margin-bottom: 30px;
  }
  .code-card .text-link {
    font-size: 10px;
    color: #b0b0c5;
    border-color: #62627d;
  }
  .code-card-window {
    border: 1px solid #40404b;
    background: #27272d;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 12px 30px #00000020;
  }
  .code-card-toolbar {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 7px;
    color: #9393a5;
    border-bottom: 1px solid #40404b;
    padding: 12px;
  }
  .code-card-toolbar > span:last-child {
    margin-left: auto;
    font-size: 6px;
    color: #77778b;
  }
  .file-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #818cf8;
  }
  .code-card pre {
    border: 0;
    padding: 17px;
    margin: 0;
    background: none;
    color: #d9d9e5;
    font-size: 9px;
    line-height: 1.9;
  }
  .code-card code {
    font-size: 9px;
    white-space: nowrap;
  }
  .syntax-keyword {
    color: #a5b4fc;
  }
  .syntax-string {
    color: #b4b4c9;
  }
  .syntax-value {
    color: #c7d2fe;
  }
  .color-card {
    background: radial-gradient(ellipse at 50% 60%, #f0f0ff, transparent 65%), #fdfdfe;
  }
  .color-study {
    position: relative;
    height: 149px;
    display: grid;
    place-items: center;
    margin-top: 2px;
    isolation: isolate;
  }
  .heart-halo {
    position: absolute;
    height: 123px;
    width: 123px;
    border: 1px solid #e5e5f2;
    border-radius: 50%;
    z-index: -1;
    box-shadow:
      0 0 0 14px #f6f6fc,
      0 0 0 15px #efeff7;
  }
  .color-choices {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-top: 11px;
  }
  .color-choices button {
    width: 15px;
    height: 15px;
    min-width: 15px;
    border-radius: 50%;
    background: var(--swatch);
    border: 3px solid #fff;
    outline: 1px solid #e2e2eb;
    padding: 0;
  }
  .color-choices button[aria-pressed='true'] {
    outline-color: #818cf8;
    box-shadow: 0 0 0 3px #eeeeff;
  }
  .color-choices > span {
    font-size: 8px;
    color: #a6a6b3;
    margin-left: 5px;
  }
  .faq-section {
    display: grid;
    grid-template-columns: 0.85fr 1.3fr;
    gap: 80px;
    padding: 92px 20px 82px;
  }
  .faq-section .eyebrow {
    margin-bottom: 16px;
  }
  .faq-section h2 {
    font-size: 36px;
    line-height: 1.14;
    letter-spacing: -0.04em;
    margin-bottom: 18px;
  }
  .faq-section > div > p {
    font-size: 13px;
    color: #9696a1;
    line-height: 1.8;
  }
  .faq-list details {
    border-bottom: 1px solid #e9e9f0;
  }
  .faq-list summary {
    list-style: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    cursor: pointer;
    padding: 21px 0;
    font-size: 13px;
    color: #5d5d6b;
  }
  .faq-list details:first-child summary {
    padding-top: 2px;
  }
  .faq-list summary::-webkit-details-marker {
    display: none;
  }
  .faq-list summary > span {
    color: #aaaabc;
    font-size: 18px;
    font-weight: 300;
    transition: transform 0.2s;
  }
  .faq-list details[open] summary > span {
    transform: rotate(45deg);
  }
  .faq-list details > p {
    font-size: 12px;
    color: #92929f;
    line-height: 1.9;
    padding-right: 30px;
    margin-bottom: 24px;
  }
  .closing-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;
    background: #212125;
    color: #fff;
    border-radius: 24px;
    padding: 47px 51px;
    position: relative;
    isolation: isolate;
    overflow: hidden;
    box-shadow: inset 0 1px #ffffff12;
  }
  .closing-glow {
    position: absolute;
    inset: 0;
    z-index: -1;
    background: radial-gradient(ellipse at 80% 120%, #4f46e540, transparent 65%);
    pointer-events: none;
  }
  .closing-eyebrow {
    font-size: 8px;
    letter-spacing: 0.12em;
    color: #89899d;
  }
  .closing-card h2 {
    font-size: 34px;
    line-height: 1.13;
    letter-spacing: -0.04em;
    font-weight: 450;
    margin: 17px 0 16px;
  }
  .closing-card p {
    font-size: 12px;
    color: #8e8e9e;
    margin-bottom: 0;
  }
  .closing-card .button {
    border: 1px solid #fff;
    background: #fff;
    color: #29292f;
    font-size: 11px;
    white-space: nowrap;
    padding: 10px 19px;
  }
  .closing-card .button:hover {
    background: #eef2ff;
    border-color: #eef2ff;
  }
  @media (max-width: 900px) {
    .collection-facts {
      gap: 25px;
    }
    .collection-grid {
      grid-template-columns: repeat(3, 1fr);
    }
    .feature-grid {
      grid-template-columns: 1fr 1fr;
    }
    .curve-study {
      grid-template-columns: 1fr 85px;
      gap: 10px;
    }
    .drawing-notes strong {
      font-size: 11px;
    }
    .feature-card {
      padding: 26px;
    }
    .code-card {
      grid-template-columns: 1fr;
    }
    .code-card .feature-copy > p {
      margin-bottom: 18px;
    }
    .code-card-window {
      margin-top: 5px;
    }
    .faq-section {
      gap: 40px;
      padding-inline: 0;
    }
  }
  @media (max-width: 760px) {
    .hero-texture {
      inset-inline: -20px;
    }
  }
  @media (max-width: 650px) {
    .hero {
      padding-top: 20px;
    }
    .hero-texture {
      inset-inline: -20px;
      height: 420px;
      background-size: 20px 20px;
    }
    .release-pill {
      font-size: 8px;
      gap: 7px;
      margin-bottom: 25px;
    }
    .hero h1 {
      font-size: clamp(44px, 11.5vw, 66px);
      letter-spacing: -0.055em;
      margin-bottom: 25px;
    }
    .hero-emphasis svg {
      height: 10px;
      bottom: -7px;
    }
    .hero-copy > p {
      font-size: 13px;
      line-height: 1.8;
      max-width: 320px;
      margin: 0 auto 24px;
    }
    .hero-actions {
      gap: 20px;
    }
    .hero-actions .button {
      font-size: 11px;
      padding: 10px 18px;
    }
    .hero-docs {
      font-size: 11px;
    }
    .collection-facts {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px 15px;
      justify-items: center;
      font-size: 8px;
      margin-top: 25px;
      padding: 20px 0 26px;
    }
    .collection-facts > span {
      gap: 6px;
    }
    .collection-facts strong {
      font-size: 10px;
    }
    .collection-section {
      padding: 52px 0 55px;
    }
    .collection-section h2 {
      font-size: 27px;
    }
    .collection-section .section-head {
      align-items: flex-start;
      gap: 18px;
    }
    .collection-section .section-head p {
      font-size: 11px;
      max-width: 210px;
    }
    .collection-section .text-link {
      font-size: 10px;
      white-space: nowrap;
      margin-top: 28px;
    }
    .collection-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .mini-card {
      padding: 10px 12px 12px;
      border-radius: 14px;
    }
    .mini-card > div {
      height: 78px;
    }
    .mini-card > span {
      font-size: 9px;
    }
    .mini-arrow {
      display: none;
    }
    .mini-card .motion-mark {
      top: 10px;
      right: 9px;
      width: 12px;
      height: 12px;
      border-radius: 4px;
    }
    .motion-mark i {
      width: 3px;
      height: 3px;
    }
    .center-heading {
      margin-bottom: 25px;
    }
    .center-heading .eyebrow {
      font-size: 8px;
      letter-spacing: 0.1em;
    }
    .center-heading h2 {
      font-size: 30px;
    }
    .center-heading > p {
      font-size: 12px;
      max-width: 290px;
      margin-inline: auto;
    }
    .feature-grid {
      grid-template-columns: 1fr;
      gap: 13px;
    }
    .feature-card {
      padding: 26px;
      border-radius: 20px;
    }
    .feature-card h3 {
      font-size: 26px;
    }
    .feature-kicker {
      font-size: 8px;
      margin-bottom: 15px;
    }
    .feature-copy > p {
      font-size: 12px;
    }
    .curve-study {
      grid-template-columns: 1fr 85px;
      margin-top: 25px;
    }
    .curve-camera {
      height: 165px;
    }
    .study-grid {
      width: 165px;
      height: 165px;
    }
    .drawing-notes {
      gap: 18px;
    }
    .drawing-notes > span {
      font-size: 8px;
    }
    .marker-a {
      left: calc(50% - 88px);
    }
    .marker-b {
      right: calc(50% - 88px);
    }
    .feature-bottom {
      font-size: 8px;
      margin-top: 24px;
    }
    .code-card {
      grid-template-columns: 1fr;
    }
    .code-card-window {
      margin-top: 8px;
    }
    .code-card-toolbar {
      font-size: 8px;
    }
    .code-card pre,
    .code-card code {
      font-size: 10px;
    }
    .color-study {
      height: 156px;
      margin-top: 16px;
    }
    .color-choices {
      justify-content: center;
    }
    .faq-section {
      grid-template-columns: 1fr;
      gap: 25px;
      padding: 57px 0;
    }
    .faq-section h2 {
      font-size: 29px;
    }
    .faq-section h2 br {
      display: none;
    }
    .faq-section > div > p {
      font-size: 12px;
    }
    .faq-section > div > p br {
      display: none;
    }
    .faq-list summary {
      font-size: 12px;
      gap: 16px;
      padding: 18px 0;
    }
    .faq-list details > p {
      font-size: 11px;
    }
    .closing-card {
      flex-direction: column;
      align-items: flex-start;
      gap: 25px;
      padding: 31px 27px;
      border-radius: 20px;
    }
    .closing-card h2 {
      font-size: 30px;
    }
    .closing-card p {
      font-size: 11px;
      max-width: 260px;
    }
    .closing-card .button {
      font-size: 11px;
    }
  }
</style>
