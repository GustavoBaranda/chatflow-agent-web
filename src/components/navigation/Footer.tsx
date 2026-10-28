import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-card text-muted-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-sm font-semibold text-foreground">chatflow-agent</span>
            <p className="mt-1 max-w-md text-xs text-muted-foreground">
              {t('tagline')}
            </p>
          </div>

          <nav className="flex flex-wrap gap-4 text-xs" aria-label="Footer navigation">
            <Link href="/docs" className="hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary">
              {t('links.documentation')}
            </Link>
            <Link href="/community" className="hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary">
              {t('links.contributing')}
            </Link>
            <a
              href="https://github.com/GustavoBaranda/chatflow-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
            >
              {t('links.github')}
            </a>
          </nav>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-2 border-t border-border/60 pt-4 text-[11px] sm:flex-row sm:items-center">
          <p>{t('copyright', { year })}</p>
          <p>{t('license')}</p>
        </div>
      </div>
    </footer>
  );
}
