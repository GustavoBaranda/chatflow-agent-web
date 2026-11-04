#!/usr/bin/env node

/**
 * Link Integrity & Cross-Version Audit Script for chatflow-agent-web.
 *
 * Verifies internal documentation links across all MDX content trees:
 * 1. Detects broken internal links (pointing to non-existent topics or files).
 * 2. Detects accidental cross-version links (e.g., v0.4 linking to unversioned/v0.3 paths).
 * 3. Validates relative and absolute paths against known topics and file paths.
 * 4. Preserves external links (http/https, mailto, anchors).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const docsDir = path.join(rootDir, 'content', 'docs');

function getAllMdxFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllMdxFiles(fullPath));
    } else if (entry.name.endsWith('.mdx')) {
      results.push(fullPath);
    }
  }
  return results;
}

// Build index of all existing valid pages across all locales and tracks
function buildPageIndex(files) {
  const index = new Set();
  for (const file of files) {
    const rel = path.relative(docsDir, file).replace(/\\/g, '/');
    // rel: e.g. "en/v0.3/guides/agents.mdx"
    const parts = rel.split('/');
    const locale = parts[0];
    const track = parts[1];
    const rest = parts.slice(2).join('/').replace(/\.mdx$/, '');
    const cleanSlug = rest === 'index' ? '' : rest.replace(/\/index$/, '');

    // Canonical versioned paths
    index.add(`/${locale}/docs/${track}${cleanSlug ? `/${cleanSlug}` : ''}`);
    index.add(`/docs/${track}${cleanSlug ? `/${cleanSlug}` : ''}`);

    // If stable v0.3, also register unversioned alias paths
    if (track === 'v0.3') {
      index.add(`/${locale}/docs${cleanSlug ? `/${cleanSlug}` : ''}`);
      index.add(`/docs${cleanSlug ? `/${cleanSlug}` : ''}`);
    }
  }
  return index;
}

function auditLinks() {
  console.log('======================================================================');
  console.log('  chatflow-agent-web - Documentation Link Integrity Audit');
  console.log('======================================================================\n');

  const files = getAllMdxFiles(docsDir);
  const pageIndex = buildPageIndex(files);
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  let totalLinks = 0;
  let brokenLinks = 0;
  let crossVersionLeaks = 0;

  for (const file of files) {
    const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');

    // Determine track of current file
    const isV04 = relPath.includes('/v0.4/');
    const isV03 = relPath.includes('/v0.3/');
    const currentTrack = isV04 ? 'v0.4' : isV03 ? 'v0.3' : 'unknown';

    let match;
    while ((match = markdownLinkRegex.exec(content)) !== null) {
      const linkText = match[1];
      const rawHref = match[2].trim();

      // Skip external links and pure hash anchors
      if (
        rawHref.startsWith('http://') ||
        rawHref.startsWith('https://') ||
        rawHref.startsWith('mailto:') ||
        rawHref.startsWith('#')
      ) {
        continue;
      }

      totalLinks++;

      // Clean hash anchors or query parameters from the href
      const [hrefWithoutHash] = rawHref.split(/[?#]/);

      // Check for accidental cross-version links
      if (currentTrack === 'v0.4') {
        // In v0.4, linking to unversioned /docs/... or /docs/v0.3/... is an accidental leak
        if (
          hrefWithoutHash.includes('/docs/v0.3') ||
          (/^(\/[a-z]{2}(-[A-Z]{2})?)?\/docs(\/(?!v0\.4)[^/]+.*)?$/.test(hrefWithoutHash) &&
            !hrefWithoutHash.includes('/docs/v0.4'))
        ) {
          console.error(
            `❌ CROSS-VERSION LEAK in [${relPath}]:\n   Link: "${linkText}" -> ${rawHref}\n   Track: v0.4 content must not link to v0.3 or unversioned routes.\n`
          );
          crossVersionLeaks++;
          continue;
        }
      } else if (currentTrack === 'v0.3') {
        if (hrefWithoutHash.includes('/docs/v0.4')) {
          console.error(
            `❌ CROSS-VERSION LEAK in [${relPath}]:\n   Link: "${linkText}" -> ${rawHref}\n   Track: v0.3 stable content must not link to v0.4 prerelease routes.\n`
          );
          crossVersionLeaks++;
          continue;
        }
      }

      // Check if target exists in page index
      const exists = pageIndex.has(hrefWithoutHash);
      if (!exists) {
        console.error(
          `❌ BROKEN LINK in [${relPath}]:\n   Link: "${linkText}" -> ${rawHref}\n   Target route does not exist.\n`
        );
        brokenLinks++;
      }
    }
  }

  console.log(`Audited ${totalLinks} internal links across ${files.length} MDX documentation files.`);
  if (brokenLinks === 0 && crossVersionLeaks === 0) {
    console.log('✅ Link integrity audit PASSED: 0 broken links, 0 cross-version leaks.\n');
    return true;
  }

  console.error(
    `❌ Link integrity audit FAILED: ${brokenLinks} broken link(s), ${crossVersionLeaks} cross-version leak(s).\n`
  );
  return false;
}

const success = auditLinks();
process.exit(success ? 0 : 1);

