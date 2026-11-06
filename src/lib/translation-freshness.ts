import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { resolveDocMdxPath } from '@/components/docs/TranslationNotice';

/** Directory holding the authoritative English MDX sources. */
export const AUTHORITATIVE_DOCS_DIR = path.join(process.cwd(), 'content', 'docs', 'en');

/**
 * SHA-256 of an MDX source, computed over the raw UTF-8 file content.
 * Must stay identical to `calculateSha256` in `scripts/check-i18n.mjs`.
 */
export function calculateSourceHash(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Hash of the authoritative English page for a docs slug such as
 * `v0.3/guides/agents`, or `null` when the source cannot be read
 * (unknown slug, or a runtime without access to the content directory).
 */
export function getAuthoritativeSourceHash(
  slug: string,
  docsDir: string = AUTHORITATIVE_DOCS_DIR
): string | null {
  const mdxPath = resolveDocMdxPath(slug);
  if (!mdxPath) return null;

  const resolvedDir = path.resolve(docsDir);
  const filePath = path.resolve(resolvedDir, mdxPath);
  if (!filePath.startsWith(resolvedDir + path.sep)) return null;

  try {
    return calculateSourceHash(readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * A translation is outdated when it records the hash of the English source it
 * was translated from and that hash no longer matches the current English file.
 * Pages without a recorded hash, or whose source cannot be read, are not flagged.
 */
export function isTranslationOutdated(
  recordedSourceHash: string | undefined,
  currentSourceHash: string | null
): boolean {
  if (!recordedSourceHash || currentSourceHash === null) return false;
  return recordedSourceHash !== currentSourceHash;
}
