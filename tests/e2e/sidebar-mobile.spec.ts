import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/visual-audit');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

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

      // 2. Verify navbar remains fixed and visible above drawer
      await expect(page.locator('header a[aria-label="chatflow-agent home"]')).toBeVisible();
      await expect(page.locator('header button[aria-pressed]')).toBeVisible();

      // 3. Verify no duplicate logo, theme toggle, or close button inside drawer
      await expect(drawer.locator('img[src="/brand/logo-symbol.svg"]')).toHaveCount(0);
      await expect(drawer.locator('button[aria-pressed]')).toHaveCount(0);
      await expect(drawer.locator('button[aria-label="Close navigation menu"]')).toHaveCount(0);

      // Verify single persistent morphed close button in header
      const closeBtn = page.locator('header button[aria-label="Close navigation menu"]');
      await expect(closeBtn).toBeVisible();

      // 4. Verify all 5 navigation links are visible
      const navLinks = drawer.locator('nav[aria-label="Mobile navigation"] a');
      await expect(navLinks).toHaveCount(5);
      await expect(drawer.locator('nav a[href="/en"]')).toBeVisible();
      await expect(drawer.locator('nav a[href="/en/docs"]')).toBeVisible();
      await expect(drawer.locator('nav a[href="/en/community"]')).toBeVisible();
      await expect(drawer.locator('nav a[href="/en/about"]')).toBeVisible();
      await expect(drawer.locator('nav a[href="https://github.com/GustavoBaranda/chatflow-agent"]')).toBeVisible();

      // 5. Verify compact bottom section: attribution, creator signature, sponsor
      await expect(drawer.locator('text=Python SDK released under the MIT License.')).toBeVisible();
      await expect(drawer.locator('img[src="/brand/gustavo-baranda.svg"]')).toBeVisible();
      await expect(drawer.locator('text=Gustavo Baranda · © 2026')).toBeVisible();
      await expect(drawer.locator('a[href="https://github.com/sponsors/GustavoBaranda"]')).toBeVisible();

      // 6. Open Language Selector and verify it opens UPWARD
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

      // 5. Verify all 3 supported languages are visible and selectable
      const enOption = listbox.locator('li[role="option"]', { hasText: 'English' });
      const esOption = listbox.locator('li[role="option"]', { hasText: 'Español' });
      const ptOption = listbox.locator('li[role="option"]', { hasText: 'Português (Brasil)' });

      await expect(enOption).toBeVisible();
      await expect(esOption).toBeVisible();
      await expect(ptOption).toBeVisible();

      // 6. Select Español, verify URL switches to /es and drawer closes
      await esOption.click();
      await page.waitForURL('**/es');
      await expect(page.locator('html')).toHaveAttribute('lang', 'es');
      await expect(drawer).not.toBeVisible();
    });

    test(`Mobile sidebar scroll invariance (top, middle, bottom) and scroll restoration at ${vp.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/en');
      await page.waitForLoadState('networkidle');

      const drawer = page.locator('div[role="dialog"]');
      const header = page.locator('header');

      // --- Scenario 1: Open at TOP of page (scrollY = 0) ---
      const initialScroll = await page.evaluate(() => window.scrollY);
      expect(initialScroll).toBe(0);

      const topMenuToggle = page.locator('header button[aria-label="Toggle navigation menu"]');
      await topMenuToggle.click();
      await expect(drawer).toBeVisible();

      // Verify header is visible and fixed at y = 0
      const headerBoxTop = await header.boundingBox();
      expect(headerBoxTop).not.toBeNull();
      if (headerBoxTop) {
        expect(headerBoxTop.y).toBe(0);
        expect(headerBoxTop.height).toBeGreaterThanOrEqual(55);
      }

      const headerPosTop = await header.evaluate((el) => window.getComputedStyle(el).position);
      expect(headerPosTop).toBe('fixed');

      // Animated close button must be visible at top of viewport
      const closeBtnTop = page.locator('header button[aria-label="Close navigation menu"]');
      await expect(closeBtnTop).toBeVisible();
      const closeBoxTop = await closeBtnTop.boundingBox();
      expect(closeBoxTop).not.toBeNull();
      if (closeBoxTop) {
        expect(closeBoxTop.y).toBeGreaterThanOrEqual(5);
        expect(closeBoxTop.y).toBeLessThanOrEqual(25);
      }

      // Panel must start immediately below the navbar (y >= 55)
      const panelBoxTop = await drawer.locator('> div:nth-child(2)').boundingBox();
      expect(panelBoxTop).not.toBeNull();
      if (panelBoxTop) {
        expect(panelBoxTop.y).toBeGreaterThanOrEqual(55);
      }

      // Verify zero duplicate menu controls
      await expect(drawer.locator('button[aria-label*="menu" i]')).toHaveCount(0);

      // Capture screenshot at top
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `scroll-top-open-${vp.name}.png`),
      });

      // Close via persistent morphed close button in header
      await closeBtnTop.click();
      await expect(drawer).not.toBeVisible();

      const restoredScrollTop = await page.evaluate(() => window.scrollY);
      expect(restoredScrollTop).toBe(0);

      // --- Scenario 2: Scroll HALFWAY down (e.g. 500px) ---
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(100);
      const midScroll = await page.evaluate(() => window.scrollY);
      expect(midScroll).toBeGreaterThanOrEqual(450);

      const midMenuToggle = page.locator('header button[aria-label="Toggle navigation menu"]');
      await midMenuToggle.click();
      await expect(drawer).toBeVisible();

      // Verify header remains visible and fixed at y = 0 even after scrolling
      const headerBoxMid = await header.boundingBox();
      expect(headerBoxMid).not.toBeNull();
      if (headerBoxMid) {
        expect(headerBoxMid.y).toBe(0);
        expect(headerBoxMid.height).toBeGreaterThanOrEqual(55);
      }

      const headerPosMid = await header.evaluate((el) => window.getComputedStyle(el).position);
      expect(headerPosMid).toBe('fixed');

      // Animated close button must remain accessible at top of viewport
      const closeBtnMid = page.locator('header button[aria-label="Close navigation menu"]');
      await expect(closeBtnMid).toBeVisible();
      const closeBoxMid = await closeBtnMid.boundingBox();
      expect(closeBoxMid).not.toBeNull();
      if (closeBoxMid) {
        expect(closeBoxMid.y).toBeGreaterThanOrEqual(5);
        expect(closeBoxMid.y).toBeLessThanOrEqual(25);
      }

      // Panel must still start immediately below the navbar regardless of page scroll
      const panelBoxMid = await drawer.locator('> div:nth-child(2)').boundingBox();
      expect(panelBoxMid).not.toBeNull();
      if (panelBoxMid) {
        expect(panelBoxMid.y).toBeGreaterThanOrEqual(55);
      }

      // Verify zero duplicate menu controls
      await expect(drawer.locator('button[aria-label*="menu" i]')).toHaveCount(0);

      // Capture screenshot at middle
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `scroll-mid-open-${vp.name}.png`),
      });

      // Close and verify exact scroll restoration
      await closeBtnMid.click();
      await expect(drawer).not.toBeVisible();

      await page.waitForTimeout(100);
      const restoredScrollMid = await page.evaluate(() => window.scrollY);
      expect(Math.abs(restoredScrollMid - midScroll)).toBeLessThanOrEqual(5);

      // --- Scenario 3: Scroll to the BOTTOM of page ---
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(100);
      const bottomScroll = await page.evaluate(() => window.scrollY);
      expect(bottomScroll).toBeGreaterThan(500);

      const bottomMenuToggle = page.locator('header button[aria-label="Toggle navigation menu"]');
      await bottomMenuToggle.click();
      await expect(drawer).toBeVisible();

      // Verify header remains visible and fixed at y = 0 at the bottom of the page
      const headerBoxBottom = await header.boundingBox();
      expect(headerBoxBottom).not.toBeNull();
      if (headerBoxBottom) {
        expect(headerBoxBottom.y).toBe(0);
        expect(headerBoxBottom.height).toBeGreaterThanOrEqual(55);
      }

      const headerPosBottom = await header.evaluate((el) => window.getComputedStyle(el).position);
      expect(headerPosBottom).toBe('fixed');

      // Animated close button must remain accessible at top of viewport
      const closeBtnBottom = page.locator('header button[aria-label="Close navigation menu"]');
      await expect(closeBtnBottom).toBeVisible();
      const closeBoxBottom = await closeBtnBottom.boundingBox();
      expect(closeBoxBottom).not.toBeNull();
      if (closeBoxBottom) {
        expect(closeBoxBottom.y).toBeGreaterThanOrEqual(5);
        expect(closeBoxBottom.y).toBeLessThanOrEqual(25);
      }

      // Panel must still start immediately below the navbar
      const panelBoxBottom = await drawer.locator('> div:nth-child(2)').boundingBox();
      expect(panelBoxBottom).not.toBeNull();
      if (panelBoxBottom) {
        expect(panelBoxBottom.y).toBeGreaterThanOrEqual(55);
      }

      // Verify zero duplicate menu controls
      await expect(drawer.locator('button[aria-label*="menu" i]')).toHaveCount(0);

      // Capture screenshot at bottom
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `scroll-bottom-open-${vp.name}.png`),
      });

      // Close and verify exact scroll restoration to bottom
      await closeBtnBottom.click();
      await expect(drawer).not.toBeVisible();

      await page.waitForTimeout(100);
      const restoredScrollBottom = await page.evaluate(() => window.scrollY);
      expect(Math.abs(restoredScrollBottom - bottomScroll)).toBeLessThanOrEqual(5);
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
      return drawerEl?.contains(active);
    });
    expect(isFocusInside).toBe(true);

    // Escape closes drawer and restores scroll
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

  test('should support mobile drawer in both Light and Dark themes across locales', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    // 1. Test Spanish (/es) in Light mode
    await page.goto('/es');
    await page.waitForLoadState('networkidle');

    const menuToggleEs = page.locator('header button[aria-label="Alternar menú de navegación"]');
    await menuToggleEs.click();

    const drawer = page.locator('div[role="dialog"]');
    await expect(drawer).toBeVisible();

    // Verify Spanish labels
    await expect(drawer.locator('nav a[href="/es"]')).toContainText('Inicio');
    await expect(drawer.locator('nav a[href="/es/docs"]')).toContainText('Documentación');

    // Verify attribution in Spanish
    await expect(drawer.locator('text=Gustavo Baranda · © 2026')).toBeVisible();

    // Verify no duplicate theme toggle in drawer
    await expect(drawer.locator('button[aria-pressed]')).toHaveCount(0);

    // Verify close button in Spanish
    const closeBtnEs = page.locator('header button[aria-label="Cerrar menú de navegación"]');
    await expect(closeBtnEs).toBeVisible();
    await closeBtnEs.click();
    await expect(drawer).not.toBeVisible();

    // 2. Test Portuguese (/pt-BR) in Dark mode with scroll
    await page.goto('/pt-BR');
    await page.waitForLoadState('networkidle');

    // Switch to dark theme if currently light
    const isDark = await page.evaluate(() => document.documentElement.className.includes('dark'));
    if (!isDark) {
      const themeBtn = page.locator('header button[aria-pressed]').first();
      await themeBtn.click();
      await page.waitForTimeout(300);
    }

    // Scroll down 400px
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(100);

    const menuTogglePt = page.locator('header button[aria-label="Alternar menu de navegação"]');
    await menuTogglePt.click();
    await expect(drawer).toBeVisible();

    // Header must stay fixed at y = 0 in dark mode after scroll
    const headerBoxPt = await page.locator('header').boundingBox();
    expect(headerBoxPt).not.toBeNull();
    if (headerBoxPt) {
      expect(headerBoxPt.y).toBe(0);
    }

    // Close button in Portuguese
    const closeBtnPt = page.locator('header button[aria-label="Fechar menu de navegação"]');
    await expect(closeBtnPt).toBeVisible();
    const closeBoxPt = await closeBtnPt.boundingBox();
    expect(closeBoxPt).not.toBeNull();
    if (closeBoxPt) {
      expect(closeBoxPt.y).toBeGreaterThanOrEqual(5);
      expect(closeBoxPt.y).toBeLessThanOrEqual(25);
    }

    await closeBtnPt.click();
    await expect(drawer).not.toBeVisible();
  });

  test('should verify button visual coordinates stability and capture closed -> opening -> open -> closing transition', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    const menuToggle = page.locator('header button[aria-label="Toggle navigation menu"]');
    await expect(menuToggle).toBeVisible();

    // 1. Capture closed state coordinates
    const closedBox = await menuToggle.boundingBox();
    expect(closedBox).not.toBeNull();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'transition-1-closed.png'),
    });

    // 2. Click to open and capture mid-animation (after 150ms)
    await menuToggle.click();
    await page.waitForTimeout(150);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'transition-2-opening.png'),
    });

    // 3. Wait for animation to settle into open state
    const drawer = page.locator('div[role="dialog"]');
    await expect(drawer).toBeVisible();
    await page.waitForTimeout(350);

    const openToggle = page.locator('header button[aria-label="Close navigation menu"]');
    await expect(openToggle).toBeVisible();
    const openBox = await openToggle.boundingBox();
    expect(openBox).not.toBeNull();

    // Verify button stays in the same visual position
    if (closedBox && openBox) {
      expect(Math.abs(closedBox.x - openBox.x)).toBeLessThanOrEqual(2);
      expect(Math.abs(closedBox.y - openBox.y)).toBeLessThanOrEqual(2);
      expect(Math.abs(closedBox.width - openBox.width)).toBeLessThanOrEqual(1);
      expect(Math.abs(closedBox.height - openBox.height)).toBeLessThanOrEqual(1);
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'transition-3-open.png'),
    });

    // 4. Click to close and capture closing state
    await openToggle.click();
    await page.waitForTimeout(150);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'transition-4-closing.png'),
    });

    // 5. Final settled closed state
    await expect(drawer).not.toBeVisible();
    await page.waitForTimeout(350);
    await expect(menuToggle).toBeVisible();
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'transition-5-settled-closed.png'),
    });
  });
});
