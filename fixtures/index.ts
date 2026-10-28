import { test as base, type TestInfo } from '@playwright/test';
import { type Knex } from 'knex';
import { createDb } from '../app/db';

export type Task = { id: number; title: string; done: boolean; created_at: string };

type TestFixtures = {
  /** Returns a title unique to this test run; every row with that title is deleted after the test. */
  uniqueTitle: (label?: string) => string;
  /** Creates a task through the API (its title comes from uniqueTitle, so it is cleaned up too). */
  createTask: (overrides?: Partial<Pick<Task, 'title' | 'done'>>) => Promise<Task>;
};

type WorkerFixtures = {
  /** Direct database connection, shared by all tests in a worker. */
  db: Knex;
};

function makeTitle(testInfo: TestInfo, label: string, n: number) {
  return `${label} [w${testInfo.workerIndex}-${testInfo.testId}-${n}]`;
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  db: [
    async ({}, use) => {
      const db = createDb();
      await use(db);
      await db.destroy();
    },
    { scope: 'worker' },
  ],

  uniqueTitle: async ({ db }, use, testInfo) => {
    const titles: string[] = [];
    await use((label = 'Task') => {
      const title = makeTitle(testInfo, label, titles.length + 1);
      titles.push(title);
      return title;
    });
    if (titles.length > 0) {
      await db('tasks').whereIn('title', titles).del();
    }
  },

  createTask: async ({ request, uniqueTitle }, use) => {
    await use(async (overrides = {}) => {
      const response = await request.post('/api/tasks', {
        data: { title: overrides.title ?? uniqueTitle(), done: overrides.done ?? false },
      });
      if (response.status() !== 201) {
        throw new Error(`createTask failed: ${response.status()} ${await response.text()}`);
      }
      return response.json();
    });
  },
});

export { expect } from '@playwright/test';
