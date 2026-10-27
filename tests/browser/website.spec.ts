import { test, expect } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const packageCatalog = JSON.parse(
  await readFile(fileURLToPath(import.meta.resolve('@squircle-icons/svelte/catalog.json')), 'utf8'),
);
const approvedIcons = packageCatalog.icons.filter(
  (icon: { reviewStatus: string }) => icon.reviewStatus === 'approved',
);
const approvedNames: string[] = packageCatalog.icons
  .filter((icon: { reviewStatus: string }) => icon.reviewStatus === 'approved')
  .map((icon: { name: string }) => icon.name)
  .sort();
test('landing, icons, and docs are usable on desktop and mobile', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    /Soft edges\.\s*Rounded character\./,
  );
  await expect(page.locator('.drawing-notes')).toContainText(
    `${packageCatalog.strokeWeights.regular.toFixed(2)}Default stroke`,
  );
  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(navigation.getByRole('link', { name: 'Icons', exact: true })).toHaveAttribute(
    'href',
    '/icons',
  );
  await expect(navigation.getByRole('link', { name: 'Docs', exact: true })).toHaveAttribute(
    'href',
    '/docs',
  );
  await page.getByRole('link', { name: /Explore the icons/ }).click();
  await expect(page).toHaveURL(/\/icons$/);
  await expect(page.locator('#motion')).toHaveCount(0);
  const count = await page.locator('.icon-button').count();
  expect(count).toBe(Math.min(48, approvedNames.length));
  await page.getByRole('searchbox').fill('gear');
  await expect(page.getByRole('button', { name: 'View settings icon' })).toHaveCount(1);
  await page.getByRole('searchbox').fill('');
  await page.getByRole('button', { name: 'View camera icon' }).click();
  const dialog = page.getByRole('dialog', { name: 'Camera', exact: true });
  await expect(dialog).toBeVisible();
  await page
    .getByRole('complementary', { name: 'Icon controls' })
    .getByLabel('Export size')
    .fill('20');
  await page
    .getByRole('complementary', { name: 'Icon controls' })
    .getByLabel('Hex color', { exact: true })
    .fill('#705090');
  await expect(dialog.locator('[data-testid="drawer-preview"] svg')).toHaveAttribute(
    'stroke',
    '#705090',
  );
  await page
    .getByRole('complementary', { name: 'Icon controls' })
    .getByLabel('Stroke width')
    .fill('2');
  await expect(dialog.locator('[data-testid="drawer-preview"] svg')).toHaveAttribute(
    'stroke-width',
    '2',
  );
  await expect(page.locator('#camera svg')).toHaveAttribute('width', '20');
  await dialog.getByRole('button', { name: 'Close icon details' }).click();
  if (info.project.name === 'chromium') {
    await mkdir('.artifacts/previews', { recursive: true });
    await page.screenshot({ path: '.artifacts/previews/icons-desktop.png', fullPage: true });
  }
  await page.getByRole('link', { name: 'Squircle Icons home', exact: true }).click();
  await page.getByRole('link', { name: /Meet the library/ }).click();
  await expect(page.getByRole('heading', { name: 'Getting started', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Motion', exact: true })).toHaveCount(0);
  expect((await page.locator('pre').allTextContents()).join('\n')).not.toContain('/animated/');
  for (const path of ['/', '/icons', '/docs']) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (info.project.name === 'chromium')
      await page.screenshot({
        path: `.artifacts/previews/${path === '/' ? 'landing' : path.slice(1)}-mobile.png`,
        fullPage: true,
      });
  }
  await page.setViewportSize({ width: 700, height: 1000 });
  for (const path of ['/', '/icons', '/docs']) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  if (info.project.name === 'chromium') {
    await page.setViewportSize({ width: 1440, height: 1450 });
    await page.goto('/');
    await page.screenshot({ path: '.artifacts/previews/landing-desktop.png', fullPage: true });
    await page.screenshot({ path: '.artifacts/previews/landing-hero.png' });
  }
  expect(errors).toEqual([]);
});

test('homepage hero uses an icon-only grid with original Outline and Filled components', async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 2216, height: 1250 });
  await page.goto('/');
  const header = await page.locator('.site-header').boundingBox();
  const inner = await page.locator('.header-content').boundingBox();
  const main = await page.locator('main').boundingBox();
  const brand = await page
    .getByRole('link', { name: 'Squircle Icons home', exact: true })
    .boundingBox();
  expect(header!.x).toBe(0);
  expect(header!.width).toBe(2216);
  expect(inner!.width).toBe(1280);
  expect(brand!.x).toBe(main!.x);
  await expect(
    page.locator(
      '.collection-section, .collection-facts, .hero-texture, .release-pill, .icon-marquee, [data-testid="icon-showcase"], .faq-section',
    ),
  ).toHaveCount(0);
  await expect(page.locator('.hero-copy > p')).toHaveCSS('font-size', '14px');
  for (const action of await page.locator('.hero-actions a').all())
    await expect(action).toHaveCSS('font-size', '14px');
  const grid = page.getByTestId('hero-icon-grid');
  const cards = grid.locator('.hero-icon-card');
  await expect(cards).toHaveCount(128);
  expect(
    await cards.evaluateAll(
      (cards) => new Set(cards.map((card) => card.getBoundingClientRect().top.toFixed(1))).size,
    ),
  ).toBe(8);
  expect(
    await grid.locator('.hero-icon-grid').evaluate((el) => getComputedStyle(el).maskImage),
  ).toContain('linear-gradient');
  expect(await cards.allTextContents()).toEqual(Array(128).fill(''));
  await expect(cards.first().locator('svg')).toHaveCount(1);
  expect(
    await cards.evaluateAll((cards) =>
      [...new Set(cards.map((card) => card.getAttribute('data-icon')))].sort(),
    ),
  ).toEqual(
    approvedIcons
      .slice(0, 12)
      .map((icon: { name: string }) => icon.name)
      .sort(),
  );
  expect(await grid.locator('[data-style="filled"]').count()).toBeGreaterThan(0);
  expect(await grid.locator('[data-style="outline"]').count()).toBeGreaterThan(0);
  expect(
    await grid
      .locator('svg')
      .evaluateAll((icons) => icons.every((icon) => !!icon.querySelector('[data-part]'))),
  ).toBe(true);
  for (const width of [2216, 1440, 700, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const box = await cards.first().boundingBox();
    expect(box!.width).toBeCloseTo(box!.height, 0);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await cards.first().click();
  await expect(page).toHaveURL(/\/icons#align-center$/);
  await expect(page.getByRole('dialog', { name: 'AlignCenter', exact: true })).toBeVisible();
  if (info.project.name === 'chromium') {
    await page.goto('/');
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.screenshot({
      path: '.artifacts/previews/landing-grid-desktop.png',
      fullPage: false,
    });
  }
});

test('hero grid cycles random previews and continues during hover, preserves the focused card and respects offscreen/reduced motion', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Math.random = () => 0.3;
    const starts: number[] = [];
    Object.defineProperty(window, '__fadeStarts', { value: starts });
    document.addEventListener('transitionstart', (event) => {
      const transition = event as TransitionEvent;
      if (
        transition.propertyName === 'opacity' &&
        transition.target instanceof Element &&
        transition.target.matches('.hero-icon-card.fading')
      )
        starts.push(performance.now());
    });
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const grid = page.getByTestId('hero-icon-grid');
  const signature = () =>
    grid
      .locator('.hero-icon-card')
      .evaluateAll((cards) =>
        cards
          .map((card) => `${card.getAttribute('data-icon')}:${card.getAttribute('data-style')}`)
          .join(','),
      );
  await expect(grid.getByRole('button')).toHaveCount(0);
  await expect
    .poll(() =>
      grid
        .locator('.hero-icon-card.fading')
        .evaluateAll(
          (cards) => new Set(cards.map((card) => card.getBoundingClientRect().top.toFixed(1))).size,
        ),
    )
    .toBe(8);
  await page.mouse.move(0, 0);
  await expect.poll(() => grid.locator('.hero-icon-card.fading').count()).toBeGreaterThanOrEqual(2);
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { __fadeStarts: number[] }).__fadeStarts.length),
    )
    .toBeGreaterThanOrEqual(2);
  const starts = await page.evaluate(
    () => (window as unknown as { __fadeStarts: number[] }).__fadeStarts,
  );
  expect(starts[1] - starts[0]).toBeGreaterThan(150);
  let before = await signature();
  await expect.poll(signature, { timeout: 8000 }).not.toBe(before);
  const focused = grid.locator('.hero-icon-card').first();
  await focused.focus();
  const focusedHref = await focused.getAttribute('href');
  before = await signature();
  await expect.poll(signature, { timeout: 8000 }).not.toBe(before);
  await expect(focused).toHaveAttribute('href', focusedHref!);
  await page.getByRole('link', { name: 'Squircle Icons home', exact: true }).focus();
  await focused.hover();
  before = await signature();
  await expect.poll(signature, { timeout: 8000 }).not.toBe(before);
  await page.mouse.move(0, 0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(grid.locator('.hero-icon-card').first()).toHaveCSS('transition-duration', '0s');
  before = await signature();
  await page.waitForTimeout(1200);
  expect(await signature()).toBe(before);
  await expect(grid.locator('.hero-icon-card').first()).toHaveCSS('transition-duration', '0s');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page
    .getByRole('heading', { name: 'Something small.', exact: false })
    .scrollIntoViewIfNeeded();
  await expect(grid).not.toBeInViewport();
  before = await signature();
  await page.waitForTimeout(1200);
  expect(await signature()).toBe(before);
  await page.getByRole('link', { name: /Explore the icons/ }).click();
  await page.waitForTimeout(1200);
  expect(errors).toEqual([]);
});

test('a faded card holds before replacement and keyboard focus cancels the queued change', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/');
  await page.mouse.move(0, 0);
  const grid = page.getByTestId('hero-icon-grid');
  const outgoing = grid.locator('.hero-icon-card.fading').first();
  await expect(outgoing).toBeAttached();
  // Pin this card, then finish only its fade-out to inspect the transparent hold.
  const card = await outgoing.elementHandle();
  const testTime = new Date('2026-01-01T00:00:00Z');
  await page.clock.install({ time: testTime });
  await page.clock.pauseAt(new Date(testTime.getTime() + 100));
  const oldIcon = await card!.getAttribute('data-icon');
  await card!.evaluate((el) => el.getAnimations().forEach((animation) => animation.finish()));
  await expect.poll(() => card!.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
  await page.clock.runFor(200);
  expect(await card!.getAttribute('data-icon')).toBe(oldIcon);
  expect(await card!.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
  await card!.focus();
  await page.clock.runFor(1500);
  expect(await card!.getAttribute('data-icon')).toBe(oldIcon);
  await expect.poll(() => card!.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
});

test('soft top light flows rightward in both themes and respects reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/');
  const grid = page.getByTestId('hero-icon-grid');
  const aura = page.getByTestId('hero-aura');
  const glass = page.locator('.header-content');
  const headerBounds = await page.locator('.site-header').boundingBox();
  const auraBounds = await aura.boundingBox();
  const gridBounds = await grid.boundingBox();
  expect(auraBounds!.x).toBeCloseTo(0);
  expect(auraBounds!.width).toBe(1440);
  expect(auraBounds!.y).toBeCloseTo(headerBounds!.y);
  expect(gridBounds!.y).toBeGreaterThan(auraBounds!.y);
  await expect(aura).toHaveCSS('mask-image', /radial-gradient/);
  await expect(aura).toHaveCSS('overflow', 'clip');
  await expect(glass).toHaveCSS('backdrop-filter', 'blur(20px)');
  await expect(glass).toHaveCSS('background-color', /\/ 0\.45\)/);
  await expect(glass).toHaveCSS('border-radius', '999px');
  await expect(aura).toHaveAttribute('aria-hidden', 'true');
  await expect(aura).toHaveCSS('pointer-events', 'none');
  const colors = aura.locator('.glow-colors');
  await expect(colors).toHaveCSS('animation-duration', '40s');
  await expect(colors).toHaveCSS('animation-timing-function', 'linear');
  await expect(colors).toHaveCSS('animation-play-state', 'running');
  const before = await colors.evaluate(
    (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41,
  );
  await expect
    .poll(() => colors.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41))
    .toBeGreaterThan(before);
  const lightMask = await aura.evaluate((el) => getComputedStyle(el).maskImage);
  await page
    .getByRole('heading', { name: 'Something small.', exact: false })
    .scrollIntoViewIfNeeded();
  await expect(colors).toHaveCSS('animation-play-state', 'paused');
  await page.getByRole('heading', { level: 1 }).scrollIntoViewIfNeeded();
  await expect(colors).toHaveCSS('animation-play-state', 'running');
  await expect(page.locator('.aura-waves, .aura-wave')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(aura).toBeVisible();
  await expect(colors).toHaveCSS('animation-name', 'none');
  await page.getByRole('button', { name: /^Theme:/ }).click();
  await page.getByRole('menuitemradio', { name: 'Dark', exact: true }).click();
  await expect(glass).toHaveCSS('background-color', /\/ 0\.45\)/);
  const darkMask = await aura.evaluate((el) => getComputedStyle(el).maskImage);
  expect(darkMask).toMatch(/radial-gradient/);
  expect(darkMask).not.toBe(lightMask);
  await expect(colors).toHaveCSS('animation-name', 'none');
});
