import { describe, it, expect } from 'vitest';
import { SUPPORTED_LANGUAGES, SUPPORTED_LOCALES, DEFAULT_LOCALE, getLanguage } from '@/config/languages';
import { routing } from '@/i18n/routing';
import enMessages from '../../messages/en.json';
import esMessages from '../../messages/es.json';
import ptBRMessages from '../../messages/pt-BR.json';

describe('i18n Configuration & Routing', () => {
  it('should support English, Spanish, and Brazilian Portuguese launch locales', () => {
    expect(SUPPORTED_LOCALES).toContain('en');
    expect(SUPPORTED_LOCALES).toContain('es');
    expect(SUPPORTED_LOCALES).toContain('pt-BR');
    expect(SUPPORTED_LANGUAGES).toHaveLength(3);
  });

  it('should set English as the authoritative default locale', () => {
    expect(DEFAULT_LOCALE).toBe('en');
    expect(routing.defaultLocale).toBe('en');
  });

  it('should enforce explicit locale prefix for all routes', () => {
    expect(routing.localePrefix).toBe('always');
  });

  it('should return correct language metadata with getLanguage', () => {
    const en = getLanguage('en');
    expect(en.name).toBe('English');
    expect(en.localName).toBe('English');
    expect(en.direction).toBe('ltr');

    const es = getLanguage('es');
    expect(es.name).toBe('Spanish');
    expect(es.localName).toBe('Español');
    expect(es.direction).toBe('ltr');

    const ptBR = getLanguage('pt-BR');
    expect(ptBR.name).toBe('Portuguese (Brazil)');
    expect(ptBR.localName).toBe('Português (Brasil)');
    expect(ptBR.direction).toBe('ltr');

    const fallback = getLanguage('unknown');
    expect(fallback.code).toBe('en');
  });

  it('should have 100% translation key parity across English, Spanish, and Brazilian Portuguese catalogs', () => {
    function getKeys(obj: Record<string, unknown>, prefix = ''): string[] {
      return Object.keys(obj).flatMap((key) => {
        const val = obj[key];
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          return getKeys(val as Record<string, unknown>, fullKey);
        }
        return [fullKey];
      });
    }

    const enKeys = getKeys(enMessages as Record<string, unknown>).sort();
    const esKeys = getKeys(esMessages as Record<string, unknown>).sort();
    const ptBRKeys = getKeys(ptBRMessages as Record<string, unknown>).sort();

    expect(esKeys).toEqual(enKeys);
    expect(ptBRKeys).toEqual(enKeys);
  });

  it('should include Creator & Lead Maintainer attribution keys for Gustavo Baranda across all catalogs', () => {
    expect(enMessages.about.creatorName).toBe('Gustavo Baranda');
    expect(esMessages.about.creatorName).toBe('Gustavo Baranda');
    expect(ptBRMessages.about.creatorName).toBe('Gustavo Baranda');

    expect(enMessages.about.creatorTitle).toBeTruthy();
    expect(esMessages.about.creatorTitle).toBeTruthy();
    expect(ptBRMessages.about.creatorTitle).toBeTruthy();
  });
});
