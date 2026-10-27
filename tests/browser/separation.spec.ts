import { test, expect } from '@playwright/test';

test('public pages remain available and removed Lab routes return 404', async ({ request }) => {
  for (const path of ['/', '/icons', '/docs']) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
  }
  for (const path of ['/lab', '/lab/morph', '/lab/morph/plus-x', '/morph']) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(404);
  }
});
