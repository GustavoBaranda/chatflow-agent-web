import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';

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

function requireSdkPython(version: '0.3.4' | '0.4.0'): string {
  const winPy = path.join(ROOT, '.cache', 'sdk-venvs', version, 'Scripts', 'python.exe');
  const posixPy = path.join(ROOT, '.cache', 'sdk-venvs', version, 'bin', 'python');
  if (fs.existsSync(winPy)) return winPy;
  if (fs.existsSync(posixPy)) return posixPy;
  throw new Error(
    `Isolated SDK virtualenv for ${version} is missing at .cache/sdk-venvs/${version}. ` +
      'Run `python scripts/ensure-sdk-releases.py --version all` before running tests.',
  );
}

describe('PR #48 Audit Remediation — Full SDK Parity, i18n Fixtures, STABLE-ONLY & Offline Fallback', () => {
  it('H-01: Runner.run() does not accept turn_timeout in SDK 0.4.0 or any public doc (code or prose)', () => {
    const py = requireSdkPython('0.4.0');
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

    for (const file of findMdx(DOCS_DIR)) {
      const rel = path.relative(ROOT, file);
      const text = fs.readFileSync(file, 'utf8');
      expect(text, `${rel} must not pass turn_timeout to run()`).not.toMatch(/\brun\([^)\n]*turn_timeout/);
      expect(text, `${rel} must not claim run_async and run both support turn_timeout`).not.toMatch(
        /`?run_async`?\s+(?:and|y|e)\s+`?run`?[^\n]*turn_timeout/i,
      );
      expect(text, `${rel} must not claim runner.run() and runner.run_async() both accept turn_timeout`).not.toMatch(
        /turn_timeout[^\n]*runner\.run\(\)\s+(?:and|y|e)\s+(?:`?await\s+)?runner\.run_async\(\)/i,
      );
    }
  });

  it('H-02 & N-08: Distinct-parent duplicate Agent names, WhatsAppChannel signatures, and 4 breaking changes match SDK 0.3.4 vs 0.4.0', () => {
    const py034 = requireSdkPython('0.3.4');
    const py040 = requireSdkPython('0.4.0');

    const dupScript = [
      'from chatflow_agent import Agent, Runner',
      's1 = Agent(name="Support", instructions="billing")',
      's2 = Agent(name="Support", instructions="tech")',
      'p1 = Agent(name="P1", instructions="p1", handoffs=[s1])',
      'p2 = Agent(name="P2", instructions="p2", handoffs=[s2])',
      'root = Agent(name="Root", instructions="root", handoffs=[p1, p2])',
      'try:',
      '    r = Runner(starting_agent=root)',
      '    print("OK:" + r._agents_registry["Support"].instructions)',
      'except ValueError as e:',
      '    print("VALUE_ERROR:" + str(e))',
    ].join('\n');

    expect(execFileSync(py034, ['-c', dupScript], { encoding: 'utf8' }).trim()).toBe('OK:billing');
    expect(execFileSync(py040, ['-c', dupScript], { encoding: 'utf8' }).trim()).toContain(
      "VALUE_ERROR:Duplicate agent name 'Support'",
    );

    // Same-parent handoff replacement behavior
    const sameParentScript = [
      'from chatflow_agent import Agent',
      'a = Agent(name="Base", instructions="b")',
      'a.add_handoff(Agent(name="Dup", instructions="first"))',
      'a.add_handoff(Agent(name="Dup", instructions="second"))',
      'assert len(a.handoffs) == 1 and a.handoffs[0].instructions == "second"',
      'print("REPLACED")',
    ].join('\n');
    expect(execFileSync(py040, ['-c', sameParentScript], { encoding: 'utf8' }).trim()).toBe('REPLACED');

    // WhatsAppChannel signature & defaults across 0.3.4 vs 0.4.0
    const waScript = [
      'import inspect, json',
      'from chatflow_agent.channels.whatsapp import WhatsAppChannel',
      'sig = inspect.signature(WhatsAppChannel.__init__)',
      'print(json.dumps({k: {"default": repr(v.default), "kind": str(v.kind)} for k, v in sig.parameters.items() if k != "self"}))',
    ].join('\n');
    const wa034 = JSON.parse(execFileSync(py034, ['-c', waScript], { encoding: 'utf8' }).trim()) as Record<
      string,
      { default: string; kind: string }
    >;
    const wa040 = JSON.parse(execFileSync(py040, ['-c', waScript], { encoding: 'utf8' }).trim()) as Record<
      string,
      { default: string; kind: string }
    >;

    expect(wa034.dedup_ttl_hours).toBeDefined();
    expect(wa034.queue_timeout_seconds).toBeUndefined();
    expect(wa034.llm_timeout_seconds.default).toBe('30.0');

    expect(wa040.dedup_ttl_hours).toBeUndefined();
    expect(wa040.queue_timeout_seconds).toEqual({ default: '120.0', kind: 'KEYWORD_ONLY' });
    expect(wa040.max_body_size.kind).toBe('KEYWORD_ONLY');
    expect(wa040.enable_docs.kind).toBe('KEYWORD_ONLY');
    expect(wa040.llm_timeout_seconds.default).toBe('120.0');
    expect(wa040.outbound_max_delay.default).toBe('30.0');

    for (const locale of LOCALES) {
      const migrationPath = path.join(DOCS_DIR, locale, 'v0.4', 'getting-started', 'migration.mdx');
      const text = fs.readFileSync(migrationPath, 'utf8');
      expect(text).toMatch(/Vertex AI/i);
      expect(text).toMatch(/GeminiEngine\.client|engine\.client/);
      expect(text).toContain("Duplicate agent name 'Support'");
      expect(text).toMatch(/dedup_ttl_hours/);
      expect(text).not.toMatch(/prev_metadata|class CustomerFilter\(BaseModel\)/);
    }
  }, 30000);

  it('H-03: ToolSchemaError applies to unmappable unions while non-union unsupported types retain STRING fallback', () => {
    const py = requireSdkPython('0.4.0');
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
  }, 30000);

  it('M-01 & N-02 & N-03: reset_session* returns bool at runtime, SQLite user_version==1 across 0.3.4/0.4.0, Gemini missing key raises ProviderError', () => {
    const py034 = requireSdkPython('0.3.4');
    const py040 = requireSdkPython('0.4.0');

    // Runtime bool return on reset_session
    const resetScript = [
      'import asyncio, json',
      'from chatflow_agent import Agent, Runner, SessionStore',
      'a = Agent(name="A", instructions="i")',
      'store = SessionStore()',
      'r = Runner(starting_agent=a, session_store=store)',
      'first = r.reset_session("missing")',
      'store.get_or_create("exists", a)',
      'second = r.reset_session("exists")',
      'print(json.dumps({"first": first, "second": second}))',
    ].join('\n');
    const resetRes = JSON.parse(execFileSync(py040, ['-c', resetScript], { encoding: 'utf8' }).trim()) as {
      first: boolean;
      second: boolean;
    };
    expect(resetRes).toEqual({ first: false, second: true });

    // Real 0.3.4 SQLite DB opened cleanly by 0.4.0 with user_version == 1
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-sqlite-compat-'));
    try {
      const dbPath = path.join(tmpDir, 'compat.db');
      execFileSync(
        py034,
        [
          '-c',
          `import sqlite3; from chatflow_agent import Agent, SQLiteSessionStore; s = SQLiteSessionStore(db_path=r"${dbPath}"); s.get_or_create("u1", Agent(name="A", instructions="i")); conn = sqlite3.connect(r"${dbPath}"); assert conn.execute("PRAGMA user_version").fetchone()[0] == 1; conn.close()`,
        ],
        { encoding: 'utf8' },
      );
      execFileSync(
        py040,
        [
          '-c',
          `import sqlite3; from chatflow_agent import Agent, SQLiteSessionStore; s = SQLiteSessionStore(db_path=r"${dbPath}"); ctx = s.get("u1"); assert ctx is not None; conn = sqlite3.connect(r"${dbPath}"); assert conn.execute("PRAGMA user_version").fetchone()[0] == 1; conn.close(); s.close()`,
        ],
        { encoding: 'utf8' },
      );
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }

    // Gemini missing API key raises ProviderError on first turn
    const geminiScript = [
      'import asyncio, os',
      'from chatflow_agent import Agent, GeminiEngine, ProviderError, Runner',
      'os.environ.pop("GEMINI_API_KEY", None)',
      'os.environ.pop("GOOGLE_API_KEY", None)',
      'e = GeminiEngine()',
      'r = Runner(starting_agent=Agent(name="G", instructions="i", engine=e))',
      'try:',
      '    asyncio.run(r.run_async("s1", "hello"))',
      '    raise AssertionError("Expected ProviderError")',
      'except ProviderError:',
      '    print("PROVIDER_ERROR")',
    ].join('\n');
    expect(execFileSync(py040, ['-c', geminiScript], { encoding: 'utf8' }).trim()).toBe('PROVIDER_ERROR');
  }, 30000);

  it('H-04 & Section 15: check-stable-only.mjs passes on repo and catches RC/prerelease violations in negative fixtures', () => {
    // Repo must pass
    const repoRes = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'check-stable-only.mjs')], {
      encoding: 'utf8',
    });
    expect(repoRes.status).toBe(0);

    // Positive & Negative fixtures
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-stable-only-'));
    try {
      const enDir = path.join(tmpDir, 'content', 'docs', 'en', 'v0.4');
      const msgDir = path.join(tmpDir, 'messages');
      fs.mkdirSync(enDir, { recursive: true });
      fs.mkdirSync(msgDir, { recursive: true });
      fs.writeFileSync(path.join(msgDir, 'en.json'), JSON.stringify({ home: { title: 'Vercel Preview Ready' } }));
      fs.writeFileSync(path.join(enDir, 'clean.mdx'), '---\ntitle: Clean\ndescription: Clean\n---\nStable 0.4.0 docs.\n');

      const pos = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'check-stable-only.mjs'), '--root', tmpDir], {
        encoding: 'utf8',
      });
      expect(pos.status).toBe(0);

      for (const badLine of [
        'Install chatflow-agent==0.5.0-rc2',
        'Try version 1.0.0a1 today',
        'Available in RC2',
        'pip install --allow-prereleases chatflow-agent',
        '<Callout title="Preview Note: Upcoming">',
        'v0.4.0 Candidate 1',
      ]) {
        fs.writeFileSync(path.join(enDir, 'clean.mdx'), `---\ntitle: Bad\ndescription: Bad\n---\n${badLine}\n`);
        const neg = spawnSync(
          process.execPath,
          [path.join(ROOT, 'scripts', 'check-stable-only.mjs'), '--root', tmpDir],
          { encoding: 'utf8' },
        );
        expect(neg.status, `Expected check-stable-only to fail on "${badLine}"`).toBe(1);
      }
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('M-03: check-i18n.mjs exits non-zero on all 6 fixture failure modes (missing, incomplete, missing/outdated hash, missing/invalid revision)', () => {
    const scriptPath = path.join(ROOT, 'scripts', 'check-i18n.mjs');
    const makeFixture = (esContent: string | null) => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-i18n-fix-'));
      fs.mkdirSync(path.join(tmpDir, 'messages'), { recursive: true });
      fs.mkdirSync(path.join(tmpDir, 'content', 'docs', 'en'), { recursive: true });
      fs.mkdirSync(path.join(tmpDir, 'content', 'docs', 'es'), { recursive: true });
      fs.writeFileSync(path.join(tmpDir, 'messages', 'en.json'), JSON.stringify({ k: 'v' }));
      fs.writeFileSync(path.join(tmpDir, 'messages', 'es.json'), JSON.stringify({ k: 'v' }));
      const enRaw = '---\ntitle: En\ndescription: En desc\n---\nBody\n';
      fs.writeFileSync(path.join(tmpDir, 'content', 'docs', 'en', 'page.mdx'), enRaw);
      const enHash = crypto.createHash('sha256').update(enRaw, 'utf8').digest('hex');
      if (esContent !== null) {
        fs.writeFileSync(
          path.join(tmpDir, 'content', 'docs', 'es', 'page.mdx'),
          esContent.replace('__VALID_HASH__', enHash),
        );
      }
      return tmpDir;
    };

    const cases: Array<[string, string | null, number]> = [
      ['valid translation', '---\ntitle: Es\ndescription: Desc\nsourceRevision: "5d2d319"\nsourceHash: "__VALID_HASH__"\n---\nCuerpo\n', 0],
      ['missing file', null, 1],
      ['incomplete body', '---\ntitle: Es\ndescription: Desc\nsourceRevision: "5d2d319"\nsourceHash: "__VALID_HASH__"\n---\n', 1],
      ['missing sourceHash', '---\ntitle: Es\ndescription: Desc\nsourceRevision: "5d2d319"\n---\nCuerpo\n', 1],
      ['outdated sourceHash', '---\ntitle: Es\ndescription: Desc\nsourceRevision: "5d2d319"\nsourceHash: "0000000000000000"\n---\nCuerpo\n', 1],
      ['missing sourceRevision', '---\ntitle: Es\ndescription: Desc\nsourceHash: "__VALID_HASH__"\n---\nCuerpo\n', 1],
      ['invalid sourceRevision', '---\ntitle: Es\ndescription: Desc\nsourceRevision: "0.4.0"\nsourceHash: "__VALID_HASH__"\n---\nCuerpo\n', 1],
    ];

    for (const [label, content, expectedCode] of cases) {
      const dir = makeFixture(content);
      try {
        const res = spawnSync(process.execPath, [scriptPath, '--root', dir], { encoding: 'utf8' });
        expect(res.status, `check-i18n fixture "${label}" exit code`).toBe(expectedCode);
      } finally {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  it('L-01: ensure-sdk-releases.py fails strictly without flag and invokes offline fallback cleanly with --allow-offline-git-fallback', () => {
    const py = requireSdkPython('0.4.0');
    const scriptPath = path.join(ROOT, 'scripts', 'ensure-sdk-releases.py');

    // Controlled harness mocking network failure in download_wheel
    const harness = [
      'import importlib.util, sys',
      `spec = importlib.util.spec_from_file_location("ensure_sdk", r"${scriptPath}")`,
      'mod = importlib.util.module_from_spec(spec)',
      'spec.loader.exec_module(mod)',
      'mod.get_pypi_metadata = lambda: {}',
      'def boom(v, m): raise RuntimeError("simulated offline network")',
      'mod.download_wheel = boom',
      'mode = sys.argv[1]',
      'if mode == "strict":',
      '    sys.argv = ["ensure-sdk-releases.py", "--version", "0.4.0"]',
      'else:',
      '    sys.argv = ["ensure-sdk-releases.py", "--version", "0.4.0", "--allow-offline-git-fallback"]',
      '    import io, tarfile, subprocess',
      '    buf = io.BytesIO()',
      '    with tarfile.open(fileobj=buf, mode="w") as tf:',
      '        data = b"__version__ = \'0.4.0\'\\n"',
      '        ti = tarfile.TarInfo("src/chatflow_agent/__init__.py")',
      '        ti.size = len(data)',
      '        tf.addfile(ti, io.BytesIO(data))',
      '    subprocess.check_output = lambda *a, **kw: buf.getvalue()',
      'sys.exit(mod.main())',
    ].join('\n');

    const strictRes = spawnSync(py, ['-c', harness, 'strict'], { encoding: 'utf8' });
    expect(strictRes.status).not.toBe(0);
    expect(strictRes.stderr).toContain('[STRICT ERROR]');

    const fallbackRes = spawnSync(py, ['-c', harness, 'fallback'], { encoding: 'utf8' });
    expect(fallbackRes.status).toBe(0);
    expect(fallbackRes.stderr).toContain('OFFLINE SOURCE FALLBACK ACTIVE');
  }, 30000);

  it('P-01: core-concepts.mdx matches SDK 0.4.0 max_turns=40, _run_sync_tool, Role.SYSTEM pruning, and no BFS/System Note claims', () => {
    const py = requireSdkPython('0.4.0');
    const out = execFileSync(
      py,
      [
        '-c',
        [
          'import inspect, json',
          'from chatflow_agent import Agent, SessionStore, SQLiteSessionStore',
          'from chatflow_agent.core.memory import SessionContext',
          'from chatflow_agent.core.tools import Tool',
          'from chatflow_agent.types import Message, Role',
          'ctx = SessionContext("s", Agent(name="A", instructions="i"), max_turns=2)',
          'ctx.add_message(Message(role=Role.SYSTEM, content="sys"))',
          'for i in range(3): ctx.add_message(Message(role=Role.USER, content=f"u{i}")); ctx.add_message(Message(role=Role.MODEL, content=f"m{i}"))',
          'print(json.dumps({',
          '  "ctx_default": inspect.signature(SessionContext.__init__).parameters["max_turns"].default,',
          '  "store_default": inspect.signature(SessionStore.__init__).parameters["default_max_turns"].default,',
          '  "sqlite_default": inspect.signature(SQLiteSessionStore.__init__).parameters["default_max_turns"].default,',
          '  "uses_run_sync_tool": "_run_sync_tool" in inspect.getsource(Tool.execute_async),',
          '  "sys_preserved": ctx.history[0].role == Role.SYSTEM and ctx.history[0].content == "sys",',
          '  "retained_users": [m.content for m in ctx.history if m.role == Role.USER]',
          '}))',
        ].join('\n'),
      ],
      { encoding: 'utf8' },
    );
    const res = JSON.parse(out.trim()) as {
      ctx_default: number;
      store_default: number;
      sqlite_default: number;
      uses_run_sync_tool: boolean;
      sys_preserved: boolean;
      retained_users: string[];
    };
    expect(res.ctx_default).toBe(40);
    expect(res.store_default).toBe(40);
    expect(res.sqlite_default).toBe(40);
    expect(res.uses_run_sync_tool).toBe(true);
    expect(res.sys_preserved).toBe(true);
    expect(res.retained_users).toEqual(['u1', 'u2']);

    for (const locale of LOCALES) {
      const p = path.join(DOCS_DIR, locale, 'v0.4', 'getting-started', 'core-concepts.mdx');
      const text = fs.readFileSync(p, 'utf8');
      expect(text, `${locale} core-concepts must document max_turns default 40`).toMatch(/`max_turns`[^.\n]*`40`/);
      expect(text, `${locale} core-concepts must document default_max_turns=40`).toContain('default_max_turns=40');
      expect(text, `${locale} core-concepts must reference _run_sync_tool`).toContain('_run_sync_tool');
      expect(text, `${locale} core-concepts must not claim [System Note] anchor`).not.toContain('[System Note]');
      expect(text, `${locale} core-concepts must not claim breadth-first/BFS`).not.toMatch(/breadth-first|\bBFS\b/i);
    }
  }, 30000);

  it('P-02: installation.mdx across en/es/pt-BR matches exact SDK 0.4.0 wheel METADATA and supported env vars', () => {
    const py = requireSdkPython('0.4.0');
    const out = execFileSync(
      py,
      [
        '-c',
        [
          'import importlib.metadata as md, json',
          'from chatflow_agent.core.engines.openai_compatible import PROVIDER_PRESETS',
          'meta = md.metadata("chatflow-agent")',
          'print(json.dumps({"requires_python": meta.get("Requires-Python"), "requires_dist": meta.get_all("Requires-Dist"), "xai_env": PROVIDER_PRESETS["grok"]["env_key"]}))',
        ].join('; '),
      ],
      { encoding: 'utf8' },
    );
    const meta = JSON.parse(out.trim()) as {
      requires_python: string;
      requires_dist: string[];
      xai_env: string;
    };
    expect(meta.requires_python).toBe('>=3.10');
    expect(meta.xai_env).toBe('XAI_API_KEY');
    expect(meta.requires_dist).toContain("python-telegram-bot>=21.0; extra == 'telegram'");
    expect(meta.requires_dist).toContain("fastapi>=0.110.0; extra == 'whatsapp'");
    expect(meta.requires_dist).toContain("uvicorn>=0.29.0; extra == 'whatsapp'");
    expect(meta.requires_dist).toContain("ruff>=0.4.0; extra == 'dev'");

    for (const locale of LOCALES) {
      const p = path.join(DOCS_DIR, locale, 'v0.4', 'getting-started', 'installation.mdx');
      const text = fs.readFileSync(p, 'utf8');
      expect(text, `${locale} installation must list python-telegram-bot>=21.0`).toContain('python-telegram-bot>=21.0');
      expect(text, `${locale} installation must list fastapi>=0.110.0`).toContain('fastapi>=0.110.0');
      expect(text, `${locale} installation must list uvicorn>=0.29.0`).toContain('uvicorn>=0.29.0');
      expect(text, `${locale} installation must list ruff>=0.4.0`).toContain('ruff>=0.4.0');
      expect(text, `${locale} installation must list XAI_API_KEY`).toContain('XAI_API_KEY');
      expect(text, `${locale} installation must NOT mention GROK_API_KEY`).not.toContain('GROK_API_KEY');
      expect(text, `${locale} installation webhook extra must NOT duplicate pydantic`).not.toMatch(
        /webhook[^\n]*pydantic/i,
      );
    }
  }, 30000);

  it('P-03 & P-04: response.handoff is Handoff | None and Agent(provider="mistral") fails while OpenAIEngine(provider="mistral", base_url=...) succeeds', () => {
    const py = requireSdkPython('0.4.0');
    const out = execFileSync(
      py,
      [
        '-c',
        [
          'import json, chatflow_agent',
          'from chatflow_agent import Agent, ConfigurationError, OpenAIEngine',
          'from chatflow_agent.core.engines import resolve_engine',
          'from chatflow_agent.types import AgentResponse',
          'bad_raised = False',
          'try:',
          '    Agent(name="B", instructions="i", provider="mistral", base_url="https://api.mistral.ai/v1", api_key="k")',
          'except ConfigurationError:',
          '    bad_raised = True',
          'eng = OpenAIEngine(provider="mistral", base_url="https://api.mistral.ai/v1", api_key="k")',
          'good = Agent(name="G", instructions="i", model="mistral-large-latest", engine=eng)',
          'print(json.dumps({',
          '  "has_agent_handoff": hasattr(chatflow_agent, "AgentHandoff"),',
          '  "has_handoff": hasattr(chatflow_agent, "Handoff"),',
          '  "handoff_ann": str(AgentResponse.model_fields["handoff"].annotation),',
          '  "bad_raised": bad_raised,',
          '  "good_ok": resolve_engine(good) is eng',
          '}))',
        ].join('\n'),
      ],
      { encoding: 'utf8' },
    );
    const res = JSON.parse(out.trim()) as {
      has_agent_handoff: boolean;
      has_handoff: boolean;
      handoff_ann: string;
      bad_raised: boolean;
      good_ok: boolean;
    };
    expect(res.has_agent_handoff).toBe(false);
    expect(res.has_handoff).toBe(true);
    expect(res.handoff_ann).toContain('Handoff');
    expect(res.bad_raised).toBe(true);
    expect(res.good_ok).toBe(true);

    for (const locale of LOCALES) {
      const qs = fs.readFileSync(path.join(DOCS_DIR, locale, 'v0.4', 'getting-started', 'quickstart.mdx'), 'utf8');
      expect(qs).toContain('Handoff | None');
      expect(qs).not.toContain('AgentHandoff');

      const mig = fs.readFileSync(path.join(DOCS_DIR, locale, 'v0.4', 'getting-started', 'migration.mdx'), 'utf8');
      expect(mig).toContain('provider="mistral"');
      expect(mig).toContain('OpenAIEngine');
    }
  }, 30000);

  it('N-05: check-i18n.mjs verifies real Git sourceRevision (fails on non-existent SHA and mismatched SHA, passes on matching SHA)', () => {
    const scriptPath = path.join(ROOT, 'scripts', 'check-i18n.mjs');
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-i18n-git-'));
    try {
      const git = (args: string[]) =>
        execFileSync('git', ['-C', tmpDir, ...args], {
          encoding: 'utf8',
          env: {
            ...process.env,
            GIT_AUTHOR_NAME: 'Test',
            GIT_AUTHOR_EMAIL: 'test@example.com',
            GIT_COMMITTER_NAME: 'Test',
            GIT_COMMITTER_EMAIL: 'test@example.com',
          },
        }).trim();

      git(['init']);
      fs.mkdirSync(path.join(tmpDir, 'messages'), { recursive: true });
      fs.mkdirSync(path.join(tmpDir, 'content', 'docs', 'en'), { recursive: true });
      fs.mkdirSync(path.join(tmpDir, 'content', 'docs', 'es'), { recursive: true });
      fs.writeFileSync(path.join(tmpDir, 'messages', 'en.json'), JSON.stringify({ k: 'v' }));
      fs.writeFileSync(path.join(tmpDir, 'messages', 'es.json'), JSON.stringify({ k: 'v' }));

      // Commit 1: v1 of English doc
      fs.writeFileSync(path.join(tmpDir, 'content', 'docs', 'en', 'page.mdx'), '---\ntitle: V1\ndescription: D1\n---\nBody V1\n');
      git(['add', '.']);
      git(['commit', '-m', 'en v1']);
      const shaV1 = git(['rev-parse', '--short', 'HEAD']);

      // Commit 2: v2 of English doc
      const enV2 = '---\ntitle: V2\ndescription: D2\n---\nBody V2\n';
      fs.writeFileSync(path.join(tmpDir, 'content', 'docs', 'en', 'page.mdx'), enV2);
      git(['add', '.']);
      git(['commit', '-m', 'en v2']);
      const shaV2 = git(['rev-parse', '--short', 'HEAD']);
      const hashV2 = crypto.createHash('sha256').update(enV2, 'utf8').digest('hex');

      // Case 1: Non-existent SHA -> FAIL
      fs.writeFileSync(
        path.join(tmpDir, 'content', 'docs', 'es', 'page.mdx'),
        `---\ntitle: Es\ndescription: D\nsourceRevision: "deadbee"\nsourceHash: "${hashV2}"\n---\nCuerpo\n`,
      );
      expect(spawnSync(process.execPath, [scriptPath, '--root', tmpDir], { encoding: 'utf8' }).status).toBe(1);

      // Case 2: Valid SHA (v1) whose content does NOT reproduce sourceHash (v2) -> FAIL
      fs.writeFileSync(
        path.join(tmpDir, 'content', 'docs', 'es', 'page.mdx'),
        `---\ntitle: Es\ndescription: D\nsourceRevision: "${shaV1}"\nsourceHash: "${hashV2}"\n---\nCuerpo\n`,
      );
      expect(spawnSync(process.execPath, [scriptPath, '--root', tmpDir], { encoding: 'utf8' }).status).toBe(1);

      // Case 3: Valid SHA (v2) whose content reproduces sourceHash (v2) -> PASS
      fs.writeFileSync(
        path.join(tmpDir, 'content', 'docs', 'es', 'page.mdx'),
        `---\ntitle: Es\ndescription: D\nsourceRevision: "${shaV2}"\nsourceHash: "${hashV2}"\n---\nCuerpo\n`,
      );
      expect(spawnSync(process.execPath, [scriptPath, '--root', tmpDir], { encoding: 'utf8' }).status).toBe(0);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }, 30000);
});
