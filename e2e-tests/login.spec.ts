import { test, expect } from '@playwright/test';

test.beforeEach(({ page }) => {
  return page.goto('/');
});

test('move to service-worker', async ({ page }) => {
  await expect(page).toHaveTitle('Get started');
  await expect(page.getByLabel('Your name')).toBeFocused();
  await expect(await page.locator('select option').count()).toBeGreaterThan(
    100,
  );
});

test('register', async ({ page }) => {
  const nameField = page.getByLabel('Your name');
  await nameField.fill('John Doe');
  await nameField.press('Enter');
  await expect(page.getByRole('link', { name: 'John Doe' })).toBeVisible();
});
