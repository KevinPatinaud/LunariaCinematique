import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execute = promisify(execFile);

function parseVersion(output: string): number[] | undefined {
  const match = /(\d+)\.(\d+)\.(\d+)/.exec(output.trim());
  return match ? match.slice(1, 4).map(Number) : undefined;
}

function compareVersions(a: number[], b: number[]): number {
  for (let i = 0; i < 3; i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff) return diff;
  }
  return 0;
}

/**
 * Locate the installed Antigravity CLI (`agy`) executable, including outside
 * an inherited PATH (e.g. Electron launched from Explorer on Windows).
 */
export async function findAgyExecutable(options: {
  env?: NodeJS.ProcessEnv;
  readVersion?: (executable: string) => Promise<string>;
} = {}): Promise<string> {
  const env = options.env ?? process.env;
  const binName = process.platform === 'win32' ? 'agy.exe' : 'agy';
  const candidates = (env.PATH ?? '')
    .split(path.delimiter)
    .filter(Boolean)
    .map(folder => path.join(folder, binName));

  if (process.platform === 'win32') {
    const localAppData = env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    candidates.push(path.join(localAppData, 'agy', 'bin', 'agy.exe'));
    if (env.USERPROFILE) {
      candidates.push(path.join(env.USERPROFILE, 'AppData', 'Local', 'agy', 'bin', 'agy.exe'));
    }
  } else {
    candidates.push(
      path.join(os.homedir(), '.local', 'bin', 'agy'),
      '/usr/local/bin/agy',
      '/opt/homebrew/bin/agy',
    );
  }

  const installed = new Map<string, string>();
  for (const candidate of candidates) {
    try {
      if (!(await fs.stat(candidate)).isFile()) continue;
      const real = await fs.realpath(candidate);
      const key = process.platform === 'win32' ? real.toLowerCase() : real;
      if (!installed.has(key)) installed.set(key, real);
    } catch {
      /* Try next candidate location. */
    }
  }

  const executables = [...installed.values()];
  if (!executables.length) {
    throw new Error('Antigravity CLI (agy) est introuvable sur cet ordinateur.');
  }
  if (executables.length === 1) return executables[0];

  const readVersion = options.readVersion ?? (async executable =>
    (await execute(executable, ['--version'], { env, windowsHide: true, timeout: 3000, maxBuffer: 4096 })).stdout
  );
  const versions = await Promise.all(executables.map(async executable => {
    try { return parseVersion(await readVersion(executable)); } catch { return undefined; }
  }));
  let newest = -1;
  for (let i = 0; i < versions.length; i++) {
    if (versions[i] && (newest < 0 || compareVersions(versions[i]!, versions[newest]!) > 0)) newest = i;
  }
  return executables[newest < 0 ? 0 : newest];
}
