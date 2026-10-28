import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { AboutSection } from '@/components/landing/AboutSection';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations('common');

  return (
    <main id="main-content" className="flex-1">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        <AboutSection />
      </div>
    </main>
  );
}
