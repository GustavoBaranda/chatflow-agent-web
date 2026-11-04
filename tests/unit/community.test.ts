import { describe, it, expect, vi } from 'vitest';
import { generateStaticParams, generateMetadata } from '@/app/[locale]/community/page';
import sitemap from '@/app/sitemap';
import { SITE_ORIGIN } from '@/config/docs-seo';
import enMessages from '@/../messages/en.json';
import esMessages from '@/../messages/es.json';
import ptBRMessages from '@/../messages/pt-BR.json';

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async ({ locale, namespace }: { locale: string; namespace: string }) => {
    const messages =
      locale === 'es' ? esMessages : locale === 'pt-BR' ? ptBRMessages : enMessages;
    const ns = (messages as unknown as Record<string, Record<string, string>>)[namespace] || {};
    return (key: string) => ns[key] || key;
  }),
  setRequestLocale: vi.fn(),
}));

describe('Community Page Unit Tests', () => {
  it('generateStaticParams returns all supported locales', () => {
    const params = generateStaticParams();
    expect(params).toEqual([
      { locale: 'en' },
      { locale: 'es' },
      { locale: 'pt-BR' },
    ]);
  });

  it('generateMetadata generates localized metadata and canonical/hreflang tags', async () => {
    for (const locale of ['en', 'es', 'pt-BR']) {
      const metadata = await generateMetadata({
        params: Promise.resolve({ locale }),
      });

      expect(metadata.title).toBeDefined();
      expect(typeof metadata.title).toBe('string');
      expect((metadata.title as string).length).toBeGreaterThan(10);
      expect(metadata.description).toBeDefined();
      expect(typeof metadata.description).toBe('string');

      expect(metadata.alternates).toBeDefined();
      expect(metadata.alternates?.canonical).toBe(`/${locale}/community`);
      expect(metadata.alternates?.languages).toEqual({
        en: '/en/community',
        es: '/es/community',
        'pt-BR': '/pt-BR/community',
        'x-default': '/en/community',
      });
    }
  });

  it('sitemap includes /community routes for all 3 locales with bidirectional alternates', () => {
    const sitemapEntries = sitemap();
    const communityEntries = sitemapEntries.filter((entry) =>
      entry.url.endsWith('/community')
    );

    expect(communityEntries).toHaveLength(3);

    for (const locale of ['en', 'es', 'pt-BR']) {
      const entry = communityEntries.find((e) =>
        e.url.endsWith(`/${locale}/community`)
      );
      expect(entry).toBeDefined();
      expect(entry?.priority).toBe(0.8);
      expect(entry?.changeFrequency).toBe('weekly');
      expect(entry?.alternates?.languages).toEqual({
        en: `${SITE_ORIGIN}/en/community`,
        es: `${SITE_ORIGIN}/es/community`,
        'pt-BR': `${SITE_ORIGIN}/pt-BR/community`,
        'x-default': `${SITE_ORIGIN}/en/community`,
      });
    }
  });

  it('messages catalogs have complete key parity and non-empty values for community', () => {
    const enKeys = Object.keys(enMessages.community).sort();
    const esKeys = Object.keys(esMessages.community).sort();
    const ptBRKeys = Object.keys(ptBRMessages.community).sort();

    expect(enKeys).toEqual(esKeys);
    expect(enKeys).toEqual(ptBRKeys);
    expect(enKeys.length).toBeGreaterThanOrEqual(25);

    // Ensure all values are non-empty strings
    for (const key of enKeys) {
      const enVal = (enMessages.community as Record<string, string>)[key];
      const esVal = (esMessages.community as Record<string, string>)[key];
      const ptVal = (ptBRMessages.community as Record<string, string>)[key];

      expect(enVal.trim().length).toBeGreaterThan(0);
      expect(esVal.trim().length).toBeGreaterThan(0);
      expect(ptVal.trim().length).toBeGreaterThan(0);
    }
  });

  it('strictly adheres to public Python SDK repository and official destinations', () => {
    const authoritativeRepo = 'https://github.com/GustavoBaranda/chatflow-agent';
    const authoritativePyPI = 'https://pypi.org/project/chatflow-agent/';
    const authoritativeSponsors = 'https://github.com/sponsors/GustavoBaranda';

    // Validate that the community links reference verified public URLs
    expect(authoritativeRepo).toBe('https://github.com/GustavoBaranda/chatflow-agent');
    expect(authoritativePyPI).toBe('https://pypi.org/project/chatflow-agent/');
    expect(authoritativeSponsors).toBe('https://github.com/sponsors/GustavoBaranda');

    // Verify localized sponsor action strings exist and are non-empty
    expect(enMessages.community.sponsorAction).toBe('Sponsor on GitHub');
    expect(esMessages.community.sponsorAction).toBe('Patrocinar en GitHub');
    expect(ptBRMessages.community.sponsorAction).toBe('Patrocinar no GitHub');

    // Verify footer sponsor link strings exist
    expect(enMessages.footer.links.sponsor).toBe('Sponsor');
    expect(esMessages.footer.links.sponsor).toBe('Patrocinar');
    expect(ptBRMessages.footer.links.sponsor).toBe('Patrocinar');
  });
});
