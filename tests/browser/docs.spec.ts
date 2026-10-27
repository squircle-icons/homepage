import { test, expect } from '@playwright/test';

test('install commands copy only the selected npm or pnpm command', async ({ page }) => {
  await page.addInitScript(() => {
    const copied: string[] = [];
    Object.defineProperty(window, '__copiedCommands', { value: copied });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          copied.push(text);
        },
      },
    });
  });
  await page.goto('/docs');
  const frameworks = page.getByRole('group', { name: 'Framework', exact: true });
  await expect(frameworks.getByRole('button', { name: 'Svelte', exact: true })).toBeEnabled();
  await expect(frameworks.getByRole('button', { name: 'Svelte', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  for (const name of ['React', 'Vue', 'Angular']) {
    await expect(
      frameworks.getByRole('button', { name: `${name} — coming soon`, exact: true }),
    ).toBeDisabled();
  }
  const install = page.getByRole('group', { name: 'Install package', exact: true });
  const copy = install.getByRole('button', { name: 'Copy install command' });
  await expect(install.locator('code')).toHaveText('npm install @squircle-icons/svelte@alpha');
  await copy.click();
  await expect(copy).toHaveAttribute('title', 'Copied');
  await expect(copy.locator('svg')).toHaveCount(1);
  await expect(page.getByRole('status')).toHaveText('npm command copied.');
  await install.getByRole('button', { name: 'pnpm', exact: true }).click();
  await expect(copy).toHaveAttribute('title', 'Copy install command');
  await expect(install.locator('code')).toHaveText('pnpm add @squircle-icons/svelte@alpha');
  await copy.click();
  await expect(page.getByRole('status')).toHaveText('pnpm command copied.');
  expect(
    await page.evaluate(
      () => (window as unknown as { __copiedCommands: string[] }).__copiedCommands,
    ),
  ).toEqual(['npm install @squircle-icons/svelte@alpha', 'pnpm add @squircle-icons/svelte@alpha']);
  await install.getByRole('button', { name: 'npm', exact: true }).click();
  await expect(install.getByRole('button', { name: 'npm', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('denied clipboard access keeps the command selectable and reports failure', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new DOMException('Denied', 'NotAllowedError');
        },
      },
    });
  });
  await page.goto('/docs');
  const install = page.getByRole('group', { name: 'Install package', exact: true });
  await install.getByRole('button', { name: 'Copy install command' }).click();
  await expect(page.getByRole('alert')).toHaveText(
    'Could not copy. Select the command and copy it manually.',
  );
  await expect(install.getByRole('button', { name: 'Copy install command' })).toHaveAttribute(
    'title',
    'Copy install command',
  );
  await expect(install.locator('code')).toHaveCSS('user-select', 'all');
  await expect(page.getByRole('status')).not.toContainText('copied');
  await install.getByRole('button', { name: 'pnpm', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('table of contents follows scrolling, anchor links and deep links without changing focus', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/docs#installation');
  const nav = page.getByRole('navigation', { name: 'Documentation sections' });
  const active = nav.locator('[aria-current="location"]');
  await expect(active).toHaveText('Getting started');
  for (const [id, label] of [
    ['static', 'Using icons'],
    ['props', 'Component props'],
    ['accessibility', 'Accessibility'],
  ]) {
    await page.evaluate(
      (id) => document.getElementById(id)!.scrollIntoView({ block: 'start' }),
      id,
    );
    await expect(active).toHaveCount(1);
    await expect(active).toHaveText(label);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(active).toHaveText('Contributing');
  await nav.getByRole('link', { name: 'Component props', exact: true }).click();
  await expect(page).toHaveURL(/#props$/);
  await expect(active).toHaveText('Component props');
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(active).toHaveText('Getting started');
  await page.goto('about:blank');
  await page.goto('/docs#accessibility');
  await expect(active).toHaveText('Accessibility');
  for (const width of [700, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await nav.getByRole('link', { name: 'Getting started', exact: true }).click();
    await expect(active).toHaveText('Getting started');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.getByRole('link', { name: 'Squircle Icons home', exact: true }).click();
  await page.getByRole('link', { name: /Explore the icons/ }).click();
  await expect(page).toHaveURL(/\/icons$/);
  expect(errors).toEqual([]);
});

test('the syntax-colored code box preserves source text without an outer card or Copy button', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/docs#static');
  const example = page.getByRole('article', { name: 'Example.svelte example', exact: true });
  await expect(page.locator('#static article')).toHaveCount(1);
  await expect(example.locator('.code-heading')).toContainText('Example.svelte');
  await expect(example.locator('.code-heading')).toHaveText('Example.svelte');
  await expect(example.locator('.description')).toHaveCount(0);
  await expect(example.getByRole('button')).toHaveCount(0);
  await expect(example.getByRole('tab')).toHaveCount(0);
  const code =
    '<script lang="ts">\n  import Camera from \'@squircle-icons/svelte/camera\';\n</script>\n\n' +
    '<!-- Size: 24px by default -->\n<Camera />\n<Camera size={32} />\n\n' +
    '<!-- Style: outline by default -->\n<Camera style="outline" />\n<Camera style="filled" />\n\n' +
    '<!-- Stroke: regular (1.75) by default -->\n<Camera strokeWidth="thin" />\n<Camera strokeWidth="regular" />\n<Camera strokeWidth="bold" />';
  expect(await example.locator('code').textContent()).toBe(code);
  await expect(example.locator('code .tag').first()).toHaveText('<script');
  await expect(example.locator('code .attribute').first()).toHaveText('lang');
  await expect(example.locator('code .string').first()).toHaveText('"ts"');
  await expect(example.locator('code .keyword').first()).toHaveText('import');
  expect(
    await example
      .locator('code .tag')
      .first()
      .evaluate((e) => getComputedStyle(e).color),
  ).not.toBe(
    await example
      .locator('code .string')
      .first()
      .evaluate((e) => getComputedStyle(e).color),
  );
  await expect(example.locator('pre')).toHaveCSS('background-color', 'rgb(247, 247, 247)');
  await expect(example.locator('pre')).toHaveCSS('padding', '20px');
  await expect(example.locator('script')).toHaveCount(0);
  const accessibility = page.getByRole('article', {
    name: 'Accessibility.svelte example',
    exact: true,
  });
  await expect(accessibility.locator('.code-heading')).toHaveCount(0);
  await expect(accessibility.locator('code .tag').first()).toHaveText('<button');
  await expect(accessibility.locator('button')).toHaveCount(0);
  await expect(accessibility.locator('code')).toContainText(
    '<button aria-label="Take a photo"><Camera /></button>',
  );
  expect(errors).toEqual([]);
});

test('Docs motion respects reduced motion while keeping the active section visible', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/docs');
  await expect(page.locator('.docs-layout')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
  const nav = page.getByRole('navigation', { name: 'Documentation sections' });
  await nav.getByRole('link', { name: 'Component props', exact: true }).click();
  await expect(nav.locator('[aria-current="location"]')).toHaveText('Component props');
  await expect(nav.locator('.toc-highlight')).toHaveCSS('transition-duration', '0s');
  await expect(nav.locator('.toc-highlight')).toHaveCSS('border-radius', '8px');
  expect(
    await page
      .locator('.package-managers')
      .evaluate((el) => getComputedStyle(el, '::before').transitionDuration),
  ).toBe('0s');
});
