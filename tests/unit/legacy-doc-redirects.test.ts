import { describe, expect, it } from 'vitest';
import { getLegacyDocumentationRedirect } from '@/config/docs-routes-inventory';

const locales = ['en', 'es', 'pt-BR'] as const;

describe('Legacy documentation redirects', () => {
  it.each(locales)('redirects the %s installation route to v0.3', (locale) => {
    expect(
      getLegacyDocumentationRedirect(
        `/${locale}/docs/getting-started/installation`,
        locales,
      ),
    ).toBe(`/${locale}/docs/v0.3/getting-started/installation`);
  });

  it.each(locales)('redirects the %s agents route to v0.3', (locale) => {
    expect(
      getLegacyDocumentationRedirect(`/${locale}/docs/guides/agents`, locales),
    ).toBe(`/${locale}/docs/v0.3/guides/agents`);
  });

  it('does not redirect unknown or versioned paths', () => {
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
