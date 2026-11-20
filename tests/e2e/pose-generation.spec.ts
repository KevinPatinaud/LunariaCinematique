import { test, expect, _electron, type ElectronApplication, type Page } from '@playwright/test';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { newActor, newBubble, newCinematic, type Asset, type Cinematic } from '../../src/shared/model.js';
import { seedProject } from '../../src/shared/game/seed.js';
import { fixturePresentation } from '../presentation-fixture.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ART = 'C:/dev/Lunaria/LunariaArtLibrary';
const master = '02_characters/radis/stage_01/radis_stage_01_master_v01.png';
const current = '02_characters/radis/stage_01/poses/Petit radis feuillu souriant.png';
const captures = process.env.LUNARIA_QA_OUTPUT || path.join(ROOT, 'test-results', 'pose-captures');
let app: ElectronApplication, page: Page, folder: string, profile: string, library: string, projectFile: string, film: Cinematic, errors: string[];
const live = process.env.LUNARIA_POSE_LIVE === '1';
async function boot() {
  const env = { ...process.env, LUNARIA_E2E: '1', LUNARIA_TEST_USER_DATA: profile,
    ...(live ? {} : { LUNARIA_E2E_POSE_RESULT: path.join(profile, 'pose.png'), LUNARIA_E2E_POSE_MANUAL: '1' }) };
  delete env.LUNARIA_DEV_URL;
  app = await _electron.launch({ args: [ROOT], env });
  page = await app.firstWindow(); page.on('pageerror', reason => errors.push(reason.message));
  await page.waitForURL('app://studio/index.html'); await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator('.studio-project-state')).toContainText(path.basename(projectFile));
}
async function stop() {
  await app.evaluate(({ BrowserWindow }) => { for (const window of BrowserWindow.getAllWindows()) window.destroy(); }).catch(() => undefined);
  await app.close().catch(() => undefined);
}
test.beforeEach(async () => {
  errors = []; folder = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-pose-ui-')); profile = path.join(folder, 'profile'); library = path.join(profile, 'library'); projectFile = path.join(folder, 'pose.game.json');
  await fs.mkdir(path.join(library, path.dirname(current)), { recursive: true }); await fs.mkdir(captures, { recursive: true });
  for (const ref of [master,current]) await fs.copyFile(path.join(ART, ref), path.join(library, ref));
  await fs.copyFile(path.join(ART, '02_characters/radis/stage_01/poses/Petit radis en larmes.png'), path.join(profile, 'pose.png'));
  const image: Asset = { ref: `library://${current}`, path: current, folder: path.dirname(current), name: 'Radis', kind: 'character', bytes: 1, modified: 0, url: '', thumbnail: '' };
  film = newCinematic(); film.title = 'Les émotions de Radis'; film.shots[0].name = 'Le chagrin';
  film.shots[0].actors = [0,1].map(i => { const actor = newActor(image, 1, .18 + i * .4, .35); actor.name = i ? 'Radis témoin' : 'Radis'; actor.width = .15; actor.height = .32; return actor; });
  const bubble = newBubble(film.shots[0].actors[0].id); bubble.text = 'Je suis triste.'; film.shots[0].bubbles = [bubble];
  const project = seedProject(); project.levels = []; project.campaign = { cinematics: [], steps: [] }; project.cinematics = [film];
  await fs.writeFile(projectFile, JSON.stringify(project));
  await fs.writeFile(path.join(profile,'settings.json'), JSON.stringify({ libraryRoot: library }));
  await fs.writeFile(path.join(profile,'game-recents.json'), JSON.stringify([{ path: projectFile, title: project.title, updatedAt: new Date().toISOString() }]));
  await fs.writeFile(path.join(profile,'codex-models.json'), JSON.stringify([{ id: 'test-model', label: 'Modèle de test', description: '', isDefault: false }]));
  await boot();
});
test.afterEach(async ({}, info) => {
  if (page && !page.isClosed() && info.status !== info.expectedStatus) await info.attach('pose-failure', { body: await page.screenshot(), contentType: 'image/png' });
  await stop();
  if (live) await fs.writeFile(path.join(captures,'live-profile.txt'), folder);
  else await fs.rm(folder, { recursive: true, force: true });
  expect(errors).toEqual([]);
});
const dialog = () => page.getByRole('dialog', { name: 'Générer une pose avec Codex', exact: true });
const center = () => page.getByRole('dialog', { name: 'Tâches et résultats', exact: true });
async function begin() {
  await page.getByRole('button', { name: 'Sélectionner Radis', exact: true }).click();
  await page.getByRole('button', { name: 'Générer une pose avec Codex', exact: true }).click();
  await expect(dialog().locator('.lp-image-current')).toContainText('radis_stage_01_master_v01.png');
  await dialog().getByLabel('Décris la pose souhaitée').fill('Radis pleure, tête baissée, les larmes visibles.');
  if (!live) await dialog().getByLabel('Modèle Codex', { exact: true }).selectOption('test-model');
  await dialog().getByRole('button', { name: 'Générer la pose', exact: true }).click();
  await expect(dialog().getByRole('button', { name: 'Annuler la génération', exact: true })).toBeVisible();
  await expect.poll(async () => (await page.evaluate(() => window.lunaria!.listImageTasks())).find(item => item.kind === 'pose')?.job.status).toBe('generating');
  const task = (await page.evaluate(() => window.lunaria!.listImageTasks())).find(item => item.kind === 'pose')!;
  return task.job.id;
}
async function release(id: string) { await fs.writeFile(path.join(profile,'pose-generations',id,'fixture-release'), 'go'); }
async function ready(id: string) {
  await expect.poll(async () => (await page.evaluate(id => window.lunaria!.getPoseGeneration(id), id)).status, { timeout: live ? 840000 : 15000 }).toBe('ready');
}
async function openCenter() { await page.getByRole('button', { name: /^Tâches et résultats/ }).click(); await expect(center()).toBeVisible(); await center().getByLabel('Filtrer les tâches').selectOption('pose'); await center().locator('.image-task-card').first().click(); }
async function save() { await page.getByRole('button', { name: 'Enregistrer le projet', exact: true }).click(); await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré'); return JSON.parse(await fs.readFile(projectFile,'utf8')).cinematics[0] as Cinematic; }

test('generate, reduce, change selection, apply to the origin, undo/redo and reopen', async () => {
  test.skip(live); const id = await begin();
  const request = JSON.parse(await fs.readFile(path.join(profile,'pose-generations',id,'fixture-request.json'),'utf8'));
  expect(request.ref).toBe(`library://${master}`); expect(request.currentRef).toBe(`library://${current}`); expect(request.codexModel).toBe('test-model');
  await dialog().getByRole('button', { name: 'Réduire', exact: true }).click();
  await page.getByRole('button', { name: 'Sélectionner Radis témoin', exact: true }).click();
  await release(id); await ready(id); await openCenter();
  await page.screenshot({ path: path.join(captures,'pose-ready.png') });
  await center().getByRole('button', { name: 'Utiliser cette pose dans le plan', exact: true }).click();
  await expect(center().getByText('Pose utilisée dans :')).toBeVisible();
  await center().getByRole('button', { name: 'Fermer', exact: true }).click();
  const result = await save();
  expect(result.shots[0].actors[0].asset).toContain('/poses/generated/pose-');
  expect(result.shots[0].actors[1]).toEqual(film.shots[0].actors[1]);
  expect(result.shots[0].actors[0].id).toBe(film.shots[0].actors[0].id);
  expect(result.shots[0].bubbles[0].speakerId).toBe(film.shots[0].actors[0].id);
  await page.keyboard.press('Control+z'); expect((await save()).shots[0].actors[0].asset).toBe(`library://${current}`);
  await page.keyboard.press('Control+y'); expect((await save()).shots[0].actors[0].asset).toBe(result.shots[0].actors[0].asset);
  await page.screenshot({ path: path.join(captures,'pose-applied.png') });
  await stop(); await boot(); expect((await save()).shots[0].actors[0].asset).toBe(result.shots[0].actors[0].asset);
});

test('ready proposal survives restart and can be imported without assigning it', async () => {
  test.skip(live); const id = await begin(); await release(id); await ready(id);
  await dialog().getByRole('button', { name: 'Réduire', exact: true }).click(); await stop(); await boot(); await openCenter();
  await expect(center().getByAltText('Proposition de la tâche')).toBeVisible();
  await center().getByRole('button', { name: 'Ajouter à la bibliothèque', exact: true }).click();
  await expect(center().locator('.image-task-title')).toContainText('À affecter');
  expect((await page.evaluate(id => window.lunaria!.getPoseGeneration(id), id)).poseRef).toBeTruthy();
  await center().getByRole('button', { name: 'Fermer', exact: true }).click();
  expect((await save()).shots[0].actors[0].asset).toBe(`library://${current}`);
});

test('cancellation stays cancelled, can be relaunched and is tracked in the common panel', async () => {
  test.skip(live); const id = await begin();
  await dialog().getByRole('button', { name: 'Annuler la génération', exact: true }).click();
  await release(id);
  await expect.poll(async () => (await page.evaluate(id => window.lunaria!.getPoseGeneration(id),id)).status).toBe('cancelled');
  await dialog().getByRole('button', { name: 'Réduire', exact: true }).click(); await openCenter();
  await center().getByRole('button', { name: 'Relancer cette tâche', exact: true }).click();
  await expect(center().locator('.image-task-card')).toHaveCount(2);
});

test('another project with identical actor IDs requires an explicit destination', async () => {
  test.skip(live); const id = await begin(); await release(id); await ready(id);
  await dialog().getByRole('button', { name: 'Réduire', exact: true }).click();
  const other = JSON.parse(await fs.readFile(projectFile,'utf8')); other.id = 'another_project'; other.title = 'Autre projet';
  const otherFile = path.join(folder,'other.game.json'); await fs.writeFile(otherFile, JSON.stringify(other));
  await app.evaluate(({ dialog }, file) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [file] }); }, otherFile);
  await page.getByRole('button', { name: 'Actions du fichier projet' }).click(); await page.getByRole('button', { name: 'Ouvrir un projet…', exact: true }).click();
  await expect(page.locator('.studio-project-state')).toContainText('other.game.json'); await openCenter();
  await expect(center().getByLabel('Personnage de destination')).toHaveValue('');
  await expect(center().getByRole('button', { name: 'Utiliser cette pose dans le plan', exact: true })).toBeDisabled();
  await center().getByLabel('Personnage de destination').selectOption(JSON.stringify([film.id,film.shots[0].id,film.shots[0].actors[1].id]));
  await center().getByRole('button', { name: 'Utiliser cette pose dans le plan', exact: true }).click();
  await expect(center().getByText('Pose utilisée dans :')).toContainText('Radis témoin');
});

test('opaque result is refused and the creation form remains usable in a narrow window', async () => {
  test.skip(live);
  const opaque = await app.evaluate(({ nativeImage }) => Array.from(nativeImage.createFromBitmap(Buffer.alloc(100*120*4,255),{width:100,height:120}).toPNG()));
  await fs.writeFile(path.join(profile,'pose.png'), Buffer.from(opaque));
  await page.setViewportSize({ width: 1050, height: 800 }); const id = await begin();
  await page.screenshot({ path: path.join(captures,'pose-form.png') });
  await release(id);
  await expect.poll(async () => (await page.evaluate(id => window.lunaria!.getPoseGeneration(id),id)).status).toBe('failed');
  await expect(dialog()).toContainText('véritable fond transparent');
  await expect(dialog().getByRole('button', { name: 'Générer une autre proposition', exact: true })).toBeEnabled();
});

test('the reference picker imports a custom Master and forwards that image to Codex', async () => {
  test.skip(live);
  await page.getByRole('button', { name: 'Sélectionner Radis', exact: true }).click();
  await page.getByRole('button', { name: 'Générer une pose avec Codex', exact: true }).click();
  const imported=path.join(folder,'reference-radis.png'); await fs.copyFile(path.join(library,master),imported);
  await app.evaluate(({dialog},file)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]});},imported);
  await dialog().getByRole('button',{name:'Choisir une autre référence',exact:true}).click();
  const picker=page.getByRole('dialog',{name:'Bibliothèque d’images pour Référence officielle du personnage',exact:true});
  await picker.getByRole('button',{name:/Importer/}).click(); await expect(picker).toHaveCount(0);
  await expect(dialog().locator('.lp-image-current')).toContainText('reference-radis.png');
  await dialog().getByLabel('Décris la pose souhaitée').fill('Radis pleure.');
  await dialog().getByRole('button',{name:'Générer la pose',exact:true}).click();
  await expect.poll(async()=> (await page.evaluate(()=>window.lunaria!.listImageTasks())).find(item=>item.kind==='pose')?.request.ref).toBe('library://studio_imports/reference-radis.png');
});

test('applying a fixed pose removes the catalogue animation and undo restores it', async () => {
  test.skip(live);
  const project=fixturePresentation(JSON.parse(await fs.readFile(projectFile,'utf8')),`library://${current}`);
  const document=project.cinematics![0]; document.schemaVersion=4; document.presentationCatalog={projectId:project.id,file:''};
  document.shots[0].actors[0].animation={mode:'species',speciesId:project.balance.plants[0].id,animationId:'',slot:'idle',speed:1};
  const animatedFile=path.join(folder,'animated.game.json'); await fs.writeFile(animatedFile,JSON.stringify(project));
  await app.evaluate(({dialog},file)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]});},animatedFile);
  await page.getByRole('button',{name:'Actions du fichier projet'}).click(); await page.getByRole('button',{name:'Ouvrir un projet…',exact:true}).click();
  await expect(page.locator('.studio-project-state')).toContainText('animated.game.json'); projectFile=animatedFile;
  const id=await begin(); await release(id); await ready(id);
  await dialog().getByRole('button',{name:'Utiliser cette pose dans le plan',exact:true}).click(); await expect(dialog().getByText('Pose utilisée dans :')).toBeVisible();
  await dialog().getByRole('button',{name:'Réduire',exact:true}).click();
  expect(Object.hasOwn((await save()).shots[0].actors[0],'animation')).toBe(false);
  await page.keyboard.press('Control+z'); expect((await save()).shots[0].actors[0].animation).toEqual(document.shots[0].actors[0].animation);
});

test('native Codex generates a real transparent Radis pose through the Studio', async () => {
  test.skip(!live); test.setTimeout(900000);
  const id = await begin(); await ready(id);
  await page.screenshot({ path: path.join(captures,'pose-live-result.png') });
  const job = await page.evaluate(id => window.lunaria!.getPoseGeneration(id), id);
  await fs.copyFile(path.join(profile,'pose-generations',id,'pose.png'), path.join(captures,'radis-pleure-native.png'));
  await fs.writeFile(path.join(captures,'pose-live-job.json'), JSON.stringify(job,null,2));
  await dialog().getByRole('button', { name: 'Utiliser cette pose dans le plan', exact: true }).click();
  await expect(dialog().getByText('Pose utilisée dans :')).toBeVisible();
  await dialog().getByRole('button', { name: 'Réduire', exact: true }).click();
  expect((await save()).shots[0].actors[0].asset).toContain('/poses/generated/pose-');
  await page.screenshot({ path: path.join(captures,'pose-live-applied.png') });
});
