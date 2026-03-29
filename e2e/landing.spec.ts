import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display the hero section', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /Build Your Resume/i })).toBeVisible();
    await expect(page.getByText('With AI Intelligence')).toBeVisible();
    await expect(page.getByText(/Stop struggling with resume writing/i)).toBeVisible();
  });

  test('should have Get Started and View Templates links', async ({ page }) => {
    await page.goto('/');

    const getStarted = page.getByRole('link', { name: /Get Started Free/i });
    await expect(getStarted).toBeVisible();
    await expect(getStarted).toHaveAttribute('href', '/login');

    const viewTemplates = page.getByRole('link', { name: /View Templates/i });
    await expect(viewTemplates).toBeVisible();
    await expect(viewTemplates).toHaveAttribute('href', '/templates');
  });

  test('should display all four feature cards', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('AI-Powered Content')).toBeVisible();
    await expect(page.getByText('Job Tailoring')).toBeVisible();
    await expect(page.getByText('ATS Scoring')).toBeVisible();
    await expect(page.getByText('Multiple Templates')).toBeVisible();
  });

  test('should display the CTA section', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Ready to Build Your Best Resume?')).toBeVisible();
    const ctaLink = page.getByRole('link', { name: /Start Building Now/i });
    await expect(ctaLink).toBeVisible();
    await expect(ctaLink).toHaveAttribute('href', '/login');
  });

  test('should navigate to login page via Get Started', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Get Started Free/i }).click();
    await expect(page).toHaveURL('/login');
  });

  test('should navigate to templates page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /View Templates/i }).click();
    await expect(page).toHaveURL('/templates');
  });
});
