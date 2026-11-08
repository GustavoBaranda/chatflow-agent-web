import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { GitHubIcon } from '@/components/ui/icons';
import { ArrowDown, ArrowRight, BookOpen, Sparkles } from 'lucide-react';

export function HeroSection() {
  const t = useTranslations('home');

  return (
    <section aria-labelledby="hero-title" className="pt-8 pb-12 text-center sm:pt-12 sm:pb-16 px-4">
      {/* Release & Runtime Badge */}
      <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary shadow-xs transition-colors hover:bg-primary/15">
        <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">{t('badge')}</span>
      </div>

      {/* Main Hero Heading */}
      <h1
        id="hero-title"
        className="mt-4 sm:mt-6 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-5xl mx-auto leading-tight text-balance"
      >
        {t('heroTitle')}
      </h1>

      {/* Subtitle / Value Proposition */}
      <p className="mt-4 sm:mt-6 max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed text-pretty">
        {t('heroSubtitle')}
      </p>

      <Link
        href="/docs/v0.3/getting-started/core-concepts"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-primary"
      >
        <span>{t('chatflowConcepts')}</span>
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>

      {/* Action Buttons */}
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-xs sm:max-w-none mx-auto w-full">
        {/* Get Started -> Smooth scroll to Quickstart */}
        <a
          href="#quickstart"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-primary cursor-pointer w-full sm:w-auto"
        >
          <span>{t('getStarted')}</span>
          <ArrowDown className="h-4 w-4" aria-hidden="true" />
        </a>

        {/* Official Documentation -> Internal Localized Route */}
        <Link
          href="/docs"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary w-full sm:w-auto"
        >
          <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>{t('documentation')}</span>
        </Link>

        {/* GitHub Repository */}
        <a
          href="https://github.com/GustavoBaranda/chatflow-agent"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary w-full sm:w-auto"
          aria-label="GitHub Repository"
        >
          <GitHubIcon className="h-4 w-4" />
          <span>{t('github')}</span>
        </a>
      </div>
    </section>
  );
}
