import { expect, test } from '@playwright/test';

const URL = 'https://the-internet.herokuapp.com/geolocation';
const LOCATION = { latitude: 52.520008, longitude: 13.404954 }; // Berlin

test.use({
  geolocation: LOCATION,
  permissions: ['geolocation'],
});

test.beforeEach(async ({ page }) => {
  await page.goto(URL);
});

test('page loads with heading and "Where am I?" button', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Geolocation' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Where am I?' })).toBeVisible();
  await expect(page.locator('#lat-value')).toHaveCount(0);
});

test('shows the mocked latitude and longitude', async ({ page }) => {
  await page.getByRole('button', { name: 'Where am I?' }).click();

  await expect(page.locator('#lat-value')).toHaveText(String(LOCATION.latitude));
  await expect(page.locator('#long-value')).toHaveText(String(LOCATION.longitude));
});

test('"See it on Google" link points to the coordinates', async ({ page }) => {
  await page.getByRole('button', { name: 'Where am I?' }).click();

  const link = page.getByRole('link', { name: 'See it on Google' });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute(
    'href',
    `http://maps.google.com/?q=${LOCATION.latitude},${LOCATION.longitude}`,
  );
});

test('reflects an updated geolocation', async ({ page, context }) => {
  const tokyo = { latitude: 35.689487, longitude: 139.691706 };
  await context.setGeolocation(tokyo);

  await page.getByRole('button', { name: 'Where am I?' }).click();

  await expect(page.locator('#lat-value')).toHaveText(String(tokyo.latitude));
  await expect(page.locator('#long-value')).toHaveText(String(tokyo.longitude));
});
