import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const script = path.resolve('scripts/sync-game-contract.mjs');
const forwardingHeader = '// Generated forwarding module; edit Studio shared sources only.';
type Context = { root: string; studio: string; game: string };
type Result = {
  ok: boolean;
  files: { modules: number; aliases: number; addon: number };
  missing: string[];
  different: string[];
  extra: string[];
};
async function write(root: string, file: string, value: string) {
  const target = path.join(root, file);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, value);
}
async function fixture(run: (ctx: Context) => Promise<void>) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-contract-sync-'));
  const ctx = { root, studio: path.join(root, 'studio'), game: path.join(root, 'game') };
  try {
    for (const [file, value] of Object.entries({
      'src/shared/game/root.ts': 'export { value } from "../dependency.js";',
      'src/shared/game/other.ts': 'export const other = 2;',
      'src/shared/dependency.ts': 'export const value = 1;',
      'src/shared/helpers/unused.ts': 'export const editor = true;',
      'dist-tests/src/shared/game/root.js': 'export { value } from "../dependency.js";',
      'dist-tests/src/shared/game/other.js': 'export const other = 2;',
      'dist-tests/src/shared/dependency.js': 'export const value = 1;',
      'dist-tests/src/shared/helpers/unused.js': 'export const editor = true;',
      'dist-tests/src/shared/game/removed.js': 'export const obsolete = true;',
      'schema/game-project.schema.json': '{"game":1}\n',
      'schema/home-screen.defaults.json': '{"home":1}\n',
      'godot/addons/lunaria_cinematics/CinematicPlayer.gd': 'extends Control\n',
      'godot/addons/lunaria_cinematics/cinematic.schema.json': '{"film":1}\n',
      'godot/addons/lunaria_cinematics/CinematicOverlay.tscn': '[gd_scene format=3]\n',
    })) await write(ctx.studio, file, value);
    await write(ctx.game, 'project.godot', 'config_version=5\n');
    await write(ctx.game, 'content/design/game_content.gd', 'extends RefCounted\n');
    await write(ctx.game, 'content/design/game_content.json', '{"title":"Author campaign"}\n');
    await write(ctx.game, 'LunariaArtLibrary/keep.png', 'Author media bytes');
    await write(ctx.game, 'addons/lunaria_cinematics/CinematicPlayer.gd.uid', 'uid://preserve_game_identity\n');
    await write(ctx.game, 'tools/design/shared/notes.js', '// User file without a source counterpart\n');
    await write(ctx.game, 'tools/design/custom.js', '// User tool\n');
    await run(ctx);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}
async function sync(ctx: Context, check = false): Promise<Result> {
  const module = await import(pathToFileURL(script).href);
  return module.syncGameContract({ studioRoot: ctx.studio, gameRoot: ctx.game, check });
}
async function snapshot(root: string): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  async function walk(folder: string) {
    for (const entry of await fs.readdir(folder, { withFileTypes: true })) {
      const file = path.join(folder, entry.name);
      const stat = await fs.lstat(file);
      const relative = path.relative(root, file).replaceAll('\\', '/');
      result[relative] = entry.isDirectory() ? 'directory:' + stat.mtimeMs
        : stat.mtimeMs + ':' + (await fs.readFile(file)).toString('hex');
      if (entry.isDirectory()) await walk(file);
    }
  }
  await walk(root);
  return result;
}

test('read-only CLI reports missing copies without creating them', () => fixture(async ctx => {
  const before = await snapshot(ctx.game);
  const child = spawnSync(process.execPath, [script, '--check', '--game', ctx.game], { encoding: 'utf8', windowsHide: true });
  assert.equal(child.status, 1, child.stdout + child.stderr);
  assert.match(child.stdout, /missing/);
  assert.deepEqual(await snapshot(ctx.game), before);
}));

test('sync copies the transitive contracts and addon while preserving unrelated files', () => fixture(async ctx => {
  await write(ctx.game, 'tools/design/shared/helpers/unused.js', 'Old generated editor copy');
  await write(ctx.game, 'tools/design/retired.js', forwardingHeader + '\nexport {};\n');
  const result = await sync(ctx);
  assert.equal(result.ok, true);
  assert.deepEqual(result.files, { modules: 3, aliases: 2, addon: 3 });
  assert.equal(await fs.readFile(path.join(ctx.game, 'tools/design/shared/dependency.js'), 'utf8'), 'export const value = 1;');
  assert.match(await fs.readFile(path.join(ctx.game, 'tools/design/root.js'), 'utf8'), /shared\/game\/root\.js/);
  for (const absent of ['tools/design/shared/helpers/unused.js', 'tools/design/retired.js', 'tools/design/removed.js', 'tools/design/shared/game/removed.js']) {
    await assert.rejects(fs.stat(path.join(ctx.game, absent)), { code: 'ENOENT' });
  }
  assert.equal(await fs.readFile(path.join(ctx.game, 'addons/lunaria_cinematics/CinematicPlayer.gd.uid'), 'utf8'), 'uid://preserve_game_identity\n');
  assert.equal(await fs.readFile(path.join(ctx.game, 'tools/design/shared/notes.js'), 'utf8'), '// User file without a source counterpart\n');
  assert.equal(await fs.readFile(path.join(ctx.game, 'tools/design/custom.js'), 'utf8'), '// User tool\n');
  assert.equal(await fs.readFile(path.join(ctx.game, 'content/design/game_content.json'), 'utf8'), '{"title":"Author campaign"}\n');
  assert.equal(await fs.readFile(path.join(ctx.game, 'LunariaArtLibrary/keep.png'), 'utf8'), 'Author media bytes');
  const before = await snapshot(ctx.game);
  assert.equal((await sync(ctx, true)).ok, true);
  assert.deepEqual(await snapshot(ctx.game), before);
  assert.equal((await sync(ctx)).ok, true);
  assert.deepEqual(await snapshot(ctx.game), before);
}));

test('check names different, missing and previously managed obsolete files without writing', () => fixture(async ctx => {
  await sync(ctx);
  await write(ctx.game, 'addons/lunaria_cinematics/CinematicPlayer.gd', 'Different game copy');
  await fs.unlink(path.join(ctx.game, 'content/design/home_screen.defaults.json'));
  await fs.unlink(path.join(ctx.studio, 'src/shared/game/other.ts'));
  const before = await snapshot(ctx.game);
  const result = await sync(ctx, true);
  assert.equal(result.ok, false);
  assert.ok(result.different.includes('addons/lunaria_cinematics/CinematicPlayer.gd'));
  assert.ok(result.missing.includes('content/design/home_screen.defaults.json'));
  assert.ok(result.extra.includes('tools/design/shared/game/other.js'));
  assert.ok(result.extra.includes('tools/design/other.js'));
  assert.deepEqual(await snapshot(ctx.game), before);
  await sync(ctx);
  await assert.rejects(fs.stat(path.join(ctx.game, 'tools/design/shared/game/other.js')), { code: 'ENOENT' });
  assert.equal((await sync(ctx, true)).ok, true);
}));

test('incomplete compiled source is rejected before replacing any copy', () => fixture(async ctx => {
  await sync(ctx);
  await fs.unlink(path.join(ctx.studio, 'dist-tests/src/shared/dependency.js'));
  const before = await snapshot(ctx.game);
  await assert.rejects(sync(ctx), /dependency\.js/);
  assert.deepEqual(await snapshot(ctx.game), before);
}));

test('a dependency present only in stale compiler output is rejected before writing', () => fixture(async ctx => {
  await write(ctx.studio, 'dist-tests/src/shared/game/root.js', 'export { value } from "./removed.js";');
  const before = await snapshot(ctx.game);
  await assert.rejects(sync(ctx), /removed\.js/);
  assert.deepEqual(await snapshot(ctx.game), before);
}));

test('incomplete cinematic reader is rejected before replacing any copy', () => fixture(async ctx => {
  await sync(ctx);
  await fs.unlink(path.join(ctx.studio, 'godot/addons/lunaria_cinematics/CinematicPlayer.gd'));
  const before = await snapshot(ctx.game);
  await assert.rejects(sync(ctx), /CinematicPlayer\.gd/);
  assert.deepEqual(await snapshot(ctx.game), before);
}));

test('cyclic module dependencies are copied once', () => fixture(async ctx => {
  await write(ctx.studio, 'dist-tests/src/shared/dependency.js', 'export { value } from "./game/root.js";');
  assert.equal((await sync(ctx)).files.modules, 3);
  assert.equal((await sync(ctx, true)).ok, true);
}));

test('outgoing directory links cannot redirect writes or removals', () => fixture(async ctx => {
  const outside = path.join(ctx.root, 'outside');
  await fs.mkdir(outside);
  await write(outside, 'keep.txt', 'Keep outside bytes');
  await fs.rm(path.join(ctx.game, 'tools/design'), { recursive: true });
  await fs.symlink(outside, path.join(ctx.game, 'tools/design'), 'junction');
  const before = await snapshot(outside);
  await assert.rejects(sync(ctx), /symbolic link|outside the project/i);
  assert.deepEqual(await snapshot(outside), before);
}));

test('a forged manifest cannot claim campaign or media ownership', () => fixture(async ctx => {
  await write(ctx.game, 'tools/design/sync-manifest.json', JSON.stringify({ version: 1, files: ['content/design/game_content.json'] }));
  const before = await snapshot(ctx.game);
  await assert.rejects(sync(ctx), /manifest/i);
  assert.deepEqual(await snapshot(ctx.game), before);
}));

