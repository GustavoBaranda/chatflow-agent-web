import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from 'fumadocs-ui/page';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { source } from '@/lib/source';
import { TranslationNotice } from '@/components/docs/TranslationNotice';
import { OutdatedNotice } from '@/components/docs/OutdatedNotice';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    locale: string;
    slug?: string[];
  }>;
}

export async function generateStaticParams() {
  return source.generateParams('slug', 'locale');
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug = [] } = await params;
  setRequestLocale(locale);

  let page = source.getPage(slug, locale);
  let isFallback = false;

  if (!page && locale !== 'en') {
    page = source.getPage(slug, 'en');
    isFallback = true;
  }

  if (!page) {
    return {
      title: 'Documentation Not Found | chatflow-agent',
    };
  }

  const cleanSlug = slug.join('/');
  const canonicalPath = `/${locale}/docs${cleanSlug ? `/${cleanSlug}` : ''}`;

  const languages: Record<string, string> = {};
  for (const l of ['en', 'es', 'pt-BR']) {
    const localizedPage = source.getPage(slug, l);
    if (localizedPage) {
      languages[l] = `/${l}/docs${cleanSlug ? `/${cleanSlug}` : ''}`;
    }
  }

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: canonicalPath,
      languages,
    },
    robots: isFallback
      ? {
          index: false,
          follow: true,
        }
      : undefined,
  };
}

export default async function Page({ params }: PageProps) {
  const { locale, slug = [] } = await params;
  setRequestLocale(locale);

  let page = source.getPage(slug, locale);
  let isFallback = false;

  if (!page && locale !== 'en') {
    page = source.getPage(slug, 'en');
    isFallback = true;
  }

  if (!page) {
    notFound();
  }

  const MDX = page.data.body;
  const cleanSlug = slug.join('/');

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>

      {isFallback && (
        <TranslationNotice targetLocale={locale} slug={cleanSlug} />
      )}

      <DocsBody>
        <MDX components={defaultMdxComponents} />
      </DocsBody>
    </DocsPage>
  );
}
