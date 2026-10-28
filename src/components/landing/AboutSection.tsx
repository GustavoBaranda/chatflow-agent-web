import { useTranslations } from 'next-intl';
import { GitHubIcon } from '@/components/ui/icons';
import { Users, ExternalLink, Code2 } from 'lucide-react';

export function AboutSection() {
  const t = useTranslations('about');

  return (
    <section aria-labelledby="about-heading" className="mt-20 border-t border-border pt-16">
      <div className="mx-auto max-w-4xl text-center">
        <h2
          id="about-heading"
          className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
        >
          {t('title')}
        </h2>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          {t('subtitle')}
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Creator & Lead Maintainer Card */}
        <article className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-xs transition-shadow hover:shadow-md">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Code2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {t('creatorTitle')}
                </span>
                <h3 className="mt-1 text-lg font-bold text-foreground">
                  {t('creatorName')}
                </h3>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {t('creatorBio')}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <a
              href="https://github.com/GustavoBaranda"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <GitHubIcon className="h-4 w-4" />
              <span>{t('creatorProfile')}</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
            </a>
          </div>
        </article>

        {/* Community & Open Source Card */}
        <article className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-xs transition-shadow hover:shadow-md">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Users className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  Open Source
                </span>
                <h3 className="mt-1 text-lg font-bold text-foreground">
                  {t('communityTitle')}
                </h3>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {t('communityDescription')}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <a
              href="https://github.com/GustavoBaranda/chatflow-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <GitHubIcon className="h-4 w-4" />
              <span>{t('communityContribute')}</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
