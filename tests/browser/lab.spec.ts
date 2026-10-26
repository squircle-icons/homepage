import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const main = (page: Page) => page.getByTestId('main-study');
const lid = (page: Page) => main(page).locator('[data-part="lid"]');
async function scrub(page: Page, value: number) {
  await page.getByRole('slider', { name: 'Opening timeline' }).fill(String(value));
  await expect(page.getByTestId('timeline-value')).toHaveText(`${value}%`);
}

test('lab uses real artwork, renders at rest, and has a desktop workspace', async ({
  page,
  request,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await request.get('/lab');
  expect(response.ok()).toBe(true);
  expect(await response.text()).toContain('Folder motion preview');
  await page.goto('/lab');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Folder lab');
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveCount(0);
  await expect(page.locator('.site-header, footer')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Back to icons' })).toHaveAttribute('href', '/icons');
  expect(
    await page
      .locator('svg [data-part="lid"]')
      .evaluateAll((elements) =>
        elements.reduce((count, element) => count + element.getAnimations().length, 0),
      ),
  ).toBe(0);
  await expect(main(page).locator('svg')).toHaveAttribute('width', '168');
  await expect(
    page.getByRole('region', { name: 'Folder optical sizes' }).locator('.size-sample svg'),
  ).toHaveCount(4);
  expect(
    await page
      .getByRole('region', { name: 'Folder optical sizes' })
      .locator('.size-sample svg')
      .evaluateAll((elements) => elements.map((item) => item.getAttribute('width'))),
  ).toEqual(['16', '20', '24', '48']);
  await expect(page.getByLabel('Icon', { exact: true })).toHaveValue('folder');
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await page.getByRole('button', { name: 'Indigo stroke' }).click();
  await expect(main(page).locator('svg')).toHaveAttribute('stroke', '#a5b4fc');
  await page.getByLabel('Drawing grid').uncheck();
  await expect(page.locator('.drawing')).not.toHaveClass(/gridded/);
  await page.getByRole('button', { name: 'Light', exact: true }).click();
  await page.getByRole('button', { name: 'Ink stroke' }).click();
  await page.getByLabel('Drawing grid').check();
  await page.locator('summary').filter({ hasText: 'Behavior & review' }).click();
  await page.getByLabel('Recognizable at 16px').check();
  await expect(page.locator('.review-count')).toContainText('1 / 4 REVIEWED');
  for (const width of [1280, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (info.project.name === 'chromium') {
      await mkdir('.artifacts/previews', { recursive: true });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `.artifacts/previews/lab-${width}.png`, fullPage: true });
    }
  }
  expect(errors).toEqual([]);
});

test('timeline supports deterministic pause, speed, presentation and reset', async ({
  page,
}, info) => {
  await page.goto('/lab');
  await scrub(page, 50);
  await expect(main(page).locator('[data-status]')).toHaveAttribute('data-status', 'Paused');
  expect(await lid(page).evaluate((element) => element.getAnimations()[0].currentTime)).toBe(110);
  const halfway = await lid(page).evaluate((element) => getComputedStyle(element).transform);
  expect(halfway).not.toBe('matrix(1, 0, 0, 1, 0, 0)');
  await page.getByLabel('Playback speed').selectOption('0.25');
  expect(await lid(page).evaluate((element) => element.getAnimations()[0].playbackRate)).toBe(0.25);
  await page.getByRole('slider', { name: 'Stroke width' }).fill('2');
  await page.getByRole('button', { name: 'Indigo stroke' }).click();
  await expect(main(page).locator('svg')).toHaveAttribute('stroke-width', '2');
  expect(await lid(page).evaluate((element) => getComputedStyle(element).transform)).toBe(halfway);
  if (info.project.name === 'chromium')
    await page.screenshot({ path: '.artifacts/previews/lab-paused.png', fullPage: true });
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(page.getByTestId('timeline-value')).toHaveText('100%');
  expect(await lid(page).evaluate((element) => element.getAnimations().length)).toBe(0);
  await scrub(page, 35);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(main(page).locator('[data-status]')).toHaveAttribute('data-status', 'Paused');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.getByTestId('timeline-value')).toHaveText('0%');
  expect(await lid(page).evaluate((element) => element.getAnimations().length)).toBe(0);
  expect(await lid(page).evaluate((element) => getComputedStyle(element).transform)).toBe(
    'matrix(1, 0, 0, 1, 0, 0)',
  );
  await scrub(page, 100);
  expect(await lid(page).evaluate((element) => getComputedStyle(element).transform)).toContain(
    '0.72',
  );
  await scrub(page, 0);
  await page.getByRole('slider', { name: 'Opening timeline' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('timeline-value')).toHaveText('1%');
});

test('comparison studies use isolated timings and reset all instances', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Element.prototype.animate;
    (window as any).__labAnimations = [];
    Element.prototype.animate = function (...args) {
      const animation = original.apply(this, args);
      (window as any).__labAnimations.push({
        animation,
        nativeTiming: animation.effect?.getTiming(),
      });
      return animation;
    };
  });
  await page.goto('/lab');
  await page.getByRole('button', { name: 'Play all', exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => (window as any).__labAnimations.length))
    .toBeGreaterThanOrEqual(3);
  expect(
    await page.evaluate(() =>
      (window as any).__labAnimations.map(
        (item: { animation: Animation }) => item.animation.effect?.getTiming().duration,
      ),
    ),
  ).toEqual([220, 280, 160]);
  expect(await page.evaluate(() => (window as any).__labAnimations[0].nativeTiming)).toMatchObject({
    duration: 220,
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  });
  await page.getByTestId('variant-B').getByRole('button', { name: 'Use study' }).click();
  await scrub(page, 50);
  expect(await lid(page).evaluate((element) => element.getAnimations()[0].currentTime)).toBe(140);
  await page.locator('summary').filter({ hasText: 'Behavior & review' }).click();
  await page.getByLabel('Keep open', { exact: true }).check();
  await page.getByLabel('Mount instances', { exact: true }).uncheck();
  await expect(page.getByTestId('live-instances').locator('svg')).toHaveCount(0);
  await page.getByLabel('Mount instances', { exact: true }).check();
  await expect(page.getByTestId('live-instances').locator('svg')).toHaveCount(3);
  await page.getByLabel('Hover to preview', { exact: true }).check();
  await page.getByRole('button', { name: /Reset every instance/ }).click();
  await expect(page.getByLabel('Keep open', { exact: true })).not.toBeChecked();
  await expect(page.getByLabel('Hover to preview', { exact: true })).not.toBeChecked();
  await expect(page.getByTestId('timeline-value')).toHaveText('0%');
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test('reduced motion settles playback and exposes both endpoint states', async ({ page }) => {
  await page.goto('/lab');
  await scrub(page, 40);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeDisabled();
  await expect(page.getByRole('slider', { name: 'Opening timeline' })).toBeDisabled();
  await expect(page.getByTestId('timeline-value')).toHaveText('100%');
  expect(
    await page
      .locator('svg [data-part="lid"]')
      .evaluateAll((elements) =>
        elements.reduce((count, element) => count + element.getAnimations().length, 0),
      ),
  ).toBe(0);
  await page.getByRole('button', { name: 'Closed', exact: true }).click();
  await expect(page.getByTestId('timeline-value')).toHaveText('0%');
  await page.getByRole('button', { name: 'Open', exact: true }).click();
  await expect(page.getByTestId('timeline-value')).toHaveText('100%');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeEnabled();
  await page.getByLabel('Reduce motion', { exact: true }).check();
  await expect(page.getByRole('button', { name: 'Play all', exact: true })).toBeDisabled();
  expect(
    await page
      .locator('svg [data-part="lid"]')
      .evaluateAll((elements) =>
        elements.reduce((count, element) => count + element.getAnimations().length, 0),
      ),
  ).toBe(0);
});

test('rapid operations settle correctly and navigation cleans up paused motion', async ({
  page,
}) => {
  await page.goto('/lab');
  await scrub(page, 30);
  const controls = page.getByRole('region', { name: 'Folder motion workbench' });
  for (const name of ['Closed', 'Open', 'Closed', 'Open']) {
    await controls.getByRole('button', { name, exact: true }).click();
  }
  await expect(page.getByTestId('timeline-value')).toHaveText('100%');
  await expect.poll(() => lid(page).evaluate((element) => element.getAnimations().length)).toBe(0);
  await scrub(page, 60);
  await page.evaluate(() => {
    (window as any).__detachedMotion = document
      .querySelector('[data-testid="main-study"] [data-part="lid"]')!
      .getAnimations()[0];
  });
  await page.getByRole('link', { name: 'Back to icons' }).click();
  await expect(page).toHaveURL(/\/icons$/);
  expect(await page.evaluate(() => (window as any).__detachedMotion.playState)).toBe('idle');
});

test('unsupported animation browsers retain endpoint controls', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Element.prototype, 'animate', { value: undefined, configurable: true });
  });
  await page.goto('/lab');
  await expect(page.getByText('Animation playback is unavailable', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Open', exact: true }).click();
  await expect(page.getByTestId('timeline-value')).toHaveText('100%');
  await page.getByRole('button', { name: 'Closed', exact: true }).click();
  await expect(page.getByTestId('timeline-value')).toHaveText('0%');
});
