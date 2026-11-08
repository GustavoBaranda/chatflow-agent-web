import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { routing } from '@/i18n/routing';
import { getLanguage } from '@/config/languages';
import { SITE_ORIGIN, createSocialMetadata } from '@/config/docs-seo';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { LocaleHtmlUpdater } from '@/components/navigation/LocaleHtmlUpdater';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  let title = 'Python Chatflows & Multi-Agent Workflows';
  let description =
    'Build chatflows and conversational AI agents in Python with chatflow-agent, a lightweight async Python framework for tools, handoffs, session context, and channel integrations.';
  if (locale === 'es') {
    title = 'Chatflows y agentes de IA en Python';
    description =
      'Construí chatflows y agentes conversacionales en Python con chatflow-agent, un framework ligero y asíncrono de Python para herramientas, handoffs, contexto de sesión e integraciones de canales.';
  } else if (locale === 'pt-BR') {
    title = 'Chatflows e agentes de IA em Python';
    description =
      'Crie chatflows e agentes conversacionais em Python com chatflow-agent, um framework leve e assíncrono em Python para ferramentas, handoffs, contexto de sessão e integrações de canais.';
  }

  const languages = Object.fromEntries(routing.locales.map((l) => [l, `/${l}`]));
  languages['x-default'] = `/${routing.defaultLocale}`;

  const social = createSocialMetadata({
    title: `${title} | chatflow-agent`,
    description,
    url: `${SITE_ORIGIN}/${locale}`,
    locale,
  });

  return {
    title: {
      template: '%s | chatflow-agent',
      default: title,
    },
    description,
    alternates: {
      canonical: `/${locale}`,
      languages,
    },
    openGraph: social.openGraph,
    twitter: social.twitter,
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

  const messages = (await import(`../../../messages/${locale}.json`)).default;
  const lang = getLanguage(locale);

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <LocaleHtmlUpdater locale={locale} direction={lang.direction} />
      <Navbar />
      {children}
      <Footer />
    </NextIntlClientProvider>
  );
}
