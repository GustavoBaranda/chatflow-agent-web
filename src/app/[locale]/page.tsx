import { setRequestLocale } from 'next-intl/server';
import { HeroSection } from '@/components/landing/HeroSection';
import { CodeShowcase } from '@/components/landing/CodeShowcase';
import { DocsDiscoverySection } from '@/components/landing/DocsDiscoverySection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { CommunityTeaser } from '@/components/landing/CommunityTeaser';
import { JsonLd } from '@/components/seo/JsonLd';
import { getHomeStructuredData } from '@/lib/structured-data';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const structuredData = getHomeStructuredData(locale);

  return (
    <>
      <JsonLd data={structuredData} />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <HeroSection />
          <CodeShowcase />
          <DocsDiscoverySection />
          <FeaturesSection />
          <CommunityTeaser />
        </div>
      </main>
    </>
  );
}
