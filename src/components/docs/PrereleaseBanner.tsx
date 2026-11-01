import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getVersionConfig, resolveVersionSwitchUrl } from '@/config/docs-versions';

export interface PrereleaseBannerProps {
  locale: string;
  currentSlug: string[];
}

export function PrereleaseBanner({ locale, currentSlug }: PrereleaseBannerProps) {
  const t = useTranslations('prereleaseBanner');
  const v04Config = getVersionConfig('v0.4');
  const v03Config = getVersionConfig('v0.3');

  // Build target URL for stable counterpart preserving topic if available
  const currentPath = `/${locale}/docs/v0.4${currentSlug.length > 0 ? `/${currentSlug.join('/')}` : ''}`;
  const stableTargetUrl = resolveVersionSwitchUrl({
    currentPathname: currentPath,
    targetTrack: 'v0.3',
    locale,
  });

  return (
    <aside
      role="status"
      aria-label={t('title', { version: `v${v04Config.sdkVersion}` })}
      className="my-6 rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 text-sm text-foreground backdrop-blur-xs transition-colors dark:border-purple-400/30 dark:bg-purple-400/10"
      data-testid="prerelease-banner"
    >
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-purple-600 dark:text-purple-400" aria-hidden="true" />
        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-purple-900 dark:text-purple-200">
              {t('title', { version: `v${v04Config.sdkVersion}` })}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-200/80 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200">
              {v04Config.badgeLabel}
            </span>
          </div>
          <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
            {t('description', { version: `v${v04Config.sdkVersion}` })}
          </p>
          <div className="pt-1.5">
            <Link
              href={stableTargetUrl}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline group"
              data-testid="prerelease-banner-switch-link"
            >
              <span>{t('switchToStable', { version: `v${v03Config.sdkVersion}` })}</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
