import { test, expect } from '@playwright/test';

test.describe('Phase 6F.1 Documentation Layout and Navigation Fixes Suite', () => {
  test('should verify clean top navbar without leaked version badges and complete sidebar in Spanish', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/es/docs/v0.3/getting-started/installation');
    await page.waitForLoadState('networkidle');

    // 1. Verify no leaked badges above navbar
    const header = page.locator('header.sticky').first();
    await expect(header).toBeVisible();
    const headerBox = await header.boundingBox();
    expect(headerBox).not.toBeNull();
    expect(headerBox!.y).toBe(0);

    const bodyChildren = await page.evaluate(() => {
      const topDiv = document.querySelector('body > div.bg-fd-secondary\\/50');
      return topDiv !== null;
    });
    expect(bodyChildren).toBe(false);

    // 2. Verify LanguageSelector displays active locale "Español"
    const langBtn = page.locator('header').getByRole('button', { name: /idioma|cambiar idioma|language/i }).first();
    await expect(langBtn).toBeVisible();
    await expect(langBtn).toContainText('Español');

    // 3. Verify complete sidebar topic tree in Spanish
    const sidebar = page.locator('#nd-sidebar');
    await expect(sidebar).toBeVisible();

    await expect(sidebar.getByText('Visión General de la Documentación')).toBeVisible();
    await expect(sidebar.getByText(/Primeros Pasos|Getting Started/i)).toBeVisible();
    await expect(sidebar.getByText(/Arquitectura Central|Core Architecture/i)).toBeVisible();

    // 4. Verify active page highlighting in sidebar
    const activeLink = sidebar.locator('a[data-active="true"]');
    await expect(activeLink).toBeVisible();
    await expect(activeLink).toContainText(/Instalación|Installation/i);

    // 5. Genuine Spanish documentation must NOT display translation fallback banner
    const translationNotice = page.locator('aside[role="alert"]');
    await expect(translationNotice).toHaveCount(0);

    // 6. Verify fallback notice is displayed when visiting an untranslated locale (e.g. Portuguese)
    await page.goto('/pt-BR/docs/v0.3/getting-started/installation');
    await page.waitForLoadState('networkidle');
    const ptNotice = page.locator('aside[role="alert"]');
    await expect(ptNotice).toBeVisible();
    await expect(ptNotice).toContainText('Portuguese');
  });

  test('should preserve version and topic when switching language from es to en', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/es/docs/v0.3/getting-started/installation');
    await page.waitForLoadState('networkidle');

    // Open language selector
    const langBtn = page.locator('header').getByRole('button', { name: /idioma|cambiar idioma|language/i }).first();
    await langBtn.click();

    // Select English option
    const enOption = page.locator('[role="listbox"]').getByText('English');
    await expect(enOption).toBeVisible();
    await enOption.click();

    // Verify URL preserved topic and version
    await page.waitForURL(/\/en\/docs\/v0\.3\/getting-started\/installation/);
    expect(page.url()).toContain('/en/docs/v0.3/getting-started/installation');

    // On English page, translation notice must NOT be present
    const notice = page.locator('aside[role="alert"]:has-text("Authoritative English Content Displayed")');
    await expect(notice).toHaveCount(0);

    // Language selector displays English
    const newLangBtn = page.locator('header').getByRole('button', { name: /language|change language/i }).first();
    await expect(newLangBtn).toContainText('English');
  });

  test('navigation audit: home logo link works and community link targets /community', async ({ page }) => {
    await page.goto('/en/docs');
    await page.waitForLoadState('networkidle');

    // Logo links to localized home
    const homeLogo = page.locator('header a[aria-label="chatflow-agent home"]');
    await expect(homeLogo).toBeVisible();
    expect(await homeLogo.getAttribute('href')).toMatch(/^\/(en)?$/);

    // Community link exists in header nav
    const communityLink = page.locator('header nav a[href*="/community"]');
    await expect(communityLink).toBeVisible();
  });
});
