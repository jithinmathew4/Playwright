import { expect, test } from '@playwright/test';

test.describe('Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/drag_and_drop');
    await expect(page.getByRole('heading', { name: 'Drag and Drop' })).toBeVisible();
  });

  test('columns start in A, B order', async ({ page }) => {
    await expect(page.locator('#column-a header')).toHaveText('A');
    await expect(page.locator('#column-b header')).toHaveText('B');
  });

  test('dragging A onto B swaps the columns', async ({ page }) => {
    await page.locator('#column-a').dragTo(page.locator('#column-b'));

    await expect(page.locator('#column-a header')).toHaveText('B');
    await expect(page.locator('#column-b header')).toHaveText('A');
  });

  test('dragging back restores the original order', async ({ page }) => {
    await page.locator('#column-a').dragTo(page.locator('#column-b'));
    await page.locator('#column-b').dragTo(page.locator('#column-a'));

    await expect(page.locator('#column-a header')).toHaveText('A');
    await expect(page.locator('#column-b header')).toHaveText('B');
  });
});
