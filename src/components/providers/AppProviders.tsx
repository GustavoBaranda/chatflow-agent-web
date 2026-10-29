'use client';

import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';

// Suppress React 19's false-positive development warning for next-themes inline FOUC script
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Encountered a script tag while rendering React component')
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

interface AppProvidersProps {
  children: ReactNode;
  direction?: 'ltr' | 'rtl';
}

export function AppProviders({ children, direction = 'ltr' }: AppProvidersProps) {
  return (
    <RootProvider
      dir={direction}
      search={{ enabled: false }}
      theme={{
        attribute: 'class',
        defaultTheme: 'system',
        enableSystem: true,
      }}
    >
      {children}
    </RootProvider>
  );
}
