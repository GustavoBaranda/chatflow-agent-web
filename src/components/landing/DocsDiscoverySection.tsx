import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { BookOpen, GitFork, Radio, ArrowRight } from 'lucide-react';

export function DocsDiscoverySection() {
  const t = useTranslations('home');

  const cards = [
    {
      title: t('docCard1Title'),
      description: t('docCard1Desc'),
      action: t('docCard1Action'),
      href: '/docs/v0.3/getting-started/installation',
      icon: BookOpen,
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      title: t('docCard2Title'),
      description: t('docCard2Desc'),
      action: t('docCard2Action'),
      href: '/docs/v0.3/guides/agents',
      icon: GitFork,
      color: 'text-violet-500 bg-violet-500/10',
    },
    {
      title: t('docCard3Title'),
      description: t('docCard3Desc'),
      action: t('docCard3Action'),
      href: '/docs/v0.3/integrations/webhook',
      icon: Radio,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
  ];

  return (
    <section aria-labelledby="docs-discovery-title" className="py-12 sm:py-16 border-t border-border/80">
      <div className="mx-auto max-w-4xl text-center">
        <h2 id="docs-discovery-title" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t('docsDiscoveryTitle')}
        </h2>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          {t('docsDiscoverySubtitle')}
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 max-w-6xl mx-auto">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <article
              key={idx}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:shadow-md hover:border-primary/40"
            >
              <div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.color}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-foreground">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {card.description}
                </p>
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <Link
                  href={card.href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <span>{card.action}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
