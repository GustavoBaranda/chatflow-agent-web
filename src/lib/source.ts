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

function getNodeKey(node: PageTree.Node): string {
  if (node.type === 'page') {
    return node.url;
  }
  if (node.type === 'folder') {
    const refFolder = (node as { $ref?: { folder?: string } }).$ref?.folder;
    if (refFolder) return refFolder;
    return typeof node.name === 'string' ? node.name : '';
  }
  if (node.type === 'separator') {
    return typeof node.name === 'string' ? node.name : '';
  }
  return '';
}

function mergeTreeNodes(primary: PageTree.Node[], fallback: PageTree.Node[]): PageTree.Node[] {
  const primaryKeyMap = new Map<string, PageTree.Node>();
  for (const node of primary) {
    const key = getNodeKey(node);
    if (key) primaryKeyMap.set(key, node);
  }

  const result: PageTree.Node[] = [];

  // 1. Process all primary nodes; if a folder also exists in fallback, merge children recursively
  for (const pNode of primary) {
    const key = getNodeKey(pNode);
    const fNode = key ? fallback.find((n) => getNodeKey(n) === key) : undefined;
    if (pNode.type === 'folder' && fNode?.type === 'folder') {
      result.push({
        ...pNode,
        children: mergeTreeNodes(pNode.children, fNode.children),
      });
    } else {
      result.push(pNode);
    }
  }

  // 2. Add all fallback nodes that were not present in primary
  for (const fNode of fallback) {
    const key = getNodeKey(fNode);
    if (!key || !primaryKeyMap.has(key)) {
      result.push(fNode);
    }
  }

  return result;
}

function findTrackFolder(
  children: PageTree.Node[],
  track: DocVersionTrack,
): PageTree.Folder | undefined {
  for (const node of children) {
    if (node.type === 'folder') {
      const matchesTrack =
        (typeof node.index?.url === 'string' && node.index.url.includes(`/docs/${track}`)) ||
        (typeof node.name === 'string' && node.name.toLowerCase().includes(track.toLowerCase()));
      if (matchesTrack) {
        return node;
      }
    }
  }
  return undefined;
}

/**
 * Retrieve the isolated page tree for a specific documentation track and locale.
 * Isolates navigation between v0.3 and v0.4 so tracks are never mixed in the sidebar.
 * Seamlessly merges authoritative English fallback tree when localized translations
 * are missing so the sidebar always displays the full documentation structure.
 */
export function getVersionPageTree(track: DocVersionTrack, locale: string): PageTree.Root {
  const fullTree = source.getPageTree(locale);
  const primaryFolder = findTrackFolder(fullTree.children, track);

  const fallbackFolder = (fullTree as { fallback?: PageTree.Root }).fallback
    ? findTrackFolder((fullTree as { fallback?: PageTree.Root }).fallback!.children, track)
    : undefined;

  if (primaryFolder && fallbackFolder) {
    const primaryChildren = primaryFolder.index
      ? [primaryFolder.index, ...primaryFolder.children]
      : primaryFolder.children;
    const fallbackChildren = fallbackFolder.index
      ? [fallbackFolder.index, ...fallbackFolder.children]
      : fallbackFolder.children;

    return {
      name: primaryFolder.name,
      children: mergeTreeNodes(primaryChildren, fallbackChildren),
    };
  }

  if (primaryFolder) {
    return {
      name: primaryFolder.name,
      children: primaryFolder.index
        ? [primaryFolder.index, ...primaryFolder.children]
        : primaryFolder.children,
    };
  }

  if (fallbackFolder) {
    return {
      name: fallbackFolder.name,
      children: fallbackFolder.index
        ? [fallbackFolder.index, ...fallbackFolder.children]
        : fallbackFolder.children,
    };
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

/**
 * Extract all topic subpaths available in a specific track from the in-memory
 * Fumadocs documentation source tree (authoritative English baseline).
 * Completely avoids runtime filesystem calls.
 */
export function getAvailableTopicsForTrack(track: DocVersionTrack): string[] {
  const pages = source.getPages('en');
  const topics = new Set<string>();
  for (const page of pages) {
    if (page.slugs[0] === track) {
      topics.add(page.slugs.slice(1).join('/'));
    }
  }
  return Array.from(topics).sort();
}

