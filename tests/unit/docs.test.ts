import { describe, it, expect } from 'vitest';
import { source } from '@/lib/source';

describe('Documentation Engine & Source Loader', () => {
  it('should load authoritative English index page', () => {
    const page = source.getPage([], 'en');
    expect(page).toBeDefined();
    expect(page?.data.title).toBe('Documentation Overview');
    expect(page?.data.description).toContain('chatflow-agent');
    expect(page?.url).toBe('/en/docs');
  });

  it('should load Spanish localized index page', () => {
    const page = source.getPage([], 'es');
    expect(page).toBeDefined();
    expect(page?.data.title).toBe('Visión General de la Documentación');
    expect(page?.url).toBe('/es/docs');
  });

  it('should load Brazilian Portuguese localized index page', () => {
    const page = source.getPage([], 'pt-BR');
    expect(page).toBeDefined();
    expect(page?.data.title).toBe('Visão Geral da Documentação');
    expect(page?.url).toBe('/pt-BR/docs');
  });

  it('should generate page trees for all three launch languages', () => {
    const enTree = source.getPageTree('en');
    const esTree = source.getPageTree('es');
    const ptTree = source.getPageTree('pt-BR');

    expect(enTree).toBeDefined();
    expect(esTree).toBeDefined();
    expect(ptTree).toBeDefined();

    expect(enTree.children.length).toBeGreaterThan(0);
    expect(esTree.children.length).toBeGreaterThan(0);
    expect(ptTree.children.length).toBeGreaterThan(0);
  });

  it('should return undefined for non-existent pages', () => {
    const page = source.getPage(['non-existent-slug-test'], 'en');
    expect(page).toBeUndefined();
  });

  it('should generate static params for all available routes', () => {
    const params = source.generateParams('slug', 'locale');
    expect(params.length).toBeGreaterThanOrEqual(3);

    const locales = params.map((p) => p.locale);
    expect(locales).toContain('en');
    expect(locales).toContain('es');
    expect(locales).toContain('pt-BR');
  });
});
