import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { GitHubIcon } from '@/components/ui/icons';
import { SITE_ORIGIN, createSocialMetadata } from '@/config/docs-seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { getCommunityStructuredData } from '@/lib/structured-data';
import {
  Users,
  Bug,
  Lightbulb,
  GitPullRequest,
  Tag,
  Package,
  BookOpen,
  ExternalLink,
  ArrowRight,
  GitFork,
  Terminal,
  Code2,
  CheckCircle2,
  Heart,
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
  const t = await getTranslations({ locale, namespace: 'community' });

  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `/${l}/community`])
  );
  languages['x-default'] = `/${routing.defaultLocale}/community`;

  const social = createSocialMetadata({
    title: `${t('metaTitle')} | chatflow-agent`,
    description: t('metaDescription'),
    url: `${SITE_ORIGIN}/${locale}/community`,
    locale,
  });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: `/${locale}/community`,
      languages,
    },
    openGraph: social.openGraph,
    twitter: social.twitter,
  };
}

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'community' });

  const resourceCards = [
    {
      title: t('repoCardTitle'),
      description: t('repoCardDesc'),
      action: t('repoCardAction'),
      href: 'https://github.com/GustavoBaranda/chatflow-agent',
      isExternal: true,
      icon: GitHubIcon,
    },
    {
      title: t('issuesCardTitle'),
      description: t('issuesCardDesc'),
      action: t('issuesCardAction'),
      href: 'https://github.com/GustavoBaranda/chatflow-agent/issues',
      isExternal: true,
      icon: Bug,
    },
    {
      title: t('featuresCardTitle'),
      description: t('featuresCardDesc'),
      action: t('featuresCardAction'),
      href: 'https://github.com/GustavoBaranda/chatflow-agent/issues/new',
      isExternal: true,
      icon: Lightbulb,
    },
    {
      title: t('prsCardTitle'),
      description: t('prsCardDesc'),
      action: t('prsCardAction'),
      href: 'https://github.com/GustavoBaranda/chatflow-agent/pulls',
      isExternal: true,
      icon: GitPullRequest,
    },
    {
      title: t('releasesCardTitle'),
      description: t('releasesCardDesc'),
      action: t('releasesCardAction'),
      href: 'https://github.com/GustavoBaranda/chatflow-agent/releases',
      isExternal: true,
      icon: Tag,
    },
    {
      title: t('pypiCardTitle'),
      description: t('pypiCardDesc'),
      action: t('pypiCardAction'),
      href: 'https://pypi.org/project/chatflow-agent/',
      isExternal: true,
      icon: Package,
    },
  ];

  const steps = [
    {
      title: t('step1Title'),
      description: t('step1Desc'),
      icon: GitFork,
    },
    {
      title: t('step2Title'),
      description: t('step2Desc'),
      icon: Terminal,
    },
    {
      title: t('step3Title'),
      description: t('step3Desc'),
      icon: Code2,
    },
    {
      title: t('step4Title'),
      description: t('step4Desc'),
      icon: CheckCircle2,
    },
  ];

  return (
    <>
      <JsonLd data={getCommunityStructuredData(locale)} />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Page Hero */}
        <header className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t('badge')}</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            {t('title')}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t('subtitle')}
          </p>
        </header>

        {/* Featured Documentation Hub Banner */}
        <section aria-labelledby="featured-docs-heading" className="mt-12">
          <article
            aria-labelledby="featured-docs-heading"
            className="rounded-2xl border border-primary/30 bg-linear-to-br from-card via-card to-primary/5 p-6 sm:p-8 shadow-xs"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="min-w-0 max-w-2xl">
                <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{t('featuredDocsBadge')}</span>
                </div>
                <h2
                  id="featured-docs-heading"
                  className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
                >
                  {t('featuredDocsTitle')}
                </h2>
                <p className="mt-2 text-sm sm:text-base leading-relaxed text-muted-foreground">
                  {t('featuredDocsDesc')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
                <Link
                  href="/docs"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-xs transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-primary w-full sm:w-auto"
                >
                  <span>{t('featuredDocsAction')}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/docs/v0.3/getting-started/quickstart"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary w-full sm:w-auto"
                >
                  <span>{t('featuredDocsQuickstart')}</span>
                </Link>
              </div>
            </div>
          </article>
        </section>

        {/* Community Resource Cards (3x2 Grid) */}
        <section aria-labelledby="resources-heading" className="mt-10">
          <h2 id="resources-heading" className="sr-only">
            {t('badge')}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resourceCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <article
                  key={index}
                  className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-xs transition-shadow hover:shadow-md"
                >
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-foreground">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-border pt-4">
                    {card.isExternal ? (
                      <a
                        href={card.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        <span>{card.action}</span>
                        <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
                      </a>
                    ) : (
                      <Link
                        href={card.href}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        <span>{card.action}</span>
                        <ArrowRight className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* How to Contribute Section */}
        <section aria-labelledby="how-to-contribute-heading" className="mt-20 border-t border-border pt-16">
          <div className="text-center">
            <h2 id="how-to-contribute-heading" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t('howToContributeTitle')}
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground">
              {t('howToContributeSubtitle')}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const stepNumber = String(idx + 1).padStart(2, '0');
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between transition-shadow hover:shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <StepIcon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <span className="font-mono text-xs font-bold text-muted-foreground/60 select-none">
                        {stepNumber}
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Open Source Collaboration Notice */}
        <section
          aria-labelledby="governance-heading"
          className="mt-16 rounded-2xl border border-border bg-linear-to-b from-card to-card/50 p-8 sm:p-10 shadow-xs"
        >
          <div className="max-w-3xl">
            <h2 id="governance-heading" className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {t('guidelinesNoticeTitle')}
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
              {t('guidelinesNoticeDesc')}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <a
                href="https://github.com/GustavoBaranda/chatflow-agent"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary w-full sm:w-auto"
              >
                <GitHubIcon className="h-4 w-4" />
                <span>{t('repoCardAction')}</span>
              </a>
              <a
                href="https://github.com/sponsors/GustavoBaranda"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-pink-500/30 bg-pink-500/10 px-4 py-2.5 text-sm font-semibold text-pink-700 dark:text-pink-300 shadow-xs transition-colors hover:bg-pink-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 w-full sm:w-auto"
              >
                <Heart className="h-4 w-4 fill-pink-500 text-pink-500" aria-hidden="true" />
                <span>{t('sponsorAction')}</span>
              </a>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary w-full sm:w-auto"
              >
                <span>{t('aboutAction')}</span>
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
