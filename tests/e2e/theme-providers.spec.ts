import { test, expect } from '@playwright/test';

test.describe('Theme System, Providers & Console Integrity Suite', () => {
  test('should load page with clean browser console and zero errors or intercepted warnings', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', (err) => jsErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('net::ERR_')) {
        jsErrors.push(msg.text());
      }
    });

    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    // Verify no JavaScript or React errors
    expect(jsErrors).toEqual([]);

    // Verify window.console.error has not been monkey-patched
    const isConsoleNative = await page.evaluate(() => {
      return (
        window.console.error.toString().includes('[native code]') ||
        !window.console.error.toString().includes('Encountered a script tag')
      );
    });
    expect(isConsoleNative).toBe(true);
  });

  test('should correctly apply dark mode on first load when system preference is dark', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', (err) => jsErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('net::ERR_')) {
        jsErrors.push(msg.text());
      }
    });

    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
    expect(jsErrors).toEqual([]);
  });

  test('should correctly apply light mode on first load when system preference is light', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', (err) => jsErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('net::ERR_')) {
        jsErrors.push(msg.text());
      }
    });

    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    const html = page.locator('html');
    await expect(html).toHaveClass(/light/);
    expect(jsErrors).toEqual([]);
  });

  test('should preserve theme preference across page reloads', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', (err) => jsErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('net::ERR_')) {
        jsErrors.push(msg.text());
      }
    });

    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    // Toggle theme
    const themeBtn = page.locator('header button[aria-pressed]').first();
    const initialTheme = await page.locator('html').getAttribute('class');
    await themeBtn.click();

    const expectedNewTheme = initialTheme?.includes('dark') ? 'light' : 'dark';
    await expect(page.locator('html')).toHaveClass(new RegExp(expectedNewTheme));

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify theme persisted
    await expect(page.locator('html')).toHaveClass(new RegExp(expectedNewTheme));
    expect(jsErrors).toEqual([]);
  });

  test('should preserve theme when navigating between all three launch locales (en, es, pt-BR)', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', (err) => jsErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('net::ERR_')) {
        jsErrors.push(msg.text());
      }
    });

    // Start in /en and set theme to dark
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    const htmlClass = await page.locator('html').getAttribute('class');
    if (!htmlClass?.includes('dark')) {
      const themeBtn = page.locator('header button[aria-pressed]').first();
      await themeBtn.click();
      await expect(page.locator('html')).toHaveClass(/dark/);
    }

    // Navigate to Spanish /es
    await page.goto('/es');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');

    // Navigate to Brazilian Portuguese /pt-BR
    await page.goto('/pt-BR');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');

    // Navigate back to English /en
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    expect(jsErrors).toEqual([]);
  });

  test('should render theme script with async attribute arriving at DOM', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    // Locate the inline script rendered by next-themes
    const hasAsyncThemeScript = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      return scripts.some((s) => s.hasAttribute('async') && (s.textContent?.includes('localStorage') || s.textContent?.includes('colorScheme')));
    });

    expect(hasAsyncThemeScript).toBe(true);
  });
});
