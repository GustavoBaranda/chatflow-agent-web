import { test, expect } from '@playwright/test';

test.describe('Documentation Versioning & Navigation E2E Suite (0.4.0 Latest / Stable Promotion)', () => {
  test('VersionSelector displays active v0.4 Latest / Stable and SDK 0.4.0 badge on /docs/v0.4', async ({ page }) => {
    await page.goto('/en/docs/v0.4');
    await page.waitForLoadState('networkidle');

    const trigger = page.locator('[data-testid="version-selector-trigger"]').first();
    await expect(trigger).toBeVisible();
    await expect(trigger).toContainText('v0.4');
    await expect(trigger).toContainText('Latest / Stable');
    await expect(trigger).toContainText('0.4.0');
    await expect(trigger).not.toContainText('RC1');
    await expect(trigger).not.toContainText('0.4.0rc1');
  });

  test('VersionSelector displays active v0.3 Previous Stable and SDK 0.3.4 badge on /docs/v0.3', async ({ page }) => {
    await page.goto('/en/docs/v0.3');
    await page.waitForLoadState('networkidle');

    const trigger = page.locator('[data-testid="version-selector-trigger"]').first();
    await expect(trigger).toBeVisible();
    await expect(trigger).toContainText('v0.3');
    await expect(trigger).toContainText('Previous Stable');
    await expect(trigger).toContainText('0.3.4');
  });

  test('unversioned /docs routes redirect to v0.4 Latest / Stable and VersionSelector recognizes v0.4 as active', async ({ page }) => {
    await page.goto('/en/docs/guides/agents');
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/en/docs/v0.4/guides/agents');

    const trigger = page.locator('[data-testid="version-selector-trigger"]').first();
    await expect(trigger).toBeVisible();
    await expect(trigger).toContainText('v0.4');
    await expect(trigger).toContainText('Latest / Stable');
  });

  test('redirects legacy RC URLs (v0.4.0rc1, v0.4.0rc2, v0.4.0rc3) cleanly to v0.4 stable documentation', async ({ page }) => {
    await page.goto('/en/docs/v0.4.0rc1/guides/agents');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/en/docs/v0.4/guides/agents');
  });

  test('VersionSelector dropdown lists only stable versions (0.4.0 and 0.3.4) with zero RC options', async ({ page }) => {
    await page.goto('/en/docs/v0.4');
    await page.waitForLoadState('networkidle');

    const trigger = page.locator('[data-testid="version-selector-trigger"]').first();
    await trigger.click();

    const listbox = page.locator('[data-testid="version-selector-listbox"]').first();
    await expect(listbox).toBeVisible();
    await expect(listbox).toContainText('0.4.0');
    await expect(listbox).toContainText('0.3.4');
    await expect(listbox).not.toContainText('0.4.0rc1');
    await expect(listbox).not.toContainText('0.4.0rc2');
    await expect(listbox).not.toContainText('0.4.0rc3');
    await expect(listbox).not.toContainText('RC1');
  });

  test('switches versions preserving locale and topic from v0.3 to v0.4', async ({ page }) => {
    await page.goto('/es/docs/v0.3/guides/agents');
    await page.waitForLoadState('networkidle');

    const trigger = page.locator('[data-testid="version-selector-trigger"]').first();
    await trigger.click();

    const listbox = page.locator('[data-testid="version-selector-listbox"]').first();
    await expect(listbox).toBeVisible();

    const option04 = page.locator('[data-testid="version-option-v0.4"]').first();
    await expect(option04).toContainText('0.4.0');
    await option04.click();

    await page.waitForURL(/\/es\/docs\/v0\.4\/guides\/agents/);
    expect(page.url()).toContain('/es/docs/v0.4/guides/agents');

    const h1 = page.locator('article h1, main h1');
    await expect(h1).toHaveCount(1);
  });

  test('switches versions preserving locale and topic from v0.4 to v0.3', async ({ page }) => {
    await page.goto('/en/docs/v0.4/guides/runner-lifecycle');
    await page.waitForLoadState('networkidle');

    const trigger = page.locator('[data-testid="version-selector-trigger"]').first();
    await trigger.click();

    const option03 = page.locator('[data-testid="version-option-v0.3"]').first();
    await expect(option03).toContainText('0.3.4');
    await option03.click();

    await page.waitForURL(/\/en\/docs\/v0\.3\/guides\/runner-lifecycle/);
    expect(page.url()).toContain('/en/docs/v0.3/guides/runner-lifecycle');
  });

  test('renders What is New in 0.4.0 and Migration Guide 0.3.4 -> 0.4.0 across en, es, and pt-BR', async ({ page }) => {
    for (const locale of ['en', 'es', 'pt-BR']) {
      const wnRes = await page.goto(`/${locale}/docs/v0.4/getting-started/whats-new`);
      expect(wnRes?.status()).toBe(200);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('article h1, main h1')).toHaveCount(1);
      await expect(page.locator('main')).toContainText('0.4.0');
      await expect(page.locator('main')).toContainText('ToolArgumentValidationError');

      const migRes = await page.goto(`/${locale}/docs/v0.4/getting-started/migration`);
      expect(migRes?.status()).toBe(200);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('article h1, main h1')).toHaveCount(1);
      await expect(page.locator('main')).toContainText('0.3.4');
      await expect(page.locator('main')).toContainText('0.4.0');
      await expect(page.locator('main')).toContainText('dedup_ttl_hours');
    }
  });

  test('does NOT display PrereleaseBanner on v0.4 or v0.3 now that both are stable releases', async ({ page }) => {
    await page.goto('/en/docs/v0.4/guides/agents');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="prerelease-banner"]')).toHaveCount(0);

    await page.goto('/en/docs/v0.3/guides/agents');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="prerelease-banner"]')).toHaveCount(0);
  });

  test('omits TranslationNotice and sets index, follow on genuine translations in v0.4 for both Portuguese and Spanish', async ({ page }) => {
    await page.goto('/pt-BR/docs/v0.4/guides/agents');
    await page.waitForLoadState('networkidle');

    const ptNotice = page.locator('aside[role="alert"]');
    await expect(ptNotice).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');

    const ptRobots = page.locator('meta[name="robots"]');
    await expect(ptRobots).toHaveAttribute('content', 'index, follow');

    await page.goto('/es/docs/v0.4/guides/agents');
    await page.waitForLoadState('networkidle');

    const esNotice = page.locator('aside[role="alert"]');
    await expect(esNotice).toHaveCount(0);

    const esRobots = page.locator('meta[name="robots"]');
    await expect(esRobots).toHaveAttribute('content', 'index, follow');
  });

  test('isolates sidebar navigation tree between tracks', async ({ page }) => {
    await page.goto('/en/docs/v0.3/getting-started/installation');
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('#nd-sidebar, [data-sidebar="true"], nav[aria-label="Sidebar"]').first();
    await expect(sidebar).toBeVisible();

    const v04LinksInV03Sidebar = sidebar.locator('a[href*="/docs/v0.4"]');
    await expect(v04LinksInV03Sidebar).toHaveCount(0);

    await page.goto('/en/docs/v0.4/getting-started/installation');
    await page.waitForLoadState('networkidle');

    const v03LinksInV04Sidebar = sidebar.locator('a[href*="/docs/v0.3"]');
    await expect(v03LinksInV04Sidebar).toHaveCount(0);
  });

  test('supports keyboard navigation on VersionSelector (Enter, Space, Escape)', async ({ page }) => {
    await page.goto('/en/docs/v0.4');
    await page.waitForLoadState('networkidle');

    const trigger = page.locator('[data-testid="version-selector-trigger"]').first();
    await trigger.focus();
    await expect(trigger).toBeFocused();

    await page.keyboard.press('Enter');
    const listbox = page.locator('[data-testid="version-selector-listbox"]').first();
    await expect(listbox).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(listbox).not.toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('VersionSelector is accessible in mobile navigation drawer', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en/docs/v0.4');
    await page.waitForLoadState('networkidle');

    const sidebarTrigger = page.locator('#nd-subnav button').last();
    await sidebarTrigger.click();

    const mobileSelector = page.locator('[data-testid="version-selector-trigger"]:visible');
    await expect(mobileSelector).toBeVisible();
  });

  test('search endpoint returns strictly isolated results for v0.4 (default) and v0.3 without cross-leaks', async ({ request }) => {
    const defaultRes = await request.get('/api/search?query=agents');
    expect(defaultRes.status()).toBe(200);
    const defaultJson = await defaultRes.json();
    expect(defaultJson.length).toBeGreaterThan(0);
    for (const item of defaultJson) {
      expect(item.url).toContain('/docs/v0.4');
      expect(item.url).not.toContain('/docs/v0.3');
    }

    const v03Res = await request.get('/api/search?query=agents&tag=v0.3');
    expect(v03Res.status()).toBe(200);
    const v03Json = await v03Res.json();
    expect(v03Json.length).toBeGreaterThan(0);
    for (const item of v03Json) {
      expect(item.url).toContain('/docs/v0.3');
      expect(item.url).not.toContain('/docs/v0.4');
    }

    const v04Res = await request.get('/api/search?query=agents&tag=v0.4');
    expect(v04Res.status()).toBe(200);
    const v04Json = await v04Res.json();
    expect(v04Json.length).toBeGreaterThan(0);
    for (const item of v04Json) {
      expect(item.url).toContain('/docs/v0.4');
      expect(item.url).not.toContain('/docs/v0.3');
    }
  });

  test('internal documentation links stay within their respective version tracks', async ({ page }) => {
    await page.goto('/en/docs/v0.4');
    await page.waitForLoadState('networkidle');

    const v04InstallLink = page.locator('main a[href*="/getting-started/installation"]').first();
    await expect(v04InstallLink).toHaveAttribute('href', '/en/docs/v0.4/getting-started/installation');
    await v04InstallLink.click();
    await page.waitForURL('**/en/docs/v0.4/getting-started/installation');
    expect(page.url()).toContain('/en/docs/v0.4/getting-started/installation');

    await page.goto('/en/docs/v0.3');
    await page.waitForLoadState('networkidle');

    const v03InstallLink = page.locator('main a[href*="/getting-started/installation"]').first();
    await expect(v03InstallLink).toHaveAttribute('href', '/en/docs/v0.3/getting-started/installation');
    await v03InstallLink.click();
    await page.waitForURL('**/en/docs/v0.3/getting-started/installation');
    expect(page.url()).toContain('/en/docs/v0.3/getting-started/installation');
  });

  test('generates accurate canonical and index, follow robots metadata for both v0.4 and v0.3 stable pages', async ({ page }) => {
    await page.goto('/en/docs/v0.4/guides/agents');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://chatflowagent.org/en/docs/v0.4/guides/agents',
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');

    await page.goto('/en/docs/v0.3/guides/agents');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://chatflowagent.org/en/docs/v0.3/guides/agents',
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
  });

  test('restricts hreflang alternates strictly to genuinely translated documentation', async ({ page }) => {
    await page.goto('/es/docs/v0.4');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveAttribute(
      'href',
      'https://chatflowagent.org/es/docs/v0.4',
    );
    await expect(page.locator('link[rel="alternate"][hreflang="pt-BR"]')).toHaveAttribute(
      'href',
      'https://chatflowagent.org/pt-BR/docs/v0.4',
    );
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
      'href',
      'https://chatflowagent.org/en/docs/v0.4',
    );
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
      'href',
      'https://chatflowagent.org/en/docs/v0.4',
    );
  });

  test('sitemap.xml returns 200 OK, includes v0.4 and v0.3 stable docs, and excludes RC and unversioned aliases', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);

    const text = await res.text();
    expect(text).toContain('https://chatflowagent.org/en/docs/v0.4');
    expect(text).toContain('https://chatflowagent.org/es/docs/v0.4');
    expect(text).toContain('https://chatflowagent.org/pt-BR/docs/v0.4');
    expect(text).toContain('https://chatflowagent.org/en/docs/v0.4/getting-started/whats-new');
    expect(text).toContain('https://chatflowagent.org/en/docs/v0.4/getting-started/migration');
    expect(text).toContain('https://chatflowagent.org/en/docs/v0.3');

    expect(text).not.toMatch(/rc1|rc2|rc3/i);
    expect(text).not.toContain('https://chatflowagent.org/en/docs/guides');
  });

  test('robots.txt returns 200 OK, allows crawling, and links sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);

    const text = await res.text();
    expect(text).toContain('User-Agent: *');
    expect(text).toContain('Allow: /');
    expect(text).toContain('Disallow: /api/');
    expect(text).toContain('Sitemap: https://chatflowagent.org/sitemap.xml');
  });
});
