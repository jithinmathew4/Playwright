import { expect, test } from '@playwright/test';

const URL = 'https://the-internet.herokuapp.com/iframe';

test.beforeEach(async ({ page }) => {
  await page.goto(URL);
});

test('page shows the TinyMCE editor heading', async ({ page }) => {
  await expect(page.locator('h3')).toHaveText('An iFrame containing the TinyMCE WYSIWYG Editor');
});

test('editor iframe shows default content', async ({ page }) => {
  const editor = page.frameLocator('#mce_0_ifr').locator('#tinymce');

  await expect(editor).toBeVisible();
  await expect(editor).toHaveText('Your content goes here.');
});

test('editor iframe is reachable as a Frame object', async ({ page }) => {
  const frame = page.mainFrame().childFrames()[0];

  expect(frame).toBeDefined();
  expect(frame!.parentFrame()).toBe(page.mainFrame());
  await expect(frame!.locator('body#tinymce p')).toHaveText('Your content goes here.');
});

test('editor toolbar and menu bar are rendered', async ({ page }) => {
  await expect(page.locator('.tox-menubar')).toBeVisible();
  await expect(page.locator('.tox-toolbar__primary')).toBeVisible();
});
