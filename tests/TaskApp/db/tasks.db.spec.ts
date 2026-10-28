import { test, expect } from '../../../fixtures';

// These tests check the API and the database against each other:
// the API response alone can't prove data was saved, so we query the table directly.

test.describe('Task DB integrity', () => {
  test('a task created through the API is persisted', async ({ request, db, uniqueTitle }) => {
    const title = uniqueTitle('Persisted');

    const response = await request.post('/api/tasks', { data: { title } });
    const { id } = await response.json();

    const row = await db('tasks').where({ id }).first();
    expect(row).toBeDefined();
    expect(row.title).toBe(title);
    expect(Boolean(row.done)).toBe(false);
    expect(row.created_at).toBeTruthy();
  });

  test('a row inserted directly is returned by the API', async ({ request, db, uniqueTitle }) => {
    const title = uniqueTitle('Inserted');
    const [{ id }] = await db('tasks').insert({ title, done: true }).returning('id');

    const response = await request.get(`/api/tasks/${id}`);

    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ id, title, done: true });
  });

  test('PATCH changes only the targeted column', async ({ request, db, createTask }) => {
    const task = await createTask();
    const before = await db('tasks').where({ id: task.id }).first();

    await request.patch(`/api/tasks/${task.id}`, { data: { done: true } });

    const after = await db('tasks').where({ id: task.id }).first();
    expect(Boolean(after.done)).toBe(true);
    expect(after.title).toBe(before.title);
    expect(after.created_at).toEqual(before.created_at);
  });

  test('DELETE removes the row', async ({ request, db, createTask }) => {
    const task = await createTask();

    await request.delete(`/api/tasks/${task.id}`);

    expect(await db('tasks').where({ id: task.id }).first()).toBeUndefined();
  });

  test('a rejected request writes nothing', async ({ request, db, uniqueTitle }) => {
    const title = uniqueTitle('Rejected');

    const response = await request.post('/api/tasks', { data: { title, done: 'not-a-boolean' } });

    expect(response.status()).toBe(400);
    expect(await db('tasks').where({ title }).first()).toBeUndefined();
  });

  test('the schema rejects a NULL title', async ({ db }) => {
    await expect(db('tasks').insert({ title: null })).rejects.toThrow(/null|NOT NULL/i);
  });

  test('done defaults to false and created_at is set automatically', async ({ db, uniqueTitle }) => {
    const title = uniqueTitle('Defaults');
    const [{ id }] = await db('tasks').insert({ title }).returning('id');

    const row = await db('tasks').where({ id }).first();

    expect(Boolean(row.done)).toBe(false);
    expect(row.created_at).toBeTruthy();
  });

  test('ids are unique and increase', async ({ createTask }) => {
    const first = await createTask();
    const second = await createTask();

    expect(second.id).toBeGreaterThan(first.id);
  });
});
