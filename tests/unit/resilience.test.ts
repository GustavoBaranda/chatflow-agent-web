import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  isMaintenanceModeEnabled,
  getMaintenanceRetryAfter,
  getMaintenanceEstimatedMinutes,
  isStaticAsset,
} from '@/lib/maintenance';
import enMessages from '../../messages/en.json';
import esMessages from '../../messages/es.json';
import ptBRMessages from '../../messages/pt-BR.json';

describe('Resilience & Maintenance Utilities', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.MAINTENANCE_MODE;
    delete process.env.NEXT_PUBLIC_MAINTENANCE_MODE;
    delete process.env.MAINTENANCE_RETRY_AFTER;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should have maintenance mode disabled by default', () => {
    expect(isMaintenanceModeEnabled()).toBe(false);
  });

  it('should enable maintenance mode when MAINTENANCE_MODE is true', () => {
    process.env.MAINTENANCE_MODE = 'true';
    expect(isMaintenanceModeEnabled()).toBe(true);
  });

  it('should enable maintenance mode when NEXT_PUBLIC_MAINTENANCE_MODE is true', () => {
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE = 'true';
    expect(isMaintenanceModeEnabled()).toBe(true);
  });

  it('should return 3600 seconds (1 hour) default for Retry-After', () => {
    expect(getMaintenanceRetryAfter()).toBe(3600);
    expect(getMaintenanceEstimatedMinutes()).toBe(60);
  });

  it('should parse valid custom Retry-After and calculate estimated minutes', () => {
    process.env.MAINTENANCE_RETRY_AFTER = '1800';
    expect(getMaintenanceRetryAfter()).toBe(1800);
    expect(getMaintenanceEstimatedMinutes()).toBe(30);
  });

  it('should fallback to 3600 when Retry-After is invalid or non-positive', () => {
    process.env.MAINTENANCE_RETRY_AFTER = 'invalid';
    expect(getMaintenanceRetryAfter()).toBe(3600);

    process.env.MAINTENANCE_RETRY_AFTER = '-120';
    expect(getMaintenanceRetryAfter()).toBe(3600);
  });

  it('should correctly exempt static assets from maintenance interception', () => {
    expect(isStaticAsset('/_next/static/chunks/main.js')).toBe(true);
    expect(isStaticAsset('/brand/logo-symbol.svg')).toBe(true);
    expect(isStaticAsset('/favicon.ico')).toBe(true);
    expect(isStaticAsset('/icon.svg')).toBe(true);
    expect(isStaticAsset('/apple-icon.png')).toBe(true);
    expect(isStaticAsset('/maintenance.html')).toBe(true);
    expect(isStaticAsset('/robots.txt')).toBe(true);
    expect(isStaticAsset('/sitemap.xml')).toBe(true);
    expect(isStaticAsset('/images/diagram.png')).toBe(true);

    // Dynamic application routes must not be exempt
    expect(isStaticAsset('/en')).toBe(false);
    expect(isStaticAsset('/es/about')).toBe(false);
    expect(isStaticAsset('/pt-BR/docs')).toBe(false);
    expect(isStaticAsset('/en/community')).toBe(false);
  });

  it('should contain complete localized error and maintenance catalogs across all launch languages', () => {
    const catalogs = [
      { locale: 'en', catalog: enMessages },
      { locale: 'es', catalog: esMessages },
      { locale: 'pt-BR', catalog: ptBRMessages },
    ];

    for (const { locale, catalog } of catalogs) {
      expect(catalog.error, `Missing error namespace in [${locale}]`).toBeDefined();
      expect(catalog.error.badge).toBeTruthy();
      expect(catalog.error.title).toBeTruthy();
      expect(catalog.error.description).toBeTruthy();
      expect(catalog.error.retry).toBeTruthy();
      expect(catalog.error.returnHome).toBeTruthy();
      expect(catalog.error.referenceCode).toBeTruthy();

      expect(catalog.maintenance, `Missing maintenance namespace in [${locale}]`).toBeDefined();
      expect(catalog.maintenance.badge).toBeTruthy();
      expect(catalog.maintenance.title).toBeTruthy();
      expect(catalog.maintenance.description).toBeTruthy();
      expect(catalog.maintenance.retryAfterNotice).toBeTruthy();
      expect(catalog.maintenance.refreshPage).toBeTruthy();
      expect(catalog.maintenance.visitGithub).toBeTruthy();
      expect(catalog.maintenance.pypiCommand).toBe('pip install chatflow-agent');
    }
  });
});

