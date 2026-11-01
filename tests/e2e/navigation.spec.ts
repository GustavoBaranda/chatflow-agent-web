import { test, expect } from '@playwright/test';

test.describe('Navigation, Home, and About Suite', () => {
  test('should redirect root path to an authoritative localized route with explicit prefix', async ({ page }) => {
    await page.goto('/');
    // Must redirect to /en, /es, or /pt-BR
    await expect(page).toHaveURL(/\/(en|es|pt-BR)/);
  });

  test('should render English Home page with aligned header controls, hero, code showcase, and features', async ({ page }) => {
    await page.goto('/en');

    // Skip to content link
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();

    // Brand logo & title
    const brand = page.locator('header a[aria-label="chatflow-agent home"]');
    await expect(brand).toBeVisible();
    await expect(brand).toContainText('chatflow-agent');

    // Header nav links (Home, Docs, Community, About)
    await expect(page.locator('header nav a[href="/en"]')).toBeVisible();
    await expect(page.locator('header nav a[href="/en/docs"]')).toBeAttached();
    await expect(page.locator('header nav a[href="/en/community"]')).toBeAttached();
    await expect(page.locator('header nav a[href="/en/about"]')).toBeVisible();

    // Header control height and alignment check (h-9 class)
    const langBtn = page.locator('header button[aria-label="Change language"]');
    await expect(langBtn).toHaveClass(/h-9/);
    await expect(langBtn).toHaveClass(/rounded-lg/);

    const themeBtn = page.locator('header button[aria-pressed]').first();
    await expect(themeBtn).toHaveClass(/h-9/);
    await expect(themeBtn).toHaveClass(/rounded-lg/);

    const ghLink = page.locator('header a[href="https://github.com/GustavoBaranda/chatflow-agent"]');
    await expect(ghLink).toHaveClass(/h-9/);
    await expect(ghLink).toHaveClass(/rounded-lg/);

    // Hero Section
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toContainText('Build Contextual Multi-Agent Systems in Python');

    // Release badge with v0.3.4
    const badge = page.locator('text=chatflow-agent v0.3.4').first();
    await expect(badge).toBeVisible();

    // Primary CTA buttons (no broken internal links)
    const getStartedBtn = page.locator('a[href="#quickstart"]').first();
    await expect(getStartedBtn).toBeVisible();

    const docsBtn = page.locator('a[href="https://github.com/GustavoBaranda/chatflow-agent#readme"]');
    await expect(docsBtn).toBeVisible();

    // Installation command block
    await expect(page.locator('code:has-text("pip install chatflow-agent")')).toBeVisible();

    // Python Code Showcase
    const codeShowcase = page.locator('#quickstart');
    await expect(codeShowcase).toBeVisible();
    await expect(codeShowcase).toContainText('from chatflow_agent import Agent, Runner, SQLiteSessionStore');
    await expect(codeShowcase).toContainText('chatflow-agent v0.3.4');

    // Features Section (6 verified capabilities)
    const featuresSection = page.locator('section[aria-labelledby="features-title"]');
    await expect(featuresSection).toBeVisible();
    await expect(featuresSection.locator('article')).toHaveCount(6);

    // Community Teaser linking to About page
    const communityTeaser = page.locator('section[aria-labelledby="community-teaser-title"]');
    await expect(communityTeaser).toBeVisible();
    await expect(communityTeaser.locator('a[href="/en/about"]')).toBeVisible();

    // Footer
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('chatflow-agent');
    await expect(footer).toContainText('MIT License');
  });

  test('should navigate to dedicated multilingual About page and verify Creator attribution in English', async ({ page }) => {
    await page.goto('/en/about');

    // Heading
    await expect(page.locator('h1')).toContainText('About chatflow-agent');

    // Creator & Lead Maintainer card with Gustavo Baranda and GitHub profile link
    const creatorSection = page.locator('article', { hasText: 'Gustavo Baranda' });
    await expect(creatorSection).toBeVisible();
    await expect(creatorSection).toContainText('Creator & Lead Maintainer');

    const creatorLink = creatorSection.locator('a[href="https://github.com/GustavoBaranda"]');
    await expect(creatorLink).toBeVisible();
    await expect(creatorLink).toHaveAttribute('target', '_blank');

    // 4 Architectural Principles
    const principlesSection = page.locator('section[aria-labelledby="principles-heading"]');
    await expect(principlesSection).toBeVisible();
    await expect(principlesSection.locator('article')).toHaveCount(4);

    // Leadership and Community Section
    const leadershipSection = page.locator('section[aria-labelledby="leadership-heading"]');
    await expect(leadershipSection).toBeVisible();
  });

  test('should render About page in Spanish with proper translations', async ({ page }) => {
    await page.goto('/es/about');

    await expect(page.locator('h1')).toContainText('Acerca de chatflow-agent');

    const creatorSection = page.locator('article', { hasText: 'Gustavo Baranda' });
    await expect(creatorSection).toBeVisible();
    await expect(creatorSection).toContainText('Creador y Mantenedor Principal');

    const creatorLink = creatorSection.locator('a[href="https://github.com/GustavoBaranda"]');
    await expect(creatorLink).toBeVisible();

    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('es');
  });

  test('should render About page in Brazilian Portuguese with proper translations', async ({ page }) => {
    await page.goto('/pt-BR/about');

    await expect(page.locator('h1')).toContainText('Sobre o chatflow-agent');

    const creatorSection = page.locator('article', { hasText: 'Gustavo Baranda' });
    await expect(creatorSection).toBeVisible();
    await expect(creatorSection).toContainText('Criador e Mantenedor Principal');

    const creatorLink = creatorSection.locator('a[href="https://github.com/GustavoBaranda"]');
    await expect(creatorLink).toBeVisible();

    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('pt-BR');
  });

  test('should switch language from English to Spanish via LanguageSelector', async ({ page }) => {
    await page.goto('/en');

    // Check English heading
    await expect(page.locator('h1')).toContainText('Build Contextual Multi-Agent Systems in Python');

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

    // Spanish Hero heading
    await expect(page.locator('h1')).toContainText('Construí Sistemas Multiagente Contextuales en Python');
  });

  test('should switch language from English to Brazilian Portuguese via LanguageSelector', async ({ page }) => {
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

    // Portuguese Hero heading
    await expect(page.locator('h1')).toContainText('Construa Sistemas Multiagentes Contextuais em Python');
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

    const isInitiallyDark = (await page.locator('html').getAttribute('class'))?.includes('dark');
    await themeBtn.click();

    if (isInitiallyDark) {
      await expect(page.locator('html')).toHaveClass(/light/);
    } else {
      await expect(page.locator('html')).toHaveClass(/dark/);
    }
  });

  test('should support keyboard navigation in mobile drawer on small screens', async ({ page }) => {
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

    // Verify About link in drawer
    await expect(drawer.locator('a[href="/en/about"]')).toBeVisible();

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

  test('should render localized drawer navigation with About in Brazilian Portuguese', async ({ page }) => {
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
    await expect(drawer.locator('a[href="/pt-BR/about"]')).toContainText('Sobre');
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

  test('should render localized 404 Not Found page for nonexistent routes within a locale without hydration errors', async ({ page }) => {
    await page.goto('/pt-BR/non-existent-page');
    await expect(page.locator('h1')).toContainText('O fluxo conversacional atingiu uma rota não mapeada');
    await expect(page.locator('a:has-text("Voltar ao início")')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  });
});
