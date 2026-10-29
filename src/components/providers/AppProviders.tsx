'use client';

import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';

interface AppProvidersProps {
  children: ReactNode;
  direction?: 'ltr' | 'rtl';
}

export function AppProviders({ children, direction = 'ltr' }: AppProvidersProps) {
  return (
    <RootProvider
      dir={direction}
      search={{ enabled: true }}
      theme={{
        attribute: 'class',
        defaultTheme: 'system',
        enableSystem: true,
        scriptProps: { async: true },
      }}
    >
      {children}
    </RootProvider>
  );
}
