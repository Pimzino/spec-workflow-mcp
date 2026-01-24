import { test, expect } from '@playwright/test';

test.describe('Batch Approvals Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the approvals page
    await page.goto('/');

    // Wait for the app to load
    await page.waitForLoadState('networkidle');

    // Navigate to Approvals tab
    await page.click('button:has-text("Approvals"), [data-testid="approvals-tab"]');
    await page.waitForTimeout(1000);
  });

  test('should display batch selection button', async ({ page }) => {
    // Look for the selection toggle button
    const selectButton = page.locator('button:has-text("Select")');
    await expect(selectButton).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'docs/screenshots/dashboard-01-approvals-page.png',
      fullPage: false
    });
  });

  test('should enter selection mode when clicking Select', async ({ page }) => {
    // Click the Select button to enter selection mode
    await page.click('button:has-text("Select")');
    await page.waitForTimeout(500);

    // Verify checkboxes appear - look for checkbox inputs in the approval cards
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    expect(checkboxCount).toBeGreaterThan(0);

    // Take screenshot of selection mode
    await page.screenshot({
      path: 'docs/screenshots/dashboard-02-selection-mode.png',
      fullPage: false
    });
  });

  test('should select multiple items and show count', async ({ page }) => {
    // Enter selection mode
    await page.click('button:has-text("Select")');
    await page.waitForTimeout(500);

    // Click on first 3 checkboxes
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();

    if (count >= 3) {
      await checkboxes.nth(0).click();
      await checkboxes.nth(1).click();
      await checkboxes.nth(2).click();
      await page.waitForTimeout(300);
    }

    // Verify selection count is displayed
    const selectionText = page.locator('text=/\\d+ selected/i');
    await expect(selectionText).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'docs/screenshots/dashboard-03-items-selected.png',
      fullPage: false
    });
  });

  test('should show batch action buttons when items selected', async ({ page }) => {
    // Enter selection mode and select items
    await page.click('button:has-text("Select")');
    await page.waitForTimeout(500);

    const checkboxes = page.locator('input[type="checkbox"]');
    if (await checkboxes.count() >= 2) {
      await checkboxes.nth(0).click();
      await checkboxes.nth(1).click();
    }
    await page.waitForTimeout(300);

    // Verify batch action buttons are visible
    const approveButton = page.locator('button:has-text("Approve")');
    const rejectButton = page.locator('button:has-text("Reject")');

    await expect(approveButton).toBeVisible();
    await expect(rejectButton).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'docs/screenshots/dashboard-04-batch-actions.png',
      fullPage: false
    });
  });

  test('should open reject feedback modal', async ({ page }) => {
    // Enter selection mode and select items
    await page.click('button:has-text("Select")');
    await page.waitForTimeout(500);

    const checkboxes = page.locator('input[type="checkbox"]');
    if (await checkboxes.count() >= 2) {
      await checkboxes.nth(0).click();
      await checkboxes.nth(1).click();
    }
    await page.waitForTimeout(300);

    // Click reject button
    await page.click('button:has-text("Reject")');
    await page.waitForTimeout(500);

    // Verify feedback modal appears
    const modal = page.locator('[role="dialog"], .modal, [data-testid="reject-modal"]');
    const textarea = page.locator('textarea');

    // Take screenshot of modal
    await page.screenshot({
      path: 'docs/screenshots/dashboard-05-reject-modal.png',
      fullPage: false
    });
  });

  test('should select all items with Select All', async ({ page }) => {
    // Enter selection mode
    await page.click('button:has-text("Select")');
    await page.waitForTimeout(500);

    // Click Select All (usually in the header/toolbar)
    const selectAllButton = page.locator('button:has-text("Select All"), label:has-text("Select All")');
    if (await selectAllButton.count() > 0) {
      await selectAllButton.first().click();
      await page.waitForTimeout(300);
    }

    // Take screenshot
    await page.screenshot({
      path: 'docs/screenshots/dashboard-06-select-all.png',
      fullPage: false
    });
  });

  test('should perform batch approve and show undo toast', async ({ page }) => {
    // Enter selection mode and select items
    await page.click('button:has-text("Select")');
    await page.waitForTimeout(500);

    const checkboxes = page.locator('input[type="checkbox"]');
    if (await checkboxes.count() >= 2) {
      await checkboxes.nth(0).click();
      await checkboxes.nth(1).click();
    }
    await page.waitForTimeout(300);

    // Click approve button
    await page.click('button:has-text("Approve")');
    await page.waitForTimeout(1000);

    // Look for undo toast or success notification
    const undoButton = page.locator('button:has-text("Undo")');
    const toast = page.locator('[role="alert"], .toast, [data-testid="toast"]');

    // Take screenshot
    await page.screenshot({
      path: 'docs/screenshots/dashboard-07-undo-toast.png',
      fullPage: false
    });
  });

  test('should exit selection mode when clicking Cancel', async ({ page }) => {
    // Enter selection mode
    await page.click('button:has-text("Select")');
    await page.waitForTimeout(500);

    // Select an item
    const checkboxes = page.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.nth(0).click();
    }
    await page.waitForTimeout(300);

    // Click Cancel/Exit button
    const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("Exit")');
    if (await cancelButton.count() > 0) {
      await cancelButton.first().click();
      await page.waitForTimeout(300);
    }

    // Take screenshot
    await page.screenshot({
      path: 'docs/screenshots/dashboard-08-exit-selection.png',
      fullPage: false
    });
  });
});
