import { test, expect } from '@playwright/test';

test('custom color picker keeps typed, preset and dragged colors in sync with icons and exports', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 2216, height: 1250 });
  await page.goto('/icons');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'View camera icon', exact: true }).click();
  const details = page.getByRole('dialog', { name: 'Camera', exact: true });
  await expect(details).toBeVisible();
  const hex = page.getByRole('combobox', { name: 'Hex color', exact: true });
  await hex.fill('#197065');
  await expect(page.locator('#camera svg')).toHaveAttribute('stroke', '#197065');
  await expect(details.locator('.usage-code')).toContainText('#197065');
  await hex.fill('#12');
  await hex.blur();
  await expect(hex).toHaveValue('#197065');
  await hex.click();
  await expect(page.getByRole('dialog', { name: 'Color picker', exact: true })).toBeVisible();
  await expect(hex).toBeFocused();
  await hex.fill('#112233');
  await expect(page.locator('#camera svg')).toHaveAttribute('stroke', '#112233');
  await hex.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Color picker', exact: true })).toHaveCount(0);
  await expect(details).toBeVisible();

  const trigger = page.getByRole('button', { name: 'Icon color', exact: true });
  await trigger.click();
  const picker = page.getByRole('dialog', { name: 'Color picker', exact: true });
  await expect(picker).toBeVisible();
  const anchor = (await page.locator('.color-picker-control').boundingBox())!;
  const panel = (await picker.boundingBox())!;
  expect(Math.abs(panel.x + panel.width - anchor.x - anchor.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(panel.y - anchor.y - anchor.height - 8)).toBeLessThanOrEqual(1);
  await expect(page.locator('.gallery-toolbar')).not.toHaveCSS('box-shadow', 'none');
  await expect(page.locator('.gallery-toolbar')).toHaveCSS('border-top-width', '1px');
  await picker.getByRole('button', { name: 'Use #F59E0B', exact: true }).click();
  await expect(hex).toHaveValue('#F59E0B');
  await expect(page.locator('#camera svg')).toHaveAttribute('stroke', '#f59e0b');
  const area = picker.getByRole('slider', { name: 'Saturation and brightness' });
  const box = (await area.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.4);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.2, { steps: 4 });
  await page.mouse.up();
  await expect(area).toHaveAttribute('aria-valuenow', '80');
  const dragged = await hex.inputValue();
  await expect(page.locator('#camera svg')).toHaveAttribute('stroke', dragged.toLowerCase());
  await expect(details.locator('.usage-code')).toContainText(dragged.toLowerCase());
  await area.press('ArrowLeft');
  await expect(area).toHaveAttribute('aria-valuenow', '79');
  await picker.getByRole('slider', { name: 'Hue', exact: true }).fill('180');
  await expect(hex).not.toHaveValue(dragged);
  await picker.getByRole('textbox', { name: 'Picker hex color', exact: true }).fill('#FFFFFF');
  await expect(hex).toHaveValue('#FFFFFF');
  await expect(page.locator('#camera svg')).toHaveAttribute('stroke', '#ffffff');
  await picker.getByRole('textbox', { name: 'Picker hex color', exact: true }).press('Escape');
  await expect(picker).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(details).toBeVisible();
  const search = (await page.locator('.search-field').boundingBox())!;
  expect(search.width).toBeLessThan(480);
  for (const width of [1280, 1100]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('Light has a white canvas and the hero dot texture fades over the aura', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  const dots = page.locator('.hero-dot-field');
  await expect(dots).toHaveAttribute('aria-hidden', 'true');
  expect(await dots.evaluate((element) => getComputedStyle(element).maskImage)).toContain(
    'radial-gradient',
  );
  await expect(page.locator('.glow-colors')).toHaveCSS('animation-name', 'none');
});
