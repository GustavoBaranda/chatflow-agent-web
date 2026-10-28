import { test, expect } from '@playwright/test';

test.describe('Navigation and Localization Suite', () => {
  test('should redirect root path to an authoritative localized route with explicit prefix', async ({ page }) => {
    await page.goto('/');
    // Must redirect to /en or /es
    await expect(page).toHaveURL(/\/(en|es)/);
  });

  test('should render English layout with header, brand, and skip link', async ({ page }) => {
    await page.goto('/en');

    // Skip to content link
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();

    // Brand logo & title
    const brand = page.locator('header a[aria-label="chatflow-agent home"]');
    await expect(brand).toBeVisible();
    await expect(brand).toContainText('chatflow-agent');

    // Header nav links
    await expect(page.locator('header nav a[href="/en/docs"]')).toBeAttached();
    await expect(page.locator('header nav a[href="/en/community"]')).toBeAttached();

    // Language selector
    const langBtn = page.locator('header button[aria-label="Change language"]');
    await expect(langBtn).toBeAttached();

    // Theme toggle button
    const themeBtn = page.locator('header button[aria-pressed]').first();
    await expect(themeBtn).toBeVisible();

    // Footer
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('chatflow-agent');
    await expect(footer).toContainText('MIT License');
  });

  test('should switch language from English to Spanish', async ({ page }) => {
    await page.goto('/en');

    // Check English heading
    await expect(page.locator('h1')).toHaveText('chatflow-agent');

    // Open language selector
    const langBtn = page.locator('header button[aria-label="Change language"]').first();
    await langBtn.click();

    // Select Spanish option
    const esOption = page.locator('ul[role="listbox"] li', { hasText: 'Español' });
    await expect(esOption).toBeVisible();
    await esOption.click();

    // URL should now be /es
    await expect(page).toHaveURL(/\/es/);

    // Document lang attribute should be 'es'
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('es');
  });

  test('should toggle theme and update html class', async ({ page }) => {
    await page.goto('/en');

    const themeBtn = page.locator('header button[aria-pressed]').first();
    await expect(themeBtn).toBeVisible();

    const initialTheme = await page.locator('html').getAttribute('class');
    await themeBtn.click();

    // The theme class should have been toggled
    const updatedTheme = await page.locator('html').getAttribute('class');
    expect(updatedTheme).not.toBe(initialTheme);
  });

  test('should support keyboard navigation in mobile drawer on small screens', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/en');

    // Hamburger button should be visible
    const hamburger = page.locator('header button[aria-label="Toggle navigation menu"]');
    await expect(hamburger).toBeVisible();

    // Open drawer
    await hamburger.click();

    // Drawer should be open
    const drawer = page.locator('div[role="dialog"]');
    await expect(drawer).toBeVisible();

    // Body scroll should be locked via html.menu-open
    await expect(page.locator('html')).toHaveClass(/menu-open/);

    // Press Escape to close
    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();
    await expect(page.locator('html')).not.toHaveClass(/menu-open/);
  });

  test('should close mobile drawer when clicking the morphed X button in navbar', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/en');

    const hamburger = page.locator('header button[aria-label="Toggle navigation menu"]');
    await hamburger.click();

    const drawer = page.locator('div[role="dialog"]');
    await expect(drawer).toBeVisible();

    // In open state, the hamburger button has morphed into the X and updated its label
    const morphX = page.locator('header button[aria-label="Close navigation menu"]');
    await expect(morphX).toBeVisible();
    await morphX.click();

    await expect(drawer).not.toBeVisible();
    // After closing, label returns to Toggle navigation menu
    await expect(hamburger).toBeVisible();
  });
});
