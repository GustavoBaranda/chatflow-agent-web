import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, it, expect } from 'vitest';

const ROOT_DIR = process.cwd();
const PYTHON_34 = path.resolve(ROOT_DIR, '.cache/sdk-venvs/0.3.4/Scripts/python.exe');
const PYTHON_40 = path.resolve(ROOT_DIR, '.cache/sdk-venvs/0.4.0rc1/Scripts/python.exe');

const LOADER_PRELUDE = `
import sys, os, importlib.util
spec = importlib.util.spec_from_file_location("val", os.path.abspath("scripts/validate-release-parity.py"))
val = importlib.util.module_from_spec(spec)
spec.loader.exec_module(val)
ReleaseInspector = val.ReleaseInspector
parse_snippet_metadata = val.parse_snippet_metadata
validate_code_ast = val.validate_code_ast
`;

function runPythonTest(pyBin: string, testScript: string) {
  const fullScript = LOADER_PRELUDE + '\n' + testScript;
  const result = spawnSync(pyBin, ['-c', fullScript], {
    encoding: 'utf-8',
    cwd: ROOT_DIR,
    env: {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
    },
  });
  if (result.status !== 0) {
    console.error('Python Error:', result.stderr || result.stdout);
  }
  return result;
}

describe('SDK Release Parity Regression Suite (Negative Cases)', { timeout: 15000 }, () => {
  it('detects protocol error for "async with runner:" on SDK 0.3.4', () => {
    const script = `
inspector = ReleaseInspector("0.3.4", r"${PYTHON_34}")
code = """
from chatflow_agent import Agent, Runner

agent = Agent(name="Bot", instructions="Test", model="gpt-4o")
runner = Runner(starting_agent=agent)

async def test():
    async with runner:
        pass
"""
meta = parse_snippet_metadata(code)
ok, err = validate_code_ast(code, "test.mdx", 1, meta, inspector)
assert not ok, "Expected failure on 0.3.4!"
assert "MetadataError" in err or "ProtocolError" in err, f"Unexpected error: {err}"
print("VERIFIED: async with runner detected on 0.3.4")
`;
    const res = runPythonTest(PYTHON_34, script);
    expect(res.status).toBe(0);
    expect(res.stdout).toContain('VERIFIED: async with runner detected on 0.3.4');
  });

  it('detects compatibility error for SQLiteSessionStore(db_path=":memory:") on SDK 0.3.4', () => {
    const script = `
inspector = ReleaseInspector("0.3.4", r"${PYTHON_34}")
code = """
from chatflow_agent import SQLiteSessionStore
store = SQLiteSessionStore(db_path=":memory:")
"""
meta = parse_snippet_metadata(code)
ok, err = validate_code_ast(code, "test.mdx", 1, meta, inspector)
assert not ok, "Expected failure on 0.3.4!"
assert "CompatibilityError" in err or "MetadataError" in err, f"Unexpected error: {err}"
print("VERIFIED: SQLiteSessionStore :memory: detected on 0.3.4")
`;
    const res = runPythonTest(PYTHON_34, script);
    expect(res.status).toBe(0);
    expect(res.stdout).toContain('VERIFIED: SQLiteSessionStore :memory: detected on 0.3.4');
  });

  it('detects ImportError when importing ReentrantTurnError on SDK 0.3.4', () => {
    const script = `
inspector = ReleaseInspector("0.3.4", r"${PYTHON_34}")
code = "from chatflow_agent import ReentrantTurnError"
meta = parse_snippet_metadata(code)
ok, err = validate_code_ast(code, "test.mdx", 1, meta, inspector)
assert not ok, "Expected failure on 0.3.4!"
assert "ImportError" in err and "ReentrantTurnError" in err, f"Unexpected error: {err}"
print("VERIFIED: ReentrantTurnError detected on 0.3.4")
`;
    const res = runPythonTest(PYTHON_34, script);
    expect(res.status).toBe(0);
    expect(res.stdout).toContain('VERIFIED: ReentrantTurnError detected on 0.3.4');
  });

  it('detects SignatureError when passing invalid keyword to Runner constructor', () => {
    const script = `
for v, py in [("0.3.4", r"${PYTHON_34}"), ("0.4.0rc1", r"${PYTHON_40}")]:
    inspector = ReleaseInspector(v, py)
    code = "from chatflow_agent import Runner; runner = Runner(invalid_param=123)"
    meta = parse_snippet_metadata(code)
    ok, err = validate_code_ast(code, "test.mdx", 1, meta, inspector)
    assert not ok, f"Expected failure on {v}!"
    assert "SignatureError" in err and "invalid_param" in err, f"Unexpected error: {err}"

    # Also test legacy 'agent' keyword instead of 'starting_agent'
    code2 = "from chatflow_agent import Runner; runner = Runner(agent=my_agent)"
    meta2 = parse_snippet_metadata(code2)
    ok2, err2 = validate_code_ast(code2, "test.mdx", 1, meta2, inspector)
    assert not ok2, f"Expected failure on {v}!"
    assert "SignatureError" in err2 and "agent" in err2, f"Unexpected error: {err2}"

print("VERIFIED: Invalid constructor kwargs detected on both releases")
`;
    const res = runPythonTest(PYTHON_34, script);
    expect(res.status).toBe(0);
    expect(res.stdout).toContain('VERIFIED: Invalid constructor kwargs detected on both releases');
  });

  it('detects SignatureError when passing unsupported argument to Runner.run_async on 0.3.4', () => {
    const script = `
inspector = ReleaseInspector("0.3.4", r"${PYTHON_34}")
code = "await runner.run_async('s1', 'hello', turn_timeout=45.0)"
meta = parse_snippet_metadata(code)
ok, err = validate_code_ast(code, "test.mdx", 1, meta, inspector)
assert not ok, "Expected failure on 0.3.4!"
assert "SignatureError" in err and "turn_timeout" in err, f"Unexpected error: {err}"
print("VERIFIED: turn_timeout on run_async detected as invalid in 0.3.4")
`;
    const res = runPythonTest(PYTHON_34, script);
    expect(res.status).toBe(0);
    expect(res.stdout).toContain('VERIFIED: turn_timeout on run_async detected as invalid in 0.3.4');
  });

  it('permits turn_timeout and async with runner on 0.4.0rc1 when min-version is annotated', () => {
    const script = `
inspector = ReleaseInspector("0.4.0rc1", r"${PYTHON_40}")
code = """# [min-version: 0.4.0rc1]
from chatflow_agent import Agent, Runner

agent = Agent(name="Bot", instructions="Test", model="gpt-4o")
runner = Runner(starting_agent=agent)

async def test():
    async with runner:
        await runner.run_async("s1", "hello", turn_timeout=30.0)
"""
meta = parse_snippet_metadata(code)
ok, err = validate_code_ast(code, "test.mdx", 1, meta, inspector)
assert ok, f"Expected success on 0.4.0rc1, got: {err}"
print("VERIFIED: RC1 features pass on 0.4.0rc1 with proper annotation")
`;
    const res = runPythonTest(PYTHON_40, script);
    expect(res.status).toBe(0);
    expect(res.stdout).toContain('VERIFIED: RC1 features pass on 0.4.0rc1 with proper annotation');
  });
});
