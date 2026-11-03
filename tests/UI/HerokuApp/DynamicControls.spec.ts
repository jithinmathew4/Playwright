import { expect, test } from '@playwright/test';

const URL = 'https://the-internet.herokuapp.com/dynamic_controls';

test.beforeEach(async ({ page }) => {
  await page.goto(URL);
});

test('page shows the initial checkbox and disabled input', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Dynamic Controls' })).toBeVisible();
  await expect(page.getByRole('checkbox')).toBeVisible();
  await expect(page.getByRole('checkbox')).not.toBeChecked();
  await expect(page.getByRole('textbox')).toBeDisabled();
  await expect(page.locator('#loading')).toBeHidden();
});

test('checkbox can be toggled', async ({ page }) => {
  const checkbox = page.getByRole('checkbox');

  await checkbox.check();
  await expect(checkbox).toBeChecked();

  await checkbox.uncheck();
  await expect(checkbox).not.toBeChecked();
});

test('checkbox can be removed and added back', async ({ page }) => {
  await page.getByRole('button', { name: 'Remove' }).click();
  await expect(page.locator('#checkbox-example #loading')).toBeVisible();

  await expect(page.locator('#message')).toHaveText("It's gone!");
  await expect(page.getByRole('checkbox')).toHaveCount(0);
  await expect(page.locator('#checkbox-example #loading')).toBeHidden();

  await page.getByRole('button', { name: 'Add' }).click();

  await expect(page.locator('#message')).toHaveText("It's back!");
  await expect(page.getByRole('checkbox')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remove' })).toBeVisible();
});

test('input can be enabled and disabled', async ({ page }) => {
  const input = page.getByRole('textbox');

  await page.getByRole('button', { name: 'Enable' }).click();
  await expect(page.locator('#input-example #loading')).toBeVisible();

  await expect(page.locator('#message')).toHaveText("It's enabled!");
  await expect(input).toBeEnabled();

  await input.fill('Playwright');
  await expect(input).toHaveValue('Playwright');

  await page.getByRole('button', { name: 'Disable' }).click();

  await expect(page.locator('#message')).toHaveText("It's disabled!");
  await expect(input).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Enable' })).toBeVisible();
});
