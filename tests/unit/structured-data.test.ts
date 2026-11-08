import { describe, it, expect } from 'vitest';
import {
  AUTHOR_ID,
  SOURCE_CODE_ID,
  APPLICATION_ID,
  WEBSITE_ID,
  GITHUB_REPO_URL,
  CREATOR_GITHUB_URL,
  PYPI_PACKAGE_URL,
  LICENSE_URL,
  STABLE_SDK_VERSION,
  getPersonEntity,
  getSoftwareSourceCodeEntity,
  getSoftwareApplicationEntity,
  getWebSiteEntity,
  createBreadcrumbList,
  getHomeStructuredData,
  getAboutStructuredData,
  getCommunityStructuredData,
  getDocStructuredData,
  safeJsonLdReplacer,
} from '@/lib/structured-data';

describe('Schema.org Structured Data (JSON-LD) Suite', () => {
  describe('BreadcrumbList Generation', () => {
    it('omits navigation categories without valid URLs and renumbers the remaining items', () => {
      const data = createBreadcrumbList([
        { name: 'Home', url: 'https://chatflowagent.org/en' },
        { name: 'Getting Started' },
        { name: 'Invalid', url: 'not-a-url' },
        {
          name: 'Core Concepts',
          url: 'https://chatflowagent.org/en/docs/v0.3/getting-started/core-concepts',
        },
      ]);
      const items = data['itemListElement'] as Array<{
        position: number;
        item: string;
      }>;

      expect(items).toHaveLength(2);
      expect(items.map(({ position }) => position)).toEqual([1, 2]);
      expect(items.every(({ item }) => URL.canParse(item))).toBe(true);
      expect(items.every(({ item }) => item.startsWith('https://'))).toBe(true);
    });
  });

  describe('Safe JSON-LD Serialization', () => {
    it('escapes "<" characters to prevent script breaking or XSS', () => {
      const malicious = {
        title: 'Python <script>alert("hack")</script> & Agents',
      };
      const serialized = safeJsonLdReplacer(malicious);
      expect(serialized).not.toContain('<');
      expect(serialized).toContain('\\u003cscript>');
      expect(serialized).toContain('\\u003c/script>');
      // When parsed by standard JSON parser, it resolves back to the original string
      expect(JSON.parse(serialized)).toEqual(malicious);
    });
  });

  describe('Authoritative Person Entity', () => {
    const person = getPersonEntity();

    it('identifies Gustavo Baranda as Creator & Lead Maintainer', () => {
      expect(person['@type']).toBe('Person');
      expect(person['@id']).toBe(AUTHOR_ID);
      expect(person['name']).toBe('Gustavo Baranda');
      expect(person['jobTitle']).toBe('Creator & Lead Maintainer');
      expect(person['url']).toBe(CREATOR_GITHUB_URL);
    });

    it('contains exclusively verified profiles in sameAs without fabricated social links', () => {
      expect(person['sameAs']).toEqual([CREATOR_GITHUB_URL]);
    });
  });

  describe('SoftwareSourceCode Entity', () => {
    it('accurately describes Python SDK repository with verified attributes in English', () => {
      const code = getSoftwareSourceCodeEntity('en');
      expect(code['@type']).toBe('SoftwareSourceCode');
      expect(code['@id']).toBe(SOURCE_CODE_ID);
      expect(code['name']).toBe('chatflow-agent');
      expect(code['programmingLanguage']).toEqual({
        '@type': 'ComputerLanguage',
        name: 'Python',
        version: '3.10',
      });
      expect(code['runtimePlatform']).toBe('Python >=3.10');
      expect(code['codeRepository']).toBe(GITHUB_REPO_URL);
      expect(code['license']).toBe(LICENSE_URL);
      expect(code['version']).toBe(STABLE_SDK_VERSION);
      expect(code['author']).toEqual({ '@id': AUTHOR_ID });
      expect(code['maintainer']).toEqual({ '@id': AUTHOR_ID });
      expect(code['targetProduct']).toEqual({ '@id': APPLICATION_ID });
    });

    it('localizes description for Spanish and Brazilian Portuguese', () => {
      const codeEs = getSoftwareSourceCodeEntity('es');
      expect(codeEs['description']).toContain('Librería Python de código abierto');

      const codePt = getSoftwareSourceCodeEntity('pt-BR');
      expect(codePt['description']).toContain('Biblioteca Python de código aberto');
    });

    it('excludes fabricated ratings, downloads, or organizations', () => {
      const code = getSoftwareSourceCodeEntity('en');
      expect(code['aggregateRating']).toBeUndefined();
      expect(code['interactionStatistic']).toBeUndefined();
      expect(code['offers']).toBeUndefined();
    });
  });

  describe('SoftwareApplication Entity', () => {
    it('accurately models package distribution on PyPI', () => {
      const app = getSoftwareApplicationEntity('en');
      expect(app['@type']).toBe('SoftwareApplication');
      expect(app['@id']).toBe(APPLICATION_ID);
      expect(app['name']).toBe('chatflow-agent');
      expect(app['applicationCategory']).toBe('DeveloperApplication');
      expect(app['operatingSystem']).toBe('Cross-platform (Linux, macOS, Windows)');
      expect(app['softwareVersion']).toBe(STABLE_SDK_VERSION);
      expect(app['license']).toBe(LICENSE_URL);
      expect(app['downloadUrl']).toBe(PYPI_PACKAGE_URL);
      expect(app['installUrl']).toBe(PYPI_PACKAGE_URL);
      expect(app['author']).toEqual({ '@id': AUTHOR_ID });
    });

    it('excludes fabricated pricing or reviews', () => {
      const app = getSoftwareApplicationEntity('en');
      expect(app['offers']).toBeUndefined();
      expect(app['review']).toBeUndefined();
    });
  });

  describe('WebSite Entity', () => {
    it('defines authoritative website metadata and multilingual capabilities', () => {
      const site = getWebSiteEntity();
      expect(site['@type']).toBe('WebSite');
      expect(site['@id']).toBe(WEBSITE_ID);
      expect(site['name']).toBe('chatflow-agent');
      expect(site['url']).toBe('https://chatflowagent.org');
      expect(site['inLanguage']).toEqual(['en', 'es', 'pt-BR']);
      expect(site['publisher']).toEqual({ '@id': AUTHOR_ID });
    });
  });

  describe('Home Page Structured Data Graph', () => {
    it('assembles complete entity graph for landing page', () => {
      const data = getHomeStructuredData('en');
      expect(data['@context']).toBe('https://schema.org');
      const graph = data['@graph'] as Array<Record<string, unknown>>;
      expect(graph).toHaveLength(4);

      const types = graph.map((e) => e['@type']);
      expect(types).toContain('WebSite');
      expect(types).toContain('Person');
      expect(types).toContain('SoftwareSourceCode');
      expect(types).toContain('SoftwareApplication');
    });
  });

  describe('About & Community Structured Data Graphs', () => {
    it('provides localized breadcrumbs and WebPage graph for About page', () => {
      const data = getAboutStructuredData('es');
      expect(data['@context']).toBe('https://schema.org');
      const graph = data['@graph'] as Array<Record<string, unknown>>;

      const breadcrumbs = graph.find((e) => e['@type'] === 'BreadcrumbList') as Record<string, unknown>;
      expect(breadcrumbs).toBeDefined();
      const items = breadcrumbs['itemListElement'] as Array<{ position: number; name: string; item: string }>;
      expect(items[0]).toEqual({ '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://chatflowagent.org/es' });
      expect(items[1]).toEqual({ '@type': 'ListItem', position: 2, name: 'Acerca de', item: 'https://chatflowagent.org/es/about' });

      const webPage = graph.find((e) => e['@type'] === 'WebPage');
      expect(webPage).toBeDefined();
      expect(webPage?.['about']).toEqual({ '@id': AUTHOR_ID });
    });

    it('provides localized breadcrumbs and WebPage graph for Community page in Portuguese', () => {
      const data = getCommunityStructuredData('pt-BR');
      const graph = data['@graph'] as Array<Record<string, unknown>>;

      const breadcrumbs = graph.find((e) => e['@type'] === 'BreadcrumbList') as Record<string, unknown>;
      const items = breadcrumbs['itemListElement'] as Array<{ position: number; name: string; item: string }>;
      expect(items[0]).toEqual({ '@type': 'ListItem', position: 1, name: 'Início', item: 'https://chatflowagent.org/pt-BR' });
      expect(items[1]).toEqual({ '@type': 'ListItem', position: 2, name: 'Comunidade', item: 'https://chatflowagent.org/pt-BR/community' });

      const webPage = graph.find((e) => e['@type'] === 'WebPage');
      expect(webPage?.['about']).toEqual({ '@id': SOURCE_CODE_ID });
    });
  });

  describe('Documentation Structured Data Graph', () => {
    it('creates accurate 2-level breadcrumb and TechArticle for documentation overview', () => {
      const data = getDocStructuredData({
        title: 'Documentation Overview',
        description: 'Comprehensive guides and references.',
        canonicalUrl: 'https://chatflowagent.org/en/docs/v0.3',
        locale: 'en',
        track: 'v0.3',
        cleanSlug: [],
      });

      const graph = data['@graph'] as Array<Record<string, unknown>>;
      const breadcrumbs = graph.find((e) => e['@type'] === 'BreadcrumbList') as Record<string, unknown>;
      const items = breadcrumbs['itemListElement'] as Array<{ position: number; name: string; item?: string }>;

      expect(items).toHaveLength(2);
      expect(items[0]).toEqual({ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://chatflowagent.org/en' });
      expect(items[1]).toEqual({ '@type': 'ListItem', position: 2, name: 'Documentation (v0.3)', item: 'https://chatflowagent.org/en/docs/v0.3' });

      const article = graph.find((e) => e['@type'] === 'TechArticle') as Record<string, unknown>;
      expect(article['headline']).toBe('Documentation Overview');
      expect(article['url']).toBe('https://chatflowagent.org/en/docs/v0.3');
      expect(article['isPartOf']).toEqual({ '@id': WEBSITE_ID });
      expect(article['about']).toEqual({ '@id': SOURCE_CODE_ID });
    });

    it('omits a translated navigation category without an index page', () => {
      const data = getDocStructuredData({
        title: 'Agentes Conversacionales',
        description: 'Guía para construir agentes.',
        canonicalUrl: 'https://chatflowagent.org/es/docs/v0.3/guides/agents',
        locale: 'es',
        track: 'v0.3',
        cleanSlug: ['guides', 'agents'],
      });

      const graph = data['@graph'] as Array<Record<string, unknown>>;
      const breadcrumbs = graph.find((e) => e['@type'] === 'BreadcrumbList') as Record<string, unknown>;
      const items = breadcrumbs['itemListElement'] as Array<{ position: number; name: string; item: string }>;

      expect(items).toHaveLength(3);
      expect(items[0]).toEqual({ '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://chatflowagent.org/es' });
      expect(items[1]).toEqual({ '@type': 'ListItem', position: 2, name: 'Documentación (v0.3)', item: 'https://chatflowagent.org/es/docs/v0.3' });
      expect(items[2]).toEqual({
        '@type': 'ListItem',
        position: 3,
        name: 'Agentes Conversacionales',
        item: 'https://chatflowagent.org/es/docs/v0.3/guides/agents',
      });
    });

    it.each([
      ['en', 'v0.3'],
      ['es', 'v0.3'],
      ['pt-BR', 'v0.3'],
      ['en', 'v0.4'],
      ['es', 'v0.4'],
      ['pt-BR', 'v0.4'],
    ] as const)(
      'emits only linked breadcrumb items for core concepts in %s %s',
      (locale, track) => {
        const canonicalUrl = `https://chatflowagent.org/${locale}/docs/${track}/getting-started/core-concepts`;
        const data = getDocStructuredData({
          title: 'Core Concepts',
          description: 'Core concepts.',
          canonicalUrl,
          locale,
          track,
          cleanSlug: ['getting-started', 'core-concepts'],
        });

        const graph = data['@graph'] as Array<Record<string, unknown>>;
        const breadcrumbs = graph.find((entry) => entry['@type'] === 'BreadcrumbList') as Record<string, unknown>;
        const items = breadcrumbs['itemListElement'] as Array<{
          position: number;
          item: string;
        }>;

        expect(items).toHaveLength(3);
        expect(items.map(({ position }) => position)).toEqual([1, 2, 3]);
        expect(items.every(({ item }) => URL.canParse(item))).toBe(true);
        expect(items.at(-1)?.item).toBe(canonicalUrl);
      }
    );

    it('creates breadcrumb with section URL when section has its own index (providers)', () => {
      const data = getDocStructuredData({
        title: 'OpenAI Provider',
        description: 'Using OpenAI engine.',
        canonicalUrl: 'https://chatflowagent.org/en/docs/v0.3/providers/openai',
        locale: 'en',
        track: 'v0.3',
        cleanSlug: ['providers', 'openai'],
      });

      const graph = data['@graph'] as Array<Record<string, unknown>>;
      const breadcrumbs = graph.find((e) => e['@type'] === 'BreadcrumbList') as Record<string, unknown>;
      const items = breadcrumbs['itemListElement'] as Array<{ position: number; name: string; item?: string }>;

      expect(items).toHaveLength(4);
      expect(items[2]).toEqual({
        '@type': 'ListItem',
        position: 3,
        name: 'Providers',
        item: 'https://chatflowagent.org/en/docs/v0.3/providers',
      });
      expect(items[3]).toEqual({
        '@type': 'ListItem',
        position: 4,
        name: 'OpenAI Provider',
        item: 'https://chatflowagent.org/en/docs/v0.3/providers/openai',
      });
    });

    it('respects prerelease track v0.4 in documentation breadcrumbs', () => {
      const data = getDocStructuredData({
        title: 'Prerelease Overview',
        description: 'v0.4 preview.',
        canonicalUrl: 'https://chatflowagent.org/en/docs/v0.4',
        locale: 'en',
        track: 'v0.4',
        cleanSlug: [],
      });

      const graph = data['@graph'] as Array<Record<string, unknown>>;
      const breadcrumbs = graph.find((e) => e['@type'] === 'BreadcrumbList') as Record<string, unknown>;
      const items = breadcrumbs['itemListElement'] as Array<{ position: number; name: string; item?: string }>;

      expect(items[1]).toEqual({
        '@type': 'ListItem',
        position: 2,
        name: 'Documentation (v0.4)',
        item: 'https://chatflowagent.org/en/docs/v0.4',
      });
    });
  });
});
