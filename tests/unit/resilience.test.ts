import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  isMaintenanceModeEnabled,
  getMaintenanceRetryAfter,
  getMaintenanceEstimatedMinutes,
  isStaticAsset,
} from '@/lib/maintenance';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { NextIntlClientProvider } from 'next-intl';
import LocalizedError from '@/app/[locale]/error';
import GlobalError from '@/app/global-error';
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

  it('should enable maintenance mode when server-only MAINTENANCE_MODE is true', () => {
    process.env.MAINTENANCE_MODE = 'true';
    expect(isMaintenanceModeEnabled()).toBe(true);
  });

  it('should not enable maintenance mode from NEXT_PUBLIC_MAINTENANCE_MODE (server-only security)', () => {
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE = 'true';
    expect(isMaintenanceModeEnabled()).toBe(false);
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

  it('should render LocalizedError boundary cleanly without leaking sensitive stack traces or raw errors', () => {
    const sensitiveError = Object.assign(
      new Error('SENSITIVE_DB_CREDENTIALS_LEAK_TEST_SECRET'),
      { digest: 'NEXT_DIGEST_TRACKING_1234' }
    );
    let resetCalled = false;
    const reset = () => {
      resetCalled = true;
    };

    const html = renderToString(
      React.createElement(NextIntlClientProvider, {
        locale: 'en',
        messages: enMessages,
        timeZone: 'UTC',
        children: React.createElement(LocalizedError, { error: sensitiveError, reset }),
      })
    );

    // Assert zero sensitive leak
    expect(html).not.toContain('SENSITIVE_DB_CREDENTIALS_LEAK_TEST_SECRET');
    expect(html).not.toContain('Error:');

    // Assert safe digest is rendered
    expect(html).toContain('NEXT_DIGEST_TRACKING_1234');

    // Assert accessibility and visual cues
    expect(html).toContain('role="alert"');
    expect(html).toContain('aria-live="assertive"');
    expect(html).toContain('500');
    expect(html).toContain(enMessages.error.title);
    expect(html).toContain(enMessages.error.retry);
    expect(html).toContain(enMessages.error.returnHome);
  });

  it('should render LocalizedError in Spanish and Brazilian Portuguese with proper localized copy', () => {
    const error = new Error('Generic error');

    // Spanish
    const esHtml = renderToString(
      React.createElement(NextIntlClientProvider, {
        locale: 'es',
        messages: esMessages,
        timeZone: 'UTC',
        children: React.createElement(LocalizedError, { error, reset: () => {} }),
      })
    );
    expect(esHtml).toContain(esMessages.error.title);
    expect(esHtml).toContain(esMessages.error.retry);

    // Portuguese
    const ptHtml = renderToString(
      React.createElement(NextIntlClientProvider, {
        locale: 'pt-BR',
        messages: ptBRMessages,
        timeZone: 'UTC',
        children: React.createElement(LocalizedError, { error, reset: () => {} }),
      })
    );
    expect(ptHtml).toContain(ptBRMessages.error.title);
    expect(ptHtml).toContain(ptBRMessages.error.retry);
  });

  it('should render GlobalError boundary with self-contained HTML structure and flagless multilingual support', () => {
    const catastrophicError = Object.assign(
      new Error('CRITICAL_ROOT_LAYOUT_FAILURE_LEAK'),
      { digest: 'ROOT_DIGEST_5678' }
    );

    const html = renderToString(
      React.createElement(GlobalError, { error: catastrophicError, reset: () => {} })
    );

    // Defines its own html and body
    expect(html).toContain('<html');
    expect(html).toContain('<body');
    expect(html).toContain('role="alert"');

    // Zero sensitive leak
    expect(html).not.toContain('CRITICAL_ROOT_LAYOUT_FAILURE_LEAK');
    expect(html).toContain('ROOT_DIGEST_5678');

    // Self-contained flagless language selector labels
    expect(html).toContain('English');
    expect(html).toContain('Español');
    expect(html).toContain('Português (Brasil)');
  });
});

