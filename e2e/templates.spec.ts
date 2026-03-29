import { test, expect } from '@playwright/test';

test.describe('Templates Page', () => {
  test('should display the templates heading', async ({ page }) => {
    await page.goto('/templates');

    await expect(page.getByRole('heading', { name: /Resume Templates/i })).toBeVisible();
    await expect(page.getByText(/Choose a template and customize/i)).toBeVisible();
  });

  test('should show all three templates', async ({ page }) => {
    await page.goto('/templates');

    await expect(page.getByText('Classic')).toBeVisible();
    await expect(page.getByText('Modern')).toBeVisible();
    await expect(page.getByText('Minimal')).toBeVisible();
  });

  test('should display template descriptions', async ({ page }) => {
    await page.goto('/templates');

    await expect(page.getByText(/Traditional resume layout/i)).toBeVisible();
    await expect(page.getByText(/Contemporary design/i)).toBeVisible();
    await expect(page.getByText(/Clean and understated/i)).toBeVisible();
  });

  test('should have "Use this template" links pointing to login', async ({ page }) => {
    await page.goto('/templates');

    const templateLinks = page.getByRole('link', { name: /Use this template/i });
    await expect(templateLinks).toHaveCount(3);

    for (const link of await templateLinks.all()) {
      await expect(link).toHaveAttribute('href', '/login');
    }
  });
});
