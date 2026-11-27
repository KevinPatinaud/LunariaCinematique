#!/usr/bin/env node
/** Run npm test/schema first. Synchronize technical copies; never publish a campaign. */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const studio = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = 'tools/design/sync-manifest.json';
const forwardingHeader = '// Generated forwarding module; edit Studio shared sources only.';
const addonPrefix = 'addons/lunaria_cinematics/';
const schemaFiles = [
  { source: 'game-project.schema.json', target: 'game-project.schema.json' },
  { source: 'home-screen.defaults.json', target: 'home_screen.defaults.json' },
];
const slash = value => value.split(path.sep).join('/');
const inside = (root, file) => {
  const relative = path.relative(root, file);
  return relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative);
};
async function stat(file) {
  try { return await fs.lstat(file); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
async function safePath(root, relative) {
  const file = path.resolve(root, relative);
  if (!inside(root, file)) throw Error('Path outside the project: ' + relative);
  let current = root;
  for (const part of path.relative(root, file).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    const entry = await stat(current);
    if (entry?.isSymbolicLink()) throw Error('Managed copies cannot use symbolic links: ' + current);
  }
  return file;
}
async function read(root, relative) {
  const file = await safePath(root, relative);
  if (!(await stat(file))?.isFile()) throw Error('Missing source file: ' + relative);
  return fs.readFile(file);
}
async function list(root, relative) {
  const folder = await safePath(root, relative);
  const entry = await stat(folder);
  if (!entry) return [];
  if (!entry.isDirectory()) throw Error('Expected a directory: ' + relative);
  const result = [];
  for (const item of await fs.readdir(folder, { withFileTypes: true })) {
    const child = slash(path.join(relative, item.name));
    await safePath(root, child);
    if (item.isDirectory()) result.push(...await list(root, child));
    else if (item.isFile()) result.push(child);
  }
  return result.sort();
}
function permitted(relative) {
  if (typeof relative !== 'string' || relative.includes('\\') || relative.split('/').some(p => !p || p === '.' || p === '..')) return false;
  return /^tools\/design\/shared\/.+\.js$/.test(relative)
    || /^tools\/design\/[^/]+\.js$/.test(relative)
    || /^addons\/lunaria_cinematics\/[^/]+\.(gd|tscn|json|png)$/.test(relative)
    || schemaFiles.some(file => relative === 'content/design/' + file.target);
}

async function prepare(studioRoot) {
  const sourcePrefix = 'src/shared/';
  const compiledPrefix = 'dist-tests/src/shared/';
  const sources = (await list(studioRoot, 'src/shared'))
    .filter(file => file.endsWith('.ts') && !file.endsWith('.d.ts'))
    .map(file => file.slice(sourcePrefix.length).replace(/\.ts$/, '.js'));
  const current = new Set(sources);
  const roots = sources.filter(file => /^game\/[^/]+\.js$/.test(file)).sort();
  if (!roots.length) throw Error('Missing contract sources: src/shared/game');
  const modules = new Map();
  async function visit(relative) {
    if (modules.has(relative)) return;
    if (!current.has(relative)) throw Error('Compiled module has no current source: ' + relative);
    const contents = await read(studioRoot, compiledPrefix + relative);
    modules.set(relative, contents);
    for (const imported of ts.preProcessFile(contents.toString(), true, true).importedFiles) {
      if (!imported.fileName.startsWith('.')) continue;
      const target = path.resolve(path.dirname(path.join(studioRoot, compiledPrefix, relative)), imported.fileName);
      const dependency = slash(path.relative(path.join(studioRoot, compiledPrefix), target));
      if (!inside(path.join(studioRoot, compiledPrefix), target)) throw Error('Import outside the shared modules: ' + imported.fileName);
      await visit(dependency);
    }
  }
  for (const root of roots) await visit(root);
  const expected = new Map([...modules].map(([file, bytes]) => ['tools/design/shared/' + file, bytes]));
  for (const file of roots) expected.set('tools/design/' + path.basename(file), Buffer.from(`${forwardingHeader}\nexport * from './shared/${file}';\n`));
  for (const file of schemaFiles) {
    const contents = await read(studioRoot, 'schema/' + file.source);
    JSON.parse(contents.toString());
    expected.set('content/design/' + file.target, contents);
  }
  const addon = (await list(studioRoot, 'godot/addons/lunaria_cinematics'))
    .filter(file => /\.(gd|tscn|json|png)$/.test(file));
  for (const required of ['CinematicPlayer.gd', 'CinematicOverlay.tscn', 'cinematic.schema.json']) {
    if (!addon.some(file => path.basename(file) === required)) throw Error('Lecteur source incomplet : ' + required);
  }
  for (const file of addon) {
    const contents = await read(studioRoot, file);
    if (file.endsWith('.json')) JSON.parse(contents.toString());
    expected.set(addonPrefix + path.basename(file), contents);
  }
  for (const [file, contents] of expected) {
    if (!file.startsWith(addonPrefix) || file.endsWith('.png')) continue;
    const refs = [...contents.toString().matchAll(/preload\(\s*["']([^"']+)["']/g)].map(match => match[1]);
    refs.push(...[...contents.toString().matchAll(/res:\/\/addons\/lunaria_cinematics\/([^"'\s]+)["']/g)].map(match => 'res://' + addonPrefix + match[1]));
    for (const ref of refs) {
      if (ref.startsWith('res://') && !ref.startsWith('res://' + addonPrefix)) continue;
      const target = ref.startsWith('res://') ? ref.slice(6) : addonPrefix + ref;
      if (!expected.has(target)) throw Error('Missing source player dependency: ' + ref);
    }
  }
  return { expected, sources, files: { modules: modules.size, aliases: roots.length, addon: addon.length } };
}

async function previousFiles(root, sources) {
  const previous = new Set();
  const manifest = await safePath(root, manifestPath);
  if (await stat(manifest)) {
    const record = JSON.parse((await fs.readFile(manifest)).toString());
    if (record?.version !== 1 || !Array.isArray(record.files) || record.files.some(file => !permitted(file)) || new Set(record.files).size !== record.files.length) {
      throw Error('Invalid managed-copy manifest: ' + manifestPath);
    }
    for (const file of record.files) previous.add(file);
  }
  // Bootstrap ownership from the old copier without claiming unknown user files.
  for (const file of sources) previous.add('tools/design/shared/' + file);
  for (const file of await list(root, 'tools/design')) {
    if (!/^tools\/design\/[^/]+\.js$/.test(file)) continue;
    if ((await fs.readFile(await safePath(root, file))).toString().startsWith(forwardingHeader)) previous.add(file);
  }
  return previous;
}

export async function syncGameContract({ studioRoot = studio, gameRoot, check = false }) {
  if (!gameRoot) throw Error('Usage: node scripts/sync-game-contract.mjs --game path/to/game [--check]');
  const source = await fs.realpath(studioRoot);
  const root = await fs.realpath(gameRoot);
  await read(root, 'project.godot');
  await read(root, 'content/design/game_content.gd');
  // Build and validate every source before creating, replacing or deleting a copy.
  const { expected, sources, files } = await prepare(source);
  const previous = await previousFiles(root, sources);
  const owned = [...expected.keys()].sort();
  expected.set(manifestPath, Buffer.from(JSON.stringify({ version: 1, files: owned }, null, 2) + '\n'));
  const missing = [], different = [], extra = [];
  for (const [file, bytes] of expected) {
    const target = await safePath(root, file);
    const entry = await stat(target);
    if (!entry) missing.push(file);
    else {
      if (!entry.isFile()) throw Error('Expected a regular file for the copy: ' + file);
      if (!bytes.equals(await fs.readFile(target))) different.push(file);
    }
  }
  for (const file of [...previous].sort()) {
    if (expected.has(file)) continue;
    const entry = await stat(await safePath(root, file));
    if (!entry) continue;
    if (!entry.isFile()) throw Error('Obsolete copy is not a regular file: ' + file);
    extra.push(file);
  }
  const ok = missing.length + different.length + extra.length === 0;
  if (check) return { ok, check: true, files, missing, different, extra };
  const changed = new Set([...missing, ...different]);
  for (const [file, bytes] of expected) {
    if (file === manifestPath || !changed.has(file)) continue;
    const target = await safePath(root, file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, bytes);
  }
  for (const file of extra) await fs.unlink(await safePath(root, file));
  if (changed.has(manifestPath)) {
    const target = await safePath(root, manifestPath);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, expected.get(manifestPath));
  }
  return { ok: true, check: false, files, written: changed.size, removed: extra, missing: [], different: [], extra: [] };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const index = args.indexOf('--game');
  const gameRoot = index >= 0 ? args[index + 1] : '';
  const rest = args.filter((_, position) => position !== index && position !== index + 1);
  if (!gameRoot || gameRoot.startsWith('--') || rest.some(arg => arg !== '--check') || rest.filter(arg => arg === '--check').length > 1) {
    console.error('Usage: node scripts/sync-game-contract.mjs --game path/to/game [--check]');
    process.exitCode = 1;
  } else {
    syncGameContract({ gameRoot, check: rest.includes('--check') }).then(result => {
      console.log(JSON.stringify(result, null, 2));
      if (!result.ok) process.exitCode = 1;
    }).catch(error => { console.error(error.message); process.exitCode = 1; });
  }
}
