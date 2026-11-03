import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from 'fumadocs-ui/page';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Callout } from 'fumadocs-ui/components/callout';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { source, resolveDocPage } from '@/lib/source';
import { TranslationNotice } from '@/components/docs/TranslationNotice';
import { OutdatedNotice } from '@/components/docs/OutdatedNotice';
import { VersionBadge } from '@/components/docs/VersionBadge';
import { PrereleaseBanner } from '@/components/docs/PrereleaseBanner';
import { DEFAULT_STABLE_TRACK } from '@/config/docs-versions';
import { resolveDocSeo, createSocialMetadata } from '@/config/docs-seo';
import type { Metadata } from 'next';

const customMdxComponents = {
  ...defaultMdxComponents,
  Card,
  Cards,
  Callout,
  Tab,
  Tabs,
  Step,
  Steps,
  VersionBadge,
};

interface PageProps {
  params: Promise<{
    locale: string;
    slug?: string[];
  }>;
}

export async function generateStaticParams() {
  const versionedParams = source.generateParams('slug', 'locale');

  // For every stable track page ['v0.3', ...rest], also generate the unversioned alias [...rest]
  const unversionedParams = versionedParams
    .filter((p) => Array.isArray(p.slug) && p.slug[0] === DEFAULT_STABLE_TRACK)
    .map((p) => ({
      locale: p.locale,
      slug: (p.slug as string[]).slice(1),
    }));

  return [...versionedParams, ...unversionedParams];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug = [] } = await params;
  setRequestLocale(locale);

  const { page, isFallback, isExplicitTrack, track, cleanSlug } = resolveDocPage(slug, locale);

  if (!page) {
    return {
      title: 'Documentation Not Found | chatflow-agent',
    };
  }

  const seo = resolveDocSeo({
    track,
    cleanSlug,
    locale,
    isExplicitTrack,
    isFallback,
  });

  const social = createSocialMetadata({
    title: `${page.data.title} | chatflow-agent`,
    description: page.data.description ?? '',
    url: seo.canonicalUrl,
    locale,
  });

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: seo.canonicalUrl,
      languages: seo.languages,
    },
    robots: seo.robots,
    openGraph: social.openGraph,
    twitter: social.twitter,
  };
}

export default async function Page({ params }: PageProps) {
  const { locale, slug = [] } = await params;
  setRequestLocale(locale);

  const { page, targetSlug, isFallback, track, cleanSlug } = resolveDocPage(slug, locale);

  if (!page) {
    notFound();
  }

  const MDX = page.data.body;
  const cleanNoticeSlug = targetSlug.join('/');

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>

      {isFallback && (
        <TranslationNotice targetLocale={locale} slug={cleanNoticeSlug} />
      )}

      {track === 'v0.4' && (
        <PrereleaseBanner locale={locale} currentSlug={cleanSlug} />
      )}

      <DocsBody>
        <MDX components={customMdxComponents} />
      </DocsBody>
    </DocsPage>
  );
}
