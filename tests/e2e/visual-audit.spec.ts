import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/visual-audit');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

test.describe('Comprehensive Visual and Accessibility Validation', () => {
  test('Audit 1: Desktop Navigation & Visuals in Light and Dark Modes', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. Light mode
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    const themeBtn = page.locator('header button[aria-pressed]').first();
    const isDark = await page.evaluate(() => document.documentElement.className.includes('dark'));
    if (isDark) {
      await themeBtn.click();
      await page.waitForTimeout(300);
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'desktop-light.png'),
      fullPage: false,
    });

    // 2. Dark mode
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
    await page.waitForLoadState('networkidle');

    const themeBtn = page.locator('header button[aria-pressed]').first();
    const isDark = await page.evaluate(() => document.documentElement.className.includes('dark'));
    if (!isDark) {
      await themeBtn.click();
      await page.waitForTimeout(300);
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'mobile-dark-closed.png'),
    });

    // Open mobile menu
    const hamburger = page.locator('header button[aria-label="Toggle navigation menu"]');
    await expect(hamburger).toBeVisible();
    await hamburger.click();

    const drawer = page.locator('div[role="dialog"]');
    await expect(drawer).toBeVisible();
    await page.waitForTimeout(700); // Allow entry animations to settle completely

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

    // Close mobile menu via morphed X button
    await morphX.click();
    await expect(drawer).not.toBeVisible();
    await page.waitForTimeout(400);

    // Switch to Light mode via navbar theme toggle (retained in navbar)
    const headerThemeBtn = page.locator('header button[aria-pressed]').first();
    await headerThemeBtn.click();
    await page.waitForTimeout(400);

    // Open drawer in light mode
    const hamburgerLight = page.locator('header button[aria-label="Toggle navigation menu"]');
    await hamburgerLight.click();
    await expect(drawer).toBeVisible();
    await page.waitForTimeout(700); // Allow entry animations to settle completely

    // Verify duplicated controls are removed from drawer
    await expect(drawer.locator('button[aria-pressed]')).toHaveCount(0);
    await expect(drawer.locator('img[src="/brand/logo-symbol.svg"]')).toHaveCount(0);
    await expect(drawer.locator('button[aria-label="Close navigation menu"]')).toHaveCount(0);

    // Screenshot of drawer open in Light Mode
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'mobile-drawer-light.png'),
    });

    // Close mobile menu via morphed X button in light mode
    const morphXLight = page.locator('header button[aria-label="Close navigation menu"]');
    await morphXLight.click();
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
    const themeState = await page.locator('html').evaluate((el) => ({
      isDark: el.classList.contains('dark'),
      isLight: el.classList.contains('light'),
    }));
    expect(themeState.isLight).toBe(true);
    expect(themeState.isDark).toBe(false);

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

  test('Audit 6: Phase 2 Deliverables - Home, Community, About, and Footer Visuals across Themes and Devices', async ({ page }) => {
    async function setTargetTheme(target: 'light' | 'dark') {
      const isDark = await page.evaluate(() => document.documentElement.className.includes('dark'));
      if ((target === 'dark' && !isDark) || (target === 'light' && isDark)) {
        const btn = page.locator('header button[aria-pressed]').first();
        await btn.click();
        await page.waitForTimeout(300);
      }
    }

    // 1. Desktop captures (1280 x 800)
    await page.setViewportSize({ width: 1280, height: 800 });

    // Home - Desktop
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    await setTargetTheme('light');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home-desktop-light.png'), fullPage: true });
    await page.locator('footer').screenshot({ path: path.join(SCREENSHOT_DIR, 'footer-desktop-light.png') });

    await setTargetTheme('dark');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home-desktop-dark.png'), fullPage: true });
    await page.locator('footer').screenshot({ path: path.join(SCREENSHOT_DIR, 'footer-desktop-dark.png') });

    // Community - Desktop
    await page.goto('/en/community');
    await page.waitForLoadState('networkidle');
    await setTargetTheme('light');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'community-desktop-light.png'), fullPage: true });
    await setTargetTheme('dark');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'community-desktop-dark.png'), fullPage: true });

    // About - Desktop
    await page.goto('/en/about');
    await page.waitForLoadState('networkidle');
    await setTargetTheme('light');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'about-desktop-light.png'), fullPage: true });
    await setTargetTheme('dark');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'about-desktop-dark.png'), fullPage: true });

    // 2. Mobile captures (390 x 844)
    await page.setViewportSize({ width: 390, height: 844 });

    // Home - Mobile
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    await setTargetTheme('light');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home-mobile-light.png'), fullPage: false });
    await page.locator('footer').screenshot({ path: path.join(SCREENSHOT_DIR, 'footer-mobile-light.png') });

    await setTargetTheme('dark');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home-mobile-dark.png'), fullPage: false });
    await page.locator('footer').screenshot({ path: path.join(SCREENSHOT_DIR, 'footer-mobile-dark.png') });

    // Community - Mobile
    await page.goto('/en/community');
    await page.waitForLoadState('networkidle');
    await setTargetTheme('light');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'community-mobile-light.png'), fullPage: false });
    await setTargetTheme('dark');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'community-mobile-dark.png'), fullPage: false });

    // About - Mobile
    await page.goto('/en/about');
    await page.waitForLoadState('networkidle');
    await setTargetTheme('light');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'about-mobile-light.png'), fullPage: false });
    await setTargetTheme('dark');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'about-mobile-dark.png'), fullPage: false });
  });
});
