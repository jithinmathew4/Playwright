import { expect, test } from '@playwright/test';

test('identifies broken images on the page', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/broken_images');

  const images = page.locator(
    'img[src="asdf.jpg"], img[src="hjkl.jpg"], img[src="img/avatar-blank.jpg"]'
  );
  await expect(images).toHaveCount(3);

  const brokenImageSources = await images.evaluateAll((elements) =>
    elements
      .filter((element) => (element as HTMLImageElement).naturalWidth === 0)
      .map((element) => element.getAttribute('src'))
  );

  expect(brokenImageSources).toEqual(['asdf.jpg', 'hjkl.jpg']);
});