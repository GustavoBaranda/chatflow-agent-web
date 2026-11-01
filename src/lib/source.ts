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
 * Create an unversioned view of the stable (v0.3) page tree by stripping
 * the /v0.3 track segment from all page/index URLs.
 * This allows unversioned legacy routes (e.g., /en/docs/guides/agents)
 * to match exact active nodes in the sidebar without mixing tracks.
 */
export function createUnversionedPageTree(
  tree: PageTree.Root,
  track: DocVersionTrack = DEFAULT_STABLE_TRACK,
): PageTree.Root {
  function rewriteNode<T extends PageTree.Node>(node: T): T {
    if (node.type === 'page') {
      return {
        ...node,
        url: node.url.replace(new RegExp(`/docs/${track}(/|$)`), '/docs$1'),
      };
    }
    if (node.type === 'folder') {
      return {
        ...node,
        index: node.index ? rewriteNode(node.index) : undefined,
        children: node.children.map(rewriteNode),
      };
    }
    return node;
  }

  return {
    ...tree,
    children: tree.children.map(rewriteNode),
  };
}

/**
 * Resolve a documentation page supporting both versioned paths (/v0.3/...)
 * and unversioned backward-compatible paths (/getting-started/...).
 */
export function resolveDocPage(slug: string[] = [], locale: string) {
  const { track, cleanSlug, isExplicitTrack } = resolveVersionAndSlug(slug);
  const targetSlug = isExplicitTrack ? slug : [track, ...cleanSlug];

  let page = source.getPage(targetSlug, locale);

  if (!page && locale !== 'en') {
    page = source.getPage(targetSlug, 'en');
  }

  const isFallback = locale !== 'en' && Boolean(page?.path && !page.path.startsWith(`${locale}/`));

  return {
    page,
    track,
    cleanSlug,
    targetSlug,
    isExplicitTrack,
    isFallback,
  };
}
