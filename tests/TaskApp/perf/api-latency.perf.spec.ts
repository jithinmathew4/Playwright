import { test, expect } from '../../../fixtures';

const BUDGET = {
  p95Ms: 200,
  largeListMs: 500,
  largeListRenderMs: 2000,
};

const SAMPLES = 30;
const LARGE_LIST_SIZE = 50;

test.describe.configure({ mode: 'serial' });

function percentile(sortedValues: number[], p: number) {
  const index = Math.ceil((p / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, index)];
}

test(`GET /api/tasks/:id p95 is under ${BUDGET.p95Ms} ms`, async ({ request, createTask }, testInfo) => {
  const task = await createTask();
  await request.get(`/api/tasks/${task.id}`); // warm-up, not measured

  const durations: number[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const start = performance.now();
    const response = await request.get(`/api/tasks/${task.id}`);
    durations.push(performance.now() - start);
    expect(response.status()).toBe(200);
  }

  durations.sort((a, b) => a - b);
  const stats = {
    samples: SAMPLES,
    minMs: +durations[0].toFixed(1),
    p50Ms: +percentile(durations, 50).toFixed(1),
    p95Ms: +percentile(durations, 95).toFixed(1),
    maxMs: +durations[durations.length - 1].toFixed(1),
  };
  await testInfo.attach('latency', { body: JSON.stringify(stats, null, 2), contentType: 'application/json' });

  expect(stats.p95Ms).toBeLessThan(BUDGET.p95Ms);
});

test(`list endpoint and page stay fast with ${LARGE_LIST_SIZE} extra tasks`, async ({ page, request, db, uniqueTitle }, testInfo) => {
  await db('tasks').insert(
    Array.from({ length: LARGE_LIST_SIZE }, () => ({ title: uniqueTitle('Bulk') }))
  );

  const apiStart = performance.now();
  const response = await request.get('/api/tasks');
  const apiMs = performance.now() - apiStart;
  expect(response.status()).toBe(200);
  expect((await response.json()).length).toBeGreaterThanOrEqual(LARGE_LIST_SIZE);

  const renderStart = performance.now();
  await page.goto('/');
  await expect
    .poll(() => page.getByRole('list', { name: 'Tasks' }).getByRole('listitem').count())
    .toBeGreaterThanOrEqual(LARGE_LIST_SIZE);
  const renderMs = performance.now() - renderStart;

  const stats = { tasks: LARGE_LIST_SIZE, apiMs: Math.round(apiMs), renderMs: Math.round(renderMs) };
  await testInfo.attach('large-list', { body: JSON.stringify(stats, null, 2), contentType: 'application/json' });

  expect(stats.apiMs).toBeLessThan(BUDGET.largeListMs);
  expect(stats.renderMs).toBeLessThan(BUDGET.largeListRenderMs);
});
