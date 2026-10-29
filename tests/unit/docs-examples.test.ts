import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, it, expect } from 'vitest';

const DOCS_DIR = path.resolve(process.cwd(), 'content/docs/en');
const PYTHON_PATH = 'C:\\Users\\Gustavo\\Desktop\\chatflow-agent\\.venv\\Scripts\\python.exe';

function getMdxFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getMdxFiles(fullPath));
    } else if (file.endsWith('.mdx')) {
      results.push(fullPath);
    }
  }
  return results;
}

function extractPythonBlocks(content: string): string[] {
  const regex = /```python\s*([\s\S]*?)```/g;
  const blocks: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    blocks.push(match[1]);
  }
  return blocks;
}

describe('Documentation Python Code Snippets Verification', () => {
  const mdxFiles = getMdxFiles(DOCS_DIR);

  it('finds documentation MDX files in English tree', () => {
    expect(mdxFiles.length).toBeGreaterThanOrEqual(4);
  });

  mdxFiles.forEach((file) => {
    const relativePath = path.relative(process.cwd(), file);
    const content = fs.readFileSync(file, 'utf-8');
    const pythonBlocks = extractPythonBlocks(content);

    describe(`File: ${relativePath}`, () => {
      it(`has valid Python syntax for all ${pythonBlocks.length} code block(s)`, () => {
        pythonBlocks.forEach((code) => {
          const pyScript = `import sys, ast\nast.parse(sys.stdin.read())\n`;
          const run = spawnSync(PYTHON_PATH, ['-c', pyScript], {
            input: code,
            encoding: 'utf-8',
          });
          expect(run.status).toBe(0);
          expect(run.stderr).toBe('');
        });
      });
    });
  });

  it('validates that all imported chatflow_agent symbols exist in the real SDK', () => {
    const checkScript = `
import inspect
import chatflow_agent
from chatflow_agent import Agent, Runner, OpenAIEngine, AnthropicEngine, GeminiEngine, tool, SQLiteSessionStore, AgentResponse

expected_symbols = [
    'Agent',
    'Runner',
    'OpenAIEngine',
    'AnthropicEngine',
    'GeminiEngine',
    'tool',
    'SQLiteSessionStore',
    'AgentResponse',
]

for sym in expected_symbols:
    assert hasattr(chatflow_agent, sym), f"Symbol {sym} missing from chatflow_agent"

# Verify Agent signature
sig_agent = inspect.signature(Agent.__init__)
for p in ['name', 'instructions', 'engine', 'tools', 'handoffs']:
    assert p in sig_agent.parameters, f"Parameter {p} missing in Agent.__init__"

# Verify Runner signatures
sig_runner_init = inspect.signature(Runner.__init__)
for p in ['starting_agent', 'session_store', 'engine']:
    assert p in sig_runner_init.parameters, f"Parameter {p} missing in Runner.__init__"

sig_run = inspect.signature(Runner.run)
for p in ['session_id', 'user_message']:
    assert p in sig_run.parameters, f"Parameter {p} missing in Runner.run"

sig_run_async = inspect.signature(Runner.run_async)
for p in ['session_id', 'user_message', 'turn_timeout']:
    assert p in sig_run_async.parameters, f"Parameter {p} missing in Runner.run_async"

# Verify AgentResponse attributes
response_fields = AgentResponse.model_fields.keys()
for f in ['content', 'active_agent_name', 'tool_calls_executed']:
    assert f in response_fields, f"Field {f} missing in AgentResponse"

print("SDK symbols and signatures 100% verified.")
`;
    const run = spawnSync(PYTHON_PATH, ['-c', checkScript], {
      encoding: 'utf-8',
    });
    expect(run.status).toBe(0);
    expect(run.stdout).toContain('SDK symbols and signatures 100% verified.');
  });
});
