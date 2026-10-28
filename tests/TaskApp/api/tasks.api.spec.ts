import { test, expect } from '../../../fixtures';

const taskShape = {
  id: expect.any(Number),
  title: expect.any(String),
  done: expect.any(Boolean),
  created_at: expect.stringMatching(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/),
};

test.describe('Task API – happy path', () => {
  test('health check reports the app is up', async ({ request }) => {
    const response = await request.get('/api/health');

    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ status: 'ok', db: expect.any(String) });
  });

  test('GET /api/tasks returns a list of well-formed tasks', async ({ request }) => {
    const response = await request.get('/api/tasks');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const tasks = await response.json();
    expect(Array.isArray(tasks)).toBe(true);
    for (const task of tasks) {
      expect(task).toEqual(taskShape);
    }
  });

  test('POST creates a task', async ({ request, uniqueTitle }) => {
    const title = uniqueTitle('Create');

    const response = await request.post('/api/tasks', { data: { title } });

    expect(response.status()).toBe(201);
    expect(await response.json()).toEqual({ ...taskShape, title, done: false });
  });

  test('GET /api/tasks/:id returns one task', async ({ request, createTask }) => {
    const created = await createTask();

    const response = await request.get(`/api/tasks/${created.id}`);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(created);
  });

  test('PUT replaces a task', async ({ request, createTask, uniqueTitle }) => {
    const created = await createTask();
    const replacement = { title: uniqueTitle('Replaced'), done: true };

    const response = await request.put(`/api/tasks/${created.id}`, { data: replacement });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ...created, ...replacement });
  });

  test('PATCH updates only the fields sent', async ({ request, createTask }) => {
    const created = await createTask();

    const response = await request.patch(`/api/tasks/${created.id}`, { data: { done: true } });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ...created, done: true });
  });

  test('DELETE removes a task', async ({ request, createTask }) => {
    const created = await createTask();

    const response = await request.delete(`/api/tasks/${created.id}`);
    expect(response.status()).toBe(204);
    expect(await response.text()).toBe('');

    const after = await request.get(`/api/tasks/${created.id}`);
    expect(after.status()).toBe(404);
  });
});

test.describe('Task API – validation', () => {
  const invalidBodies: { name: string; data: unknown; error: string | RegExp }[] = [
    { name: 'missing title', data: {}, error: 'title is required' },
    { name: 'blank title', data: { title: '   ' }, error: 'title is required' },
    { name: 'title too long', data: { title: 'x'.repeat(201) }, error: /at most 200/ },
    { name: 'title not a string', data: { title: 42 }, error: 'title must be a string' },
    { name: 'done not a boolean', data: { title: 'ok', done: 'yes' }, error: 'done must be a boolean' },
    { name: 'unknown field', data: { title: 'ok', priority: 1 }, error: /Unknown field.*priority/ },
    { name: 'array body', data: [], error: 'Request body must be a JSON object' },
  ];

  for (const { name, data, error } of invalidBodies) {
    test(`POST rejects ${name} with 400`, async ({ request }) => {
      const response = await request.post('/api/tasks', { data });

      expect(response.status()).toBe(400);
      const body = await response.json();
      if (typeof error === 'string') expect(body.error).toBe(error);
      else expect(body.error).toMatch(error);
    });
  }

  test('POST rejects malformed JSON with 400', async ({ request }) => {
    const response = await request.post('/api/tasks', {
      headers: { 'Content-Type': 'application/json' },
      data: '{"title": "unterminated',
    });

    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: 'Malformed JSON' });
  });

  test('PUT requires every field', async ({ request, createTask }) => {
    const created = await createTask();

    const response = await request.put(`/api/tasks/${created.id}`, { data: { title: 'only title' } });

    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: 'done is required' });
  });

  test('PATCH with an empty body is rejected', async ({ request, createTask }) => {
    const created = await createTask();

    const response = await request.patch(`/api/tasks/${created.id}`, { data: {} });

    expect(response.status()).toBe(400);
  });

  test('a non-numeric id is rejected with 400', async ({ request }) => {
    const response = await request.get('/api/tasks/abc');

    expect(response.status()).toBe(400);
  });

  for (const method of ['get', 'patch', 'delete'] as const) {
    test(`${method.toUpperCase()} on an unknown id returns 404`, async ({ request }) => {
      const options = method === 'patch' ? { data: { done: true } } : undefined;
      const response = await request[method]('/api/tasks/999999', options);

      expect(response.status()).toBe(404);
      expect(await response.json()).toEqual({ error: 'Task not found' });
    });
  }
});

test.describe('Task API – edge cases', () => {
  test('stores a SQL-injection string as plain text', async ({ request, uniqueTitle }) => {
    const title = uniqueTitle(`Robert'); DROP TABLE tasks;--`);

    const response = await request.post('/api/tasks', { data: { title } });
    expect(response.status()).toBe(201);
    const created = await response.json();
    expect(created.title).toBe(title);

    // The table still exists and the row reads back exactly as sent.
    const readBack = await request.get(`/api/tasks/${created.id}`);
    expect((await readBack.json()).title).toBe(title);
  });

  test('round-trips Unicode and emoji', async ({ request, uniqueTitle }) => {
    const title = uniqueTitle('Tâche 测试 ✅ 🚀');

    const response = await request.post('/api/tasks', { data: { title } });

    expect(response.status()).toBe(201);
    expect((await response.json()).title).toBe(title);
  });

  test('trims surrounding whitespace from titles', async ({ request, uniqueTitle }) => {
    const title = uniqueTitle('Trimmed');

    const response = await request.post('/api/tasks', { data: { title: `   ${title}   ` } });

    expect((await response.json()).title).toBe(title);
  });
});
