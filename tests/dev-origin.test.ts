import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { createServer } from 'vite';
import { parseDevOrigin } from '../src/main/devOrigin.js';

test('parseDevOrigin accepts unprivileged loopback HTTP origins only in development', () => {
  assert.equal(parseDevOrigin(undefined, false), undefined);
  assert.equal(parseDevOrigin('', false), undefined);
  assert.equal(parseDevOrigin('http://127.0.0.1:5173', false), 'http://127.0.0.1:5173');
  assert.equal(parseDevOrigin('http://127.0.0.1:5174', false), 'http://127.0.0.1:5174');
  assert.equal(parseDevOrigin('http://127.0.0.1:1024', false), 'http://127.0.0.1:1024');
  assert.equal(parseDevOrigin('http://127.0.0.1:65535', false), 'http://127.0.0.1:65535');
  assert.equal(parseDevOrigin('http://127.0.0.1:5173', true), undefined);
  assert.equal(parseDevOrigin('https://evil.example', true), undefined);
});

for (const invalid of [
  'http://127.0.0.1',
  'http://127.0.0.1:0',
  'http://127.0.0.1:80',
  'http://127.0.0.1:1023',
  'http://127.0.0.1:65536',
  'http://127.0.0.1:5173/',
  'http://127.0.0.1:5173/index.html',
  'http://127.0.0.1:5173?debug=1',
  'http://127.0.0.1:5173#section',
  'http://user:pass@127.0.0.1:5173',
  'https://127.0.0.1:5173',
  'http://localhost:5173',
  'http://192.168.1.10:5173',
  'http://evil.example:5173',
  'http://127.0.0.1:5173@evil.example',
  'file:///C:/Windows/System32',
  'not a url',
]) {
  test(`parseDevOrigin rejects untrusted dev origin: ${invalid}`, () => {
    assert.throws(() => parseDevOrigin(invalid, false), /Origine de développement non autorisée/);
  });
}

test('Vite dev server falls back to a free port and updates HMR CSP dynamically', async t => {
  const blocker = net.createServer();
  await new Promise<void>((resolve, reject) => {
    blocker.once('error', reject);
    blocker.listen(0, '127.0.0.1', () => resolve());
  });
  t.after(() => new Promise<void>(resolve => blocker.close(() => resolve())));
  const blockedAddress = blocker.address();
  assert.ok(blockedAddress && typeof blockedAddress === 'object');

  const vite = await createServer({
    configFile: path.join(process.cwd(), 'vite.config.ts'),
    logLevel: 'silent',
    server: { host: '127.0.0.1', port: blockedAddress.port },
  });
  t.after(() => vite.close());
  assert.equal(vite.config.server.strictPort, false);

  await vite.listen();
  const activeAddress = vite.httpServer?.address();
  assert.ok(activeAddress && typeof activeAddress === 'object');
  assert.notEqual(activeAddress.port, blockedAddress.port);

  const origin = `http://127.0.0.1:${activeAddress.port}`;
  assert.equal(parseDevOrigin(origin, false), origin);

  const response = await fetch(origin);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(
    html.includes(`connect-src 'self' ws://127.0.0.1:${activeAddress.port};`),
    `Expected dynamic HMR CSP for port ${activeAddress.port}, got: ${html}`,
  );
});

test('renderer index.html keeps strict static CSP without hardcoded dev port', async () => {
  const html = await fs.readFile(path.join(process.cwd(), 'src', 'renderer', 'index.html'), 'utf8');
  assert.ok(html.includes("connect-src 'self';"));
  assert.ok(!html.includes('ws://127.0.0.1:5173'));
});
