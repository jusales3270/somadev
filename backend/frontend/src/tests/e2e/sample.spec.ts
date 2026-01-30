import { test, expect } from '@playwright/test';

test('placeholder e2e test', async ({ page }) => {
  // TODO: Provide baseURL and routes to test.
  await page.goto('/');
  await expect(page).toHaveURL(/\/$/);
});