import { test, expect, type Page } from '@playwright/test';

async function choose(page: Page, label: 'Light' | 'Dark' | 'System') {
  await page.getByRole('button', { name: /^Theme:/ }).click();
  await page.getByRole('menuitemradio', { name: label, exact: true }).click();
  await expect(page.getByRole('button', { name: `Theme: ${label}`, exact: true })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  await expect(page.locator('html')).not.toHaveAttribute('data-theme-reveal');
}

test('theme menu is keyboard accessible, remembers the choice and updates every public page', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.goto('/docs');
  await expect(page.locator('.alpha-label')).toHaveCount(0);
  const trigger = page.getByRole('button', { name: 'Theme: System', exact: true });
  await trigger.focus();
  await trigger.press('ArrowDown');
  const system = page.getByRole('menuitemradio', { name: 'System', exact: true });
  await expect(system).toBeFocused();
  await system.press('Home');
  const light = page.getByRole('menuitemradio', { name: 'Light', exact: true });
  await expect(light).toBeFocused();
  await light.press('ArrowDown');
  const dark = page.getByRole('menuitemradio', { name: 'Dark', exact: true });
  await expect(dark).toBeFocused();
  await dark.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: 'Theme: Dark', exact: true })).toBeFocused();
  expect(await page.evaluate(() => localStorage.getItem('squircle-icons-theme'))).toBe('dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Theme: Dark', exact: true }).click();
  await page.getByRole('menuitemradio', { name: 'Dark', exact: true }).press('Escape');
  await expect(page.getByRole('menu')).toHaveCount(0);
  for (const path of ['/', '/icons', '/docs']) {
    await page.getByRole('link', { name: 'Squircle Icons home', exact: true }).click();
    if (path !== '/') {
      await page
        .getByRole('link', { name: path === '/icons' ? /Explore the icons/ : /Meet the library/ })
        .click();
    }
    await expect(page.getByRole('button', { name: 'Theme: Dark', exact: true })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(16, 16, 16)');
  }
  const footer = page.getByRole('contentinfo');
  await expect(footer).toContainText('© 2026 Squircle Icons');
  await expect(footer).toContainText('made with 🧡 by palamto');
  await expect(footer).not.toContainText('Alpha stage');
  await choose(page, 'Light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('System follows device changes and explicit choices override the device', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto('/docs');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await choose(page, 'Dark');
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await choose(page, 'System');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).not.toHaveAttribute('data-theme-reveal');
});

test('blocked storage falls back to System and still allows a theme change', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException('Blocked', 'SecurityError');
    };
    Storage.prototype.setItem = () => {
      throw new DOMException('Blocked', 'SecurityError');
    };
  });
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto('/docs');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await choose(page, 'Light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('theme preferences stay in sync between tabs, including clearing storage', async ({
  page,
  context,
}) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.goto('/docs');
  const other = await context.newPage();
  await other.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await other.goto('/icons');
  await choose(page, 'Dark');
  await expect(other.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(other.getByRole('button', { name: 'Theme: Dark', exact: true })).toBeVisible();
  await page.evaluate(() => localStorage.clear());
  await expect(other.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(other.getByRole('button', { name: 'Theme: System', exact: true })).toBeVisible();
  await other.close();
});

test('dark gallery uses visible default ink and preserves a custom icon color', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.goto('/icons');
  await choose(page, 'Dark');
  const color = page.getByLabel('Hex color', { exact: true });
  await expect(color).toHaveValue('#F4F4F5');
  await expect(page.locator('#camera svg')).toHaveAttribute('stroke', '#f4f4f5');
  await color.fill('#705090');
  await choose(page, 'Light');
  await expect(color).toHaveValue('#705090');
  await expect(page.locator('#camera svg')).toHaveAttribute('stroke', '#705090');
  await choose(page, 'Dark');
  await expect(color).toHaveValue('#705090');
});

test('unsupported or failed View Transitions still commit the requested palette', async ({
  page,
}) => {
  for (const mode of ['unsupported', 'throws', 'capture-failure']) {
    await page.addInitScript((mode) => {
      if (mode === 'unsupported')
        Object.defineProperty(document, 'startViewTransition', {
          configurable: true,
          value: undefined,
        });
      else if (mode === 'throws')
        Object.defineProperty(document, 'startViewTransition', {
          configurable: true,
          value: () => {
            throw new Error('Unavailable');
          },
        });
      else
        Object.defineProperty(document, 'startViewTransition', {
          configurable: true,
          value: () => {
            let finish!: () => void;
            const finished = new Promise<void>((resolve) => (finish = resolve));
            return {
              ready: Promise.reject(new Error('Snapshot skipped')),
              finished,
              skipTransition: () => finish(),
            };
          },
        });
    }, mode);
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' });
    await page.goto('/docs');
    await choose(page, 'Light');
    await choose(page, 'Dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('html')).not.toHaveAttribute('data-theme-reveal');
  }
});

test('center-circle reveal settles cleanly and reduced motion cancels movement', async ({
  page,
}, info) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' });
  await page.goto('/docs');
  const native = await page.evaluate(() => typeof document.startViewTransition === 'function');
  if (native) await page.addStyleTag({ content: ':root { --theme-reveal-duration: 2000ms; }' });
  await page.getByRole('button', { name: /^Theme:/ }).click();
  await page.getByRole('menuitemradio', { name: 'Dark', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  if (native) {
    await expect(page.locator('html')).toHaveAttribute('data-theme-reveal', 'expand');
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document
              .getAnimations()
              .filter((a) => (a as CSSAnimation).animationName === 'theme-circle-expand').length,
        ),
      )
      .toBeGreaterThan(0);
    await page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => (a as CSSAnimation).animationName === 'theme-circle-expand')
        .forEach((a) => {
          a.pause();
          a.currentTime = 1000;
        }),
    );
    await page.screenshot({ path: info.outputPath('theme-mid-circle.png') });
    await page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => (a as CSSAnimation).animationName === 'theme-circle-expand')
        .forEach((a) => a.finish()),
    );
  }
  await expect(page.locator('html')).not.toHaveAttribute('data-theme-reveal');
  await expect(page.locator('html')).not.toHaveAttribute('style', /theme-reveal-radius/);
  await page.getByRole('link', { name: 'Using icons', exact: true }).click();
  await page.screenshot({ path: info.outputPath('docs-dark.png') });
  await page.getByRole('button', { name: /^Theme:/ }).click();
  await page.getByRole('menuitemradio', { name: 'Light', exact: true }).click();
  if (native) await expect(page.locator('html')).toHaveAttribute('data-theme-reveal', 'contract');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('html')).not.toHaveAttribute('data-theme-reveal');
  await page.getByRole('button', { name: /^Theme:/ }).click();
  await expect(page.getByRole('menu')).toHaveCSS('animation-name', 'none');
});

test('gallery range hover keeps its accent and keyboard steps update the icons', async ({
  page,
}, info) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto('/icons');
  const size = page.getByRole('slider', { name: 'Export size', exact: true });
  const pseudo = info.project.name === 'firefox' ? '::-moz-range-thumb' : '::-webkit-slider-thumb';
  const before = await size.evaluate(
    (el, pseudo) => ({
      track: getComputedStyle(el).backgroundImage,
      thumb: getComputedStyle(el, pseudo).backgroundColor,
    }),
    pseudo,
  );
  await size.hover();
  const hovered = await size.evaluate(
    (el, pseudo) => ({
      track: getComputedStyle(el).backgroundImage,
      thumb: getComputedStyle(el, pseudo).backgroundColor,
    }),
    pseudo,
  );
  expect(hovered).toEqual(before);
  await size.focus();
  await size.press('ArrowRight');
  await expect(size).toHaveValue('28');
  await expect(page.locator('#camera svg')).toHaveAttribute('width', '28');
});

test('selected neutral controls and category tabs stay readable in both themes', async ({
  page,
}) => {
  async function contrast(text: string, background?: string) {
    return page.locator(text).evaluate((el, background) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d')!;
      const luminance = (color: string) => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        const [r, g, b] = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map((value) => {
          const channel = value / 255;
          return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const foreground = luminance(getComputedStyle(el).color);
      const bg = background
        ? getComputedStyle(document.querySelector(background)!, '::before').backgroundColor
        : getComputedStyle(el).backgroundColor;
      const surface = luminance(bg);
      return (Math.max(foreground, surface) + 0.05) / (Math.min(foreground, surface) + 0.05);
    }, background);
  }
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    await page.goto('/docs');
    expect(await contrast('.framework-choices [aria-pressed="true"]')).toBeGreaterThan(7);
    expect(
      await contrast('.package-managers [aria-pressed="true"]', '.package-managers'),
    ).toBeGreaterThan(7);
    await page.goto('/icons');
    expect(await contrast('.squircle-select-trigger[aria-label="Icon style"]')).toBeGreaterThan(7);
    expect(
      await contrast('.category-tabs [aria-selected="true"]', '.category-tabs'),
    ).toBeGreaterThan(7);
  }
});

test('Amber 500 is shared by Hero and gallery with readable CTA text', async ({ page }) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    await page.goto('/');
    const primary = page.getByRole('link', { name: 'Explore the icons', exact: true });
    await expect(primary).toHaveCSS('background-color', /oklch\(0\.769 0\.188 70\.08\d*\)/);
    await expect(primary).toHaveCSS('color', 'rgb(24, 24, 27)');
    await page.getByRole('button', { name: 'Use amber heart', exact: true }).click();
    await expect(page.locator('.color-study svg')).toHaveCSS(
      'color',
      /oklch\(0\.769 0\.188 70\.08\d*\)/,
    );
    await page.goto('/icons');
    await expect(page.getByLabel('Export size')).toHaveCSS(
      'background-image',
      /oklch\(0\.769 0\.188 70\.08/,
    );
  }
});
