"""Downloads and isolates exact published releases of chatflow-agent from PyPI wheels.

Ensures published releases (0.3.4 and 0.4.0rc1) are available in .cache/sdk-releases/
for isolated release-parity testing, without using the development checkout.
"""

from __future__ import annotations

import hashlib
import io
import json
import os
import subprocess
import sys
import urllib.request
import zipfile

CACHE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".cache", "sdk-releases"))
PYPI_JSON_URL = "https://pypi.org/pypi/chatflow-agent/json"

TARGET_VERSIONS = {
    "0.3.4": {
        "tag": "v0.3.4",
        "pypi_version": "0.3.4",
        "status": "stable",
    },
    "0.4.0rc1": {
        "tag": "v0.4.0rc1",
        "pypi_version": "0.4.0rc1",
        "status": "prerelease",
    },
}


def get_pypi_metadata() -> dict | None:
    try:
        req = urllib.request.Request(
            PYPI_JSON_URL,
            headers={"User-Agent": "chatflow-agent-doc-parity/1.0"},
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as e:
        print(f"[SDK Release Cache] Notice: Could not fetch PyPI metadata ({e}).", file=sys.stderr)
        return None


def extract_git_tag_fallback(version: str, tag: str, dest_dir: str) -> bool:
    """Fallback if PyPI is unreachable: extracts src/ from local git tag if available."""
    local_sdk_repo = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "chatflow-agent"))
    if not os.path.isdir(os.path.join(local_sdk_repo, ".git")):
        return False

    try:
        print(f"[SDK Release Cache] Extracting {tag} from local SDK repository fallback...", file=sys.stderr)
        cmd = ["git", "-C", local_sdk_repo, "archive", "--format=tar", tag, "src/"]
        tar_bytes = subprocess.check_output(cmd)
        import tarfile

        with tarfile.open(fileobj=io.BytesIO(tar_bytes)) as tar:
            # We want chatflow_agent extracted into dest_dir
            for member in tar.getmembers():
                if member.name.startswith("src/chatflow_agent"):
                    # strip 'src/' prefix
                    member.name = member.name[4:]
                    tar.extract(member, path=dest_dir)
        return True
    except Exception as e:
        print(f"[SDK Release Cache] Git fallback failed for {tag}: {e}", file=sys.stderr)
        return False


def ensure_release(version: str, meta: dict | None) -> str:
    target_path = os.path.join(CACHE_DIR, version)
    pkg_init = os.path.join(target_path, "chatflow_agent", "__init__.py")
    if os.path.isfile(pkg_init):
        return target_path

    os.makedirs(target_path, exist_ok=True)
    target_info = TARGET_VERSIONS.get(version)
    if not target_info:
        raise ValueError(f"Unknown target SDK version: {version}")

    # Try downloading official PyPI wheel first
    downloaded = False
    if meta and "releases" in meta:
        releases = meta["releases"].get(version, [])
        whl_entry = next((f for f in releases if f.get("filename", "").endswith(".whl")), None)
        if whl_entry and "url" in whl_entry:
            url = whl_entry["url"]
            expected_sha256 = whl_entry.get("digests", {}).get("sha256")
            print(f"[SDK Release Cache] Downloading published {version} wheel from PyPI: {whl_entry['filename']}...")
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "chatflow-agent-doc-parity/1.0"})
                with urllib.request.urlopen(req, timeout=30) as resp:
                    whl_data = resp.read()

                if expected_sha256:
                    actual_sha256 = hashlib.sha256(whl_data).hexdigest()
                    if actual_sha256 != expected_sha256:
                        raise ValueError(f"SHA256 mismatch for {whl_entry['filename']}! Expected {expected_sha256}, got {actual_sha256}")

                with zipfile.ZipFile(io.BytesIO(whl_data)) as z:
                    z.extractall(target_path)
                downloaded = True
                print(f"[SDK Release Cache] Successfully extracted published wheel for {version}.")
            except Exception as e:
                print(f"[SDK Release Cache] Failed to download/verify wheel from PyPI: {e}", file=sys.stderr)

    if not downloaded:
        tag = target_info["tag"]
        success = extract_git_tag_fallback(version, tag, target_path)
        if not success:
            raise RuntimeError(
                f"Could not obtain SDK distribution for version {version}. "
                f"Neither PyPI download nor local git tag '{tag}' succeeded."
            )

    if not os.path.isfile(pkg_init):
        raise RuntimeError(f"SDK release {version} extracted but {pkg_init} not found.")

    return target_path


def main() -> None:
    os.makedirs(CACHE_DIR, exist_ok=True)
    meta = get_pypi_metadata()
    for version in TARGET_VERSIONS:
        path = ensure_release(version, meta)
        print(f"RELEASE_READY:{version}:{path}")


if __name__ == "__main__":
    main()

