#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const DOCS_DIR = path.join(rootDir, 'content', 'docs');
const MESSAGES_DIR = path.join(rootDir, 'messages');

const MDX_FORBIDDEN = [
  { name: 'RC version tag', regex: /0\.4\.0rc[0-9]+/i },
  { name: 'prerelease badge status', regex: /status=["']prerelease["']/i },
  { name: 'pip --pre flag', regex: /pip\s+install[^\n]*--pre\b/i },
  {
    name: 'prerelease prose',
    regex: /\b(prerelease|pre-release|preliminar|pre-lanzamiento|pré-lançamento|pre-lançamento)\b/i,
  },
];

function findFiles(dir, ext) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findFiles(full, ext));
    else if (entry.name.endsWith(ext)) results.push(full);
  }
  return results;
}

const violations = [];

for (const file of findFiles(DOCS_DIR, '.mdx')) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, idx) => {
    for (const rule of MDX_FORBIDDEN) {
      if (rule.regex.test(line)) {
        violations.push(`${path.relative(rootDir, file)}:${idx + 1} [${rule.name}]: ${line.trim()}`);
      }
    }
  });
}

for (const file of findFiles(MESSAGES_DIR, '.json')) {
  const raw = fs.readFileSync(file, 'utf8');
  if (/0\.4\.0rc[0-9]+|"RC1"/i.test(raw)) {
    violations.push(`${path.relative(rootDir, file)}: contains RC version/badge reference`);
  }
  const parsed = JSON.parse(raw);
  const releasesDesc = parsed?.community?.releasesCardDesc ?? '';
  if (/prerelease|preliminar|pré-lançamento|candidate/i.test(releasesDesc)) {
    violations.push(`${path.relative(rootDir, file)}: community.releasesCardDesc promotes prerelease candidates`);
  }
}

if (violations.length > 0) {
  console.error(`❌ STABLE-ONLY policy check FAILED with ${violations.length} violation(s):`);
  for (const v of violations) {
    console.error(`  - ${v}`);
  }
  process.exit(1);
}

console.log('✅ STABLE-ONLY policy check PASSED (0 public RC or prerelease references).');
process.exit(0);
