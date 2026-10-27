import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const metadata = JSON.parse(
  await readFile(fileURLToPath(import.meta.resolve('@squircle-icons/svelte/catalog.json')), 'utf8'),
);
const approved = metadata.icons.filter(
  (icon: { reviewStatus: string }) => icon.reviewStatus === 'approved',
);

async function chooseStyle(page: Page, style: 'Outline' | 'Filled') {
  await page.getByRole('combobox', { name: 'Icon style', exact: true }).click();
  const weight = await page.getByLabel('Stroke width', { exact: true }).inputValue();
  const preset = Object.entries(metadata.strokeWeights).find(
    ([, value]) => String(value) === weight,
  )?.[0];
  const label =
    style === 'Filled'
      ? 'Filled'
      : preset
        ? preset.charAt(0).toUpperCase() + preset.slice(1)
        : 'Custom';
  await page.getByRole('option', { name: label, exact: true }).click();
}

test('icon style dropdown supports keyboard selection and Escape without closing details', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/icons#camera');
  const details = page.getByRole('dialog', { name: 'Camera', exact: true });
  await expect(details).toBeVisible();
  const style = page.getByRole('combobox', { name: 'Icon style', exact: true });
  await expect(style).toHaveText('Regular');
  await expect(page.locator('.detail-controls .squircle-select-trigger')).toHaveCount(1);
  const sizeSlider = (await page.getByLabel('Export size', { exact: true }).boundingBox())!;
  const sizeValue = (await page.locator('.size-field span').boundingBox())!;
  expect(sizeValue.x).toBeGreaterThan(sizeSlider.x + sizeSlider.width);
  expect(
    Math.abs(sizeSlider.y + sizeSlider.height / 2 - sizeValue.y - sizeValue.height / 2),
  ).toBeLessThan(1);
  await style.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('listbox', { name: 'Icon styles' })).toBeVisible();
  for (const [label, weight] of Object.entries(metadata.strokeWeights)) {
    const option = page.getByRole('option', {
      name: label.charAt(0).toUpperCase() + label.slice(1),
      exact: true,
    });
    await expect(option.locator('.style-option-preview svg')).toHaveAttribute('width', '20');
    await expect(option.locator('.style-option-preview svg')).toHaveAttribute(
      'stroke-width',
      String(weight),
    );
    await expect(option.locator('.style-option-preview svg')).toHaveAttribute('fill', 'none');
  }
  await expect(
    page.getByRole('option', { name: 'Filled', exact: true }).locator('.style-option-preview svg'),
  ).not.toHaveAttribute('fill', 'none');
  const search = (await page.locator('.search-field').boundingBox())!;
  const controls = (await page.locator('.gallery-sidebar').boundingBox())!;
  expect(Math.abs(controls.x - search.x - search.width - 20)).toBeLessThan(1);
  await expect(page.locator('.search-field')).toHaveCSS('border-radius', '12px');
  await expect(style).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.locator('.color-picker-control')).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  );
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await expect(style).toHaveText('Filled');
  await expect(page.locator('#camera svg')).toHaveAttribute('fill', '#27272a');
  await expect(details.locator('.usage-code')).toContainText('style="filled"');
  await style.click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox', { name: 'Icon styles' })).toHaveCount(0);
  await expect(details).toBeVisible();
  await chooseStyle(page, 'Outline');
  await expect(page.locator('#camera svg')).toHaveAttribute('fill', 'none');
  await expect(page.getByLabel('Stroke width', { exact: true })).toBeEnabled();
});

async function chooseIcon(page: Page, name: string) {
  const button = page.getByRole('button', { name: `View ${name} icon`, exact: true });
  if (!(await button.isVisible())) await page.getByRole('searchbox').fill(name);
  await button.click();
}

async function clipboardStub(page: Page, reject = false) {
  await page.addInitScript((reject) => {
    const writes: string[] = [];
    Object.defineProperty(window, '__clipboardWrites', { value: writes });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          if (reject) throw new DOMException('Denied', 'NotAllowedError');
          writes.push(value);
        },
      },
    });
  }, reject);
}
async function lastCopy(page: Page) {
  return page.evaluate(() =>
    (window as unknown as { __clipboardWrites: string[] }).__clipboardWrites.at(-1)!,
  );
}

test('gallery shows approved icons as centered 24px buttons and filters by name or tags', async ({
  page,
}) => {
  await page.goto('/icons');
  await expect(page.locator('.icon-button')).toHaveCount(Math.min(48, approved.length));
  await expect(page.locator('footer, .page-intro, .optical-check')).toHaveCount(0);
  await expect(page.getByText('Six familiar faces.')).toHaveCount(0);
  const buttons = await page.locator('.icon-button').evaluateAll((buttons) =>
    buttons.map((button) => {
      const svg = button.querySelector('svg')!;
      const label = button.querySelector('.icon-name')!;
      const box = button.getBoundingClientRect(),
        art = svg.getBoundingClientRect(),
        text = label.getBoundingClientRect();
      return {
        name: label.textContent,
        width: art.width,
        height: art.height,
        artCenter: art.x + art.width / 2,
        textCenter: text.x + text.width / 2,
        center: box.x + box.width / 2,
        count: button.querySelectorAll('svg').length,
      };
    }),
  );
  expect(buttons.map((button) => button.name)).toEqual(
    approved.slice(0, 48).map((icon: { name: string }) => icon.name),
  );
  for (const button of buttons) {
    expect(button.width).toBe(24);
    expect(button.height).toBe(24);
    expect(button.count).toBe(1);
    expect(button.artCenter).toBeCloseTo(button.center, 1);
    expect(button.textCenter).toBeCloseTo(button.center, 1);
  }
  await page.getByRole('searchbox').fill('  GEAR  ');
  await expect(page.locator('.icon-button')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'View settings icon' })).toBeVisible();
  await page.getByRole('searchbox').fill('no-such-icon');
  await expect(page.locator('.icon-button')).toHaveCount(0);
  await expect(page.getByText('0 icons', { exact: true })).toBeVisible();
  await expect(page.getByText(/No icons found/)).toBeVisible();
  await page.getByRole('searchbox').fill('');
  await expect(page.locator('.icon-button')).toHaveCount(Math.min(48, approved.length));
});

test('floating card leaves the gallery interactive and controls sticky outside', async ({
  page,
}) => {
  await page.goto('/icons');
  const trigger = page.getByRole('button', { name: 'View camera icon' });
  await trigger.focus();
  await trigger.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Camera', exact: true });
  const sidebar = page.getByRole('complementary', { name: 'Icon controls' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Close icon details' })).toBeFocused();
  await expect(dialog).toHaveCSS('animation-name', 'none');
  expect(await dialog.evaluate((element) => element.matches(':modal'))).toBe(false);
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  const toolbar = page.locator('.gallery-toolbar');
  await expect(toolbar).toHaveCSS('position', 'sticky');
  const searchBox = await page.getByRole('searchbox').boundingBox();
  const controlsBox = await sidebar.boundingBox();
  expect(
    Math.abs(searchBox!.y + searchBox!.height / 2 - controlsBox!.y - controlsBox!.height / 2),
  ).toBeLessThan(2);
  await expect(page.locator('.brand')).toHaveCSS('font-size', '20px');
  await expect(page.locator('.brand-word')).toHaveCSS('font-size', '20px');
  await expect(dialog.locator('.detail-controls')).toHaveCount(0);
  const box = await dialog.boundingBox(),
    gallery = await page.getByRole('region', { name: 'Icon gallery' }).boundingBox(),
    side = await sidebar.boundingBox();
  expect(box!.x).toBe(gallery!.x);
  expect(box!.width).toBe(gallery!.width);
  expect(box!.x).toBeGreaterThan(0);
  expect(box!.y + box!.height).toBeCloseTo(876, 0);
  expect(side!.x).toBeGreaterThan(searchBox!.x + searchBox!.width);
  // There is no backdrop or focus trap: the external controls remain operable.
  await chooseStyle(page, 'Filled');
  await expect(dialog.locator('[data-testid="drawer-preview"] svg')).toHaveAttribute(
    'fill',
    '#27272a',
  );
  await sidebar.getByRole('combobox', { name: 'Icon style', exact: true }).focus();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await chooseIcon(page, 'heart');
  const heart = page.getByRole('dialog', { name: 'Heart', exact: true });
  await expect(heart).toBeVisible();
  await expect(sidebar.getByRole('combobox', { name: 'Icon style', exact: true })).toHaveText(
    'Filled',
  );
  await page.getByRole('searchbox').fill('camera');
  await expect(heart).toBeVisible();
  await page.getByRole('searchbox').fill('');
  const fonts = await page
    .locator(
      '.icon-browser input,.icon-button .icon-name,.result-count,.gallery-sidebar h2,.gallery-sidebar p,.gallery-sidebar label,.gallery-sidebar button,.gallery-sidebar select,.gallery-sidebar span,.icon-drawer h2,.icon-drawer button,.icon-drawer code,.icon-drawer p,.drawer-kicker,.site-header a:not(.brand),.site-header .nav-count,.site-header .alpha-label',
    )
    .evaluateAll((elements) =>
      elements
        .filter((element) => element.getClientRects().length > 0)
        .map((element) => getComputedStyle(element).fontSize),
    );
  expect(fonts.length).toBeGreaterThan(20);
  expect([...new Set(fonts)]).toEqual(['14px']);
  await page.setViewportSize({ width: 1280, height: 600 });
  const stickyTop = await toolbar.evaluate((element) => parseFloat(getComputedStyle(element).top));
  await page.evaluate(() => window.scrollTo(0, 180));
  await expect.poll(async () => (await toolbar.boundingBox())!.y).toBe(stickyTop);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.getByRole('searchbox').fill('heart');
  await heart.getByRole('button', { name: 'Close icon details' }).click();
  await expect(heart).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'View heart icon' })).toBeFocused();
});

test('copy and download SVG preserve the selected package geometry, size, color and stroke', async ({
  page,
}) => {
  await clipboardStub(page);
  await page.goto('/icons');
  await chooseIcon(page, 'camera');
  const dialog = page.getByRole('dialog', { name: 'Camera', exact: true });
  await page
    .getByRole('complementary', { name: 'Icon controls' })
    .getByLabel('Export size')
    .fill('32');
  await page
    .getByRole('complementary', { name: 'Icon controls' })
    .getByLabel('Hex color', { exact: true })
    .fill('#5144eb');
  await page
    .getByRole('complementary', { name: 'Icon controls' })
    .getByLabel('Stroke width')
    .fill('2.1');
  await dialog.getByRole('button', { name: 'Copy SVG', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('SVG copied.');
  const svg = await lastCopy(page);
  const exported = await page.evaluate((text) => {
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml'),
      root = doc.documentElement;
    return {
      errors: doc.querySelectorAll('parsererror').length,
      name: root.localName,
      namespace: root.namespaceURI,
      width: root.getAttribute('width'),
      height: root.getAttribute('height'),
      viewBox: root.getAttribute('viewBox'),
      color: root.getAttribute('stroke'),
      stroke: root.getAttribute('stroke-width'),
      label: root.getAttribute('aria-label'),
      hidden: root.getAttribute('aria-hidden'),
      geometry: [...root.querySelectorAll('path,circle')].map((element) => ({
        tag: element.localName,
        attributes: Object.fromEntries(
          [...element.attributes]
            .filter((attribute) => attribute.name !== 'xmlns')
            .map((attribute) => [attribute.name, attribute.value]),
        ),
      })),
    };
  }, svg);
  expect(exported).toMatchObject({
    errors: 0,
    name: 'svg',
    namespace: 'http://www.w3.org/2000/svg',
    width: '32',
    height: '32',
    viewBox: '0 0 24 24',
    color: '#5144eb',
    stroke: '2.1',
    label: 'Camera',
    hidden: null,
  });
  expect(svg).not.toContain('<!--');
  const actual = await dialog.locator('[data-testid="drawer-preview"] svg').evaluate((root) =>
    [...root.querySelectorAll('path,circle')].map((element) => ({
      tag: element.localName,
      attributes: Object.fromEntries(
        [...element.attributes]
          .filter((attribute) => attribute.name !== 'xmlns')
          .map((attribute) => [attribute.name, attribute.value]),
      ),
    })),
  );
  expect(exported.geometry).toEqual(actual);
  const downloading = page.waitForEvent('download');
  await dialog.getByRole('button', { name: 'Download SVG' }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe('camera.svg');
  expect(await readFile((await download.path())!, 'utf8')).toBe(svg);
  await dialog.getByRole('button', { name: 'Copy Svelte code' }).click();
  await expect(page.getByRole('status')).toHaveText('Svelte code copied.');
  expect(await lastCopy(page)).not.toContain('import ');
  expect(await lastCopy(page)).toContain('<Camera size={32} color="#5144eb" strokeWidth={2.1} />');
  await expect(page.locator('#camera svg')).toHaveAttribute('width', '32');
  await expect(page.locator('#camera svg')).toHaveAttribute('stroke', '#5144eb');
});

test('filled exports and Svelte snippets match the chosen style, including Search', async ({
  page,
}) => {
  await clipboardStub(page);
  await page.goto('/icons#bell');
  let dialog = page.getByRole('dialog', { name: 'Bell', exact: true });
  await expect(dialog).toBeVisible();
  await chooseStyle(page, 'Filled');
  await expect(dialog.locator('[data-testid="drawer-preview"] svg')).toHaveAttribute(
    'fill',
    '#27272a',
  );
  await expect(
    page.getByRole('complementary', { name: 'Icon controls' }).getByLabel('Stroke width'),
  ).toBeDisabled();
  await dialog.getByRole('button', { name: 'Copy SVG', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('SVG copied.');
  expect(await lastCopy(page)).toContain('fill="#27272a"');
  expect(await lastCopy(page)).toContain('data-part="clapper"');
  await dialog.getByRole('button', { name: 'Copy Svelte code' }).click();
  await expect(page.getByRole('status')).toHaveText('Svelte code copied.');
  expect(await lastCopy(page)).toContain('<Bell ');
  expect(await lastCopy(page)).toContain('style="filled"');
  expect(await lastCopy(page)).not.toContain('strokeWidth');
  const downloading = page.waitForEvent('download');
  await dialog.getByRole('button', { name: 'Download SVG' }).click();
  expect((await downloading).suggestedFilename()).toBe('bell-filled.svg');
  await dialog.getByRole('button', { name: 'Close icon details' }).click();
  await chooseIcon(page, 'search');
  dialog = page.getByRole('dialog', { name: 'Search', exact: true });
  await expect(page.getByRole('combobox', { name: 'Icon style', exact: true })).toHaveText(
    'Filled',
  );
  await expect(dialog.locator('[data-testid="drawer-preview"] svg')).toHaveAttribute(
    'fill',
    '#27272a',
  );
  await expect(
    page.getByRole('complementary', { name: 'Icon controls' }).getByLabel('Stroke width'),
  ).toBeDisabled();
  await dialog.getByRole('button', { name: 'Copy Svelte code' }).click();
  await expect(page.getByRole('status')).toHaveText('Svelte code copied.');
  expect(await lastCopy(page)).toContain('<Search ');
  expect(await lastCopy(page)).toContain('style="filled"');
  await chooseStyle(page, 'Outline');
  await expect(page.getByRole('combobox', { name: 'Icon style', exact: true })).toHaveText(
    'Regular',
  );
  await expect(
    page.getByRole('complementary', { name: 'Icon controls' }).getByLabel('Stroke width'),
  ).toBeEnabled();
});

test('failed clipboard access reports failure without claiming success', async ({ page }) => {
  await clipboardStub(page, true);
  await page.goto('/icons#folder');
  const dialog = page.getByRole('dialog', { name: 'Folder', exact: true });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Copy SVG', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText(
    'Could not copy. Allow clipboard access and try again.',
  );
  await expect(dialog.getByRole('button', { name: 'Copy SVG', exact: true })).toBeEnabled();
  await dialog.getByRole('button', { name: 'Copy Svelte code' }).click();
  await expect(page.getByRole('status')).not.toContainText('copied');
  await chooseStyle(page, 'Filled');
  await expect(
    page.getByRole('complementary', { name: 'Icon controls' }).getByLabel('Stroke width'),
  ).toBeEnabled();
  await expect(page.locator('.notification-toast')).toBeHidden();
});

test('drawer stays contained at smaller sizes and respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [390, 700, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/icons');
    await chooseIcon(page, 'camera');
    const dialog = page.getByRole('dialog', { name: 'Camera', exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveCSS('animation-name', 'none');
    expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
      true,
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await expect(dialog.getByRole('button', { name: 'Download SVG' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Copy SVG', exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Copy Svelte code' })).toBeVisible();
  }
});

test('unknown or malformed deep links leave the gallery usable without browser errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const hash of ['not-an-icon', '%E0%A4%A']) {
    await page.goto('about:blank');
    await page.goto('/icons#' + hash);
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await chooseIcon(page, 'heart');
    await expect(page.getByRole('dialog', { name: 'Heart', exact: true })).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('stroke presets and copied code use the unified icon API', async ({ page }) => {
  await clipboardStub(page);
  await page.goto('/icons');
  await chooseIcon(page, 'camera');
  const preview = page.getByTestId('drawer-preview').locator('svg');
  const presets = page.getByRole('combobox', { name: 'Icon style', exact: true });
  await expect(presets).toHaveText('Regular');
  for (const [name, value] of [
    ['Thin', String(metadata.strokeWeights.thin)],
    ['Bold', String(metadata.strokeWeights.bold)],
    ['Regular', String(metadata.strokeWeights.regular)],
  ]) {
    await presets.click();
    await page.getByRole('option', { name, exact: true }).click();
    await expect(preview).toHaveAttribute('stroke-width', value);
  }
  await page.getByLabel('Stroke width', { exact: true }).fill('1.8');
  await expect(presets).toHaveText('Custom');
  await presets.click();
  await page.getByRole('option', { name: 'Thin', exact: true }).click();
  await expect(presets).toBeFocused();
  await presets.press('ArrowDown');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toBeHidden();
  await expect(page.getByRole('dialog', { name: 'Camera', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Copy Svelte code' }).click();
  expect(await lastCopy(page)).toContain('<Camera ');
  expect(await lastCopy(page)).toContain('strokeWidth="thin"');
});

test('card exits downward, can reopen during dismissal, and settles immediately with reduced motion', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/icons');
  await chooseIcon(page, 'folder');
  let dialog = page.getByRole('dialog', { name: 'Folder', exact: true });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Close icon details' }).click();
  const exit = await page.evaluate(() => {
    const animation = document
      .querySelector('dialog')!
      .getAnimations()
      .find((item) => item.id === 'drawer-exit')!;
    animation.pause();
    animation.currentTime = 110;
    return {
      duration: animation.effect!.getComputedTiming().duration,
      frames: (animation.effect as KeyframeEffect).getKeyframes(),
    };
  });
  expect(exit.duration).toBe(220);
  expect(exit.frames.at(-1)!.opacity).toBe('0');
  expect(exit.frames.at(-1)!.transform).toContain('100%');
  await expect(dialog).toBeVisible();
  // Selecting another icon cancels the pending close and keeps the card usable.
  await chooseIcon(page, 'camera');
  dialog = page.getByRole('dialog', { name: 'Camera', exact: true });
  await expect(dialog).toBeVisible();
  expect(
    await dialog.evaluate((element) =>
      element.getAnimations().some((item) => item.id === 'drawer-exit'),
    ),
  ).toBe(false);
  await dialog.getByRole('button', { name: 'Close icon details' }).click();
  await expect(dialog).not.toBeVisible();
  await chooseIcon(page, 'camera');
  await dialog.getByRole('button', { name: 'Close icon details' }).click();
  await page.evaluate(() =>
    document
      .querySelector('dialog')!
      .getAnimations()
      .find((item) => item.id === 'drawer-exit')
      ?.pause(),
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(dialog).not.toBeVisible();
  await chooseIcon(page, 'folder');
  dialog = page.getByRole('dialog', { name: 'Folder', exact: true });
  await dialog.getByRole('button', { name: 'Close icon details' }).click();
  await expect(dialog).not.toBeVisible();
  expect(errors).toEqual([]);
});

test('sidebar changes the rendered gallery icons immediately, including size and outline-only fallback', async ({
  page,
}) => {
  await page.goto('/icons');
  const sidebar = page.getByRole('complementary', { name: 'Icon controls' });
  await sidebar.getByLabel('Export size').press('ArrowRight');
  await expect(sidebar.getByLabel('Export size')).toHaveValue('28');
  await expect(page.locator('.icon-button svg')).toHaveCount(Math.min(48, approved.length));
  await expect
    .poll(() =>
      page.locator('.icon-button svg').evaluateAll((icons) =>
        icons.every((icon) => {
          const box = icon.getBoundingClientRect();
          return box.width === 28 && box.height === 28;
        }),
      ),
    )
    .toBe(true);
  await sidebar.getByLabel('Hex color', { exact: true }).fill('#197065');
  await sidebar.getByLabel('Stroke width').fill('2.1');
  for (const icon of await page.locator('.icon-button svg').all()) {
    await expect(icon).toHaveAttribute('stroke', '#197065');
    await expect(icon).toHaveAttribute('stroke-width', '2.1');
  }
  await sidebar.getByRole('combobox', { name: 'Icon style', exact: true }).click();
  await page.getByRole('option', { name: 'Bold', exact: true }).click();
  await expect(page.locator('#camera svg')).toHaveAttribute(
    'stroke-width',
    String(metadata.strokeWeights.bold),
  );
  await chooseStyle(page, 'Filled');
  const visited: string[] = [];
  for (let offset = 0; offset < approved.length; offset += 48) {
    const batch = approved.slice(offset, offset + 48);
    await expect(page.locator('.icon-button')).toHaveCount(batch.length);
    for (const icon of batch) {
      const svg = page.locator(`#${icon.name} svg`);
      if (icon.styles.includes('filled')) await expect(svg).toHaveAttribute('fill', '#197065');
      else {
        await expect(svg).toHaveAttribute('fill', 'none');
        await expect(svg).toHaveAttribute('stroke', '#197065');
      }
      visited.push(icon.name);
    }
    const next = page.getByRole('button', { name: 'Next', exact: true });
    if (offset + 48 < approved.length) await next.click();
    else if (approved.length > 48) await expect(next).toBeDisabled();
  }
  expect(visited).toEqual(approved.map((icon: { name: string }) => icon.name));
  await page.getByRole('searchbox').fill('camera');
  await chooseStyle(page, 'Outline');
  await expect(page.locator('#camera svg')).toHaveAttribute('fill', 'none');
  await expect(page.locator('#camera svg')).toHaveAttribute(
    'stroke-width',
    String(metadata.strokeWeights.bold),
  );
});

test('categories filter together with search, update the lower count, and support keyboard tabs', async ({
  page,
}) => {
  await page.goto('/icons');
  const tabs = page.getByRole('tablist', { name: 'Icon categories' });
  const count = page.locator('.result-count');
  const searchBox = await page.getByRole('searchbox').boundingBox();
  const countBox = await count.boundingBox();
  expect(countBox!.y).toBeGreaterThanOrEqual(searchBox!.y + searchBox!.height);
  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(navigation.getByRole('link')).toHaveText(['Icons', 'Docs']);
  for (const [category, names] of [
    ['Media', ['camera']],
    ['Files', ['copy', 'folder']],
    ['Nature', ['moon', 'sun']],
    [
      'Interface',
      approved
        .filter(
          (icon: { name: string }) =>
            !['camera', 'copy', 'folder', 'moon', 'sun'].includes(icon.name),
        )
        .map((icon: { name: string }) => icon.name),
    ],
  ] as const) {
    await tabs.getByRole('tab', { name: category, exact: true }).click();
    await expect(page.locator('.icon-button .icon-name')).toHaveText([...names].slice(0, 48));
    await expect(count).toHaveText(`${names.length} ${names.length === 1 ? 'icon' : 'icons'}`);
    await expect(page.getByRole('tabpanel')).toHaveAccessibleName(category);
  }
  await tabs.getByRole('tab', { name: 'Nature', exact: true }).click();
  await page.getByRole('searchbox').fill('night');
  await expect(page.locator('.icon-button .icon-name')).toHaveText(['moon']);
  await tabs.getByRole('tab', { name: 'Files', exact: true }).click();
  await expect(count).toHaveText('0 icons');
  await expect(
    page.getByText('No icons found. Try another category or search term.'),
  ).toBeVisible();
  await page.getByRole('searchbox').fill('');
  const files = tabs.getByRole('tab', { name: 'Files', exact: true });
  await files.focus();
  await files.press('ArrowRight');
  await expect(tabs.getByRole('tab', { name: 'Nature', exact: true })).toBeFocused();
  await files.press('Home');
  await expect(tabs.getByRole('tab', { name: 'All', exact: true })).toBeFocused();
  await expect(page.locator('.icon-button')).toHaveCount(Math.min(48, approved.length));
});

test('gallery labels stay at the bottom and copy feedback floats outside the drawer', async ({
  page,
}) => {
  await clipboardStub(page);
  await page.goto('/icons');
  const card = page.getByRole('button', { name: 'View camera icon', exact: true });
  await expect(card).toBeVisible();
  const layout = await card.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const label = element.querySelector('.icon-name')!.getBoundingClientRect();
    const glyph = element.querySelector('svg')!.getBoundingClientRect();
    return {
      square: Math.abs(box.width - box.height),
      bottom: box.bottom - label.bottom,
      gap: label.top - glyph.bottom,
    };
  });
  expect(layout.square).toBeLessThan(1);
  expect(layout.bottom).toBeCloseTo(13, 0);
  expect(layout.gap).toBeGreaterThanOrEqual(12);
  await card.click();
  const dialog = page.getByRole('dialog', { name: 'Camera', exact: true });
  await expect(dialog).toBeVisible();
  await dialog.evaluate(async (element) => {
    await Promise.all(element.getAnimations().map((animation) => animation.finished));
  });
  const before = await dialog.boundingBox();
  await dialog.getByRole('button', { name: 'Copy Svelte code' }).click();
  const toast = page.getByRole('status');
  await expect(toast).toHaveText('Svelte code copied.');
  await expect(dialog.getByRole('status')).toHaveCount(0);
  await expect(toast).toHaveCSS('position', 'fixed');
  expect(await dialog.boundingBox()).toEqual(before);
  await toast.getByRole('button', { name: 'Dismiss notification' }).click();
  await expect(toast).toBeHidden();
  await dialog.getByRole('button', { name: 'Copy SVG', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('SVG copied.');
  await expect(page.locator('.notification-toast')).toBeHidden({ timeout: 5000 });
});

test('drawer shows only Svelte code with icon controls and SVG actions below', async ({ page }) => {
  await clipboardStub(page);
  await page.goto('/icons#camera');
  const dialog = page.getByRole('dialog', { name: 'Camera', exact: true });
  await expect(dialog).toBeVisible();
  const panel = dialog.getByRole('region', { name: 'Svelte code', exact: true });
  await expect(dialog.getByRole('tablist', { name: 'Code language' })).toHaveCount(0);
  await expect(panel.locator('code')).toHaveText(
    '<Camera size={24} color="#27272a" strokeWidth="regular" />',
  );
  await expect(panel).not.toContainText('import');
  const copy = panel.getByRole('button', { name: 'Copy Svelte code' });
  await expect(copy).toHaveCSS('border-radius', '8px');
  await copy.click();
  expect(await lastCopy(page)).toBe(await panel.locator('code').innerText());
  await page
    .getByRole('complementary', { name: 'Icon controls' })
    .getByLabel('Export size')
    .fill('40');
  await expect(panel.locator('code')).toContainText('size={40}');
  for (const name of ['Download SVG', 'Copy SVG', 'Close icon details']) {
    await expect(dialog.getByRole('button', { name, exact: true }).locator('svg')).toHaveCount(1);
  }
  const codeBox = await panel.boundingBox();
  const copyBox = await copy.boundingBox();
  expect(copyBox!.y - codeBox!.y).toBeLessThanOrEqual(14);
  expect(codeBox!.x + codeBox!.width - copyBox!.x - copyBox!.width).toBeLessThanOrEqual(14);
  expect(codeBox!.height).toBeLessThan(70);
  await expect
    .poll(async () => {
      const preview = await page.getByTestId('drawer-preview').boundingBox();
      const details = await dialog.locator('.drawer-details').boundingBox();
      return Math.abs(preview!.height - details!.height);
    })
    .toBeLessThan(1);
  const actions = await dialog.locator('.drawer-actions').boundingBox();
  expect(actions!.y).toBeGreaterThanOrEqual(codeBox!.y + codeBox!.height);
  await dialog.getByRole('button', { name: 'Copy SVG', exact: true }).click();
  expect(await lastCopy(page)).toContain('<svg');
  await dialog.getByRole('button', { name: 'Close icon details' }).click();
  await expect(dialog).not.toBeVisible();
});
