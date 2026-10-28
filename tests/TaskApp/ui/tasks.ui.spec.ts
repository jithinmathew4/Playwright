import { test, expect } from '../../../fixtures';
import { TasksPage } from '../../../pages/TaskApp/TasksPage';

test.describe('Task Manager UI', () => {
  test('adds a task and saves it to the database', async ({ page, db, uniqueTitle }) => {
    const tasksPage = new TasksPage(page);
    const title = uniqueTitle('UI add');

    await tasksPage.goto();
    await tasksPage.addTask(title);

    await expect(tasksPage.task(title)).toBeVisible();
    await expect(tasksPage.newTaskInput).toHaveValue('');
    await expect.poll(() => db('tasks').where({ title }).first()).toBeDefined();
  });

  test('completes a task and updates the database', async ({ page, db, createTask }) => {
    const tasksPage = new TasksPage(page);
    const task = await createTask();

    await tasksPage.goto();
    await tasksPage.checkbox(task.title).check();

    await expect(tasksPage.task(task.title)).toHaveClass(/done/);
    await expect
      .poll(async () => Boolean((await db('tasks').where({ id: task.id }).first()).done))
      .toBe(true);
  });

  test('deletes a task and removes it from the database', async ({ page, db, createTask }) => {
    const tasksPage = new TasksPage(page);
    const task = await createTask();

    await tasksPage.goto();
    await tasksPage.deleteTask(task.title);

    await expect(tasksPage.task(task.title)).toHaveCount(0);
    await expect.poll(() => db('tasks').where({ id: task.id }).first()).toBeUndefined();
  });

  test('shows a validation error for an empty title', async ({ page }) => {
    const tasksPage = new TasksPage(page);

    await tasksPage.goto();
    await tasksPage.addTask('   ');

    await expect(tasksPage.formError).toHaveText('title is required');
  });

  test('shows tasks created outside the UI after a reload', async ({ page, createTask }) => {
    const tasksPage = new TasksPage(page);
    await tasksPage.goto();

    const task = await createTask();
    await page.reload();

    await expect(tasksPage.task(task.title)).toBeVisible();
  });
});

test.describe('Task Manager UI – mocked network', () => {
  test('shows an empty state when there are no tasks', async ({ page }) => {
    await page.route('**/api/tasks', (route) => route.fulfill({ json: [] }));
    const tasksPage = new TasksPage(page);

    await tasksPage.goto();

    await expect(tasksPage.status).toHaveText('No tasks yet');
    await expect(tasksPage.taskItems).toHaveCount(0);
  });

  test('shows an error when the API fails', async ({ page }) => {
    await page.route('**/api/tasks', (route) =>
      route.fulfill({ status: 500, json: { error: 'Internal server error' } })
    );
    const tasksPage = new TasksPage(page);

    await tasksPage.goto();

    await expect(tasksPage.status).toHaveText('Could not load tasks');
  });

  test('keeps the checkbox unchanged when an update fails', async ({ page, createTask }) => {
    const task = await createTask();
    await page.route(`**/api/tasks/${task.id}`, (route) =>
      route.request().method() === 'PATCH'
        ? route.fulfill({ status: 500, json: { error: 'Internal server error' } })
        : route.continue()
    );
    const tasksPage = new TasksPage(page);

    await tasksPage.goto();
    await tasksPage.checkbox(task.title).click();

    await expect(tasksPage.formError).toHaveText('Internal server error');
    await expect(tasksPage.checkbox(task.title)).not.toBeChecked();
  });
});
