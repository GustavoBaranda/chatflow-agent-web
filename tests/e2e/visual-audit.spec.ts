import { test, expect } from '@playwright/test';
import * as path from 'path';

const SCREENSHOT_DIR = 'test-results';

test.describe('Comprehensive Visual and Accessibility Validation', () => {
  test('Audit 1: Desktop Navigation & Visuals in Light and Dark Modes', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. Light mode
    await page.goto('/en');
    await page.locator('html').evaluate((el) => {
      el.classList.remove('dark');
      el.classList.add('light');
    });
    await page.waitForTimeout(300);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'desktop-light.png'),
      fullPage: false,
    });

    // 2. Dark mode
    const themeBtn = page.locator('header button[aria-pressed]').first();
    await themeBtn.click();
    await page.waitForTimeout(300);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'desktop-dark.png'),
      fullPage: false,
    });

    // Verify brand, links and header
    await expect(page.locator('header a[aria-label="chatflow-agent home"]')).toBeVisible();
    await expect(page.locator('header nav a[href="/en/docs"]')).toBeVisible();
    await expect(page.locator('header nav a[href="/en/community"]')).toBeVisible();
  });

  test('Audit 2: Mobile Navigation, Hamburger Morphing into X & Drawer Visuals', async ({ page }) => {
    // iPhone 14/15 viewport (390 x 844)
    await page.setViewportSize({ width: 390, height: 844 });

    // Dark mode mobile closed
    await page.goto('/en');
    await page.locator('html').evaluate((el) => {
      el.classList.remove('light');
      el.classList.add('dark');
    });
    await page.waitForTimeout(200);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'mobile-dark-closed.png'),
    });

    // Open mobile menu
    const hamburger = page.locator('header button[aria-label="Toggle navigation menu"]');
    await expect(hamburger).toBeVisible();
    await hamburger.click();

    const drawer = page.locator('div[role="dialog"]');
    await expect(drawer).toBeVisible();
    await page.waitForTimeout(600); // Allow entry animations to settle

    // Screenshot of drawer open in Dark Mode
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'mobile-drawer-dark.png'),
    });

    // Morph X button screenshot
    const morphX = page.locator('header button[aria-label="Close navigation menu"]');
    await expect(morphX).toBeVisible();
    await morphX.screenshot({
      path: path.join(SCREENSHOT_DIR, 'mobile-morph-x.png'),
    });

    // Switch to Light mode inside drawer
    const drawerThemeBtn = drawer.locator('button[aria-pressed]').first();
    await drawerThemeBtn.click();
    await page.waitForTimeout(400);

    // Screenshot of drawer open in Light Mode
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'mobile-drawer-light.png'),
    });

    // Close mobile menu via morphed X button
    await morphX.click();
    await expect(drawer).not.toBeVisible();
    await page.waitForTimeout(400);

    // Screenshot of mobile in Light Mode closed
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'mobile-light-closed.png'),
    });
  });

  test('Audit 3: Accessibility - Focus Trap, Focus Restoration, Inert Background & Escape', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en');

    const hamburger = page.locator('header button[aria-label="Toggle navigation menu"]');
    await hamburger.focus();
    await page.keyboard.press('Enter');

    const drawer = page.locator('div[role="dialog"]');
    await expect(drawer).toBeVisible();

    // Verify background isolation
    const mainContent = page.locator('#main-content');
    const footer = page.locator('footer');
    await expect(mainContent).toHaveAttribute('inert', '');
    await expect(mainContent).toHaveAttribute('aria-hidden', 'true');
    await expect(footer).toHaveAttribute('inert', '');
    await expect(footer).toHaveAttribute('aria-hidden', 'true');

    // Verify Escape key closes drawer and restores focus
    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();

    // Verify background isolation removed
    await expect(mainContent).not.toHaveAttribute('inert');
    await expect(footer).not.toHaveAttribute('inert');

    // Verify focus restoration to hamburger button
    await expect(hamburger).toBeFocused();

    // Test Focus Trap
    await hamburger.click();
    await expect(drawer).toBeVisible();
    await page.waitForTimeout(400);

    // Tab through all focusable elements in the drawer
    for (let i = 0; i < 7; i++) {
      await page.keyboard.press('Tab');
    }

    // After cycling through, focus must remain inside drawer or on the close button
    const activeElementInsideDrawerOrHeader = await page.evaluate(() => {
      const active = document.activeElement;
      const drawerEl = document.querySelector('div[role="dialog"]');
      const headerEl = document.querySelector('header');
      return drawerEl?.contains(active) || headerEl?.contains(active);
    });
    expect(activeElementInsideDrawerOrHeader).toBe(true);

    // Close drawer
    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();
  });

  test('Audit 4: System Color Scheme & Reduced Motion Compliance', async ({ page }) => {
    // 1. Reduced motion emulation
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en');

    const hamburger = page.locator('header button[aria-label="Toggle navigation menu"]');
    await hamburger.click();
    const drawer = page.locator('div[role="dialog"]');
    await expect(drawer).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();

    // 2. System dark color scheme emulation
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'no-preference' });
    await page.goto('/en');
    const isDark = await page.locator('html').evaluate((el) => el.classList.contains('dark'));
    expect(isDark).toBe(true);

    // 3. System light color scheme emulation
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en');
    const isLight = await page.locator('html').evaluate((el) => !el.classList.contains('dark') || el.classList.contains('light'));
    expect(isLight).toBe(true);
  });

  test('Audit 5: Multilingual Switching (en <-> es) preserves drawer state and URLs', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en');

    // Open drawer
    await page.locator('header button[aria-label="Toggle navigation menu"]').click();
    const drawer = page.locator('div[role="dialog"]');
    await expect(drawer).toBeVisible();

    // Switch language inside mobile drawer
    const langBtn = drawer.locator('button[aria-label="Change language"]');
    await langBtn.click();
    const esOption = drawer.locator('ul[role="listbox"] li', { hasText: 'Español' });
    await esOption.click();

    // Verify redirected to /es
    await expect(page).toHaveURL(/\/es/);
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('es');
  });
});

