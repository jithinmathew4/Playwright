import { expect, test } from '@playwright/test';

const URL = 'https://the-internet.herokuapp.com/date_pickers';

test.describe('Native inputs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('shows placeholder result before any value is set', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Date & Time Pickers' })).toBeVisible();
    await expect(page.locator('#native-result')).toHaveText('No values yet');
  });

  test('date input accepts a value and enforces min/max', async ({ page }) => {
    const date = page.locator('#date');
    await expect(date).toHaveAttribute('min', '2000-01-01');
    await expect(date).toHaveAttribute('max', '2099-12-31');

    await date.fill('2026-04-15');
    await expect(date).toHaveValue('2026-04-15');
    await expect(page.locator('#native-result')).toHaveText('date: 2026-04-15');
  });

  test('all native pickers report their values', async ({ page }) => {
    await page.locator('#date').fill('2026-04-15');
    await page.locator('#time').fill('13:45');
    await page.locator('#datetime').fill('2026-04-15T13:45');
    await page.locator('#month').fill('2026-04');
    await page.locator('#week').fill('2026-W16');

    await expect(page.locator('#native-result')).toHaveText(
      'date: 2026-04-15, time: 13:45, datetime: 2026-04-15T13:45, month: 2026-04, week: 2026-W16',
    );
  });
});

test.describe('Calendar widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${URL}?month=2026-04`);
  });

  test('field is read-only and calendar is hidden initially', async ({ page }) => {
    await expect(page.locator('#widget-date')).toHaveAttribute('readonly', '');
    await expect(page.locator('#calendar')).toBeHidden();
    await expect(page.locator('#open-calendar')).toHaveAttribute('aria-expanded', 'false');
  });

  test('opens on the month given in the query string', async ({ page }) => {
    await page.locator('#open-calendar').click();

    await expect(page.locator('#calendar')).toBeVisible();
    await expect(page.locator('#open-calendar')).toHaveText('Close calendar');
    await expect(page.locator('#open-calendar')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#calendar-month')).toHaveText('April 2026');
    await expect(page.locator('#calendar-days button')).toHaveCount(30);
    // April 1, 2026 is a Wednesday: two empty cells before it (Mo, Tu)
    await expect(page.locator('#calendar-days tr').first().locator('td').nth(2)).toHaveText('1');
  });

  test('clicking a day fills the field and closes the calendar', async ({ page }) => {
    await page.locator('#open-calendar').click();
    await page.locator('#calendar-days button[data-date="2026-04-15"]').click();

    await expect(page.locator('#widget-date')).toHaveValue('2026-04-15');
    await expect(page.locator('#calendar')).toBeHidden();
    await expect(page.locator('#open-calendar')).toHaveText('Open calendar');

    await page.locator('#open-calendar').click();
    await expect(page.locator('button[data-date="2026-04-15"]')).toHaveClass('selected');
  });

  test('navigates across year boundaries', async ({ page }) => {
    await page.goto(`${URL}?month=2026-12`);
    await page.locator('#open-calendar').click();

    await page.getByRole('button', { name: 'Next month' }).click();
    await expect(page.locator('#calendar-month')).toHaveText('January 2027');

    await page.getByRole('button', { name: 'Previous month' }).click();
    await page.getByRole('button', { name: 'Previous month' }).click();
    await expect(page.locator('#calendar-month')).toHaveText('November 2026');
  });

  test('selects a date from a different month', async ({ page }) => {
    await page.locator('#open-calendar').click();
    await page.getByRole('button', { name: 'Next month' }).click();
    await page.locator('button[data-date="2026-05-31"]').click();

    await expect(page.locator('#widget-date')).toHaveValue('2026-05-31');
  });

  test('defaults to the current month without a query param', async ({ page }) => {
    await page.goto(URL);
    await page.locator('#open-calendar').click();

    const now = new Date();
    const expected = now.toLocaleString('en-US', { month: 'long' }) + ' ' + now.getFullYear();
    await expect(page.locator('#calendar-month')).toHaveText(expected);
  });
});
