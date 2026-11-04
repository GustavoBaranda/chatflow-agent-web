import { spawn, execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const port = 3199;

console.log('=== [SMOKE TEST] Next.js Development Server Stability & Health Check ===');
console.log(`Port: ${port}`);
console.log(`Working directory: ${projectRoot}`);

// Ensure fumadocs-mdx outputs exist
try {
  execSync('npx fumadocs-mdx', { stdio: 'pipe', cwd: projectRoot });
} catch (e) {
  console.warn(`fumadocs-mdx pre-run notice: ${e.message}`);
}

const startTime = Date.now();
const devProcess = spawn('node', ['node_modules/next/dist/bin/next', 'dev', '--webpack', '-H', '127.0.0.1', '-p', String(port)], {
  cwd: projectRoot,
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, PORT: String(port) }
});

const trackedPid = devProcess.pid;
console.log(`Spawned development server (PID: ${trackedPid}). Monitoring startup...`);

let serverReady = false;
let stdoutLogs = '';
let stderrLogs = '';

devProcess.stdout.on('data', (d) => {
  stdoutLogs += d.toString();
});

devProcess.stderr.on('data', (d) => {
  stderrLogs += d.toString();
});

function cleanup() {
  if (trackedPid) {
    console.log(`Terminating smoke test server (PID: ${trackedPid})...`);
    try {
      devProcess.kill();
      // On Windows, ensure process tree spawned by this specific command terminates
      execSync(`powershell -Command "Stop-Process -Id ${trackedPid} -Force -ErrorAction SilentlyContinue"`, { stdio: 'ignore' });
    } catch {}
  }
}

process.on('SIGINT', () => { cleanup(); process.exit(1); });
process.on('SIGTERM', () => { cleanup(); process.exit(1); });
process.on('uncaughtException', (err) => {
  console.error('Smoke test uncaught exception:', err);
  cleanup();
  process.exit(1);
});

// Hard timeout of 75 seconds for readiness
const readyDeadline = Date.now() + 75000;
while (Date.now() < readyDeadline) {
  await new Promise(r => setTimeout(r, 750));
  try {
    const res = await fetch(`http://127.0.0.1:${port}/en/docs`);
    if (res.status === 200) {
      serverReady = true;
      break;
    }
  } catch {}
}

if (!serverReady) {
  console.error('FAIL: Dev server failed to respond with HTTP 200 within 75 seconds.');
  console.error('STDERR:', stderrLogs.slice(-1000));
  cleanup();
  process.exit(1);
}

const elapsedMs = Date.now() - startTime;
console.log(`PASS: Dev server responded HTTP 200 in ${elapsedMs}ms.`);

// Test key navigation routes
const smokeRoutes = [
  '/en/docs',
  '/en/docs/getting-started/quickstart',
  '/es/docs',
  '/pt-BR/docs',
];

let allRoutesOk = true;
for (const route of smokeRoutes) {
  try {
    const t0 = Date.now();
    const res = await fetch(`http://127.0.0.1:${port}${route}`);
    const time = Date.now() - t0;
    if (res.status === 200) {
      console.log(`PASS: [${res.status}] ${route} (${time}ms)`);
    } else {
      console.error(`FAIL: [${res.status}] ${route} (${time}ms)`);
      allRoutesOk = false;
    }
  } catch (err) {
    console.error(`FAIL: ${route} fetch error: ${err.message}`);
    allRoutesOk = false;
  }
}

// Test Search API Endpoint
let searchOk = false;
try {
  const searchRes = await fetch(`http://127.0.0.1:${port}/api/search?query=chatflow`);
  if (searchRes.status === 200) {
    const json = await searchRes.json();
    if (Array.isArray(json) && json.length > 0) {
      console.log(`PASS: /api/search?query=chatflow returned ${json.length} indexed results.`);
      searchOk = true;
    } else {
      console.error(`FAIL: /api/search returned empty results:`, json);
    }
  } else {
    console.error(`FAIL: /api/search returned status ${searchRes.status}`);
  }
} catch (err) {
  console.error(`FAIL: /api/search error: ${err.message}`);
}

cleanup();

if (allRoutesOk && searchOk) {
  console.log('=== Dev Server Smoke Test PASSED: All checks green. ===');
  process.exit(0);
} else {
  console.error('=== Dev Server Smoke Test FAILED: One or more checks failed. ===');
  process.exit(1);
}

