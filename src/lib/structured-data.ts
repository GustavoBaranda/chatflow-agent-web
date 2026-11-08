/**
 * Centralized Schema.org Structured Data (JSON-LD) implementation for chatflow-agent-web.
 *
 * Defines type-safe, canonical Schema.org entities:
 * - SoftwareSourceCode: The authoritative open-source Python library
 * - SoftwareApplication: Developer framework and runtime distribution
 * - Person: Gustavo Baranda, Creator & Lead Maintainer
 * - WebSite: Official documentation platform
 * - BreadcrumbList: Hierarchical navigation trails
 * - TechArticle: Documentation pages
 *
 * All entities rely strictly on verified, authentic project attributes with zero fabrications.
 */

import { SITE_ORIGIN } from '@/config/docs-seo';
import { type DocVersionTrack, DEFAULT_STABLE_TRACK } from '@/config/docs-versions';

export const AUTHOR_ID = `${SITE_ORIGIN}/#author`;
export const SOURCE_CODE_ID = `${SITE_ORIGIN}/#software-source-code`;
export const APPLICATION_ID = `${SITE_ORIGIN}/#software-application`;
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;

export const GITHUB_REPO_URL = 'https://github.com/GustavoBaranda/chatflow-agent';
export const CREATOR_GITHUB_URL = 'https://github.com/GustavoBaranda';
export const PYPI_PACKAGE_URL = 'https://pypi.org/project/chatflow-agent/';
export const LICENSE_URL = 'https://opensource.org/licenses/MIT';
export const STABLE_SDK_VERSION = '0.3.4';

export const SECTION_NAMES: Record<string, Record<string, string>> = {
  'getting-started': {
    en: 'Getting Started',
    es: 'Primeros Pasos',
    'pt-BR': 'Primeiros Passos',
  },
  guides: {
    en: 'Guides',
    es: 'Guías',
    'pt-BR': 'Guias',
  },
  providers: {
    en: 'Providers',
    es: 'Proveedores',
    'pt-BR': 'Provedores',
  },
  integrations: {
    en: 'Integrations',
    es: 'Integraciones',
    'pt-BR': 'Integrações',
  },
  production: {
    en: 'Production',
    es: 'Producción',
    'pt-BR': 'Produção',
  },
};

export const NAV_LABELS: Record<string, Record<string, string>> = {
  home: {
    en: 'Home',
    es: 'Inicio',
    'pt-BR': 'Início',
  },
  docs: {
    en: 'Documentation',
    es: 'Documentación',
    'pt-BR': 'Documentação',
  },
  about: {
    en: 'About',
    es: 'Acerca de',
    'pt-BR': 'Sobre',
  },
  community: {
    en: 'Community',
    es: 'Comunidad',
    'pt-BR': 'Comunidade',
  },
};

/**
 * Safely stringifies JSON-LD data for script tag embedding,
 * escaping '<' as '\u003c' to prevent HTML script breaking or injection.
 */
export function safeJsonLdReplacer(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/**
 * Authoritative Person entity representing the creator & lead maintainer.
 */
export function getPersonEntity(): Record<string, unknown> {
  return {
    '@type': 'Person',
    '@id': AUTHOR_ID,
    name: 'Gustavo Baranda',
    jobTitle: 'Creator & Lead Maintainer',
    url: CREATOR_GITHUB_URL,
    sameAs: [CREATOR_GITHUB_URL],
  };
}

/**
 * Authoritative SoftwareSourceCode entity representing the Python library repository.
 */
export function getSoftwareSourceCodeEntity(locale: string): Record<string, unknown> {
  let description =
    'Open-source Python library for conversational AI agents, tools, sessions, and multi-channel orchestration.';
  if (locale === 'es') {
    description =
      'Librería Python de código abierto para agentes conversacionales de IA, herramientas, sesiones y orquestación multicanal.';
  } else if (locale === 'pt-BR') {
    description =
      'Biblioteca Python de código aberto para agentes de IA conversacional, ferramentas, sessões e orquestração multicanal.';
  }

  return {
    '@type': 'SoftwareSourceCode',
    '@id': SOURCE_CODE_ID,
    name: 'chatflow-agent',
    description,
    programmingLanguage: {
      '@type': 'ComputerLanguage',
      name: 'Python',
      version: '3.10',
    },
    runtimePlatform: 'Python >=3.10',
    codeRepository: GITHUB_REPO_URL,
    license: LICENSE_URL,
    version: STABLE_SDK_VERSION,
    author: { '@id': AUTHOR_ID },
    maintainer: { '@id': AUTHOR_ID },
    targetProduct: { '@id': APPLICATION_ID },
  };
}

/**
 * SoftwareApplication entity representing the package on PyPI.
 */
export function getSoftwareApplicationEntity(locale: string): Record<string, unknown> {
  let description =
    'Production-grade framework for multi-agent workflows, state persistence, and conversational messaging in Python.';
  if (locale === 'es') {
    description =
      'Framework para flujos de trabajo multiagente, persistencia de estado y mensajería conversacional en Python.';
  } else if (locale === 'pt-BR') {
    description =
      'Framework para fluxos de trabalho multiagente, persistência de estado e mensagens conversacionais em Python.';
  }

  return {
    '@type': 'SoftwareApplication',
    '@id': APPLICATION_ID,
    name: 'chatflow-agent',
    description,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Cross-platform (Linux, macOS, Windows)',
    softwareVersion: STABLE_SDK_VERSION,
    license: LICENSE_URL,
    downloadUrl: PYPI_PACKAGE_URL,
    installUrl: PYPI_PACKAGE_URL,
    author: { '@id': AUTHOR_ID },
  };
}

/**
 * Authoritative WebSite entity for chatflowagent.org.
 */
export function getWebSiteEntity(): Record<string, unknown> {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'chatflow-agent',
    url: SITE_ORIGIN,
    inLanguage: ['en', 'es', 'pt-BR'],
    publisher: { '@id': AUTHOR_ID },
  };
}

/**
 * Creates a schema.org BreadcrumbList from an ordered array of navigation items.
 */
export function createBreadcrumbList(
  items: Array<{ name: string; url?: string }>
): Record<string, unknown> {
  const linkedItems = items.filter(
    (item): item is { name: string; url: string } => {
      if (!item.url) {
        return false;
      }

      try {
        const url = new URL(item.url);
        return url.protocol === 'https:' || url.protocol === 'http:';
      } catch {
        return false;
      }
    }
  );

  return {
    '@type': 'BreadcrumbList',
    itemListElement: linkedItems.map((item, index) => {
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      };
    }),
  };
}

/**
 * Structured data graph for Home page.
 */
export function getHomeStructuredData(locale: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      getWebSiteEntity(),
      getPersonEntity(),
      getSoftwareSourceCodeEntity(locale),
      getSoftwareApplicationEntity(locale),
    ],
  };
}

/**
 * Structured data graph for About page.
 */
export function getAboutStructuredData(locale: string): Record<string, unknown> {
  const homeLabel = NAV_LABELS.home[locale] ?? 'Home';
  const aboutLabel = NAV_LABELS.about[locale] ?? 'About';

  return {
    '@context': 'https://schema.org',
    '@graph': [
      createBreadcrumbList([
        { name: homeLabel, url: `${SITE_ORIGIN}/${locale}` },
        { name: aboutLabel, url: `${SITE_ORIGIN}/${locale}/about` },
      ]),
      getPersonEntity(),
      {
        '@type': 'WebPage',
        '@id': `${SITE_ORIGIN}/${locale}/about#webpage`,
        url: `${SITE_ORIGIN}/${locale}/about`,
        name: `${aboutLabel} | chatflow-agent`,
        inLanguage: locale,
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': AUTHOR_ID },
      },
    ],
  };
}

/**
 * Structured data graph for Community page.
 */
export function getCommunityStructuredData(locale: string): Record<string, unknown> {
  const homeLabel = NAV_LABELS.home[locale] ?? 'Home';
  const communityLabel = NAV_LABELS.community[locale] ?? 'Community';

  return {
    '@context': 'https://schema.org',
    '@graph': [
      createBreadcrumbList([
        { name: homeLabel, url: `${SITE_ORIGIN}/${locale}` },
        { name: communityLabel, url: `${SITE_ORIGIN}/${locale}/community` },
      ]),
      {
        '@type': 'WebPage',
        '@id': `${SITE_ORIGIN}/${locale}/community#webpage`,
        url: `${SITE_ORIGIN}/${locale}/community`,
        name: `${communityLabel} | chatflow-agent`,
        inLanguage: locale,
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': SOURCE_CODE_ID },
      },
    ],
  };
}

export interface DocStructuredDataOptions {
  title: string;
  description: string;
  canonicalUrl: string;
  locale: string;
  track: DocVersionTrack;
  cleanSlug: string[];
}

/**
 * Structured data graph for individual documentation pages.
 */
export function getDocStructuredData({
  title,
  description,
  canonicalUrl,
  locale,
  track,
  cleanSlug,
}: DocStructuredDataOptions): Record<string, unknown> {
  const homeLabel = NAV_LABELS.home[locale] ?? 'Home';
  const docsLabel = NAV_LABELS.docs[locale] ?? 'Documentation';
  const trackBadge = track === DEFAULT_STABLE_TRACK ? 'v0.3' : 'v0.4';

  const breadcrumbs: Array<{ name: string; url?: string }> = [
    { name: homeLabel, url: `${SITE_ORIGIN}/${locale}` },
    {
      name: `${docsLabel} (${trackBadge})`,
      url: `${SITE_ORIGIN}/${locale}/docs/${track}`,
    },
  ];

  if (cleanSlug.length > 0) {
    const sectionKey = cleanSlug[0];
    const sectionName = SECTION_NAMES[sectionKey]?.[locale] ?? sectionKey;

    if (cleanSlug.length === 1) {
      // Direct topic or single-slug page
      breadcrumbs.push({
        name: title,
        url: canonicalUrl,
      });
    } else {
      // Nested section page: [section, topic]
      // providers has its own real index page at /[locale]/docs/[track]/providers
      const sectionUrl =
        sectionKey === 'providers'
          ? `${SITE_ORIGIN}/${locale}/docs/${track}/providers`
          : undefined;

      breadcrumbs.push({
        name: sectionName,
        url: sectionUrl,
      });

      breadcrumbs.push({
        name: title,
        url: canonicalUrl,
      });
    }
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      createBreadcrumbList(breadcrumbs),
      {
        '@type': 'TechArticle',
        '@id': `${canonicalUrl}#article`,
        headline: title,
        description,
        url: canonicalUrl,
        inLanguage: locale,
        mainEntityOfPage: canonicalUrl,
        author: { '@id': AUTHOR_ID },
        publisher: { '@id': AUTHOR_ID },
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': SOURCE_CODE_ID },
      },
    ],
  };
}

