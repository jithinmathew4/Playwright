import { type Locator, type Page } from '@playwright/test';

export class TasksPage {
  readonly page: Page;
  readonly newTaskInput: Locator;
  readonly addButton: Locator;
  readonly formError: Locator;
  readonly status: Locator;
  readonly taskItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTaskInput = page.getByLabel('New task');
    this.addButton = page.getByRole('button', { name: 'Add task' });
    this.formError = page.getByRole('alert');
    this.status = page.getByRole('status');
    this.taskItems = page.getByRole('list', { name: 'Tasks' }).getByRole('listitem');
  }

  async goto() {
    await this.page.goto('/');
  }

  async addTask(title: string) {
    await this.newTaskInput.fill(title);
    await this.addButton.click();
  }

  task(title: string): Locator {
    return this.taskItems.filter({ hasText: title });
  }

  checkbox(title: string): Locator {
    return this.page.getByRole('checkbox', { name: title, exact: true });
  }

  async deleteTask(title: string) {
    await this.page.getByRole('button', { name: `Delete ${title}`, exact: true }).click();
  }
}
