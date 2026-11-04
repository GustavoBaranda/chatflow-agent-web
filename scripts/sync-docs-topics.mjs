#!/usr/bin/env node

/**
 * Topic Registry Synchronization & Audit Script for chatflow-agent-web.
 *
 * Scans the authoritative MDX documentation files under content/docs/en/
 * and audits/generates the typed manifest at src/config/docs-topics-manifest.ts.
 *
 * Exits with code 0 if synchronized, or code 1 if stale/missing topics are detected in --check mode.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const docsDir = path.join(rootDir, 'content', 'docs', 'en');
const manifestPath = path.join(rootDir, 'src', 'config', 'docs-topics-manifest.ts');

const TRACKS = ['v0.3', 'v0.4'];

function extractTopicsForTrack(track) {
  const trackDir = path.join(docsDir, track);
  if (!fs.existsSync(trackDir)) return [];

  const topics = [];
  function walk(currentDir, baseRel) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        walk(path.join(currentDir, entry.name), baseRel ? `${baseRel}/${entry.name}` : entry.name);
      } else if (entry.name.endsWith('.mdx')) {
        const slug = entry.name === 'index.mdx'
          ? (baseRel || '')
          : (baseRel ? `${baseRel}/${entry.name.replace('.mdx', '')}` : entry.name.replace('.mdx', ''));
        topics.push(slug);
      }
    }
  }

  walk(trackDir, '');
  return Array.from(new Set(topics)).sort();
}

function generateManifestContent(topicsByTrack) {
  const v03Formatted = topicsByTrack['v0.3'].map((t) => `    '${t}',`).join('\n');
  const v04Formatted = topicsByTrack['v0.4'].map((t) => `    '${t}',`).join('\n');

  return `/**
 * Topic Manifest for chatflow-agent-web.
 *
 * Automatically audited and maintained against authoritative English documentation
 * trees in content/docs/en/.
 *
 * Provides typed, zero-runtime-filesystem topic lookup for deterministic version switching.
 */

import type { DocVersionTrack } from './docs-versions';

export const TRACK_AVAILABLE_TOPICS: Record<DocVersionTrack, readonly string[]> = {
  'v0.3': [
${v03Formatted}
  ],
  'v0.4': [
${v04Formatted}
  ],
};
`;
}

function run() {
  const isCheckMode = process.argv.includes('--check');
  console.log('======================================================================');
  console.log(`  chatflow-agent-web - Topic Registry Synchronization ${isCheckMode ? '(Audit Mode)' : ''}`);
  console.log('======================================================================\n');

  const topicsByTrack = {};
  for (const track of TRACKS) {
    const topics = extractTopicsForTrack(track);
    topicsByTrack[track] = topics;
    console.log(`ℹ️  Found ${topics.length} topic(s) in authoritative English track [${track}]`);
  }

  const generatedContent = generateManifestContent(topicsByTrack);

  if (isCheckMode) {
    if (!fs.existsSync(manifestPath)) {
      console.error(`❌ Manifest file does not exist at: ${manifestPath}`);
      process.exit(1);
    }
    const currentContent = fs.readFileSync(manifestPath, 'utf8');
    if (currentContent.trim() !== generatedContent.trim()) {
      console.error('❌ Topic manifest is OUT OF SYNC with MDX documentation trees.');
      process.exit(1);
    }
    console.log('✅ Topic manifest is 100% IN SYNC with authoritative MDX files.\n');
    process.exit(0);
  }

  fs.writeFileSync(manifestPath, generatedContent, 'utf8');
  console.log(`✅ Topic manifest written successfully to: ${manifestPath}\n`);
}

run();

