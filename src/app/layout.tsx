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
  description:
    'Official documentation and website for chatflow-agent, an open-source Python library for conversational AI agents, tools, sessions, and channels.',
  openGraph: {
    title: 'chatflow-agent — Conversational AI Agents in Python',
    description:
      'Official documentation and website for chatflow-agent, an open-source Python library for conversational AI agents, tools, sessions, and channels.',
    url: 'https://chatflowagent.org',
    siteName: 'chatflow-agent',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/brand/social-preview.png',
        width: 1200,
        height: 630,
        alt: 'chatflow-agent — Conversational AI Agents in Python',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'chatflow-agent — Conversational AI Agents in Python',
    description:
      'Official documentation and website for chatflow-agent, an open-source Python library for conversational AI agents, tools, sessions, and channels.',
    images: ['/brand/social-preview.png'],
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
        <AppProviders direction={lang.direction} locale={locale}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}

