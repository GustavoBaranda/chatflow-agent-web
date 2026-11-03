import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ExternalLink, Heart } from 'lucide-react';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="w-full border-t border-border bg-card text-muted-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Top Multi-column Section */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:gap-x-8 sm:gap-y-8 lg:grid-cols-5">
          {/* Brand & Mission (Full width on mobile, 2 cols on lg) */}
          <div className="col-span-2 lg:col-span-2">
            <span className="text-base font-bold text-foreground">chatflow-agent</span>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
              {t('tagline')}
            </p>
          </div>

          {/* Explore Links (Col 1 on mobile) */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              {t('exploreTitle')}
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link
                  href="/docs"
                  className="inline-block py-0.5 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {t('links.documentation')}
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/v0.3/getting-started/quickstart"
                  className="inline-block py-0.5 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {t('links.quickstart')}
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/v0.3/guides/agents"
                  className="inline-block py-0.5 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {t('links.guides')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Project Links (Col 2 on mobile) */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              {t('projectTitle')}
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link
                  href="/about"
                  className="inline-block py-0.5 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {t('links.about')}
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/GustavoBaranda/chatflow-agent/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 py-0.5 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <span>{t('links.releases')}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://pypi.org/project/chatflow-agent/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 py-0.5 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <span>{t('links.pypi')}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>

          {/* Community Links (Row 2 Col 1 on mobile) */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              {t('communityTitle')}
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link
                  href="/community"
                  className="inline-block py-0.5 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {t('links.community')}
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/GustavoBaranda/chatflow-agent"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 py-0.5 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <span>{t('links.github')}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/GustavoBaranda/chatflow-agent/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 py-0.5 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <span>{t('links.contributing')}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section: SDK License, Creator Signature, Sponsor & Community Attribution */}
        <div className="mt-8 flex flex-col items-center gap-4 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground sm:mt-10 md:flex-row md:items-center md:justify-between md:text-left">
          <div>
            <p>{t('sdkLicense')}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2.5 text-xs sm:gap-x-4">
            <div className="inline-flex items-center gap-2">
              <a
                href="https://gustavobaranda.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-medium text-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
                aria-label="Gustavo Baranda Personal Website"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/gustavo-baranda.svg"
                  alt="Gustavo Baranda"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain dark:brightness-0 dark:invert transition-opacity hover:opacity-80"
                />
                <span>Gustavo Baranda · © 2026</span>
              </a>
            </div>

            <span className="hidden sm:inline text-muted-foreground/60 select-none">•</span>

            <div className="inline-flex items-center gap-2 sm:gap-3">
              <a
                href="https://github.com/sponsors/GustavoBaranda"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-pink-700 dark:text-pink-300 transition-colors hover:text-pink-600 dark:hover:text-pink-200 focus-visible:outline-2 focus-visible:outline-pink-500"
                aria-label="GitHub Sponsors Gustavo Baranda"
              >
                <Heart className="h-3.5 w-3.5 fill-pink-500 text-pink-500" aria-hidden="true" />
                <span>{t('links.sponsor')}</span>
              </a>
              <span className="text-muted-foreground/60 select-none">•</span>
              <span className="text-muted-foreground">chatflow-agent contributors</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
