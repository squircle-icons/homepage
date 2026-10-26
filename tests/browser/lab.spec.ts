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
  await expect(page.getByTestId('horizontal-spacing')).toHaveText('2.150 / 2.150');
  await expect(page.getByTestId('vertical-spacing')).toHaveText('3.450 / 3.450');
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
  await size(page, 'Y', 85);
  await expect(page.getByRole('spinbutton', { name: 'Size X', exact: true })).toHaveValue('75');
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('85');
  expect(await path.evaluate((element) => getComputedStyle(element).strokeWidth)).toBe(
    originalStroke,
  );
  await expect(page.getByTestId('horizontal-spacing')).toHaveText('4.400 / 4.400');
  await expect(page.getByTestId('vertical-spacing')).toHaveText('4.605 / 4.605');
  await page.getByRole('button', { name: 'Increase stroke width' }).click();
  await expect(main(page).locator('svg')).toHaveAttribute('stroke-width', '1.95');
  await expect(page.getByTestId('horizontal-spacing')).toHaveText('4.275 / 4.275');
  await expect(page.getByTestId('vertical-spacing')).toHaveText('4.480 / 4.480');
  await balanced(page);
  if (info.project.name === 'chromium')
    await page.screenshot({ path: '.artifacts/previews/lab-static-xy.png', fullPage: true });
  await page.getByRole('button', { name: /Reset geometry/ }).click();
  await expect(page.getByTestId('horizontal-spacing')).toHaveText('2.150 / 2.150');
  await expect(page.getByRole('spinbutton', { name: 'Size X', exact: true })).toHaveValue('100');
});

test('filled Folder gap follows stroke width without changing the outer silhouette', async ({
  page,
}, info) => {
  await page.goto('/lab');
  await page.getByRole('button', { name: 'Filled', exact: true }).click();
  await expect(main(page).locator('svg')).toHaveAttribute('fill-rule', 'evenodd');
  await expect(main(page).locator('svg')).toHaveAttribute('stroke', 'none');
  await expect(page.getByRole('slider', { name: 'Stroke width' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Increase stroke width' })).toBeEnabled();
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
  const originalPath = await main(page).locator('path').getAttribute('d');
  const outer = originalPath!.slice(0, originalPath!.lastIndexOf(' M '));
  await page.getByRole('slider', { name: 'Stroke width' }).fill('1');
  await expect(main(page).locator('svg')).toHaveAttribute('data-cutout-width', '1');
  expect(
    await main(page)
      .locator('path')
      .evaluate((element) => (element as SVGGeometryElement).isPointInFill(new DOMPoint(12, 10.1))),
  ).toBe(true);
  await page.getByRole('slider', { name: 'Stroke width' }).fill('2.5');
  await expect(page.getByTestId('filled-gap')).toHaveText('Gap 2.50 units');
  expect(
    await main(page)
      .locator('path')
      .evaluate((element) => (element as SVGGeometryElement).isPointInFill(new DOMPoint(12, 10.1))),
  ).toBe(false);
  const expanded = await main(page).locator('path').getAttribute('d');
  expect(expanded!.slice(0, expanded!.lastIndexOf(' M '))).toBe(outer);
  await expect(main(page).locator('svg')).toHaveAttribute('stroke', 'none');
  await expect(page.getByTestId('horizontal-spacing')).toHaveText('2.125 / 2.125');
  await expect(page.getByTestId('vertical-spacing')).toHaveText('3.338 / 3.338');
  await size(page, 'Y', 110);
  await expect(page.getByTestId('filled-gap')).toHaveText('Gap 2.50 units');
  await size(page, 'Y', 100);

  await expect(page.getByTestId('horizontal-spacing')).toHaveText('2.125 / 2.125');
  await expect(page.getByTestId('vertical-spacing')).toHaveText('3.338 / 3.338');
  await size(page, 'X', 80);
  await size(page, 'Y', 115);
  await balanced(page);
  if (info.project.name === 'chromium')
    await page.screenshot({ path: '.artifacts/previews/lab-static-filled.png', fullPage: true });
  await size(page, 'Y', 1);
  await expect(page.getByTestId('filled-gap')).toHaveText('Gap 0.06 units');
  await expect(main(page).locator('svg')).toHaveAttribute('stroke', 'none');
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test('linked axes clamp together, step with buttons and reset cleanly', async ({ page }) => {
  await page.goto('/lab');
  await page.getByLabel('Link X/Y proportions').check();
  await page.getByRole('button', { name: 'Increase size X', exact: true }).click();
  await expect(page.getByRole('spinbutton', { name: 'Size X', exact: true })).toHaveValue('105');
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('105');
  await size(page, 'X', 500);
  await expect(page.getByRole('spinbutton', { name: 'Size X', exact: true })).toHaveValue('123.88');
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('123.88');
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
  await expect(page.getByTestId('spacing-top')).toHaveText('3.338');
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
  await size(page, 'Y', 116);
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('116');
  await expect(page.getByTestId('y-limit')).toContainText('116.88%');
  await page.getByRole('button', { name: 'Match Y to left spacing' }).click();
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('116.88');
  await expect(page.getByTestId('horizontal-spacing')).toHaveText('2.150 / 2.150');
  await expect(page.getByTestId('vertical-spacing')).toHaveText('2.150 / 2.150');
  await expect(page.getByRole('button', { name: 'Increase size Y', exact: true })).toBeDisabled();
  await size(page, 'X', 80);
  await expect(page.getByTestId('horizontal-spacing')).toHaveText('3.950 / 3.950');
  await expect(page.getByTestId('vertical-spacing')).toHaveText('3.950 / 3.950');
  await page.getByRole('button', { name: 'Filled', exact: true }).click();
  await expect(page.getByTestId('y-limit')).toContainText('91.20%');
  await expect(page.getByTestId('horizontal-spacing')).toHaveText('4.100 / 4.100');
  await expect(page.getByTestId('vertical-spacing')).toHaveText('4.100 / 4.100');
  await size(page, 'X', 120);
  await page.getByRole('button', { name: 'Outline', exact: true }).click();
  await expect(page.getByRole('spinbutton', { name: 'Size X', exact: true })).toHaveValue('120');
  await balanced(page);
});

test('stroke presets share Regular 1.70 as default while retaining fine adjustment', async ({
  page,
}) => {
  await page.goto('/lab');
  await expect(page.getByRole('button', { name: 'Regular', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(main(page).locator('svg')).toHaveAttribute('stroke-width', '1.7');
  for (const style of ['Outline', 'Filled']) {
    await page.getByRole('button', { name: style, exact: true }).click();
    for (const [name, weight] of [
      ['Thin', '1.25'],
      ['Regular', '1.7'],
      ['Bold', '2.25'],
    ]) {
      await page.getByRole('button', { name, exact: true }).click();
      await expect(main(page).locator('svg')).toHaveAttribute(
        style === 'Outline' ? 'stroke-width' : 'data-cutout-width',
        weight,
      );
      await expect(page.getByRole('button', { name, exact: true })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await balanced(page);
    }
  }
  await page.getByRole('slider', { name: 'Stroke width' }).fill('1.8');
  await expect(page.getByRole('button', { name: 'Regular', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await expect(
    page.getByText('Stroke width sets the inner gap; the outside stays fixed.'),
  ).toHaveCount(0);
  await page.getByRole('button', { name: /Reset geometry/ }).click();
  await expect(page.getByRole('button', { name: 'Regular', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('right sidebar switches native icons and preserves independent review drafts', async ({
  page,
}) => {
  await page.goto('/lab');
  const sidebar = page.getByRole('complementary', { name: 'Icon list' });
  await expect(sidebar.getByRole('button')).toHaveCount(6);
  await expect(sidebar.getByRole('button', { name: 'Select folder', exact: true })).toContainText(
    'Approved',
  );
  await size(page, 'X', 90);
  await page.getByRole('button', { name: 'Filled', exact: true }).click();
  await page.getByRole('button', { name: 'Bold', exact: true }).click();
  for (const icon of ['camera', 'bell', 'heart', 'search', 'settings']) {
    await sidebar.getByRole('button', { name: 'Select ' + icon, exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      icon[0].toUpperCase() + icon.slice(1) + ' lab',
    );
    await expect(main(page).locator('svg')).toHaveAttribute('stroke-width', '1.7');
    await expect(page.getByRole('button', { name: 'Filled', exact: true })).toBeDisabled();
    await expect(page.getByText('Filled study not drawn yet')).toBeVisible();
    await balanced(page);
  }
  await sidebar.getByRole('button', { name: 'Select folder', exact: true }).click();
  await expect(page.getByRole('spinbutton', { name: 'Size X', exact: true })).toHaveValue('90');
  await expect(page.getByRole('button', { name: 'Filled', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: 'Bold', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});
