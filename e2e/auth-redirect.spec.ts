import { test, expect } from '@playwright/test';

test.describe('Auth Redirects', () => {
  test('should redirect /editor/:id when not authenticated', async ({ page }) => {
    await page.goto('/editor/test-id');

    await expect(page).not.toHaveURL('/editor/test-id');
  });

  test('should redirect /preview/:id when not authenticated', async ({ page }) => {
    await page.goto('/preview/test-id');

    await expect(page).not.toHaveURL('/preview/test-id');
  });
});
