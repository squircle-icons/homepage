<script lang="ts">
  import { onMount, tick } from 'svelte';
  import Sun from '@squircle-icons/svelte/sun';
  import Moon from '@squircle-icons/svelte/moon';
  import {
    cancelThemeReveal,
    isThemePreference,
    resolveTheme,
    revealTheme,
    type ThemePreference,
  } from '#lib/theme-transition.js';
  let preference = $state<ThemePreference>('system');
  let palette = $state<'light' | 'dark'>('light');
  let open = $state(false);
  let mounted = false;
  let host: HTMLDivElement;
  let trigger: HTMLButtonElement;
  let menu = $state<HTMLDivElement>();
  const choices = ['light', 'dark', 'system'] as const;
  const labels = { light: 'Light', dark: 'Dark', system: 'System' };

  function apply(value: ThemePreference) {
    const next = resolveTheme(value);
    palette = next;
    document.documentElement.dataset.theme = next;
    document.documentElement.dataset.themePreference = value;
    document.documentElement.style.colorScheme = next;
    window.dispatchEvent(new Event('squircle:theme-change'));
  }
  async function choose(value: ThemePreference, event: MouseEvent) {
    preference = value;
    open = false;
    try {
      localStorage.setItem('squircle-icons-theme', value);
    } catch {
      /* System still works without storage. */
    }
    trigger.focus({ preventScroll: true });
    await tick(); // Close the menu before the native snapshot captures the page.
    if (mounted) revealTheme(() => apply(value), resolveTheme(value), event.detail > 0);
  }
  async function showMenu(last = false) {
    open = true;
    await tick();
    const items = menu?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]');
    items?.[last ? items.length - 1 : Math.max(0, choices.indexOf(preference))]?.focus({
      preventScroll: true,
    });
  }
  function triggerKeys(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      void showMenu(event.key === 'ArrowUp');
    }
  }
  function menuKeys(event: KeyboardEvent) {
    const items = Array.from(
      menu?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? [],
    );
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    let next = current;
    if (event.key === 'ArrowDown') next = (current + 1) % items.length;
    else if (event.key === 'ArrowUp') next = (current + items.length - 1) % items.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    else if (event.key === 'Escape') {
      event.preventDefault();
      open = false;
      trigger.focus({ preventScroll: true });
      return;
    } else if (event.key === 'Tab') {
      open = false;
      return;
    } else return;
    event.preventDefault();
    items[next]?.focus({ preventScroll: true });
  }
  onMount(() => {
    mounted = true;
    let saved = document.documentElement.dataset.themePreference;
    try {
      const stored = localStorage.getItem('squircle-icons-theme');
      if (isThemePreference(stored)) saved = stored;
    } catch {}
    preference = isThemePreference(saved) ? saved : 'system';
    apply(preference);
    const system = matchMedia('(prefers-color-scheme: dark)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const followSystem = () => {
      if (preference === 'system')
        revealTheme(() => apply(preference), resolveTheme(preference), false);
    };
    const reduceMotion = () => {
      if (reduced.matches) revealTheme(() => apply(preference), resolveTheme(preference), false);
    };
    const sync = (event: StorageEvent) => {
      if (event.key !== 'squircle-icons-theme' && event.key !== null) return;
      preference = isThemePreference(event.newValue) ? event.newValue : 'system';
      revealTheme(() => apply(preference), resolveTheme(preference), false);
    };
    const outside = (event: PointerEvent) => {
      if (!host.contains(event.target as Node)) open = false;
    };
    const focusOutside = (event: FocusEvent) => {
      if (!host.contains(event.target as Node)) open = false;
    };
    system.addEventListener('change', followSystem);
    reduced.addEventListener('change', reduceMotion);
    window.addEventListener('storage', sync);
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', focusOutside);
    return () => {
      mounted = false;
      cancelThemeReveal();
      apply(preference);
      system.removeEventListener('change', followSystem);
      reduced.removeEventListener('change', reduceMotion);
      window.removeEventListener('storage', sync);
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', focusOutside);
    };
  });
</script>

<div class="theme-control" bind:this={host}>
  <button
    class="theme-trigger"
    bind:this={trigger}
    aria-label={`Theme: ${labels[preference]}`}
    aria-haspopup="menu"
    aria-expanded={open}
    title="Change theme"
    onclick={() => (open ? (open = false) : void showMenu())}
    onkeydown={triggerKeys}
  >
    {#if palette === 'dark'}<Moon size={18} />{:else}<Sun size={18} />{/if}
  </button>
  {#if open}
    <div
      class="theme-menu"
      role="menu"
      tabindex="-1"
      aria-label="Theme"
      bind:this={menu}
      onkeydown={menuKeys}
    >
      {#each choices as value}
        <button
          role="menuitemradio"
          aria-checked={preference === value}
          tabindex="-1"
          onclick={(event) => choose(value, event)}
        >
          <span>{labels[value]}</span>
          <span class="check" aria-hidden="true">{preference === value ? '✓' : ''}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .theme-control {
    position: relative;
  }
  .theme-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 8px;
    border: 0;
    border-radius: 999px;
    color: var(--text);
    background: transparent;
    font-size: 14px;
  }
  .theme-trigger:hover {
    background: var(--surface-subtle);
  }
  .theme-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    z-index: 50;
    width: 168px;
    padding: 5px;
    border: 1px solid var(--border);
    border-radius: 18px;
    background: var(--surface);
    color: var(--text);
    box-shadow: 0 8px 30px #0002;
    animation: menu-enter 140ms ease-out;
  }
  .theme-menu button {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 9px 12px;
    min-height: 40px;
    border: 0;
    border-radius: 13px;
    background: transparent;
    color: var(--text);
    font-size: 14px;
    text-align: left;
  }
  .theme-menu button:hover,
  .theme-menu button:focus-visible {
    background: var(--surface-subtle);
    outline: none;
  }
  .theme-menu button[aria-checked='true'] {
    color: var(--text);
  }
  .check {
    min-width: 14px;
  }
  @keyframes menu-enter {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .theme-menu {
      animation: none;
    }
  }
</style>
