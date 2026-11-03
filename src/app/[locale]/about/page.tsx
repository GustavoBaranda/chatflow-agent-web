import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { GitHubIcon } from '@/components/ui/icons';
import { SITE_ORIGIN, createSocialMetadata } from '@/config/docs-seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { getAboutStructuredData } from '@/lib/structured-data';
import {
  Code2,
  Users,
  ExternalLink,
  Cpu,
  GitFork,
  Radio,
  Database,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
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
  const t = await getTranslations({ locale, namespace: 'about' });

  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `/${l}/about`])
  );
  languages['x-default'] = `/${routing.defaultLocale}/about`;

  const social = createSocialMetadata({
    title: `${t('metaTitle')} | chatflow-agent`,
    description: t('metaDescription'),
    url: `${SITE_ORIGIN}/${locale}/about`,
    locale,
  });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: `/${locale}/about`,
      languages,
    },
    openGraph: social.openGraph,
    twitter: social.twitter,
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'about' });

  const principles = [
    {
      title: t('p1Title'),
      description: t('p1Desc'),
      icon: Cpu,
    },
    {
      title: t('p2Title'),
      description: t('p2Desc'),
      icon: GitFork,
    },
    {
      title: t('p3Title'),
      description: t('p3Desc'),
      icon: Radio,
    },
    {
      title: t('p4Title'),
      description: t('p4Desc'),
      icon: Database,
    },
  ];

  return (
    <>
      <JsonLd data={getAboutStructuredData(locale)} />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Page Hero */}
        <header className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <span>chatflow-agent</span>
            <span aria-hidden="true">•</span>
            <span>Open Source</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            {t('title')}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </header>

        {/* Origin & Purpose Section */}
        <section aria-labelledby="origin-heading" className="mt-16 rounded-2xl border border-border bg-card p-8 sm:p-10 shadow-xs">
          <div className="max-w-3xl">
            <h2 id="origin-heading" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t('originTitle')}
            </h2>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>{t('originP1')}</p>
              <p>{t('originP2')}</p>
            </div>
          </div>
        </section>

        {/* Core Principles Grid */}
        <section aria-labelledby="principles-heading" className="mt-16">
          <h2 id="principles-heading" className="text-2xl font-bold tracking-tight text-foreground text-center">
            {t('principlesTitle')}
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {principles.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <article
                  key={index}
                  className="rounded-xl border border-border bg-card p-6 shadow-xs transition-shadow hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-foreground">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {principle.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Leadership and Community Grid */}
        <section aria-labelledby="leadership-heading" className="mt-16 border-t border-border pt-16">
          <h2 id="leadership-heading" className="text-2xl font-bold tracking-tight text-foreground text-center">
            {t('leadershipTitle')}
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
            {/* Creator & Lead Maintainer Card */}
            <article className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 sm:p-8 shadow-xs transition-shadow hover:shadow-md">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Code2 className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {t('creatorTitle')}
                    </span>
                    <h3 className="mt-1 text-xl font-bold text-foreground">
                      {t('creatorName')}
                    </h3>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  {t('creatorBio')}
                </p>
              </div>

              <div className="mt-8 border-t border-border pt-4">
                <a
                  href="https://github.com/GustavoBaranda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <GitHubIcon className="h-4 w-4" />
                  <span>{t('creatorProfile')}</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
                </a>
              </div>
            </article>

            {/* Global Community Card */}
            <article className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 sm:p-8 shadow-xs transition-shadow hover:shadow-md">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Users className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                      Open Source
                    </span>
                    <h3 className="mt-1 text-xl font-bold text-foreground">
                      {t('communityTitle')}
                    </h3>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  {t('communityDescription')}
                </p>
              </div>

              <div className="mt-8 border-t border-border pt-4">
                <a
                  href="https://github.com/GustavoBaranda/chatflow-agent"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <GitHubIcon className="h-4 w-4" />
                  <span>{t('communityContribute')}</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
                </a>
              </div>
            </article>
          </div>
        </section>

        {/* Closing Navigation / Next Steps Section */}
        <section
          aria-labelledby="about-closing-heading"
          className="mt-16 rounded-2xl border border-border bg-linear-to-b from-card to-card/50 p-8 sm:p-10 shadow-xs text-center"
        >
          <div className="max-w-2xl mx-auto">
            <h2 id="about-closing-heading" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t('closingTitle')}
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
              {t('closingSubtitle')}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-xs sm:max-w-none mx-auto w-full">
              <Link
                href="/docs"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xs transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-primary w-full sm:w-auto"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                <span>{t('closingDocsAction')}</span>
              </Link>
              <Link
                href="/community"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary w-full sm:w-auto"
              >
                <span>{t('closingCommunityAction')}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
    </>
  );
}
