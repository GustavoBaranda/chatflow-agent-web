import { describe, it, expect } from 'vitest';
import nextConfigModule from '../../next.config.mjs';

describe('HTTP Security Headers Suite (Phase 7B)', () => {
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

  it('includes Permissions-Policy restricting sensitive browser features', async () => {
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
  });

  it('configures a comprehensive, non-breaking Content-Security-Policy (CSP)', async () => {
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
    expect(csp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("img-src 'self' data: blob: https:");
    expect(csp).toContain("font-src 'self' data:");
    expect(csp).toContain("connect-src 'self'");

    // Hardening directives
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
  });
});
