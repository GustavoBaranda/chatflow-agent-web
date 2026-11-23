import { describe, it, expect } from 'vitest';
import {
  SITE_ORIGIN,
  SUPPORTED_LOCALES,
  SOCIAL_PREVIEW_IMAGE,
  createSocialMetadata,
  isGenuineTranslation,
  resolveDocSeo,
} from '@/config/docs-seo';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import { DEFAULT_STABLE_TRACK, PREVIOUS_STABLE_TRACK } from '@/config/docs-versions';
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
    it('always returns true for English across both stable tracks', () => {
      expect(isGenuineTranslation(DEFAULT_STABLE_TRACK, ['guides', 'agents'], 'en')).toBe(true);
      expect(isGenuineTranslation(PREVIOUS_STABLE_TRACK, ['guides', 'agents'], 'en')).toBe(true);
      expect(isGenuineTranslation(DEFAULT_STABLE_TRACK, [], 'en')).toBe(true);
    });

    it('identifies genuine root overview translations for Spanish and Portuguese in v0.4 and v0.3', () => {
      expect(isGenuineTranslation('v0.4', [], 'es')).toBe(true);
      expect(isGenuineTranslation('v0.4', [], 'pt-BR')).toBe(true);
      expect(isGenuineTranslation('v0.3', [], 'es')).toBe(true);
      expect(isGenuineTranslation('v0.3', [], 'pt-BR')).toBe(true);
    });

    it('identifies all 23 genuine Spanish and Portuguese translations in v0.4 (Latest / Stable)', () => {
      for (const topic of TRACK_AVAILABLE_TOPICS['v0.4']) {
        const cleanSlug = topic ? topic.split('/') : [];
        expect(isGenuineTranslation('v0.4', cleanSlug, 'es')).toBe(true);
        expect(isGenuineTranslation('v0.4', cleanSlug, 'pt-BR')).toBe(true);
      }
    });

    it('identifies all 21 genuine Spanish and Portuguese translations in v0.3 (Previous Stable)', () => {
      for (const topic of TRACK_AVAILABLE_TOPICS['v0.3']) {
        const cleanSlug = topic ? topic.split('/') : [];
        expect(isGenuineTranslation('v0.3', cleanSlug, 'es')).toBe(true);
        expect(isGenuineTranslation('v0.3', cleanSlug, 'pt-BR')).toBe(true);
      }
    });

    it('returns false for nonexistent topics or invalid locales', () => {
      expect(isGenuineTranslation(DEFAULT_STABLE_TRACK, ['nonexistent', 'topic'], 'es')).toBe(false);
      expect(isGenuineTranslation(DEFAULT_STABLE_TRACK, [], 'fr')).toBe(false);
    });
  });

  describe('resolveDocSeo', () => {
    it('resolves Latest / Stable v0.4 English canonical route with index, follow', () => {
      const seo = resolveDocSeo({
        track: 'v0.4',
        cleanSlug: ['guides', 'agents'],
        locale: 'en',
        isExplicitTrack: true,
        isFallback: false,
      });

      expect(seo.isIndexable).toBe(true);
      expect(seo.robots).toEqual({ index: true, follow: true });
      expect(seo.canonicalPath).toBe('/en/docs/v0.4/guides/agents');
      expect(seo.canonicalUrl).toBe('https://chatflowagent.org/en/docs/v0.4/guides/agents');
      expect(seo.languages['en']).toBe('https://chatflowagent.org/en/docs/v0.4/guides/agents');
      expect(seo.languages['x-default']).toBe('https://chatflowagent.org/en/docs/v0.4/guides/agents');
      expect(seo.languages['es']).toBe('https://chatflowagent.org/es/docs/v0.4/guides/agents');
      expect(seo.languages['pt-BR']).toBe('https://chatflowagent.org/pt-BR/docs/v0.4/guides/agents');
    });

    it('resolves Previous Stable v0.3 English canonical route with index, follow', () => {
      const seo = resolveDocSeo({
        track: 'v0.3',
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
      expect(seo.languages['es']).toBe('https://chatflowagent.org/es/docs/v0.3/guides/agents');
      expect(seo.languages['pt-BR']).toBe('https://chatflowagent.org/pt-BR/docs/v0.3/guides/agents');
    });

    it('resolves legacy unversioned route canonicalizing to Latest / Stable v0.4 equivalent', () => {
      const seo = resolveDocSeo({
        track: DEFAULT_STABLE_TRACK,
        cleanSlug: ['guides', 'agents'],
        locale: 'en',
        isExplicitTrack: false,
        isFallback: false,
      });

      expect(seo.isIndexable).toBe(true);
      expect(seo.canonicalPath).toBe('/en/docs/v0.4/guides/agents');
      expect(seo.canonicalUrl).toBe('https://chatflowagent.org/en/docs/v0.4/guides/agents');
      expect(seo.robots).toEqual({ index: true, follow: true });
    });

    it('enforces noindex, follow on localized routes displaying English fallback', () => {
      const seo = resolveDocSeo({
        track: 'v0.4',
        cleanSlug: ['guides', 'agents'],
        locale: 'es',
        isExplicitTrack: true,
        isFallback: true,
      });

      expect(seo.isIndexable).toBe(false);
      expect(seo.robots).toEqual({ index: false, follow: true });
      expect(seo.canonicalPath).toBe('/es/docs/v0.4/guides/agents');
      expect(seo.canonicalUrl).toBe('https://chatflowagent.org/es/docs/v0.4/guides/agents');
    });

    it('includes genuine hreflang alternates when translations genuinely exist', () => {
      const seo = resolveDocSeo({
        track: 'v0.4',
        cleanSlug: [],
        locale: 'es',
        isExplicitTrack: true,
        isFallback: false,
      });

      expect(seo.isIndexable).toBe(true);
      expect(seo.robots).toEqual({ index: true, follow: true });
      expect(seo.canonicalUrl).toBe('https://chatflowagent.org/es/docs/v0.4');
      expect(seo.languages['en']).toBe('https://chatflowagent.org/en/docs/v0.4');
      expect(seo.languages['es']).toBe('https://chatflowagent.org/es/docs/v0.4');
      expect(seo.languages['pt-BR']).toBe('https://chatflowagent.org/pt-BR/docs/v0.4');
      expect(seo.languages['x-default']).toBe('https://chatflowagent.org/en/docs/v0.4');
    });
  });

  describe('Sitemap Generator', () => {
    const entries = sitemap();

    it('generates 141 indexable canonical entries (9 static + 69 v0.4 + 63 v0.3) with zero RC pages', () => {
      expect(entries.length).toBe(141);
      for (const entry of entries) {
        expect(entry.url).not.toMatch(/rc1|rc2|rc3|prerelease/i);
      }
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

    it('includes all 23 Latest / Stable v0.4 documentation pages across en, es, and pt-BR', () => {
      for (const locale of SUPPORTED_LOCALES) {
        const v04Docs = entries.filter((e) => e.url.startsWith(`${SITE_ORIGIN}/${locale}/docs/v0.4`));
        expect(v04Docs.length).toBe(23);
        expect(v04Docs.some((d) => d.url === `${SITE_ORIGIN}/${locale}/docs/v0.4/getting-started/whats-new`)).toBe(true);
        expect(v04Docs.some((d) => d.url === `${SITE_ORIGIN}/${locale}/docs/v0.4/getting-started/migration`)).toBe(true);
      }
    });

    it('includes all 21 Previous Stable v0.3 documentation pages across en, es, and pt-BR', () => {
      for (const locale of SUPPORTED_LOCALES) {
        const v03Docs = entries.filter((e) => e.url.startsWith(`${SITE_ORIGIN}/${locale}/docs/v0.3`));
        expect(v03Docs.length).toBe(21);
      }
    });

    it('strictly excludes legacy unversioned documentation aliases from the sitemap', () => {
      const docEntries = entries.filter((e) => e.url.includes('/docs/'));
      for (const entry of docEntries) {
        expect(entry.url).toMatch(/\/docs\/(v0\.4|v0\.3)(\/|$)/);
      }
    });
  });

  describe('Robots.txt Generator', () => {
    const config = robots();

    it('allows crawling across the site to detect page-level noindex directives', () => {
      const rule = Array.isArray(config.rules) ? config.rules[0] : config.rules;
      expect(rule?.allow).toBe('/');
    });

    it('allows Next.js rendering assets while disallowing APIs', () => {
      const rule = Array.isArray(config.rules) ? config.rules[0] : config.rules;
      expect(rule?.disallow).toEqual(['/api/']);
      expect(rule?.disallow).not.toContain('/_next/');
    });

    it('points to the canonical sitemap XML', () => {
      expect(config.sitemap).toBe('https://chatflowagent.org/sitemap.xml');
    });
  });

  describe('createSocialMetadata', () => {
    it('creates standardized social metadata for English', () => {
      const social = createSocialMetadata({
        title: 'chatflow-agent — Conversational AI Agents in Python',
        description: 'Official documentation and website for chatflow-agent.',
        url: 'https://chatflowagent.org/en',
        locale: 'en',
      });

      expect(social.openGraph).toEqual({
        title: 'chatflow-agent — Conversational AI Agents in Python',
        description: 'Official documentation and website for chatflow-agent.',
        url: 'https://chatflowagent.org/en',
        siteName: 'chatflow-agent',
        locale: 'en_US',
        type: 'website',
        images: [
          {
            url: '/brand/social-preview.png',
            width: 1200,
            height: 630,
            alt: 'chatflow-agent — Conversational AI Agents in Python',
          },
        ],
      });

      expect(social.twitter).toEqual({
        card: 'summary_large_image',
        title: 'chatflow-agent — Conversational AI Agents in Python',
        description: 'Official documentation and website for chatflow-agent.',
        images: ['/brand/social-preview.png'],
      });

      expect((social.twitter as Record<string, unknown>).creator).toBeUndefined();
      expect((social.twitter as Record<string, unknown>).site).toBeUndefined();
    });

    it('maps Spanish locale to es_ES for Open Graph', () => {
      const social = createSocialMetadata({
        title: 'chatflow-agent — Agentes de IA Conversacional en Python',
        description: 'Plataforma oficial de documentación para chatflow-agent.',
        url: 'https://chatflowagent.org/es',
        locale: 'es',
      });

      expect(social.openGraph.locale).toBe('es_ES');
    });

    it('maps Portuguese (Brasil) locale to pt_BR for Open Graph', () => {
      const social = createSocialMetadata({
        title: 'chatflow-agent — Agentes de IA Conversacional em Python',
        description: 'Plataforma oficial de documentação para chatflow-agent.',
        url: 'https://chatflowagent.org/pt-BR',
        locale: 'pt-BR',
      });

      expect(social.openGraph.locale).toBe('pt_BR');
    });

    it('verifies standard social image dimensions and properties', () => {
      expect(SOCIAL_PREVIEW_IMAGE).toEqual({
        url: '/brand/social-preview.png',
        width: 1200,
        height: 630,
        alt: 'chatflow-agent — Conversational AI Agents in Python',
      });
    });
  });
});
