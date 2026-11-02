import { expect, Page, test } from '@playwright/test';

const URL = 'https://the-internet.herokuapp.com/dynamic_content';

const rows = (page: Page) => page.locator('.example .row .row');

async function getRowTexts(page: Page) {
  return (await rows(page).locator('.large-10').allInnerTexts()).map((t) => t.trim());
}

test('page shows three rows with an avatar and text', async ({ page }) => {
  await page.goto(URL);

  await expect(page.getByRole('heading', { name: 'Dynamic Content' })).toBeVisible();
  await expect(rows(page)).toHaveCount(3);

  for (const row of await rows(page).all()) {
    await expect(row.locator('img')).toHaveAttribute('src', /\/img\/avatars\/.+\.jpg$/);
    await expect(row.locator('.large-10')).not.toBeEmpty();
  }
});

test('content changes on reload', async ({ page }) => {
  await page.goto(URL);
  const before = await getRowTexts(page);

  await page.reload();
  const after = await getRowTexts(page);

  // Text is randomly generated, so at least one row should differ
  expect(after).not.toEqual(before);
});

test('static mode keeps the first two rows unchanged', async ({ page }) => {
  await page.goto(URL);
  await page.getByRole('link', { name: 'click here' }).click();
  await expect(page).toHaveURL(/with_content=static/);

  const before = await getRowTexts(page);
  const beforeImgs = await rows(page).locator('img').evaluateAll((imgs) => imgs.map((i) => i.getAttribute('src')));

  await page.reload();
  const after = await getRowTexts(page);
  const afterImgs = await rows(page).locator('img').evaluateAll((imgs) => imgs.map((i) => i.getAttribute('src')));

  expect(after.slice(0, 2)).toEqual(before.slice(0, 2));
  expect(afterImgs.slice(0, 2)).toEqual(beforeImgs.slice(0, 2));
  // Only the third row stays dynamic
  expect(after[2]).not.toEqual(before[2]);
});
