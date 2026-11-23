import { expect, test } from '@playwright/test';

const URL = 'https://the-internet.herokuapp.com/horizontal_slider';

test.beforeEach(async ({ page }) => {
  await page.goto(URL);
});

test('page loads with heading and slider at 0', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Horizontal Slider' })).toBeVisible();

  const slider = page.getByRole('slider');
  await expect(slider).toHaveAttribute('min', '0.0');
  await expect(slider).toHaveAttribute('max', '5.0');
  await expect(slider).toHaveAttribute('step', '0.5');
  await expect(slider).toHaveValue('0');
  await expect(page.locator('#range')).toHaveText('0');
});

test('ArrowRight moves the slider in 0.5 steps', async ({ page }) => {
  const slider = page.getByRole('slider');
  await slider.focus();

  for (const expected of ['0.5', '1', '1.5', '2']) {
    await slider.press('ArrowRight');
    await expect(slider).toHaveValue(expected);
    await expect(page.locator('#range')).toHaveText(expected);
  }
});

test('ArrowLeft decreases the value', async ({ page }) => {
  const slider = page.getByRole('slider');
  await slider.focus();
  await slider.press('End');
  await expect(page.locator('#range')).toHaveText('5');

  await slider.press('ArrowLeft');
  await expect(slider).toHaveValue('4.5');
  await expect(page.locator('#range')).toHaveText('4.5');
});

test('Home and End jump to min and max', async ({ page }) => {
  const slider = page.getByRole('slider');
  await slider.focus();

  await slider.press('End');
  await expect(page.locator('#range')).toHaveText('5');

  await slider.press('Home');
  await expect(page.locator('#range')).toHaveText('0');
});

test('value cannot go beyond the bounds', async ({ page }) => {
  const slider = page.getByRole('slider');
  await slider.focus();

  await slider.press('ArrowLeft');
  await expect(page.locator('#range')).toHaveText('0');

  await slider.press('End');
  await slider.press('ArrowRight');
  await expect(page.locator('#range')).toHaveText('5');
});

test('dragging the slider with the mouse updates the value', async ({ page }) => {
  const slider = page.getByRole('slider');
  const box = await slider.boundingBox();
  if (!box) throw new Error('Slider not visible');

  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + 2, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 2, y, { steps: 10 });
  await page.mouse.up();

  await expect(slider).toHaveValue('5');
  await expect(page.locator('#range')).toHaveText('5');
});
