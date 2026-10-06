import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const PORT = 4333;
const DEBUG_PORT = 9225;
const BASE = '/Vibration_study/';
const DIST = path.resolve('dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, `http://127.0.0.1:${PORT}`).pathname);
    if (!urlPath.startsWith(BASE)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    let rel = urlPath.slice(BASE.length);
    if (!rel || rel.endsWith('/')) rel += 'index.html';
    const filePath = path.join(DIST, rel);
    const s = await stat(filePath).catch(() => null);
    if (!s || !s.isFile()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(await readFile(filePath));
  } catch (err) {
    res.writeHead(500);
    res.end(String(err));
  }
});

await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
console.log(`Static server running on http://127.0.0.1:${PORT}${BASE}`);

const EDGE_BIN = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const dataDir = path.resolve(`dist/qa/edge-profile-${Date.now()}`);

// Spawn Edge
const edge = spawn(EDGE_BIN, [
  '--headless=new',
  `--remote-debugging-port=${DEBUG_PORT}`,
  `--user-data-dir=${dataDir}`,
  'about:blank',
]);
edge.stderr.on('data', (d) => process.stderr.write(`[Edge] ${d}`));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await sleep(2000);

let exitCode = 0;
try {
  const runner = spawn('node', [
    'scripts/verify/p5-2-browser.mjs',
    String(DEBUG_PORT),
    `http://127.0.0.1:${PORT}${BASE}p5-2/`,
    'dist/qa',
  ], { stdio: 'inherit' });

  exitCode = await new Promise((resolve) => {
    runner.on('close', resolve);
  });
} finally {
  try { edge.kill(); } catch {}
  server.close();
}

process.exit(exitCode);
