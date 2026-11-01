import { describe, it, expect } from 'vitest';
import {
  DOC_VERSIONS,
  DEFAULT_STABLE_TRACK,
  DEFAULT_PRERELEASE_TRACK,
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
  it('defines exactly two version tracks: v0.3 and v0.4', () => {
    expect(Object.keys(DOC_VERSIONS)).toEqual(['v0.3', 'v0.4']);
  });

  it('configures v0.3 as the default stable track for published SDK 0.3.4', () => {
    const v03 = DOC_VERSIONS['v0.3'];
    expect(v03.track).toBe('v0.3');
    expect(v03.sdkVersion).toBe('0.3.4');
    expect(v03.status).toBe('stable');
    expect(v03.isDefault).toBe(true);
    expect(DEFAULT_STABLE_TRACK).toBe('v0.3');
  });

  it('configures v0.4 as the prerelease track for published SDK 0.4.0rc1', () => {
    const v04 = DOC_VERSIONS['v0.4'];
    expect(v04.track).toBe('v0.4');
    expect(v04.sdkVersion).toBe('0.4.0rc1');
    expect(v04.status).toBe('prerelease');
    expect(v04.isDefault).toBe(false);
    expect(DEFAULT_PRERELEASE_TRACK).toBe('v0.4');
  });

  it('validates version track strings properly', () => {
    expect(isValidVersionTrack('v0.3')).toBe(true);
    expect(isValidVersionTrack('v0.4')).toBe(true);
    expect(isValidVersionTrack('v0.5')).toBe(false);
    expect(isValidVersionTrack('latest')).toBe(false);
    expect(isValidVersionTrack('')).toBe(false);
    expect(isValidVersionTrack(null)).toBe(false);
  });

  it('resolves version configuration accurately', () => {
    expect(getVersionConfig('v0.3').sdkVersion).toBe('0.3.4');
    expect(getVersionConfig('v0.4').sdkVersion).toBe('0.4.0rc1');
    expect(getDefaultVersionConfig().track).toBe('v0.3');
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

  it('resolves unversioned slugs to default stable track v0.3', () => {
    const res = resolveVersionAndSlug(['guides', 'agents']);
    expect(res.track).toBe('v0.3');
    expect(res.cleanSlug).toEqual(['guides', 'agents']);
    expect(res.isExplicitTrack).toBe(false);

    const resEmpty = resolveVersionAndSlug([]);
    expect(resEmpty.track).toBe('v0.3');
    expect(resEmpty.cleanSlug).toEqual([]);
    expect(resEmpty.isExplicitTrack).toBe(false);
  });

  it('builds canonical versioned URLs', () => {
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
      expect(isTopicAvailableInTrack('v0.3', ['getting-started', 'installation'])).toBe(true);
      expect(isTopicAvailableInTrack('v0.4', ['getting-started', 'installation'])).toBe(true);
      expect(isTopicAvailableInTrack('v0.3', ['non-existent-topic'])).toBe(false);
      expect(isTopicAvailableInTrack('v0.4', ['non-existent-topic'])).toBe(false);
      expect(isTopicAvailableInTrack('v0.3', [])).toBe(true);
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

    it('falls back to destination overview when topic does not exist in target track', () => {
      expect(
        resolveVersionSwitchUrl({
          currentPathname: '/en/docs/v0.4/non-existent-beta-feature',
          targetTrack: 'v0.3',
        }),
      ).toBe('/en/docs/v0.3');
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
  it('contains exactly 21 documented routes', () => {
    expect(DOCUMENTATION_ROUTE_INVENTORY.length).toBe(21);
  });

  it('generates accurate backward-compatibility redirect maps', () => {
    const mapEn = getRouteRedirectMap('en', 'v0.3');
    expect(mapEn['/en/docs']).toBe('/en/docs/v0.3');
    expect(mapEn['/en/docs/getting-started/installation']).toBe('/en/docs/v0.3/getting-started/installation');
    expect(mapEn['/en/docs/guides/agents']).toBe('/en/docs/v0.3/guides/agents');
    expect(mapEn['/en/docs/providers/openai']).toBe('/en/docs/v0.3/providers/openai');

    const mapEs = getRouteRedirectMap('es', 'v0.3');
    expect(mapEs['/es/docs']).toBe('/es/docs/v0.3');
    expect(mapEs['/es/docs/guides/tools']).toBe('/es/docs/v0.3/guides/tools');
  });
});

describe('Topic Registry Synchronization & Source Parity Suite (Phase 6D)', () => {
  it('synchronizes v0.3 topic manifest with in-memory documentation source', () => {
    const sourceTopics = getAvailableTopicsForTrack('v0.3');
    expect(sourceTopics.length).toBe(21);
    expect(Array.from(TRACK_AVAILABLE_TOPICS['v0.3']).sort()).toEqual(sourceTopics);
  });

  it('synchronizes v0.4 topic manifest with in-memory documentation source', () => {
    const sourceTopics = getAvailableTopicsForTrack('v0.4');
    expect(sourceTopics.length).toBe(21);
    expect(Array.from(TRACK_AVAILABLE_TOPICS['v0.4']).sort()).toEqual(sourceTopics);
  });

  it('detects missing and nonexistent topics correctly without filesystem calls', () => {
    expect(isTopicAvailableInTrack('v0.3', ['guides', 'agents'])).toBe(true);
    expect(isTopicAvailableInTrack('v0.4', ['guides', 'agents'])).toBe(true);
    expect(isTopicAvailableInTrack('v0.3', ['unknown', 'feature'])).toBe(false);
    expect(isTopicAvailableInTrack('v0.4', ['nonexistent', 'topic'])).toBe(false);
  });
});


