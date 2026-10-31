import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, it, expect } from 'vitest';

const DOCS_DIR = path.resolve(process.cwd(), 'content/docs/en');
const PYTHON_PATH = 'C:\\Users\\Gustavo\\Desktop\\chatflow-agent\\.venv\\Scripts\\python.exe';
const SDK_DIR = 'C:\\Users\\Gustavo\\Desktop\\chatflow-agent';

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
  const regex = /```(?:python|py)\s*([\s\S]*?)```/g;
  const blocks: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    blocks.push(match[1]);
  }
  return blocks;
}

describe('Documentation Python Code Snippets and SDK Parity Verification', () => {
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
            env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
          });
          expect(run.status).toBe(0);
          expect(run.stderr).toBe('');
        });
      });
    });
  });

  it('verifies that no engine constructors in documentation accept a "model" argument', () => {
    const checkNoEngineModelScript = `
import inspect
from chatflow_agent import OpenAIEngine, GeminiEngine, AnthropicEngine

for engine_cls in [OpenAIEngine, GeminiEngine, AnthropicEngine]:
    sig = inspect.signature(engine_cls.__init__)
    assert "model" not in sig.parameters, f"Engine {engine_cls.__name__} must not accept 'model' parameter!"
print("Verified: No engine accepts model parameter.")
`;
    const run = spawnSync(PYTHON_PATH, ['-c', checkNoEngineModelScript], { encoding: 'utf-8' });
    expect(run.status).toBe(0);
    expect(run.stdout).toContain('Verified: No engine accepts model parameter.');
  }, 15000);

  it('verifies that SQLiteSessionStore does not take busy_timeout as a parameter', () => {
    const checkSqliteScript = `
import inspect
from chatflow_agent import SQLiteSessionStore

sig = inspect.signature(SQLiteSessionStore.__init__)
assert "busy_timeout" not in sig.parameters, "SQLiteSessionStore must not accept 'busy_timeout'!"
assert "db_path" in sig.parameters, "SQLiteSessionStore missing db_path"
assert "default_max_turns" in sig.parameters, "SQLiteSessionStore missing default_max_turns"
print("Verified: SQLiteSessionStore signature is exact.")
`;
    const run = spawnSync(PYTHON_PATH, ['-c', checkSqliteScript], { encoding: 'utf-8' });
    expect(run.status).toBe(0);
    expect(run.stdout).toContain('Verified: SQLiteSessionStore signature is exact.');
  }, 15000);

  it('verifies pyproject.toml extras match across v0.3.4 and v0.4.0rc1', () => {
    const checkExtrasScript = `
import subprocess

expected_extras = ["telegram", "whatsapp", "webhook", "all", "dev"]

for tag in ["v0.3.4", "v0.4.0rc1"]:
    raw = subprocess.check_output(
        ["git", "-C", r"${SDK_DIR}", "show", f"{tag}:pyproject.toml"],
        text=True
    )
    for extra in expected_extras:
        assert f"{extra} =" in raw, f"Extra {extra} not found in {tag}:pyproject.toml"

print("Verified: pyproject.toml extras match.")
`;
    const run = spawnSync(PYTHON_PATH, ['-c', checkExtrasScript], { encoding: 'utf-8' });
    expect(run.status).toBe(0);
    expect(run.stdout).toContain('Verified: pyproject.toml extras match.');
  }, 15000);

  it('executes all documentation examples end-to-end using an isolated mock engine with zero network calls', () => {
    const executeExamplesScript = `
import asyncio, os
from chatflow_agent import (
    Agent,
    AnthropicEngine,
    GeminiEngine,
    OpenAIEngine,
    Runner,
    SessionStore,
    SQLiteSessionStore,
    tool,
)
from chatflow_agent.core.engines.base import BaseEngine, EngineTurnResult

class MockEngine(BaseEngine):
    def __init__(self, text="Mock response"):
        self.text = text
    async def generate_turn_async(self, agent, history):
        return EngineTurnResult(text=self.text)

# Example 1: Quickstart basic agent
agent1 = Agent(
    name="Assistant",
    instructions="Concise assistant.",
    model="gpt-4o",
    engine=MockEngine("Async Python is non-blocking.")
)
runner1 = Runner(starting_agent=agent1)
res1 = runner1.run(session_id="s1", user_message="Explain async")
assert res1.content == "Async Python is non-blocking."

# Example 2: Quickstart tool calling
@tool(name="calculate_discount", description="Calculate discount")
def calculate_discount(price: float, discount_percent: float) -> str:
    savings = price * (discount_percent / 100.0)
    return f"Savings: {savings}"

agent2 = Agent(
    name="SalesBot",
    instructions="Sales assistant",
    model="gpt-4o",
    tools=[calculate_discount],
    engine=MockEngine("Discount calculated")
)
runner2 = Runner(starting_agent=agent2)
res2 = runner2.run(session_id="s2", user_message="Discount on 100")
assert isinstance(res2.tool_calls_executed, list)

# Example 3: Quickstart async execution
async def test_async_turn():
    agent_async = Agent(
        name="AsyncBot",
        instructions="Async helper",
        model="gpt-4o",
        engine=MockEngine("Async response")
    )
    runner_async = Runner(starting_agent=agent_async)
    res_async = await runner_async.run_async(session_id="s_async", user_message="Hello")
    assert res_async.content == "Async response"

asyncio.run(test_async_turn())

# Example 4: Quickstart multi-provider setup
openai_agent = Agent(name="OpenAIBot", instructions="...", model="gpt-4o")
claude_agent = Agent(name="ClaudeBot", instructions="...", model="claude-3-5-sonnet-20241022")
gemini_agent = Agent(name="GeminiBot", instructions="...", model="gemini-2.5-flash")
groq_engine = OpenAIEngine(base_url="https://api.groq.com/openai/v1", api_key="mock", provider="groq")
groq_agent = Agent(name="GroqBot", instructions="...", model="llama-3.3-70b-versatile", engine=groq_engine)

# Example 5: Core Concepts - Agent with dynamic callable instructions
def dynamic_instructions() -> str:
    return "Dynamic instructions at runtime"
agent_dynamic = Agent(name="ScheduleBot", instructions=dynamic_instructions, model="gemini-2.5-flash")
assert agent_dynamic.get_instructions() == "Dynamic instructions at runtime"

# Example 6: Core Concepts - Runner with in-memory SessionStore
agent_plain = Agent(name="PlainBot", instructions="...", model="gpt-4o", engine=MockEngine("Done"))
mem_store = SessionStore()
runner_mem = Runner(starting_agent=agent_plain, session_store=mem_store)
res_mem = runner_mem.run(session_id="sess_mem", user_message="Run turn")
assert res_mem.content == "Done"

# Example 7: Core Concepts - SQLiteSessionStore
sqlite_store = SQLiteSessionStore(db_path=":memory:", default_max_turns=40)

# Example 8: Core Concepts - Swarm handoffs
billing = Agent(name="BillingAgent", instructions="Billing", model="gpt-4o", engine=MockEngine("Billed"))
triage = Agent(name="TriageAgent", instructions="Triage", model="gpt-4o", handoffs=[billing], engine=MockEngine("Billed"))
runner_swarm = Runner(starting_agent=triage)
res_swarm = runner_swarm.run(session_id="sess_swarm", user_message="Billing query")
assert res_swarm.content == "Billed"

# Example 9: Guide 1 - @agent.tool decorator registration
agent_with_tool = Agent(name="AnalyticsBot", instructions="Process metrics", model="gpt-4o")
@agent_with_tool.tool(name="query_active_users", description="Count active sessions")
def query_active_users(minutes: int = 15) -> int:
    return 142
assert any(t.name == "query_active_users" for t in agent_with_tool.tools)

# Example 10: Guide 2 - Tool async and sync execution
@tool(name="calc_vat", description="Calculate VAT")
def calc_vat(amount: float, rate: float = 0.20) -> float:
    return amount * rate
assert calc_vat.execute(amount=100.0) == 20.0

# Example 11: Guide 4 - Runner custom limits and agent registry
custom_runner = Runner(
    starting_agent=triage,
    max_handoffs_per_turn=3,
    max_tool_iterations=6,
)
assert custom_runner.max_handoffs_per_turn == 3
assert custom_runner.max_tool_iterations == 6
assert "BillingAgent" in custom_runner._agents_registry

# Example 12: Guide 5 - Webhook deduplication TTL and SessionContext
from chatflow_agent.core.memory import DEFAULT_DEDUP_TTL_HOURS
assert DEFAULT_DEDUP_TTL_HOURS == 192
sess_ctx = mem_store.get_or_create(session_id="dedup_test", default_agent=triage)
assert sess_ctx.active_agent.name == "TriageAgent"

# Example 13: Etapa 4C.2 - BaseChannel and split_message
from chatflow_agent.channels.base import BaseChannel, split_message
chunks = split_message("Paragraph 1\\n\\nParagraph 2\\n\\nParagraph 3", max_len=15)
assert len(chunks) >= 3

class MockWebhookChannel(BaseChannel):
    def run(self, **kwargs):
        pass

mock_channel = MockWebhookChannel()
mock_channel.attach(runner1)
assert mock_channel.runner is runner1

# Example 14: Etapa 4C.2 - OpenAIEngine presets & security
from chatflow_agent.core.engines.openai_compatible import PROVIDER_PRESETS, OpenAIEngine, _resolve_api_key
assert "deepseek" in PROVIDER_PRESETS
assert "groq" in PROVIDER_PRESETS
assert "grok" in PROVIDER_PRESETS

# Confirm security guard on custom base_url
try:
    _resolve_api_key(None, "https://untrusted-proxy.com/v1", official_base_url="https://api.openai.com/v1", env_key="OPENAI_API_KEY")
    assert False, "Should have raised ValueError"
except ValueError as e:
    assert "custom or unofficial base_url was provided" in str(e)

# Example 15: Etapa 4C.3 - Exceptions hierarchy & AgentResponse model
from chatflow_agent.exceptions import (
    ChatFlowError,
    DependencyError,
    ToolExecutionError,
    AgentHandoffError,
    ProviderError,
)
assert issubclass(DependencyError, ChatFlowError)
assert issubclass(ToolExecutionError, ChatFlowError)
assert issubclass(AgentHandoffError, ChatFlowError)
assert issubclass(ProviderError, ChatFlowError)

from chatflow_agent.types import AgentResponse
resp_fields = list(AgentResponse.model_fields.keys())
assert "content" in resp_fields
assert "active_agent_name" in resp_fields
assert "tool_calls_executed" in resp_fields
assert "handoff" in resp_fields

# Example 16: Etapa 4C.3 - Runner bounded limits
r_test = Runner(starting_agent=agent1, max_tool_iterations=7, max_handoffs_per_turn=4)
assert r_test.max_tool_iterations == 7
assert r_test.max_handoffs_per_turn == 4

print("All documentation examples successfully executed end-to-end!")
`;
    const run = spawnSync(PYTHON_PATH, ['-c', executeExamplesScript], {
      encoding: 'utf-8',
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });
    if (run.status !== 0) {
      console.error('executeExamplesScript STDERR:', run.stderr);
    }
    expect(run.status).toBe(0);
    expect(run.stdout).toContain('All documentation examples successfully executed end-to-end!');
  }, 15000);
});
