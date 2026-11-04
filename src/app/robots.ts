import type { MetadataRoute } from 'next';
import { SITE_ORIGIN } from '@/config/docs-seo';

/**
 * Robots.txt directive configuration for chatflow-agent-web.
 *
 * Allows public crawling of all documentation pages (including prerelease v0.4
 * and fallback pages) so search engines can read and respect the page-level
 * `<meta name="robots" content="noindex, follow" />` directives.
 *
 * Disallows API endpoints while keeping Next.js rendering assets crawlable.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}

