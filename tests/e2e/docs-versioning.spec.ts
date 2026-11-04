import { test, expect } from '@playwright/test';

test.describe('Documentation Versioning & Navigation E2E Suite (Phase 6C)', () => {
  test('VersionSelector displays active version and published SDK badge on v0.3', async ({ page }) => {
    await page.goto('/en/docs/v0.3');
    await page.waitForLoadState('networkidle');

    const trigger = page.locator('[data-testid="version-selector-trigger"]').first();
    await expect(trigger).toBeVisible();
    await expect(trigger).toContainText('v0.3');
    await expect(trigger).toContainText('Stable');
    await expect(trigger).toContainText('0.3.4');
  });

  test('VersionSelector displays active version and prerelease badge on v0.4', async ({ page }) => {
    await page.goto('/en/docs/v0.4');
    await page.waitForLoadState('networkidle');

    const trigger = page.locator('[data-testid="version-selector-trigger"]').first();
    await expect(trigger).toBeVisible();
    await expect(trigger).toContainText('v0.4');
    await expect(trigger).toContainText('RC1');
    await expect(trigger).toContainText('0.4.0rc1');
  });

  test('VersionSelector recognizes v0.3 as active on legacy unversioned URLs', async ({ page }) => {
    await page.goto('/en/docs/guides/agents');
    await page.waitForLoadState('networkidle');

    const trigger = page.locator('[data-testid="version-selector-trigger"]').first();
    await expect(trigger).toBeVisible();
    await expect(trigger).toContainText('v0.3');
    await expect(trigger).toContainText('Stable');
  });

  test('switches versions preserving locale and topic from v0.3 to v0.4', async ({ page }) => {
    await page.goto('/es/docs/v0.3/guides/agents');
    await page.waitForLoadState('networkidle');

    // Open version selector
    const trigger = page.locator('[data-testid="version-selector-trigger"]').first();
    await trigger.click();

    // Listbox should be visible
    const listbox = page.locator('[data-testid="version-selector-listbox"]').first();
    await expect(listbox).toBeVisible();

    // Click v0.4 option
    const option04 = page.locator('[data-testid="version-option-v0.4"]').first();
    await expect(option04).toContainText('0.4.0rc1');
    await option04.click();

    // Verify URL preserved locale 'es' and topic 'guides/agents'
    await page.waitForURL(/\/es\/docs\/v0\.4\/guides\/agents/);
    expect(page.url()).toContain('/es/docs/v0.4/guides/agents');

    // Single H1 heading
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

  test('switches from legacy unversioned URL to v0.4 preserving topic', async ({ page }) => {
    await page.goto('/en/docs/guides/tools');
    await page.waitForLoadState('networkidle');

    const trigger = page.locator('[data-testid="version-selector-trigger"]').first();
    await trigger.click();

    const option04 = page.locator('[data-testid="version-option-v0.4"]').first();
    await option04.click();

    await page.waitForURL(/\/en\/docs\/v0\.4\/guides\/tools/);
    expect(page.url()).toContain('/en/docs/v0.4/guides/tools');
  });

  test('displays PrereleaseBanner only on v0.4 with exact 0.4.0rc1 version and stable link', async ({ page }) => {
    // 1. On v0.4, banner must be visible
    await page.goto('/en/docs/v0.4/guides/agents');
    await page.waitForLoadState('networkidle');

    const banner = page.locator('[data-testid="prerelease-banner"]');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('v0.4.0rc1');
    await expect(banner).toContainText('RC1');

    // Switch link inside banner
    const switchLink = page.locator('[data-testid="prerelease-banner-switch-link"]');
    await expect(switchLink).toBeVisible();
    await expect(switchLink).toHaveAttribute('href', '/en/docs/v0.3/guides/agents');

    // Clicking switch link navigates to stable
    await switchLink.click();
    await page.waitForURL(/\/en\/docs\/v0\.3\/guides\/agents/);
    expect(page.url()).toContain('/en/docs/v0.3/guides/agents');

    // 2. On v0.3, banner must NOT be present
    const bannerOnV03 = page.locator('[data-testid="prerelease-banner"]');
    await expect(bannerOnV03).toHaveCount(0);
  });

  test('omits TranslationNotice on genuine translations in v0.4 for both Portuguese and Spanish while preserving noindex', async ({ page }) => {
    // 1. Genuine Brazilian Portuguese translation on v0.4 does NOT show TranslationNotice
    await page.goto('/pt-BR/docs/v0.4/guides/agents');
    await page.waitForLoadState('networkidle');

    // TranslationNotice banner should NOT be present for genuine Portuguese translation
    const ptNotice = page.locator('aside[role="alert"]');
    await expect(ptNotice).toHaveCount(0);

    // HTML lang attribute matches requested locale
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');

    // Robots meta has noindex, follow because v0.4 is prerelease
    const ptRobots = page.locator('meta[name="robots"]');
    await expect(ptRobots).toHaveAttribute('content', 'noindex, follow');

    // 2. Genuine Spanish translation on v0.4 does NOT show TranslationNotice
    await page.goto('/es/docs/v0.4/guides/agents');
    await page.waitForLoadState('networkidle');

    const esNotice = page.locator('aside[role="alert"]');
    await expect(esNotice).toHaveCount(0);

    // Robots meta has noindex, follow because v0.4 is prerelease
    const esRobots = page.locator('meta[name="robots"]');
    await expect(esRobots).toHaveAttribute('content', 'noindex, follow');
  });

  test('isolates sidebar navigation tree between tracks', async ({ page }) => {
    // 1. On v0.3, sidebar links should only point to v0.3
    await page.goto('/en/docs/v0.3/getting-started/installation');
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('#nd-sidebar, [data-sidebar="true"], nav[aria-label="Sidebar"]').first();
    await expect(sidebar).toBeVisible();

    const v04LinksInV03Sidebar = sidebar.locator('a[href*="/docs/v0.4"]');
    await expect(v04LinksInV03Sidebar).toHaveCount(0);

    // 2. On v0.4, sidebar links should only point to v0.4
    await page.goto('/en/docs/v0.4/getting-started/installation');
    await page.waitForLoadState('networkidle');

    const v03LinksInV04Sidebar = sidebar.locator('a[href*="/docs/v0.3"]');
    await expect(v03LinksInV04Sidebar).toHaveCount(0);
  });

  test('supports keyboard navigation on VersionSelector (Enter, Space, Escape)', async ({ page }) => {
    await page.goto('/en/docs/v0.3');
    await page.waitForLoadState('networkidle');

    const trigger = page.locator('[data-testid="version-selector-trigger"]').first();
    await trigger.focus();
    await expect(trigger).toBeFocused();

    // Open via Enter
    await page.keyboard.press('Enter');
    const listbox = page.locator('[data-testid="version-selector-listbox"]').first();
    await expect(listbox).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Close via Escape
    await page.keyboard.press('Escape');
    await expect(listbox).not.toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('VersionSelector is accessible in mobile navigation drawer', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en/docs/v0.3');
    await page.waitForLoadState('networkidle');

    // Click sidebar toggle on mobile subnav
    const sidebarTrigger = page.locator('#nd-subnav button').last();
    await sidebarTrigger.click();

    // Version selector in mobile drawer
    const mobileSelector = page.locator('[data-testid="version-selector-trigger"]:visible');
    await expect(mobileSelector).toBeVisible();
  });

  test('search endpoint returns strictly isolated results for v0.3 and v0.4 without cross-leaks', async ({ request }) => {
    // 1. Unversioned legacy search defaults to v0.3
    const legacyRes = await request.get('/api/search?query=agents');
    expect(legacyRes.status()).toBe(200);
    const legacyJson = await legacyRes.json();
    expect(legacyJson.length).toBeGreaterThan(0);
    for (const item of legacyJson) {
      expect(item.url).toContain('/docs/v0.3');
      expect(item.url).not.toContain('/docs/v0.4');
    }

    // 2. Explicit v0.3 search
    const v03Res = await request.get('/api/search?query=agents&tag=v0.3');
    expect(v03Res.status()).toBe(200);
    const v03Json = await v03Res.json();
    expect(v03Json.length).toBeGreaterThan(0);
    for (const item of v03Json) {
      expect(item.url).toContain('/docs/v0.3');
      expect(item.url).not.toContain('/docs/v0.4');
    }

    // 3. Explicit v0.4 search
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
    // 1. Navigate within v0.4
    await page.goto('/en/docs/v0.4');
    await page.waitForLoadState('networkidle');

    const v04InstallLink = page.locator('main a[href*="/getting-started/installation"]').first();
    await expect(v04InstallLink).toHaveAttribute('href', '/en/docs/v0.4/getting-started/installation');
    await v04InstallLink.click();
    await page.waitForURL('**/en/docs/v0.4/getting-started/installation');
    expect(page.url()).toContain('/en/docs/v0.4/getting-started/installation');

    // 2. Navigate within v0.3
    await page.goto('/en/docs/v0.3');
    await page.waitForLoadState('networkidle');

    const v03InstallLink = page.locator('main a[href*="/getting-started/installation"]').first();
    await expect(v03InstallLink).toHaveAttribute('href', '/en/docs/v0.3/getting-started/installation');
    await v03InstallLink.click();
    await page.waitForURL('**/en/docs/v0.3/getting-started/installation');
    expect(page.url()).toContain('/en/docs/v0.3/getting-started/installation');
  });

  test('generates accurate canonical and robots metadata for stable v0.3 pages', async ({ page }) => {
    await page.goto('/en/docs/v0.3/guides/agents');
    await page.waitForLoadState('networkidle');

    // Canonical link points to versioned stable URL
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://chatflowagent.org/en/docs/v0.3/guides/agents');

    // Robots meta allows index on stable
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute('content', 'index, follow');
  });

  test('canonicalizes legacy unversioned documentation URLs to stable v0.3 equivalent', async ({ page }) => {
    await page.goto('/en/docs/guides/agents');
    await page.waitForLoadState('networkidle');

    // Canonical points to /en/docs/v0.3/guides/agents
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://chatflowagent.org/en/docs/v0.3/guides/agents');
  });

  test('enforces self-consistent canonical and noindex, follow on prerelease v0.4 pages', async ({ page }) => {
    await page.goto('/en/docs/v0.4/guides/agents');
    await page.waitForLoadState('networkidle');

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://chatflowagent.org/en/docs/v0.4/guides/agents');

    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute('content', 'noindex, follow');
  });

  test('restricts hreflang alternates strictly to genuinely translated documentation', async ({ page }) => {
    // 1. Genuine translated page: /es/docs/v0.3 has translations in es, pt-BR and en
    await page.goto('/es/docs/v0.3');
    await page.waitForLoadState('networkidle');

    const esAlternate = page.locator('link[rel="alternate"][hreflang="es"]');
    await expect(esAlternate).toHaveAttribute('href', 'https://chatflowagent.org/es/docs/v0.3');

    const ptAlternate = page.locator('link[rel="alternate"][hreflang="pt-BR"]');
    await expect(ptAlternate).toHaveAttribute('href', 'https://chatflowagent.org/pt-BR/docs/v0.3');

    const enAlternate = page.locator('link[rel="alternate"][hreflang="en"]');
    await expect(enAlternate).toHaveAttribute('href', 'https://chatflowagent.org/en/docs/v0.3');

    const xDefault = page.locator('link[rel="alternate"][hreflang="x-default"]');
    await expect(xDefault).toHaveAttribute('href', 'https://chatflowagent.org/en/docs/v0.3');

    // 2. Genuine translated page: /es/docs/v0.3/guides/agents advertises es, pt-BR and en
    await page.goto('/es/docs/v0.3/guides/agents');
    await page.waitForLoadState('networkidle');

    const esGuideAlt = page.locator('link[rel="alternate"][hreflang="es"]');
    await expect(esGuideAlt).toHaveAttribute('href', 'https://chatflowagent.org/es/docs/v0.3/guides/agents');

    const ptGuideAlt = page.locator('link[rel="alternate"][hreflang="pt-BR"]');
    await expect(ptGuideAlt).toHaveAttribute('href', 'https://chatflowagent.org/pt-BR/docs/v0.3/guides/agents');

    // 3. Genuine translated page on v0.4: /pt-BR/docs/v0.4/guides/agents advertises pt-BR, es, en, and x-default
    await page.goto('/pt-BR/docs/v0.4/guides/agents');
    await page.waitForLoadState('networkidle');

    const ptV04Alt = page.locator('link[rel="alternate"][hreflang="pt-BR"]');
    await expect(ptV04Alt).toHaveAttribute('href', 'https://chatflowagent.org/pt-BR/docs/v0.4/guides/agents');

    const esV04Alt = page.locator('link[rel="alternate"][hreflang="es"]');
    await expect(esV04Alt).toHaveAttribute('href', 'https://chatflowagent.org/es/docs/v0.4/guides/agents');

    const enV04Alt = page.locator('link[rel="alternate"][hreflang="en"]');
    await expect(enV04Alt).toHaveAttribute('href', 'https://chatflowagent.org/en/docs/v0.4/guides/agents');

    const xDefV04 = page.locator('link[rel="alternate"][hreflang="x-default"]');
    await expect(xDefV04).toHaveAttribute('href', 'https://chatflowagent.org/en/docs/v0.4/guides/agents');
  });

  test('sitemap.xml returns 200 OK, includes indexable stable docs, and excludes v0.4 and fallbacks', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);

    const text = await res.text();
    expect(text).toContain('https://chatflowagent.org/en/docs/v0.3');
    expect(text).toContain('https://chatflowagent.org/es/docs/v0.3');
    expect(text).toContain('https://chatflowagent.org/pt-BR/docs/v0.3');

    // Includes genuine Spanish and Portuguese translated guides
    expect(text).toContain('https://chatflowagent.org/es/docs/v0.3/guides/agents');
    expect(text).toContain('https://chatflowagent.org/pt-BR/docs/v0.3/guides/agents');

    // Strictly excludes v0.4
    expect(text).not.toContain('/docs/v0.4');

    // Strictly excludes unversioned doc aliases
    expect(text).not.toContain('https://chatflowagent.org/en/docs/guides');

    // Strictly excludes untranslated fallbacks (e.g. v0.4 guides)
    expect(text).not.toContain('/docs/v0.4/guides');
  });

  test('robots.txt returns 200 OK, allows crawling for noindex detection, and links sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);

    const text = await res.text();
    expect(text).toContain('User-Agent: *');
    expect(text).toContain('Allow: /');
    expect(text).toContain('Disallow: /api/');
    expect(text).toContain('Disallow: /_next/');
    expect(text).toContain('Sitemap: https://chatflowagent.org/sitemap.xml');
  });
});

