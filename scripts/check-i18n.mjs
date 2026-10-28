#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const MESSAGES_DIR = path.join(rootDir, 'messages');
const CONTENT_DOCS_DIR = path.join(rootDir, 'content', 'docs');
const AUTHORITATIVE_LOCALE = 'en';

/**
 * Recursively flatten a nested object into dot-notation paths
 */
function getFlattenedEntries(obj, prefix = '') {
  let entries = [];
  for (const [key, val] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      entries = entries.concat(getFlattenedEntries(val, fullPath));
    } else {
      entries.push({ key: fullPath, value: val });
    }
  }
  return entries;
}

/**
 * Parse frontmatter from an MDX file content
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { frontmatter: {}, body: content };
  const rawFm = match[1];
  const body = content.slice(match[0].length);
  const frontmatter = {};
  for (const line of rawFm.split(/\r?\n/)) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const k = line.slice(0, colonIndex).trim();
      const v = line.slice(colonIndex + 1).trim().replace(/^['"]|['"]$/g, '');
      frontmatter[k] = v;
    }
  }
  return { frontmatter, body };
}

/**
 * Recursively find all files with given extensions in a directory
 */
function findFiles(dir, ext = '.mdx') {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...findFiles(fullPath, ext));
    } else if (file.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

function calculateSha256(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

console.log('='.repeat(70));
console.log('  chatflow-agent-web - Translation Completeness & Freshness Audit');
console.log('='.repeat(70));

let hasErrors = false;

// 1. Audit JSON Message Catalogs
console.log('\n[1/2] Auditing JSON Message Catalogs in /messages...');
const enPath = path.join(MESSAGES_DIR, `${AUTHORITATIVE_LOCALE}.json`);
if (!fs.existsSync(enPath)) {
  console.error(`❌ Fatal: Authoritative catalog not found: ${enPath}`);
  process.exit(1);
}

const enCatalog = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const enEntries = getFlattenedEntries(enCatalog);
const enKeys = new Set(enEntries.map((e) => e.key));
console.log(`ℹ️  Authoritative (${AUTHORITATIVE_LOCALE}): ${enKeys.size} translation keys`);

const catalogFiles = fs.readdirSync(MESSAGES_DIR).filter((f) => f.endsWith('.json'));

for (const file of catalogFiles) {
  const locale = path.basename(file, '.json');
  if (locale === AUTHORITATIVE_LOCALE) continue;

  const catalogPath = path.join(MESSAGES_DIR, file);
  let catalog;
  try {
    catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  } catch (err) {
    console.error(`❌ ${file}: Invalid JSON syntax - ${err.message}`);
    hasErrors = true;
    continue;
  }

  const entries = getFlattenedEntries(catalog);
  const keys = new Set(entries.map((e) => e.key));

  const missingKeys = [...enKeys].filter((k) => !keys.has(k));
  const extraKeys = [...keys].filter((k) => !enKeys.has(k));
  const emptyKeys = entries.filter((e) => typeof e.value === 'string' && e.value.trim() === '').map((e) => e.key);

  if (missingKeys.length === 0 && extraKeys.length === 0 && emptyKeys.length === 0) {
    console.log(`  ✅ ${locale.padEnd(6)} -> 100% key parity (${keys.size}/${enKeys.size} keys, 0 missing, 0 empty)`);
  } else {
    hasErrors = true;
    console.log(`  ❌ ${locale.padEnd(6)} -> Discrepancies found:`);
    if (missingKeys.length > 0) {
      console.log(`     - Missing keys (${missingKeys.length}):`);
      missingKeys.forEach((k) => console.log(`         • ${k}`));
    }
    if (extraKeys.length > 0) {
      console.log(`     - Extraneous keys (${extraKeys.length}):`);
      extraKeys.forEach((k) => console.log(`         • ${k}`));
    }
    if (emptyKeys.length > 0) {
      console.log(`     - Empty values (${emptyKeys.length}):`);
      emptyKeys.forEach((k) => console.log(`         • ${k}`));
    }
  }
}

// 2. Audit MDX Documentation Trees
console.log('\n[2/2] Auditing MDX Documentation Trees in /content/docs...');
if (!fs.existsSync(CONTENT_DOCS_DIR)) {
  console.log('ℹ️  Directory content/docs does not exist yet (Scheduled for Doc Engine phase).');
  console.log('    Skipping MDX audit until documentation trees are initialized.');
} else {
  const enDocsDir = path.join(CONTENT_DOCS_DIR, AUTHORITATIVE_LOCALE);
  if (!fs.existsSync(enDocsDir)) {
    console.log(`ℹ️  No authoritative docs found in ${enDocsDir}. Skipping.`);
  } else {
    const enDocs = findFiles(enDocsDir, '.mdx');
    console.log(`ℹ️  Found ${enDocs.length} authoritative MDX doc(s) in English.`);

    const localeDirs = fs
      .readdirSync(CONTENT_DOCS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name !== AUTHORITATIVE_LOCALE)
      .map((d) => d.name);

    for (const locale of localeDirs) {
      const targetDir = path.join(CONTENT_DOCS_DIR, locale);
      console.log(`\n  Checking locale: ${locale}`);

      let upToDate = 0;
      let outdated = 0;
      let missing = 0;
      let incomplete = 0;

      for (const enDocPath of enDocs) {
        const relativePath = path.relative(enDocsDir, enDocPath);
        const localizedPath = path.join(targetDir, relativePath);

        if (!fs.existsSync(localizedPath)) {
          missing++;
          console.log(`    ⚠️  MISSING: ${relativePath}`);
          continue;
        }

        const enRaw = fs.readFileSync(enDocPath, 'utf8');
        const enHash = calculateSha256(enRaw);

        const locRaw = fs.readFileSync(localizedPath, 'utf8');
        const { frontmatter, body } = parseFrontmatter(locRaw);

        if (!frontmatter.title || !frontmatter.description || body.trim().length === 0) {
          incomplete++;
          console.log(`    ⚠️  INCOMPLETE: ${relativePath} (Missing title/description frontmatter or body)`);
        } else if (frontmatter.sourceHash && frontmatter.sourceHash !== enHash) {
          outdated++;
          console.log(`    ⚠️  OUTDATED: ${relativePath} (sourceHash differs from current English hash)`);
        } else {
          upToDate++;
        }
      }

      console.log(`    Summary for [${locale}]: ${upToDate} up-to-date, ${outdated} outdated, ${incomplete} incomplete, ${missing} missing.`);
    }
  }
}

console.log('\n' + '='.repeat(70));
if (hasErrors) {
  console.error('❌ Translation completeness audit FAILED. Please resolve the errors above.');
  process.exit(1);
} else {
  console.log('✅ Translation completeness and freshness audit PASSED with 0 discrepancies.');
  console.log('='.repeat(70));
  process.exit(0);
}
