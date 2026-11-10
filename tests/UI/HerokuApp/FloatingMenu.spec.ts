import { expect, test } from '@playwright/test';

const URL = 'https://the-internet.herokuapp.com/floating_menu';
const MENU_ITEMS = ['Home', 'News', 'Contact', 'About'];

test.beforeEach(async ({ page }) => {
  await page.goto(URL);
});

test('menu is visible on page load with all items', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Floating Menu' })).toBeVisible();

  const links = page.locator('#menu a');
  await expect(links).toHaveText(MENU_ITEMS);
  await expect(page.locator('#menu')).toBeInViewport();
});

test('menu stays in the viewport after scrolling to the bottom', async ({ page }) => {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

  const menu = page.locator('#menu');
  await expect(menu).toBeInViewport();
  for (const name of MENU_ITEMS) {
    await expect(menu.getByRole('link', { name })).toBeInViewport();
  }
});

test('menu stays in the viewport after scrolling with the mouse wheel', async ({ page }) => {
  await page.mouse.move(400, 400);
  await page.mouse.wheel(0, 2000);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

  await expect(page.locator('#menu')).toBeInViewport();
});

for (const name of MENU_ITEMS) {
  test(`clicking "${name}" updates the URL hash`, async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await page.locator('#menu').getByRole('link', { name }).click();

    await expect(page).toHaveURL(new RegExp(`#${name.toLowerCase()}$`));
  });
}
