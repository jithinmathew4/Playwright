import { expect, test } from '@playwright/test';

const URL = 'https://the-internet.herokuapp.com/disappearing_elements';
const STABLE_ITEMS = ['Home', 'About', 'Contact Us', 'Portfolio'];

test('stable menu items are always shown', async ({ page }) => {
  await page.goto(URL);

  await expect(page.getByRole('heading', { name: 'Disappearing Elements' })).toBeVisible();

  const menu = page.locator('ul li a');
  for (const name of STABLE_ITEMS) {
    await expect(menu.filter({ hasText: name })).toBeVisible();
  }

  // Gallery is randomly added on each load, so the menu has 4 or 5 items
  const count = await menu.count();
  expect([4, 5]).toContain(count);
});

test('Gallery item appears and disappears across reloads', async ({ page }) => {
  await page.goto(URL);

  const gallery = page.locator('ul li a', { hasText: 'Gallery' });
  const seen = new Set<boolean>();

  // Reload until both states have been observed (the site picks randomly)
  for (let i = 0; i < 20 && seen.size < 2; i++) {
    seen.add((await gallery.count()) === 1);
    await page.reload();
  }

  expect(seen.size).toBe(2);
});
