import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  calculateSourceHash,
  getAuthoritativeSourceHash,
  isTranslationOutdated,
} from '@/lib/translation-freshness';

const LOCALIZED_LOCALES = ['es', 'pt-BR'] as const;
const DOCS_ROOT = path.join(process.cwd(), 'content', 'docs');

function listMdx(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listMdx(full);
    return entry.name.endsWith('.mdx') ? [full] : [];
  });
}

function readFrontmatterField(content: string, field: string): string | undefined {
  const block = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) return undefined;
  const line = block[1].split(/\r?\n/).find((l) => l.startsWith(`${field}:`));
  return line?.slice(field.length + 1).trim().replace(/^['"]|['"]$/g, '');
}

describe('Translation freshness detection', () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cfa-freshness-'));
    fs.mkdirSync(path.join(tmpDir, 'v0.3', 'guides'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'v0.3', 'guides', 'agents.mdx'), '---\ntitle: Agents\n---\nBody\n');
    fs.writeFileSync(path.join(tmpDir, 'v0.3', 'index.mdx'), '---\ntitle: Overview\n---\nHome\n');
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('hashes raw UTF-8 content with SHA-256 (same as scripts/check-i18n.mjs)', () => {
    expect(calculateSourceHash('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    );
  });

  it('resolves page and track-index slugs to the English source file', () => {
    const agents = fs.readFileSync(path.join(tmpDir, 'v0.3', 'guides', 'agents.mdx'), 'utf8');
    const index = fs.readFileSync(path.join(tmpDir, 'v0.3', 'index.mdx'), 'utf8');
    expect(getAuthoritativeSourceHash('v0.3/guides/agents', tmpDir)).toBe(calculateSourceHash(agents));
    expect(getAuthoritativeSourceHash('v0.3', tmpDir)).toBe(calculateSourceHash(index));
  });

  it('returns null for missing pages, empty slugs, and paths outside the docs directory', () => {
    expect(getAuthoritativeSourceHash('v0.3/guides/missing', tmpDir)).toBeNull();
    expect(getAuthoritativeSourceHash('', tmpDir)).toBeNull();
    expect(getAuthoritativeSourceHash('../../etc/passwd', tmpDir)).toBeNull();
  });

  it('flags a translation only when its recorded hash differs from the current source', () => {
    expect(isTranslationOutdated('aaa', 'aaa')).toBe(false);
    expect(isTranslationOutdated('aaa', 'bbb')).toBe(true);
    expect(isTranslationOutdated(undefined, 'bbb')).toBe(false);
    expect(isTranslationOutdated('aaa', null)).toBe(false);
  });

  it('becomes outdated as soon as the English source changes', () => {
    const file = path.join(tmpDir, 'v0.3', 'guides', 'agents.mdx');
    const recorded = getAuthoritativeSourceHash('v0.3/guides/agents', tmpDir) ?? undefined;
    fs.appendFileSync(file, 'New English paragraph.\n');
    expect(isTranslationOutdated(recorded, getAuthoritativeSourceHash('v0.3/guides/agents', tmpDir))).toBe(true);
  });

  it.each(LOCALIZED_LOCALES)(
    'every %s page records sourceHash and sourceRevision for an existing English source',
    (locale) => {
      const localeRoot = path.join(DOCS_ROOT, locale);
      const files = listMdx(localeRoot);
      expect(files.length).toBeGreaterThan(0);
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const rel = path.relative(localeRoot, file).split(path.sep).join('/');
        expect(readFrontmatterField(content, 'sourceHash'), `${locale}/${rel} sourceHash`).toMatch(/^[0-9a-f]{64}$/);
        expect(readFrontmatterField(content, 'sourceRevision'), `${locale}/${rel} sourceRevision`).toMatch(/^[0-9a-f]{7,40}$/);
        expect(fs.existsSync(path.join(DOCS_ROOT, 'en', rel)), `${locale}/${rel} has an English source`).toBe(true);
      }
    }
  );
});
