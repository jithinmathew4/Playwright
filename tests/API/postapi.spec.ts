import { test, expect } from '@playwright/test';

// ...existing code...

test('POST a post', async ({ request }) => {
  const newPost = {
    title: 'Playwright API test',
    body: 'Testing a POST request',
    userId: 1,
  };

  const response = await request.post(
    'https://jsonplaceholder.typicode.com/posts',
    { data: newPost }
  );

  expect(response.status()).toBe(201);

  const post = await response.json();
  expect(post).toMatchObject(newPost);
  expect(post.id).toBeDefined();
});