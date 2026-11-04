import { describe, it, expect } from 'vitest';
import { source, resolveDocPage, getVersionPageTree, createUnversionedPageTree } from '@/lib/source';

describe('Documentation Engine & Source Loader', () => {
  it('should load authoritative English index pages for both v0.3 and v0.4', () => {
    const v03Page = source.getPage(['v0.3'], 'en');
    expect(v03Page).toBeDefined();
    expect(v03Page?.data.title).toContain('v0.3 Stable');
    expect(v03Page?.url).toBe('/en/docs/v0.3');

    const v04Page = source.getPage(['v0.4'], 'en');
    expect(v04Page).toBeDefined();
    expect(v04Page?.data.title).toContain('v0.4 Prerelease');
    expect(v04Page?.url).toBe('/en/docs/v0.4');
  });

  it('should resolve unversioned paths transparently to default stable track (v0.3)', () => {
    const rootResolved = resolveDocPage([], 'en');
    expect(rootResolved.page).toBeDefined();
    expect(rootResolved.track).toBe('v0.3');
    expect(rootResolved.isExplicitTrack).toBe(false);
    expect(rootResolved.page?.data.title).toContain('v0.3 Stable');

    const installResolved = resolveDocPage(['getting-started', 'installation'], 'en');
    expect(installResolved.page).toBeDefined();
    expect(installResolved.track).toBe('v0.3');
    expect(installResolved.isExplicitTrack).toBe(false);
    expect(installResolved.page?.data.title).toBe('Installation');
  });

  it('should load Spanish localized index pages for both tracks', () => {
    const es03 = source.getPage(['v0.3'], 'es');
    expect(es03).toBeDefined();
    expect(es03?.data.title).toBe('Visión General de la Documentación');
    expect(es03?.url).toBe('/es/docs/v0.3');

    const es04 = source.getPage(['v0.4'], 'es');
    expect(es04).toBeDefined();
    expect(es04?.data.title).toContain('v0.4 Prerelease');
    expect(es04?.url).toBe('/es/docs/v0.4');
  });

  it('should load Brazilian Portuguese localized index pages for both tracks', () => {
    const pt03 = source.getPage(['v0.3'], 'pt-BR');
    expect(pt03).toBeDefined();
    expect(pt03?.data.title).toBe('Visão Geral da Documentação');
    expect(pt03?.url).toBe('/pt-BR/docs/v0.3');

    const pt04 = source.getPage(['v0.4'], 'pt-BR');
    expect(pt04).toBeDefined();
    expect(pt04?.data.title).toContain('v0.4 Prerelease');
    expect(pt04?.url).toBe('/pt-BR/docs/v0.4');
  });

  it('should generate page trees and isolate navigation per track', () => {
    const enTree = source.getPageTree('en');
    expect(enTree).toBeDefined();
    expect(enTree.children.length).toBeGreaterThanOrEqual(2);

    const v03Tree = getVersionPageTree('v0.3', 'en');
    expect(v03Tree).toBeDefined();
    expect(v03Tree.children.length).toBeGreaterThan(0);

    const v04Tree = getVersionPageTree('v0.4', 'en');
    expect(v04Tree).toBeDefined();
    expect(v04Tree.children.length).toBeGreaterThan(0);
  });

  it('should return undefined for non-existent pages and handle locale fallback correctly', () => {
    const page = source.getPage(['v0.3', 'non-existent-slug-test'], 'en');
    expect(page).toBeUndefined();

    // Both Spanish and Portuguese v0.4 are genuinely translated
    const translatedPtV04Res = resolveDocPage(['v0.4', 'guides', 'agents'], 'pt-BR');
    expect(translatedPtV04Res.isFallback).toBe(false);
    expect(translatedPtV04Res.page).toBeDefined();

    const translatedV04Res = resolveDocPage(['v0.4', 'guides', 'agents'], 'es');
    expect(translatedV04Res.isFallback).toBe(false);
    expect(translatedV04Res.page).toBeDefined();

    const translatedRes = resolveDocPage(['v0.3'], 'es');
    expect(translatedRes.isFallback).toBe(false);
    expect(translatedRes.page).toBeDefined();

    const translatedPtRes = resolveDocPage(['v0.3'], 'pt-BR');
    expect(translatedPtRes.isFallback).toBe(false);
    expect(translatedPtRes.page).toBeDefined();
  });

  it('should generate static params for all versioned routes', () => {
    const params = source.generateParams('slug', 'locale');
    expect(params.length).toBeGreaterThanOrEqual(40);

    const locales = params.map((p) => p.locale);
    expect(locales).toContain('en');
    expect(locales).toContain('es');
    expect(locales).toContain('pt-BR');

    const firstSegments = params.map((p) => (p.slug ? p.slug[0] : null));
    expect(firstSegments).toContain('v0.3');
    expect(firstSegments).toContain('v0.4');
  });

  it('should load getting-started pages in English under both v0.3 and v0.4', () => {
    const install03 = source.getPage(['v0.3', 'getting-started', 'installation'], 'en');
    expect(install03).toBeDefined();
    expect(install03?.data.title).toBe('Installation');

    const install04 = source.getPage(['v0.4', 'getting-started', 'installation'], 'en');
    expect(install04).toBeDefined();
    expect(install04?.data.title).toBe('Installation');

    const quickstart03 = source.getPage(['v0.3', 'getting-started', 'quickstart'], 'en');
    expect(quickstart03).toBeDefined();

    const quickstart04 = source.getPage(['v0.4', 'getting-started', 'quickstart'], 'en');
    expect(quickstart04).toBeDefined();
  });

  it('should create unversioned page tree stripping v0.3 track prefix from URLs', () => {
    const v03Tree = getVersionPageTree('v0.3', 'en');
    const unversionedTree = createUnversionedPageTree(v03Tree, 'v0.3');

    expect(unversionedTree).toBeDefined();
    expect(unversionedTree.children.length).toBeGreaterThan(0);

    // Recursively check that no URLs in unversionedTree contain /v0.3
    function checkUrls(nodes: typeof unversionedTree.children) {
      for (const node of nodes) {
        if (node.type === 'page') {
          expect(node.url).not.toContain('/docs/v0.3');
          expect(node.url).toMatch(/^\/en\/docs/);
        }
        if (node.type === 'folder') {
          if (node.index) {
            expect(node.index.url).not.toContain('/docs/v0.3');
            expect(node.index.url).toMatch(/^\/en\/docs/);
          }
          checkUrls(node.children);
        }
      }
    }

    checkUrls(unversionedTree.children);
  });
});
