import { describe, it, expect } from 'vitest';
import { source, resolveDocPage, getVersionPageTree } from '@/lib/source';
import { TRACK_AVAILABLE_TOPICS } from '@/config/docs-topics-manifest';
import { DEFAULT_STABLE_TRACK } from '@/config/docs-versions';
import { isGenuineTranslation, resolveDocSeo, SITE_ORIGIN } from '@/config/docs-seo';
import sitemap from '@/app/sitemap';

describe('Phase 6T.1: Complete Spanish Documentation Coverage Suite (v0.3 Stable)', () => {
  const v03Topics = TRACK_AVAILABLE_TOPICS['v0.3'];

  it('has exactly 21 documented topics in the stable track inventory', () => {
    expect(v03Topics.length).toBe(21);
  });

  describe('Topic Completeness & Genuine Translation Verification', () => {
    for (const topic of v03Topics) {
      const cleanSlug = topic ? topic.split('/') : [];
      const topicPath = cleanSlug.length > 0 ? cleanSlug.join('/') : 'index';

      it(`resolves topic [${topicPath}] as a genuine Spanish translation with no fallback`, () => {
        const { page, isFallback, track } = resolveDocPage(['v0.3', ...cleanSlug], 'es');

        expect(page).toBeDefined();
        expect(track).toBe(DEFAULT_STABLE_TRACK);
        expect(isFallback).toBe(false);
        expect(page?.path).toMatch(/^es\/v0\.3\//);

        // Verify genuine translation detection
        expect(isGenuineTranslation(DEFAULT_STABLE_TRACK, cleanSlug, 'es')).toBe(true);
      });

      it(`defines valid Spanish frontmatter for topic [${topicPath}]`, () => {
        const targetSlug = ['v0.3', ...cleanSlug];
        const page = source.getPage(targetSlug, 'es');

        expect(page).toBeDefined();
        expect(typeof page?.data.title).toBe('string');
        if (typeof page?.data.title === 'string') {
          expect(page.data.title.trim().length).toBeGreaterThan(0);
        }

        expect(typeof page?.data.description).toBe('string');
        if (typeof page?.data.description === 'string') {
          expect(page.data.description.trim().length).toBeGreaterThan(0);
        }
      });

      it(`resolves correct canonical SEO and indexable robots for topic [${topicPath}]`, () => {
        const seo = resolveDocSeo({
          track: DEFAULT_STABLE_TRACK,
          cleanSlug,
          locale: 'es',
          isExplicitTrack: true,
          isFallback: false,
        });

        const expectedSubpath = cleanSlug.length > 0 ? `/${cleanSlug.join('/')}` : '';
        const expectedUrl = `${SITE_ORIGIN}/es/docs/v0.3${expectedSubpath}`;

        expect(seo.isIndexable).toBe(true);
        expect(seo.robots).toEqual({ index: true, follow: true });
        expect(seo.canonicalUrl).toBe(expectedUrl);
        expect(seo.languages['es']).toBe(expectedUrl);
        expect(seo.languages['en']).toBe(`${SITE_ORIGIN}/en/docs/v0.3${expectedSubpath}`);
        expect(seo.languages['x-default']).toBe(`${SITE_ORIGIN}/en/docs/v0.3${expectedSubpath}`);
      });
    }
  });

  describe('Sidebar Page Tree Navigation in Spanish', () => {
    const esTree = getVersionPageTree('v0.3', 'es');

    it('returns a page tree with Spanish localized folder groups', () => {
      expect(esTree).toBeDefined();
      expect(esTree.children.length).toBe(6); // index + 5 folders

      const names = esTree.children.map((c) => (typeof c.name === 'string' ? c.name : ''));
      expect(names).toContain('Primeros Pasos');
      expect(names).toContain('Arquitectura Central');
      expect(names).toContain('Proveedores de LLM');
      expect(names).toContain('Canales e Integraciones');
      expect(names).toContain('Patrones de Producción');
    });

    it('ensures all URLs in the Spanish page tree point to /es/docs/v0.3 routes', () => {
      function verifyTreeUrls(nodes: typeof esTree.children) {
        for (const node of nodes) {
          if (node.type === 'page') {
            expect(node.url).toMatch(/^\/es\/docs\/v0\.3(\/|$)/);
          } else if (node.type === 'folder') {
            if (node.index) {
              expect(node.index.url).toMatch(/^\/es\/docs\/v0\.3(\/|$)/);
            }
            verifyTreeUrls(node.children);
          }
        }
      }

      verifyTreeUrls(esTree.children);
    });
  });

  describe('Sitemap Coverage for Spanish Stable Documentation', () => {
    const entries = sitemap();

    it('includes all 21 Spanish topics in the generated canonical sitemap', () => {
      const esV03Entries = entries.filter((e) => e.url.startsWith(`${SITE_ORIGIN}/es/docs/v0.3`));
      expect(esV03Entries.length).toBe(21);

      for (const topic of v03Topics) {
        const subpath = topic ? `/${topic}` : '';
        const targetUrl = `${SITE_ORIGIN}/es/docs/v0.3${subpath}`;
        const found = esV03Entries.some((e) => e.url === targetUrl);
        expect(found, `Expected sitemap to include ${targetUrl}`).toBe(true);
      }
    });
  });
});

