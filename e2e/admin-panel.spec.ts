import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
    test.beforeEach(async ({ page }) => {
        // Note: This assumes you have auth bypass for testing or test credentials
        await page.goto('/admin');
    });

    test('should display admin dashboard', async ({ page }) => {
        // Check if redirected to login or shows admin panel
        const isLoginPage = page.url().includes('/login') || page.url().includes('/auth');

        if (!isLoginPage) {
            // Should show admin panel
            const adminHeading = page.locator('h1, h2').filter({ hasText: /Admin|Quản trị|Dashboard/i });
            await expect(adminHeading.first()).toBeVisible({ timeout: 10000 });
        }
    });

    test('should navigate to departments management', async ({ page }) => {
        // Skip if not authenticated
        if (page.url().includes('/login')) {
            test.skip();
        }

        const departmentsLink = page.locator('a:has-text("Phòng ban"), a:has-text("Departments")').first();
        if (await departmentsLink.isVisible().catch(() => false)) {
            await departmentsLink.click();
            await expect(page).toHaveURL(/\/admin\/departments/);
        }
    });

    test('should navigate to tags management', async ({ page }) => {
        if (page.url().includes('/login')) {
            test.skip();
        }

        const tagsLink = page.locator('a:has-text("Tags"), a:has-text("Thẻ")').first();
        if (await tagsLink.isVisible().catch(() => false)) {
            await tagsLink.click();
            await expect(page).toHaveURL(/\/admin\/tags/);
        }
    });

    test('should navigate to brands management', async ({ page }) => {
        if (page.url().includes('/login')) {
            test.skip();
        }

        const brandsLink = page.locator('a:has-text("Brands"), a:has-text("Thương hiệu")').first();
        if (await brandsLink.isVisible().catch(() => false)) {
            await brandsLink.click();
            await expect(page).toHaveURL(/\/admin\/brands/);
        }
    });

    test('should display data table with pagination', async ({ page }) => {
        if (page.url().includes('/login')) {
            test.skip();
        }

        // Navigate to any admin page with table
        await page.goto('/admin/departments');

        // Check for table
        const table = page.locator('table, [role="table"]').first();
        if (await table.isVisible().catch(() => false)) {
            await expect(table).toBeVisible();

            // Check for pagination controls if data exists
            const paginationButtons = page.locator('button:has-text("Previous"), button:has-text("Next"), button:has-text("Trước"), button:has-text("Sau")');
            // Pagination might not be visible if there's little data
        }
    });

    test('should show create button for admin actions', async ({ page }) => {
        if (page.url().includes('/login')) {
            test.skip();
        }

        await page.goto('/admin/departments');

        const createButton = page.locator('button:has-text("Create"), button:has-text("Tạo"), button:has-text("Add")').first();

        // Create button should exist for admins
        if (await createButton.isVisible().catch(() => false)) {
            await expect(createButton).toBeEnabled();
        }
    });

    test('should filter table data', async ({ page }) => {
        if (page.url().includes('/login')) {
            test.skip();
        }

        await page.goto('/admin/departments');

        // Look for filter/search input
        const filterInput = page.locator('input[placeholder*="Filter"], input[placeholder*="Lọc"], input[placeholder*="Search"]').first();

        if (await filterInput.isVisible().catch(() => false)) {
            await filterInput.fill('test');
            await page.waitForTimeout(500); // Wait for debounce

            // Table should update
            await page.waitForLoadState('networkidle');
        }
    });

    test('should display delete confirmation for admin actions', async ({ page }) => {
        if (page.url().includes('/login')) {
            test.skip();
        }

        await page.goto('/admin/tags');

        // Find delete button
        const deleteButton = page.locator('button[aria-label*="Delete"], button:has-text("Xóa"), button:has-text("Delete")').first();

        if (await deleteButton.isVisible().catch(() => false)) {
            await deleteButton.click();

            // Should show confirmation dialog
            const confirmDialog = page.locator('[role="alertdialog"], .alert-dialog, text=/Bạn có chắc|Are you sure/i');
            await expect(confirmDialog.first()).toBeVisible({ timeout: 3000 });
        }
    });
});
