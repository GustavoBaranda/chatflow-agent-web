import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { NextIntlClientProvider } from 'next-intl';
import { PrereleaseBanner } from '@/components/docs/PrereleaseBanner';
import enMessages from '../../messages/en.json';
import esMessages from '../../messages/es.json';
import ptBRMessages from '../../messages/pt-BR.json';

describe('PrereleaseBanner Component Unit Tests', () => {
  it('renders prerelease banner with exact SDK 0.4.0rc1 version and RC1 badge', () => {
    const html = renderToString(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <PrereleaseBanner locale="en" currentSlug={['guides', 'agents']} />
      </NextIntlClientProvider>,
    );

    expect(html).toContain('Prerelease Documentation (v0.4.0rc1)');
    expect(html).toContain('RC1');
    expect(html).toContain('0.4.0rc1');
    expect(html).toContain('Switch to stable documentation (v0.3.4)');
    expect(html).toContain('href="/en/docs/v0.3/guides/agents"');
    expect(html).toContain('data-testid="prerelease-banner"');
    expect(html).toContain('role="status"');
  });

  it('preserves existing topic when generating stable switch link', () => {
    const html = renderToString(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <PrereleaseBanner locale="en" currentSlug={['production', 'error-handling']} />
      </NextIntlClientProvider>,
    );

    expect(html).toContain('href="/en/docs/v0.3/production/error-handling"');
  });

  it('falls back to stable overview when current topic does not exist in v0.3', () => {
    const html = renderToString(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <PrereleaseBanner locale="en" currentSlug={['unreleased-feature-xyz']} />
      </NextIntlClientProvider>,
    );

    expect(html).toContain('href="/en/docs/v0.3"');
  });

  it('renders localized in Spanish with correct locale link', () => {
    const html = renderToString(
      <NextIntlClientProvider locale="es" messages={esMessages}>
        <PrereleaseBanner locale="es" currentSlug={['guides', 'agents']} />
      </NextIntlClientProvider>,
    );

    expect(html).toContain('Documentación de Versión Preliminar (v0.4.0rc1)');
    expect(html).toContain('Cambiar a la documentación estable (v0.3.4)');
    expect(html).toContain('href="/es/docs/v0.3/guides/agents"');
  });

  it('renders localized in Brazilian Portuguese with correct locale link', () => {
    const html = renderToString(
      <NextIntlClientProvider locale="pt-BR" messages={ptBRMessages}>
        <PrereleaseBanner locale="pt-BR" currentSlug={['guides', 'agents']} />
      </NextIntlClientProvider>,
    );

    expect(html).toContain('Documentação de Versão Pré-lançamento (v0.4.0rc1)');
    expect(html).toContain('Mudar para a documentação estável (v0.3.4)');
    expect(html).toContain('href="/pt-BR/docs/v0.3/guides/agents"');
  });
});
