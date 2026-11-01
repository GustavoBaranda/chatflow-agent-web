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
    label: 'v0.4.x (Prerelease)',
    badgeLabel: 'RC1',
    isDefault: false,
    routePrefix: 'v0.4',
    installCommand: 'pip install --pre chatflow-agent==0.4.0rc1',
    supportedLocales: ['en', 'es', 'pt-BR'] as const,
    description: 'Prerelease preview documentation targeting published SDK v0.4.0rc1 with async runner context and memory store.',
  },
} as const;

export const ALL_DOC_TRACKS: readonly DocVersionTrack[] = ['v0.3', 'v0.4'] as const;

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

