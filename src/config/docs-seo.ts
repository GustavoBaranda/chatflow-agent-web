/**
 * Centralized SEO, Metadata, and Internationalization Policy for chatflow-agent-web.
 *
 * Defines canonical URL generation, robots indexing directives, genuine translation
 * detection, and hreflang alternate mapping across documentation tracks and locales.
 */

import { source } from '@/lib/source';
import {
  type DocVersionTrack,
  DEFAULT_STABLE_TRACK,
} from './docs-versions';
import type { Metadata } from 'next';

export const SITE_ORIGIN = 'https://chatflowagent.org';

export const SUPPORTED_LOCALES = ['en', 'es', 'pt-BR'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export interface DocSeoResolution {
  canonicalPath: string;
  canonicalUrl: string;
  robots: Metadata['robots'];
  languages: Record<string, string>;
  isFallback: boolean;
  isIndexable: boolean;
  track: DocVersionTrack;
  cleanSlug: string[];
}

/**
 * Determine if a specific topic has an authentic, genuine translation in a locale.
 * Strictly prevents English fallback content from masquerading as a translated document.
 */
export function isGenuineTranslation(
  track: DocVersionTrack,
  cleanSlug: string[] = [],
  locale: string,
): boolean {
  if (locale === 'en') {
    return true;
  }
  const targetSlug = [track, ...cleanSlug];
  const page = source.getPage(targetSlug, locale);
  if (!page || !page.path) {
    return false;
  }
  return page.path.startsWith(`${locale}/`);
}

/**
 * Resolve canonical URL, robots directives, and hreflang alternates according to
 * the platform's versioning and internationalization SEO policy.
 */
export function resolveDocSeo({
  track,
  cleanSlug,
  locale,
  isFallback,
}: {
  track: DocVersionTrack;
  cleanSlug: string[];
  locale: string;
  isExplicitTrack: boolean;
  isFallback: boolean;
}): DocSeoResolution {
  // 1. Canonical path & URL:
  // Stable v0.3 canonical URLs use /[locale]/docs/v0.3/...
  // Legacy unversioned URLs canonicalize to their stable v0.3 equivalent.
  // Prerelease v0.4 pages have self-consistent canonical metadata (/[locale]/docs/v0.4/...).
  const subpath = cleanSlug.length > 0 ? `/${cleanSlug.join('/')}` : '';
  const canonicalPath = `/${locale}/docs/${track}${subpath}`;
  const canonicalUrl = `${SITE_ORIGIN}${canonicalPath}`;

  // 2. Robots directives:
  // - Prerelease (v0.4): noindex, follow
  // - English fallback on localized routes: noindex, follow
  // - Stable canonical (v0.3): index, follow
  const isIndexable = track === DEFAULT_STABLE_TRACK && !isFallback;
  const robots: Metadata['robots'] = isIndexable
    ? {
        index: true,
        follow: true,
      }
    : {
        index: false,
        follow: true,
      };

  // 3. Hreflang alternates:
  // - Include only genuinely existing translations.
  // - Never advertise English fallback as an actual translation.
  // - Same track and topic across all alternates.
  // - x-default points to the authoritative English route.
  // - Alternates always use canonical versioned paths, never legacy aliases.
  const languages: Record<string, string> = {};

  // English always exists
  languages['en'] = `${SITE_ORIGIN}/en/docs/${track}${subpath}`;
  languages['x-default'] = `${SITE_ORIGIN}/en/docs/${track}${subpath}`;

  // Check genuine Spanish translation
  if (isGenuineTranslation(track, cleanSlug, 'es')) {
    languages['es'] = `${SITE_ORIGIN}/es/docs/${track}${subpath}`;
  }

  // Check genuine Brazilian Portuguese translation
  if (isGenuineTranslation(track, cleanSlug, 'pt-BR')) {
    languages['pt-BR'] = `${SITE_ORIGIN}/pt-BR/docs/${track}${subpath}`;
  }

  return {
    canonicalPath,
    canonicalUrl,
    robots,
    languages,
    isFallback,
    isIndexable,
    track,
    cleanSlug,
  };
}

