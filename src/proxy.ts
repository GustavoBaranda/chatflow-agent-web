import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import {
  isMaintenanceModeEnabled,
  getMaintenanceRetryAfter,
  isStaticAsset,
} from './lib/maintenance';
import { applySecurityHeaders } from './config/security-headers';
import { getLegacyDocumentationRedirect } from './config/docs-routes-inventory';

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle scheduled maintenance mode when active
  if (isMaintenanceModeEnabled()) {
    // Immediately allow static assets, images, brand assets, and internal bundles
    if (isStaticAsset(pathname)) {
      const response = NextResponse.next();
      applySecurityHeaders(response.headers);
      return response;
    }

    const retryAfter = getMaintenanceRetryAfter();
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0] as (typeof routing.locales)[number] | undefined;
    const isSupportedLocale = firstSegment && routing.locales.includes(firstSegment);
    const targetLocale = isSupportedLocale ? firstSegment : routing.defaultLocale;
    const isMaintenanceRoute = segments[isSupportedLocale ? 1 : 0] === 'maintenance';

    // If already accessing the localized maintenance page directly, render it with HTTP 503
    if (isSupportedLocale && isMaintenanceRoute) {
      const response = intlMiddleware(request);
      response.headers.set('Retry-After', String(retryAfter));
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      applySecurityHeaders(response.headers);
      return new NextResponse(response.body, {
        status: 503,
        statusText: 'Service Unavailable',
        headers: response.headers,
      });
    }

    // Rewrite any other incoming route to the localized maintenance page with HTTP 503
    const maintenanceUrl = new URL(`/${targetLocale}/maintenance`, request.url);
    const headers = new Headers({
      'Retry-After': String(retryAfter),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    });
    applySecurityHeaders(headers);
    return NextResponse.rewrite(maintenanceUrl, {
      status: 503,
      statusText: 'Service Unavailable',
      headers,
    });
  }

  const legacyDocumentationRedirect = getLegacyDocumentationRedirect(
    pathname,
    routing.locales,
  );
  if (legacyDocumentationRedirect) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = legacyDocumentationRedirect;
    const response = NextResponse.redirect(redirectUrl, 308);
    applySecurityHeaders(response.headers);
    return response;
  }

  const response = intlMiddleware(request);
  applySecurityHeaders(response.headers);
  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
