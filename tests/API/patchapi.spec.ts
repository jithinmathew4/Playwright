import { test, expect } from '@playwright/test';

test('PATCH partially updates a post', async ({ request }) => {
	const updates = {
		title: 'Updated Playwright API test',
		body: 'Testing a PATCH request',
	};

	const response = await request.patch(
		'https://jsonplaceholder.typicode.com/posts/1',
		{ data: updates }
	);

	expect(response.status()).toBe(200);

	const post = await response.json();
	expect(post).toMatchObject({
		id: 1,
		...updates,
	});
});