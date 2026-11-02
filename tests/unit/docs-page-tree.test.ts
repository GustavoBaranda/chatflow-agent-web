import { describe, it, expect } from 'vitest';
import { getVersionPageTree, createUnversionedPageTree } from '@/lib/source';

describe('Version-Aware Page Tree & Locale Fallback Suite', () => {
  const tracks = ['v0.3', 'v0.4'] as const;
  const locales = ['en', 'es', 'pt-BR'] as const;

  for (const track of tracks) {
    for (const locale of locales) {
      it(`should return complete topic tree for track ${track} in locale ${locale}`, () => {
        const tree = getVersionPageTree(track, locale);

        expect(tree).toBeDefined();
        expect(tree.children.length).toBeGreaterThan(1);

        // Find subfolders or pages in children
        const names = tree.children.map((c) => (typeof c.name === 'string' ? c.name : ''));
        if (track === 'v0.3' && locale === 'es') {
          expect(names).toContain('Primeros Pasos');
          expect(names).toContain('Arquitectura Central');
          expect(names).toContain('Proveedores de LLM');
          expect(names).toContain('Canales e Integraciones');
          expect(names).toContain('Patrones de Producción');
        } else if (track === 'v0.3' && locale === 'pt-BR') {
          expect(names).toContain('Primeiros Passos');
          expect(names).toContain('Arquitetura Central');
          expect(names).toContain('Provedores de LLM');
          expect(names).toContain('Canais e Integrações');
          expect(names).toContain('Padrões de Produção');
        } else {
          expect(names).toContain('Getting Started');
          expect(names).toContain('Core Architecture');
          expect(names).toContain('LLM Providers');
          expect(names).toContain('Channels & Integrations');
          expect(names).toContain('Production Patterns');
        }

        // Verify all URLs in tree belong to the requested locale and track
        function verifyUrls(nodes: typeof tree.children) {
          for (const node of nodes) {
            if (node.type === 'page') {
              expect(node.url).toMatch(new RegExp(`^/${locale}/docs/${track}(/|$)`));
            } else if (node.type === 'folder') {
              if (node.index) {
                expect(node.index.url).toMatch(new RegExp(`^/${locale}/docs/${track}(/|$)`));
              }
              verifyUrls(node.children);
            }
          }
        }
        verifyUrls(tree.children);
      });
    }
  }

  it('preserves Spanish localized overview title while including fallback topics', () => {
    const esTree = getVersionPageTree('v0.3', 'es');
    const overviewPage = esTree.children.find((c) => c.type === 'page');

    expect(overviewPage).toBeDefined();
    expect(overviewPage?.name).toBe('Visión General de la Documentación');
    expect(overviewPage?.url).toBe('/es/docs/v0.3');
  });

  it('preserves Portuguese localized overview title while including fallback topics', () => {
    const ptTree = getVersionPageTree('v0.3', 'pt-BR');
    const overviewPage = ptTree.children.find((c) => c.type === 'page');

    expect(overviewPage).toBeDefined();
    expect(overviewPage?.name).toBe('Visão Geral da Documentação');
    expect(overviewPage?.url).toBe('/pt-BR/docs/v0.3');
  });

  it('unversioned page tree strips track prefix while preserving all categories and topics', () => {
    const v03Tree = getVersionPageTree('v0.3', 'es');
    const unversioned = createUnversionedPageTree(v03Tree, 'v0.3');

    expect(unversioned.children.length).toBe(v03Tree.children.length);

    function verifyUnversionedUrls(nodes: typeof unversioned.children) {
      for (const node of nodes) {
        if (node.type === 'page') {
          expect(node.url).toMatch(/^\/es\/docs(\/|$)/);
          expect(node.url).not.toContain('/docs/v0.3');
        } else if (node.type === 'folder') {
          if (node.index) {
            expect(node.index.url).toMatch(/^\/es\/docs(\/|$)/);
            expect(node.index.url).not.toContain('/docs/v0.3');
          }
          verifyUnversionedUrls(node.children);
        }
      }
    }
    verifyUnversionedUrls(unversioned.children);
  });
});

