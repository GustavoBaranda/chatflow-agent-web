'use client';

import { useMemo, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type * as PageTree from 'fumadocs-core/page-tree';
import { VersionSelector } from './VersionSelector';

export interface DocsLayoutClientProps {
  v03Tree: PageTree.Root;
  v04Tree: PageTree.Root;
  v03UnversionedTree: PageTree.Root;
  children: ReactNode;
}

export function DocsLayoutClient({
  v03Tree,
  v04Tree,
  v03UnversionedTree,
  children,
}: DocsLayoutClientProps) {
  const pathname = usePathname() || '';

  // Select isolated active tree based on current pathname
  const activeTree = useMemo(() => {
    if (pathname.includes('/docs/v0.4')) {
      return v04Tree;
    }
    if (pathname.includes('/docs/v0.3')) {
      return v03Tree;
    }
    // Unversioned legacy routes (/docs/...) display v0.3 tree with unversioned URLs
    return v03UnversionedTree;
  }, [pathname, v03Tree, v04Tree, v03UnversionedTree]);

  return (
    <DocsLayout
      tree={activeTree}
      tabs={false}
      themeSwitch={{
        enabled: false,
      }}
      sidebar={{
        collapsible: true,
        defaultOpenLevel: 2,
        banner: <VersionSelector className="w-full" />,
      }}
      containerProps={{
        style: {
          '--fd-banner-height': '3.5rem',
          '--fd-header-height': '3.5rem',
        } as React.CSSProperties,
      }}
    >
      {children}
    </DocsLayout>
  );
}
