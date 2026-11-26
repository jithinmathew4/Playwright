import { expect, test } from '@playwright/test';

const URL = 'https://the-internet.herokuapp.com/inputs';

test.beforeEach(async ({ page }) => {
  await page.goto(URL);
});

test('page loads with heading and a number input', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Inputs' })).toBeVisible();
  const input = page.locator('input[type="number"]');
  await expect(input).toBeVisible();
  await expect(input).toHaveValue('');
});

test('accepts a typed positive number', async ({ page }) => {
  const input = page.locator('input[type="number"]');
  await input.fill('12345');
  await expect(input).toHaveValue('12345');
});

test('accepts negative and decimal numbers', async ({ page }) => {
  const input = page.locator('input[type="number"]');

  await input.fill('-42');
  await expect(input).toHaveValue('-42');

  await input.fill('3.14');
  await expect(input).toHaveValue('3.14');
});

test('ignores non-numeric characters', async ({ page }) => {
  const input = page.locator('input[type="number"]');
  await input.pressSequentially('abc');
  await expect(input).toHaveValue('');
});

test('ArrowUp and ArrowDown change the value by one', async ({ page }) => {
  const input = page.locator('input[type="number"]');
  await input.fill('5');

  await input.press('ArrowUp');
  await expect(input).toHaveValue('6');

  await input.press('ArrowDown');
  await input.press('ArrowDown');
  await expect(input).toHaveValue('4');
});

test('ArrowUp on an empty input starts from 1', async ({ page }) => {
  const input = page.locator('input[type="number"]');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('1');
});

test('clearing the input empties the value', async ({ page }) => {
  const input = page.locator('input[type="number"]');
  await input.fill('99');
  await input.clear();
  await expect(input).toHaveValue('');
});
