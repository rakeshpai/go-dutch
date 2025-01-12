import { test, expect, Page } from '@playwright/test';

test.beforeEach(({ page }) => {
  return page.goto('/');
});

const login = async (page: Page) => {
  await expect(page).toHaveTitle('Get started');
  const nameField = page.getByLabel('Your name');
  await nameField.fill('John Doe');
  await nameField.press('Enter');
};

test('create group', async ({ page }) => {
  await login(page);
  await expect(new URL(page.url()).pathname).toBe('/add-group');

  const nameField = page.getByLabel('Name');
  await nameField.fill('Trip to Thailand');

  const person1Field = page.getByPlaceholder('eg. Jane Doe');
  await person1Field.fill('Tony Stark');
  await person1Field.press('Enter');

  await expect(new URL(page.url()).pathname).toContain('/groups/');
});
