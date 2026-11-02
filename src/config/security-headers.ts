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

export const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
] as const;

export const CONTENT_SECURITY_POLICY = CSP_DIRECTIVES.join('; ');

export const SECURITY_HEADERS: SecurityHeader[] = [
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
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'Content-Security-Policy',
    value: CONTENT_SECURITY_POLICY,
  },
];

/**
 * Apply all security headers to a Response or Next/Headers instance.
 */
export function applySecurityHeaders(headers: Headers): void {
  for (const { key, value } of SECURITY_HEADERS) {
    headers.set(key, value);
  }
}
