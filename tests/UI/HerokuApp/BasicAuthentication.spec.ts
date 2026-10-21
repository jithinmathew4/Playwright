
import { test, expect } from '@playwright/test';

test('should authenticate with valid basic auth credentials', async ({
  browser,
}) => {
  const context = await browser.newContext({
    httpCredentials: {
      username: 'admin',
      password: 'admin',
    },
  });

  const page = await context.newPage();

  await page.goto('https://the-internet.herokuapp.com/basic_auth');

  await expect(
    page.getByRole('heading', { name: 'Basic Auth' })
  ).toBeVisible();

  await expect(
    page.getByText('Congratulations! You must have the proper credentials.')
  ).toBeVisible();

  await context.close();
});
