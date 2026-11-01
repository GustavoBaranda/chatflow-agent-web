import { getVersionPageTree, createUnversionedPageTree } from '@/lib/source';
import { DocsLayoutClient } from '@/components/docs/DocsLayoutClient';
import type { ReactNode } from 'react';

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ locale: string }>;
  children: ReactNode;
}) {
  const { locale } = await params;
  const v03Tree = getVersionPageTree('v0.3', locale);
  const v04Tree = getVersionPageTree('v0.4', locale);
  const v03UnversionedTree = createUnversionedPageTree(v03Tree, 'v0.3');

  return (
    <DocsLayoutClient
      v03Tree={v03Tree}
      v04Tree={v04Tree}
      v03UnversionedTree={v03UnversionedTree}
    >
      {children}
    </DocsLayoutClient>
  );
}
