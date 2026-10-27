<script lang="ts">
  import HeroAura from '#lib/components/HeroAura.svelte';
  import HeroIconGrid from '#lib/components/HeroIconGrid.svelte';
  import Camera from '@squircle-icons/svelte/camera';
  import Heart from '@squircle-icons/svelte/heart';
  let heartColor = $state('#202024');
</script>

<section class="hero">
  <HeroAura />
  <div class="hero-copy">
    <h1 class="page-appear" style="--appear-duration: 520ms">
      Soft edges.<br /><span class="hero-emphasis">Rounded character.</span>
    </h1>
    <p class="page-appear" style="--appear-duration: 520ms; --appear-delay: 60ms">
      Original icons in Outline and Filled.<br />Native Svelte components, with a character of their
      own.
    </p>
    <div class="hero-actions page-appear" style="--appear-duration: 520ms; --appear-delay: 120ms">
      <a class="button primary" href="/icons">Explore the icons </a><a
        class="hero-docs"
        href="/docs"
        >Meet the library
      </a>
    </div>
  </div>
  <HeroIconGrid />
</section>
<section class="details-section" aria-labelledby="details-title">
  <div class="center-heading">
    <div class="eyebrow">SMALL DETAILS. A DIFFERENT FEEL.</div>
    <h2 id="details-title">A little more considered.</h2>
    <p>From the first curve to the way it fits in your interface.</p>
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
          <Camera size={138} strokeWidth={1.5} />
        </div>
        <div class="drawing-notes">
          <span><strong>24 × 24</strong>Drawing grid</span><span
            ><strong>1.70</strong>Default stroke</span
          ><span><strong>Just enough.</strong>Room to breathe</span>
        </div>
      </div>
      <div class="feature-bottom">
        <span class="tiny-dot"></span> Original geometry. One source SVG.
      </div>
    </article>
    <article class="feature-card style-card">
      <div class="feature-copy">
        <span class="feature-kicker">02 / THE STYLES</span>
        <h3>One icon. Two expressions.</h3>
        <p>Outline for a lighter touch.<br />Filled for a stronger presence.</p>
      </div>
      <div class="feature-styles">
        <div><Camera size={59} /><small>Outline</small></div>
        <div><Camera size={59} style="filled" /><small>Filled</small></div>
      </div>
      <div class="feature-bottom">
        <span class="tiny-dot"></span> Original drawings. Consistent contours.
      </div>
    </article>
    <article class="feature-card color-card">
      <div class="feature-copy">
        <span class="feature-kicker">03 / YOUR CONTEXT</span>
        <h3>Feels at home.</h3>
        <p>Let the icon follow your text.<br />Or give it a little amber.</p>
      </div>
      <div class="color-study" style:color={heartColor === '#202024' ? 'var(--text)' : heartColor}>
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
          aria-label="Use amber heart"
          aria-pressed={heartColor === 'var(--color-amber-500)'}
          onclick={() => (heartColor = 'var(--color-amber-500)')}
          style="--swatch: var(--color-amber-500)"
        ></button><button
          aria-label="Use muted heart"
          aria-pressed={heartColor === '#a1a1aa'}
          onclick={() => (heartColor = '#a1a1aa')}
          style="--swatch: #a1a1aa"
        ></button><span>currentColor, by default</span>
      </div>
    </article>
    <article class="feature-card code-card">
      <div class="feature-copy">
        <span class="feature-kicker">04 / YOUR CODE</span>
        <h3>Fits right in.</h3>
        <p>One import. A familiar API.<br />The color and size of your interface.</p>
        <a class="text-link" href="/docs">A quick introduction </a>
      </div>
      <div class="code-card-window">
        <div class="code-card-toolbar">
          <span class="file-dot"></span> YourComponent.svelte <span>Svelte 5</span>
        </div>
        <pre><code
            ><span class="syntax-keyword">import</span> Camera <span class="syntax-keyword"
              >from</span
            ><br /><span class="syntax-string">'@squircle-icons/svelte/camera'</span>;<br /><br
            />&lt;Camera<br />&nbsp; size=&#123;<span class="syntax-value">24</span>&#125;<br
            />&nbsp; color=<span class="syntax-string">"currentColor"</span><br />&nbsp; label=<span
              class="syntax-string">"Camera"</span
            ><br />/&gt;</code
          ></pre>
      </div>
    </article>
  </div>
</section>
<section class="closing-card">
  <div class="closing-glow" aria-hidden="true"></div>
  <div>
    <span class="closing-eyebrow">THE COLLECTION STARTS HERE.</span>
    <h2>Something small.<br />Something to build on.</h2>
    <p>Take a closer look. Tell us where the curves should go.</p>
  </div>
  <a href="/icons" class="button">Find your first icon </a>
</section>

<style>
  .hero {
    position: relative;
    padding: 144px 0 0;
    isolation: isolate;
  }
  .hero-copy {
    text-align: center;
    max-width: 830px;
    margin: auto;
    position: relative;
  }
  .hero h1 {
    font-size: clamp(56px, 6.1vw, 78px);
    font-weight: 500;
    line-height: 1.04;
    letter-spacing: -0.055em;
    margin-bottom: 27px;
  }
  .hero-emphasis {
    color: var(--color-amber-500);
    position: relative;
    display: inline-block;
  }
  .hero-copy > p {
    font-size: 14px;
    line-height: 1.75;
    color: var(--muted);
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
    font-size: 14px;
    padding: 11px 22px;
    min-height: 42px;
  }
  .hero-docs {
    font-size: 14px;
    color: var(--muted);
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
    color: var(--faint);
  }
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 17px;
  }
  .details-section {
    padding: 88px 0 64px;
  }
  .curve-card,
  .code-card {
    grid-column: span 7;
  }
  .style-card,
  .color-card {
    grid-column: span 5;
  }
  .feature-card {
    min-width: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius-card-large);
    overflow: hidden;
    padding: 28px;
    position: relative;
    box-shadow: 0 2px 5px #18181b02;
    background: var(--surface);
  }
  .feature-kicker {
    font-size: 8px;
    letter-spacing: 0.12em;
    color: var(--faint);
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
    color: var(--faint);
    line-height: 1.75;
    margin-bottom: 0;
    max-width: 370px;
  }
  .curve-study {
    display: grid;
    grid-template-columns: 1fr 130px;
    gap: 25px;
    align-items: center;
    margin-top: 22px;
  }
  .curve-camera {
    height: 140px;
    display: grid;
    place-items: center;
    position: relative;
    color: var(--text);
  }
  .study-grid {
    position: absolute;
    width: 140px;
    height: 140px;
    border: 1px solid var(--border);
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
  .drawing-notes {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .drawing-notes > span {
    display: flex;
    flex-direction: column;
    font-size: 9px;
    color: var(--faint);
    gap: 3px;
  }
  .drawing-notes strong {
    font-size: 13px;
    font-weight: 450;
    color: var(--muted);
  }
  .feature-bottom {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 9px;
    color: var(--faint);
    margin-top: 22px;
  }
  .tiny-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--color-amber-500);
  }
  .style-card {
    background:
      radial-gradient(
        ellipse at 50% 100%,
        color-mix(in srgb, var(--surface) 50.2%, transparent),
        transparent 65%
      ),
      var(--surface);
  }
  .feature-styles {
    display: flex;
    gap: 15px;
    margin-top: 26px;
  }
  .feature-styles > div {
    flex: 1;
    min-width: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius-card-small);
    background: var(--surface);
    box-shadow: 0 5px 15px #312e8104;
    min-height: 112px;
    padding: 22px 17px 14px;
    color: var(--accent-text);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  }
  .feature-styles small {
    font-size: 8px;
    color: var(--faint);
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: 19px;
  }
  .code-card {
    background: #222226;
    color: var(--faint);
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    gap: 25px;
    align-items: center;
    box-shadow: inset 0 1px color-mix(in srgb, var(--edge-highlight) 3.92%, transparent);
    min-height: 300px;
    border-color: #2b2b33;
  }
  .code-card .feature-kicker {
    color: var(--muted);
  }
  .code-card .feature-copy > p {
    color: var(--muted);
    font-size: 12px;
    line-height: 1.9;
    margin-bottom: 30px;
  }
  .code-card .text-link {
    font-size: 10px;
    color: var(--faint);
    border-color: #62627d;
  }
  .code-card-window {
    border: 1px solid #40404b;
    background: #27272d;
    border-radius: var(--radius-card-small);
    overflow: hidden;
    box-shadow: 0 12px 30px #00000020;
  }
  .code-card-toolbar {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 7px;
    color: var(--faint);
    border-bottom: 1px solid #40404b;
    padding: 12px;
  }
  .code-card-toolbar > span:last-child {
    margin-left: auto;
    font-size: 6px;
    color: var(--muted);
  }
  .file-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--color-amber-500);
  }
  .code-card pre {
    border: 0;
    padding: 17px;
    margin: 0;
    background: none;
    color: var(--faint);
    font-size: 9px;
    line-height: 1.9;
  }
  .code-card code {
    font-size: 9px;
    white-space: nowrap;
  }
  .syntax-keyword {
    color: var(--color-amber-500);
  }
  .syntax-string {
    color: var(--faint);
  }
  .syntax-value {
    color: #c7d2fe;
  }
  .color-card {
    background:
      radial-gradient(ellipse at 50% 60%, var(--surface-subtle), transparent 65%), var(--surface);
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
    border: 1px solid var(--border);
    border-radius: 50%;
    z-index: -1;
    box-shadow:
      0 0 0 14px var(--edge-highlight),
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
    border: 3px solid var(--border);
    outline: 1px solid #e2e2eb;
    padding: 0;
  }
  .color-choices button[aria-pressed='true'] {
    outline-color: var(--color-amber-500);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-amber-500) 18%, transparent);
  }
  .color-choices > span {
    font-size: 8px;
    color: var(--faint);
    margin-left: 5px;
  }
  .closing-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;
    background: #212125;
    color: #fff;
    border-radius: var(--radius-card-large);
    padding: 47px 51px;
    position: relative;
    isolation: isolate;
    overflow: hidden;
    box-shadow: inset 0 1px color-mix(in srgb, var(--edge-highlight) 7.06%, transparent);
  }
  .closing-glow {
    position: absolute;
    inset: 0;
    z-index: -1;
    background: radial-gradient(
      ellipse at 80% 120%,
      color-mix(in oklab, var(--color-amber-500) 25.1%, transparent),
      transparent 65%
    );
    pointer-events: none;
  }
  .closing-eyebrow {
    font-size: 8px;
    letter-spacing: 0.12em;
    color: var(--muted);
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
    color: var(--muted);
    margin-bottom: 0;
  }
  .closing-card .button {
    border: 1px solid var(--color-amber-500);
    background: var(--color-amber-500);
    color: var(--accent-foreground);
    font-size: 11px;
    white-space: nowrap;
    padding: 10px 19px;
  }
  .closing-card .button:hover {
    background: color-mix(in oklab, var(--color-amber-500) 92%, black);
    border-color: var(--color-amber-500);
  }
  @media (max-width: 900px) {
    .feature-grid {
      grid-template-columns: 1fr 1fr;
    }
    .feature-card {
      grid-column: auto;
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
  }
  @media (max-width: 650px) {
    .hero {
      padding-top: 20px;
    }
    .hero h1 {
      font-size: clamp(44px, 11.5vw, 66px);
      letter-spacing: -0.055em;
      margin-bottom: 25px;
    }
    .hero-copy > p {
      font-size: 14px;
      line-height: 1.8;
      max-width: 320px;
      margin: 0 auto 24px;
    }
    .hero-actions {
      gap: 20px;
    }
    .hero-actions .button {
      font-size: 14px;
      padding: 10px 18px;
    }
    .hero-docs {
      font-size: 14px;
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
      border-radius: var(--radius-card-large);
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
    .closing-card {
      flex-direction: column;
      align-items: flex-start;
      gap: 25px;
      padding: 31px 27px;
      border-radius: var(--radius-card-large);
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

  .hero-emphasis::after {
    content: '';
    position: absolute;
    left: 1%;
    right: 1%;
    bottom: -3px;
    height: 7px;
    border-top: 2px solid var(--color-amber-500);
    border-radius: 50%;
    transform: rotate(-0.4deg);
    pointer-events: none;
  }
  .closing-card {
    margin-top: 76px;
  }
</style>
