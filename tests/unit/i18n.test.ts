import { describe, it, expect } from 'vitest';
import { SUPPORTED_LANGUAGES, SUPPORTED_LOCALES, DEFAULT_LOCALE, getLanguage } from '@/config/languages';
import { routing } from '@/i18n/routing';
import enMessages from '../../messages/en.json';
import esMessages from '../../messages/es.json';

describe('i18n Configuration & Routing', () => {
  it('should support English and Spanish locales', () => {
    expect(SUPPORTED_LOCALES).toContain('en');
    expect(SUPPORTED_LOCALES).toContain('es');
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
    expect(en.direction).toBe('ltr');

    const es = getLanguage('es');
    expect(es.name).toBe('Spanish');
    expect(es.localName).toBe('Español');
    expect(es.direction).toBe('ltr');

    const fallback = getLanguage('unknown');
    expect(fallback.code).toBe('en');
  });

  it('should have 100% translation key parity between English and Spanish catalogs', () => {
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

    expect(esKeys).toEqual(enKeys);
  });
});

