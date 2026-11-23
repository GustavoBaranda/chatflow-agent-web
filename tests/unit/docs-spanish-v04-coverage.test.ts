import { describe, it, expect } from 'vitest';
import { source, resolveDocPage, getVersionPageTree } from '@/lib/source';
import { TRACK_AVAILABLE_TOPICS } from '@/config/docs-topics-manifest';
import { DEFAULT_STABLE_TRACK } from '@/config/docs-versions';
import { isGenuineTranslation, resolveDocSeo, SITE_ORIGIN } from '@/config/docs-seo';
import sitemap from '@/app/sitemap';

describe('Complete Spanish Documentation Coverage Suite (v0.4 Latest / Stable)', () => {
  const v04Topics = TRACK_AVAILABLE_TOPICS['v0.4'];

  it('has all 23 documented topics in the v0.4 Latest / Stable track inventory', () => {
    expect(v04Topics.length).toBe(23);
  });

  describe('Topic Completeness & Genuine Translation Verification', () => {
    for (const topic of v04Topics) {
      const cleanSlug = topic ? topic.split('/') : [];
      const topicPath = cleanSlug.length > 0 ? cleanSlug.join('/') : 'index';

      it(`resolves topic [${topicPath}] as a genuine Spanish translation with no fallback`, () => {
        const { page, isFallback, track } = resolveDocPage(['v0.4', ...cleanSlug], 'es');

        expect(page).toBeDefined();
        expect(track).toBe(DEFAULT_STABLE_TRACK);
        expect(isFallback).toBe(false);
        expect(page?.path).toMatch(/^es\/v0\.4\//);

        expect(isGenuineTranslation(DEFAULT_STABLE_TRACK, cleanSlug, 'es')).toBe(true);
      });

      it(`defines valid Spanish frontmatter for topic [${topicPath}]`, () => {
        const targetSlug = ['v0.4', ...cleanSlug];
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

      it(`resolves correct canonical SEO and indexable robots (index, follow) for topic [${topicPath}]`, () => {
        const seo = resolveDocSeo({
          track: DEFAULT_STABLE_TRACK,
          cleanSlug,
          locale: 'es',
          isExplicitTrack: true,
          isFallback: false,
        });

        const expectedSubpath = cleanSlug.length > 0 ? `/${cleanSlug.join('/')}` : '';
        const expectedUrl = `${SITE_ORIGIN}/es/docs/v0.4${expectedSubpath}`;

        expect(seo.isIndexable).toBe(true);
        expect(seo.robots).toEqual({ index: true, follow: true });
        expect(seo.canonicalUrl).toBe(expectedUrl);
        expect(seo.languages['es']).toBe(expectedUrl);
        expect(seo.languages['en']).toBe(`${SITE_ORIGIN}/en/docs/v0.4${expectedSubpath}`);
        expect(seo.languages['x-default']).toBe(`${SITE_ORIGIN}/en/docs/v0.4${expectedSubpath}`);
        expect(seo.languages['pt-BR']).toBe(`${SITE_ORIGIN}/pt-BR/docs/v0.4${expectedSubpath}`);
      });
    }
  });

  describe('Sidebar Page Tree Navigation in Spanish (v0.4)', () => {
    const esTree = getVersionPageTree('v0.4', 'es');

    it('returns a page tree with Spanish localized folder groups', () => {
      expect(esTree).toBeDefined();
      expect(esTree.children.length).toBe(6);

      const names = esTree.children.map((c) => (typeof c.name === 'string' ? c.name : ''));
      expect(names).toContain('Primeros Pasos');
      expect(names).toContain('Arquitectura Central');
      expect(names).toContain('Proveedores de LLM');
      expect(names).toContain('Canales e Integraciones');
      expect(names).toContain('Patrones de Producción');
    });

    it('ensures all URLs in the Spanish v0.4 page tree point to /es/docs/v0.4 routes', () => {
      function verifyTreeUrls(nodes: typeof esTree.children) {
        for (const node of nodes) {
          if (node.type === 'page') {
            expect(node.url).toMatch(/^\/es\/docs\/v0\.4(\/|$)/);
          } else if (node.type === 'folder') {
            if (node.index) {
              expect(node.index.url).toMatch(/^\/es\/docs\/v0\.4(\/|$)/);
            }
            verifyTreeUrls(node.children);
          }
        }
      }

      verifyTreeUrls(esTree.children);
    });
  });

  describe('Sitemap Coverage for Spanish Latest / Stable Track v0.4', () => {
    const entries = sitemap();

    it('includes all 23 Spanish v0.4 documentation pages in the sitemap', () => {
      const v04Entries = entries.filter((e) => e.url.startsWith(`${SITE_ORIGIN}/es/docs/v0.4`));
      expect(v04Entries.length).toBe(23);
    });
  });
});
