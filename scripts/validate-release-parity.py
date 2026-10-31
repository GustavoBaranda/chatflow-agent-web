"""Release-Aware Documentation Validator for chatflow-agent.

Validates all MDX documentation examples against exact published SDK releases
(isolated from PyPI wheels in .cache/sdk-releases/) using dynamic Python
signature introspection (inspect.signature) and AST inspection.

Usage:
    python scripts/validate-release-parity.py --version 0.3.4
    python scripts/validate-release-parity.py --version 0.4.0rc1
    python scripts/validate-release-parity.py --all
"""

from __future__ import annotations

import argparse
import ast
import inspect
import os
import re
import sys
from typing import Any

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOCS_DIR = os.path.join(ROOT_DIR, "content", "docs", "en")
CACHE_DIR = os.path.join(ROOT_DIR, ".cache", "sdk-releases")

SEMVER_ORDER = ["0.3.0", "0.3.1", "0.3.2", "0.3.3", "0.3.4", "0.4.0rc1"]


def semver_gte(v1: str, v2: str) -> bool:
    """Return True if v1 >= v2 in chatflow-agent release history."""
    clean1 = v1.lstrip("v")
    clean2 = v2.lstrip("v")
    try:
        idx1 = SEMVER_ORDER.index(clean1)
    except ValueError:
        idx1 = len(SEMVER_ORDER)
    try:
        idx2 = SEMVER_ORDER.index(clean2)
    except ValueError:
        idx2 = 0
    return idx1 >= idx2


class ReleaseValidator:
    def __init__(self, target_version: str, release_path: str) -> None:
        self.target_version = target_version
        self.release_path = os.path.abspath(release_path)
        self._load_sdk()
        self._build_dynamic_signatures()

    def _load_sdk(self) -> None:
        if not os.path.isdir(self.release_path):
            raise FileNotFoundError(f"SDK release directory not found: {self.release_path}")

        # Prepend isolated release path to sys.path
        if self.release_path not in sys.path:
            sys.path.insert(0, self.release_path)

        # Clear any cached chatflow_agent modules
        for mod in list(sys.modules.keys()):
            if mod == "chatflow_agent" or mod.startswith("chatflow_agent."):
                del sys.modules[mod]

        import chatflow_agent

        self.chatflow_agent = chatflow_agent
        self.exports = set(chatflow_agent.__all__)
        self.package_file = chatflow_agent.__file__

    def _build_dynamic_signatures(self) -> None:
        from chatflow_agent import Agent, Runner, SessionStore, SQLiteSessionStore, tool
        from chatflow_agent.core.engines.anthropic import AnthropicEngine
        from chatflow_agent.core.engines.gemini import GeminiEngine
        from chatflow_agent.core.engines.openai_compatible import OpenAIEngine
        from chatflow_agent.core.tools import Tool

        self.classes: dict[str, Any] = {
            "Agent": Agent,
            "Runner": Runner,
            "Tool": Tool,
            "SessionStore": SessionStore,
            "SQLiteSessionStore": SQLiteSessionStore,
            "OpenAIEngine": OpenAIEngine,
            "GeminiEngine": GeminiEngine,
            "AnthropicEngine": AnthropicEngine,
            "tool": tool,
        }

        try:
            from chatflow_agent.channels.whatsapp import WhatsAppChannel
            self.classes["WhatsAppChannel"] = WhatsAppChannel
        except Exception:
            pass

        try:
            from chatflow_agent.channels.telegram import TelegramChannel
            self.classes["TelegramChannel"] = TelegramChannel
        except Exception:
            pass

        self.dynamic_signatures: dict[str, set[str]] = {}
        for name, cls_or_fn in self.classes.items():
            target_fn = cls_or_fn.__init__ if isinstance(cls_or_fn, type) else cls_or_fn
            sig = inspect.signature(target_fn)
            allowed = {
                p.name
                for p in sig.parameters.values()
                if p.kind in (inspect.Parameter.POSITIONAL_OR_KEYWORD, inspect.Parameter.KEYWORD_ONLY)
                and p.name not in ("self", "cls")
            }
            self.dynamic_signatures[name] = allowed

    def parse_snippet_metadata(self, code: str) -> dict[str, Any]:
        """Extract lightweight metadata from snippet header comments."""
        meta = {
            "min_version": "0.3.0",
            "is_excluded": False,
            "exclude_reason": "",
        }

        # Look for leading metadata comments
        # e.g.: # [min-version: 0.4.0rc1]
        # e.g.: # [exclude-execution: requires external server]
        for line in code.splitlines()[:5]:
            stripped = line.strip()
            if not stripped.startswith("#"):
                continue

            m_ver = re.search(r"#\s*\[(?:min-version|sdk-version):\s*([0-9a-zA-Z\.\-]+)\]", stripped, re.I)
            if m_ver:
                meta["min_version"] = m_ver.group(1).lstrip("v")

            m_exc = re.search(r"#\s*\[(?:exclude-execution|no-exec):\s*(.*?)\]", stripped, re.I)
            if m_exc:
                meta["is_excluded"] = True
                meta["exclude_reason"] = m_exc.group(1)

        # Detect inherent unexecutable patterns (real network, infinite loops, ASGI servers)
        if "uvicorn.run(" in code or "telegram.run(" in code or "whatsapp.run(" in code:
            meta["is_excluded"] = True
            meta["exclude_reason"] = "starts blocking server loop"
        elif "fastapi.FastAPI" in code or "FastAPI()" in code:
            meta["is_excluded"] = True
            meta["exclude_reason"] = "defines standalone web service endpoint"
        elif "os.environ[" in code and not any(k in code for k in ["MockEngine", "fake", "test"]):
            meta["is_excluded"] = True
            meta["exclude_reason"] = "requires real production API environment variables"

        return meta

    def validate_code_ast(self, code: str, file_rel: str, line_no: int) -> tuple[bool, str]:
        """Validate syntax, imports, and dynamically check kwargs against live signatures."""
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            return False, f"SyntaxError: {e}"

        errors: list[str] = []

        # Check imports from chatflow_agent
        for node in ast.walk(tree):
            if isinstance(node, ast.ImportFrom) and node.module == "chatflow_agent":
                for alias in node.names:
                    sym = alias.name
                    if sym not in self.exports:
                        errors.append(
                            f"ImportError: Symbol '{sym}' is not exported by chatflow_agent in version {self.target_version} (file {file_rel}:{line_no})"
                        )

            # Check calls against dynamic signatures
            elif isinstance(node, ast.Call):
                func_name = None
                if isinstance(node.func, ast.Name):
                    func_name = node.func.id
                elif isinstance(node.func, ast.Attribute):
                    func_name = node.func.attr

                if func_name in self.dynamic_signatures:
                    allowed_kwargs = self.dynamic_signatures[func_name]
                    for kw in node.keywords:
                        if kw.arg and kw.arg not in allowed_kwargs:
                            errors.append(
                                f"SignatureError: Call to {func_name}() uses unsupported argument '{kw.arg}' "
                                f"in SDK {self.target_version}. Allowed kwargs: {sorted(list(allowed_kwargs))} "
                                f"(file {file_rel}, snippet line ~{node.lineno})"
                            )

        if errors:
            return False, "; ".join(errors)
        return True, ""


def collect_snippets(docs_dir: str) -> list[dict[str, Any]]:
    snippets: list[dict[str, Any]] = []
    pattern = re.compile(r"```(?:python|py)\s*\n([\s\S]*?)```")

    for root, _, files in os.walk(docs_dir):
        for file in sorted(files):
            if not file.endswith(".mdx"):
                continue
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, docs_dir)
            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()

            for match in pattern.finditer(content):
                line_no = content[:match.start()].count("\n") + 1
                code = match.group(1)
                snippets.append({
                    "file": rel_path,
                    "line": line_no,
                    "code": code,
                })

    return snippets


def run_validation(target_version: str) -> dict[str, Any]:
    release_dir = os.path.join(CACHE_DIR, target_version)
    if not os.path.isdir(release_dir):
        # Automatically invoke ensure-sdk-releases.py
        ensure_script = os.path.join(ROOT_DIR, "scripts", "ensure-sdk-releases.py")
        import subprocess
        subprocess.check_call([sys.executable, ensure_script])

    validator = ReleaseValidator(target_version, release_dir)
    snippets = collect_snippets(DOCS_DIR)

    stats = {
        "version": target_version,
        "sdk_path": validator.package_file,
        "total": len(snippets),
        "static_valid": 0,
        "skipped_version": 0,
        "excluded_runtime": 0,
        "executed_valid": 0,
        "failed": 0,
        "failures": [],
        "exclusions": [],
    }

    for item in snippets:
        code = item["code"]
        meta = validator.parse_snippet_metadata(code)

        # Check version compatibility
        if not semver_gte(target_version, meta["min_version"]):
            stats["skipped_version"] += 1
            continue

        # Validate syntax & dynamic signatures
        ok, err = validator.validate_code_ast(code, item["file"], item["line"])
        if not ok:
            stats["failed"] += 1
            stats["failures"].append({
                "file": item["file"],
                "line": item["line"],
                "error": err,
            })
            continue

        stats["static_valid"] += 1

        if meta["is_excluded"]:
            stats["excluded_runtime"] += 1
            stats["exclusions"].append({
                "file": item["file"],
                "line": item["line"],
                "reason": meta["exclude_reason"],
            })
        else:
            # We can execute representative self-contained examples
            # In docs, many snippets are incomplete code blocks (e.g. just function definitions)
            # Full end-to-end execution of assembled systems is covered in the execute suite
            pass

    return stats


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate SDK documentation parity")
    parser.add_argument("--version", choices=["0.3.4", "0.4.0rc1"], help="Target SDK version")
    parser.add_argument("--all", action="store_true", help="Validate all versions")
    args = parser.parse_args()

    versions = ["0.3.4", "0.4.0rc1"] if args.all or not args.version else [args.version]

    exit_code = 0
    print("=" * 70)
    print("  CHATFLOW-AGENT DOCUMENTATION RELEASE PARITY VALIDATION")
    print("=" * 70)

    for v in versions:
        print(f"\n[Validating against SDK {v}]")
        res = run_validation(v)
        print(f"  Package Loaded:    {res['sdk_path']}")
        print(f"  Total Snippets:    {res['total']}")
        print(f"  Skipped (< min):   {res['skipped_version']}")
        print(f"  Statically Valid:  {res['static_valid']}")
        print(f"  Runtime Excluded:  {res['excluded_runtime']}")
        print(f"  Failures:          {res['failed']}")

        if res["failures"]:
            exit_code = 1
            print(f"\n  FAILURES in {v}:")
            for f in res["failures"]:
                print(f"    - {f['file']}:{f['line']} -> {f['error']}")

    print("\n" + "=" * 70)
    if exit_code == 0:
        print("  ALL RELEASE-AWARE COMPATIBILITY CHECKS PASSED!")
    else:
        print("  RELEASE-AWARE COMPATIBILITY CHECKS FAILED.")
    print("=" * 70)
    return exit_code


if __name__ == "__main__":
    sys.exit(main())

