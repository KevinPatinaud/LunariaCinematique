import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// TypeScript does not remove outputs whose source was deleted.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const groups = { main: ['dist/main', 'dist/preload', 'dist/shared'], tests: ['dist-tests'] };
const folders = groups[process.argv[2]];
if (!folders) throw Error('Usage : node scripts/clean-output.mjs main|tests');
for (const folder of folders) {
  const target = path.resolve(root, folder);
  if (!target.startsWith(root + path.sep)) throw Error('Sortie hors du Studio : ' + folder);
  let current = root;
  for (const part of path.relative(root, target).split(path.sep)) {
    current = path.join(current, part);
    const entry = await fs.lstat(current).catch(error => { if (error.code !== 'ENOENT') throw error; });
    if (entry?.isSymbolicLink()) throw Error('Output cannot be a symbolic link: ' + folder);
  }
  await fs.rm(target, { recursive: true, force: true });
}
