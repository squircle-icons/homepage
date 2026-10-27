<script lang="ts">
  let {
    title,
    code,
    showHeader = true,
  }: { title: string; code: string; showHeader?: boolean } = $props();

  // A small lexer for the Svelte/TypeScript examples shown in these docs.
  // Render token text through Svelte so source remains escaped, selectable text.
  function tokenize(source: string) {
    const pattern =
      /(?<comment><!--[\s\S]*?-->)|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?<tag><\/?[A-Za-z][\w.:-]*)|(?<attribute>\b[\w:-]+(?=\s*=))|(?<keyword>\b(?:import|from)\b)|(?<number>\b\d+(?:\.\d+)?\b)|(?<punctuation>\/?>|[{}=;])/g;
    const tokens: { kind: string; text: string }[] = [];
    let offset = 0;
    for (const match of source.matchAll(pattern)) {
      if (match.index > offset)
        tokens.push({ kind: 'plain', text: source.slice(offset, match.index) });
      const kind = Object.keys(match.groups!).find((name) => match.groups![name] !== undefined)!;
      tokens.push({ kind, text: match[0] });
      offset = match.index + match[0].length;
    }
    if (offset < source.length) tokens.push({ kind: 'plain', text: source.slice(offset) });
    return tokens;
  }
  const tokens = $derived(tokenize(code));
</script>

<article class="code-example" aria-label={`${title} example`}>
  <div class="code-window">
    {#if showHeader}
      <header class="code-heading"><h3>{title}</h3></header>
    {/if}
    <pre><code
        >{#each tokens as token}<span class={token.kind}>{token.text}</span>{/each}</code
      ></pre>
  </div>
</article>

<style>
  .code-example {
    margin: 24px 0;
    font-size: 14px;
  }
  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.5;
    letter-spacing: 0;
  }
  .code-window {
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    overflow: hidden;
    background: var(--surface-subtle);
  }
  .code-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 16px;
    padding: 12px 20px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }
  pre {
    margin: 0;
    padding: 20px;
    border: 0;
    border-radius: 0;
    background: var(--surface-subtle);
    color: var(--text);
    font-size: 14px;
    line-height: 1.7;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    box-shadow: none;
  }
  code {
    font-size: 14px;
    user-select: text;
    font-variant-ligatures: none;
    font-feature-settings:
      'liga' 0,
      'calt' 0;
  }
  .tag {
    color: var(--syntax-tag);
  }
  .attribute {
    color: var(--syntax-attribute);
  }
  .string {
    color: var(--syntax-string);
  }
  .keyword {
    color: var(--syntax-keyword);
  }
  .number {
    color: var(--syntax-number);
  }
  .punctuation {
    color: var(--text-secondary);
  }
  .comment {
    color: var(--muted);
  }
</style>
