import { test, expect } from '@playwright/test';

test('GET a post', async ({ request }) => {
  const response = await request.get(
    'https://jsonplaceholder.typicode.com/posts/1'
  );

  expect(response.status()).toBe(200);

  const post = await response.json();
  expect(post).toMatchObject({
    id: 1,
    userId: 1,
    title: expect.any(String),
    body: expect.any(String),
  });
});