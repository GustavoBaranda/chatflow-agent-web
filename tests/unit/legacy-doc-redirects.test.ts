import { describe, expect, it } from 'vitest';
import { getLegacyDocumentationRedirect } from '@/config/docs-routes-inventory';

const locales = ['en', 'es', 'pt-BR'] as const;

describe('Legacy documentation redirects', () => {
  it.each(locales)('redirects the %s unversioned installation route to v0.4 (Latest / Stable)', (locale) => {
    expect(
      getLegacyDocumentationRedirect(
        `/${locale}/docs/getting-started/installation`,
        locales,
      ),
    ).toBe(`/${locale}/docs/v0.4/getting-started/installation`);
  });

  it.each(locales)('redirects the %s unversioned agents route to v0.4 (Latest / Stable)', (locale) => {
    expect(
      getLegacyDocumentationRedirect(`/${locale}/docs/guides/agents`, locales),
    ).toBe(`/${locale}/docs/v0.4/guides/agents`);
  });

  it.each(locales)('redirects legacy RC and full patch URLs (v0.4.0rc1, v0.4.0, v0.3.4) to canonical tracks', (locale) => {
    expect(
      getLegacyDocumentationRedirect(`/${locale}/docs/v0.4.0rc1/guides/agents`, locales),
    ).toBe(`/${locale}/docs/v0.4/guides/agents`);
    expect(
      getLegacyDocumentationRedirect(`/${locale}/docs/v0.4.0rc2/guides/tools`, locales),
    ).toBe(`/${locale}/docs/v0.4/guides/tools`);
    expect(
      getLegacyDocumentationRedirect(`/${locale}/docs/v0.4.0rc3`, locales),
    ).toBe(`/${locale}/docs/v0.4`);
    expect(
      getLegacyDocumentationRedirect(`/${locale}/docs/v0.4.0/getting-started/quickstart`, locales),
    ).toBe(`/${locale}/docs/v0.4/getting-started/quickstart`);
    expect(
      getLegacyDocumentationRedirect(`/${locale}/docs/v0.3.4/guides/agents`, locales),
    ).toBe(`/${locale}/docs/v0.3/guides/agents`);
  });

  it('does not redirect unknown or canonical versioned paths', () => {
    expect(
      getLegacyDocumentationRedirect('/en/docs/unknown-topic', locales),
    ).toBeUndefined();
    expect(
      getLegacyDocumentationRedirect('/en/docs/v0.3/guides/agents', locales),
    ).toBeUndefined();
    expect(
      getLegacyDocumentationRedirect('/en/docs/v0.4/guides/agents', locales),
    ).toBeUndefined();
  });
});
