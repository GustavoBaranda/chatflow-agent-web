import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { getLanguage } from '@/config/languages';
import { AppProviders } from '@/components/providers/AppProviders';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://chatflowagent.org'),
  title: {
    template: '%s | chatflow-agent',
    default: 'chatflow-agent — Conversational AI Agents in Python',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const lang = getLanguage(locale);

  return (
    <html lang={locale} dir={lang.direction} suppressHydrationWarning>
      <body
        className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary/20"
        suppressHydrationWarning
      >
        <AppProviders direction={lang.direction}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}

