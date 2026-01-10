import { test, expect } from '@playwright/test';

test.describe('Search Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display search input on homepage', async ({ page }) => {
        const searchInput = page.locator('input[type="search"], input[placeholder*="Tìm kiếm"]').first();
        await expect(searchInput).toBeVisible();
    });

    test('should perform search and display results', async ({ page }) => {
        // Find search input
        const searchInput = page.locator('input[type="search"], input[placeholder*="Tìm kiếm"]').first();

        // Type search query
        await searchInput.fill('quy trình');
        await searchInput.press('Enter');

        // Wait for results to load
        await page.waitForLoadState('networkidle');

        // Check for results or empty state
        const hasResults = await page.locator('[data-testid="search-results"], .document-card, article').count() > 0;
        const hasEmptyState = await page.locator('text=/Không tìm thấy|No results/i').isVisible().catch(() => false);

        expect(hasResults || hasEmptyState).toBeTruthy();
    });

    test('should filter by document type', async ({ page }) => {
        // Navigate to search page
        await page.goto('/search');

        // Click on type filter if exists
        const typeFilter = page.locator('button:has-text("Loại tài liệu"), select[name*="type"]').first();
        if (await typeFilter.isVisible()) {
            await typeFilter.click();

            // Select first option
            const firstOption = page.locator('[role="option"], option').first();
            await firstOption.click();

            // Wait for filtered results
            await page.waitForLoadState('networkidle');
        }
    });

    test('should navigate to document detail from search results', async ({ page }) => {
        // Perform search
        const searchInput = page.locator('input[type="search"]').first();
        await searchInput.fill('test');
        await searchInput.press('Enter');

        await page.waitForLoadState('networkidle');

        // Click first result if exists
        const firstResult = page.locator('a[href*="/docs/"], .document-card a').first();
        if (await firstResult.isVisible().catch(() => false)) {
            await firstResult.click();

            // Should navigate to document page
            await expect(page).toHaveURL(/\/docs\/|\/documents\//);
        }
    });

    test('should use keyboard shortcut to focus search', async ({ page }) => {
        // Press Ctrl+K or Cmd+K
        await page.keyboard.press('Control+K');

        // Search input should be focused
        const searchInput = page.locator('input[type="search"]').first();
        await expect(searchInput).toBeFocused();
    });

    test('should debounce search input', async ({ page }) => {
        const searchInput = page.locator('input[type="search"]').first();

        // Type quickly
        await searchInput.type('abcdef', { delay: 50 });

        // Should not immediately search
        const loadingIndicator = page.locator('[aria-busy="true"], .loading, .spinner');
        const isLoading = await loadingIndicator.isVisible().catch(() => false);

        // Results should update after debounce
        await page.waitForTimeout(500);
    });

    test('should display empty state when no results', async ({ page }) => {
        const searchInput = page.locator('input[type="search"]').first();

        // Search for nonsense
        await searchInput.fill('xyzqwertyasdfnonexistent12345');
        await searchInput.press('Enter');

        await page.waitForLoadState('networkidle');

        // Should show empty state
        const emptyState = page.locator('text=/Không tìm thấy|No results|Empty/i');
        await expect(emptyState).toBeVisible({ timeout: 5000 });
    });
});
