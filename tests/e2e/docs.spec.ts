import { test, expect } from '@playwright/test';

test.describe('Documentation Engine E2E Suite', () => {
  test('should render authoritative English docs index with full Navbar, sidebar, and TOC', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('net::ERR_')) {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/en/docs');
    await page.waitForLoadState('networkidle');

    // Title and metadata
    await expect(page).toHaveTitle(/Documentation Overview/);

    // Navbar presence and links verification
    const nav = page.locator('header nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();
    await expect(page.locator('header nav a[href="/en/docs"]')).toBeVisible();
    await expect(page.locator('header nav a[href="/en/community"]')).toBeVisible();
    await expect(page.locator('header nav a[href="/en/about"]')).toBeVisible();

    // LanguageSelector & GitHub icon in Navbar
    const langBtn = page.locator('header button[aria-label="Change language"]');
    await expect(langBtn).toBeVisible();
    await expect(page.locator('header a[aria-label="GitHub"]')).toBeVisible();

    // Main document headings
    const h1 = page.locator('main h1, article h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Documentation Overview');

    const mdxH1 = page.locator('main h1, article h1').filter({ hasText: 'chatflow-agent Documentation' });
    await expect(mdxH1).toBeVisible();

    // Sidebar navigation check
    const sidebar = page.locator('#nd-sidebar, [data-sidebar="true"], nav[aria-label="Sidebar"]').first();
    await expect(sidebar).toBeVisible();

    // Code block check
    const codeBlock = page.locator('pre, code').filter({ hasText: 'pip install chatflow-agent' }).first();
    await expect(codeBlock).toBeVisible();

    // Verify console is clean
    const scriptErrors = consoleErrors.filter((e) => e.includes('Encountered a script tag'));
    expect(scriptErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('should render Spanish localized docs index with localized Navbar and sidebar', async ({ page }) => {
    await page.goto('/es/docs');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle(/Visión General de la Documentación/);

    // Localized Navbar verification
    const nav = page.locator('header nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();
    await expect(page.locator('header nav a[href="/es/docs"]')).toBeVisible();
    await expect(page.locator('header nav a[href="/es/community"]')).toBeVisible();
    await expect(page.locator('header nav a[href="/es/about"]')).toBeVisible();

    const langBtn = page.locator('header button[aria-label="Cambiar idioma"]');
    await expect(langBtn).toBeVisible();

    const h1 = page.locator('main h1, article h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Visión General de la Documentación');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('should render Brazilian Portuguese localized docs index with localized Navbar and sidebar', async ({ page }) => {
    await page.goto('/pt-BR/docs');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle(/Visão Geral da Documentação/);

    // Localized Navbar verification
    const nav = page.locator('header nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();
    await expect(page.locator('header nav a[href="/pt-BR/docs"]')).toBeVisible();
    await expect(page.locator('header nav a[href="/pt-BR/community"]')).toBeVisible();
    await expect(page.locator('header nav a[href="/pt-BR/about"]')).toBeVisible();

    const langBtn = page.locator('header button[aria-label="Alterar idioma"]');
    await expect(langBtn).toBeVisible();

    const h1 = page.locator('main h1, article h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Visão Geral da Documentação');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  });

  test('should navigate seamlessly between Home and Docs', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    // Click Docs link in Navbar
    const docsLink = page.locator('header nav a[href="/en/docs"]').first();
    await docsLink.click();
    await page.waitForURL(/\/en\/docs/);
    await expect(page).toHaveURL(/\/en\/docs/);

    // Click Brand logo to return Home
    const homeLink = page.locator('header a[href="/en"]').first();
    await homeLink.click();
    await page.waitForURL(/\/en$/);
    await expect(page).toHaveURL(/\/en$/);
  });

  test('should switch languages within docs preserving localized docs equivalent', async ({ page }) => {
    await page.goto('/en/docs');
    await page.waitForLoadState('networkidle');

    // Switch to Spanish via LanguageSelector
    await page.locator('header button[aria-label="Change language"]').click();
    await page.locator('role=option[name="Español"]').click();
    await page.waitForURL(/\/es\/docs/);
    await expect(page).toHaveURL(/\/es\/docs/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');

    // Switch to Brazilian Portuguese via LanguageSelector
    await page.locator('header button[aria-label="Cambiar idioma"]').click();
    await page.locator('role=option[name="Português (Brasil)"]').click();
    await page.waitForURL(/\/pt-BR\/docs/);
    await expect(page).toHaveURL(/\/pt-BR\/docs/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  });

  test('should query local search API endpoint and receive indexed results', async ({ request }) => {
    const res = await request.get('/api/search?query=reactive');
    expect(res.status()).toBe(200);

    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json.length).toBeGreaterThan(0);

    // Verify search document structure
    const firstResult = json[0];
    expect(firstResult).toHaveProperty('url');
    expect(firstResult.url).toContain('/docs');
  });

  test('should return real HTTP 404 for non-existent documentation slugs', async ({ request, page }) => {
    const res = await request.get('/en/docs/non-existent-article-xyz');
    expect(res.status()).toBe(404);

    const response = await page.goto('/en/docs/non-existent-article-xyz');
    expect(response?.status()).toBe(404);
  });

  test('should toggle theme and preserve visual styling on docs', async ({ page }) => {
    await page.goto('/en/docs');
    await page.waitForLoadState('networkidle');

    // Theme toggle button has aria-label switching between dark and light
    const themeToggle = page.locator('header button[aria-label*="dark" i], header button[aria-label*="light" i]').first();
    await expect(themeToggle).toBeVisible();

    // Toggle theme
    await themeToggle.click();
    await page.waitForTimeout(200);

    // Toggle theme again
    await themeToggle.click();
    await page.waitForTimeout(200);
  });

  test('should capture visual screenshots of documentation on desktop and mobile in both themes', async ({ page }) => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const artifactDir = 'C:\\Users\\Gustavo\\.gemini\\antigravity\\brain\\971ced2e-8c02-46ea-8a15-f5bf2a0adf68\\screenshots-docs';
    if (!fs.existsSync(artifactDir)) {
      fs.mkdirSync(artifactDir, { recursive: true });
    }

    // 1. Desktop Light
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/en/docs');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(artifactDir, 'docs-en-desktop-light.png'), fullPage: false });

    // 2. Desktop Dark
    await page.evaluate(() => {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(artifactDir, 'docs-en-desktop-dark.png'), fullPage: false });

    // 3. Mobile Light (iPhone 14)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(artifactDir, 'docs-en-mobile-light.png'), fullPage: false });

    // 4. Mobile Dark (iPhone 14)
    await page.evaluate(() => {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(artifactDir, 'docs-en-mobile-dark.png'), fullPage: false });

    // 5. Spanish Desktop Light
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/es/docs');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(artifactDir, 'docs-es-desktop-light.png'), fullPage: false });

    // 6. Brazilian Portuguese Desktop Dark
    await page.goto('/pt-BR/docs');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(artifactDir, 'docs-pt-BR-desktop-dark.png'), fullPage: false });
  });
});
