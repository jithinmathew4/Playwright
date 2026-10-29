import { expect, test } from '@playwright/test';

test('right-clicking the hot spot shows the context menu alert', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/context_menu');

  await expect(page.getByRole('heading', { name: 'Context Menu' })).toBeVisible();

  const hotSpot = page.locator('#hot-spot');
  await expect(hotSpot).toBeVisible();

  // Accept the JS alert as soon as it opens, otherwise it blocks the right-click
  let alertMessage = '';
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('alert');
    alertMessage = dialog.message();
    await dialog.accept();
  });

  await hotSpot.click({ button: 'right' });

  expect(alertMessage).toBe('You selected a context menu');
});
