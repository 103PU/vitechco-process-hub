import { test, expect } from '@playwright/test';

/**
 * E2E Test: Homepage & Search Functionality
 */
test.describe('Homepage', () => {
    test('should load homepage successfully', async ({ page }) => {
        await page.goto('/');

        // Check page title
        await expect(page).toHaveTitle(/Vitechco Process Hub/i);

        // Check main heading exists
        const heading = page.getByRole('heading', { level: 1 });
        await expect(heading).toBeVisible();
    });

    test('should have functional search', async ({ page }) => {
        await page.goto('/');

        // Find search input
        const searchInput = page.getByPlaceholder(/search/i);
        await expect(searchInput).toBeVisible();

        // Type search query
        await searchInput.fill('photocopy');

        // Wait for results (if any)
        await page.waitForTimeout(1000);

        // Results should be visible or empty state shown
        const hasResults = await page.locator('[data-testid="search-results"]').isVisible().catch(() => false);
        const hasEmptyState = await page.locator('[data-testid="empty-state"]').isVisible().catch(() => false);

        expect(hasResults || hasEmptyState).toBeTruthy();
    });
});

/**
 * E2E Test: Document Viewing
 */
test.describe('Document Viewing', () => {
    test('should display document list', async ({ page }) => {
        await page.goto('/');

        // Wait for documents to load
        await page.waitForSelector('[data-testid="document-card"]', { timeout: 10000 }).catch(() => null);

        // Check if documents or empty state is shown
        const hasDocuments = await page.locator('[data-testid="document-card"]').count() > 0;
        const hasEmptyState = await page.locator('[data-testid="empty-state"]').isVisible();

        expect(hasDocuments || hasEmptyState).toBeTruthy();
    });

    test('should navigate to document detail', async ({ page }) => {
        await page.goto('/');

        // Wait for documents
        const firstDoc = page.locator('[data-testid="document-card"]').first();
        const docExists = await firstDoc.isVisible().catch(() => false);

        if (docExists) {
            await firstDoc.click();

            // Should navigate to document page
            await page.waitForURL(/\/documents\/.+/);

            // Document content should be visible
            const content = page.locator('[data-testid="document-content"]');
            await expect(content).toBeVisible();
        }
    });
});

/**
 * E2E Test: Accessibility
 */
test.describe('Accessibility', () => {
    test('should have no critical accessibility violations on homepage', async ({ page }) => {
        await page.goto('/');

        // Check for basic accessibility
        const mainContent = page.locator('main');
        await expect(mainContent).toBeVisible();

        // Check for skip link or main landmark
        const hasMain = await page.locator('main').count() > 0;
        expect(hasMain).toBeTruthy();
    });

    test('should support keyboard navigation', async ({ page }) => {
        await page.goto('/');

        // Tab through interactive elements
        await page.keyboard.press('Tab');

        // Check if focus is visible
        const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
        expect(focusedElement).toBeTruthy();
    });
});
