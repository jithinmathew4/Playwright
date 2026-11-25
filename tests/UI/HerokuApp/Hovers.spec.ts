import { expect, test } from '@playwright/test';

const URL = 'https://the-internet.herokuapp.com/hovers';

test.beforeEach(async ({ page }) => {
  await page.goto(URL);
});

test('page loads with heading and three user figures', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Hovers' })).toBeVisible();
  await expect(page.locator('.figure')).toHaveCount(3);
});

test('captions are hidden before hovering', async ({ page }) => {
  const captions = page.locator('.figcaption');
  await expect(captions).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    await expect(captions.nth(i)).toBeHidden();
  }
});

for (const index of [1, 2, 3]) {
  test(`hovering user${index} shows name and profile link`, async ({ page }) => {
    const figure = page.locator('.figure').nth(index - 1);
    const caption = figure.locator('.figcaption');

    await figure.hover();

    await expect(caption).toBeVisible();
    await expect(caption.getByRole('heading')).toHaveText(`name: user${index}`);
    await expect(caption.getByRole('link', { name: 'View profile' })).toHaveAttribute(
      'href',
      `/users/${index}`,
    );
  });
}

test('only the hovered figure shows its caption', async ({ page }) => {
  const figures = page.locator('.figure');

  await figures.nth(0).hover();
  await expect(figures.nth(0).locator('.figcaption')).toBeVisible();
  await expect(figures.nth(1).locator('.figcaption')).toBeHidden();

  await figures.nth(1).hover();
  await expect(figures.nth(1).locator('.figcaption')).toBeVisible();
  await expect(figures.nth(0).locator('.figcaption')).toBeHidden();
});

test('moving the mouse away hides the caption', async ({ page }) => {
  const figure = page.locator('.figure').first();
  await figure.hover();
  await expect(figure.locator('.figcaption')).toBeVisible();

  await page.mouse.move(0, 0);
  await expect(figure.locator('.figcaption')).toBeHidden();
});

test('clicking View profile navigates to the user page', async ({ page }) => {
  const figure = page.locator('.figure').nth(1);
  await figure.hover();
  await figure.getByRole('link', { name: 'View profile' }).click();

  await expect(page).toHaveURL(/\/users\/2$/);
});
