import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import {
  SITE_ORIGIN,
  SUPPORTED_LOCALES,
  isGenuineTranslation,
  resolveDocSeo,
} from '@/config/docs-seo';
import { DEFAULT_STABLE_TRACK } from '@/config/docs-versions';

/**
 * Dynamic localized sitemap generator for chatflow-agent-web.
 *
 * Adheres strictly to the platform SEO policy:
 * - Only indexable, canonical URLs are included.
 * - Stable v0.3 documentation is included.
 * - Genuine Spanish and Brazilian Portuguese translations are included.
 * - Excludes prerelease v0.4 documentation (noindex).
 * - Excludes untranslated English fallback pages under localized URLs (noindex).
 * - Excludes legacy unversioned alias URLs (canonicalized to v0.3).
 * - Excludes error and maintenance routes.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // 1. Static Public Marketing & Institutional Routes
  const staticRoutes = ['', '/about'];
  for (const route of staticRoutes) {
    for (const locale of SUPPORTED_LOCALES) {
      const languages: Record<string, string> = {};
      for (const altLocale of SUPPORTED_LOCALES) {
        languages[altLocale] = `${SITE_ORIGIN}/${altLocale}${route}`;
      }
      languages['x-default'] = `${SITE_ORIGIN}/en${route}`;

      entries.push({
        url: `${SITE_ORIGIN}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1.0 : 0.8,
        alternates: {
          languages,
        },
      });
    }
  }

  // 2. Stable Documentation Pages (v0.3)
  // Query all authoritative English pages for the stable track
  const englishPages = source
    .getPages('en')
    .filter((page) => page.slugs[0] === DEFAULT_STABLE_TRACK);

  for (const page of englishPages) {
    const cleanSlug = page.slugs.slice(1);

    // English canonical entry (authoritative, indexable)
    const enSeo = resolveDocSeo({
      track: DEFAULT_STABLE_TRACK,
      cleanSlug,
      locale: 'en',
      isExplicitTrack: true,
      isFallback: false,
    });

    entries.push({
      url: enSeo.canonicalUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: cleanSlug.length === 0 ? 0.9 : 0.7,
      alternates: {
        languages: enSeo.languages,
      },
    });

    // Genuine Spanish translation (if existing)
    if (isGenuineTranslation(DEFAULT_STABLE_TRACK, cleanSlug, 'es')) {
      const esSeo = resolveDocSeo({
        track: DEFAULT_STABLE_TRACK,
        cleanSlug,
        locale: 'es',
        isExplicitTrack: true,
        isFallback: false,
      });

      entries.push({
        url: esSeo.canonicalUrl,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: cleanSlug.length === 0 ? 0.9 : 0.7,
        alternates: {
          languages: esSeo.languages,
        },
      });
    }

    // Genuine Brazilian Portuguese translation (if existing)
    if (isGenuineTranslation(DEFAULT_STABLE_TRACK, cleanSlug, 'pt-BR')) {
      const ptSeo = resolveDocSeo({
        track: DEFAULT_STABLE_TRACK,
        cleanSlug,
        locale: 'pt-BR',
        isExplicitTrack: true,
        isFallback: false,
      });

      entries.push({
        url: ptSeo.canonicalUrl,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: cleanSlug.length === 0 ? 0.9 : 0.7,
        alternates: {
          languages: ptSeo.languages,
        },
      });
    }
  }

  return entries;
}

