import { tick } from 'svelte';

// Adapted from the witnd theme reveal: a dark circle expands from the center,
// then contracts to reveal Light. CSS owns only the temporary root snapshot.
export type ThemePreference = 'light' | 'dark' | 'system';
export type Palette = 'light' | 'dark';
type Choice = { palette: Palette; update: () => void };
type Reveal = { to: Palette; pending?: Choice; transition?: ViewTransition };
let active: Reveal | undefined;
let revision = 0;

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}
export function resolveTheme(preference: ThemePreference): Palette {
  return preference === 'system'
    ? matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    : preference;
}
function cleanup() {
  const root = document.documentElement;
  delete root.dataset.themeReveal;
  root.style.removeProperty('--theme-reveal-radius');
}
export function cancelThemeReveal() {
  revision++;
  active?.transition?.skipTransition();
  active = undefined;
  cleanup();
}
export function revealTheme(update: () => void, next: Palette, animate = true) {
  if (typeof document === 'undefined') {
    update();
    return;
  }
  const root = document.documentElement;
  const immediate =
    !animate ||
    document.hidden ||
    !document.startViewTransition ||
    matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (active && !immediate) {
    active.pending = { palette: next, update };
    return;
  }
  cancelThemeReveal();
  const request = revision;
  if (root.dataset.theme === next || immediate) {
    update();
    return;
  }
  const state: Reveal = { to: next };
  active = state;
  root.style.setProperty(
    '--theme-reveal-radius',
    `${Math.ceil(Math.hypot(innerWidth / 2, innerHeight / 2)) + 1}px`,
  );
  root.dataset.themeReveal = next === 'light' ? 'contract' : 'expand';
  let applied = false;
  const commit = () => {
    if (!applied) {
      applied = true;
      update();
    }
  };
  try {
    state.transition = document.startViewTransition(async () => {
      if (active !== state) return;
      commit();
      await tick();
    });
  } catch {
    active = undefined;
    cleanup();
    commit();
    return;
  }
  const transition = state.transition;
  void transition.ready.catch(() => {
    if (active !== state) return;
    commit();
    transition.skipTransition();
  });
  void transition.finished
    .catch(() => {})
    .finally(() => {
      if (active !== state) return;
      commit();
      active = undefined;
      cleanup();
      const pending = state.pending;
      if (pending)
        requestAnimationFrame(() => {
          if (request === revision) revealTheme(pending.update, pending.palette);
        });
    });
}
