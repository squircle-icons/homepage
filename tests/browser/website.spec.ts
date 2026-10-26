import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
test('landing, icons, and docs are usable on desktop and mobile', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    /Soft curves\.\s*Clear meaning\./,
  );
  await page.getByRole('link', { name: /Explore the icons/ }).click();
  await expect(page).toHaveURL(/\/icons$/);
  await expect(page.getByRole('button', { name: /Select / })).toHaveCount(6);
  await page.getByRole('searchbox').fill('gear');
  await expect(page.getByRole('button', { name: 'Select settings' })).toHaveCount(1);
  await page.getByRole('searchbox').fill('');
  await page.getByRole('button', { name: '20', exact: true }).click();
  await expect(page.locator('#camera .actual-preview svg')).toHaveAttribute('width', '20');
  await page.locator('#icon-color').fill('#705090');
  await expect(page.locator('#camera .actual-preview svg')).toHaveAttribute(
    'stroke',
    'currentColor',
  );
  await expect(page.locator('#camera .actual-preview svg')).toHaveCSS('color', 'rgb(112, 80, 144)');
  await page.locator('#icon-stroke').evaluate((element) => {
    const input = element as HTMLInputElement;
    input.value = '2';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(page.locator('#camera .actual-preview svg')).toHaveAttribute('stroke-width', '2');
  await page.getByRole('button', { name: '24', exact: true }).click();
  await page.locator('#icon-color').fill('#27272a');
  await page.locator('#icon-stroke').evaluate((element) => {
    const input = element as HTMLInputElement;
    input.value = '1.75';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.getByRole('button', { name: 'Open folder', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Close folder', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Ring bell', exact: true }).click();
  if (info.project.name === 'chromium') {
    await mkdir('.artifacts/previews', { recursive: true });
    await page.getByRole('button', { name: 'Reset bell', exact: true }).click();
    await page.screenshot({ path: '.artifacts/previews/icons-desktop.png', fullPage: true });
  }
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Docs' })
    .click();
  await expect(page.getByRole('heading', { name: 'A thoughtful starting point.' })).toBeVisible();
  for (const path of ['/', '/icons', '/docs']) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://127.0.0.1:4173' + path);
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
    await page.goto('http://127.0.0.1:4173' + path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  if (info.project.name === 'chromium') {
    await page.setViewportSize({ width: 1440, height: 1450 });
    await page.goto('http://127.0.0.1:4173/');
    await page.screenshot({ path: '.artifacts/previews/landing-desktop.png', fullPage: true });
    await page.screenshot({ path: '.artifacts/previews/landing-hero.png' });
  }
  expect(errors).toEqual([]);
});

test('landing playground responds to icon, color, motion, and code controls', async ({
  page,
}, info) => {
  await page.goto('http://127.0.0.1:4173/');
  const showcase = page.getByTestId('icon-showcase');
  await showcase.getByRole('button', { name: 'Toggle showcase folder' }).click();
  await expect(showcase.getByRole('button', { name: 'Toggle showcase folder' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await showcase.getByRole('button', { name: 'Ring showcase bell' }).click();
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
  const studio = page.getByTestId('hero-studio');
  await studio.getByRole('button', { name: 'heart', exact: true }).click();
  await expect(studio.locator('.canvas-heading')).toContainText('heart.svg');
  await studio.getByRole('button', { name: 'Indigo', exact: true }).click();
  await expect(studio.locator('.icon-canvas svg')).toHaveCSS('color', 'rgb(79, 70, 229)');
  await studio.locator('#studio-stroke').evaluate((element) => {
    const input = element as HTMLInputElement;
    input.value = '2';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(studio.locator('.icon-canvas svg')).toHaveAttribute('stroke-width', '2');
  await studio.getByRole('button', { name: 'In your app', exact: true }).click();
  await expect(studio.locator('pre')).toContainText('squircle-icons-svelte/heart');
  await studio.getByRole('button', { name: 'In motion', exact: true }).click();
  await studio.getByRole('button', { name: 'Toggle playground folder' }).click();
  await expect(studio.getByRole('button', { name: 'Toggle playground folder' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await studio.getByRole('button', { name: 'Ring playground bell' }).click();
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
  const question = page.locator('summary').filter({ hasText: 'Do animated icons always move?' });
  await question.click();
  await expect(page.locator('details[open]')).toContainText('Nothing plays on mount');
  if (info.project.name === 'chromium') {
    await studio.screenshot({ path: '.artifacts/previews/playground-motion.png' });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const view of ['The collection', 'In motion', 'In your app']) {
    await studio.getByRole('button', { name: view, exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});
