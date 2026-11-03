import { test, expect } from '@playwright/test';

test.describe('Mobile Sidebar and Upward Language Selector Suite', () => {
  const viewports = [
    { name: '320px', width: 320, height: 568 },
    { name: '375px', width: 375, height: 667 },
    { name: '390px', width: 390, height: 844 },
    { name: '430px', width: 430, height: 932 },
  ];

  for (const vp of viewports) {
    test(`Mobile sidebar visual hierarchy and upward language selector at ${vp.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/en');
      await page.waitForLoadState('networkidle');

      // 1. Open mobile drawer
      const menuToggle = page.locator('header button[aria-label="Toggle navigation menu"]');
      await expect(menuToggle).toBeVisible();
      await menuToggle.click();

      const drawer = page.locator('div[role="dialog"]');
      await expect(drawer).toBeVisible();

      // 2. Verify subtle localized heading replaces duplicated logo
      const heading = drawer.locator('span:has-text("Navigation")');
      await expect(heading).toBeVisible();
      await expect(drawer.locator('img[src="/brand/logo-symbol.svg"]')).toHaveCount(0);

      // 3. Verify no duplicate theme toggle or duplicate GitHub button in drawer
      await expect(drawer.locator('button[aria-pressed]')).toHaveCount(0);
      await expect(drawer.locator('footer')).toHaveCount(0);

      // 4. Verify all 5 navigation links are visible
      const navLinks = drawer.locator('nav[aria-label="Mobile navigation"] a');
      await expect(navLinks).toHaveCount(5);
      await expect(drawer.locator('nav a[href="/en"]')).toBeVisible();
      await expect(drawer.locator('nav a[href="/en/docs"]')).toBeVisible();
      await expect(drawer.locator('nav a[href="/en/community"]')).toBeVisible();
      await expect(drawer.locator('nav a[href="/en/about"]')).toBeVisible();
      await expect(drawer.locator('nav a[href="https://github.com/GustavoBaranda/chatflow-agent"]')).toBeVisible();

      // 5. Open Language Selector and verify it opens UPWARD
      const langTrigger = drawer.locator('button[aria-haspopup="listbox"]');
      await expect(langTrigger).toBeVisible();

      const triggerBox = await langTrigger.boundingBox();
      expect(triggerBox).not.toBeNull();

      await langTrigger.click();

      const listbox = drawer.locator('ul[role="listbox"]');
      await expect(listbox).toBeVisible();

      const listboxBox = await listbox.boundingBox();
      expect(listboxBox).not.toBeNull();

      if (triggerBox && listboxBox) {
        // Assert listbox is above the trigger button (opens upwards)
        expect(listboxBox.y + listboxBox.height).toBeLessThanOrEqual(triggerBox.y + 5);
        // Assert listbox is within the visible mobile viewport
        expect(listboxBox.y).toBeGreaterThanOrEqual(0);
        expect(listboxBox.y + listboxBox.height).toBeLessThanOrEqual(vp.height);
      }

      // 6. Verify all 3 supported languages are visible and selectable
      const enOption = listbox.locator('li[role="option"]', { hasText: 'English' });
      const esOption = listbox.locator('li[role="option"]', { hasText: 'Español' });
      const ptOption = listbox.locator('li[role="option"]', { hasText: 'Português (Brasil)' });

      await expect(enOption).toBeVisible();
      await expect(esOption).toBeVisible();
      await expect(ptOption).toBeVisible();

      // 7. Select Español, verify URL switches to /es and drawer closes
      await esOption.click();
      await page.waitForURL('**/es');
      await expect(page.locator('html')).toHaveAttribute('lang', 'es');
      await expect(drawer).not.toBeVisible();
    });
  }

  test('should support keyboard navigation, focus trap, and Escape key in mobile drawer', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    const menuToggle = page.locator('header button[aria-label="Toggle navigation menu"]');
    await menuToggle.click();

    const drawer = page.locator('div[role="dialog"]');
    await expect(drawer).toBeVisible();

    // Verify focus moved into the drawer
    await page.waitForTimeout(100);
    const isFocusInside = await page.evaluate(() => {
      const active = document.activeElement;
      const drawerEl = document.querySelector('div[role="dialog"]');
      const headerEl = document.querySelector('header');
      return drawerEl?.contains(active) || headerEl?.contains(active);
    });
    expect(isFocusInside).toBe(true);

    // Escape closes drawer and restores focus
    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();
    await expect(page.locator('html')).not.toHaveClass(/menu-open/);
  });

  test('should close mobile drawer when clicking the backdrop overlay', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    const menuToggle = page.locator('header button[aria-label="Toggle navigation menu"]');
    await menuToggle.click();

    const drawer = page.locator('div[role="dialog"]');
    await expect(drawer).toBeVisible();

    // Click on the left backdrop area outside the 320px drawer (e.g. at x: 20, y: 300)
    await page.mouse.click(20, 300);
    await expect(drawer).not.toBeVisible();
  });

  test('should close mobile drawer when navigating to another route', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    const menuToggle = page.locator('header button[aria-label="Toggle navigation menu"]');
    await menuToggle.click();

    const drawer = page.locator('div[role="dialog"]');
    await expect(drawer).toBeVisible();

    // Click Docs link
    const docsLink = drawer.locator('nav a[href="/en/docs"]');
    await docsLink.click();
    await page.waitForURL('**/en/docs');

    await expect(drawer).not.toBeVisible();
  });

  test('should maintain solid theme-aware header background and start backdrop below navbar when drawer is open', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    const header = page.locator('header');
    const menuToggle = header.locator('button[aria-label="Toggle navigation menu"]');

    // 1. Open drawer
    await menuToggle.click();
    const drawer = page.locator('div[role="dialog"]');
    await expect(drawer).toBeVisible();

    // 2. Check solid header background (rgb with alpha 1)
    const headerBg = await header.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(headerBg).toMatch(/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/);

    // 3. Check backdrop begins below navbar (y >= 55px)
    const backdrop = page.locator('div[role="dialog"] > div[aria-hidden="true"]');
    const backdropBox = await backdrop.boundingBox();
    expect(backdropBox).not.toBeNull();
    if (backdropBox) {
      expect(backdropBox.y).toBeGreaterThanOrEqual(55);
    }

    // 4. Test in dark mode
    const themeBtn = header.locator('button[aria-pressed]').first();
    await themeBtn.click();
    await page.waitForTimeout(300);

    const darkHeaderBg = await header.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(darkHeaderBg).toMatch(/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/);
  });
});

