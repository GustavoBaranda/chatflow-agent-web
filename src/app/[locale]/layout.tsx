import { notFound } from 'next/navigation';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { routing } from '@/i18n/routing';
import { getLanguage } from '@/config/languages';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import type { Metadata } from 'next';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: {
      template: '%s | chatflow-agent',
      default: 'chatflow-agent — Conversational AI Agents in Python',
    },
    description:
      locale === 'es'
        ? 'Plataforma oficial de documentación para chatflow-agent, la librería Python para agentes conversacionales, herramientas, sesiones y canales.'
        : 'Official documentation and website for chatflow-agent, an open-source Python library for conversational AI agents, tools, sessions, and channels.',
    metadataBase: new URL('https://chatflowagent.org'),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        es: '/es',
        'x-default': '/en',
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const lang = getLanguage(locale);

  return (
    <html lang={locale} dir={lang.direction} suppressHydrationWarning>
      <body
        className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary/20"
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <RootProvider
            dir={lang.direction}
            search={{ enabled: false }}
            theme={{
              attribute: 'class',
              defaultTheme: 'system',
              enableSystem: true,
            }}
          >
            <Navbar />
            {children}
            <Footer />
          </RootProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
