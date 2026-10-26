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
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('115');
  await balanced(page);
  if (info.project.name === 'chromium')
    await page.screenshot({ path: '.artifacts/previews/lab-static-filled.png', fullPage: true });
  await size(page, 'Y', 1);
  await expect(page.getByTestId('filled-gap')).toHaveText('Gap 0.06 units');
  await expect(main(page).locator('svg')).toHaveAttribute('stroke', 'none');
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test('X and Y are independent without artboard or aspect-ratio caps', async ({ page }) => {
  await page.goto('/lab');
  await expect(page.getByLabel('Link X/Y proportions')).toHaveCount(0);
  await expect(page.getByRole('spinbutton', { name: 'Size X', exact: true })).not.toHaveAttribute(
    'max',
    /.+/,
  );
  await size(page, 'X', 180);
  await size(page, 'Y', 250);
  await expect(page.getByRole('spinbutton', { name: 'Size X', exact: true })).toHaveValue('180');
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('250');
  await expect(page.getByTestId('balance-state')).toHaveText('Outside 24×24 grid');
  await page.getByRole('button', { name: 'Increase size X', exact: true }).click();
  await expect(page.getByRole('spinbutton', { name: 'Size X', exact: true })).toHaveValue('185');
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('250');
  await page.getByRole('button', { name: 'Filled', exact: true }).click();
  await expect(page.getByRole('spinbutton', { name: 'Size X', exact: true })).toHaveValue('185');
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('250');
  await size(page, 'X', 70);
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('250');
  await page.getByRole('button', { name: /Reset geometry/ }).click();
  await expect(page.getByRole('spinbutton', { name: 'Size X', exact: true })).toHaveValue('100');
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('100');
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

test('matching left spacing is an explicit action and never locks Y', async ({ page }) => {
  await page.goto('/lab');
  await size(page, 'Y', 160);
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('160');
  await page.getByRole('button', { name: 'Match Y to left spacing' }).click();
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('116.88');
  await expect(page.getByTestId('horizontal-spacing')).toHaveText('2.150 / 2.150');
  await expect(page.getByTestId('vertical-spacing')).toHaveText('2.150 / 2.150');
  await page.getByRole('button', { name: 'Increase size Y', exact: true }).click();
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('121.88');
  await size(page, 'X', 60);
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('121.88');
  await size(page, 'Y', 95);
  await page.getByRole('button', { name: 'Bold', exact: true }).click();
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('95');
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

test('right sidebar exposes supported styles and preserves independent drafts', async ({
  page,
}) => {
  await page.goto('/lab');
  const sidebar = page.getByRole('complementary', { name: 'Icon list' });
  await expect(sidebar.getByRole('button')).toHaveCount(6);
  await expect(sidebar.getByRole('button', { name: 'Select folder', exact: true })).toContainText(
    'Approved',
  );
  await expect(sidebar.getByRole('button', { name: 'Select camera', exact: true })).toContainText(
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
    if (icon === 'search') {
      await expect(page.getByRole('button', { name: 'Filled', exact: true })).toHaveCount(0);
      await expect(page.getByTestId('style-filled')).toHaveCount(0);
      await expect(
        sidebar.getByRole('button', { name: 'Select search', exact: true }),
      ).toContainText('Approved');
      await balanced(page);
      continue;
    }
    await expect(page.getByRole('button', { name: 'Filled', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: 'Filled', exact: true }).click();
    await expect(main(page).locator('svg')).toHaveAttribute('stroke', 'none');
    await expect(page.getByText('Solid geometry', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('slider', { name: 'Stroke width' })).toHaveCount(0);
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

test('rotation affects canvas, samples and comparisons without changing X/Y or stroke', async ({
  page,
}, info) => {
  await page.goto('/lab');
  await page.getByRole('button', { name: 'Rotate clockwise', exact: true }).click();
  await expect(page.getByRole('spinbutton', { name: 'Rotation', exact: true })).toHaveValue('15');
  await page.getByRole('button', { name: 'Rotate counterclockwise', exact: true }).click();
  await expect(page.getByRole('spinbutton', { name: 'Rotation', exact: true })).toHaveValue('0');
  const rotation = page.getByRole('spinbutton', { name: 'Rotation', exact: true });
  await rotation.fill('90');
  await rotation.press('Tab');
  await expect(page.getByTestId('horizontal-spacing')).toHaveText('3.450 / 3.450');
  await expect(page.getByTestId('vertical-spacing')).toHaveText('2.150 / 2.150');
  await balanced(page);
  await expect(page.getByRole('spinbutton', { name: 'Size X', exact: true })).toHaveValue('100');
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('100');
  await rotation.fill('-45');
  await rotation.press('Tab');
  const transforms = await page
    .locator('.glyph svg > g')
    .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).transform));
  expect(new Set(transforms).size).toBe(1);
  expect(transforms[0]).not.toBe('none');
  await expect(main(page).locator('svg')).toHaveAttribute('stroke-width', '1.7');
  if (info.project.name === 'chromium')
    await page.screenshot({ path: '.artifacts/previews/lab-rotated.png', fullPage: true });
  await rotation.fill('450');
  await rotation.press('Tab');
  await expect(page.getByTestId('horizontal-spacing')).toHaveText('3.450 / 3.450');
  await page.getByRole('button', { name: 'Select camera', exact: true }).click();
  await expect(rotation).toHaveValue('0');
  await page.getByRole('button', { name: 'Select folder', exact: true }).click();
  await expect(rotation).toHaveValue('450');
  await page.getByRole('button', { name: 'Filled', exact: true }).click();
  await expect(page.getByTestId('filled-gap')).toHaveText('Gap 1.70 units');
  await page.getByRole('button', { name: 'Reset rotation', exact: true }).click();
  await expect(rotation).toHaveValue('0');
  await expect(page.getByTestId('horizontal-spacing')).toHaveText('2.125 / 2.125');
  await rotation.fill('30');
  await rotation.press('Tab');
  await page.getByRole('button', { name: /Reset geometry/ }).click();
  await expect(rotation).toHaveValue('0');
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test('rotated circular geometry has tight visible margins rather than a rotated rectangular box', async ({
  page,
}) => {
  await page.goto('/lab');
  await page.getByRole('button', { name: 'Select search', exact: true }).click();
  await page.getByRole('spinbutton', { name: 'Rotation', exact: true }).fill('45');
  await page.getByRole('spinbutton', { name: 'Rotation', exact: true }).press('Tab');
  // Circle (10,10), r=6.7 rotates around (12,12): its x extent is still r.
  // Handle endpoint (20.7,20.7) rotates to (12, 12+8.7*sqrt(2)).
  const horizontal = (await page.getByTestId('horizontal-spacing').innerText())
    .split('/')
    .map(Number);
  const vertical = (await page.getByTestId('vertical-spacing').innerText()).split('/').map(Number);
  expect(horizontal[0]).toBeCloseTo(12 - 6.7 - 0.85, 3);
  expect(horizontal[1]).toBeCloseTo(12 - 6.7 - 0.85, 3);
  expect(vertical[0]).toBeCloseTo(12 - 2 * Math.SQRT2 - 6.7 - 0.85, 2);
  expect(vertical[1]).toBeCloseTo(12 - 8.7 * Math.SQRT2 - 0.85, 2);
  await expect(page.getByTestId('balance-state')).toHaveText('Outside 24×24 grid');
});

test('switching styles preserves control space and preview position for every icon', async ({
  page,
}) => {
  await page.goto('/lab');
  const positions = () =>
    page
      .locator('.weight-slot, .size-section, .canvas, .drawing, .optical-row')
      .evaluateAll((elements) =>
        elements.map((element) => {
          const box = element.getBoundingClientRect();
          return { y: box.y, height: box.height };
        }),
      );
  for (const width of [1280, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const icon of ['camera', 'bell', 'folder', 'heart', 'settings']) {
      await page.getByRole('button', { name: 'Select ' + icon, exact: true }).click();
      await page.getByRole('button', { name: 'Outline', exact: true }).click();
      const before = await positions();
      await page.getByRole('button', { name: 'Filled', exact: true }).click();
      const filled = await positions();
      for (let i = 0; i < before.length; i++) {
        expect(filled[i].y).toBeCloseTo(before[i].y, 1);
        expect(filled[i].height).toBeCloseTo(before[i].height, 1);
      }
      if (icon !== 'folder') {
        await expect(page.getByRole('slider', { name: 'Stroke width' })).toHaveCount(0);
        await expect(page.getByRole('button', { name: 'Regular', exact: true })).toHaveCount(0);
      }
      await page.getByRole('button', { name: 'Outline', exact: true }).click();
      expect(await positions()).toEqual(before);
    }
  }
});

test('preview zoom enlarges inspection without changing artwork or actual-size samples', async ({
  page,
}, info) => {
  await page.goto('/lab');
  await page.getByRole('button', { name: 'Select camera', exact: true }).click();
  const svg = main(page).locator('svg');
  const zoom = page.getByRole('slider', { name: 'Preview zoom', exact: true });
  const margins = await page.getByTestId('vertical-spacing').innerText();
  const geometry = await main(page).locator('path').first().getAttribute('d');
  await expect(zoom).toHaveValue('14');
  await expect(svg).toHaveAttribute('width', '336');
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await expect(zoom).toHaveValue('16');
  await page.getByRole('button', { name: 'Zoom out', exact: true }).click();
  await expect(zoom).toHaveValue('14');
  await zoom.fill('24');
  await expect(svg).toHaveAttribute('width', '576');
  await expect(page.getByRole('button', { name: 'Zoom in', exact: true })).toBeDisabled();
  await expect(page.getByTestId('vertical-spacing')).toHaveText(margins);
  await expect(main(page).locator('path').first()).toHaveAttribute('d', geometry!);
  await expect(page.getByRole('spinbutton', { name: 'Size X', exact: true })).toHaveValue('100');
  await expect(page.getByRole('spinbutton', { name: 'Size Y', exact: true })).toHaveValue('100');
  expect(
    await page
      .getByRole('region', { name: 'Camera optical sizes' })
      .locator('svg')
      .evaluateAll((elements) => elements.map((element) => element.getAttribute('width'))),
  ).toEqual(['16', '20', '24', '48']);
  expect(await page.getByTestId('style-outline').locator('svg').getAttribute('width')).toBe('72');
  await page.getByRole('button', { name: 'Filled', exact: true }).click();
  await expect(svg).toHaveAttribute('width', '576');
  await expect(zoom).toHaveValue('24');
  await page.getByRole('button', { name: 'Outline', exact: true }).click();
  if (info.project.name === 'chromium')
    await page.screenshot({ path: '.artifacts/previews/lab-zoom-camera.png', fullPage: true });
  await zoom.fill('4');
  await expect(svg).toHaveAttribute('width', '96');
  await expect(page.getByRole('button', { name: 'Zoom out', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Reset zoom', exact: true }).click();
  await expect(zoom).toHaveValue('14');
  await page.getByRole('button', { name: 'Select folder', exact: true }).click();
  await expect(zoom).toHaveValue('14');
  await page.setViewportSize({ width: 1100, height: 900 });
  await zoom.fill('24');
  const viewport = page.getByRole('region', { name: 'Zoomed icon preview', exact: true });
  expect(await viewport.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(
    true,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await viewport.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
});

test('drawing grid, guides and SVG coordinate center coincide at every preview zoom', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1365, height: 1000 });
  await page.goto('/lab');
  await page.getByRole('button', { name: 'Select heart', exact: true }).click();
  await size(page, 'X', 95);
  await size(page, 'Y', 95);
  for (const style of ['Outline', 'Filled']) {
    await page.getByRole('button', { name: style, exact: true }).click();
    for (const grid of [true, false]) {
      await page.getByLabel('Drawing grid', { exact: true }).setChecked(grid);
      for (const zoom of [4, 7, 11, 14, 24]) {
        await page.getByRole('slider', { name: 'Preview zoom', exact: true }).fill(String(zoom));
        const result = await page.evaluate(() => {
          const drawing = document.querySelector('.drawing')!;
          const box = drawing.getBoundingClientRect();
          const svg = document.querySelector('[data-testid="main-study"] svg') as SVGSVGElement;
          const coordinate = new DOMPoint(12, 12).matrixTransform(svg.getScreenCTM()!);
          const center = (selector: string) => {
            const r = document.querySelector(selector)!.getBoundingClientRect();
            return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
          };
          const step = parseFloat(getComputedStyle(drawing).backgroundSize);
          return {
            coordinate: { x: coordinate.x, y: coordinate.y },
            drawing: { x: box.x + box.width / 2, y: box.y + box.height / 2 },
            horizontal: center('.axis.horizontal'),
            vertical: center('.axis.vertical'),
            gridCells: Number.isFinite(step) ? box.width / step : null,
          };
        });
        for (const center of [result.drawing, result.horizontal, result.vertical]) {
          expect(center.x).toBeCloseTo(result.coordinate.x, 2);
          expect(center.y).toBeCloseTo(result.coordinate.y, 2);
        }
        if (grid) expect(result.gridCells).toBeCloseTo(24, 5);
      }
    }
  }
});
