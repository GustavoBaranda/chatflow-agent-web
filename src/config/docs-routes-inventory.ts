/**
 * Documentation Route Inventory and Backward-Compatibility Mapping
 *
 * Tracks every documented public route in chatflow-agent-web, its unversioned
 * legacy path, and its canonical target path in the v0.3 stable track.
 */

import { DEFAULT_STABLE_TRACK, PREVIOUS_STABLE_TRACK } from './docs-versions';

export interface RouteMappingEntry {
  /** Unversioned documentation path (relative to locale, without leading slash) */
  unversionedSubpath: string;
  /** Section categorization */
  section: 'root' | 'getting-started' | 'guides' | 'integrations' | 'production' | 'providers';
  /** Page title in authoritative English tree */
  title: string;
}

export const DOCUMENTATION_ROUTE_INVENTORY: readonly RouteMappingEntry[] = [
  { unversionedSubpath: '', section: 'root', title: 'Documentation Overview' },
  { unversionedSubpath: 'getting-started/installation', section: 'getting-started', title: 'Installation' },
  { unversionedSubpath: 'getting-started/quickstart', section: 'getting-started', title: 'Quickstart' },
  { unversionedSubpath: 'getting-started/core-concepts', section: 'getting-started', title: 'Core Concepts' },
  { unversionedSubpath: 'getting-started/whats-new', section: 'getting-started', title: "What's New in 0.4.0" },
  { unversionedSubpath: 'getting-started/migration', section: 'getting-started', title: 'Migrating from 0.3.4 to 0.4.0' },
  { unversionedSubpath: 'guides/agents', section: 'guides', title: 'Agents Guide' },
  { unversionedSubpath: 'guides/tools', section: 'guides', title: 'Tools Guide' },
  { unversionedSubpath: 'guides/multi-agent-handoffs', section: 'guides', title: 'Multi-Agent Handoffs' },
  { unversionedSubpath: 'guides/runner-lifecycle', section: 'guides', title: 'Runner Lifecycle' },
  { unversionedSubpath: 'guides/sessions-state', section: 'guides', title: 'Sessions & State' },
  { unversionedSubpath: 'integrations/telegram', section: 'integrations', title: 'Telegram Integration' },
  { unversionedSubpath: 'integrations/whatsapp', section: 'integrations', title: 'WhatsApp Integration' },
  { unversionedSubpath: 'integrations/webhook', section: 'integrations', title: 'Webhook Integration' },
  { unversionedSubpath: 'production/configuration', section: 'production', title: 'Production Configuration' },
  { unversionedSubpath: 'production/deployment', section: 'production', title: 'Production Deployment' },
  { unversionedSubpath: 'production/error-handling', section: 'production', title: 'Error Handling' },
  { unversionedSubpath: 'production/observability', section: 'production', title: 'Observability & Metrics' },
  { unversionedSubpath: 'production/security', section: 'production', title: 'Security Best Practices' },
  { unversionedSubpath: 'providers', section: 'providers', title: 'Model Providers Overview' },
  { unversionedSubpath: 'providers/openai', section: 'providers', title: 'OpenAI Provider' },
  { unversionedSubpath: 'providers/gemini-anthropic', section: 'providers', title: 'Gemini & Anthropic Providers' },
  { unversionedSubpath: 'providers/ollama', section: 'providers', title: 'Ollama Provider' },
] as const;

/**
 * Generate mapping of unversioned paths to their versioned equivalents for a given locale.
 */
export function getRouteRedirectMap(locale: string = 'en', targetTrack: string = DEFAULT_STABLE_TRACK): Record<string, string> {
  const map: Record<string, string> = {};
  for (const entry of DOCUMENTATION_ROUTE_INVENTORY) {
    const fromPath = `/${locale}/docs${entry.unversionedSubpath ? `/${entry.unversionedSubpath}` : ''}`;
    const toPath = `/${locale}/docs/${targetTrack}${entry.unversionedSubpath ? `/${entry.unversionedSubpath}` : ''}`;
    map[fromPath] = toPath;
  }
  return map;
}

const LEGACY_V04_ALIASES = new Set([
  'v0.4.0',
  'v0.4.0rc1',
  'v0.4.0rc2',
  'v0.4.0rc3',
  '0.4.0',
  '0.4.0rc1',
  '0.4.0rc2',
  '0.4.0rc3',
]);

const LEGACY_V03_ALIASES = new Set(['v0.3.4', '0.3.4']);

/**
 * Resolve a valid unversioned, RC, or full patch documentation path to its canonical track path.
 *
 * Canonical versioned paths and unknown paths return undefined so they continue through
 * the regular Next.js and Fumadocs routing pipeline.
 */
export function getLegacyDocumentationRedirect(
  pathname: string,
  locales: readonly string[],
  targetTrack: string = DEFAULT_STABLE_TRACK,
): string | undefined {
  const normalized = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const [, locale, section, firstSegment, ...rest] = normalized.split('/');

  if (locale && section === 'docs' && locales.includes(locale) && firstSegment) {
    const tail = rest.length > 0 ? `/${rest.join('/')}` : '';
    if (LEGACY_V04_ALIASES.has(firstSegment)) {
      return `/${locale}/docs/${DEFAULT_STABLE_TRACK}${tail}`;
    }
    if (LEGACY_V03_ALIASES.has(firstSegment)) {
      return `/${locale}/docs/${PREVIOUS_STABLE_TRACK}${tail}`;
    }
  }

  for (const loc of locales) {
    const targetPath = getRouteRedirectMap(loc, targetTrack)[normalized];
    if (targetPath) {
      return targetPath;
    }
  }

  return undefined;
}
