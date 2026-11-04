/**
 * HTTP Security Headers and Content Security Policy (CSP) Configuration
 *
 * Defines compatible security headers for chatflow-agent-web protecting against
 * clickjacking (X-Frame-Options), MIME-sniffing (X-Content-Type-Options),
 * referrer leakage, unauthorized device permissions, and XSS via an audited CSP.
 */

export interface SecurityHeader {
  key: string;
  value: string;
}

export function getCspDirectives(isProd = process.env.NODE_ENV === 'production'): string[] {
  return [
    "default-src 'self'",
    isProd
      ? "script-src 'self' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
}

export function getContentSecurityPolicy(isProd = process.env.NODE_ENV === 'production'): string {
  return getCspDirectives(isProd).join('; ');
}

export const CSP_DIRECTIVES = getCspDirectives(true) as readonly string[];
export const CONTENT_SECURITY_POLICY = getContentSecurityPolicy(true);

export function getSecurityHeaders(isProd = process.env.NODE_ENV === 'production'): SecurityHeader[] {
  return [
    {
      key: 'X-DNS-Prefetch-Control',
      value: 'on',
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    {
      key: 'X-Frame-Options',
      value: 'SAMEORIGIN',
    },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=()',
    },
    {
      key: 'Content-Security-Policy',
      value: getContentSecurityPolicy(isProd),
    },
  ];
}

export const SECURITY_HEADERS: SecurityHeader[] = getSecurityHeaders(true);

/**
 * Apply all security headers to a Response or Next/Headers instance.
 */
export function applySecurityHeaders(
  headers: Headers,
  isProd = process.env.NODE_ENV === 'production'
): void {
  for (const { key, value } of getSecurityHeaders(isProd)) {
    headers.set(key, value);
  }
}
