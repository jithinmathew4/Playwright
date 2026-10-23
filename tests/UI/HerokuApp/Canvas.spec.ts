import { expect, test } from '@playwright/test';

test('draws and submits text on the canvas', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/canvas');

  await expect(page).toHaveTitle('The Internet');
  await expect(
    page.getByRole('heading', { name: 'Canvas' })
  ).toBeVisible();

  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();

  const imageBeforeInteraction = await canvas.evaluate((element) =>
    (element as HTMLCanvasElement).toDataURL()
  );

  await canvas.click({ position: { x: 100, y: 100 } });
  await page.keyboard.type('Playwright canvas test');
  await page.keyboard.press('Enter');

  await expect(page.getByText('Submitted: Playwright canvas test')).toBeVisible();
  await expect
    .poll(() =>
      canvas.evaluate((element) =>
        (element as HTMLCanvasElement).toDataURL()
      )
    )
    .not.toBe(imageBeforeInteraction);
});