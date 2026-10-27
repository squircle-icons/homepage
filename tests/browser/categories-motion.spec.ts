import { test, expect } from '@playwright/test';

test('category highlight follows rapid changes and reduced motion without shifting tabs', async ({
  page,
}) => {
  await page.goto('/icons');
  const tabs = page.getByRole('tablist', { name: 'Icon categories' });
  await tabs.evaluate(async (element) => {
    await Promise.all(
      element.parentElement!.getAnimations().map((animation) => animation.finished),
    );
  });
  const allBox = await tabs.getByRole('tab', { name: 'All', exact: true }).boundingBox();
  for (const name of ['Nature', 'Media', 'Files']) {
    await tabs.getByRole('tab', { name, exact: true }).click();
  }
  await expect(page.getByRole('tabpanel')).toHaveAccessibleName('Files');
  await expect(page.locator('.icon-button .icon-name')).toHaveText(['copy', 'folder']);
  await expect
    .poll(() =>
      tabs.evaluate((element) => {
        const indicator = getComputedStyle(element, '::before');
        return Math.abs(new DOMMatrix(indicator.transform).m41 - parseFloat(indicator.width) * 3);
      }),
    )
    .toBeLessThan(1);
  expect(await tabs.getByRole('tab', { name: 'All', exact: true }).boundingBox()).toEqual(allBox);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await tabs.getByRole('tab', { name: 'All', exact: true }).click();
  expect(
    await tabs.evaluate((element) => getComputedStyle(element, '::before').transitionDuration),
  ).toBe('0s');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
