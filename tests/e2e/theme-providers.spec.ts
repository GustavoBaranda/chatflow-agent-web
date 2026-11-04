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

  test('should default to light mode regardless of system preference', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', (err) => jsErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('net::ERR_')) {
        jsErrors.push(msg.text());
      }
    });

    await page.addInitScript(() => {
      localStorage.removeItem('theme');
    });
    await page.emulateMedia({ colorScheme: 'dark' });
    for (const locale of ['en', 'es', 'pt-BR']) {
      await page.goto(`/${locale}`);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('html')).toHaveClass(/light/);
    }
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

  test('should render a blocking theme script for flash-free initialization', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    // Locate the inline script rendered by next-themes
    const hasBlockingThemeScript = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      return scripts.some((s) => !s.hasAttribute('async') && (s.textContent?.includes('localStorage') || s.textContent?.includes('colorScheme')));
    });

    expect(hasBlockingThemeScript).toBe(true);
  });

  test('should serve correct initial SSR html lang attribute directly in server response for each locale', async ({ request }) => {
    const enRes = await request.get('/en');
    const enHtml = await enRes.text();
    expect(enHtml).toMatch(/<html[^>]*\slang="en"/);

    const esRes = await request.get('/es');
    const esHtml = await esRes.text();
    expect(esHtml).toMatch(/<html[^>]*\slang="es"/);

    const ptRes = await request.get('/pt-BR');
    const ptHtml = await ptRes.text();
    expect(ptHtml).toMatch(/<html[^>]*\slang="pt-BR"/);
  });

  test('should switch languages via UI LanguageSelector repeatedly without script warnings or remount errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('pageerror', (err) => consoleErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('net::ERR_')) {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');

    // Attach marker to window to verify client-side navigation without full page reload
    await page.evaluate(() => {
      (window as unknown as { __spa_persistent_marker: string }).__spa_persistent_marker = 'chatflow_active_spa';
    });

    // 1. Switch to Spanish via UI dropdown
    await page.locator('header button[aria-label="Change language"]').click();
    await page.locator('role=option[name="Español"]').click();
    await page.waitForURL(/\/es/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');

    // Verify window marker persisted (proves client-side navigation, no full reload)
    const markerAfterEs = await page.evaluate(
      () => (window as unknown as { __spa_persistent_marker?: string }).__spa_persistent_marker
    );
    expect(markerAfterEs).toBe('chatflow_active_spa');

    // 2. Switch to Brazilian Portuguese via UI dropdown
    await page.locator('header button[aria-label="Cambiar idioma"]').click();
    await page.locator('role=option[name="Português (Brasil)"]').click();
    await page.waitForURL(/\/pt-BR/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');

    // Verify window marker still persisted
    const markerAfterPt = await page.evaluate(
      () => (window as unknown as { __spa_persistent_marker?: string }).__spa_persistent_marker
    );
    expect(markerAfterPt).toBe('chatflow_active_spa');

    // 3. Switch back to English via UI dropdown
    await page.locator('header button[aria-label="Alterar idioma"]').click();
    await page.locator('role=option[name="English"]').click();
    await page.waitForURL(/\/en/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    // Verify window marker still persisted
    const markerAfterEn = await page.evaluate(
      () => (window as unknown as { __spa_persistent_marker?: string }).__spa_persistent_marker
    );
    expect(markerAfterEn).toBe('chatflow_active_spa');

    // 4. Switch back to Spanish once more
    await page.locator('header button[aria-label="Change language"]').click();
    await page.locator('role=option[name="Español"]').click();
    await page.waitForURL(/\/es/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');

    // Confirm absolutely zero console errors or script tag warnings
    const scriptTagWarnings = consoleErrors.filter((e) => e.includes('Encountered a script tag'));
    expect(scriptTagWarnings).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});
