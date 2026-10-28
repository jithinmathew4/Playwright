import { test, expect } from '@playwright/test';

test('add and remove elements', async ({ page }) => {
  // Navigate to the Add/Remove Elements page
  await page.goto('https://the-internet.herokuapp.com/add_remove_elements/');

  // Add elements
  await page.getByRole('button', { name: 'Add Element' }).click();
  await page.getByRole('button', { name: 'Add Element' }).click();

  // Verify that two elements were added
  const deleteButtons = page.locator('.added-manually');
  await expect(deleteButtons).toHaveCount(2);

  // Remove one element
  await deleteButtons.first().click();

  // Verify that one element remains
  await expect(deleteButtons).toHaveCount(1);
});