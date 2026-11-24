#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootFlagIdx = process.argv.indexOf('--root');
const rootDir =
  rootFlagIdx !== -1 && process.argv[rootFlagIdx + 1]
    ? path.resolve(process.argv[rootFlagIdx + 1])
    : path.resolve(__dirname, '..');

const DOCS_DIR = path.join(rootDir, 'content', 'docs');
const MESSAGES_DIR = path.join(rootDir, 'messages');

const MDX_FORBIDDEN = [
  { name: 'prerelease version suffix (rc/a/b)', regex: /\bv?\d+\.\d+\.\d+-?(?:rc|a|b)\d+\b/i },
  { name: 'standalone RC label', regex: /\bRC\d+\b/ },
  { name: 'prerelease badge status', regex: /status=["']prerelease["']/i },
  { name: 'pip --pre / --allow-prereleases flag', regex: /(?:--pre\b|--allow-prereleases\b)/i },
  { name: 'Release Candidate / Candidate release label', regex: /\b(?:release\s+candidate|candidate\s+\d+|candidata\s+\d+|v\d+\.\d+\.\d+\s+candidate|vers[ãa]o\s+candidata|versi[óo]n\s+candidata)\b/i },
  { name: 'Preview Note / Prerelease preview label', regex: /\b(?:Preview\s+Note|Nota\s+de\s+Pr[ée]via|Prote[çc][õo]es\s+da\s+Pr[ée]via|Nota\s+de\s+vista\s+previa)\b/i },
  {
    name: 'prerelease prose',
    regex: /\b(prerelease|pre-release|preliminar|pre-lanzamiento|pr[ée]-lan[çc]amento)\b/i,
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
  const rel = path.relative(rootDir, file).replace(/\\/g, '/');
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, idx) => {
    for (const rule of MDX_FORBIDDEN) {
      if (rule.regex.test(line)) {
        violations.push(`${rel}:${idx + 1} [${rule.name}]: ${line.trim()}`);
      }
    }
    // Historical v0.3 docs must pin v0.3.4 when installing extras
    if (rel.includes('/v0.3/')) {
      if (/pip\s+install\s+["']chatflow-agent\[[^\]]+\]["']/.test(line)) {
        violations.push(`${rel}:${idx + 1} [unpinned v0.3 extra install]: ${line.trim()}`);
      }
    }
  });
}

// Scan public UI messages (allowing explicitly justified dormant component keys under prereleaseBanner / versionSelector.prerelease*)
function walkJson(obj, prefix, fileRel) {
  for (const [k, v] of Object.entries(obj)) {
    const keyPath = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      walkJson(v, keyPath, fileRel);
    } else if (typeof v === 'string') {
      if (/\bRC\d+\b|\bv?\d+\.\d+\.\d+-?(?:rc|a|b)\d+\b/i.test(v)) {
        violations.push(`${fileRel} [${keyPath}]: contains RC/prerelease version token "${v}"`);
      }
      const isDormantPrereleaseKey =
        keyPath.startsWith('prereleaseBanner.') ||
        keyPath === 'versionSelector.prerelease' ||
        keyPath === 'versionSelector.prereleaseBadge' ||
        keyPath === 'versionSelector.prereleaseTrack';
      if (
        !isDormantPrereleaseKey &&
        /\b(prerelease|pre-release|release\s+candidate|preliminar|pr[ée]-lan[çc]amento|pre-lanzamiento)\b/i.test(v)
      ) {
        violations.push(`${fileRel} [${keyPath}]: public UI message promotes prerelease "${v}"`);
      }
    }
  }
}

for (const file of findFiles(MESSAGES_DIR, '.json')) {
  const rel = path.relative(rootDir, file).replace(/\\/g, '/');
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  walkJson(parsed, '', rel);
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
