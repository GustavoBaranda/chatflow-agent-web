'use client';

import { usePathname } from 'next/navigation';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';
import { DocsSearchDialog } from '@/components/docs/DocsSearchDialog';

interface AppProvidersProps {
  children: ReactNode;
  direction?: 'ltr' | 'rtl';
  locale?: string;
}

export function AppProviders({
  children,
  direction = 'ltr',
  locale = 'en',
}: AppProvidersProps) {
  const pathname = usePathname() || '';
  const pathLocale = pathname.split('/')[1];
  const activeLocale = ['en', 'es', 'pt-BR'].includes(pathLocale) ? pathLocale : locale;

  return (
    <RootProvider
      dir={direction}
      i18n={{
        locale: activeLocale,
        defaultLanguage: 'en',
      }}
      search={{
        enabled: true,
        SearchDialog: DocsSearchDialog,
      }}
      theme={{
        attribute: 'class',
        defaultTheme: 'light',
        enableSystem: false,
      }}
    >
      {children}
    </RootProvider>
  );
}
