import { useTranslations } from 'next-intl';
import { GitFork, Radio, Layers, Database, Zap, Wrench } from 'lucide-react';

export function FeaturesSection() {
  const t = useTranslations('home');

  const features = [
    {
      title: t('featHandoffsTitle'),
      description: t('featHandoffsDesc'),
      icon: GitFork,
      color: 'text-violet-500 bg-violet-500/10',
    },
    {
      title: t('featChannelsTitle'),
      description: t('featChannelsDesc'),
      icon: Radio,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      title: t('featModelsTitle'),
      description: t('featModelsDesc'),
      icon: Layers,
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      title: t('featMemoryTitle'),
      description: t('featMemoryDesc'),
      icon: Database,
      color: 'text-cyan-500 bg-cyan-500/10',
    },
    {
      title: t('featAsyncTitle'),
      description: t('featAsyncDesc'),
      icon: Zap,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      title: t('featToolsTitle'),
      description: t('featToolsDesc'),
      icon: Wrench,
      color: 'text-fuchsia-500 bg-fuchsia-500/10',
    },
  ];

  return (
    <section aria-labelledby="features-title" className="py-12 sm:py-16 border-t border-border/80">
      <div className="mx-auto max-w-4xl text-center">
        <h2 id="features-title" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t('featuresTitle')}
        </h2>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          {t('featuresSubtitle')}
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <article
              key={idx}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${feature.color}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground flex-1">
                {feature.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
