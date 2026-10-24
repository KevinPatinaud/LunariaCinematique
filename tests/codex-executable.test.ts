import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { findCodexExecutable } from '../src/main/codexExecutable.js';

test('Windows Studio selects the newest installed Codex independently of its inherited PATH', { skip: process.platform !== 'win32' }, async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-codex-installations-'));
  const local = path.join(root, 'Local'), roaming = path.join(root, 'Roaming');
  const oldPath = path.join(root, 'path', 'codex.exe');
  const arch = process.arch === 'arm64' ? 'aarch64' : 'x86_64';
  const npm = path.join(roaming, 'npm', 'node_modules', '@openai', 'codex', 'node_modules', '@openai', `codex-win32-${process.arch}`, 'vendor', `${arch}-pc-windows-msvc`, 'bin', 'codex.exe');
  const desktop = (name: string) => path.join(local, 'OpenAI', 'Codex', 'bin', name, 'codex.exe');
  const olderDesktop = desktop('old-bundle'), currentDesktop = desktop('current-bundle');
  const versions = new Map([[oldPath, '0.146.0'], [npm, '0.147.0'], [olderDesktop, '0.162.0-alpha.9.2'], [currentDesktop, '0.162.0-alpha.17.2']]);
  try {
    for (const executable of versions.keys()) {
      await fs.mkdir(path.dirname(executable), { recursive: true }); await fs.writeFile(executable, 'fixture');
    }
    const env = { PATH: path.dirname(oldPath), APPDATA: roaming, LOCALAPPDATA: local };
    const readVersion = async (executable: string) => `codex-cli ${versions.get(executable)}`;
    assert.equal(await findCodexExecutable({ env, readVersion }), currentDesktop);
    // The desktop app can be older than an npm/PATH install, too.
    versions.set(npm, '0.163.0');
    assert.equal(await findCodexExecutable({ env, readVersion }), npm);
    // Stable wins over a prerelease of the same version.
    versions.set(currentDesktop, '0.163.0-alpha.20');
    assert.equal(await findCodexExecutable({ env, readVersion }), npm);
    // An unreadable installation cannot hide the working alternatives.
    assert.equal(await findCodexExecutable({ env, readVersion: async executable => {
      if (executable === currentDesktop) throw new Error('Unusable desktop install');
      return readVersion(executable);
    } }), npm);
    // Preserve the existing PATH fallback if version probes are unavailable.
    assert.equal(await findCodexExecutable({ env, readVersion: async () => { throw new Error('No version'); } }), oldPath);
    await assert.rejects(findCodexExecutable({ env: { LOCALAPPDATA: path.join(root, 'missing') } }), /introuvable/);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});
