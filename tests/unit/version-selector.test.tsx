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
  usePathname: () => '/en/docs/v0.4/guides/agents',
  useRouter: () => ({ push: vi.fn() }),
}));

describe('VersionSelector Component Unit Tests', () => {
  it('renders active Latest / Stable track (v0.4) button with badge and SDK version 0.4.0', () => {
    const html = renderToString(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <VersionSelector />
      </NextIntlClientProvider>,
    );

    expect(html).toContain('v0.4');
    expect(html).toContain('Latest / Stable');
    expect(html).toContain('0.4.0');
    expect(html).not.toContain('0.4.0rc1');
    expect(html).not.toContain('RC1');
    expect(html).toContain('aria-haspopup="listbox"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('data-testid="version-selector-trigger"');
  });

  it('renders Previous Stable track (v0.3) when currentTrack="v0.3" is passed', () => {
    const html = renderToString(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <VersionSelector currentTrack="v0.3" />
      </NextIntlClientProvider>,
    );

    expect(html).toContain('v0.3');
    expect(html).toContain('Previous Stable');
    expect(html).toContain('0.3.4');
  });

  it('renders localized trigger in Spanish', () => {
    const html = renderToString(
      <NextIntlClientProvider locale="es" messages={esMessages}>
        <VersionSelector />
      </NextIntlClientProvider>,
    );

    expect(html).toContain('v0.4');
    expect(html).toContain('Latest / Stable');
    expect(html).toContain('aria-label="Cambiar versión de la documentación"');
  });

  it('renders localized trigger in Brazilian Portuguese', () => {
    const html = renderToString(
      <NextIntlClientProvider locale="pt-BR" messages={ptBRMessages}>
        <VersionSelector />
      </NextIntlClientProvider>,
    );

    expect(html).toContain('v0.4');
    expect(html).toContain('Latest / Stable');
    expect(html).toContain('aria-label="Mudar versão da documentação"');
  });
});
