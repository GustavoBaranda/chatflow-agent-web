"""Downloads, isolates, and provisions exact published releases of chatflow-agent.

Features:
- Downloads official wheels from PyPI and verifies their SHA-256 checksums.
- Caches wheels in .cache/sdk-wheels/.
- Creates truly isolated Python virtual environments in .cache/sdk-venvs/<version>.
- Installs the exact wheel and its dependencies into each environment.
- Enforces strict mode by default: fails if PyPI distribution cannot be verified.
- Disables silent Git-tag fallback in strict mode.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
import urllib.request
from typing import Any

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CACHE_DIR = os.path.join(ROOT_DIR, ".cache")
WHEELS_DIR = os.path.join(CACHE_DIR, "sdk-wheels")
VENVS_DIR = os.path.join(CACHE_DIR, "sdk-venvs")
RELEASES_EXTRACT_DIR = os.path.join(CACHE_DIR, "sdk-releases")

PYPI_JSON_URL = "https://pypi.org/pypi/chatflow-agent/json"

TARGET_VERSIONS: dict[str, dict[str, str]] = {
    "0.3.4": {
        "tag": "v0.3.4",
        "pypi_version": "0.3.4",
        "expected_sha256": "f2d5e2a03822dfe1fa23824a04c608760063e9caea0e95149a1d437ffffa866e",
        "status": "stable",
    },
    "0.4.0rc1": {
        "tag": "v0.4.0rc1",
        "pypi_version": "0.4.0rc1",
        "expected_sha256": "3286d49301ee939cca2d47b145ba88f930d5135e8457d89e0e311009912105f2",
        "status": "prerelease",
    },
}


def get_pypi_metadata() -> dict[str, Any] | None:
    try:
        req = urllib.request.Request(
            PYPI_JSON_URL,
            headers={"User-Agent": "chatflow-agent-doc-parity/2.0"},
        )
        with urllib.request.urlopen(req, timeout=15) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as e:
        print(f"[SDK Cache] Warning: Could not fetch PyPI metadata ({e}).", file=sys.stderr)
        return None


def verify_file_sha256(filepath: str, expected_sha: str) -> bool:
    if not os.path.isfile(filepath):
        return False
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest().lower() == expected_sha.lower()


def download_wheel(version: str, meta: dict[str, Any] | None) -> str:
    os.makedirs(WHEELS_DIR, exist_ok=True)
    target_info = TARGET_VERSIONS[version]
    expected_sha = target_info["expected_sha256"]

    # Check if already cached and verified
    for existing in os.listdir(WHEELS_DIR):
        if existing.startswith(f"chatflow_agent-{version}-") and existing.endswith(".whl"):
            wheel_path = os.path.join(WHEELS_DIR, existing)
            if verify_file_sha256(wheel_path, expected_sha):
                return wheel_path

    # If metadata is missing, try fetching it
    if not meta:
        meta = get_pypi_metadata()

    if not meta or "releases" not in meta:
        raise RuntimeError(
            f"Cannot obtain PyPI metadata to download wheel for version {version}. "
            f"PyPI is unreachable and no verified wheel is cached in {WHEELS_DIR}."
        )

    releases = meta["releases"].get(version, [])
    whl_entry = next((f for f in releases if f.get("filename", "").endswith(".whl")), None)
    if not whl_entry or "url" not in whl_entry:
        raise RuntimeError(f"No .whl package found on PyPI for release {version}.")

    url = whl_entry["url"]
    filename = whl_entry["filename"]
    dest_path = os.path.join(WHEELS_DIR, filename)

    print(f"[SDK Cache] Downloading published {version} wheel from PyPI: {filename}...")
    req = urllib.request.Request(url, headers={"User-Agent": "chatflow-agent-doc-parity/2.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        whl_data = resp.read()

    actual_sha = hashlib.sha256(whl_data).hexdigest()
    if actual_sha.lower() != expected_sha.lower():
        raise ValueError(
            f"SHA256 mismatch for PyPI wheel {filename}! Expected {expected_sha}, got {actual_sha}"
        )

    with open(dest_path, "wb") as f:
        f.write(whl_data)

    print(f"[SDK Cache] Verified SHA-256 for {filename}: {actual_sha[:16]}...")
    return dest_path


def get_venv_python(venv_dir: str) -> str:
    if sys.platform == "win32":
        py = os.path.join(venv_dir, "Scripts", "python.exe")
    else:
        py = os.path.join(venv_dir, "bin", "python")
    return py


def ensure_virtual_environment(version: str, wheel_path: str) -> str:
    venv_dir = os.path.join(VENVS_DIR, version)
    py_exec = get_venv_python(venv_dir)

    needs_setup = not os.path.isfile(py_exec)
    if not needs_setup:
        # Check if already installed and working
        check_code = (
            "import chatflow_agent, sys; "
            f"assert chatflow_agent.__version__ == '{version}', 'version mismatch'; "
            f"assert '{version}' in chatflow_agent.__file__, 'path mismatch'; "
            "print('OK')"
        )
        try:
            res = subprocess.run(
                [py_exec, "-c", check_code],
                capture_output=True,
                text=True,
                check=False,
            )
            if res.returncode == 0 and "OK" in res.stdout:
                return py_exec
            needs_setup = True
        except Exception:
            needs_setup = True

    if needs_setup:
        print(f"[SDK Isolation] Provisioning isolated virtual environment for SDK {version}...")
        os.makedirs(venv_dir, exist_ok=True)
        # Create virtualenv using current python
        subprocess.check_call([sys.executable, "-m", "venv", venv_dir])

        # Install wheel
        print(f"[SDK Isolation] Installing {os.path.basename(wheel_path)} into {version} venv...")
        # Use pip to install the wheel
        install_cmd = [py_exec, "-m", "pip", "install", "--quiet", os.path.abspath(wheel_path)]
        subprocess.check_call(install_cmd)

    # Verification script
    verify_script = (
        "import chatflow_agent, sys\n"
        f"assert chatflow_agent.__version__ == '{version}', f'Expected version {version}, got {{chatflow_agent.__version__}}'\n"
        f"assert '{version}' in chatflow_agent.__file__, f'Expected file in {version} venv, got {{chatflow_agent.__file__}}'\n"
        "print(f'PROVISIONED:{chatflow_agent.__version__}:{chatflow_agent.__file__}')\n"
    )
    res = subprocess.run([py_exec, "-c", verify_script], capture_output=True, text=True, check=True)
    print(f"[SDK Isolation] {res.stdout.strip()}")

    # Also extract wheel into .cache/sdk-releases/<version> for AST inspection if needed
    target_extract = os.path.join(RELEASES_EXTRACT_DIR, version)
    if not os.path.isdir(os.path.join(target_extract, "chatflow_agent")):
        import zipfile
        os.makedirs(target_extract, exist_ok=True)
        with zipfile.ZipFile(wheel_path) as z:
            z.extractall(target_extract)

    return py_exec


def main() -> int:
    parser = argparse.ArgumentParser(description="Ensure isolated SDK releases from PyPI wheels")
    parser.add_argument("--version", choices=["0.3.4", "0.4.0rc1", "all"], default="all")
    parser.add_argument(
        "--allow-offline-git-fallback",
        action="store_true",
        help="NOT RECOMMENDED: Allow fallback to local git tag when PyPI is unreachable",
    )
    args = parser.parse_args()

    versions = ["0.3.4", "0.4.0rc1"] if args.version == "all" else [args.version]
    meta = get_pypi_metadata()

    results: dict[str, Any] = {}

    for v in versions:
        try:
            whl = download_wheel(v, meta)
            py_bin = ensure_virtual_environment(v, whl)
            results[v] = {
                "wheel": whl,
                "python": py_bin,
                "provenance": "pypi-wheel",
            }
        except Exception as e:
            if args.allow_offline_git-fallback:
                print(
                    f"\n[WARNING] OFFLINE SOURCE FALLBACK ACTIVE FOR {v} - THIS IS NOT EQUIVALENT TO PYPI RELEASE VALIDATION!\n"
                    f"Reason: {e}\n",
                    file=sys.stderr,
                )
                # Fallback logic only if explicitly enabled
                local_sdk = os.path.abspath(os.path.join(ROOT_DIR, "..", "chatflow-agent"))
                tag = TARGET_VERSIONS[v]["tag"]
                dest_dir = os.path.join(RELEASES_EXTRACT_DIR, v)
                os.makedirs(dest_dir, exist_ok=True)
                import io, tarfile
                tar_bytes = subprocess.check_output(["git", "-C", local_sdk, "archive", "--format=tar", tag, "src/"])
                with tarfile.open(fileobj=io.BytesIO(tar_bytes)) as tar:
                    for member in tar.getmembers():
                        if member.name.startswith("src/chatflow_agent"):
                            member.name = member.name[4:]
                            tar.extract(member, path=dest_dir)
                results[v] = {
                    "wheel": "none (git-archive)",
                    "python": sys.executable,
                    "provenance": "offline-git-fallback",
                }
            else:
                print(f"\n[STRICT ERROR] Failed to obtain or verify published release {v}: {e}", file=sys.stderr)
                return 1

    print("\n" + "=" * 60)
    print("  SDK RELEASE ENVIRONMENTS READY:")
    for v, info in results.items():
        print(f"  - Version {v}: {info['provenance']}")
        print(f"    Python: {info['python']}")
        print(f"    Wheel:  {info['wheel']}")
    print("=" * 60)
    return 0


if __name__ == "__main__":
    sys.exit(main())
