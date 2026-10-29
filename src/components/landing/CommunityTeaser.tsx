import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Heart, Sparkles } from 'lucide-react';

export function CommunityTeaser() {
  const t = useTranslations('home');

  return (
    <section aria-labelledby="community-teaser-title" className="py-12 sm:py-16 border-t border-border/80">
      <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-gradient-to-b from-card to-card/50 p-8 sm:p-10 shadow-xs text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3.5 py-1 text-xs font-semibold text-muted-foreground">
          <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" aria-hidden="true" />
          <span>Open Source</span>
        </div>

        <h2 id="community-teaser-title" className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t('communityTeaserTitle')}
        </h2>

        <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed text-muted-foreground">
          {t('communityTeaserDesc')}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span>{t('learnMoreAbout')}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>

          <span className="hidden sm:inline text-border" aria-hidden="true">|</span>

          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
          >
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>{t('joinCommunity')}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
