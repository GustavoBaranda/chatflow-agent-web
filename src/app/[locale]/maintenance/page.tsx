import type { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import {
  isMaintenanceModeEnabled,
  getMaintenanceEstimatedMinutes,
} from '@/lib/maintenance';
import { MaintenanceClientActions } from './MaintenanceClientActions';

interface MaintenancePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: MaintenancePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'maintenance' });

  return {
    title: `${t('title')} — chatflow-agent`,
    description: t('description'),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function MaintenancePage({
  params,
}: MaintenancePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // If maintenance mode is not active, redirect to localized home
  if (!isMaintenanceModeEnabled()) {
    redirect(`/${locale}`);
  }

  const t = await getTranslations({ locale, namespace: 'maintenance' });
  const minutes = getMaintenanceEstimatedMinutes();

  return (
    <main
      id="main-content"
      role="main"
      className="relative flex min-h-[calc(100vh-8rem)] flex-1 flex-col items-center justify-center overflow-hidden px-4 py-16 text-center sm:py-24"
    >
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <div className="h-90 w-90 rounded-full bg-amber-500/10 blur-3xl sm:h-120 sm:w-120" />
      </div>

      <div className="mx-auto flex max-w-2xl flex-col items-center">
        {/* Official Isotype Badge with Ambient Glow */}
        <div className="relative mb-6 flex items-center justify-center">
          <div
            className="absolute -inset-4 rounded-3xl bg-linear-to-r from-amber-500/20 via-blue-500/20 to-violet-500/20 blur-xl motion-safe:animate-pulse"
            aria-hidden="true"
          />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-border/80 bg-card/90 p-3.5 shadow-xl backdrop-blur-md sm:h-24 sm:w-24">
            <Image
              src="/brand/logo-symbol.svg"
              alt="chatflow-agent official isotype"
              width={64}
              height={64}
              className="h-full w-full object-contain"
              priority
            />
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-amber-600 dark:text-amber-400">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-amber-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
          <span>{t('badge')}</span>
        </div>

        {/* 503 Watermark & Title */}
        <div className="relative mb-3">
          <span
            className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 select-none text-7xl font-black tracking-tighter text-muted/20 sm:-top-12 sm:text-9xl dark:text-muted/10"
            aria-hidden="true"
          >
            503
          </span>
          <h1 className="relative text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl leading-tight">
            {t('title')}
          </h1>
        </div>

        {/* Description */}
        <p className="max-w-lg text-balance text-sm text-muted-foreground sm:text-base leading-relaxed">
          {t('description')}
        </p>

        {/* Estimated availability notice */}
        <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-500/25 bg-amber-500/5 px-3.5 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300">
          <span>{t('retryAfterNotice', { minutes })}</span>
        </div>

        {/* Interactive Action Buttons */}
        <MaintenanceClientActions
          refreshLabel={t('refreshPage')}
          githubLabel={t('visitGithub')}
        />

        {/* Python SDK Fallback Card */}
        <div className="mt-12 w-full max-w-lg rounded-2xl border border-border/80 bg-card/80 p-5 text-left shadow-sm backdrop-blur-xs sm:p-6">
          <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
            <h2 className="text-sm font-semibold text-foreground">
              {t('githubFallbackTitle')}
            </h2>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
              v0.3.4
            </span>
          </div>
          <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed sm:text-sm">
            {t('githubFallbackDesc')}
          </p>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-border/80 bg-muted/60 px-3.5 py-2.5 font-mono text-xs text-foreground sm:text-sm">
            <span className="truncate selection:bg-primary/20">
              {t('pypiCommand')}
            </span>
            <span className="ml-2 text-[11px] font-sans font-medium text-muted-foreground">
              PyPI
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
