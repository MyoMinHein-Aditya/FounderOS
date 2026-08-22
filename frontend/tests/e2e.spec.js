import { test, expect } from '@playwright/test';

test.describe('FounderOS E2E Critical Flows', () => {

  test('User Login Flow', async ({ page }) => {
    // Mock the login API
    await page.route('**/auth/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-jwt-token' })
      });
    });

    // Mock the auth me API (to pass AuthCheck)
    await page.route('**/auth/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, email: 'test@example.com' })
      });
    });

    // Mock dashboard metrics
    await page.route('**/dashboard/metrics', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ tasks_completed: 10, tasks_pending: 5 })
      });
    });

    await page.goto('/');

    // Assuming the login page has email and password inputs
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    // Wait for the inputs to be visible
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');

    // Click the login button
    await page.locator('button[type="submit"]').click();

    // Verify navigation to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('Workspace / Goal Creation Flow', async ({ page }) => {
    // Setup initial auth state by setting localStorage
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token');
    });

    // Mock auth me
    await page.route('**/auth/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, email: 'test@example.com' })
      });
    });

    // Mock get goals
    await page.route('**/goal/get_my_goals*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    // Mock create goal
    await page.route('**/goal/create', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Goal Created', goal_id: 1 })
      });
    });

    await page.goto('/goal');

    // We expect some input or button to add goal
    const addButton = page.getByRole('button', { name: /create|add/i });
    if(await addButton.isVisible()) {
      await addButton.click();
    }
    
    const titleInput = page.locator('input[name="title"]');
    if (await titleInput.isVisible()) {
      await titleInput.fill('New E2E Goal');
      const submit = page.getByRole('button', { name: /save|submit/i });
      await submit.click();
    }
  });

});
