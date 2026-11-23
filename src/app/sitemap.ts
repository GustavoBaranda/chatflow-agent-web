import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import {
  SITE_ORIGIN,
  SUPPORTED_LOCALES,
  isGenuineTranslation,
  resolveDocSeo,
} from '@/config/docs-seo';
import { DEFAULT_STABLE_TRACK, PREVIOUS_STABLE_TRACK } from '@/config/docs-versions';

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
  const staticRoutes = ['', '/about', '/community'];
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

  // 2. Stable Documentation Pages (v0.4 Latest / Stable and v0.3 Previous Stable)
  const tracksToIndex = [
    { track: DEFAULT_STABLE_TRACK, overviewPriority: 0.9, pagePriority: 0.8, changeFrequency: 'weekly' as const },
    { track: PREVIOUS_STABLE_TRACK, overviewPriority: 0.6, pagePriority: 0.5, changeFrequency: 'monthly' as const },
  ];

  for (const { track, overviewPriority, pagePriority, changeFrequency } of tracksToIndex) {
    const englishPages = source
      .getPages('en')
      .filter((page) => page.slugs[0] === track);

    for (const page of englishPages) {
      const cleanSlug = page.slugs.slice(1);

      for (const locale of SUPPORTED_LOCALES) {
        if (locale !== 'en' && !isGenuineTranslation(track, cleanSlug, locale)) {
          continue;
        }

        const seo = resolveDocSeo({
          track,
          cleanSlug,
          locale,
          isExplicitTrack: true,
          isFallback: false,
        });

        entries.push({
          url: seo.canonicalUrl,
          lastModified: new Date(),
          changeFrequency,
          priority: cleanSlug.length === 0 ? overviewPriority : pagePriority,
          alternates: {
            languages: seo.languages,
          },
        });
      }
    }
  }

  return entries;
}

