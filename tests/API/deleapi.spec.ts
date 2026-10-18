import { test, expect } from '@playwright/test';

test('DELETE removes a post', async ({ request }) => {
    const response = await request.delete(
        'https://jsonplaceholder.typicode.com/posts/1'
    );

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toEqual({});
});