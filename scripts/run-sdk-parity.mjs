#!/usr/bin/env node

/**
 * Cross-platform runner for chatflow-agent release parity validation.
 * Resolves Python interpreter portably across platforms and isolated venvs.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function resolvePython() {
  if (process.env.PYTHON_PATH && fs.existsSync(process.env.PYTHON_PATH)) {
    return process.env.PYTHON_PATH;
  }

  // Check provisioned release venv
  const cachedVenvWin = path.resolve(ROOT_DIR, '.cache', 'sdk-venvs', '0.3.4', 'Scripts', 'python.exe');
  if (fs.existsSync(cachedVenvWin)) return cachedVenvWin;

  const cachedVenvPosix = path.resolve(ROOT_DIR, '.cache', 'sdk-venvs', '0.3.4', 'bin', 'python');
  if (fs.existsSync(cachedVenvPosix)) return cachedVenvPosix;

  // Local workspace virtualenv if present
  const localVenvWin = path.resolve(ROOT_DIR, '.venv', 'Scripts', 'python.exe');
  if (fs.existsSync(localVenvWin)) return localVenvWin;

  const localVenvPosix = path.resolve(ROOT_DIR, '.venv', 'bin', 'python');
  if (fs.existsSync(localVenvPosix)) return localVenvPosix;

  return process.platform === 'win32' ? 'python' : 'python3';
}

const pythonBin = resolvePython();
const scriptPath = path.resolve(__dirname, 'validate-release-parity.py');
const args = [scriptPath, ...process.argv.slice(2)];

const result = spawnSync(pythonBin, args, {
  stdio: 'inherit',
  cwd: ROOT_DIR,
  env: {
    ...process.env,
    PYTHONIOENCODING: 'utf-8',
  },
});

process.exit(result.status ?? 1);
