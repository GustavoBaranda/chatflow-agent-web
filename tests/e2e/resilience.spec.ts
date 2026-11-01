import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const ARTIFACT_DIR = path.resolve(
  'test-results/screenshots-resilience'
);

test.beforeAll(() => {
  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }
});

test.describe('Resilience, Error Boundaries & Maintenance Suite', () => {
  test('should return real HTTP 404 status for all unmapped paths across all three locales', async ({
    request,
  }) => {
    const paths = [
      '/en/unmapped-flow-path',
      '/es/ruta-no-existente',
      '/pt-BR/caminho-inexistente',
      '/en/docs/unmapped-page',
      '/es/docs/pagina-inexistente',
      '/pt-BR/docs/pagina-inexistente',
      '/en/community/unmapped-subpath',
      '/es/community/ruta-inexistente',
      '/pt-BR/community/caminho-inexistente',
      '/some-random-global-route-xyz',
    ];

    for (const p of paths) {
      const res = await request.get(p);
      expect(res.status(), `Expected 404 for ${p}`).toBe(404);
    }
  });

  test('should verify autonomous static maintenance fallback (/maintenance.html) renders and switches languages', async ({
    page,
  }) => {
    await page.goto('/maintenance.html');

    // Verify title and meta
    await expect(page).toHaveTitle(/503 Service Unavailable — chatflow-agent/);
    const robotsMeta = page.locator('meta[name="robots"]');
    await expect(robotsMeta).toHaveAttribute('content', 'noindex, nofollow');

    // Verify badge and title
    await expect(page.locator('#txt-badge')).toBeVisible();
    await expect(page.locator('#txt-title')).toContainText('System maintenance in progress');

    // Verify runnable pip install command
    await expect(page.locator('.code-block')).toContainText('pip install chatflow-agent');

    // Verify GitHub fallback link
    const githubLink = page.locator('#btn-github');
    await expect(githubLink).toHaveAttribute(
      'href',
      'https://github.com/GustavoBaranda/chatflow-agent'
    );

    // Capture English screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'maintenance-static-en.png'),
      fullPage: true,
    });

    // Test language switching to Spanish
    await page.click('button:has-text("Español")');
    await expect(page.locator('#txt-title')).toContainText('Mantenimiento del sistema en progreso');
    await expect(page.locator('#btn-refresh')).toContainText('Comprobar de nuevo');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');

    // Capture Spanish screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'maintenance-static-es.png'),
      fullPage: true,
    });

    // Test language switching to Portuguese
    await page.click('button:has-text("Português (Brasil)")');
    await expect(page.locator('#txt-title')).toContainText('Manutenção do sistema em andamento');
    await expect(page.locator('#btn-refresh')).toContainText('Verificar novamente');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');

    // Capture Portuguese screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'maintenance-static-pt-BR.png'),
      fullPage: true,
    });
  });

  test('should verify healthy normal application operation across all routes and locales', async ({
    page,
  }) => {
    const locales = ['en', 'es', 'pt-BR'] as const;

    for (const locale of locales) {
      // Home
      const homeRes = await page.goto(`/${locale}`);
      expect(homeRes?.status()).toBe(200);
      await expect(page.locator('header a[aria-label="chatflow-agent home"]')).toBeVisible();

      // About
      const aboutRes = await page.goto(`/${locale}/about`);
      expect(aboutRes?.status()).toBe(200);
      await expect(page.locator('h1')).toBeVisible();

      // Docs
      const docsRes = await page.goto(`/${locale}/docs`);
      expect(docsRes?.status()).toBe(200);
      await expect(page.locator('aside')).toBeVisible();
    }
  });

  test('should redirect /maintenance to / when maintenance mode is inactive', async ({
    page,
  }) => {
    const res = await page.goto('/en/maintenance');
    // Because maintenance mode is disabled by default, it redirects to /en
    expect(res?.status()).toBe(200);
    expect(page.url()).toContain('/en');
  });

  test('should verify autonomous static fallback file exists and has zero external dependencies', async () => {
    const filePath = path.resolve('public/maintenance.html');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('<!DOCTYPE html>');
    expect(content).toContain('pip install chatflow-agent');
    expect(content).toContain('https://github.com/GustavoBaranda/chatflow-agent');
    // Ensure zero external CDN or third party scripts/stylesheets
    expect(content).not.toMatch(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']https?:\/\//);
    expect(content).not.toMatch(/<script[^>]+src=["']https?:\/\//);
  });
});

