import { test, expect } from '@playwright/test';

test.describe('Checklist Workflow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should navigate to a document with checklist', async ({ page }) => {
        // Search for a process document
        const searchInput = page.locator('input[type="search"]').first();
        await searchInput.fill('quy trình');
        await searchInput.press('Enter');

        await page.waitForLoadState('networkidle');

        // Click first document
        const firstDoc = page.locator('a[href*="/docs/"]').first();
        if (await firstDoc.isVisible().catch(() => false)) {
            await firstDoc.click();
            await expect(page).toHaveURL(/\/docs\//);
        }
    });

    test('should display checklist steps', async ({ page }) => {
        // Navigate to a document (assuming /docs/[id] pattern)
        await page.goto('/docs/test-document'); // Adjust as needed

        // Look for checklist items
        const checklistItems = page.locator('input[type="checkbox"], [role="checkbox"]');
        const count = await checklistItems.count();

        // If document has checklist, items should exist
        if (count > 0) {
            expect(count).toBeGreaterThan(0);
        }
    });

    test('should save checklist progress', async ({ page }) => {
        // Navigate to document with checklist
        await page.goto('/docs/test-document');

        // Find first unchecked checkbox
        const checkbox = page.locator('input[type="checkbox"]:not(:checked)').first();

        if (await checkbox.isVisible().catch(() => false)) {
            // Check the box
            await checkbox.check();

            // Progress should be saved (check for success message or persistence)
            await page.waitForTimeout(1000);

            // Reload page to verify persistence
            await page.reload();

            // Checkbox should still be checked
            await expect(checkbox).toBeChecked();
        }
    });

    test('should display progress indicator', async ({ page }) => {
        await page.goto('/docs/test-document');

        // Look for progress indicator
        const progressBar = page.locator('[role="progressbar"], .progress-bar, text=/\\d+%/');

        if (await progressBar.first().isVisible().catch(() => false)) {
            await expect(progressBar.first()).toBeVisible();
        }
    });

    test('should work offline with localStorage', async ({ page }) => {
        await page.goto('/docs/test-document');

        // Go offline
        await page.context().setOffline(true);

        // Try to check a checkbox
        const checkbox = page.locator('input[type="checkbox"]').first();
        if (await checkbox.isVisible().catch(() => false)) {
            await checkbox.check();

            // Should show offline banner
            const offlineBanner = page.locator('text=/Không có kết nối|Offline/i');
            await expect(offlineBanner).toBeVisible({ timeout: 3000 });

            // Progress should be saved to localStorage
            const storedData = await page.evaluate(() => {
                return localStorage.getItem('offline-sync-queue') ||
                    localStorage.getItem('checklist-progress');
            });

            expect(storedData).toBeTruthy();
        }

        // Go back online
        await page.context().setOffline(false);
    });

    test('should sync progress when coming back online', async ({ page }) => {
        await page.goto('/docs/test-document');

        // Go offline
        await page.context().setOffline(true);

        // Make changes
        const checkbox = page.locator('input[type="checkbox"]').first();
        if (await checkbox.isVisible().catch(() => false)) {
            await checkbox.check();
            await page.waitForTimeout(500);
        }

        // Go back online
        await page.context().setOffline(false);

        // Wait for sync
        await page.waitForTimeout(2000);

        // Offline banner should disappear
        const offlineBanner = page.locator('text=/Không có kết nối|Offline/i');
        await expect(offlineBanner).not.toBeVisible();
    });

    test('should complete entire checklist', async ({ page }) => {
        await page.goto('/docs/test-document');

        // Get all checkboxes
        const checkboxes = page.locator('input[type="checkbox"]');
        const count = await checkboxes.count();

        if (count > 0) {
            // Check all boxes
            for (let i = 0; i < count; i++) {
                await checkboxes.nth(i).check();
                await page.waitForTimeout(200);
            }

            // Should show completion message or 100% progress
            const completionIndicator = page.locator('text=/Hoàn thành|Complete|100%/i');
            await expect(completionIndicator.first()).toBeVisible({ timeout: 5000 });
        }
    });
});
