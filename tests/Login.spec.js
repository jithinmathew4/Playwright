import { test, expect } from '@playwright/test';

test('Login', async ({ page }) => {

  await page.goto('https://www.saucedemo.com/');
    await page.fill('input[id="user-name"]', 'standard_user');
    await page.fill('//*[@id="password"]', 'secret_sauce');
    await page.waitForTimeout(8000);
    await page.click('input[id="login-button"]');
    await page.waitForTimeout(10000);
    const locator = page.locator('text=Products');
    await expect(locator).toBeVisible();
}
);
