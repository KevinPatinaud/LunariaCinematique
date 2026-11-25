import { test, expect, _electron, type ElectronApplication, type Page } from '@playwright/test';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { newCinematic, newShot } from '../../src/shared/model.js';
import { seedProject } from '../fixtures/seed40.js';
import { fixturePresentation } from '../presentation-fixture.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let app: ElectronApplication, page: Page, folder: string, library: string, profile: string, target: string, candidate: string;
let errors: string[];
test.beforeEach(async () => {
  folder = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-terrain-ui-'));
  profile = path.join(folder, 'profile'); library = path.join(profile, 'library'); candidate = path.join(profile, 'candidate.png'); target = path.join(folder, 'project.game.json'); errors = [];
  await fs.mkdir(library, { recursive: true });
  const source = path.join(ROOT, 'example-library/01_europe/lunaria/interieur_serre/greenhouse_aisle_wide_variant_v01.png');
  for (const name of ['first.png', 'last.png', 'other.png']) await fs.copyFile(source, path.join(library, name));
  const film = newCinematic(); film.title = 'La serre avant le combat'; film.shots[0].name = 'Entrée de la serre'; film.shots[0].background.asset = 'library://first.png';
  const last = newShot('library://last.png'); last.name = 'Dernier regard sur la serre'; film.shots.push(last);
  const project = fixturePresentation(seedProject(), 'library://first.png'); project.cinematics = [film];
  project.levels[0].terrainImage = 'library://other.png';
  project.levels[0].restoredTerrainImage = 'library://first.png';
  project.campaign = { cinematics: [{ id: 'serre', title: film.title, documentId: film.id, file: 'serre.cinematic.json' }], steps: [
    { id: 'before', kind: 'level', levelId: project.levels[1].id },
    { id: 'film', kind: 'cinematic', cinematicId: 'serre', skippable: true },
    { id: 'level', kind: 'level', levelId: project.levels[0].id },
  ] };
  await fs.writeFile(target, JSON.stringify(project));
  await fs.writeFile(path.join(profile, 'settings.json'), JSON.stringify({ libraryRoot: library }));
  await fs.writeFile(path.join(profile, 'game-recents.json'), JSON.stringify([{ path: target, title: project.title, updatedAt: new Date().toISOString() }]));
  await fs.writeFile(path.join(profile, 'codex-models.json'), JSON.stringify([{ id: 'terrain-test-model', label: 'Modèle de test', description: '', isDefault: true }]));
  const env = { ...process.env, LUNARIA_E2E: '1', LUNARIA_TEST_USER_DATA: profile, LUNARIA_E2E_TERRAIN_RESULT: candidate, LUNARIA_E2E_TERRAIN_RESTORED_RESULT: path.join(profile, 'restored.png') }; delete env.LUNARIA_DEV_URL;
  app = await _electron.launch({ args: [ROOT], env }); page = await app.firstWindow();
  page.on('pageerror', error => errors.push(error.message));
  await page.waitForURL('app://studio/index.html'); await page.setViewportSize({ width: 1440, height: 1000 });
  const bytes = await app.evaluate(({ nativeImage }) => Array.from(nativeImage.createFromBitmap(Buffer.alloc(1600 * 900 * 4, 255), { width: 1600, height: 900 }).toPNG()));
  await fs.writeFile(candidate, Buffer.from(bytes));
  const restored = await app.evaluate(({ nativeImage }) => {const pixels=Buffer.alloc(1600*900*4,180);for(let i=3;i<pixels.length;i+=4)pixels[i]=255;return Array.from(nativeImage.createFromBitmap(pixels,{width:1600,height:900}).toPNG());});
  await fs.writeFile(path.join(profile,'restored.png'),Buffer.from(restored));
  await app.evaluate(({ dialog }, target) => { dialog.showSaveDialog = async () => ({ canceled: false, filePath: target }); dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [target] }); dialog.showMessageBox = async () => ({ response: 1, checkboxChecked: false }); }, target);
  await page.locator('.studio-sections').getByRole('button', { name: /^Niveaux/ }).click();
  await page.getByRole('button', { name: 'Paramètres', exact: true }).click();
});
test.afterEach(async ({}, info) => {
  if (page && !page.isClosed() && info.status !== info.expectedStatus) await info.attach('terrain-failure', { body: await page.screenshot(), contentType: 'image/png' });
  if (app) await app.close(); await fs.rm(folder, { recursive: true, force: true }); expect(errors).toEqual([]);
});
const terrain = () => page.getByRole('region', { name: 'Terrain du niveau' });
const dialog = () => page.getByRole('dialog', { name: 'Générer les deux états du terrain', exact: true });
async function openGenerator() { await terrain().getByRole('button', { name: 'Générer les terrains pollué et nettoyé (IA)', exact: true }).click(); await expect(dialog()).toBeVisible(); }
async function save() { await page.locator('.studio-modebar').getByRole('button', { name: 'Enregistrer le projet', exact: true }).click(); await expect(page.locator('.gd-message')).toContainText('enregistrés'); return JSON.parse(await fs.readFile(target, 'utf8')); }
async function generated() { await dialog().getByRole('button', { name: 'Générer les deux états', exact: true }).click(); await expect(dialog().getByRole('button', { name: 'Utiliser les deux terrains pour le niveau' })).toBeVisible(); }
async function expectAccessibleLayout() {
  await expect(dialog().locator(':scope > header')).toBeInViewport({ ratio: 1 });
  await expect(dialog().locator('.terrain-footer')).toBeInViewport({ ratio: 1 });
  expect(await dialog().evaluate(node => node.scrollWidth <= node.clientWidth && node.scrollHeight <= node.clientHeight + 1)).toBe(true);
  const overflow=await dialog().locator('.terrain-content').evaluate(node=>({width:node.clientWidth,scroll:node.scrollWidth,viewport:innerWidth,items:Array.from(node.querySelectorAll('*')).filter(item=>item.getBoundingClientRect().right>node.getBoundingClientRect().right).map(item=>({tag:item.tagName,className:item.className,text:item.textContent?.slice(0,60),right:item.getBoundingClientRect().right}))}));
  expect(overflow.scroll<=overflow.width,JSON.stringify(overflow)).toBe(true);
  for (const button of await dialog().locator('.terrain-actions button').all()) {
    await expect(button).toBeInViewport({ ratio: 1 });
    expect(await button.evaluate(node => {
      const rect = node.getBoundingClientRect();
      return document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2) === node;
    })).toBe(true);
  }
}

test('default last decor, model forwarding, preview, apply, undo, save and reopen', async ({}, info) => {
  const sourceBefore = await fs.readFile(path.join(library, 'last.png'));
  await openGenerator();
  for (const radio of await dialog().getByRole('radio').all()) expect((await radio.boundingBox())!.width).toBeLessThanOrEqual(20);
  await expect(dialog().getByLabel('Décor de la cinématique précédente')).toContainText('Dernier regard sur la serre');
  expect(await dialog().getByLabel('Décor de la cinématique précédente').locator('option:checked').textContent()).toContain('dernier décor');
  await dialog().getByLabel('Modèle Codex du terrain').selectOption('terrain-test-model');
  await dialog().getByLabel('Précisions pour le terrain').fill('Garder les dalles claires.');
  await info.attach('reference-selection', { body: await page.screenshot(), contentType: 'image/png' });
  await generated();
  await expect(dialog().getByAltText('Terrain pollué proposé')).toHaveJSProperty('naturalWidth', 1600);
  await expect(dialog().getByAltText('Terrain nettoyé proposé')).toHaveJSProperty('naturalWidth',1600);
  await dialog().getByRole('checkbox', { name: /Afficher une grille indicative/ }).check();
  await expect(dialog().getByLabel('Aperçu de la grille de 5 allées et 8 colonnes').locator('span')).toHaveCount(80);
  for (const size of [{ width: 1280, height: 720 }, { width: 900, height: 600 }, { width: 640, height: 720 }]) {
    await page.setViewportSize(size);
    await expectAccessibleLayout();
  }
  await info.attach('terrain-ready-compact', { body: await page.screenshot({ path: info.outputPath('terrain-ready-compact.png') }), contentType: 'image/png' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  const jobs = await fs.readdir(path.join(profile, 'terrain-generations'));
  const request = JSON.parse(await fs.readFile(path.join(profile, 'terrain-generations', jobs[0], 'fixture-request.json'), 'utf8'));
  expect(request).toMatchObject({ ref: 'library://last.png', instructions: 'Garder les dalles claires.', codexModel: 'terrain-test-model' });
  expect(JSON.parse(await fs.readFile(target, 'utf8')).levels[0].terrainImage).toBe('library://other.png');
  await dialog().getByRole('button', { name: 'Utiliser les deux terrains pour le niveau' }).click();
  await expect(dialog()).toHaveCount(0); await expect(terrain()).toContainText('studio_generated/terrains/');
  await page.keyboard.press('Control+z'); await expect(terrain()).toContainText('other.png');
  await expect(terrain()).toContainText('first.png');
  await page.keyboard.press('Control+Shift+z'); await expect(terrain()).toContainText('studio_generated/terrains/');
  const data = await save(); expect(data.levels[1].terrainImage).toBeUndefined();
  const ref = data.levels[0].terrainImage; expect(ref).toMatch(/^library:\/\/studio_generated\/terrains\//);
  const restoredRef=data.levels[0].restoredTerrainImage;
  expect(ref).toMatch(/-pollue\.png$/);expect(restoredRef).toMatch(/-nettoye\.png$/);expect(restoredRef).not.toBe(ref);
  expect(await fs.readFile(path.join(library,ref.slice(10)))).not.toEqual(await fs.readFile(path.join(library,restoredRef.slice(10))));
  expect(await fs.readFile(path.join(library, 'last.png'))).toEqual(sourceBefore);
  await page.getByRole('button',{name:'Actions du fichier projet'}).click();await page.getByRole('button',{name:'Ouvrir un projet…',exact:true}).click();
  await expect(page.locator('.gd-message')).toContainText('Projet ouvert.');
  await page.locator('.studio-sections').getByRole('button', { name: /^Niveaux/ }).click();
  await page.locator('.gd-level-items button').filter({has:page.getByText(seedProject().levels[0].title,{exact:true})}).click(); await page.getByRole('button', { name: 'Paramètres', exact: true }).click(); await expect(terrain()).toContainText(ref.slice(10));
  await expect(terrain()).toContainText(restoredRef.slice(10));
});

test('choose another shot or import a free reference; discard leaves the current terrain intact', async ({}, info) => {
  await openGenerator();
  const select = dialog().getByLabel('Décor de la cinématique précédente'); await select.selectOption({ index: 0 });
  await generated();
  await dialog().getByRole('button', { name: 'Changer la référence' }).click();
  await dialog().getByRole('radio', { name: 'Autre image', exact: true }).check();
  const external = path.join(folder, 'reference-libre.png'); await fs.copyFile(path.join(library, 'other.png'), external);
  await app.evaluate(({ dialog }, external) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [external] }); }, external);
  await dialog().getByRole('button', { name: 'Choisir ou importer une référence' }).click();
  const picker = page.getByRole('dialog', { name: 'Bibliothèque d’images pour Image de référence du terrain' });
  await picker.getByRole('button', { name: /Importer/ }).click();
  await expect(picker).toHaveCount(0); await expect(dialog()).toContainText('reference-libre.png');
  await page.setViewportSize({ width: 900, height: 780 });
  expect(await dialog().evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
  await info.attach('terrain-narrow', { body: await page.screenshot(), contentType: 'image/png' });
  await generated();
  const requests = await Promise.all((await fs.readdir(path.join(profile, 'terrain-generations'))).map(async id => JSON.parse(await fs.readFile(path.join(profile, 'terrain-generations', id, 'fixture-request.json'), 'utf8'))));
  expect(requests.map(request => request.ref).sort()).toEqual(['library://first.png', 'library://studio_imports/reference-libre.png']);
  await dialog().getByRole('button', { name: 'Fermer', exact: true }).click();
  await expect(terrain()).toContainText('other.png');
  await expect.poll(async () => (await fs.readdir(library)).includes('studio_generated')).toBe(false);
});

test('no preceding cinematic permits manual selection and generation failure preserves the terrain', async () => {
  await page.locator('.gd-level-items button').filter({ has: page.getByText(seedProject().levels[1].title, { exact: true }) }).click(); await openGenerator();
  await expect(dialog()).toContainText('Aucune cinématique ne précède ce niveau');
  await expect(dialog().getByRole('button', { name: 'Générer les deux états', exact: true })).toBeDisabled();
  await dialog().getByRole('button', { name: 'Choisir ou importer une référence' }).click();
  const picker = page.getByRole('dialog', { name: 'Bibliothèque d’images pour Image de référence du terrain' });
  await picker.getByRole('button', { name: 'Other', exact: true }).click(); await picker.getByRole('button', { name: 'Utiliser cette image', exact: true }).click();
  await fs.writeFile(candidate, 'invalid image');
  await dialog().getByRole('button', { name: 'Générer les deux états', exact: true }).click();
  await expect(dialog().getByRole('alert')).toContainText('Image illisible');
  await expect(dialog().getByRole('button', { name: 'Utiliser les deux terrains pour le niveau' })).toHaveCount(0);
  await dialog().getByRole('button', { name: 'Fermer', exact: true }).click(); await expect(terrain()).toContainText('Aucune image sélectionnée');
});

test('generation stays readable and cancellable with a fixed header and footer on short or narrow screens', async ({}, info) => {
  await app.evaluate(({ ipcMain }) => {
    const job = { id: 'layout-preview', status: 'generating', sourceRef: 'library://last.png', message: 'Codex génère le terrain 16:9…' };
    ipcMain.removeHandler('terrain-generation:start'); ipcMain.handle('terrain-generation:start', () => job);
    ipcMain.removeHandler('terrain-generation:get'); ipcMain.handle('terrain-generation:get', () => job);
    ipcMain.removeHandler('terrain-generation:cancel'); ipcMain.handle('terrain-generation:cancel', () => ({ ...job, status: 'cancelled' }));
  });
  await openGenerator();
  await dialog().getByRole('button', { name: 'Générer les deux états', exact: true }).click();
  const status = dialog().getByRole('status').first();
  await expect(status).toContainText('Génération en cours');
  for (const size of [{ width: 1440, height: 1000 }, { width: 1280, height: 720 }, { width: 1000, height: 680 }, { width: 900, height: 600 }, { width: 640, height: 720 }, { width: 480, height: 640 }]) {
    await page.setViewportSize(size);
    await expectAccessibleLayout();
    await status.scrollIntoViewIfNeeded();
    const spinner = status.locator('.spinner');
    const [spinnerWidth, spinnerHeight] = await spinner.evaluate(node => [node.clientWidth, node.clientHeight]);
    expect(spinnerWidth).toBeGreaterThanOrEqual(20);
    expect(spinnerWidth).toBe(spinnerHeight);
    expect(await status.evaluate(node => {
      const outer = node.parentElement!.getBoundingClientRect(), inner = node.getBoundingClientRect();
      return inner.top >= outer.top && inner.bottom <= outer.bottom;
    })).toBe(true);
    await dialog().locator('.terrain-content').evaluate(node => { node.scrollTop = node.scrollHeight; });
    await expectAccessibleLayout();
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await status.scrollIntoViewIfNeeded();
  await info.attach('terrain-generation-desktop', { body: await page.screenshot({ path: info.outputPath('terrain-generation-desktop.png') }), contentType: 'image/png' });
  await page.setViewportSize({ width: 900, height: 600 });
  await info.attach('terrain-generation-compact', { body: await page.screenshot({ path: info.outputPath('terrain-generation-compact.png') }), contentType: 'image/png' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(status.locator('.spinner')).toHaveCSS('animation-name', 'none');
  await dialog().getByRole('button', { name: 'Annuler la génération', exact: true }).click();
  await expect(dialog().getByLabel('Précisions pour le terrain')).toBeEnabled();
  await dialog().getByRole('button', { name: 'Fermer', exact: true }).click();
  await expect(terrain()).toContainText('other.png');
});
