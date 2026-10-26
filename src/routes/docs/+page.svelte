<script lang="ts">
  const examples = [
    '# In the svelte repository:\npnpm install --frozen-lockfile\npnpm build\npnpm pack --pack-destination .artifacts\n\n# In your Svelte 5 application:\npnpm add /absolute/path/to/squircle-icons-svelte-0.0.0.tgz',
    '<script lang="ts">\n  import Camera from \'squircle-icons-svelte/camera\';\n<\/script>\n\n<Camera size={24} color="currentColor" strokeWidth={1.75} />\n<Camera size={20} label="Camera" />',
    "<script lang=\"ts\">\n  import Folder from 'squircle-icons-svelte/animated/folder';\n  import Bell from 'squircle-icons-svelte/animated/bell';\n  let open = $state(false);\n  let bell: { play(): void; reset(): void };\n<\/script>\n\n<button onclick={() => open = !open} aria-expanded={open}>\n  <Folder {open} /> Files\n</button>\n<button onclick={() => bell.play()}>\n  <Bell bind:this={bell} /> Preview notification\n</button>",
    '<!-- The button already has a name; the icon is decorative. -->\n<button aria-label="Take a photo"><Camera /></button>\n\n<!-- The icon itself conveys meaning. -->\n<Camera label="Camera available" />',
    '# Run in each repository:\npnpm verify\n\n# In svelte, after committing a core change:\npnpm sync:core ../core\n\n# In homepage, after committing an adapter change:\npnpm sync:svelte ../svelte',
  ];
</script>

<svelte:head><title>Documentation — Squircle Icons</title></svelte:head>
<section class="page-heading">
  <div class="eyebrow">The guide</div>
  <h1>A thoughtful starting point.</h1>
  <p>
    Small components, explicit motion, and one source of truth. Everything you need to use the first
    collection.
  </p>
</section>
<div class="docs-layout">
  <nav aria-label="Documentation sections">
    <span class="mono">ON THIS PAGE</span><a href="#installation">Getting started</a><a
      href="#static">Static icons</a
    ><a href="#props">Component props</a><a href="#motion">Motion</a><a href="#accessibility"
      >Accessibility</a
    ><a href="#contributing">Contributing</a>
  </nav>
  <div class="docs-content">
    <section id="installation">
      <span class="section-number mono">01 / GETTING STARTED</span>
      <h2>Start with the local package.</h2>
      <p>
        This collection is an alpha-stage design preview. It has not been published to npm. Build
        the local package from the Svelte repository. Use Node.js 22.17+ and pnpm 10.10.0; the
        checked toolchain uses Node.js 24.
      </p>
      <pre><code>{examples[0]}</code></pre>
      <p class="callout">
        The package name is provisional. Original artwork, motion recipes, and code are licensed
        under MIT. Third-party assets retain their own licenses.
      </p>
    </section>
    <section id="static">
      <span class="section-number mono">02 / STATIC ICONS</span>
      <h2>Import exactly what you use.</h2>
      <p>
        Each icon has its own entry point. Static icons do not import the motion controller or
        recipes.
      </p>
      <pre><code>{examples[1]}</code></pre>
      <p>
        You can also use named static exports: <code
          >import &#123; Camera &#125; from 'squircle-icons-svelte'</code
        >. A production bundle check verifies that unused icons are removed.
      </p>
    </section>
    <section id="props">
      <span class="section-number mono">03 / THE API</span>
      <h2>A few considered defaults.</h2>
      <div class="table-scroll">
        <table>
          <thead><tr><th>Prop</th><th>Default</th><th>Purpose</th></tr></thead><tbody
            ><tr
              ><td><code>size</code></td><td><code>24</code></td><td
                >Width and height; number or CSS length.</td
              ></tr
            ><tr
              ><td><code>color</code></td><td><code>currentColor</code></td><td
                >Stroke color. Inherits text color by default.</td
              ></tr
            ><tr
              ><td><code>strokeWidth</code></td><td><code>1.75</code></td><td
                >Stroke width in the 24-unit drawing grid.</td
              ></tr
            ><tr
              ><td><code>label</code></td><td>Unset</td><td
                >One accessible name for a meaningful icon.</td
              ></tr
            ><tr><td><code>class</code></td><td>Unset</td><td>Style the root SVG.</td></tr></tbody
          >
        </table>
      </div>
      <p>
        These components deliberately expose a small API. They do not forward arbitrary attributes
        or turn themselves into interactive controls.
      </p>
    </section>
    <section id="motion">
      <span class="section-number mono">04 / PURPOSEFUL MOTION</span>
      <h2>State when it matters.<br />A gesture when it helps.</h2>
      <p>
        Animated icons have a separate entry point. Folder uses the controlled <code>open</code>
        prop. Bell exposes <code>play()</code> and <code>reset()</code> through
        <code>bind:this</code>. Folder also exposes <code>reset()</code>.
      </p>
      <pre><code>{examples[2]}</code></pre>
      <div class="table-scroll">
        <table>
          <thead><tr><th>Behavior</th><th>Contract</th></tr></thead><tbody
            ><tr
              ><td>Initial render</td><td
                >No autoplay. Folder renders its initial open/closed pose on the server.</td
              ></tr
            ><tr
              ><td>Folder state change</td><td
                >220 ms transition. An interrupted transition continues from the visible pose toward
                the newest target.</td
              ></tr
            ><tr
              ><td>Bell playback</td><td
                >600 ms, once, ending at rest. Replaying cancels the old cycle and restarts from
                rest.</td
              ></tr
            ><tr
              ><td><code>hover=true</code></td><td
                >Off by default. Folder previews open until pointer exit; <code>open=true</code> keeps
                it open. Bell plays once per entry.</td
              ></tr
            ><tr
              ><td><code>reset()</code></td><td
                >Immediate. Folder clears hover and returns to the controlled state; bell returns to
                rest. Does not mutate the parent prop.</td
              ></tr
            ><tr
              ><td><code>reducedMotion</code></td><td
                ><code>system</code> by default; <code>always</code> also available. Folder snaps to state;
                bell stays at rest.</td
              ></tr
            ><tr
              ><td>Unmount</td><td
                >Animations are cancelled and preference listeners removed. Methods called before
                mount or after teardown are harmless.</td
              ></tr
            ></tbody
          >
        </table>
      </div>
      <p>
        Playback uses native Web Animations API transforms. Unsupported animation APIs settle
        immediately at the correct state. There is no physics or path morphing engine.
      </p>
    </section>
    <section id="accessibility">
      <span class="section-number mono">05 / ACCESSIBILITY</span>
      <h2>Meaning belongs in context.</h2>
      <p>
        Icons without a <code>label</code> are decorative and hidden from assistive technology. A
        nonempty label adds <code>role="img"</code> and a single <code>aria-label</code>. We do not
        add a duplicate SVG title.
      </p>
      <pre><code>{examples[3]}</code></pre>
      <p>
        Icons never add tab stops. Use buttons or links for interaction, and provide text or
        application status for meaningful notifications. A ringing animation alone must not carry
        essential information.
      </p>
      <p>
        System reduced-motion changes are respected even during playback. No global DOM work occurs
        on import, and the first six drawings require no DOM IDs.
      </p>
    </section>
    <section id="contributing">
      <span class="section-number mono">06 / BUILDING TOGETHER</span>
      <h2>One drawing. A shared vocabulary.</h2>
      <p>
        The core repository owns SVGs in <code>icons/</code> and motion recipes in
        <code>motions/</code>. Recipes reference stable named parts. Generated components must not
        be edited by hand.
      </p>
      <pre><code>{examples[4]}</code></pre>
      <p>
        The 24×24 grid, 1.75 stroke, optical padding, and curvature are proposals awaiting visual
        review. Refer to CONTRIBUTING and the architecture notes for the relevant repository before
        changing the data model or adapter.
      </p>
      <p class="callout">
        Next decision: review the six silhouettes and motion studies before adding more icons or
        another framework. The final package name is still open; the project uses the MIT license.
      </p>
    </section>
  </div>
</div>

<style>
  .docs-layout {
    display: grid;
    grid-template-columns: 210px minmax(0, 1fr);
    gap: 65px;
    align-items: start;
  }
  .docs-layout > nav {
    display: flex;
    flex-direction: column;
    gap: 13px;
    position: sticky;
    top: 30px;
    border-top: 1px solid #e4e4e7;
    padding-top: 22px;
  }
  .docs-layout > nav > span {
    font-size: 9px;
    letter-spacing: 0.12em;
    color: #a1a1aa;
    margin-bottom: 10px;
  }
  .docs-layout > nav > a {
    font-size: 12px;
    color: #71717a;
  }
  .docs-layout > nav > a:hover {
    color: #4f46e5;
  }
  .docs-content {
    max-width: 760px;
  }
  .docs-content > section {
    border-top: 1px solid #e4e4e7;
    padding-top: 26px;
    padding-bottom: 45px;
    scroll-margin-top: 28px;
  }
  .section-number {
    font-size: 9px;
    letter-spacing: 0.12em;
    color: #a1a1aa;
    display: block;
    margin-bottom: 22px;
  }
  .docs-content h2 {
    font-size: 28px;
    margin-bottom: 20px;
  }
  .docs-content p {
    font-size: 13px;
    color: #71717a;
    line-height: 1.9;
  }
  .docs-content pre {
    font-size: 11px;
    margin: 22px 0;
  }
  .callout {
    border-left: 2px solid #6366f1;
    background: #eef2ff;
    padding: 15px 18px;
    border-radius: 0 8px 8px 0;
  }
  .table-scroll {
    overflow-x: auto;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 12px;
    margin: 22px 0;
  }
  th {
    text-align: left;
    font-size: 10px;
    letter-spacing: 0.04em;
    color: #71717a;
    font-weight: 500;
  }
  th,
  td {
    border-bottom: 1px solid #e4e4e7;
    padding: 14px 12px 14px 0;
    vertical-align: top;
  }
  td {
    color: #71717a;
  }
  td:first-child {
    color: #27272a;
    min-width: 125px;
  }
  td:last-child {
    padding-right: 0;
  }
  @media (max-width: 760px) {
    .docs-layout {
      grid-template-columns: 1fr;
      gap: 26px;
    }
    .docs-layout > nav {
      position: static;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 10px 20px;
    }
    .docs-layout > nav > span {
      width: 100%;
      margin: 0;
    }
    .docs-content h2 {
      font-size: 25px;
    }
    .docs-content pre {
      padding: 17px;
      font-size: 10px;
    }
  }

  .docs-layout {
    grid-template-columns: 210px minmax(0, 1fr);
    gap: 65px;
  }
  .docs-layout > nav {
    top: 108px;
    border: 1px solid #ebebf2;
    background: linear-gradient(#fff, #fafafd);
    border-radius: 16px;
    padding: 20px 14px;
    gap: 5px;
    box-shadow: 0 3px 12px #312e8103;
  }
  .docs-layout > nav > span {
    font-size: 8px;
    letter-spacing: 0.1em;
    color: #b1b1bf;
    margin: 0 10px 10px;
  }
  .docs-layout > nav > a {
    font-size: 11px;
    color: #9191a2;
    padding: 7px 10px;
    border-radius: 7px;
    transition:
      background 0.15s,
      color 0.15s;
  }
  .docs-layout > nav > a:hover {
    background: #f0f1ff;
    color: #6366f1;
  }
  .docs-content > section {
    border-color: #ededf3;
    padding-top: 29px;
    padding-bottom: 47px;
  }
  .docs-content h2 {
    font-size: 30px;
    font-weight: 500;
    line-height: 1.2;
  }
  .section-number {
    font-size: 8px;
    letter-spacing: 0.1em;
    color: #b2b2c1;
    margin-bottom: 23px;
  }
  .docs-content p {
    font-size: 13px;
    line-height: 1.9;
    color: #9191a1;
  }
  .docs-content pre {
    border-radius: 14px;
    background: #f7f7fb;
    border-color: #e8e8f1;
    box-shadow: inset 0 1px #fff;
    font-size: 11px;
    padding: 24px;
  }
  .callout {
    border-left-color: #a5b4fc;
    background: #f6f6ff;
    border-radius: 0 10px 10px 0;
    color: #9191b3 !important;
    padding: 17px 20px;
  }
  th {
    font-size: 9px;
    color: #a6a6b7;
  }
  td {
    font-size: 11px;
    color: #9696a8;
  }
  th,
  td {
    border-color: #eeeef4;
    padding-block: 16px;
  }
  td:first-child {
    color: #66667f;
  }
  @media (max-width: 760px) {
    .docs-layout {
      grid-template-columns: 1fr;
      gap: 26px;
    }
    .docs-layout > nav {
      position: static;
      padding: 16px;
      gap: 5px 10px;
    }
    .docs-layout > nav > span {
      margin: 0 8px 5px;
    }
    .docs-layout > nav > a {
      font-size: 10px;
      padding: 5px 8px;
    }
    .docs-content h2 {
      font-size: 26px;
    }
    .docs-content p {
      font-size: 12px;
    }
    .docs-content pre {
      padding: 20px;
      font-size: 10px;
    }
  }
</style>
