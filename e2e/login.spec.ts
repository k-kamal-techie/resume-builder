import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should display the login page heading', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: /Welcome to ResumeAI/i })).toBeVisible();
    await expect(page.getByText(/Sign in to start building/i)).toBeVisible();
  });

  test('should show Google and GitHub sign-in buttons', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue with GitHub/i })).toBeVisible();
  });

  test('should display terms notice', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByText(/Terms of Service and Privacy Policy/i)).toBeVisible();
  });
});
