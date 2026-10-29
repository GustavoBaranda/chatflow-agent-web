'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { RotateCcw, Home, BookOpen, Info, Bug, ArrowUpRight } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LocalizedError({ error, reset }: ErrorProps) {
  const t = useTranslations('error');

  useEffect(() => {
    // Log unexpected client-side exception for telemetry and debugging
    console.error('[LocalizedErrorBoundary]', error);
  }, [error]);

  return (
    <main
      id="main-content"
      role="alert"
      aria-live="assertive"
      className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-16 sm:py-24 text-center"
    >
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <div className="h-90 w-90 rounded-full bg-destructive/10 blur-3xl sm:h-120 sm:w-120" />
      </div>

      <div className="mx-auto flex max-w-2xl flex-col items-center">
        {/* Official Isotype Badge with Ambient Glow */}
        <div className="relative mb-6 flex items-center justify-center">
          <div
            className="absolute -inset-4 rounded-3xl bg-linear-to-r from-red-500/20 via-amber-500/20 to-violet-500/20 blur-xl motion-safe:animate-pulse"
            aria-hidden="true"
          />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-border/80 bg-card/90 p-3.5 shadow-xl backdrop-blur-md sm:h-24 sm:w-24">
            <Image
              src="/brand/logo-symbol.svg"
              alt="chatflow-agent official isotype"
              width={64}
              height={64}
              className="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
              priority
            />
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-destructive">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
          </span>
          <span>{t('badge')}</span>
        </div>

        {/* 500 Watermark & Title */}
        <div className="relative mb-3">
          <span
            className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 select-none text-7xl font-black tracking-tighter text-muted/20 sm:-top-12 sm:text-9xl dark:text-muted/10"
            aria-hidden="true"
          >
            500
          </span>
          <h1 className="relative text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl leading-tight">
            {t('title')}
          </h1>
        </div>

        {/* Safe Description without sensitive data */}
        <p className="max-w-lg text-balance text-sm text-muted-foreground sm:text-base leading-relaxed">
          {t('description')}
        </p>

        {/* Optional digest reference for tracking */}
        {error?.digest && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-1.5 text-xs font-mono text-muted-foreground">
            <span className="font-semibold text-foreground/80">{t('referenceCode')}:</span>
            <span>{error.digest}</span>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-98 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>{t('retry')}</span>
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border/80 bg-background/80 px-6 text-sm font-semibold text-foreground backdrop-blur-xs transition-all hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-98"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span>{t('returnHome')}</span>
          </Link>
        </div>

        {/* Quick Links Section */}
        <div className="mt-12 w-full max-w-md border-t border-border/60 pt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('quickLinksTitle')}
          </p>
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2.5">
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/60 px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-card hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t('docsLink')}</span>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/60 px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-card hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
            >
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t('aboutLink')}</span>
            </Link>
            <a
              href="https://github.com/GustavoBaranda/chatflow-agent/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/60 px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-card hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
            >
              <Bug className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t('reportIssue')}</span>
              <ArrowUpRight className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
