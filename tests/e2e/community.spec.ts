import { test, expect } from '@playwright/test';

test.describe('Home and Community Navigation Suite', () => {
  test('should display explicit Home link and active navigation state on desktop', async ({ page }) => {
    await page.goto('/en');

    // Explicit Home link in desktop navigation
    const homeNav = page.locator('header nav a[href="/en"]').first();
    await expect(homeNav).toBeVisible();
    await expect(homeNav).toHaveText('Home');
    await expect(homeNav).toHaveAttribute('aria-current', 'page');
    await expect(homeNav).toHaveClass(/font-semibold/);

    // Other nav links
    const docsNav = page.locator('header nav a[href="/en/docs"]').first();
    const communityNav = page.locator('header nav a[href="/en/community"]').first();
    const aboutNav = page.locator('header nav a[href="/en/about"]').first();

    await expect(docsNav).toBeVisible();
    await expect(communityNav).toBeVisible();
    await expect(aboutNav).toBeVisible();

    // Verify other links are not marked active on home
    await expect(docsNav).not.toHaveAttribute('aria-current', 'page');
    await expect(communityNav).not.toHaveAttribute('aria-current', 'page');
    await expect(aboutNav).not.toHaveAttribute('aria-current', 'page');

    // Click Community link
    await communityNav.click();
    await page.waitForURL('**/en/community');

    // Verify active navigation state switched to Community
    await expect(communityNav).toHaveAttribute('aria-current', 'page');
    await expect(communityNav).toHaveClass(/font-semibold/);
    await expect(homeNav).not.toHaveAttribute('aria-current', 'page');
  });

  test('should render Community page with verified resources, steps, and governance notice', async ({ page }) => {
    await page.goto('/en/community');

    // Exactly one h1
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toContainText('chatflow-agent Community');

    // Badge
    const badge = page.locator('header span:has-text("Community & Ecosystem")');
    await expect(badge).toBeVisible();

    // Resource Cards
    const repoCard = page.locator('article', { hasText: 'GitHub Repository' });
    await expect(repoCard).toBeVisible();
    const repoLink = repoCard.locator('a[href="https://github.com/GustavoBaranda/chatflow-agent"]');
    await expect(repoLink).toBeVisible();
    await expect(repoLink).toHaveAttribute('target', '_blank');
    await expect(repoLink).toHaveAttribute('rel', 'noopener noreferrer');

    const issuesCard = page.locator('article', { hasText: 'Issues & Bug Reports' });
    await expect(issuesCard).toBeVisible();
    const issuesLink = issuesCard.locator('a[href="https://github.com/GustavoBaranda/chatflow-agent/issues"]');
    await expect(issuesLink).toBeVisible();

    const featuresCard = page.locator('article', { hasText: 'Feature Requests & Ideas' });
    await expect(featuresCard).toBeVisible();
    const featuresLink = featuresCard.locator('a[href="https://github.com/GustavoBaranda/chatflow-agent/issues/new"]');
    await expect(featuresLink).toBeVisible();

    const prsCard = page.locator('article', { hasText: 'Contributing & Pull Requests' });
    await expect(prsCard).toBeVisible();
    const prsLink = prsCard.locator('a[href="https://github.com/GustavoBaranda/chatflow-agent/pulls"]');
    await expect(prsLink).toBeVisible();

    const releasesCard = page.locator('article', { hasText: 'Releases & Changelog' });
    await expect(releasesCard).toBeVisible();
    const releasesLink = releasesCard.locator('a[href="https://github.com/GustavoBaranda/chatflow-agent/releases"]');
    await expect(releasesLink).toBeVisible();

    const pypiCard = page.locator('article', { hasText: 'PyPI Distribution' });
    await expect(pypiCard).toBeVisible();
    const pypiLink = pypiCard.locator('a[href="https://pypi.org/project/chatflow-agent/"]');
    await expect(pypiLink).toBeVisible();

    const docsCard = page.locator('article', { hasText: 'Official Documentation' });
    await expect(docsCard).toBeVisible();
    const docsLink = docsCard.locator('a[href="/en/docs"]');
    await expect(docsLink).toBeVisible();
    const quickstartBannerLink = docsCard.locator('a[href="/en/docs/v0.3/getting-started/quickstart"]');
    await expect(quickstartBannerLink).toBeVisible();

    // Balanced 3x2 External Resource Grid (6 external cards)
    const externalCards = page.locator('section[aria-labelledby="resources-heading"] article');
    await expect(externalCards).toHaveCount(6);

    // How to Contribute Section (4 steps)
    const contributeHeading = page.locator('h2:has-text("How to Contribute")');
    await expect(contributeHeading).toBeVisible();

    const stepCards = page.locator('section[aria-labelledby="how-to-contribute-heading"] .rounded-xl');
    await expect(stepCards).toHaveCount(4);

    // Open Source Collaboration Notice
    const governanceHeading = page.locator('h2:has-text("Open Source Collaboration")');
    await expect(governanceHeading).toBeVisible();

    // Canonical link tag in DOM
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://chatflowagent.org/en/community');
  });

  test('should support multilingual Community page and localized Home link', async ({ page }) => {
    // Test Spanish (es)
    await page.goto('/es/community');
    await expect(page.locator('h1')).toContainText('Comunidad de chatflow-agent');
    const esHomeNav = page.locator('header nav a[href="/es"]').first();
    await expect(esHomeNav).toHaveText('Inicio');

    const esCanonical = page.locator('link[rel="canonical"]');
    await expect(esCanonical).toHaveAttribute('href', 'https://chatflowagent.org/es/community');

    // Test Brazilian Portuguese (pt-BR)
    await page.goto('/pt-BR/community');
    await expect(page.locator('h1')).toContainText('Comunidade chatflow-agent');
    const ptHomeNav = page.locator('header nav a[href="/pt-BR"]').first();
    await expect(ptHomeNav).toHaveText('Início');

    const ptCanonical = page.locator('link[rel="canonical"]');
    await expect(ptCanonical).toHaveAttribute('href', 'https://chatflowagent.org/pt-BR/community');
  });

  test('should display Home and Community links in mobile drawer with active states', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en');

    // Open mobile drawer
    const menuToggle = page.locator('header button[aria-label="Toggle navigation menu"]');
    await expect(menuToggle).toBeVisible();
    await menuToggle.click();

    // Mobile nav drawer
    const mobileNav = page.locator('nav[aria-label="Mobile navigation"]');
    await expect(mobileNav).toBeVisible();

    const mobileHome = mobileNav.locator('a[href="/en"]');
    const mobileCommunity = mobileNav.locator('a[href="/en/community"]');

    await expect(mobileHome).toBeVisible();
    await expect(mobileHome).toHaveAttribute('aria-current', 'page');
    await expect(mobileCommunity).toBeVisible();
    await expect(mobileCommunity).not.toHaveAttribute('aria-current', 'page');

    // Navigate to Community from mobile drawer
    await mobileCommunity.click();
    await page.waitForURL('**/en/community');
    await expect(page.locator('h1')).toContainText('chatflow-agent Community');

    // Reopen mobile drawer and verify Community is active
    await menuToggle.click();
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.locator('a[href="/en/community"]')).toHaveAttribute('aria-current', 'page');
    await expect(mobileNav.locator('a[href="/en"]')).not.toHaveAttribute('aria-current', 'page');
  });
});
