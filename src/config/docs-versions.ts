/**
 * Centralized Documentation Version Registry for chatflow-agent-web.
 *
 * Defines the documentation tracks, published SDK version associations,
 * release statuses, route prefixes, and resolution utilities.
 */

export type DocVersionTrack = 'v0.3' | 'v0.4';

export type DocReleaseStatus = 'stable' | 'prerelease' | 'legacy';

export interface DocVersionConfig {
  /** Identifier used in URLs and file trees (e.g., 'v0.3') */
  track: DocVersionTrack;
  /** Exact published release of chatflow-agent on PyPI */
  sdkVersion: string;
  /** Release classification: 'stable' for production or 'prerelease' */
  status: DocReleaseStatus;
  /** Human-readable display label */
  label: string;
  /** Compact badge label (e.g., 'Stable', 'RC1') */
  badgeLabel: string;
  /** Whether this track is the default active stable track */
  isDefault: boolean;
  /** Route prefix under /[locale]/docs/ (e.g., 'v0.3') */
  routePrefix: string;
  /** Installation command for this track */
  installCommand: string;
  /** Supported launch locales */
  supportedLocales: readonly ['en', 'es', 'pt-BR'];
  /** Short description of the track */
  description: string;
}

export const DEFAULT_STABLE_TRACK: DocVersionTrack = 'v0.3';
export const DEFAULT_PRERELEASE_TRACK: DocVersionTrack = 'v0.4';

export const DOC_VERSIONS: Record<DocVersionTrack, DocVersionConfig> = {
  'v0.3': {
    track: 'v0.3',
    sdkVersion: '0.3.4',
    status: 'stable',
    label: 'v0.3.x (Stable)',
    badgeLabel: 'Stable',
    isDefault: true,
    routePrefix: 'v0.3',
    installCommand: 'pip install chatflow-agent==0.3.4',
    supportedLocales: ['en', 'es', 'pt-BR'] as const,
    description: 'Current production-ready release targeting published SDK v0.3.4 and compatible patches 0.3.0–0.3.4.',
  },
  'v0.4': {
    track: 'v0.4',
    sdkVersion: '0.4.0rc1',
    status: 'prerelease',
    label: 'v0.4.0rc1 (Prerelease)',
    badgeLabel: 'RC1',
    isDefault: false,
    routePrefix: 'v0.4',
    installCommand: 'pip install --pre chatflow-agent==0.4.0rc1',
    supportedLocales: ['en', 'es', 'pt-BR'] as const,
    description: 'Prerelease preview documentation targeting published SDK v0.4.0rc1 with async runner context and memory store.',
  },
} as const;

export const ALL_DOC_TRACKS: readonly DocVersionTrack[] = ['v0.3', 'v0.4'] as const;

import { TRACK_AVAILABLE_TOPICS } from './docs-topics-manifest';
export { TRACK_AVAILABLE_TOPICS };

/**
 * Type guard to check if a string is a valid documentation track identifier.
 */
export function isValidVersionTrack(track: unknown): track is DocVersionTrack {
  return typeof track === 'string' && Object.prototype.hasOwnProperty.call(DOC_VERSIONS, track);
}

/**
 * Retrieve configuration for a specific documentation track.
 */
export function getVersionConfig(track: DocVersionTrack): DocVersionConfig {
  return DOC_VERSIONS[track];
}

/**
 * Retrieve configuration for the default stable documentation track.
 */
export function getDefaultVersionConfig(): DocVersionConfig {
  return DOC_VERSIONS[DEFAULT_STABLE_TRACK];
}

/**
 * Parse an incoming slug array to detect explicit version track or unversioned fallback.
 *
 * Example:
 *   ['v0.3', 'guides', 'agents'] -> { track: 'v0.3', cleanSlug: ['guides', 'agents'], isExplicitTrack: true }
 *   ['guides', 'agents']         -> { track: 'v0.3', cleanSlug: ['guides', 'agents'], isExplicitTrack: false }
 *   []                           -> { track: 'v0.3', cleanSlug: [], isExplicitTrack: false }
 */
export function resolveVersionAndSlug(slug: string[] = []): {
  track: DocVersionTrack;
  cleanSlug: string[];
  isExplicitTrack: boolean;
} {
  if (slug.length > 0 && isValidVersionTrack(slug[0])) {
    return {
      track: slug[0],
      cleanSlug: slug.slice(1),
      isExplicitTrack: true,
    };
  }

  return {
    track: DEFAULT_STABLE_TRACK,
    cleanSlug: [...slug],
    isExplicitTrack: false,
  };
}

/**
 * Construct a versioned canonical URL path for a document.
 *
 * Example:
 *   buildVersionedDocPath('v0.3', ['guides', 'agents'], 'es') -> '/es/docs/v0.3/guides/agents'
 *   buildVersionedDocPath('v0.3', [], 'en')                   -> '/en/docs/v0.3'
 */
export function buildVersionedDocPath(
  track: DocVersionTrack,
  slug: string[] = [],
  locale: string = 'en',
): string {
  const parts = [locale, 'docs', track, ...slug].filter(Boolean);
  return `/${parts.join('/')}`;
}

/**
 * Construct an unversioned (legacy/alias) URL path for a document.
 *
 * Example:
 *   buildUnversionedDocPath(['guides', 'agents'], 'en') -> '/en/docs/guides/agents'
 */
export function buildUnversionedDocPath(slug: string[] = [], locale: string = 'en'): string {
  const parts = [locale, 'docs', ...slug].filter(Boolean);
  return `/${parts.join('/')}`;
}

/**
 * Check if a documentation topic (represented by its clean slug segments) exists in a track.
 */
export function isTopicAvailableInTrack(track: DocVersionTrack, cleanSlug: string[] = []): boolean {
  if (cleanSlug.length === 0) return true;
  const subpath = cleanSlug.join('/');
  const topics = TRACK_AVAILABLE_TOPICS[track];
  return topics ? topics.includes(subpath) : false;
}

/**
 * Determine the destination URL when switching documentation versions.
 *
 * Preserves the current locale, and preserves the current topic if it exists in the
 * destination track. If the topic does not exist, falls back to the destination track overview.
 * Never duplicates version prefixes.
 *
 * Examples:
 *   /es/docs/v0.3/guides/agents (to v0.4)             -> /es/docs/v0.4/guides/agents
 *   /en/docs/v0.4/guides/runner-lifecycle (to v0.3)   -> /en/docs/v0.3/guides/runner-lifecycle
 *   /pt-BR/docs/guides/agents (to v0.4)               -> /pt-BR/docs/v0.4/guides/agents
 *   /en/docs/v0.4/unknown-topic (to v0.3)             -> /en/docs/v0.3
 *   /es/docs (to v0.4)                                -> /es/docs/v0.4
 */
export function resolveVersionSwitchUrl({
  currentPathname,
  targetTrack,
  locale,
}: {
  currentPathname: string;
  targetTrack: DocVersionTrack;
  locale?: string;
}): string {
  const cleanPath = currentPathname.split('?')[0].split('#')[0];
  const segments = cleanPath.split('/').filter(Boolean);

  let detectedLocale = locale || 'en';
  let docsIndex = -1;

  for (let i = 0; i < segments.length; i++) {
    if (['en', 'es', 'pt-BR'].includes(segments[i])) {
      detectedLocale = segments[i];
    }
    if (segments[i] === 'docs') {
      docsIndex = i;
      break;
    }
  }

  // If not currently on a /docs route, navigate to target track overview
  if (docsIndex === -1) {
    return `/${detectedLocale}/docs/${targetTrack}`;
  }

  const afterDocs = segments.slice(docsIndex + 1);

  // Strip any existing version prefix so we never duplicate it
  let cleanSlug: string[] = [];
  if (afterDocs.length > 0 && isValidVersionTrack(afterDocs[0])) {
    cleanSlug = afterDocs.slice(1);
  } else {
    cleanSlug = afterDocs;
  }

  // If at root of docs, go to target track overview
  if (cleanSlug.length === 0) {
    return `/${detectedLocale}/docs/${targetTrack}`;
  }

  // Check if topic exists in target track
  if (isTopicAvailableInTrack(targetTrack, cleanSlug)) {
    return `/${detectedLocale}/docs/${targetTrack}/${cleanSlug.join('/')}`;
  }

  // Missing topic fallback: destination track overview
  return `/${detectedLocale}/docs/${targetTrack}`;
}


