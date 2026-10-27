import { expect, test } from '@playwright/test';

test('renders the challenging DOM table and its row actions', async ({
  page,
}) => {
  await page.goto('https://the-internet.herokuapp.com/challenging_dom');

  await expect(page).toHaveTitle('The Internet');
  await expect(
    page.getByRole('heading', { name: 'Challenging DOM' })
  ).toBeVisible();

  const table = page.locator('table');
  await expect(table).toBeVisible();

  // Validate headers using CSS selector
  await expect(table.locator('thead th')).toHaveText([
    'Lorem',
    'Ipsum',
    'Dolor',
    'Sit',
    'Amet',
    'Diceret',
    'Action',
  ]);

  // Validate row counts and action links
  const rows = table.locator('tbody tr');
  await expect(rows).toHaveCount(10);
  await expect(table.getByRole('link', { name: 'edit' })).toHaveCount(10);
  await expect(table.getByRole('link', { name: 'delete' })).toHaveCount(10);

  // Validate canvas element
  await expect(page.locator('#canvas')).toBeVisible();
});