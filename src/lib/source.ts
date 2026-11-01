import { docs } from '@/.source';
import { loader } from 'fumadocs-core/source';
import type * as PageTree from 'fumadocs-core/page-tree';
import {
  type DocVersionTrack,
  DEFAULT_STABLE_TRACK,
  resolveVersionAndSlug,
} from '@/config/docs-versions';

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  i18n: {
    languages: ['en', 'es', 'pt-BR'],
    defaultLanguage: 'en',
    hideLocale: 'never',
    parser: 'dir',
  },
});

/**
 * Retrieve the isolated page tree for a specific documentation track and locale.
 * Isolates navigation between v0.3 and v0.4 so tracks are never mixed in the sidebar.
 */
export function getVersionPageTree(track: DocVersionTrack, locale: string): PageTree.Root {
  const fullTree = source.getPageTree(locale);
  for (const node of fullTree.children) {
    if (node.type === 'folder') {
      const matchesTrack =
        (typeof node.index?.url === 'string' && node.index.url.includes(`/docs/${track}`)) ||
        (typeof node.name === 'string' && node.name.toLowerCase().includes(track.toLowerCase()));
      if (matchesTrack) {
        return {
          name: node.name,
          children: node.index ? [node.index, ...node.children] : node.children,
        };
      }
    }
  }
  return fullTree;
}

/**
 * Resolve a documentation page supporting both versioned paths (/v0.3/...)
 * and unversioned backward-compatible paths (/getting-started/...).
 */
export function resolveDocPage(slug: string[] = [], locale: string) {
  const { track, cleanSlug, isExplicitTrack } = resolveVersionAndSlug(slug);
  const targetSlug = isExplicitTrack ? slug : [track, ...cleanSlug];

  let page = source.getPage(targetSlug, locale);
  let isFallback = false;

  if (!page && locale !== 'en') {
    page = source.getPage(targetSlug, 'en');
    isFallback = Boolean(page);
  }

  return {
    page,
    track,
    cleanSlug,
    targetSlug,
    isExplicitTrack,
    isFallback,
  };
}
