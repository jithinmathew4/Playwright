import { expect, test } from '@playwright/test';

const URL = 'https://the-internet.herokuapp.com/nested_frames';

test.beforeEach(async ({ page }) => {
  await page.goto(URL);
});

test('top frame contains left, middle and right frames', async ({ page }) => {
  const top = page.frameLocator('frame[name="frame-top"]');

  await expect(top.frameLocator('frame[name="frame-left"]').locator('body')).toHaveText('LEFT');
  await expect(top.frameLocator('frame[name="frame-middle"]').locator('#content')).toHaveText('MIDDLE');
  await expect(top.frameLocator('frame[name="frame-right"]').locator('body')).toHaveText('RIGHT');
});

test('bottom frame shows BOTTOM', async ({ page }) => {
  await expect(page.frameLocator('frame[name="frame-bottom"]').locator('body')).toHaveText('BOTTOM');
});

test('frame hierarchy is correct', async ({ page }) => {
  const top = page.frame({ name: 'frame-top' });
  const middle = page.frame({ name: 'frame-middle' });

  expect(top).not.toBeNull();
  expect(middle?.parentFrame()).toBe(top);
  expect(top!.childFrames().map((f) => f.name())).toEqual([
    'frame-left',
    'frame-middle',
    'frame-right',
  ]);
  expect(page.frame({ name: 'frame-bottom' })?.parentFrame()).toBe(page.mainFrame());
});
