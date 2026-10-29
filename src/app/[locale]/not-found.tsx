import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function NotFoundPage() {
  const t = useTranslations('notFound');

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <div className="max-w-md space-y-4">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          404
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {t('title')}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {t('description')}
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-primary"
          >
            {t('returnHome')}
          </Link>
        </div>
      </div>
    </main>
  );
}

