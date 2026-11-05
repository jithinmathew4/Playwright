import { expect, Page, test } from '@playwright/test';

const URL = 'https://the-internet.herokuapp.com/exit_intent';

// The page uses ouibounce, which listens for `mouseleave` on <html> and only
// fires when the cursor leaves through the top of the viewport (low clientY).
async function triggerExitIntent(page: Page, clientY = 0) {
  await page.mouse.move(300, 300);
  await page.locator('html').dispatchEvent('mouseleave', { clientX: 300, clientY });
}

test.beforeEach(async ({ page }) => {
  await page.goto(URL);
});

test('modal is hidden on page load', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Exit Intent' })).toBeVisible();
  await expect(page.locator('#ouibounce-modal')).toBeHidden();
});

test('modal appears when the mouse leaves through the top of the viewport', async ({ page }) => {
  await triggerExitIntent(page);

  const modal = page.locator('#ouibounce-modal');
  await expect(modal).toBeVisible();
  await expect(modal.locator('.modal-title')).toHaveText('This is a modal window');
  await expect(modal.locator('.modal-body')).toContainText("It's commonly used to encourage a user to take an action");
});

test('modal does not appear when the mouse leaves away from the top', async ({ page }) => {
  await triggerExitIntent(page, 500);

  await page.waitForTimeout(1000);
  await expect(page.locator('#ouibounce-modal')).toBeHidden();
});

test('modal can be closed with the Close link', async ({ page }) => {
  await triggerExitIntent(page);
  await expect(page.locator('#ouibounce-modal')).toBeVisible();

  await page.locator('#ouibounce-modal .modal-footer p').click();

  await expect(page.locator('#ouibounce-modal')).toBeHidden();
});
