import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ExternalLink } from 'lucide-react';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="w-full border-t border-border bg-card text-muted-foreground">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Top Multi-column Section */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Mission (2 cols on lg) */}
          <div className="lg:col-span-2">
            <span className="text-base font-bold text-foreground">chatflow-agent</span>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
              {t('tagline')}
            </p>
          </div>

          {/* Explore Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              {t('exploreTitle')}
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link
                  href="/docs"
                  className="transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {t('links.documentation')}
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/v0.3/getting-started/quickstart"
                  className="transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {t('links.quickstart')}
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/v0.3/guides/agents"
                  className="transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {t('links.guides')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Project Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              {t('projectTitle')}
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link
                  href="/about"
                  className="transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {t('links.about')}
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/GustavoBaranda/chatflow-agent/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
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
                  className="inline-flex items-center gap-1 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <span>{t('links.pypi')}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              {t('communityTitle')}
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link
                  href="/community"
                  className="transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {t('links.community')}
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/GustavoBaranda/chatflow-agent"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
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
                  className="inline-flex items-center gap-1 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <span>{t('links.contributing')}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section: Licenses, Creator Signature & Community Attribution */}
        <div className="mt-10 flex flex-col gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p>{t('sdkLicense')}</p>
            <p>{t('webLicense')}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
                className="h-7 w-7 object-contain dark:invert transition-opacity hover:opacity-80"
              />
              <span>Gustavo Baranda · © 2026</span>
            </a>
            <span className="text-muted-foreground/60 select-none">•</span>
            <span className="text-muted-foreground">chatflow-agent contributors</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
