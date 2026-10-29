import { test, expect } from '@playwright/test';

test.describe('Navigation and Localization Suite', () => {
  test('should redirect root path to an authoritative localized route with explicit prefix', async ({ page }) => {
    await page.goto('/');
    // Must redirect to /en, /es, or /pt-BR
    await expect(page).toHaveURL(/\/(en|es|pt-BR)/);
  });

  test('should render English layout with header, brand, skip link, and About section', async ({ page }) => {
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

    // Visible About section recognizing Gustavo Baranda as Creator & Lead Maintainer
    const aboutSection = page.locator('section[aria-labelledby="about-heading"]');
    await expect(aboutSection).toBeVisible();
    await expect(aboutSection).toContainText('Gustavo Baranda');
    await expect(aboutSection).toContainText('Creator & Lead Maintainer');

    const creatorLink = aboutSection.locator('a[href="https://github.com/GustavoBaranda"]');
    await expect(creatorLink).toBeVisible();

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

    // Select Spanish option (native name, flagless)
    const esOption = page.locator('ul[role="listbox"] li', { hasText: 'Español' });
    await expect(esOption).toBeVisible();
    await esOption.click();

    // URL should now be /es
    await expect(page).toHaveURL(/\/es/);

    // Document lang attribute should be 'es'
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('es');

    // About section should be translated in Spanish
    const aboutSection = page.locator('section[aria-labelledby="about-heading"]');
    await expect(aboutSection).toContainText('Creador y Mantenedor Principal');
  });

  test('should switch language from English to Brazilian Portuguese and render localized metadata and About section', async ({ page }) => {
    await page.goto('/en');

    // Open language selector
    const langBtn = page.locator('header button[aria-label="Change language"]').first();
    await langBtn.click();

    // Select Brazilian Portuguese option (native name, flagless)
    const ptOption = page.locator('ul[role="listbox"] li', { hasText: 'Português (Brasil)' });
    await expect(ptOption).toBeVisible();
    await ptOption.click();

    // URL should now be /pt-BR
    await expect(page).toHaveURL(/\/pt-BR/);

    // Document lang attribute should be 'pt-BR'
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('pt-BR');

    // Portuguese description
    await expect(page.locator('main p').first()).toContainText('Agentes de IA conversacional');

    // About section translated in Portuguese with Gustavo Baranda attribution
    const aboutSection = page.locator('section[aria-labelledby="about-heading"]');
    await expect(aboutSection).toBeVisible();
    await expect(aboutSection).toContainText('Sobre o chatflow-agent');
    await expect(aboutSection).toContainText('Criador e Mantenedor Principal');
    await expect(aboutSection).toContainText('Gustavo Baranda');

    const creatorLink = aboutSection.locator('a[href="https://github.com/GustavoBaranda"]');
    await expect(creatorLink).toBeVisible();
  });

  test('should include canonical and hreflang alternate links for all three launch locales', async ({ page }) => {
    await page.goto('/pt-BR');

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toContain('/pt-BR');

    const hreflangPt = page.locator('link[rel="alternate"][hreflang="pt-BR"]');
    await expect(hreflangPt).toBeAttached();

    const hreflangEs = page.locator('link[rel="alternate"][hreflang="es"]');
    await expect(hreflangEs).toBeAttached();

    const hreflangEn = page.locator('link[rel="alternate"][hreflang="en"]');
    await expect(hreflangEn).toBeAttached();

    const hreflangDefault = page.locator('link[rel="alternate"][hreflang="x-default"]');
    await expect(hreflangDefault).toBeAttached();
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

  test('should render localized drawer navigation in Brazilian Portuguese', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/pt-BR');

    const hamburger = page.locator('header button[aria-label="Alternar menu de navegação"]');
    await expect(hamburger).toBeVisible();
    await hamburger.click();

    const drawer = page.locator('div[role="dialog"]');
    await expect(drawer).toBeVisible();

    await expect(drawer.locator('a[href="/pt-BR"]')).toContainText('Início');
    await expect(drawer.locator('a[href="/pt-BR/docs"]')).toContainText('Documentação');
    await expect(drawer.locator('a[href="/pt-BR/community"]')).toContainText('Comunidade');
  });

  test('should include official favicon, SVG icon, and Apple Touch Icon across localized routes (/en, /es, /pt-BR)', async ({ page }) => {
    for (const locale of ['en', 'es', 'pt-BR']) {
      await page.goto(`/${locale}`);

      const iconIco = page.locator('link[rel="icon"][href*="favicon.ico"]').first();
      await expect(iconIco).toBeAttached();

      const iconSvg = page.locator('link[rel="icon"][type="image/svg+xml"]').first();
      await expect(iconSvg).toBeAttached();

      const appleIcon = page.locator('link[rel="apple-touch-icon"]').first();
      await expect(appleIcon).toBeAttached();

      const manifest = page.locator('link[rel="manifest"]').first();
      await expect(manifest).toBeAttached();
    }
  });

  test('should serve favicon.ico, icon.svg, and apple-touch-icon.png with 200 OK status', async ({ request }) => {
    const faviconRes = await request.get('/favicon.ico');
    expect(faviconRes.status()).toBe(200);

    const svgRes = await request.get('/icon.svg');
    expect(svgRes.status()).toBe(200);
    expect(svgRes.headers()['content-type']).toMatch(/image\/svg\+xml/);

    const appleRes = await request.get('/apple-touch-icon.png');
    expect(appleRes.status()).toBe(200);
    expect(appleRes.headers()['content-type']).toMatch(/image\/png/);
  });
});
