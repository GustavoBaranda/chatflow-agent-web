import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { NextIntlClientProvider } from 'next-intl';
import { VersionSelector } from '@/components/docs/VersionSelector';
import enMessages from '../../messages/en.json';
import esMessages from '../../messages/es.json';
import ptBRMessages from '../../messages/pt-BR.json';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/en/docs/v0.3/guides/agents',
}));

describe('VersionSelector Component Unit Tests', () => {
  it('renders active stable track (v0.3) button with badge and SDK version', () => {
    const html = renderToString(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <VersionSelector />
      </NextIntlClientProvider>,
    );

    expect(html).toContain('v0.3');
    expect(html).toContain('Stable');
    expect(html).toContain('0.3.4');
    expect(html).toContain('aria-haspopup="listbox"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('data-testid="version-selector-trigger"');
  });

  it('renders localized trigger in Spanish', () => {
    const html = renderToString(
      <NextIntlClientProvider locale="es" messages={esMessages}>
        <VersionSelector />
      </NextIntlClientProvider>,
    );

    expect(html).toContain('v0.3');
    expect(html).toContain('Stable');
    expect(html).toContain('aria-label="Cambiar versión de la documentación"');
  });

  it('renders localized trigger in Brazilian Portuguese', () => {
    const html = renderToString(
      <NextIntlClientProvider locale="pt-BR" messages={ptBRMessages}>
        <VersionSelector />
      </NextIntlClientProvider>,
    );

    expect(html).toContain('v0.3');
    expect(html).toContain('Stable');
    expect(html).toContain('aria-label="Mudar versão da documentação"');
  });
});
