import { expect,test} from '@playwright/test'

test.describe('My first test', () => {

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/);
});
});


