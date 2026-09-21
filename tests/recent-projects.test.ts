import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import { RecentProjects } from '../src/main/recentProjects.js';
import { ProjectHistory } from '../src/main/projectHistory.js';
import { DocumentFiles } from '../src/main/documents.js';
import { newCinematic, type Cinematic, type LibrarySnapshot } from '../src/shared/model.js';
import { MAX_RECENT_PROJECTS, MAX_PINNED_PROJECTS, projectPathKey, sameProjectPath, filterRecentProjects, sortRecentProjects, formatProjectActivity, type RecentProjectEntry } from '../src/shared/recentProjects.js';

async function workspace(fn: (root: string) => Promise<void>) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-recent-'));
  try { await fn(root); } finally { await fs.rm(root, { recursive: true, force: true }); }
}
function doc(title = 'Introduction'): Cinematic { const d = newCinematic(); d.title = title; return d; }
async function file(root: string, name = 'Introduction.json', value = doc()): Promise<string> {
  const target = path.join(root, name); await fs.mkdir(path.dirname(target), { recursive: true }); await fs.writeFile(target, JSON.stringify(value)); return target;
}
function store(root: string) { let now = Date.parse('2026-09-19T08:00:00Z'); return new RecentProjects(path.join(root, 'profile/recent-projects.json'), () => new Date(now += 1000)); }
function entry(title: string, filePath: string, pinned = false, date = '2026-09-19T08:00:00Z'): RecentProjectEntry {
  return { id: randomUUID(), path: filePath, title, cinematicId: 'CIN_TEST', shots: 3, lastUsedAt: date, lastAction: 'opened', pinned, libraryRoot: '' };
}

test('recent projects: empty profile does not create files just by listing', () => workspace(async root => {
  const registry = store(root); assert.deepEqual((await registry.list()).projects, []); assert.deepEqual(await fs.readdir(root), []);
}));
test('recent projects: record includes only project metadata, never scenes or image bytes', () => workspace(async root => {
  const d = doc(), target = await file(root, 'entrée.json', d), registry = store(root);
  await registry.record(target, d, root, 'opened');
  const raw = await fs.readFile(path.join(root, 'profile/recent-projects.json'), 'utf8');
  const saved = JSON.parse(raw).projects[0]; assert.equal(saved.title, 'Introduction'); assert.equal(saved.shots, 1); assert.equal(saved.libraryRoot, root);
  assert.equal(saved.cinematic, undefined); assert.equal(saved.actors, undefined); assert.equal(saved.stage, undefined); assert.equal(saved.availability, undefined);
  assert.equal(raw.includes('data:image'), false);
}));
test('recent projects: new instance restores entries and pins from disk', () => workspace(async root => {
  const registry = store(root), target = await file(root); const p = await registry.record(target, doc(), root, 'opened'); await registry.setPinned(p.id, true);
  const next = store(root), restored = (await next.list()).projects; assert.equal(restored.length, 1); assert.equal(restored[0].id, p.id); assert.equal(restored[0].pinned, true);
}));
test('recent projects: re-opening and saving same path refresh title/date without duplicates', () => workspace(async root => {
  const registry = store(root), target = await file(root);
  const first = await registry.record(target, doc(), root, 'opened'); await registry.setPinned(first.id, true);
  const second = await registry.record(target, doc('Introduction corrigée'), '', 'saved');
  assert.equal(second.id, first.id); assert.equal(second.pinned, true); assert.equal(second.libraryRoot, root);
  assert.ok(Date.parse(second.lastUsedAt) > Date.parse(first.lastUsedAt)); assert.equal(second.lastAction, 'saved'); assert.equal((await registry.list()).projects.length, 1);
}));
test('recent projects: two files with the same title remain distinct', () => workspace(async root => {
  const registry = store(root); await registry.record(await file(root, 'a/intro.json'), doc(), root, 'opened'); await registry.record(await file(root, 'b/intro.json'), doc(), root, 'opened');
  assert.equal((await registry.list()).projects.length, 2);
}));
test('recent projects: Save As keeps both original and new file', () => workspace(async root => {
  const registry = store(root); const original = await registry.record(await file(root, 'a.json'), doc(), root, 'opened');
  const copy = await registry.record(await file(root, 'b.json'), doc(), root, 'saved'); assert.notEqual(original.id, copy.id); assert.equal((await registry.list()).projects.length, 2);
}));
test('recent projects: keeps 20 unpinned projects and protects pinned projects', () => workspace(async root => {
  const registry = store(root), oldest = await registry.record(await file(root, 'oldest.json'), doc('Important'), root, 'opened'); await registry.setPinned(oldest.id, true);
  for (let i = 0; i < 25; i++) await registry.record(await file(root, `${i}.json`), doc(`${i}`), root, 'opened');
  const list = (await registry.list()).projects; assert.equal(list.length, MAX_RECENT_PROJECTS + 1); assert.equal(list[0].id, oldest.id);
  assert.equal(list[1].title, '24'); assert.equal(list.at(-1)!.title, '5'); assert.ok(await fs.stat(path.join(root, '0.json')));
}));
test('recent projects: pin limit is explicit and does not discard a pinned project', () => workspace(async root => {
  const registry = store(root);
  for (let i = 0; i < MAX_PINNED_PROJECTS; i++) { const p = await registry.record(await file(root, `${i}.json`), doc(), root, 'opened'); await registry.setPinned(p.id, true); }
  const p = await registry.record(await file(root, 'too-many.json'), doc(), root, 'opened');
  await assert.rejects(registry.setPinned(p.id, true), /Maximum 10/); assert.equal((await registry.list()).projects.filter(p => p.pinned).length, MAX_PINNED_PROJECTS);
}));
test('recent projects: clearing preserves pins and never deletes JSON files', () => workspace(async root => {
  const registry = store(root), a = await file(root, 'a.json'), b = await file(root, 'b.json');
  const pinned = await registry.record(a, doc(), root, 'opened'); await registry.setPinned(pinned.id, true); await registry.record(b, doc(), root, 'opened');
  await registry.clearUnpinned(); assert.deepEqual((await registry.list()).projects.map(p => p.id), [pinned.id]); assert.ok(await fs.stat(a)); assert.ok(await fs.stat(b));
}));
test('recent projects: removing a pinned record changes only the registry', () => workspace(async root => {
  const registry = store(root), target = await file(root), original = await fs.readFile(target, 'utf8');
  const p = await registry.record(target, doc(), root, 'opened'); await registry.setPinned(p.id, true); await registry.remove(p.id);
  assert.equal((await registry.list()).projects.length, 0); assert.equal(await fs.readFile(target, 'utf8'), original);
}));
test('recent projects: missing projects are retained and identified', () => workspace(async root => {
  const registry = store(root), target = await file(root); const p = await registry.record(target, doc(), root, 'opened');
  assert.equal((await registry.list(true)).projects[0].availability, 'available'); await fs.unlink(target);
  const missing = (await registry.list(true)).projects[0]; assert.equal(missing.id, p.id); assert.equal(missing.availability, 'missing');
}));
test('recent projects: restoring a missing file restores its availability', () => workspace(async root => {
  const registry = store(root), target = await file(root); await registry.record(target, doc(), root, 'opened'); await fs.unlink(target); await registry.list(true);
  await file(root); assert.equal((await registry.list(true)).projects[0].availability, 'available');
}));
test('recent projects: a directory masquerading as a file is unavailable', () => workspace(async root => {
  const registry = store(root), target = await file(root); await registry.record(target, doc(), root, 'opened'); await fs.unlink(target); await fs.mkdir(target);
  assert.equal((await registry.list(true)).projects[0].availability, 'missing');
}));
test('recent projects: relocation preserves ID and pin, updates path and does not leave old row', () => workspace(async root => {
  const registry = store(root), old = await file(root, 'old.json'); const p = await registry.record(old, doc(), root, 'opened'); await registry.setPinned(p.id, true);
  const target = path.join(root, 'renamed.json'); await fs.rename(old, target);
  const moved = await registry.record(target, doc('Renommée'), root, 'opened', p.id); assert.equal(moved.id, p.id); assert.equal(moved.pinned, true); assert.equal(moved.path, target); assert.equal((await registry.list()).projects.length, 1);
}));
test('recent projects: relocation to a previously known path merges duplicates and pins', () => workspace(async root => {
  const registry = store(root), a = await registry.record(await file(root, 'a.json'), doc(), root, 'opened'); const b = await registry.record(await file(root, 'b.json'), doc(), root, 'opened');
  await registry.setPinned(b.id, true); const merged = await registry.record(b.path, doc(), root, 'opened', a.id);
  assert.equal(merged.id, a.id); assert.equal(merged.pinned, true); assert.equal((await registry.list()).projects.length, 1);
}));
test('recent projects: concurrent updates serialize without losing records', () => workspace(async root => {
  const registry = store(root), targets = await Promise.all(Array.from({ length: 12 }, (_, i) => file(root, `${i}.json`)));
  await Promise.all(targets.map((target, i) => registry.record(target, doc(String(i)), root, 'opened')));
  await registry.flush(); assert.equal((await store(root).list()).projects.length, 12);
}));
test('recent projects: mutations are committed in memory only after successful disk write', () => workspace(async root => {
  const registry = store(root), target = await file(root), p = await registry.record(target, doc(), root, 'opened');
  const index = path.join(root, 'profile/recent-projects.json'); await fs.unlink(index); await fs.mkdir(index);
  await assert.rejects(registry.setPinned(p.id, true)); assert.equal((await registry.get(p.id)).pinned, false);
}));
test('recent projects: first failed write does not invent a recent row', () => workspace(async root => {
  const registry = store(root); await registry.list(); await fs.writeFile(path.join(root, 'profile'), 'blocking path');
  await assert.rejects(registry.record(await file(root), doc(), root, 'opened')); assert.equal((await registry.list()).projects.length, 0);
}));
test('recent projects: successful persistence produces a backup and no stale temporary files', () => workspace(async root => {
  const registry = store(root), p = await registry.record(await file(root), doc(), root, 'opened'); await registry.setPinned(p.id, true);
  const filenames = await fs.readdir(path.join(root, 'profile')); assert.ok(filenames.includes('recent-projects.json.bak')); assert.equal(filenames.some(n => n.endsWith('.tmp')), false);
}));
test('recent projects: corrupted primary restores from backup and preserves corrupt bytes', () => workspace(async root => {
  const registry = store(root), target = await file(root), p = await registry.record(target, doc(), root, 'opened'); await registry.setPinned(p.id, true);
  const index = path.join(root, 'profile/recent-projects.json'); await fs.writeFile(index, '{broken');
  const fresh = store(root); const list = await fresh.list(); assert.equal(list.projects.length, 1); assert.match(list.warning!, /secours/);
  await fresh.record(target, doc(), root, 'opened'); const names = await fs.readdir(path.dirname(index)); const preserved = names.find(n => n.includes('.invalid-'));
  assert.ok(preserved); assert.equal(await fs.readFile(path.join(path.dirname(index), preserved), 'utf8'), '{broken');
}));
test('recent projects: corrupted registry without backup starts empty and reports warning', () => workspace(async root => {
  await fs.mkdir(path.join(root, 'profile')); await fs.writeFile(path.join(root, 'profile/recent-projects.json'), 'corrupt');
  const registry = store(root); const result = await registry.list(); assert.equal(result.projects.length, 0); assert.ok(result.warning);
  await registry.record(await file(root), doc(), root, 'opened'); assert.equal((await registry.list()).warning, undefined);
}));
test('recent projects: unknown future format is preserved, not overwritten', () => workspace(async root => {
  await fs.mkdir(path.join(root, 'profile')); const index = path.join(root, 'profile/recent-projects.json'), original = JSON.stringify({ format: 'lunaria-recent-projects-v2', projects: [] }); await fs.writeFile(index, original);
  const registry = store(root); assert.ok((await registry.list()).warning); await assert.rejects(registry.record(await file(root), doc(), root, 'opened')); await assert.rejects(registry.clearUnpinned()); assert.equal(await fs.readFile(index, 'utf8'), original);
}));
test('recent projects: malformed rows and extra properties are not trusted', () => workspace(async root => {
  const valid = entry('Été', await file(root)); await fs.mkdir(path.join(root, 'profile'));
  await fs.writeFile(path.join(root, 'profile/recent-projects.json'), JSON.stringify({ format: 'lunaria-recent-projects-v1', projects: [null, { ...valid, id: 'bad' }, { ...valid, path: '../relative.json' }, { ...valid, commands: ['do not execute'] }] }));
  const rows = (await store(root).list()).projects; assert.equal(rows.length, 1); assert.equal((rows[0] as unknown as Record<string, unknown>).commands, undefined);
}));
test('recent projects: rejects arbitrary IPC identifiers and relative file paths', () => workspace(async root => {
  const registry = store(root); await assert.rejects(registry.get('../../file.json')); await assert.rejects(registry.get(randomUUID()));
  await assert.rejects(registry.record('../doc.json', doc(), root, 'opened')); await assert.rejects(registry.record('https://example.com/a.json', doc(), root, 'opened'));
}));
test('recent projects: pin rejects non-boolean values', () => workspace(async root => {
  const registry = store(root), p = await registry.record(await file(root), doc(), root, 'opened'); await assert.rejects(registry.setPinned(p.id, 'yes' as unknown as boolean));
}));
test('recent projects: query functions return copies so callers cannot edit the registry', () => workspace(async root => {
  const registry = store(root), p = await registry.record(await file(root), doc(), root, 'opened'); (await registry.get(p.id)).title = 'modified'; (await registry.list()).projects[0].pinned = true;
  assert.equal((await registry.get(p.id)).title, 'Introduction'); assert.equal((await registry.get(p.id)).pinned, false);
}));
test('recent projects: file lookup tolerates a missing file without dropping its metadata', () => workspace(async root => {
  const registry = store(root), target = await file(root), p = await registry.record(target, doc(), root, 'opened'); await fs.unlink(target);
  assert.equal((await registry.find(target))!.id, p.id);
}));
test('recent projects: canonical paths deduplicate a dot-segment alias', () => workspace(async root => {
  const registry = store(root), target = await file(root), p = await registry.record(target, doc(), root, 'opened');
  await fs.mkdir(path.join(root, 'sub')); const other = await registry.record(path.join(root, 'sub') + path.sep + '..' + path.sep + 'Introduction.json', doc(), root, 'opened'); assert.equal(other.id, p.id);
}));

test('recent projects: Windows paths compare case and separator variants, POSIX preserves case', () => {
  assert.equal(projectPathKey('C:\\Lunaria\\Intro.json'), 'c:/lunaria/intro.json'); assert.equal(sameProjectPath('c:/lunaria/intro.json', 'C:\\Lunaria\\Intro.json'), true);
  assert.equal(sameProjectPath('\\\\Server\\Library\\intro.json', '//server/library/intro.json'), true);
  assert.equal(sameProjectPath('/tmp/Intro.json', '/tmp/intro.json'), false); assert.equal(sameProjectPath('', ''), false);
});
test('recent projects: search matches accents, title, ID, path and all terms', () => {
  const a = entry('Réveil dans la forêt', '/Europe/prologue.json'); a.libraryRoot = '/assets/Lunaria'; a.cinematicId = 'CIN_REVEIL';
  const b = entry('Arrivée au port', '/Oceanie/intro.json');
  assert.equal(filterRecentProjects([a, b], 'reveil foret').length, 1); assert.equal(filterRecentProjects([a, b], 'europe').length, 1);
  assert.equal(filterRecentProjects([a, b], 'CIN_REVEIL').length, 1); assert.equal(filterRecentProjects([a, b], 'lunaria').length, 1);
  assert.equal(filterRecentProjects([a, b], 'port foret').length, 0);
});
test('recent projects: sorted pin-first then most recent without mutating input', () => {
  const a = entry('a', '/a.json', false, '2026-09-18T00:00:00Z'), b = entry('b', '/b.json', true, '2026-09-17T00:00:00Z'), c = entry('c', '/c.json', false, '2026-09-19T00:00:00Z');
  const items = [a, b, c]; assert.deepEqual(sortRecentProjects(items).map(p => p.title), ['b', 'c', 'a']); assert.deepEqual(items, [a, b, c]);
});
test('recent projects: timestamps distinguish today, yesterday, older and invalid dates', () => {
  const now = new Date(2026, 8, 19, 14, 30);
  assert.match(formatProjectActivity(new Date(2026, 8, 19, 9, 5).toISOString(), now), /^Aujourd’hui/);
  assert.match(formatProjectActivity(new Date(2026, 8, 18, 9, 5).toISOString(), now), /^Hier/);
  assert.match(formatProjectActivity(new Date(2025, 1, 10).toISOString(), now), /2025/); assert.equal(formatProjectActivity('nonsense', now), 'Date inconnue');
});

function setup(root: string) {
  const docs = new DocumentFiles(path.join(root, 'profile/recovery.json')), recents = store(root);
  let active: LibrarySnapshot | null = { rootName: 'Library A', rootPath: path.join(root, 'library-a'), assets: [], warnings: [] };
  let failLibrary = false; const selections: string[] = [];
  const history = new ProjectHistory(docs, recents, { current: () => active, select: async p => { selections.push(p); if (failLibrary) throw new Error('Lecteur déconnecté'); active = { rootName: 'Restored', rootPath: p, assets: [], warnings: [] }; return active; }, disconnect: () => { active = null; } });
  return { docs, recents, history, selections, current: () => active, fail: () => { failLibrary = true; } };
}
test('project history: normal open records current library only after a valid JSON is read', () => workspace(async root => {
  const { history, recents, current } = setup(root); const result = await history.openPath(await file(root)); const list = (await recents.list()).projects;
  assert.equal(result.cinematic.title, 'Introduction'); assert.equal(list[0].libraryRoot, current()!.rootPath); assert.equal(result.library!.rootPath, current()!.rootPath);
}));
test('project history: invalid open leaves document, token, recovery, library and recents unchanged', () => workspace(async root => {
  const { history, recents, docs, current } = setup(root); const result = await history.openPath(await file(root)); await docs.autosave(doc('Draft'), docs.token, current()!.rootPath);
  const list = await recents.list(), active = current(); const invalid = path.join(root, 'bad.json'); await fs.writeFile(invalid, '{invalid');
  await assert.rejects(history.openPath(invalid)); assert.equal(docs.token, result.documentToken); assert.equal(docs.currentFile, result.path); assert.deepEqual(await recents.list(), list); assert.equal(current(), active); assert.equal((await docs.recovery()).cinematic!.title, 'Draft');
}));
test('project history: recent open restores the library associated with that project', () => workspace(async root => {
  const { history, recents, current, selections } = setup(root); const target = await file(root), library = path.join(root, 'other-library');
  const p = await recents.record(target, doc(), library, 'opened'); const result = await history.openRecent(p.id);
  assert.deepEqual(selections, [library]); assert.equal(result.library!.rootPath, library); assert.equal(current()!.rootPath, library); assert.equal(result.warnings, undefined);
}));
test('project history: unavailable associated library does not display images from a different library', () => workspace(async root => {
  const { history, recents, current, fail } = setup(root), library = path.join(root, 'unavailable-library');
  const p = await recents.record(await file(root), doc(), library, 'opened'); fail(); const result = await history.openRecent(p.id);
  assert.equal(result.cinematic.title, 'Introduction'); assert.equal(current(), null); assert.equal(result.library, null); assert.match(result.warnings![0], /reconnecter/); assert.equal((await recents.get(p.id)).libraryRoot, library);
}));
test('project history: missing recent does not reset active session or change library', () => workspace(async root => {
  const { history, recents, docs, selections } = setup(root); const a = await history.openPath(await file(root, 'a.json'));
  const missing = await file(root, 'gone.json'); const p = await recents.record(missing, doc(), path.join(root, 'different-library'), 'opened'); await fs.unlink(missing);
  await assert.rejects(history.openRecent(p.id)); assert.equal(docs.token, a.documentToken); assert.equal(docs.currentFile, a.path); assert.deepEqual(selections, []); assert.equal((await recents.get(p.id)).lastUsedAt, p.lastUsedAt);
}));
test('project history: successful save creates MRU entry using updated title without altering schema', () => workspace(async root => {
  const { history, recents, docs, current } = setup(root); const d = doc('Nouveau titre'), target = path.join(root, 'save.json');
  const saved = await history.save(target, d, docs.token, current()!.rootPath); assert.deepEqual(saved.cinematic, d); assert.equal(saved.warnings.length, 0); assert.equal((await recents.list()).projects[0].lastAction, 'saved'); assert.equal((await recents.list()).projects[0].title, d.title);
}));
test('project history: failed save does not promote or add a recent project', () => workspace(async root => {
  const { history, recents, docs } = setup(root); const a = await history.openPath(await file(root)); const before = await recents.list(); await fs.writeFile(a.path, '{}');
  await assert.rejects(history.save(a.path, doc('modified'), docs.token, root), /autre programme/); assert.deepEqual(await recents.list(), before);
}));
test('project history: a stale token cannot write a file or a recent entry', () => workspace(async root => {
  const { history, recents, docs } = setup(root); const token = docs.token; await docs.reset();
  await assert.rejects(history.save(path.join(root, 'stale.json'), doc(), token, root)); assert.equal((await recents.list()).projects.length, 0);
}));
test('project history: registry write failure reports warning but valid save succeeds', () => workspace(async root => {
  const { history, recents, docs } = setup(root); await recents.list(); const index = path.join(root, 'profile/recent-projects.json'); await fs.mkdir(index, { recursive: true });
  const target = path.join(root, 'valid.json'); const saved = await history.save(target, doc(), docs.token, root);
  assert.equal(JSON.parse(await fs.readFile(target, 'utf8')).title, 'Introduction'); assert.equal(saved.warnings.length, 1); assert.equal(docs.currentFile, target);
}));
test('project history: normal open remains possible when registry is read-only future format', () => workspace(async root => {
  await fs.mkdir(path.join(root, 'profile')); await fs.writeFile(path.join(root, 'profile/recent-projects.json'), JSON.stringify({ format: 'lunaria-recent-projects-v9', projects: [] }));
  const { history } = setup(root); const result = await history.openPath(await file(root)); assert.equal(result.cinematic.title, 'Introduction'); assert.ok(result.warnings?.length);
}));
test('project history: relocation validates JSON before altering old entry or current file', () => workspace(async root => {
  const { history, recents, docs } = setup(root); const target = await file(root), p = await recents.record(target, doc(), root, 'opened'); const oldToken = docs.token;
  const bad = await file(root, 'invalid.json'); await fs.writeFile(bad, '{"not":"a cinematic"}');
  await assert.rejects(history.relocate(p.id, bad)); assert.equal(docs.token, oldToken); assert.equal((await recents.get(p.id)).path, target);
}));
test('project history: relocation reopens the selected file, keeps pin and can subsequently save', () => workspace(async root => {
  const { history, recents, docs } = setup(root); const target = await file(root), p = await recents.record(target, doc(), root, 'opened'); await recents.setPinned(p.id, true);
  const moved = path.join(root, 'renamed.json'); await fs.rename(target, moved); const result = await history.relocate(p.id, moved);
  assert.equal(result.path, moved); assert.equal((await recents.get(p.id)).pinned, true);
  await history.save(moved, doc('Suite'), docs.token, root); assert.equal(JSON.parse(await fs.readFile(moved, 'utf8')).title, 'Suite'); assert.equal((await recents.list()).projects.length, 1);
}));
test('project history: autosave remains a recovery snapshot, not an invented file in the MRU', () => workspace(async root => {
  const { recents, docs } = setup(root); await docs.autosave(doc('Brouillon'), docs.token, root); assert.equal((await recents.list()).projects.length, 0); assert.equal((await docs.recovery()).cinematic!.title, 'Brouillon');
}));
