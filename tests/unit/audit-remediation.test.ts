import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(__dirname, '../..');
const DOCS_DIR = path.join(ROOT, 'content', 'docs');
const LOCALES = ['en', 'es', 'pt-BR'] as const;

function findMdx(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findMdx(full));
    else if (entry.name.endsWith('.mdx')) results.push(full);
  }
  return results;
}

function getSdk040Python(): string | null {
  const winPy = path.join(ROOT, '.cache', 'sdk-venvs', '0.4.0', 'Scripts', 'python.exe');
  const posixPy = path.join(ROOT, '.cache', 'sdk-venvs', '0.4.0', 'bin', 'python');
  if (fs.existsSync(winPy)) return winPy;
  if (fs.existsSync(posixPy)) return posixPy;
  return null;
}

describe('PR #48 Audit Remediation — H-01..H-04, M-01..M-03, L-01', () => {
  it('H-01: Runner.run() does not accept turn_timeout in SDK 0.4.0 or public docs', () => {
    const py = getSdk040Python();
    if (py) {
      const out = execFileSync(
        py,
        [
          '-c',
          [
            'import inspect, json',
            'from chatflow_agent.core.runner import Runner',
            'run_params = list(inspect.signature(Runner.run).parameters.keys())',
            'run_async_sig = inspect.signature(Runner.run_async)',
            'run_async_params = {k: str(v.kind) for k, v in run_async_sig.parameters.items()}',
            'print(json.dumps({"run": run_params, "run_async": run_async_params}))',
          ].join('; '),
        ],
        { encoding: 'utf8' },
      );
      const parsed = JSON.parse(out.trim()) as {
        run: string[];
        run_async: Record<string, string>;
      };
      expect(parsed.run).toEqual(['self', 'session_id', 'user_message', 'metadata']);
      expect(parsed.run).not.toContain('turn_timeout');
      expect(parsed.run_async.turn_timeout).toBe('KEYWORD_ONLY');
    }

    for (const file of findMdx(DOCS_DIR)) {
      const text = fs.readFileSync(file, 'utf8');
      expect(text, `${path.relative(ROOT, file)} must not claim run() accepts turn_timeout`).not.toMatch(
        /\brun\([^)\n]*turn_timeout/,
      );
      expect(text, `${path.relative(ROOT, file)} must not list both run() and run_async() for turn_timeout`).not.toMatch(
        /turn_timeout[^\n]*runner\.run\(\)\s+(?:and|y|e)\s+(?:`?await\s+)?runner\.run_async\(\)/i,
      );
    }
  });

  it('H-02: v0.4 migration.mdx covers all 4 official breaking changes across en, es, pt-BR', () => {
    for (const locale of LOCALES) {
      const migrationPath = path.join(DOCS_DIR, locale, 'v0.4', 'getting-started', 'migration.mdx');
      const text = fs.readFileSync(migrationPath, 'utf8');
      expect(text, `${locale} migration.mdx must mention Vertex AI / ADC`).toMatch(/Vertex AI/i);
      expect(text, `${locale} migration.mdx must mention GeminiEngine.client removal`).toMatch(
        /GeminiEngine\.client|engine\.client/,
      );
      expect(text, `${locale} migration.mdx must mention duplicate Agent names`).toMatch(/Duplicate agent name|ValueError/);
      expect(text, `${locale} migration.mdx must mention WhatsAppChannel dedup_ttl_hours removal`).toMatch(
        /dedup_ttl_hours/,
      );
      expect(text, `${locale} migration.mdx must not have outdated CustomerFilter(BaseModel) example`).not.toMatch(
        /class CustomerFilter\(BaseModel\)/,
      );
    }
  });

  it('H-03: ToolSchemaError applies to unmappable unions while non-union unsupported types retain STRING fallback', () => {
    const py = getSdk040Python();
    if (py) {
      const script = [
        'import dataclasses, enum, json',
        'from typing import TypedDict',
        'from pydantic import BaseModel',
        'from chatflow_agent import tool',
        'from chatflow_agent.core.tools import ToolSchemaError',
        'class CustomClass: pass',
        'class MyModel(BaseModel): x: int',
        'class MyTD(TypedDict): x: int',
        '@dataclasses.dataclass\nclass MyDC:\n    x: int',
        'class MyEnum(enum.Enum): A = "a"',
        'def f_custom(x: CustomClass) -> str: return ""',
        'def f_custom_opt(x: CustomClass | None = None) -> str: return ""',
        'def f_model(x: MyModel) -> str: return ""',
        'def f_td(x: MyTD) -> str: return ""',
        'def f_dc(x: MyDC) -> str: return ""',
        'def f_enum(x: MyEnum) -> str: return ""',
        'res = {}',
        'for name, fn in [("CustomClass", f_custom), ("CustomClass|None", f_custom_opt), ("BaseModel", f_model), ("TypedDict", f_td), ("dataclass", f_dc), ("Enum", f_enum)]:',
        '    try:',
        '        t = tool(fn)',
        '        res[name] = t.to_openai_parameters()["properties"]["x"]["type"]',
        '    except ToolSchemaError:',
        '        res[name] = "ToolSchemaError"',
        'print(json.dumps(res))',
      ].join('\n');
      const out = execFileSync(py, ['-c', script], { encoding: 'utf8' });
      const res = JSON.parse(out.trim()) as Record<string, string>;
      expect(res['CustomClass']).toBe('string');
      expect(res['BaseModel']).toBe('string');
      expect(res['TypedDict']).toBe('string');
      expect(res['dataclass']).toBe('string');
      expect(res['Enum']).toBe('string');
      expect(res['CustomClass|None']).toBe('ToolSchemaError');
    }
  });

  it('H-04: STABLE-ONLY policy check script passes with 0 public RC or prerelease references', () => {
    const out = execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'check-stable-only.mjs')], {
      encoding: 'utf8',
    });
    expect(out).toContain('STABLE-ONLY policy check PASSED');
  });

  it('M-01: Runner.reset_session* return bool in SDK 0.4.0 and are documented as -> bool across all locales', () => {
    const py = getSdk040Python();
    if (py) {
      const out = execFileSync(
        py,
        [
          '-c',
          [
            'import inspect, json',
            'from chatflow_agent.core.runner import Runner',
            'print(json.dumps({"sync": inspect.signature(Runner.reset_session).return_annotation in (bool, "bool"), "async": inspect.signature(Runner.reset_session_async).return_annotation in (bool, "bool")}))',
          ].join('; '),
        ],
        { encoding: 'utf8' },
      );
      const parsed = JSON.parse(out.trim()) as { sync: boolean; async: boolean };
      expect(parsed.sync).toBe(true);
      expect(parsed.async).toBe(true);
    }

    for (const locale of LOCALES) {
      const lifecyclePath = path.join(DOCS_DIR, locale, 'v0.4', 'guides', 'runner-lifecycle.mdx');
      const text = fs.readFileSync(lifecyclePath, 'utf8');
      expect(text, `${locale} runner-lifecycle.mdx must document reset_session_async -> bool`).toContain(
        'reset_session_async(session_id) -> bool',
      );
      expect(text, `${locale} runner-lifecycle.mdx must document reset_session -> bool`).toContain(
        'reset_session(session_id) -> bool',
      );
    }
  });

  it('M-03: check-i18n.mjs fails with non-zero exit code on outdated/missing MDX translations', () => {
    const scriptText = fs.readFileSync(path.join(ROOT, 'scripts', 'check-i18n.mjs'), 'utf8');
    expect(scriptText).toContain('❌ MISSING:');
    expect(scriptText).toContain('❌ OUTDATED:');
    expect(scriptText).toContain('❌ INCOMPLETE:');
    // Verify current repo passes cleanly
    const out = execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'check-i18n.mjs')], {
      encoding: 'utf8',
    });
    expect(out).toContain('PASSED');
  });

  it('L-01: scripts/ensure-sdk-releases.py has no allow_offline_git-fallback typo and parses CLI flag cleanly', () => {
    const scriptPath = path.join(ROOT, 'scripts', 'ensure-sdk-releases.py');
    const content = fs.readFileSync(scriptPath, 'utf8');
    expect(content).not.toContain('args.allow_offline_git-fallback');
    expect(content).toContain('args.allow_offline_git_fallback');

    const py = getSdk040Python() ?? 'python';
    const checkScript = [
      'import ast, pathlib',
      `src = pathlib.Path(r"${scriptPath}").read_text(encoding="utf-8")`,
      'ast.parse(src)',
      'assert "args.allow_offline_git_fallback" in src',
      'assert "args.allow_offline_git-fallback" not in src',
      'print("OK")',
    ].join('\n');
    const out = execFileSync(py, ['-c', checkScript], { encoding: 'utf8' });
    expect(out.trim()).toBe('OK');
  });
});
