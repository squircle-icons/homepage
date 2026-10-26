import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const main = (page: Page) => page.getByTestId('main-study');
async function size(page: Page, axis: 'X' | 'Y', value: number) {
  await page.getByRole('spinbutton', { name: 'Size ' + axis, exact: true }).fill(String(value));
  await page.getByRole('spinbutton', { name: 'Size ' + axis, exact: true }).press('Tab');
}
async function balanced(page: Page) {
  await expect(page.getByTestId('balance-state')).toHaveText('Opposite sides balanced');
  for (const name of ['horizontal-spacing', 'vertical-spacing']) {
    const values = (await page.getByTestId(name).innerText()).split('/').map(Number);
    expect(values[0]).toBeCloseTo(values[1], 3);
    expect(values[0]).toBeGreaterThanOrEqual(0);
  }
}

test('static Lab renders actual outline and filled exports without motion controls', async ({
  page,
  request,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const html = await (await request.get('/lab')).text();
  expect(html).toContain('Folder outline preview');
  expect(html).toContain('Compare filled Folder');
  await page.goto('/lab');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Folder lab');
  await expect(page.locator('.site-header, footer')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^(Play|Pause|Play all)$/ })).toHaveCount(0);
  await expect(page.getByLabel('Opening timeline')).toHaveCount(0);
  await expect(
    page.getByRole('region', { name: 'Folder optical sizes' }).locator('.size-sample svg'),
  ).toHaveCount(4);
  expect(
    await page
      .getByRole('region', { name: 'Folder optical sizes' })
      .locator('.size-sample svg')
      .evaluateAll((elements) => elements.map((item) => item.getAttribute('width'))),
  ).toEqual(['16', '20', '24', '48']);
  await expect(page.getByTestId('horizontal-spacing')).toHaveText('2.125 / 2.125');
  await expect(page.getByTestId('vertical-spacing')).toHaveText('4.125 / 4.125');
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  for (const width of [1280, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (info.project.name === 'chromium') {
      await mkdir('.artifacts/previews', { recursive: true });
      await page.screenshot({
        path: `.artifacts/previews/lab-static-${width}.png`,
        fullPage: true,
      });
    }
  }
  expect(errors).toEqual([]);
});

test('independent X/Y sizing keeps the outline stroke constant and reports actual margins', async ({
  page,
}, info) => {
  await page.goto('/lab');
  const path = main(page).locator('path').first();
  const originalStroke = await path.evaluate((element) => getComputedStyle(element).strokeWidth);
  await size(page, 'X', 75);
  await size(page, 'Y', 90);
  await expect(page.getByRole('spinbutton', { name: 'Size X', exact: true })).toHaveValue('75');
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('90');
  expect(await path.evaluate((element) => getComputedStyle(element).strokeWidth)).toBe(
    originalStroke,
  );
  await expect(page.getByTestId('horizontal-spacing')).toHaveText('4.375 / 4.375');
  await expect(page.getByTestId('vertical-spacing')).toHaveText('4.825 / 4.825');
  await page.getByRole('button', { name: 'Increase stroke width' }).click();
  await expect(main(page).locator('svg')).toHaveAttribute('stroke-width', '2');
  await expect(page.getByTestId('horizontal-spacing')).toHaveText('4.250 / 4.250');
  await expect(page.getByTestId('vertical-spacing')).toHaveText('4.700 / 4.700');
  await balanced(page);
  if (info.project.name === 'chromium')
    await page.screenshot({ path: '.artifacts/previews/lab-static-xy.png', fullPage: true });
  await page.getByRole('button', { name: /Reset geometry/ }).click();
  await expect(page.getByTestId('horizontal-spacing')).toHaveText('2.125 / 2.125');
  await expect(page.getByRole('spinbutton', { name: 'Size X', exact: true })).toHaveValue('100');
});

test('filled Folder has a genuine negative-space divider and no configurable stroke', async ({
  page,
}, info) => {
  await page.goto('/lab');
  await page.getByRole('button', { name: 'Filled', exact: true }).click();
  await expect(main(page).locator('svg')).toHaveAttribute('fill-rule', 'evenodd');
  await expect(main(page).locator('svg')).toHaveAttribute('stroke', 'none');
  await expect(page.getByRole('slider', { name: 'Stroke width' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Increase stroke width' })).toBeDisabled();
  const fill = await main(page)
    .locator('path')
    .evaluate((element) => {
      const path = element as SVGGeometryElement;
      return {
        slot: path.isPointInFill(new DOMPoint(12, 11)),
        panel: path.isPointInFill(new DOMPoint(12, 15)),
      };
    });
  expect(fill).toEqual({ slot: false, panel: true });
  await expect(page.getByTestId('horizontal-spacing')).toHaveText('2.125 / 2.125');
  await expect(page.getByTestId('vertical-spacing')).toHaveText('4.125 / 4.125');
  await size(page, 'X', 80);
  await size(page, 'Y', 115);
  await balanced(page);
  if (info.project.name === 'chromium')
    await page.screenshot({ path: '.artifacts/previews/lab-static-filled.png', fullPage: true });
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test('linked axes clamp together, step with buttons and reset cleanly', async ({ page }) => {
  await page.goto('/lab');
  await page.getByLabel('Link X/Y proportions').check();
  await page.getByRole('button', { name: 'Increase size X', exact: true }).click();
  await expect(page.getByRole('spinbutton', { name: 'Size X', exact: true })).toHaveValue('105');
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('105');
  await size(page, 'X', 500);
  await expect(page.getByRole('spinbutton', { name: 'Size X', exact: true })).toHaveValue('123.61');
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('123.61');
  await expect(page.getByRole('button', { name: 'Increase size X', exact: true })).toBeDisabled();
  await size(page, 'Y', -50);
  await expect(page.getByRole('spinbutton', { name: 'Size X', exact: true })).toHaveValue('1');
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('1');
  await page.getByRole('button', { name: /Reset geometry/ }).click();
  await expect(page.getByLabel('Link X/Y proportions')).not.toBeChecked();
  await expect(page.getByRole('spinbutton', { name: 'Size X', exact: true })).toHaveValue('100');
  await page.getByRole('button', { name: 'Decrease size Y', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('95');
  await balanced(page);
});

test('surfaces, colors, guides and visual review work for both static styles', async ({ page }) => {
  await page.goto('/lab');
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await page.getByRole('button', { name: 'Indigo color' }).click();
  await expect(main(page).locator('svg')).toHaveAttribute('stroke', '#a5b4fc');
  await page.getByRole('button', { name: 'Filled', exact: true }).click();
  await expect(main(page).locator('svg')).toHaveAttribute('fill', '#a5b4fc');
  await page.getByLabel('Drawing grid').uncheck();
  await expect(page.locator('.drawing')).not.toHaveClass(/gridded/);
  await page.getByLabel('Spacing guides').uncheck();
  await expect(page.getByTestId('spacing-top')).toHaveCount(0);
  await page.getByLabel('Spacing guides').check();
  await expect(page.getByTestId('spacing-top')).toHaveText('4.125');
  await page.locator('summary').filter({ hasText: 'Visual checks' }).click();
  await page.getByLabel('Recognizable at 16px').check();
  await expect(page.locator('.review-count')).toContainText('1 / 4 REVIEWED');
  await page.getByRole('link', { name: 'Back to icons' }).click();
  await expect(page).toHaveURL(/\/icons$/);
});

test('opposite visible margins stay balanced across styles, stroke weights and nonuniform sizing', async ({
  page,
}) => {
  await page.goto('/lab');
  for (const weight of [1, 1.75, 2, 2.5]) {
    await page.getByRole('slider', { name: 'Stroke width' }).fill(String(weight));
    await balanced(page);
  }
  for (const style of ['Filled', 'Outline']) {
    await page.getByRole('button', { name: style, exact: true }).click();
    await size(page, 'X', 115);
    await size(page, 'Y', 50);
    await balanced(page);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  }
});

test('Y sizing follows the measured left margin instead of a fixed percentage cap', async ({
  page,
}) => {
  await page.goto('/lab');
  await size(page, 'Y', 125);
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('125');
  await expect(page.getByTestId('vertical-spacing')).toHaveText('2.375 / 2.375');
  await expect(page.getByTestId('y-limit')).toContainText('128.57%');
  await page.getByRole('button', { name: 'Match Y to left spacing' }).click();
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('128.57');
  await expect(page.getByTestId('horizontal-spacing')).toHaveText('2.125 / 2.125');
  await expect(page.getByTestId('vertical-spacing')).toHaveText('2.125 / 2.125');
  await expect(page.getByRole('button', { name: 'Increase size Y', exact: true })).toBeDisabled();
  await size(page, 'X', 80);
  await expect(page.getByTestId('horizontal-spacing')).toHaveText('3.925 / 3.925');
  await expect(page.getByTestId('vertical-spacing')).toHaveText('3.925 / 3.925');
  await page.getByRole('button', { name: 'Filled', exact: true }).click();
  await expect(page.getByTestId('y-limit')).toContainText('100.32%');
  await expect(page.getByTestId('horizontal-spacing')).toHaveText('4.100 / 4.100');
  await expect(page.getByTestId('vertical-spacing')).toHaveText('4.100 / 4.100');
  await size(page, 'X', 120);
  await page.getByRole('button', { name: 'Outline', exact: true }).click();
  await expect(page.getByRole('spinbutton', { name: 'Size X', exact: true })).toHaveValue('120');
  await balanced(page);
});
