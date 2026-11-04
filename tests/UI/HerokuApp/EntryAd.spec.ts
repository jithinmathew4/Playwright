import { expect, test } from '@playwright/test';

const URL = 'https://the-internet.herokuapp.com/entry_ad';

test.beforeEach(async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#modal')).toBeVisible();
});

test('ad is displayed on page load', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Entry Ad' })).toBeVisible();
  await expect(page.locator('.modal-title')).toHaveText('This is a modal window');
  await expect(page.locator('.modal-body')).toContainText("It's commonly used to encourage a user to take an action");
  await expect(page.locator('.modal-footer')).toHaveText('Close');
  await expect(page.locator('#page-footer')).toBeHidden();
});

test('ad can be closed with the Close link', async ({ page }) => {
  await page.locator('.modal-footer p').click();

  await expect(page.locator('#modal')).toBeHidden();
  await expect(page.locator('#page-footer')).toBeVisible();
});

test('ad can be closed by clicking outside of it', async ({ page }) => {
  await page.locator('.underlay').click({ position: { x: 10, y: 10 } });

  await expect(page.locator('#modal')).toBeHidden();
});

test('ad stays open when clicking inside of it', async ({ page }) => {
  await page.locator('.modal-body').click();

  await expect(page.locator('#modal')).toBeVisible();
});

test('closed ad does not appear on reload', async ({ page }) => {
  const dismissed = page.waitForResponse('**/entry_ad');
  await page.locator('.modal-footer p').click();
  await dismissed;

  await page.reload();

  // The ad is shown 500ms after load, so wait past that before checking it stayed hidden
  await page.waitForTimeout(1000);
  await expect(page.locator('#modal')).toBeHidden();
});
