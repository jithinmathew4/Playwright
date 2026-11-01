import { expect, test } from '@playwright/test';

test.describe('Dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/dropdown');
    await expect(page.getByRole('heading', { name: 'Dropdown List' })).toBeVisible();
  });

  test('placeholder is selected by default and disabled', async ({ page }) => {
    const dropdown = page.locator('#dropdown');

    await expect(dropdown).toHaveValue('');
    await expect(dropdown.locator('option:checked')).toHaveText('Please select an option');
    await expect(dropdown.locator('option[value=""]')).toBeDisabled();
  });

  test('lists the expected options', async ({ page }) => {
    await expect(page.locator('#dropdown option')).toHaveText([
      'Please select an option',
      'Option 1',
      'Option 2',
    ]);
  });

  test('selecting Option 1 by label', async ({ page }) => {
    const dropdown = page.locator('#dropdown');
    await dropdown.selectOption({ label: 'Option 1' });

    await expect(dropdown).toHaveValue('1');
    await expect(dropdown.locator('option:checked')).toHaveText('Option 1');
  });

  test('selecting Option 2 by value', async ({ page }) => {
    const dropdown = page.locator('#dropdown');
    await dropdown.selectOption('2');

    await expect(dropdown).toHaveValue('2');
    await expect(dropdown.locator('option:checked')).toHaveText('Option 2');
  });

  test('switching between options updates the selection', async ({ page }) => {
    const dropdown = page.locator('#dropdown');
    await dropdown.selectOption('1');
    await dropdown.selectOption('2');

    await expect(dropdown).toHaveValue('2');
  });
});
