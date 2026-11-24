import { expect, test } from '@playwright/test';

const URL = 'https://the-internet.herokuapp.com/infinite_scroll';

test.beforeEach(async ({ page }) => {
  await page.goto(URL);
});

test('page loads with heading and initial content', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Infinite Scroll' })).toBeVisible();
  await expect(page.locator('.jscroll-added').first()).toBeVisible();
});

test('scrolling to the bottom loads more paragraphs', async ({ page }) => {
  const paragraphs = page.locator('.jscroll-added');
  await expect(paragraphs.first()).toBeVisible();
  const initial = await paragraphs.count();

  await page.mouse.wheel(0, 10000);

  await expect.poll(() => paragraphs.count()).toBeGreaterThan(initial);
});

test('repeated scrolling keeps appending content', async ({ page }) => {
  const paragraphs = page.locator('.jscroll-added');
  await expect(paragraphs.first()).toBeVisible();

  let previous = await paragraphs.count();
  for (let i = 0; i < 3; i++) {
    await expect
      .poll(async () => {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        return paragraphs.count();
      })
      .toBeGreaterThan(previous);
    previous = await paragraphs.count();
  }

  expect(previous).toBeGreaterThanOrEqual(4);
  await expect(paragraphs.last()).not.toBeEmpty();
});

test('page height grows as content loads', async ({ page }) => {
  await expect(page.locator('.jscroll-added').first()).toBeVisible();
  const initialHeight = await page.evaluate(() => document.body.scrollHeight);

  await page.mouse.wheel(0, 10000);

  await expect
    .poll(() => page.evaluate(() => document.body.scrollHeight))
    .toBeGreaterThan(initialHeight);
});
