import { test, expect, _electron, type ElectronApplication, type Page } from '@playwright/test';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import {newTextAnimation} from '../../src/shared/textAnimation.js';
import { prepareCinematic } from '../../src/shared/geometry.js';
import { newActor, newBubble, newCinematic, newShot, type Asset, type Cinematic } from '../../src/shared/model.js';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let app: ElectronApplication, page: Page, temp: string, library: string, target: string;
let errors: string[];
const asset: Asset = {ref:'library://05_characters/test.png',path:'05_characters/test.png',name:'Objet A',folder:'05_characters',kind:'character',bytes:1,modified:0,url:'',thumbnail:''};
function fixture(): Cinematic {
  const doc = newCinematic(), shot=doc.shots[0];doc.title='Test Electron';shot.name='Plan de test';
  shot.background.asset='library://01_europe/lunaria/interieur_serre/greenhouse_aisle_wide_variant_v01.png';
  shot.actors=[newActor(asset,1.5,.15,.48),newActor({...asset,name:'Objet B'},1.5,.65,.48)];
  shot.bubbles=[newBubble(shot.actors[0].id)];shot.bubbles[0].text='Une réplique de test.';return doc;
}
async function openFixture(doc=fixture()) {
  const source=path.join(temp,'source.json');await fs.writeFile(source,JSON.stringify(doc));
  await app.evaluate(({dialog},source)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[source]});dialog.showMessageBox=async()=>({response:1,checkboxChecked:false});},source);
  await page.getByRole('button',{name:'Ouvrir',exact:true}).click();
  await expect(page.getByLabel('Nom du plan',{exact:true})).toHaveValue('Plan de test');return doc;
}
async function saveCurrent(): Promise<Cinematic> {
  const oldStamp=await fs.stat(target,{bigint:true}).then(s=>s.mtimeNs.toString()).catch(()=>null);
  await page.getByRole('button',{name:'Enregistrer sous',exact:true}).click();
  await expect.poll(async()=>fs.stat(target,{bigint:true}).then(s=>s.mtimeNs.toString()!==oldStamp).catch(()=>false)).toBe(true);
  await expect.poll(async()=>{try{return JSON.parse(await fs.readFile(target,'utf8')).shots.length;}catch{return 0;}}).toBeGreaterThan(0);
  // The completion status ensures the native request, backup and version writes have finished.
  await expect(page.locator('.toast')).toContainText(/enregistr/i);
  return JSON.parse(await fs.readFile(target,'utf8')) as Cinematic;
}
test.beforeEach(async()=>{
  errors=[];temp=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-electron-v14-'));library=path.join(temp,'library');target=path.join(temp,'saved.json');
  await fs.cp(path.join(ROOT,'example-library'),library,{recursive:true});
  await fs.mkdir(path.join(library,'05_characters'),{recursive:true});await fs.mkdir(path.join(library,'07_props'),{recursive:true});await fs.copyFile(path.join(library,'06_ui/dialogues/tooltip_ornate_v01.png'),path.join(library,'07_props/panneau.png'));await fs.copyFile(path.join(library,'06_ui/dialogues/tooltip_ornate_v01.png'),path.join(library,'05_characters/test.png'));
  // Test fixtures only: reuse a panel PNG; these are not production enemy designs.
  for (const folder of ['03_enemies/canette/Stage 01','03_enemies/canette/expressions']) {
    await fs.mkdir(path.join(library,folder),{recursive:true});
    await fs.copyFile(path.join(library,'06_ui/dialogues/tooltip_ornate_v01.png'),path.join(library,folder,'ennemi_test.png'));
  }
  const profile=path.join(temp,'profile');await fs.mkdir(profile);await fs.writeFile(path.join(profile,'settings.json'),JSON.stringify({libraryRoot:library}));
  const env=Object.fromEntries(Object.entries(process.env).filter((entry):entry is [string,string]=>typeof entry[1]==='string'));
  delete env.LUNARIA_DEV_URL;
  app=await _electron.launch({args:[ROOT],env:{...env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:profile}});
  page=await app.firstWindow();page.on('pageerror',e=>errors.push(e.message));
  await page.waitForURL('app://studio/index.html');await expect(page.getByText('V1.10',{exact:true})).toBeVisible();
  await app.evaluate(({dialog},target)=>{dialog.showSaveDialog=async()=>({canceled:false,filePath:target});dialog.showMessageBox=async()=>({response:1,checkboxChecked:false});},target);
});
test.afterEach(async({},testInfo)=>{
  if(page&&!page.isClosed()&&testInfo.status!==testInfo.expectedStatus)await testInfo.attach('studio',{body:await page.screenshot(),contentType:'image/png'});
  if(app)await app.close();await fs.rm(temp,{recursive:true,force:true});expect(errors).toEqual([]);
});
test('renderer isolé, vrais protocoles locaux et sauvegarde JSON sans images embarquées',async()=>{
  const preferences=await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences());
  expect(preferences.contextIsolation).toBe(true);expect(preferences.nodeIntegration).toBe(false);expect(preferences.sandbox).toBe(true);
  const doc=await openFixture();const saved=await saveCurrent();expect(saved).toEqual(prepareCinematic(doc));
  expect(JSON.stringify(saved)).not.toContain('data:image');expect(saved.shots[0].background.asset).toMatch(/^library:\/\//);
});
test('déplacement, duplication et suppression de plusieurs objets via le vrai preload',async()=>{
  const doc=await openFixture();await page.getByRole('button',{name:'Sélectionner Objet A',exact:true}).click();await page.getByRole('button',{name:'Sélectionner Objet B',exact:true}).click({modifiers:['Shift']});
  await page.keyboard.press('Shift+ArrowRight');const moved=await saveCurrent();expect(moved.shots[0].actors[0].x).toBeCloseTo(doc.shots[0].actors[0].x+10/1600);
  expect(moved.shots[0].actors[1].x).toBeCloseTo(doc.shots[0].actors[1].x+10/1600);
  await page.keyboard.press('Control+d');expect((await saveCurrent()).shots[0].actors).toHaveLength(4);
  await page.keyboard.press('Delete');expect((await saveCurrent()).shots[0].actors).toHaveLength(2);
  await page.keyboard.press('Control+z');expect((await saveCurrent()).shots[0].actors).toHaveLength(4);
});
test('favoris réellement persistés entre deux chargements du renderer',async()=>{
  await page.locator('.asset-favorite').first().click();await page.getByRole('button',{name:'Favoris',exact:true}).click();await expect(page.locator('.asset-card')).toHaveCount(1);
  await page.reload();await expect(page.getByText('V1.10',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Favoris',exact:true}).click();await expect(page.locator('.asset-card')).toHaveCount(1);
});
test('continuer un plan et générer le modèle dialogue à deux',async()=>{
  const doc=await openFixture();await page.getByRole('button',{name:'Continuer ce plan',exact:true}).click();const continued=await saveCurrent();expect(continued.shots).toHaveLength(2);expect(continued.shots[1].bubbles).toHaveLength(0);expect(continued.shots[1].actors.map(a=>[a.x,a.y])).toEqual(doc.shots[0].actors.map(a=>[a.x,a.y]));
  await page.getByRole('button',{name:'Ajouter un plan',exact:true}).click();await page.getByRole('button',{name:'Dialogue à deux',exact:false}).click();await page.getByRole('button',{name:'Créer le plan',exact:true}).click();const result=await saveCurrent();expect(result.shots[2].bubbles).toHaveLength(2);
  expect(result.shots[2].bubbles[0].speakerId).not.toBe(result.shots[2].bubbles[1].speakerId);
});
test('restauration d’un point de repère : écritures réelles, original non écrasé',async()=>{
  await openFixture();await saveCurrent();await page.getByRole('button',{name:'Versions locales',exact:true}).first().click();await page.getByLabel('Nom du point de repère').fill('Avant les changements');await page.getByRole('button',{name:'Créer un repère',exact:true}).click();await expect(page.getByText('Avant les changements',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Fermer',exact:true}).last().click();
  await page.getByLabel('Nom du plan',{exact:true}).fill('Modification sauvegardée');await saveCurrent();const diskBefore=await fs.readFile(target,'utf8');
  await page.getByRole('button',{name:'Versions locales',exact:true}).first().click();await page.getByRole('listitem').filter({hasText:'Avant les changements'}).click();await page.getByRole('button',{name:'Restaurer cette version',exact:true}).click();await expect(page.getByLabel('Nom du plan',{exact:true})).toHaveValue('Plan de test');
  expect(await fs.readFile(target,'utf8')).toBe(diskBefore);await page.keyboard.press('Control+z');await expect(page.getByLabel('Nom du plan',{exact:true})).toHaveValue('Modification sauvegardée');
  expect((await fs.readdir(path.join(temp,'profile','versions'))).length).toBeGreaterThan(0);
});
test('diagnostic d’asset absent et correction ciblée hors écran',async()=>{
  const doc=fixture();doc.shots[0].actors[0].asset='library://missing.png';doc.shots[0].actors[1].x=1.5;await openFixture(doc);
  await page.getByRole('button',{name:'Tout lire',exact:true}).click();await expect(page.getByRole('heading',{name:'Diagnostics de la cinématique'})).toBeVisible();await expect(page.getByText('1 erreur(s)',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Recentrer',exact:true}).click();await page.getByRole('button',{name:'Retour à la scène',exact:true}).click();expect((await saveCurrent()).shots[0].actors[1].x).toBeLessThan(1);
});

test('objet animé : catégorie dédiée, poignée B, aperçu sans mutation et JSON v2',async()=>{
  await openFixture();
  await page.getByRole('tab',{name:'Objets',exact:false}).click();
  await page.locator('.asset-card').first().dblclick();
  await expect(page.getByLabel('Type d’élément',{exact:true})).toHaveValue('prop');
  await page.getByLabel('Activer le déplacement A vers B',{exact:true}).check();
  const before=await saveCurrent(), actor=before.shots[0].actors.at(-1)!;
  const destination=await page.getByTestId('movement-destination').boundingBox();
  if(!destination)throw new Error('Poignée B absente');
  await page.mouse.move(destination.x+destination.width/2,destination.y+destination.height/2);
  await page.mouse.down();await page.mouse.move(destination.x+destination.width/2-35,destination.y+destination.height/2-20,{steps:6});await page.mouse.up();
  const moved=await saveCurrent();expect(moved.shots[0].actors.at(-1)!.movement!.dx).not.toEqual(actor.movement!.dx);
  await page.getByLabel('Effet de mouvement',{exact:true}).selectOption('sway');
  const configured=await saveCurrent();expect(configured.schemaVersion).toBe(2);expect(configured.shots[0].actors.at(-1)!.pivot).toBe('top');
  const object=page.getByTestId(`actor-${actor.id}`),rest=await object.getAttribute('transform');
  await page.getByRole('button',{name:'Tester les mouvements',exact:true}).click();
  await expect.poll(()=>object.getAttribute('transform')).not.toBe(rest);
  await page.getByRole('button',{name:'Pause des mouvements',exact:true}).click();
  const paused=await object.getAttribute('transform');await page.waitForTimeout(120);expect(await object.getAttribute('transform')).toBe(paused);
  expect(await saveCurrent()).toEqual(configured);
  await page.getByRole('button',{name:'Retour au placement',exact:true}).click();expect(await object.getAttribute('transform')).toBe(rest);
});

test('réouverture v2 et continuité de la destination du déplacement',async()=>{
  const doc=fixture();doc.schemaVersion=2;
  const actor=doc.shots[0].actors[0];actor.role='prop';actor.motion={preset:'float',intensity:.4,period:3,delay:0,loop:true,reverse:false};
  actor.movement={enabled:true,dx:.2,dy:-.05,duration:2,delay:0,easing:'smooth',repeat:'once'};
  await openFixture(doc);await page.getByRole('button',{name:'Continuer ce plan',exact:true}).click();
  const result=await saveCurrent();expect(result.shots[1].actors[0].movement!.enabled).toBe(false);
  expect(result.shots[1].actors[0].x).toBeCloseTo(actor.x+.2);expect(result.shots[1].actors[0].motion).toEqual(actor.motion);
  await openFixture(result);expect(await saveCurrent()).toEqual(result);
});


// V1.4.2: these scenarios are intended for the real Electron build.
function playbackFixture(): Cinematic {
  const doc = fixture();
  const next = newShot(doc.shots[0].background.asset); next.name = 'Plan cible'; next.duration = 20;
  const last = newShot(doc.shots[0].background.asset); last.name = 'Plan suivant'; last.duration = 20;
  doc.shots.push(next, last); return doc;
}
test('choix clair du passage au plan suivant, sauvegarde et aperçu par clic',async()=>{
  const doc=fixture();doc.shots[0].duration=1;doc.shots[0].bubbles=[];
  const next=newShot(doc.shots[0].background.asset);next.name='Plan cible';next.duration=20;doc.shots.push(next);
  await openFixture(doc);
  const choices=page.getByRole('group',{name:'Passage au plan suivant'});
  await expect(choices.getByRole('button',{name:/Enchaîner automatiquement/})).toHaveAttribute('aria-pressed','true');
  await choices.getByRole('button',{name:/Attendre un clic/}).click();
  const saved=await saveCurrent();expect(saved.shots[0].endAdvance).toBe('click');
  await page.getByRole('button',{name:'Tout lire',exact:true}).click();
  await expect(page.getByRole('button',{name:/Passer au plan suivant/})).toBeEnabled();
  await expect(page.locator('.scene-path')).toContainText('Plan de test');
  await page.getByRole('button',{name:/Passer au plan suivant/}).click();
  await expect(page.locator('.scene-path')).toContainText('Plan cible');
});
test('lecture depuis le plan choisi et retour au même plan, sans modification du JSON', async () => {
  const doc = playbackFixture(); await openFixture(doc);
  await page.getByTestId('shot-card-1').click();
  await expect(page.locator('.play-from-number')).toHaveText('02');
  await page.getByTestId('play-from-current').click();
  await expect(page.locator('.scene-path')).toContainText('APERÇU');
  await expect(page.locator('.scene-path')).toContainText('Plan cible');
  await page.keyboard.press('Escape');
  await expect(page.getByLabel('Nom du plan', {exact:true})).toHaveValue('Plan cible');
  expect(await saveCurrent()).toEqual(prepareCinematic(doc));
  await page.getByTestId('play-all').click();
  await expect(page.locator('.scene-path')).toContainText('APERÇU');
  await expect(page.locator('.scene-path')).toContainText('Plan de test');
});
test('Maj+Espace depuis une vignette ; aucune lecture pendant une saisie', async () => {
  await openFixture(playbackFixture());
  await page.getByTestId('shot-card-1').click();
  await page.keyboard.press('Shift+Space');
  await expect(page.locator('.scene-path')).toContainText('APERÇU');
  await expect(page.locator('.scene-path')).toContainText('Plan cible');
  await page.keyboard.press('Escape');
  await page.getByLabel('Nom du plan',{exact:true}).focus();
  await page.keyboard.press('Shift+Space');
  await expect(page.locator('.scene-path')).toContainText('SCÈNE');
  await expect(page.getByTestId('play-from-current')).toBeVisible();
});
test('un asset absent dans un plan antérieur ne bloque pas la lecture depuis le suivant', async () => {
  const doc = playbackFixture(); doc.shots[0].background.asset = 'library://missing.png';
  await openFixture(doc); await page.getByTestId('shot-card-1').click();
  await page.getByTestId('play-from-current').click();
  await expect(page.locator('.scene-path')).toContainText('APERÇU');
  await expect(page.locator('.scene-path')).toContainText('Plan cible');
  await page.keyboard.press('Escape');
  await page.getByTestId('play-all').click();
  await expect(page.getByRole('heading',{name:'Diagnostics de la cinématique'})).toBeVisible();
});

// V1.4.2: native Electron paths. Fixtures are temporary copies of a panel PNG,
// not new enemy artwork and never written into the user's library.
test('ennemis : catégorie dédiée, insertion, sauvegarde et réouverture',async()=>{
  await openFixture();
  await page.getByRole('button',{name:'Ajouter un ennemi',exact:true}).click();
  await expect(page.locator('.library [data-tab="enemy"]')).toHaveAttribute('aria-selected','true');
  await expect(page.locator('.library .asset-card')).toHaveCount(2);
  await page.locator('.library .asset-card').first().dblclick();
  await expect(page.getByLabel('Type d’élément')).toHaveValue('enemy');
  await expect(page.getByLabel('Nom de l’ennemi',{exact:true})).toBeVisible();
  const saved=await saveCurrent();const enemy=saved.shots[0].actors.at(-1)!;
  expect(saved.schemaVersion).toBe(2);expect(enemy.role).toBe('enemy');expect(enemy.asset).toMatch(/^library:\/\/03_enemies\//);
  expect(saved.shots[0].actors[0].role).toBeUndefined();
  await openFixture(saved);await page.getByRole('button',{name:`Sélectionner ${enemy.name}`,exact:true}).click();
  await expect(page.getByLabel('Type d’élément')).toHaveValue('enemy');
});
test('ennemi : bulles liées, mouvements, miroir et copie conservés dans le JSON',async()=>{
  await openFixture();await page.locator('.library [data-tab="enemy"]').click();await page.locator('.library .asset-card').first().dblclick();
  await page.getByLabel('Effet de mouvement').selectOption('shake');
  await page.getByLabel('Activer le déplacement A vers B').check();
  await expect(page.getByTestId('movement-destination')).toBeVisible();
  await page.getByRole('button',{name:'Retourner horizontalement',exact:true}).click();
  await page.locator('.scene-actions').getByRole('button',{name:'Bulle',exact:true}).click();
  await page.getByLabel('Texte de la bulle',{exact:true}).fill('Cette serre est à moi !');
  const saved=await saveCurrent(),enemy=saved.shots[0].actors.at(-1)!,bubble=saved.shots[0].bubbles.at(-1)!;
  expect(enemy.role).toBe('enemy');expect(enemy.motion?.preset).toBe('shake');expect(enemy.movement?.enabled).toBe(true);
  expect(enemy.flipX).toBe(true);expect(bubble.speakerId).toBe(enemy.id);expect(bubble.tail.mode).toBe('auto');
  await page.getByRole('button',{name:'Continuer ce plan',exact:true}).click();
  const continued=await saveCurrent();expect(continued.shots[1].actors.at(-1)?.role).toBe('enemy');
});
test('ennemi : glisser-déposer réellement au pointeur conserve le type',async()=>{
  await openFixture();await page.locator('.library [data-tab="enemy"]').click();
  const before=await saveCurrent();const card=page.locator('.library .asset-card').first();
  await card.dragTo(page.getByTestId('scene'),{targetPosition:{x:150,y:150}});
  await expect(page.getByLabel('Type d’élément')).toHaveValue('enemy');
  const saved=await saveCurrent();expect(saved.shots[0].actors).toHaveLength(before.shots[0].actors.length+1);
  expect(saved.shots[0].actors.at(-1)?.role).toBe('enemy');
});
test('ennemi : ajout explicite depuis la grande galerie sans déplacer le fichier',async()=>{
  await openFixture();await page.locator('.library [data-tab="prop"]').click();
  await page.getByRole('button',{name:'Agrandir la bibliothèque',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Bibliothèque agrandie'});await dialog.locator('.asset-card').first().click();
  await dialog.getByRole('button',{name:'Ajouter comme ennemi',exact:true}).click();
  await expect(dialog).not.toBeVisible();await expect(page.getByLabel('Type d’élément')).toHaveValue('enemy');
  const saved=await saveCurrent();expect(saved.shots[0].actors.at(-1)?.asset).toBe('library://07_props/panneau.png');
  expect(await fs.readFile(path.join(library,'07_props/panneau.png'))).toEqual(await fs.readFile(path.join(ROOT,'example-library/06_ui/dialogues/tooltip_ornate_v01.png')));
});
test('ennemi : convertir un personnage existant et annuler sans perdre ses réglages',async()=>{
  const doc=await openFixture();await page.getByRole('button',{name:'Sélectionner Objet A',exact:true}).click();
  await page.getByLabel('Type d’élément').selectOption('enemy');
  let saved=await saveCurrent();expect(saved.shots[0].actors[0].role).toBe('enemy');expect(saved.shots[0].actors[0].asset).toBe(doc.shots[0].actors[0].asset);
  await page.getByRole('button',{name:'Annuler',exact:true}).click();saved=await saveCurrent();
  expect(saved.schemaVersion).toBe(1);expect(saved.shots[0].actors[0]).toEqual(doc.shots[0].actors[0]);
});

// V1.4.3: native bridge / filesystem regression scenarios. Native dialogs are
// replaced by deterministic selections; use only this test's temporary profile.
async function openRecentDialog() {
  await page.getByRole('button', { name: 'Projets récents', exact: true }).click();
  const popup = page.getByRole('dialog', { name: 'Projets récents', exact: true });
  await expect(popup).toBeVisible();
  await expect(popup.getByRole('button', { name: 'Actualiser les projets récents', exact: true })).toBeEnabled();
  return popup;
}
test('récents : ouverture, enregistrement sous, métadonnées seules et épinglage persistant', async () => {
  await openFixture(); await saveCurrent();
  const popup = await openRecentDialog();
  await expect(popup.locator('.recent-project-card')).toHaveCount(2);
  await popup.locator('.recent-project-card.current').getByRole('button', { name: 'Épingler Test Electron', exact: true }).click();
  await expect(popup.locator('.recent-project-card.current').getByRole('button', { name: 'Détacher Test Electron', exact: true })).toBeEnabled();
  const index = JSON.parse(await fs.readFile(path.join(temp, 'profile', 'recent-projects.json'), 'utf8'));
  expect(index.projects).toHaveLength(2);
  const saved = index.projects.find((p: {path: string}) => p.path === target);
  expect(saved.pinned).toBe(true); expect(saved.title).toBe('Test Electron');
  expect(saved.cinematic).toBeUndefined(); expect(saved.shots).toBe(1);
  expect(JSON.stringify(index)).not.toContain('data:image');
  await page.keyboard.press('Escape');
  await page.reload(); await expect(page.getByText('V1.10', {exact:true})).toBeVisible();
  await expect.poll(() => page.getByRole('button', {name:'Projets récents',exact:true}).isEnabled()).toBe(true);
  const again = await openRecentDialog();
  await expect(again.getByRole('button', {name:'Détacher Test Electron', exact:true})).toBeVisible();
});
test('récents : retour au document courant et annulation avant de changer', async () => {
  await openFixture(); await saveCurrent();
  await page.getByLabel('Titre de la cinématique', {exact:true}).fill('Brouillon protégé');
  let popup = await openRecentDialog();
  await popup.getByRole('button', {name:'Revenir à Test Electron',exact:true}).click();
  await expect(page.getByLabel('Titre de la cinématique', {exact:true})).toHaveValue('Brouillon protégé');
  popup = await openRecentDialog();
  await app.evaluate(({dialog}) => { dialog.showMessageBox = async () => ({response:2,checkboxChecked:false}); });
  await popup.getByRole('button', {name:'Ouvrir Test Electron',exact:true}).click();
  await expect(popup.getByRole('button', {name:'Ouvrir Test Electron',exact:true})).toBeEnabled();
  await expect(page.getByLabel('Titre de la cinématique', {exact:true})).toHaveValue('Brouillon protégé');
  expect(JSON.parse(await fs.readFile(target,'utf8')).title).toBe('Test Electron');
  await app.evaluate(({dialog}) => { dialog.showMessageBox = async () => ({response:1,checkboxChecked:false}); });
});
test('récents : retrouver un fichier déplacé sans dupliquer son entrée', async () => {
  await openFixture(); await saveCurrent();
  const source = path.join(temp,'source.json'), moved = path.join(temp,'source-deplace.json');
  await fs.rename(source, moved);
  const popup = await openRecentDialog();
  await expect(popup.getByRole('button', {name:'Ouvrir Test Electron',exact:true})).toBeDisabled();
  await app.evaluate(({dialog},file) => { dialog.showOpenDialog = async () => ({canceled:false,filePaths:[file]}); }, moved);
  await popup.getByRole('button', {name:'Retrouver le fichier',exact:true}).click();
  await expect(popup).not.toBeVisible();
  const again = await openRecentDialog(); await expect(again.locator('.recent-project-card')).toHaveCount(2);
  const index = JSON.parse(await fs.readFile(path.join(temp,'profile','recent-projects.json'),'utf8'));
  expect(index.projects.some((p:{path:string}) => p.path===source)).toBe(false);
  expect(index.projects.some((p:{path:string}) => p.path===moved)).toBe(true);
});
test('récents : effacer la liste ne supprime aucun JSON', async () => {
  await openFixture(); await saveCurrent(); const popup = await openRecentDialog();
  await popup.getByRole('button', {name:'Effacer la liste non épinglée',exact:true}).click();
  await popup.getByRole('button', {name:'Effacer les non-épinglés',exact:true}).click();
  await expect(popup.locator('.recent-project-card')).toHaveCount(0);
  expect((await fs.stat(target)).isFile()).toBe(true);
  expect((await fs.stat(path.join(temp,'source.json'))).isFile()).toBe(true);
});
test('récents : recherche, raccourci et restitution du focus', async () => {
  await openFixture(); const trigger = page.getByRole('button', {name:'Projets récents',exact:true});
  await trigger.focus(); await page.keyboard.press('Control+Shift+o');
  const popup = page.getByRole('dialog', {name:'Projets récents',exact:true});
  await expect(popup.getByRole('button',{name:'Actualiser les projets récents',exact:true})).toBeEnabled();
  await expect(page.getByLabel('Rechercher un projet récent')).toBeFocused();
  await page.getByLabel('Rechercher un projet récent').fill('source');
  await expect(popup.locator('.recent-project-card')).toHaveCount(1);
  await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
});
test('récents : le preload refuse un chemin arbitraire en guise d’identifiant', async () => {
  const message = await page.evaluate(async () => {
    try { await window.lunaria!.openRecentProject('C:/Windows/system.ini'); return 'accepted'; }
    catch (error) { return String(error); }
  });
  expect(message).toContain('invalide');
});


test('texte progressif : premier clic complète, second clic avance via le vrai lecteur',async()=>{
  const d=fixture(),s=d.shots[0];s.dialogueStart=0;s.transition={type:'cut',duration:0};
  s.bubbles[0].textAnimation={...newTextAnimation(),speed:2};
  const second=newBubble(s.actors[0].id);second.text='Deuxième réplique';second.textAnimation={...newTextAnimation(),speed:2};s.bubbles.push(second);
  await openFixture(prepareCinematic(d));await page.getByRole('button',{name:'Lire depuis ce plan',exact:true}).first().click();
  await page.getByRole('button',{name:/Afficher tout le texte/}).click();
  await expect(page.getByTestId('bubble-'+s.bubbles[0].id)).toBeVisible();
  await expect(page.locator('[data-text-unit][data-visible="true"]')).not.toHaveCount(0);
  await page.getByRole('button',{name:/Cliquer pour continuer/}).click();
  await expect(page.getByTestId('bubble-'+second.id)).toBeVisible();
  await expect(page.getByRole('button',{name:/Afficher tout le texte/})).toBeVisible();
});
test('préréglage Cri et réglages texte sauvegardés sans images dupliquées',async()=>{
  await openFixture();await page.locator('.layer-row').first().click();
  await page.getByRole('button',{name:'Cri !',exact:true}).click();
  const saved=await saveCurrent();expect(saved.schemaVersion).toBe(3);
  expect(saved.shots[0].bubbles[0].textAnimation?.effect).toBe('shout');
  expect(saved.shots[0].bubbles[0].textAnimation?.reveal).toBe('instant');
  expect(JSON.stringify(saved)).not.toContain('data:image');
  await page.getByRole('button',{name:'Sans animation',exact:true}).click();
  await page.getByRole('button',{name:'Annuler',exact:true}).click();
  await expect(page.getByLabel('Effet du texte',{exact:true})).toHaveValue('shout');
});
test('sortie d’un ennemi conservée par la sauvegarde native',async()=>{
  const d=fixture();d.shots[0].actors[0].role='enemy';await openFixture(prepareCinematic(d));
  await page.getByRole('button',{name:'Sélectionner Objet A',exact:true}).click();
  await page.getByLabel('Animation de sortie',{exact:true}).selectOption('shrink');
  const result=await saveCurrent();expect(result.schemaVersion).toBe(3);expect(result.shots[0].actors[0].role).toBe('enemy');
  expect(result.shots[0].actors[0].exit?.preset).toBe('shrink');
});
