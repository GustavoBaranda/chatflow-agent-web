import { describe, it, expect } from 'vitest';
import { source, resolveDocPage, getVersionPageTree } from '@/lib/source';
import { TRACK_AVAILABLE_TOPICS } from '@/config/docs-topics-manifest';
import { DEFAULT_PRERELEASE_TRACK } from '@/config/docs-versions';
import { isGenuineTranslation, resolveDocSeo, SITE_ORIGIN } from '@/config/docs-seo';
import sitemap from '@/app/sitemap';

describe('Phase 6T.4: Complete Brazilian Portuguese Documentation Coverage Suite (v0.4 Prerelease)', () => {
  const v04Topics = TRACK_AVAILABLE_TOPICS['v0.4'];

  it('has exactly 21 documented topics in the v0.4 prerelease track inventory', () => {
    expect(v04Topics.length).toBe(21);
  });

  describe('Topic Completeness & Genuine Translation Verification', () => {
    for (const topic of v04Topics) {
      const cleanSlug = topic ? topic.split('/') : [];
      const topicPath = cleanSlug.length > 0 ? cleanSlug.join('/') : 'index';

      it(`resolves topic [${topicPath}] as a genuine Brazilian Portuguese translation with no fallback`, () => {
        const { page, isFallback, track } = resolveDocPage(['v0.4', ...cleanSlug], 'pt-BR');

        expect(page).toBeDefined();
        expect(track).toBe(DEFAULT_PRERELEASE_TRACK);
        expect(isFallback).toBe(false);
        expect(page?.path).toMatch(/^pt-BR\/v0\.4\//);

        // Verify genuine translation detection
        expect(isGenuineTranslation(DEFAULT_PRERELEASE_TRACK, cleanSlug, 'pt-BR')).toBe(true);
      });

      it(`defines valid Brazilian Portuguese frontmatter for topic [${topicPath}]`, () => {
        const targetSlug = ['v0.4', ...cleanSlug];
        const page = source.getPage(targetSlug, 'pt-BR');

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

      it(`resolves correct canonical SEO, bidirectional hreflang, and prerelease robots (noindex, follow) for topic [${topicPath}]`, () => {
        const seo = resolveDocSeo({
          track: DEFAULT_PRERELEASE_TRACK,
          cleanSlug,
          locale: 'pt-BR',
          isExplicitTrack: true,
          isFallback: false,
        });

        const expectedSubpath = cleanSlug.length > 0 ? `/${cleanSlug.join('/')}` : '';
        const expectedUrl = `${SITE_ORIGIN}/pt-BR/docs/v0.4${expectedSubpath}`;

        // Prerelease is never indexable
        expect(seo.isIndexable).toBe(false);
        expect(seo.robots).toEqual({ index: false, follow: true });
        expect(seo.canonicalUrl).toBe(expectedUrl);
        expect(seo.languages['pt-BR']).toBe(expectedUrl);
        expect(seo.languages['es']).toBe(`${SITE_ORIGIN}/es/docs/v0.4${expectedSubpath}`);
        expect(seo.languages['en']).toBe(`${SITE_ORIGIN}/en/docs/v0.4${expectedSubpath}`);
        expect(seo.languages['x-default']).toBe(`${SITE_ORIGIN}/en/docs/v0.4${expectedSubpath}`);
      });
    }
  });

  describe('Sidebar Page Tree Navigation in Brazilian Portuguese (v0.4)', () => {
    const ptTree = getVersionPageTree('v0.4', 'pt-BR');

    it('returns a page tree with Brazilian Portuguese localized folder groups', () => {
      expect(ptTree).toBeDefined();
      expect(ptTree.children.length).toBe(6); // index + 5 folders

      const names = ptTree.children.map((c) => (typeof c.name === 'string' ? c.name : ''));
      expect(names).toContain('Primeiros Passos');
      expect(names).toContain('Arquitetura Central');
      expect(names).toContain('Provedores de LLM');
      expect(names).toContain('Canais e Integrações');
      expect(names).toContain('Padrões de Produção');
    });

    it('ensures all URLs in the Brazilian Portuguese v0.4 page tree point to /pt-BR/docs/v0.4 routes', () => {
      function verifyTreeUrls(nodes: typeof ptTree.children) {
        for (const node of nodes) {
          if (node.type === 'page') {
            expect(node.url).toMatch(/^\/pt-BR\/docs\/v0\.4(\/|$)/);
          } else if (node.type === 'folder') {
            if (node.index) {
              expect(node.index.url).toMatch(/^\/pt-BR\/docs\/v0\.4(\/|$)/);
            }
            verifyTreeUrls(node.children);
          }
        }
      }

      verifyTreeUrls(ptTree.children);
    });
  });

  describe('Strict Sitemap Exclusion for Prerelease Track v0.4', () => {
    const entries = sitemap();

    it('strictly excludes all v0.4 documentation pages from the sitemap', () => {
      const v04Entries = entries.filter((e) => e.url.includes('/docs/v0.4'));
      expect(v04Entries.length).toBe(0);
    });

    it('preserves exactly 72 indexable canonical URLs in the sitemap', () => {
      expect(entries.length).toBe(72);
    });
  });
});
