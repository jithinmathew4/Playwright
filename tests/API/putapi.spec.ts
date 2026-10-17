import { test, expect } from '@playwright/test';

test('PUT updates a post', async ({ request }) => {
	const updatedPost = {
		id: 1,
		title: 'Updated Playwright API test',
		body: 'Testing a PUT request',
		userId: 1,
	};

	const response = await request.put(
		'https://jsonplaceholder.typicode.com/posts/1',
		{ data: updatedPost }
	);

	expect(response.status()).toBe(200);

	const post = await response.json();
	expect(post).toMatchObject(updatedPost);
});
