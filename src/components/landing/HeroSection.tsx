import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { GitHubIcon } from '@/components/ui/icons';
import { ArrowDown, BookOpen, Sparkles } from 'lucide-react';

export function HeroSection() {
  const t = useTranslations('home');

  return (
    <section aria-labelledby="hero-title" className="pt-8 pb-12 text-center sm:pt-12 sm:pb-16">
      {/* Release & Runtime Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary shadow-xs transition-colors hover:bg-primary/15">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{t('badge')}</span>
      </div>

      {/* Main Hero Heading */}
      <h1
        id="hero-title"
        className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl text-foreground max-w-4xl mx-auto leading-tight"
      >
        {t('heroTitle')}
      </h1>

      {/* Subtitle / Value Proposition */}
      <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed">
        {t('heroSubtitle')}
      </p>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {/* Get Started -> Smooth scroll to Quickstart */}
        <a
          href="#quickstart"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-primary cursor-pointer"
        >
          <span>{t('getStarted')}</span>
          <ArrowDown className="h-4 w-4" aria-hidden="true" />
        </a>

        {/* Official Documentation -> Internal Localized Route */}
        <Link
          href="/docs"
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
        >
          <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>{t('documentation')}</span>
        </Link>

        {/* GitHub Repository */}
        <a
          href="https://github.com/GustavoBaranda/chatflow-agent"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
          aria-label="GitHub Repository"
        >
          <GitHubIcon className="h-4 w-4" />
          <span>{t('github')}</span>
        </a>
      </div>
    </section>
  );
}
