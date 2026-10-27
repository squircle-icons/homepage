import { test, expect } from '@playwright/test';

test('page entrances settle without replaying when gallery controls change', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.locator('.hero-copy').evaluate(async (node) => {
    await Promise.all(node.getAnimations({ subtree: true }).map((animation) => animation.finished));
  });
  await expect(page.locator('.hero-copy h1')).toHaveCSS('opacity', '1');
  await page.getByRole('link', { name: 'Explore the icons', exact: true }).click();
  const sidebar = page.getByRole('complementary', { name: 'Icon controls' });
  await sidebar.evaluate(async (node) => {
    await Promise.all(node.getAnimations().map((animation) => animation.finished));
  });
  await expect(sidebar).toHaveCSS('transform', 'none');
  await page.getByRole('searchbox').fill('camera');
  await expect(page.getByRole('button', { name: 'View camera icon' })).toBeVisible();
  await expect(page.locator('#category-results')).toHaveCSS('opacity', '1');
  await expect(page.locator('#category-results')).toHaveCSS('transform', 'none');
  await sidebar.getByLabel('Export size').fill('32');
  await expect(page.locator('#camera svg')).toHaveAttribute('width', '32');
});

test('reduced motion shows Home and Icons immediately without entry movement', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of ['/', '/icons']) {
    await page.goto(path);
    const entries = page.locator('.page-appear');
    expect(await entries.count()).toBeGreaterThan(0);
    for (const entry of await entries.all()) {
      await expect(entry).toHaveCSS('animation-name', 'none');
      await expect(entry).toHaveCSS('opacity', '1');
      await expect(entry).toHaveCSS('transform', 'none');
    }
  }
});
