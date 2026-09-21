import test from 'node:test';
import assert from 'node:assert/strict';
import { assetMatchesTab, buildFolderTree, clampLibraryWidth, DEFAULT_LIBRARY_PREFERENCES, filterLibraryAssets,
  folderLabel, isInFolder, maxLibraryWidth, normalizeSearch, parentFolders, parseLibraryPreferences } from '../src/shared/libraryBrowser.js';
import type { Asset } from '../src/shared/model.js';
const asset = (path: string, kind: Asset['kind'] = 'environment'): Asset => ({
  ref: `library://${path}`, path, folder: path.split('/').slice(0, -1).join('/'), name: path.split('/').pop()!, kind,
  bytes: 100, modified: 0, url: 'fixture://image', thumbnail: 'fixture://thumb'
});
const fixtures = [asset('01_europe/lunaria/interieur_serre/Serre_02.png'), asset('01_europe/lunaria/interieur_serre/Serre_10.png'),
  asset('01_europe/lunaria/exterieur_et_entree/Aube.png'), asset('02_africa/vallee_du_nil/écluse.png'),
  asset('05_characters/Rose/stage_01/rose.png', 'character'), asset('06_ui/dialogues/cadre.png', 'ui'), asset('audio/serre.ogg', 'audio')];
test('search removes accents, separators and letter case', () => assert.equal(normalizeSearch('ÉTÉ__Au/Bord-de-l’Eau'), 'ete au bord de l’eau'));
test('folder labels preserve character stages', () => { assert.equal(folderLabel('stage_01'), 'Stage 01'); assert.equal(folderLabel('01_europe'), 'Europe'); });
test('filter accepts multiple terms in any order across path and French labels', () => assert.equal(filterLibraryAssets(fixtures, '', 'serre interieur Europe 02').length, 1));
test('French continent names work even when folders use English', () => assert.equal(filterLibraryAssets(fixtures, '', 'Afrique ecluse')[0].path, fixtures[3].path));
test('search ignores accents and whitespace', () => assert.equal(filterLibraryAssets(fixtures, '', '   ECLUSE  ').length, 1));
test('empty search returns everything inside selected subtree', () => assert.equal(filterLibraryAssets(fixtures, '01_europe/lunaria', '').length, 3));
test('folder prefix does not leak into sibling with a similar name', () => {
  assert.equal(isInFolder('01_europe/lunaria_bis', '01_europe/lunaria'), false);
  assert.equal(isInFolder('01_europe/lunaria/interieur_serre', '01_europe/lunaria'), true);
});
test('root-level assets remain visible with the all folder filter', () => assert.equal(filterLibraryAssets([asset('root.png')], '', '').length, 1));
test('unknown asset kind is still shown with environments', () => { assert.equal(assetMatchesTab(asset('test.png','other'), 'environment'), true); assert.equal(assetMatchesTab(fixtures[4], 'environment'), false); });
test('type filtering never mixes characters, audio, and bubble frames', () => {
  for (const tab of ['character', 'audio', 'ui'] as const) assert.equal(fixtures.filter(a => assetMatchesTab(a, tab)).length, 1);
});
test('folder tree counts every asset once per ancestor', () => {
  const roots = buildFolderTree(fixtures), europe = roots.find(n => n.path === '01_europe')!;
  assert.equal(europe.count, 3); assert.equal(europe.children[0].count, 3);
  assert.equal(europe.children[0].children.find(n => n.path.endsWith('interieur_serre'))!.count, 2);
});
test('folder tree sorts numbers naturally and leaves input untouched', () => {
  const input = [asset('Plan_10/a.png'), asset('Plan_2/b.png')], snapshot = JSON.stringify(input);
  assert.deepEqual(buildFolderTree(input).map(n => n.label), ['Plan 2', 'Plan 10']); assert.equal(JSON.stringify(input), snapshot);
});
test('breadcrumbs have relative complete paths', () => assert.deepEqual(parentFolders('01_europe/lunaria/interieur_serre'), ['01_europe', '01_europe/lunaria', '01_europe/lunaria/interieur_serre']));
test('root breadcrumb has no empty node', () => assert.deepEqual(parentFolders(''), []));
test('invalid stored preferences recover safe defaults', () => {
  for (const raw of [null, 'no json', '[]', 'null', '12']) assert.deepEqual(parseLibraryPreferences(raw), DEFAULT_LIBRARY_PREFERENCES);
});
test('preference enum values are validated individually', () => assert.deepEqual(parseLibraryPreferences('{"width":430,"view":"bad","size":"large"}'), { width:430, view:'grid', size:'large' }));
test('out-of-range and wrong-type stored width cannot break layout', () => {
  assert.equal(parseLibraryPreferences('{"width":-999}').width, 280); assert.equal(parseLibraryPreferences('{"width":9999}').width, 600);
  assert.equal(parseLibraryPreferences('{"width":"900px"}').width, 368);
});
test('sidebar stays in bounds and reserves room for the scene', () => {
  for (const viewport of [1160, 1280, 1350, 1640, 1920]) {
    const width = clampLibraryWidth(9999, viewport); assert.ok(width >= 280 && width <= 600);
    assert.ok(viewport - width - (viewport <= 1350 ? 264 : 288) >= 500);
  }
  assert.equal(clampLibraryWidth(Number.NaN, 1640), 368); assert.equal(maxLibraryWidth(1640), 600);
});
test('preferences serialization cannot introduce cinematic fields', () => {
  const p = parseLibraryPreferences('{"width":410,"view":"list","size":"medium","libraryRoot":"C:/private","shots":[]}');
  assert.deepEqual(Object.keys(p).sort(), ['size', 'view', 'width']);
});
