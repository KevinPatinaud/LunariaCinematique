import { promises as fs } from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execute = promisify(execFile);
type Version = { numbers: number[]; prerelease: string[] };

function version(output: string): Version | undefined {
  const match = /^codex-cli\s+(\d+)\.(\d+)\.(\d+)(?:-([\w.-]+))?/m.exec(output.trim());
  return match ? { numbers: match.slice(1, 4).map(Number), prerelease: match[4]?.split('.') ?? [] } : undefined;
}

function compareVersions(a: Version, b: Version): number {
  for (let index = 0; index < 3; index++) {
    const difference = a.numbers[index] - b.numbers[index];
    if (difference) return difference;
  }
  if (!a.prerelease.length || !b.prerelease.length) return Number(!a.prerelease.length) - Number(!b.prerelease.length);
  for (let index = 0; index < Math.max(a.prerelease.length, b.prerelease.length); index++) {
    const left = a.prerelease[index], right = b.prerelease[index];
    if (left === right) continue;
    if (left === undefined || right === undefined) return left === undefined ? -1 : 1;
    const leftNumeric = /^\d+$/.test(left), rightNumeric = /^\d+$/.test(right);
    if (leftNumeric && rightNumeric) return Number(left) - Number(right);
    if (leftNumeric !== rightNumeric) return leftNumeric ? -1 : 1;
    return left < right ? -1 : 1;
  }
  return 0;
}

/** Discovery and generation must use the same client, including outside Codex's inherited PATH. */
export async function findCodexExecutable(options: {
  env?: NodeJS.ProcessEnv;
  readVersion?: (executable: string) => Promise<string>;
} = {}): Promise<string> {
  const env = options.env ?? process.env;
  const candidates = (env.PATH ?? '').split(path.delimiter).filter(Boolean).map(folder => path.join(folder, process.platform === 'win32' ? 'codex.exe' : 'codex'));
  if (process.platform === 'win32') {
    if (env.APPDATA) {
      const arch = process.arch === 'arm64' ? 'aarch64' : 'x86_64';
      candidates.push(path.join(env.APPDATA, 'npm', 'node_modules', '@openai', 'codex', 'node_modules', '@openai', `codex-win32-${process.arch}`, 'vendor', `${arch}-pc-windows-msvc`, 'bin', 'codex.exe'));
    }
    if (env.LOCALAPPDATA) {
      const desktopBin = path.join(env.LOCALAPPDATA, 'OpenAI', 'Codex', 'bin');
      const folders = await fs.readdir(desktopBin, { withFileTypes: true }).catch(() => []);
      candidates.push(...folders.filter(folder => folder.isDirectory()).map(folder => path.join(desktopBin, folder.name, 'codex.exe')));
    }
  }
  const installed = new Map<string, string>();
  for (const candidate of candidates) {
    try {
      if (!(await fs.stat(candidate)).isFile()) continue;
      const real = await fs.realpath(candidate);
      const key = process.platform === 'win32' ? real.toLowerCase() : real;
      if (!installed.has(key)) installed.set(key, real);
    } catch { /* Try the next installed location. */ }
  }
  const executables = [...installed.values()];
  if (!executables.length) throw new Error('Codex CLI est introuvable sur cet ordinateur. Installe Codex CLI puis connecte-le avec « codex login ».');
  if (process.platform !== 'win32' || executables.length === 1) return executables[0];

  // Desktop and npm installations evolve independently. Filesystem timestamps
  // and PATH order do not establish which client has the current model catalog.
  const readVersion = options.readVersion ?? (async executable => (await execute(executable, ['--version'], { env, windowsHide: true, timeout: 3000, maxBuffer: 4096 })).stdout);
  const versions = await Promise.all(executables.map(async executable => {
    try { return version(await readVersion(executable)); } catch { return undefined; }
  }));
  let newest = -1;
  for (let index = 0; index < versions.length; index++) {
    if (versions[index] && (newest < 0 || compareVersions(versions[index]!, versions[newest]!) > 0)) newest = index;
  }
  return executables[newest < 0 ? 0 : newest];
}
