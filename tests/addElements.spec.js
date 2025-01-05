import { test, expect } from '@playwright/test';

test('add and remove elements', async ({ page }) => {
  // Navigate to the Add/Remove Elements page
  await page.goto('https://the-internet.herokuapp.com/add_remove_elements/');

  // Add elements
  await page.click('button[onclick="addElement()"]');
  await page.click('button[onclick="addElement()"]');

  // Verify that two elements were added
  const deleteButtons = page.locator('.added-manually');
  expect(await deleteButtons.count()).toBe(2);

  // Remove one element
  await deleteButtons.first().click();

  // Verify that one element remains
  expect(await deleteButtons.count()).toBe(1);
});