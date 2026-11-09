import { expect, test } from '@playwright/test';
import fs from 'fs';

const URL = 'https://the-internet.herokuapp.com/download';

test.beforeEach(async ({ page }) => {
  await page.goto(URL);
});

test('page lists downloadable files', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'File Downloader' })).toBeVisible();

  const links = page.locator('#content .example a');
  expect(await links.count()).toBeGreaterThan(0);

  for (const href of await links.evaluateAll(els => els.map(a => a.getAttribute('href')))) {
    expect(href).toMatch(/^download\/.+/);
  }
});

test('clicking a file link downloads that file', async ({ page }) => {
  // The file list is user-uploaded and changes over time, so use whichever file is listed first
  const link = page.locator('#content .example a').first();
  const fileName = (await link.textContent())!.trim();

  const downloadPromise = page.waitForEvent('download');
  await link.click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe(fileName);
  expect(await download.failure()).toBeNull();

  const path = await download.path();
  expect(fs.statSync(path).size).toBeGreaterThan(0);
});

test('downloaded file can be saved to a chosen location', async ({ page }, testInfo) => {
  const link = page.locator('#content .example a').first();

  const downloadPromise = page.waitForEvent('download');
  await link.click();
  const download = await downloadPromise;

  const target = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(target);

  expect(fs.existsSync(target)).toBe(true);
});
