import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const SCREENSHOT_DIR = path.resolve(
  'test-results/screenshots-404'
);

test.beforeAll(() => {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
});

test.describe('Custom 404 Page Suite', () => {
  test('should return HTTP 404 status code for localized and global unmapped routes', async ({ request }) => {
    const enRes = await request.get('/en/this-route-does-not-exist');
    expect(enRes.status()).toBe(404);

    const esRes = await request.get('/es/esta-ruta-no-existe');
    expect(esRes.status()).toBe(404);

    const ptRes = await request.get('/pt-BR/esta-rota-nao-existe');
    expect(ptRes.status()).toBe(404);

    const globalRes = await request.get('/some-unknown-global-route');
    expect(globalRes.status()).toBe(404);
  });

  test('should render English 404 page with official isotype, badges, CTAs, and quick links inside localized layout', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', (err) => jsErrors.push(err.message));

    await page.goto('/en/lost-in-flow');

    // HTTP 404 layout preserves Navbar and Footer
    await expect(page.locator('header a[aria-label="chatflow-agent home"]')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Official isotype image
    const isotype = page.locator('main img[src*="logo-symbol.svg"]');
    await expect(isotype).toBeVisible();
    await expect(isotype).toHaveAttribute('alt', 'chatflow-agent official isotype');

    // 404 Badge and Watermark
    await expect(page.locator('text=HTTP 404 • Unmapped Route')).toBeVisible();
    await expect(page.locator('text=404').first()).toBeVisible();

    // Conversational Agent Title & Description
    await expect(page.locator('h1')).toContainText('Conversation flow reached an unmapped route');
    await expect(
      page.locator('text=The agent attempted a context handoff, but this path does not exist')
    ).toBeVisible();

    // Primary CTA buttons
    const homeBtn = page.locator('main a[href="/en"], main a[href="/"]').first();
    await expect(homeBtn).toBeVisible();
    await expect(homeBtn).toContainText('Return to Home');

    const docsBtn = page.locator('main a[href="https://github.com/GustavoBaranda/chatflow-agent#readme"]');
    await expect(docsBtn).toBeVisible();
    await expect(docsBtn).toContainText('Read Official Documentation');
    await expect(docsBtn).toHaveAttribute('target', '_blank');

    // Quick links
    await expect(page.locator('main a[href="/en/about"]')).toBeVisible();
    await expect(
      page.locator('main a[href="https://github.com/GustavoBaranda/chatflow-agent/discussions"]')
    ).toBeVisible();

    expect(jsErrors).toEqual([]);
  });

  test('should render Spanish 404 page with complete translations', async ({ page }) => {
    await page.goto('/es/ruta-perdida');

    await expect(page.locator('text=HTTP 404 • Ruta no mapeada')).toBeVisible();
    await expect(page.locator('h1')).toContainText('El flujo conversacional llegó a una ruta no mapeada');
    await expect(page.locator('text=El agente intentó una delegación de contexto')).toBeVisible();

    const homeBtn = page.locator('main a:has-text("Volver al inicio")');
    await expect(homeBtn).toBeVisible();

    const docsBtn = page.locator('main a:has-text("Consultar documentación oficial")');
    await expect(docsBtn).toBeVisible();

    await expect(page.locator('main a:has-text("Acerca del proyecto")')).toBeVisible();
    await expect(page.locator('main a:has-text("Comunidad y debates")')).toBeVisible();
  });

  test('should render Brazilian Portuguese 404 page with complete translations', async ({ page }) => {
    await page.goto('/pt-BR/rota-perdida');

    await expect(page.locator('text=HTTP 404 • Rota não mapeada')).toBeVisible();
    await expect(page.locator('h1')).toContainText('O fluxo conversacional atingiu uma rota não mapeada');
    await expect(page.locator('text=O agente tentou uma delegação de contexto')).toBeVisible();

    const homeBtn = page.locator('main a:has-text("Voltar ao início")');
    await expect(homeBtn).toBeVisible();

    const docsBtn = page.locator('main a:has-text("Consultar documentação oficial")');
    await expect(docsBtn).toBeVisible();

    await expect(page.locator('main a:has-text("Sobre o projeto")')).toBeVisible();
    await expect(page.locator('main a:has-text("Comunidade e discussões")')).toBeVisible();
  });

  test('should render global unlocalized 404 page cleanly on raw unknown paths', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', (err) => jsErrors.push(err.message));

    await page.goto('/completely-unmapped-global-slug');

    // Must have official isotype
    const isotype = page.locator('main img[src*="logo-symbol.svg"]');
    await expect(isotype).toBeVisible();

    // Must have 404 text
    await expect(page.locator('h1')).toContainText('Conversation flow reached an unmapped route');
    await expect(page.locator('main a[href="/en"]')).toBeVisible();

    expect(jsErrors).toEqual([]);
  });

  test('visual capture: take screenshots across 3 locales, themes (light/dark) and viewports (desktop/mobile)', async ({ page }) => {
    test.slow();
    const locales = ['en', 'es', 'pt-BR'];

    for (const locale of locales) {
      // 1. Desktop Light
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto(`/${locale}/unmapped-preview-route`);
      await page.waitForLoadState('networkidle');
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `404-${locale}-desktop-light.png`),
        fullPage: true,
      });

      // 2. Desktop Dark
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `404-${locale}-desktop-dark.png`),
        fullPage: true,
      });

      // 3. Mobile Light
      await page.setViewportSize({ width: 375, height: 667 });
      await page.emulateMedia({ colorScheme: 'light' });
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `404-${locale}-mobile-light.png`),
        fullPage: true,
      });

      // 4. Mobile Dark
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `404-${locale}-mobile-dark.png`),
        fullPage: true,
      });
    }
  });
});
