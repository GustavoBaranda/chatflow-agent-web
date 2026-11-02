import { describe, it, expect } from 'vitest';
import {
  SITE_ORIGIN,
  SUPPORTED_LOCALES,
  isGenuineTranslation,
  resolveDocSeo,
} from '@/config/docs-seo';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import { DEFAULT_STABLE_TRACK, DEFAULT_PRERELEASE_TRACK } from '@/config/docs-versions';
import { TRACK_AVAILABLE_TOPICS } from '@/config/docs-topics-manifest';

describe('Centralized Documentation SEO Policy', () => {
  describe('Site Origin & Locales', () => {
    it('uses the authoritative production origin', () => {
      expect(SITE_ORIGIN).toBe('https://chatflowagent.org');
    });

    it('supports exactly en, es, and pt-BR locales', () => {
      expect(SUPPORTED_LOCALES).toEqual(['en', 'es', 'pt-BR']);
    });
  });

  describe('isGenuineTranslation', () => {
    it('always returns true for English', () => {
      expect(isGenuineTranslation(DEFAULT_STABLE_TRACK, ['guides', 'agents'], 'en')).toBe(true);
      expect(isGenuineTranslation(DEFAULT_PRERELEASE_TRACK, ['guides', 'agents'], 'en')).toBe(true);
      expect(isGenuineTranslation(DEFAULT_STABLE_TRACK, [], 'en')).toBe(true);
    });

    it('identifies genuine root overview translations for Spanish and Portuguese in v0.3', () => {
      expect(isGenuineTranslation(DEFAULT_STABLE_TRACK, [], 'es')).toBe(true);
      expect(isGenuineTranslation(DEFAULT_STABLE_TRACK, [], 'pt-BR')).toBe(true);
    });

    it('identifies all 21 genuine Spanish translations in v0.3', () => {
      for (const topic of TRACK_AVAILABLE_TOPICS['v0.3']) {
        const cleanSlug = topic ? topic.split('/') : [];
        expect(isGenuineTranslation(DEFAULT_STABLE_TRACK, cleanSlug, 'es')).toBe(true);
      }
    });

    it('identifies all 21 genuine Portuguese translations in v0.3', () => {
      for (const topic of TRACK_AVAILABLE_TOPICS['v0.3']) {
        const cleanSlug = topic ? topic.split('/') : [];
        expect(isGenuineTranslation(DEFAULT_STABLE_TRACK, cleanSlug, 'pt-BR')).toBe(true);
      }
    });

    it('identifies genuine Spanish and Portuguese translations in v0.4', () => {
      expect(isGenuineTranslation(DEFAULT_PRERELEASE_TRACK, ['guides', 'agents'], 'es')).toBe(true);
      expect(isGenuineTranslation(DEFAULT_PRERELEASE_TRACK, ['guides', 'agents'], 'pt-BR')).toBe(true);
    });

    it('returns false for nonexistent topics or invalid locales', () => {
      expect(isGenuineTranslation(DEFAULT_STABLE_TRACK, ['nonexistent', 'topic'], 'es')).toBe(false);
      expect(isGenuineTranslation(DEFAULT_STABLE_TRACK, [], 'fr')).toBe(false);
    });
  });

  describe('resolveDocSeo', () => {
    it('resolves stable v0.3 English canonical route with index, follow', () => {
      const seo = resolveDocSeo({
        track: DEFAULT_STABLE_TRACK,
        cleanSlug: ['guides', 'agents'],
        locale: 'en',
        isExplicitTrack: true,
        isFallback: false,
      });

      expect(seo.isIndexable).toBe(true);
      expect(seo.robots).toEqual({ index: true, follow: true });
      expect(seo.canonicalPath).toBe('/en/docs/v0.3/guides/agents');
      expect(seo.canonicalUrl).toBe('https://chatflowagent.org/en/docs/v0.3/guides/agents');
      expect(seo.languages['en']).toBe('https://chatflowagent.org/en/docs/v0.3/guides/agents');
      expect(seo.languages['x-default']).toBe('https://chatflowagent.org/en/docs/v0.3/guides/agents');
      // Spanish translation exists in v0.3
      expect(seo.languages['es']).toBe('https://chatflowagent.org/es/docs/v0.3/guides/agents');
      // Portuguese translation exists in v0.3
      expect(seo.languages['pt-BR']).toBe('https://chatflowagent.org/pt-BR/docs/v0.3/guides/agents');
    });

    it('includes genuine Spanish and Portuguese alternates in hreflang in v0.4', () => {
      const seo = resolveDocSeo({
        track: DEFAULT_PRERELEASE_TRACK,
        cleanSlug: ['guides', 'agents'],
        locale: 'en',
        isExplicitTrack: true,
        isFallback: false,
      });

      expect(seo.languages['en']).toBe('https://chatflowagent.org/en/docs/v0.4/guides/agents');
      expect(seo.languages['es']).toBe('https://chatflowagent.org/es/docs/v0.4/guides/agents');
      expect(seo.languages['pt-BR']).toBe('https://chatflowagent.org/pt-BR/docs/v0.4/guides/agents');
    });

    it('resolves legacy unversioned route canonicalizing to stable v0.3 equivalent', () => {
      const seo = resolveDocSeo({
        track: DEFAULT_STABLE_TRACK,
        cleanSlug: ['guides', 'agents'],
        locale: 'en',
        isExplicitTrack: false,
        isFallback: false,
      });

      expect(seo.isIndexable).toBe(true);
      expect(seo.canonicalPath).toBe('/en/docs/v0.3/guides/agents');
      expect(seo.canonicalUrl).toBe('https://chatflowagent.org/en/docs/v0.3/guides/agents');
      expect(seo.robots).toEqual({ index: true, follow: true });
    });

    it('enforces noindex, follow on prerelease v0.4 documentation', () => {
      const seo = resolveDocSeo({
        track: DEFAULT_PRERELEASE_TRACK,
        cleanSlug: ['guides', 'agents'],
        locale: 'en',
        isExplicitTrack: true,
        isFallback: false,
      });

      expect(seo.isIndexable).toBe(false);
      expect(seo.robots).toEqual({ index: false, follow: true });
      expect(seo.canonicalPath).toBe('/en/docs/v0.4/guides/agents');
      expect(seo.canonicalUrl).toBe('https://chatflowagent.org/en/docs/v0.4/guides/agents');
    });

    it('enforces noindex, follow on localized routes displaying English fallback', () => {
      const seo = resolveDocSeo({
        track: DEFAULT_STABLE_TRACK,
        cleanSlug: ['guides', 'agents'],
        locale: 'es',
        isExplicitTrack: true,
        isFallback: true,
      });

      expect(seo.isIndexable).toBe(false);
      expect(seo.robots).toEqual({ index: false, follow: true });
      expect(seo.canonicalPath).toBe('/es/docs/v0.3/guides/agents');
      expect(seo.canonicalUrl).toBe('https://chatflowagent.org/es/docs/v0.3/guides/agents');
    });

    it('includes genuine hreflang alternates when translations genuinely exist', () => {
      const seo = resolveDocSeo({
        track: DEFAULT_STABLE_TRACK,
        cleanSlug: [],
        locale: 'es',
        isExplicitTrack: true,
        isFallback: false,
      });

      expect(seo.isIndexable).toBe(true);
      expect(seo.robots).toEqual({ index: true, follow: true });
      expect(seo.canonicalUrl).toBe('https://chatflowagent.org/es/docs/v0.3');
      expect(seo.languages['en']).toBe('https://chatflowagent.org/en/docs/v0.3');
      expect(seo.languages['es']).toBe('https://chatflowagent.org/es/docs/v0.3');
      expect(seo.languages['pt-BR']).toBe('https://chatflowagent.org/pt-BR/docs/v0.3');
      expect(seo.languages['x-default']).toBe('https://chatflowagent.org/en/docs/v0.3');
    });
  });

  describe('Sitemap Generator', () => {
    const entries = sitemap();

    it('generates exactly 72 indexable canonical entries', () => {
      expect(entries.length).toBe(72);
    });

    it('ensures all entries use the absolute SITE_ORIGIN', () => {
      for (const entry of entries) {
        expect(entry.url.startsWith(SITE_ORIGIN)).toBe(true);
      }
    });

    it('includes static public marketing pages for all 3 locales', () => {
      const homeUrls = entries.filter(
        (e) => e.url === `${SITE_ORIGIN}/en` || e.url === `${SITE_ORIGIN}/es` || e.url === `${SITE_ORIGIN}/pt-BR`
      );
      expect(homeUrls.length).toBe(3);

      const aboutUrls = entries.filter(
        (e) => e.url === `${SITE_ORIGIN}/en/about` || e.url === `${SITE_ORIGIN}/es/about` || e.url === `${SITE_ORIGIN}/pt-BR/about`
      );
      expect(aboutUrls.length).toBe(3);

      const communityUrls = entries.filter(
        (e) => e.url === `${SITE_ORIGIN}/en/community` || e.url === `${SITE_ORIGIN}/es/community` || e.url === `${SITE_ORIGIN}/pt-BR/community`
      );
      expect(communityUrls.length).toBe(3);
    });

    it('includes all 21 stable v0.3 English documentation pages', () => {
      const enV03Docs = entries.filter((e) => e.url.startsWith(`${SITE_ORIGIN}/en/docs/v0.3`));
      expect(enV03Docs.length).toBe(21);
    });

    it('includes all 21 genuine v0.3 Spanish documentation pages', () => {
      const esDocs = entries.filter((e) => e.url.startsWith(`${SITE_ORIGIN}/es/docs/`));
      expect(esDocs.length).toBe(21);
      for (const topic of TRACK_AVAILABLE_TOPICS['v0.3']) {
        const subpath = topic ? `/${topic}` : '';
        const expectedUrl = `${SITE_ORIGIN}/es/docs/v0.3${subpath}`;
        expect(esDocs.some((d) => d.url === expectedUrl)).toBe(true);
      }
    });

    it('includes all 21 genuine v0.3 Portuguese documentation pages', () => {
      const ptDocs = entries.filter((e) => e.url.startsWith(`${SITE_ORIGIN}/pt-BR/docs/`));
      expect(ptDocs.length).toBe(21);
      for (const topic of TRACK_AVAILABLE_TOPICS['v0.3']) {
        const subpath = topic ? `/${topic}` : '';
        const expectedUrl = `${SITE_ORIGIN}/pt-BR/docs/v0.3${subpath}`;
        expect(ptDocs.some((d) => d.url === expectedUrl)).toBe(true);
      }
    });

    it('strictly excludes prerelease v0.4 from the sitemap', () => {
      const v04Entries = entries.filter((e) => e.url.includes('/docs/v0.4'));
      expect(v04Entries.length).toBe(0);
    });

    it('strictly excludes legacy unversioned documentation aliases from the sitemap', () => {
      // Any doc entry should have /docs/v0.3
      const docEntries = entries.filter((e) => e.url.includes('/docs/'));
      for (const entry of docEntries) {
        expect(entry.url).toContain('/docs/v0.3');
      }
    });

    it('strictly excludes untranslated fallback pages from the sitemap', () => {
      const v04Guides = entries.filter((e) => e.url.includes('/docs/v0.4/guides'));
      expect(v04Guides.length).toBe(0);
    });
  });

  describe('Robots.txt Generator', () => {
    const config = robots();

    it('allows crawling across the site to detect page-level noindex directives', () => {
      const rule = Array.isArray(config.rules) ? config.rules[0] : config.rules;
      expect(rule?.allow).toBe('/');
    });

    it('disallows internal build assets and APIs', () => {
      const rule = Array.isArray(config.rules) ? config.rules[0] : config.rules;
      expect(rule?.disallow).toEqual(['/api/', '/_next/']);
    });

    it('points to the canonical sitemap XML', () => {
      expect(config.sitemap).toBe('https://chatflowagent.org/sitemap.xml');
    });
  });
});

