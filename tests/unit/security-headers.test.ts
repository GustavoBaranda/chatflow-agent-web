import { describe, it, expect, afterEach, vi } from 'vitest';
import nextConfigModule from '../../next.config.mjs';
import {
  applySecurityHeaders,
  getSecurityHeaders,
  getCspDirectives,
  getContentSecurityPolicy,
} from '../../src/config/security-headers';

describe('HTTP Security Headers Suite (Phase 7B / 7C)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defines a headers function in next.config.mjs', () => {
    expect(typeof nextConfigModule).toBe('object');
    expect(typeof nextConfigModule?.headers).toBe('function');
  });

  it('matches all incoming pathnames with /:path*', async () => {
    expect(nextConfigModule.headers).toBeDefined();
    const headerConfigs = (await nextConfigModule.headers!()) as Array<{
      source: string;
      headers: Array<{ key: string; value: string }>;
    }>;
    expect(Array.isArray(headerConfigs)).toBe(true);
    expect(headerConfigs.length).toBeGreaterThan(0);

    const wildcardRule = headerConfigs.find((c) => c.source === '/:path*');
    expect(wildcardRule).toBeDefined();
    expect(Array.isArray(wildcardRule?.headers)).toBe(true);
  });

  it('includes mandatory Content-Type-Options: nosniff header', async () => {
    const headerConfigs = (await nextConfigModule.headers!()) as Array<{
      source: string;
      headers: Array<{ key: string; value: string }>;
    }>;
    const headers = headerConfigs[0]?.headers ?? [];
    const ctHeader = headers.find((h) => h.key === 'X-Content-Type-Options');
    expect(ctHeader).toBeDefined();
    expect(ctHeader?.value).toBe('nosniff');
  });

  it('includes frame protection header (X-Frame-Options: SAMEORIGIN)', async () => {
    const headerConfigs = (await nextConfigModule.headers!()) as Array<{
      source: string;
      headers: Array<{ key: string; value: string }>;
    }>;
    const headers = headerConfigs[0]?.headers ?? [];
    const frameHeader = headers.find((h) => h.key === 'X-Frame-Options');
    expect(frameHeader).toBeDefined();
    expect(frameHeader?.value).toBe('SAMEORIGIN');
  });

  it('includes strict Referrer-Policy header', async () => {
    const headerConfigs = (await nextConfigModule.headers!()) as Array<{
      source: string;
      headers: Array<{ key: string; value: string }>;
    }>;
    const headers = headerConfigs[0]?.headers ?? [];
    const refHeader = headers.find((h) => h.key === 'Referrer-Policy');
    expect(refHeader).toBeDefined();
    expect(refHeader?.value).toBe('strict-origin-when-cross-origin');
  });

  it('includes Permissions-Policy restricting sensitive browser features without unrecognized browsing-topics', async () => {
    const headerConfigs = (await nextConfigModule.headers!()) as Array<{
      source: string;
      headers: Array<{ key: string; value: string }>;
    }>;
    const headers = headerConfigs[0]?.headers ?? [];
    const permHeader = headers.find((h) => h.key === 'Permissions-Policy');
    expect(permHeader).toBeDefined();
    expect(permHeader?.value).toContain('camera=()');
    expect(permHeader?.value).toContain('microphone=()');
    expect(permHeader?.value).toContain('geolocation=()');
    // Ensure unsupported / non-standard browsing-topics directive is removed to prevent browser console warnings
    expect(permHeader?.value).not.toContain('browsing-topics');
    expect(permHeader?.value).toBe('camera=(), microphone=(), geolocation=()');
  });

  it('configures strict Content-Security-Policy (CSP) in production without unsafe-eval', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const headerConfigs = (await nextConfigModule.headers!()) as Array<{
      source: string;
      headers: Array<{ key: string; value: string }>;
    }>;
    const headers = headerConfigs[0]?.headers ?? [];
    const cspHeader = headers.find((h) => h.key === 'Content-Security-Policy');
    expect(cspHeader).toBeDefined();

    const csp = cspHeader?.value ?? '';
    // Core origin directives
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("img-src 'self' data: blob: https:");
    expect(csp).toContain("font-src 'self' data:");
    expect(csp).toContain("connect-src 'self'");

    // Hardening directives
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");

    // HSTS header in production
    const hstsHeader = headers.find((h) => h.key === 'Strict-Transport-Security');
    expect(hstsHeader).toBeDefined();
    expect(hstsHeader?.value).toBe('max-age=31536000');
  });

  it('allows unsafe-eval in development CSP to support Next.js Fast Refresh and HMR runtime', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const headerConfigs = (await nextConfigModule.headers!()) as Array<{
      source: string;
      headers: Array<{ key: string; value: string }>;
    }>;
    const headers = headerConfigs[0]?.headers ?? [];
    const cspHeader = headers.find((h) => h.key === 'Content-Security-Policy');
    expect(cspHeader).toBeDefined();

    const csp = cspHeader?.value ?? '';
    // Must contain unsafe-eval in development for React Refresh eval()
    expect(csp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");

    // Must NOT weaken other core security directives
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");

    // HSTS should NOT be present in development
    const hstsHeader = headers.find((h) => h.key === 'Strict-Transport-Security');
    expect(hstsHeader).toBeUndefined();
  });

  it('validates security-headers module helper functions and application logic', () => {
    // Production directives
    const prodCsp = getContentSecurityPolicy(true);
    expect(prodCsp).toContain("script-src 'self' 'unsafe-inline'");
    expect(prodCsp).not.toContain("'unsafe-eval'");

    // Development directives
    const devCsp = getContentSecurityPolicy(false);
    expect(devCsp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");

    // Header application
    const mockHeaders = new Headers();
    applySecurityHeaders(mockHeaders, true);
    expect(mockHeaders.get('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
    expect(mockHeaders.get('Content-Security-Policy')).toBe(prodCsp);

    const devHeaders = new Headers();
    applySecurityHeaders(devHeaders, false);
    expect(devHeaders.get('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
    expect(devHeaders.get('Content-Security-Policy')).toBe(devCsp);
  });

  it('disables the poweredByHeader to prevent Next.js framework fingerprinting', () => {
    expect(nextConfigModule.poweredByHeader).toBe(false);
  });
});
