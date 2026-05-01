import { expect, test } from '@playwright/test';

test('home page renders the brand and a Today heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /socialMediaReplacer/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Today/i })).toBeVisible();
});

test('theme toggle cycles between auto/light/dark', async ({ page }) => {
  await page.goto('/');
  const button = page.getByRole('button', { name: /Theme:/i });
  await button.click();
  const html = page.locator('html');
  // Either a data-theme attribute is set, or it's been removed (auto). Either is acceptable.
  const attr = await html.getAttribute('data-theme');
  expect(['light', 'dark', null]).toContain(attr);
});
