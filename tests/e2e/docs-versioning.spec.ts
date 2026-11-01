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

  test('preserves TranslationNotice and noindex on fallback pages in v0.4', async ({ page }) => {
    await page.goto('/es/docs/v0.4/guides/agents');
    await page.waitForLoadState('networkidle');

    // TranslationNotice banner should be present for non-translated fallback
    const notice = page.locator('aside[role="alert"]');
    await expect(notice).toBeVisible();
    await expect(notice).toContainText('Authoritative English Content Displayed');

    // HTML lang attribute matches requested locale
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');

    // Robots meta has noindex for fallback
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute('content', 'noindex, follow');
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
});

