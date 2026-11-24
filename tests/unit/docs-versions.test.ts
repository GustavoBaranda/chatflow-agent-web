import { describe, it, expect } from 'vitest';
import {
  DOC_VERSIONS,
  ALL_DOC_TRACKS,
  DEFAULT_STABLE_TRACK,
  PREVIOUS_STABLE_TRACK,
  isValidVersionTrack,
  getVersionConfig,
  getDefaultVersionConfig,
  resolveVersionAndSlug,
  buildVersionedDocPath,
  buildUnversionedDocPath,
  isTopicAvailableInTrack,
  resolveVersionSwitchUrl,
  TRACK_AVAILABLE_TOPICS,
} from '@/config/docs-versions';
import {
  DOCUMENTATION_ROUTE_INVENTORY,
  getRouteRedirectMap,
} from '@/config/docs-routes-inventory';
import { getAvailableTopicsForTrack } from '@/lib/source';

describe('Documentation Version Registry', () => {
  it('defines exclusively the two stable version tracks ordered with v0.4 first: v0.4 and v0.3', () => {
    expect(ALL_DOC_TRACKS).toEqual(['v0.4', 'v0.3']);
    expect(Object.keys(DOC_VERSIONS)).toEqual(['v0.4', 'v0.3']);
  });

  it('configures v0.4 as the default Latest / Stable track for published SDK 0.4.0', () => {
    const v04 = DOC_VERSIONS['v0.4'];
    expect(v04.track).toBe('v0.4');
    expect(v04.sdkVersion).toBe('0.4.0');
    expect(v04.status).toBe('stable');
    expect(v04.badgeLabel).toBe('Latest / Stable');
    expect(v04.isDefault).toBe(true);
    expect(DEFAULT_STABLE_TRACK).toBe('v0.4');
  });

  it('configures v0.3 as the Previous Stable track for published SDK 0.3.4 with zero RC references', () => {
    const v03 = DOC_VERSIONS['v0.3'];
    expect(v03.track).toBe('v0.3');
    expect(v03.sdkVersion).toBe('0.3.4');
    expect(v03.status).toBe('legacy');
    expect(v03.badgeLabel).toBe('Previous Stable');
    expect(v03.isDefault).toBe(false);
    expect(PREVIOUS_STABLE_TRACK).toBe('v0.3');

    for (const cfg of Object.values(DOC_VERSIONS)) {
      expect(cfg.sdkVersion).not.toMatch(/rc/i);
      expect(cfg.status).not.toBe('prerelease');
    }
  });

  it('validates version track strings properly', () => {
    expect(isValidVersionTrack('v0.4')).toBe(true);
    expect(isValidVersionTrack('v0.3')).toBe(true);
    expect(isValidVersionTrack('v0.5')).toBe(false);
    expect(isValidVersionTrack('v0.4.0rc1')).toBe(false);
    expect(isValidVersionTrack('latest')).toBe(false);
    expect(isValidVersionTrack('')).toBe(false);
    expect(isValidVersionTrack(null)).toBe(false);
  });

  it('resolves version configuration accurately', () => {
    expect(getVersionConfig('v0.4').sdkVersion).toBe('0.4.0');
    expect(getVersionConfig('v0.3').sdkVersion).toBe('0.3.4');
    expect(getDefaultVersionConfig().track).toBe('v0.4');
  });

  it('resolves explicit version slugs correctly', () => {
    const res = resolveVersionAndSlug(['v0.3', 'guides', 'agents']);
    expect(res.track).toBe('v0.3');
    expect(res.cleanSlug).toEqual(['guides', 'agents']);
    expect(res.isExplicitTrack).toBe(true);

    const res4 = resolveVersionAndSlug(['v0.4', 'getting-started', 'quickstart']);
    expect(res4.track).toBe('v0.4');
    expect(res4.cleanSlug).toEqual(['getting-started', 'quickstart']);
    expect(res4.isExplicitTrack).toBe(true);
  });

  it('resolves unversioned slugs to default stable track v0.4', () => {
    const res = resolveVersionAndSlug(['guides', 'agents']);
    expect(res.track).toBe('v0.4');
    expect(res.cleanSlug).toEqual(['guides', 'agents']);
    expect(res.isExplicitTrack).toBe(false);

    const resEmpty = resolveVersionAndSlug([]);
    expect(resEmpty.track).toBe('v0.4');
    expect(resEmpty.cleanSlug).toEqual([]);
    expect(resEmpty.isExplicitTrack).toBe(false);
  });

  it('builds canonical versioned URLs', () => {
    expect(buildVersionedDocPath('v0.4', ['guides', 'agents'], 'en')).toBe('/en/docs/v0.4/guides/agents');
    expect(buildVersionedDocPath('v0.3', ['guides', 'agents'], 'en')).toBe('/en/docs/v0.3/guides/agents');
    expect(buildVersionedDocPath('v0.4', ['getting-started'], 'es')).toBe('/es/docs/v0.4/getting-started');
    expect(buildVersionedDocPath('v0.3', [], 'pt-BR')).toBe('/pt-BR/docs/v0.3');
  });

  it('builds unversioned legacy URLs', () => {
    expect(buildUnversionedDocPath(['guides', 'agents'], 'en')).toBe('/en/docs/guides/agents');
    expect(buildUnversionedDocPath([], 'es')).toBe('/es/docs');
  });

  describe('Version Switching & Topic Preservation', () => {
    it('correctly verifies if a topic exists in a track', () => {
      expect(isTopicAvailableInTrack('v0.3', ['guides', 'agents'])).toBe(true);
      expect(isTopicAvailableInTrack('v0.4', ['guides', 'agents'])).toBe(true);
      expect(isTopicAvailableInTrack('v0.4', ['getting-started', 'whats-new'])).toBe(true);
      expect(isTopicAvailableInTrack('v0.4', ['getting-started', 'migration'])).toBe(true);
      expect(isTopicAvailableInTrack('v0.3', ['getting-started', 'whats-new'])).toBe(false);
      expect(isTopicAvailableInTrack('v0.3', ['getting-started', 'migration'])).toBe(false);
      expect(isTopicAvailableInTrack('v0.3', ['non-existent-topic'])).toBe(false);
      expect(isTopicAvailableInTrack('v0.4', ['non-existent-topic'])).toBe(false);
      expect(isTopicAvailableInTrack('v0.4', [])).toBe(true);
    });

    it('switches version preserving locale and topic', () => {
      expect(
        resolveVersionSwitchUrl({
          currentPathname: '/es/docs/v0.3/guides/agents',
          targetTrack: 'v0.4',
        }),
      ).toBe('/es/docs/v0.4/guides/agents');

      expect(
        resolveVersionSwitchUrl({
          currentPathname: '/en/docs/v0.4/guides/runner-lifecycle',
          targetTrack: 'v0.3',
        }),
      ).toBe('/en/docs/v0.3/guides/runner-lifecycle');

      expect(
        resolveVersionSwitchUrl({
          currentPathname: '/pt-BR/docs/v0.3/production/observability',
          targetTrack: 'v0.4',
        }),
      ).toBe('/pt-BR/docs/v0.4/production/observability');
    });

    it('switches from legacy unversioned URLs preserving topic', () => {
      expect(
        resolveVersionSwitchUrl({
          currentPathname: '/en/docs/guides/agents',
          targetTrack: 'v0.4',
        }),
      ).toBe('/en/docs/v0.4/guides/agents');

      expect(
        resolveVersionSwitchUrl({
          currentPathname: '/es/docs/getting-started/quickstart',
          targetTrack: 'v0.3',
        }),
      ).toBe('/es/docs/v0.3/getting-started/quickstart');
    });

    it('handles overview routes cleanly', () => {
      expect(
        resolveVersionSwitchUrl({
          currentPathname: '/en/docs/v0.3',
          targetTrack: 'v0.4',
        }),
      ).toBe('/en/docs/v0.4');

      expect(
        resolveVersionSwitchUrl({
          currentPathname: '/es/docs',
          targetTrack: 'v0.4',
        }),
      ).toBe('/es/docs/v0.4');

      expect(
        resolveVersionSwitchUrl({
          currentPathname: '/pt-BR/docs',
          targetTrack: 'v0.3',
        }),
      ).toBe('/pt-BR/docs/v0.3');
    });

    it('falls back to destination overview when topic only exists in v0.4 (such as whats-new or migration)', () => {
      expect(
        resolveVersionSwitchUrl({
          currentPathname: '/en/docs/v0.4/getting-started/whats-new',
          targetTrack: 'v0.3',
        }),
      ).toBe('/en/docs/v0.3');

      expect(
        resolveVersionSwitchUrl({
          currentPathname: '/es/docs/v0.4/getting-started/migration',
          targetTrack: 'v0.3',
        }),
      ).toBe('/es/docs/v0.3');
    });

    it('never produces duplicate version prefixes', () => {
      const url = resolveVersionSwitchUrl({
        currentPathname: '/en/docs/v0.3/guides/agents',
        targetTrack: 'v0.4',
      });
      expect(url).toBe('/en/docs/v0.4/guides/agents');
      expect(url).not.toContain('/v0.3/v0.4');
      expect(url).not.toContain('/v0.4/v0.3');
    });

    it('handles non-docs routes by falling back to target overview', () => {
      expect(
        resolveVersionSwitchUrl({
          currentPathname: '/es/about',
          targetTrack: 'v0.4',
        }),
      ).toBe('/es/docs/v0.4');
    });
  });
});

describe('Documentation Route Inventory', () => {
  it('contains all 23 documented routes including whats-new and migration', () => {
    expect(DOCUMENTATION_ROUTE_INVENTORY.length).toBe(23);
  });

  it('generates accurate backward-compatibility redirect maps pointing to v0.4 by default', () => {
    const mapEn = getRouteRedirectMap('en');
    expect(mapEn['/en/docs']).toBe('/en/docs/v0.4');
    expect(mapEn['/en/docs/getting-started/installation']).toBe('/en/docs/v0.4/getting-started/installation');
    expect(mapEn['/en/docs/getting-started/whats-new']).toBe('/en/docs/v0.4/getting-started/whats-new');
    expect(mapEn['/en/docs/getting-started/migration']).toBe('/en/docs/v0.4/getting-started/migration');
    expect(mapEn['/en/docs/guides/agents']).toBe('/en/docs/v0.4/guides/agents');
    expect(mapEn['/en/docs/providers/openai']).toBe('/en/docs/v0.4/providers/openai');

    const mapEs = getRouteRedirectMap('es');
    expect(mapEs['/es/docs']).toBe('/es/docs/v0.4');
    expect(mapEs['/es/docs/guides/tools']).toBe('/es/docs/v0.4/guides/tools');
  });
});

describe('Topic Registry Synchronization & Source Parity Suite', () => {
  it('synchronizes v0.3 topic manifest with in-memory documentation source (21 topics)', () => {
    const sourceTopics = getAvailableTopicsForTrack('v0.3');
    expect(sourceTopics.length).toBe(21);
    expect(Array.from(TRACK_AVAILABLE_TOPICS['v0.3']).sort()).toEqual(sourceTopics);
  });

  it('synchronizes v0.4 topic manifest with in-memory documentation source (23 topics)', () => {
    const sourceTopics = getAvailableTopicsForTrack('v0.4');
    expect(sourceTopics.length).toBe(23);
    expect(Array.from(TRACK_AVAILABLE_TOPICS['v0.4']).sort()).toEqual(sourceTopics);
  });

  it('detects missing and nonexistent topics correctly without filesystem calls', () => {
    expect(isTopicAvailableInTrack('v0.3', ['guides', 'agents'])).toBe(true);
    expect(isTopicAvailableInTrack('v0.4', ['guides', 'agents'])).toBe(true);
    expect(isTopicAvailableInTrack('v0.4', ['getting-started', 'whats-new'])).toBe(true);
    expect(isTopicAvailableInTrack('v0.4', ['getting-started', 'migration'])).toBe(true);
    expect(isTopicAvailableInTrack('v0.3', ['unknown', 'feature'])).toBe(false);
    expect(isTopicAvailableInTrack('v0.4', ['nonexistent', 'topic'])).toBe(false);
  });
});
