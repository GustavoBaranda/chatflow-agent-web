import { test, expect } from '@playwright/test';

test.describe('Schema.org Structured Data (JSON-LD) E2E Suite', () => {
  test('should render valid WebSite, Person, SoftwareSourceCode, and SoftwareApplication on Home (/en)', async ({
    page,
  }) => {
    await page.goto('/en');
    await page.waitForLoadState('domcontentloaded');

    const jsonLdScript = page.locator('script[type="application/ld+json"]');
    await expect(jsonLdScript).toBeAttached();

    const content = await jsonLdScript.textContent();
    expect(content).toBeTruthy();

    const data = JSON.parse(content!);
    expect(data['@context']).toBe('https://schema.org');
    expect(Array.isArray(data['@graph'])).toBe(true);

    const graph = data['@graph'] as Array<Record<string, unknown>>;
    const types = graph.map((e) => e['@type']);

    expect(types).toContain('WebSite');
    expect(types).toContain('Person');
    expect(types).toContain('SoftwareSourceCode');
    expect(types).toContain('SoftwareApplication');

    // Person verification (Gustavo Baranda, Creator & Lead Maintainer)
    const person = graph.find((e) => e['@type'] === 'Person')!;
    expect(person['name']).toBe('Gustavo Baranda');
    expect(person['jobTitle']).toBe('Creator & Lead Maintainer');
    expect(person['url']).toBe('https://github.com/GustavoBaranda');
    expect(person['sameAs']).toEqual(['https://github.com/GustavoBaranda']);

    // SoftwareSourceCode verification (chatflow-agent)
    const code = graph.find((e) => e['@type'] === 'SoftwareSourceCode')!;
    expect(code['name']).toBe('chatflow-agent');
    expect(code['codeRepository']).toBe('https://github.com/GustavoBaranda/chatflow-agent');
    expect(code['version']).toBe('0.3.4');
    expect(code['license']).toBe('https://opensource.org/licenses/MIT');
    expect(code['runtimePlatform']).toBe('Python >=3.10');

    // SoftwareApplication verification (PyPI)
    const app = graph.find((e) => e['@type'] === 'SoftwareApplication')!;
    expect(app['name']).toBe('chatflow-agent');
    expect(app['applicationCategory']).toBe('DeveloperApplication');
    expect(app['downloadUrl']).toBe('https://pypi.org/project/chatflow-agent/');
    expect(app['operatingSystem']).toBe('Cross-platform (Linux, macOS, Windows)');
  });

  test('should render localized BreadcrumbList and Person on About (/es/about)', async ({ page }) => {
    await page.goto('/es/about');
    await page.waitForLoadState('domcontentloaded');

    const jsonLdScript = page.locator('script[type="application/ld+json"]');
    await expect(jsonLdScript).toBeAttached();

    const data = JSON.parse((await jsonLdScript.textContent())!);
    const graph = data['@graph'] as Array<Record<string, unknown>>;

    const breadcrumbs = graph.find((e) => e['@type'] === 'BreadcrumbList')!;
    const items = breadcrumbs['itemListElement'] as Array<{ position: number; name: string; item: string }>;

    expect(items).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://chatflowagent.org/es' },
      { '@type': 'ListItem', position: 2, name: 'Acerca de', item: 'https://chatflowagent.org/es/about' },
    ]);

    const person = graph.find((e) => e['@type'] === 'Person')!;
    expect(person['name']).toBe('Gustavo Baranda');
  });

  test('should render localized BreadcrumbList on Community (/pt-BR/community)', async ({ page }) => {
    await page.goto('/pt-BR/community');
    await page.waitForLoadState('domcontentloaded');

    const jsonLdScript = page.locator('script[type="application/ld+json"]');
    await expect(jsonLdScript).toBeAttached();

    const data = JSON.parse((await jsonLdScript.textContent())!);
    const graph = data['@graph'] as Array<Record<string, unknown>>;

    const breadcrumbs = graph.find((e) => e['@type'] === 'BreadcrumbList')!;
    const items = breadcrumbs['itemListElement'] as Array<{ position: number; name: string; item: string }>;

    expect(items).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://chatflowagent.org/pt-BR' },
      { '@type': 'ListItem', position: 2, name: 'Comunidade', item: 'https://chatflowagent.org/pt-BR/community' },
    ]);
  });

  test('should render BreadcrumbList and TechArticle on Documentation overview (/en/docs)', async ({ page }) => {
    await page.goto('/en/docs');
    await page.waitForLoadState('domcontentloaded');

    const jsonLdScript = page.locator('script[type="application/ld+json"]');
    await expect(jsonLdScript).toBeAttached();

    const data = JSON.parse((await jsonLdScript.textContent())!);
    const graph = data['@graph'] as Array<Record<string, unknown>>;

    const breadcrumbs = graph.find((e) => e['@type'] === 'BreadcrumbList')!;
    const items = breadcrumbs['itemListElement'] as Array<{ position: number; name: string; item: string }>;

    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://chatflowagent.org/en',
    });
    expect(items[1]).toEqual({
      '@type': 'ListItem',
      position: 2,
      name: 'Documentation (v0.3)',
      item: 'https://chatflowagent.org/en/docs/v0.3',
    });

    const article = graph.find((e) => e['@type'] === 'TechArticle')!;
    expect(article['headline']).toContain('Documentation Overview');
    expect(article['url']).toBe('https://chatflowagent.org/en/docs/v0.3');
  });

  test('should render 4-level BreadcrumbList on specific guide (/en/docs/v0.3/guides/agents)', async ({ page }) => {
    await page.goto('/en/docs/v0.3/guides/agents');
    await page.waitForLoadState('domcontentloaded');

    const jsonLdScript = page.locator('script[type="application/ld+json"]');
    await expect(jsonLdScript).toBeAttached();

    const data = JSON.parse((await jsonLdScript.textContent())!);
    const graph = data['@graph'] as Array<Record<string, unknown>>;

    const breadcrumbs = graph.find((e) => e['@type'] === 'BreadcrumbList')!;
    const items = breadcrumbs['itemListElement'] as Array<{ position: number; name: string; item?: string }>;

    expect(items).toHaveLength(4);
    expect(items[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://chatflowagent.org/en',
    });
    expect(items[1]).toEqual({
      '@type': 'ListItem',
      position: 2,
      name: 'Documentation (v0.3)',
      item: 'https://chatflowagent.org/en/docs/v0.3',
    });
    expect(items[2]).toEqual({
      '@type': 'ListItem',
      position: 3,
      name: 'Guides',
    });
    expect(items[3]).toEqual({
      '@type': 'ListItem',
      position: 4,
      name: 'Agents & Dynamic Instructions',
      item: 'https://chatflowagent.org/en/docs/v0.3/guides/agents',
    });
  });

  test('should preserve noindex on prerelease v0.4 while emitting structured data (/en/docs/v0.4)', async ({
    page,
  }) => {
    await page.goto('/en/docs/v0.4');
    await page.waitForLoadState('domcontentloaded');

    // 1. Strict robots verification: MUST BE NOINDEX
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute('content', 'noindex, follow');

    // 2. Structured data verification
    const jsonLdScript = page.locator('script[type="application/ld+json"]');
    await expect(jsonLdScript).toBeAttached();

    const data = JSON.parse((await jsonLdScript.textContent())!);
    const graph = data['@graph'] as Array<Record<string, unknown>>;

    const breadcrumbs = graph.find((e) => e['@type'] === 'BreadcrumbList')!;
    const items = breadcrumbs['itemListElement'] as Array<{ position: number; name: string; item: string }>;

    expect(items[1]).toEqual({
      '@type': 'ListItem',
      position: 2,
      name: 'Documentation (v0.4)',
      item: 'https://chatflowagent.org/en/docs/v0.4',
    });
  });
});

