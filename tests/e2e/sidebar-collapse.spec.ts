import { test, expect } from '@playwright/test';

test.describe('Fumadocs Sidebar Collapse and Expand Cycle Suite', () => {
  const locales = ['en', 'es', 'pt-BR'];

  for (const locale of locales) {
    test(`should collapse and expand sidebar repeatedly on desktop in ${locale}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/${locale}/docs`);
      await page.waitForLoadState('networkidle');

      const sidebar = page.locator('#nd-sidebar');
      await expect(sidebar).toBeVisible({ timeout: 15000 });

      // Locate the collapse button inside the sidebar
      const collapseBtn = sidebar.getByRole('button', { name: /collapse/i }).first();
      await expect(collapseBtn).toBeVisible({ timeout: 10000 });

      // Cycle 1: Collapse the sidebar (with hydration resilience for cold browser starts)
      await collapseBtn.click();
      try {
        await expect(sidebar).toHaveAttribute('data-collapsed', 'true', { timeout: 3000 });
      } catch {
        await collapseBtn.click();
        await expect(sidebar).toHaveAttribute('data-collapsed', 'true', { timeout: 10000 });
      }

      // The restore panel button must now be visible and clickable
      const restorePanel = page.locator('[data-sidebar-panel]');
      await expect(restorePanel).toBeVisible({ timeout: 10000 });

      // Allow 250ms CSS animation to settle
      await page.waitForTimeout(300);

      // Ensure the restore panel is located BELOW the 56px sticky Navbar
      const panelBox = await restorePanel.boundingBox();
      expect(panelBox).not.toBeNull();
      expect(panelBox!.y).toBeGreaterThanOrEqual(56);

      // Verify the element at the center of the restore panel is not intercepted by the Navbar
      const elementAtPoint = await page.evaluate(({ x, y, width, height }) => {
        const el = document.elementFromPoint(x + width / 2, y + height / 2);
        return el ? { tagName: el.tagName, className: el.className } : null;
      }, panelBox!);
      expect(elementAtPoint?.tagName).not.toBe('HEADER');

      // Click the restore button to expand the sidebar
      const expandBtn = restorePanel.locator('button').first();
      await expect(expandBtn).toBeVisible({ timeout: 10000 });
      await expandBtn.click();
      await expect(sidebar).toHaveAttribute('data-collapsed', 'false', { timeout: 10000 });

      // Allow 250ms CSS animation to settle
      await page.waitForTimeout(300);

      // Navigation links should be visible and usable
      const docsOverviewLink = sidebar.locator('a[href*="/docs"]').first();
      await expect(docsOverviewLink).toBeVisible();

      // Cycle 2: Collapse and expand a second time to ensure state machine stability
      await collapseBtn.click();
      await expect(sidebar).toHaveAttribute('data-collapsed', 'true', { timeout: 10000 });
      await expect(restorePanel).toBeVisible({ timeout: 10000 });

      await page.waitForTimeout(300);

      await expandBtn.click();
      await expect(sidebar).toHaveAttribute('data-collapsed', 'false', { timeout: 10000 });
      await expect(docsOverviewLink).toBeVisible();
    });
  }

  test('should ensure duplicated theme switch is absent from Fumadocs sidebar while header switch works', async ({ page }) => {
    await page.goto('/en/docs');
    await page.waitForLoadState('networkidle');

    // Sidebar should NOT have a theme toggle button
    const sidebar = page.locator('#nd-sidebar');
    await expect(sidebar).toBeVisible({ timeout: 15000 });
    const sidebarThemeToggles = sidebar.locator('button[aria-label*="theme" i], [data-theme-toggle="true"], button:has(svg.lucide-sun), button:has(svg.lucide-moon)');
    await expect(sidebarThemeToggles).toHaveCount(0);

    // Global Header MUST have its theme toggle visible and operational
    const headerThemeToggle = page.locator('header button[aria-label*="dark" i], header button[aria-label*="light" i]').first();
    await expect(headerThemeToggle).toBeVisible();

    // Test toggling theme via header
    const initialThemeClass = await page.evaluate(() => document.documentElement.className);
    await headerThemeToggle.click();
    await page.waitForTimeout(200);
    const newThemeClass = await page.evaluate(() => document.documentElement.className);
    expect(newThemeClass).not.toBe(initialThemeClass);
  });
});
