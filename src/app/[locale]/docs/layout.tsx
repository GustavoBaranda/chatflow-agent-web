import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '@/lib/source';
import type { ReactNode } from 'react';

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ locale: string }>;
  children: ReactNode;
}) {
  const { locale } = await params;
  const tree = source.getPageTree(locale);

  return (
    <DocsLayout
      tree={tree}
      themeSwitch={{
        enabled: false,
      }}
      sidebar={{
        collapsible: true,
        defaultOpenLevel: 2,
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
