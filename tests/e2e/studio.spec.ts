import { test, expect, _electron, type ElectronApplication, type Page } from '@playwright/test';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import {bubbleTextUnits, newTextAnimation} from '../../src/shared/textAnimation.js';
import { prepareCinematic } from '../../src/shared/geometry.js';
import { newActor, newBubble, newCinematic, newShot, type Asset, type Cinematic } from '../../src/shared/model.js';
import { seedProject } from '../../src/shared/game/seed.js';
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
  await openProjectFilm(doc,path.join(temp,'source.json'));
  return doc;
}
async function saveCurrent(): Promise<Cinematic> {
  const oldStamp=await fs.stat(target,{bigint:true}).then(s=>s.mtimeNs.toString()).catch(()=>null);
  await page.keyboard.press('Control+Shift+s');
  await expect.poll(async()=>fs.stat(target,{bigint:true}).then(s=>s.mtimeNs.toString()!==oldStamp).catch(()=>false)).toBe(true);
  await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
  return JSON.parse(await fs.readFile(target,'utf8')).cinematics[0] as Cinematic;
}
async function openProjectFilm(film=fixture(),projectFile=path.join(temp,'effects.game.json')) {
  const project=seedProject();project.title=film.title;project.cinematics=[prepareCinematic(film)];
  await fs.writeFile(projectFile,JSON.stringify(project));
  await app.evaluate(({dialog},file)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]});},projectFile);
  await page.getByRole('button',{name:'Actions du fichier projet'}).click();await page.getByRole('button',{name:'Ouvrir un projet…',exact:true}).click();
  await expect(page.getByLabel('Nom du plan',{exact:true})).toHaveValue('Plan de test');
}
async function saveProjectFilm():Promise<Cinematic> {
  await page.getByRole('button',{name:'Enregistrer le projet',exact:true}).click();
  await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
  return JSON.parse(await fs.readFile(path.join(temp,'effects.game.json'),'utf8')).cinematics[0];
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
  await page.waitForURL('app://studio/index.html');await expect(page.getByRole('navigation',{name:'Navigation du Studio'})).toBeVisible();
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
test('délai d’apparition, défilement stable et champs de sortie cohérents',async({},testInfo)=>{
  const source=path.join(temp,'source-game.json'),project=seedProject();
  project.cinematics=[fixture()];
  await fs.writeFile(source,JSON.stringify(project));
  await app.evaluate(({dialog},file)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]});},source);
  await page.getByRole('button',{name:'Actions du fichier projet'}).click();await page.getByRole('button',{name:'Ouvrir un projet…',exact:true}).click();
  await expect(page.getByLabel('Nom du plan',{exact:true})).toHaveValue('Plan de test');
  await page.getByRole('button',{name:'Sélectionner Objet A',exact:true}).click();
  const entry=page.getByRole('combobox',{name:'Entrée',exact:true});
  await entry.focus();
  await entry.evaluate(element=>element.scrollIntoView({block:'end'}));
  const beforeScroll=await page.locator('.inspector-content').evaluate(element=>element.scrollTop);
  expect(beforeScroll).toBeGreaterThan(200);
  await entry.selectOption('fade');
  const afterScroll=await page.locator('.inspector-content').evaluate(element=>element.scrollTop);
  expect(Math.abs(afterScroll-beforeScroll)).toBeLessThan(2);
  const delay=page.getByRole('textbox',{name:'Délai d’apparition',exact:true});
  await delay.fill('2.3');
  await page.getByText('Le délai commence au début du plan.',{exact:false}).scrollIntoViewIfNeeded();
  await testInfo.attach('délai d’apparition dans l’inspecteur',{body:await page.screenshot(),contentType:'image/png'});
  await page.getByRole('button',{name:'Enregistrer le projet'}).click();
  await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
  const saved=JSON.parse(await fs.readFile(source,'utf8')) as {cinematics:Cinematic[]};
  expect(saved.cinematics[0].shots[0].actors[0].entry).toEqual({preset:'fade',duration:0.8,delay:2.3});
  await expect(delay).toHaveValue('2.3');
  await delay.fill('2,4');
  await page.keyboard.press('Control+s');
  await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
  const savedAgain=JSON.parse(await fs.readFile(source,'utf8')) as {cinematics:Cinematic[]};
  expect(savedAgain.cinematics[0].shots[0].actors[0].entry.delay).toBe(2.4);
  const exit=page.getByRole('region',{name:'Sortie de l’élément'});
  await exit.getByRole('combobox',{name:'Animation de sortie'}).selectOption('fade');
  expect(await exit.locator('.field-row > label > span').allTextContents()).toEqual(['Durée (s)','Délai de disparition (s)']);
  await exit.getByRole('textbox',{name:'Durée de la sortie'}).fill('0.6');
  await exit.getByRole('textbox',{name:'Délai de disparition'}).fill('3.2');
  await page.locator('.layers-panel summary').click();
  await entry.evaluate(element=>element.scrollIntoView({block:'start'}));
  await testInfo.attach('ordre des champs de sortie',{body:await page.locator('.inspector').screenshot(),contentType:'image/png'});
  await page.getByRole('button',{name:'Enregistrer le projet'}).click();
  await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
  const withExit=JSON.parse(await fs.readFile(source,'utf8')) as {cinematics:Cinematic[]};
  expect(withExit.cinematics[0].shots[0].actors[0].exit).toEqual({preset:'fade',duration:0.6,start:3.2});
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
  await page.reload();await expect(page.getByRole('navigation',{name:'Navigation du Studio'})).toBeVisible();await page.getByRole('button',{name:'Favoris',exact:true}).click();await expect(page.locator('.asset-card')).toHaveCount(1);
});
test('vignettes : les boutons favori et ajout restent séparés au survol', async () => {
  await openFixture();
  const libraryPanel = page.getByLabel('Bibliothèque de ressources');
  await libraryPanel.locator('[data-tab="enemy"]').click();
  const tile = libraryPanel.locator('.asset-tile').first();
  const favorite = tile.locator('.asset-favorite');
  const quickAdd = tile.getByRole('button', { name: /^Ajouter l’ennemi :/ });

  for (const view of ['Vue en grille', 'Vue en liste']) {
    await libraryPanel.getByRole('button', { name: view, exact: true }).click();
    await tile.locator('.asset-image').hover();
    await expect(favorite).toHaveCSS('opacity', '1');
    await expect(quickAdd).toHaveCSS('opacity', '1');
    const favoriteBox = (await favorite.boundingBox())!;
    const quickAddBox = (await quickAdd.boundingBox())!;
    expect(favoriteBox.x + favoriteBox.width).toBeLessThan(quickAddBox.x);
    await quickAdd.click({ trial: true });
  }

  await favorite.click();
  await expect(favorite).toHaveAttribute('aria-pressed', 'true');
  await quickAdd.click();
  await expect(page.getByLabel('Type d’élément')).toHaveValue('enemy');
});
test('une vignette révèle son fichier d’origine dans l’Explorateur sans modifier le plan', async () => {
  const relative = '05_characters/Épreuve avec espaces.png';
  const file = path.join(library, relative);
  await fs.copyFile(path.join(library, '05_characters/test.png'), file);
  await openFixture();
  await app.evaluate(({ shell }) => {
    const calls: string[] = [];
    Object.assign(globalThis, { revealedAssets: calls });
    shell.showItemInFolder = file => { calls.push(file); };
  });
  const revealedAssets = () => app.evaluate(() =>
    (globalThis as typeof globalThis & { revealedAssets: string[] }).revealedAssets);

  const panel = page.getByLabel('Bibliothèque de ressources');
  await panel.getByRole('button', { name: 'Actualiser la bibliothèque' }).click();
  await panel.getByRole('tab', { name: 'Personnages' }).click();
  const assetCard = `[data-asset-ref="library://${relative}"]`;
  const tile = panel.locator('.asset-tile').filter({ has: page.locator(assetCard) });
  const reveal = tile.getByRole('button', { name: /^Afficher dans l’Explorateur/ });
  const expected = await fs.realpath(file);

  for (const [index, view] of ['Vue en grille', 'Vue en liste'].entries()) {
    await panel.getByRole('button', { name: view, exact: true }).click();
    await expect(reveal).toHaveCSS('opacity', '1');
    await reveal.click();
    await expect.poll(revealedAssets).toEqual(Array(index + 1).fill(expected));
    await expect(tile.locator(assetCard)).toHaveAttribute('aria-pressed', 'false');
  }

  await panel.getByRole('button', { name: 'Agrandir la bibliothèque' }).click();
  const gallery = page.getByRole('dialog', { name: 'Bibliothèque agrandie' });
  await gallery.locator('.asset-tile').filter({ has: page.locator(assetCard) })
    .getByRole('button', { name: /^Afficher dans l’Explorateur/ }).click();
  await expect.poll(revealedAssets).toEqual([expected, expected, expected]);
  await expect(gallery).toBeVisible();
  await gallery.getByRole('button', { name: 'Retour à la scène' }).click();
  await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
});
test('continuer un plan et générer le modèle dialogue à deux',async()=>{
  const doc=await openFixture();await page.getByRole('button',{name:'Continuer ce plan',exact:true}).click();const continued=await saveCurrent();expect(continued.shots).toHaveLength(2);expect(continued.shots[1].bubbles).toHaveLength(0);expect(continued.shots[1].actors.map(a=>[a.x,a.y])).toEqual(doc.shots[0].actors.map(a=>[a.x,a.y]));
  await page.getByRole('button',{name:'Ajouter un plan',exact:true}).click();await page.getByRole('button',{name:'Dialogue à deux',exact:false}).click();await page.getByRole('button',{name:'Créer le plan',exact:true}).click();const result=await saveCurrent();expect(result.shots[2].bubbles).toHaveLength(2);
  expect(result.shots[2].bubbles[0].speakerId).not.toBe(result.shots[2].bubbles[1].speakerId);
});
test('l’historique annule une modification enregistrée sans réécrire le fichier', async () => {
  await openFixture();
  const shotName = page.getByLabel('Nom du plan', {exact:true});
  await shotName.fill('Modification sauvegardée');
  await saveCurrent();
  const diskBefore = await fs.readFile(target, 'utf8');

  const historyButton = page.getByRole('button', {name:'Historique', exact:true});
  const history = page.getByRole('dialog', {name:'Historique du projet'});
  await historyButton.click();
  await expect(history.getByText('Dernière action', {exact:true})).toBeVisible();
  await history.getByRole('button', {name:'Annuler la dernière action'}).click();
  await expect(shotName).toHaveValue('Plan de test');
  expect(await fs.readFile(target, 'utf8')).toBe(diskBefore);

  await historyButton.click();
  await history.getByRole('button', {name:'Rétablir l’action suivante'}).click();
  await expect(shotName).toHaveValue('Modification sauvegardée');
});
test('diagnostic d’asset absent et correction ciblée hors écran',async()=>{
  const doc=fixture();doc.shots[0].actors[0].asset='library://missing.png';doc.shots[0].actors[1].x=1.5;await openFixture(doc);
  await page.getByRole('button',{name:'Tout lire',exact:true}).click();await expect(page.getByRole('heading',{name:'Diagnostics de la cinématique'})).toBeVisible();await expect(page.getByText('1 erreur(s)',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Recentrer',exact:true}).click();await page.getByRole('button',{name:'Retour à la scène',exact:true}).click();expect((await saveCurrent()).shots[0].actors[1].x).toBeLessThan(1);
});

test('objet animé : catégorie dédiée, poignée B, aperçu sans mutation et JSON v2',async()=>{
  await openProjectFilm();
  await page.getByRole('tab',{name:'Objets',exact:false}).click();
  await page.locator('.asset-card').first().dblclick();
  await expect(page.getByLabel('Type d’élément',{exact:true})).toHaveValue('prop');
  await page.getByLabel('Activer le déplacement A vers B',{exact:true}).check();
  const before=await saveProjectFilm(), actor=before.shots[0].actors.at(-1)!;
  const destination=await page.getByTestId('movement-destination').boundingBox();
  if(!destination)throw new Error('Poignée B absente');
  await page.mouse.move(destination.x+destination.width/2,destination.y+destination.height/2);
  await page.mouse.down();await page.mouse.move(destination.x+destination.width/2-35,destination.y+destination.height/2-20,{steps:6});await page.mouse.up();
  const moved=await saveProjectFilm();expect(moved.shots[0].actors.at(-1)!.movement!.dx).not.toEqual(actor.movement!.dx);
  await page.getByLabel('Effet de mouvement',{exact:true}).selectOption('sway');
  const configured=await saveProjectFilm();expect(configured.schemaVersion).toBe(2);expect(configured.shots[0].actors.at(-1)!.pivot).toBe('top');
  const object=page.getByTestId(`actor-${actor.id}`),rest=await object.getAttribute('transform');
  await page.getByRole('button',{name:'Tester les mouvements',exact:true}).click();
  await expect.poll(()=>object.getAttribute('transform')).not.toBe(rest);
  await page.getByRole('button',{name:'Pause des mouvements',exact:true}).click();
  const paused=await object.getAttribute('transform');await page.waitForTimeout(120);expect(await object.getAttribute('transform')).toBe(paused);
  expect(await saveProjectFilm()).toEqual(configured);
  await page.getByRole('button',{name:'Retour au placement',exact:true}).click();expect(await object.getAttribute('transform')).toBe(rest);
});

test('Reopening V2 preserves the movement destination',async()=>{
  const doc=fixture();doc.schemaVersion=2;
  const actor=doc.shots[0].actors[0];actor.role='prop';actor.motion={preset:'float',intensity:.4,period:3,delay:0,loop:true,reverse:false};
  actor.movement={enabled:true,dx:.2,dy:-.05,duration:2,delay:0,easing:'smooth',repeat:'once'};
  await openFixture(doc);await page.getByRole('button',{name:'Continuer ce plan',exact:true}).click();
  const result=await saveCurrent();expect(result.shots[1].actors[0].movement!.enabled).toBe(false);
  expect(result.shots[1].actors[0].x).toBeCloseTo(actor.x+.2);expect(result.shots[1].actors[0].motion).toEqual(actor.motion);
  await openFixture(result);expect(await saveCurrent()).toEqual(result);
});

test('nouveaux effets : choix, aperçu temporel, sauvegarde et réouverture pour les trois rôles',async({},info)=>{
  test.setTimeout(90000);
  const doc=fixture(),shot=doc.shots[0];shot.duration=12;shot.bubbles=[];
  shot.actors.push(newActor({...asset,name:'Objet C'},1.5,.45,.48,'prop'));
  shot.actors[1].role='enemy';
  await openProjectFilm(prepareCinematic(doc));
  const motions=['orbit','figure8','zigzag','tumble','surprise','jelly'];
  const entries=['drop','spiral','rise'],exits=['spiral','rise','fall'];
  for(let index=0;index<shot.actors.length;index++) {
    const actor=shot.actors[index];
    await page.getByRole('button',{name:`Sélectionner ${actor.name}`,exact:true}).click();
    for(const preset of motions) {
      await page.getByLabel('Effet de mouvement',{exact:true}).selectOption(preset);
      await expect(page.getByLabel('Effet de mouvement',{exact:true})).toHaveValue(preset);
    }
    for(const preset of entries) await page.getByRole('combobox',{name:'Entrée',exact:true}).selectOption(preset);
    for(const preset of exits) await page.getByLabel('Animation de sortie',{exact:true}).selectOption(preset);
    await page.getByLabel('Effet de mouvement',{exact:true}).selectOption(motions[index]);
    await page.getByRole('combobox',{name:'Entrée',exact:true}).selectOption(entries[index]);
    await page.getByLabel('Animation de sortie',{exact:true}).selectOption(exits[index]);
    await page.getByRole('textbox',{name:'Délai d’apparition',exact:true}).fill('0.5');
    await page.getByRole('textbox',{name:'Délai de disparition',exact:true}).fill('7');
    await page.getByRole('textbox',{name:'Durée de la sortie',exact:true}).fill('1');
    await page.getByRole('textbox',{name:'Durée de la sortie',exact:true}).blur();
  }
  const configured=await saveProjectFilm();
  for(let index=0;index<shot.actors.length;index++) {
    const saved=configured.shots[0].actors[index];
    expect(saved.motion?.preset).toBe(motions[index]);
    expect(saved.entry).toMatchObject({preset:entries[index],delay:.5});
    expect(saved.exit).toEqual({preset:exits[index],start:7,duration:1});
  }
  const objects=shot.actors.map(actor=>page.getByTestId(`actor-${actor.id}`));
  const rest=await Promise.all(objects.map(object=>object.getAttribute('transform')));
  await page.getByRole('button',{name:'Tester les animations de l’élément',exact:true}).click();
  const clock=page.getByRole('slider',{name:'Temps de l’aperçu des mouvements',exact:true});
  await clock.fill('0.25');
  for(const object of objects)await expect(object).toHaveAttribute('opacity','0');
  await clock.fill('2.1');
  const moving=await Promise.all(objects.map(object=>object.getAttribute('transform')));
  moving.forEach((transform,index)=>expect(transform).not.toBe(rest[index]));
  await clock.fill('8.5');
  for(const object of objects)await expect(object).toHaveAttribute('opacity','0');
  await clock.fill('2.1');
  expect(await Promise.all(objects.map(object=>object.getAttribute('transform')))).toEqual(moving);
  await info.attach('nouveaux-effets-apercu',{body:await page.screenshot(),contentType:'image/png'});
  expect(await saveProjectFilm()).toEqual(configured);
  await page.getByRole('button',{name:'Retour au placement',exact:true}).click();
  expect(await Promise.all(objects.map(object=>object.getAttribute('transform')))).toEqual(rest);
  await openProjectFilm(configured);
  expect(await saveProjectFilm()).toEqual(configured);
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

const fileActions = () => page.getByRole('button', {name:'Actions du fichier projet'});
async function openRecentDialog() {
  await fileActions().click();
  await page.getByRole('button', { name: 'Projets récents…', exact: true }).click();
  const popup = page.getByRole('dialog', { name: 'Projets récents', exact: true });
  await expect(popup).toBeVisible();
  return popup;
}
test('récents : les deux fichiers et leurs métadonnées survivent au rechargement', async () => {
  await openFixture(); await saveCurrent();
  await page.reload();
  await expect(page.locator('.studio-project-state')).toContainText('saved.json');
  const popup = await openRecentDialog();
  await expect(popup.getByRole('button', {name:/Test Electron/})).toHaveCount(2);
  await expect(popup.getByRole('button', {name:/Projet ouvert.*saved\.json/})).toBeVisible();
  const index = JSON.parse(await fs.readFile(path.join(temp, 'profile', 'game-recents.json'), 'utf8'));
  const files = await Promise.all([target, path.join(temp,'source.json')].map(file => fs.realpath(file)));
  expect(index).toEqual(files.map(file => ({
    path:file, title:'Test Electron', updatedAt:expect.any(String),
  })));
});
test('récents : retour au document courant et annulation avant de changer', async () => {
  await openFixture(); await saveCurrent();
  await page.getByLabel('Titre de la cinématique', {exact:true}).fill('Brouillon protégé');
  let popup = await openRecentDialog();
  await popup.getByRole('button', {name:/Projet ouvert.*saved\.json/}).click();
  await expect(popup).not.toBeVisible();
  await expect(page.getByLabel('Titre de la cinématique', {exact:true})).toHaveValue('Brouillon protégé');
  popup = await openRecentDialog();
  await app.evaluate(({dialog}) => { dialog.showMessageBox = async () => ({response:2,checkboxChecked:false}); });
  const source = popup.getByRole('button', {name:/Test Electron.*source\.json/});
  await source.click();
  await expect(source).toBeEnabled();
  await expect(page.getByLabel('Titre de la cinématique', {exact:true})).toHaveValue('Brouillon protégé');
  expect(JSON.parse(await fs.readFile(target,'utf8')).title).toBe('Test Electron');
  await app.evaluate(({dialog}) => { dialog.showMessageBox = async () => ({response:1,checkboxChecked:false}); });
  await source.click();
  await expect(popup).not.toBeVisible();
  await expect(page.getByLabel('Titre de la cinématique', {exact:true})).toHaveValue('Test Electron');
});
test('récents : un fichier déplacé peut être rouvert par son nouvel emplacement', async () => {
  await openFixture(); await saveCurrent();
  const source = path.join(temp,'source.json'), moved = path.join(temp,'source-deplace.json');
  await fs.rename(source, moved);
  const popup = await openRecentDialog();
  await popup.getByRole('button', {name:/Test Electron.*source\.json/}).click();
  await expect(popup.getByRole('alert')).toBeVisible();
  await app.evaluate(({dialog},file) => { dialog.showOpenDialog = async () => ({canceled:false,filePaths:[file]}); }, moved);
  await popup.getByRole('button', {name:'Ouvrir un autre fichier',exact:true}).click();
  await expect(popup).not.toBeVisible();
  await expect(page.locator('.studio-project-state')).toHaveAttribute('title', await fs.realpath(moved));
  const again = await openRecentDialog();
  await expect(again.getByRole('button', {name:/Projet ouvert.*source-deplace\.json/})).toHaveCount(1);
});
test('récents : recherche, raccourci et restitution du focus', async () => {
  await openFixture(); await saveCurrent(); const trigger = fileActions();
  await trigger.focus(); await page.keyboard.press('Control+Shift+o');
  const popup = page.getByRole('dialog', {name:'Projets récents',exact:true});
  const search = popup.getByRole('searchbox', {name:'Rechercher un projet récent'});
  await expect(search).toBeFocused();
  await search.fill('source.json');
  await expect(popup.getByRole('button', {name:/Test Electron/})).toHaveCount(1);
  await expect(popup.getByRole('button', {name:/Test Electron.*source\.json/})).toBeVisible();
  await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
});
test('récents : le pont natif refuse un projet absent de la liste', async () => {
  const unlisted = path.join(temp, 'unlisted.game.json');
  await fs.writeFile(unlisted, JSON.stringify(seedProject()));
  await expect(page.evaluate(file => window.lunariaGame!.openRecent(file), unlisted))
    .rejects.toThrow('Projet récent inconnu');
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
test('retours vides périphériques : taille et centrage identiques au dialogue visible',async({},testInfo)=>{
  const document=fixture(),shot=document.shots[0];
  const text='Malheureusement mes racines ont étaient contaminées, \nJe crains que mes minutes ne soient comptées,';
  shot.dialogueStart=0;shot.transition={type:'cut',duration:0};
  shot.bubbles=[28,48].flatMap((fontSize,row)=>[false,true].map((padded,column)=>{
    const b=newBubble();
    Object.assign(b,{text:padded?'\n \t\n'+text+' \r\n\n':text,fontSize,style:'simple',
      frameAsset:'library://06_ui/dialogues/dialogue_panel_simple_v01.png',autoHeight:false,
      x:.02+column*.5,y:.08+row*.3,width:.46015670112984397,height:.20132755012325945,
      textAnimation:newTextAnimation('typewriter')});
    return b;
  }));
  await openProjectFilm(prepareCinematic(document));
  const rendered=await Promise.all(shot.bubbles.map(b=>page.getByTestId('bubble-'+b.id).getByTestId('bubble-text').evaluate(element=>({
    size:Number(element.getAttribute('font-size')),rows:Array.from(element.children).map(row=>({text:row.textContent,x:row.getAttribute('x'),y:row.getAttribute('y')}))
  }))));
  expect(rendered[1]).toEqual(rendered[0]);expect(rendered[3]).toEqual(rendered[2]);
  expect(rendered[0].size).toBeGreaterThan(0);expect(rendered[0].size).toBeLessThanOrEqual(28);
  expect(rendered[2].size).toBeGreaterThanOrEqual(rendered[0].size);expect(rendered[2].size).toBeLessThan(48);
  expect(rendered[0].rows).toHaveLength(2);
  await testInfo.attach('dialogues avec et sans retours périphériques',{body:await page.getByTestId('scene').screenshot(),contentType:'image/png'});
  const saved=await saveProjectFilm();
  expect(saved.shots[0].bubbles.map(b=>b.text)).toEqual(shot.bubbles.map(b=>b.text));
  expect(saved.shots[0].bubbles.map(b=>b.fontSize)).toEqual([28,28,48,48]);
  await page.getByRole('button',{name:'Lire depuis ce plan',exact:true}).first().click();
  const first=page.getByTestId('bubble-'+shot.bubbles[0].id).getByTestId('animated-text');
  await expect(first.locator('text').first()).toHaveAttribute('font-size',String(rendered[0].size));
  await page.getByRole('button',{name:/Afficher tout le texte/}).click();
  const coordinates=await first.locator('text').evaluateAll(elements=>elements.map(el=>({text:el.textContent,x:el.getAttribute('x'),y:el.getAttribute('y')})));
  await page.getByRole('button',{name:/Cliquer pour continuer/}).click();
  const second=page.getByTestId('bubble-'+shot.bubbles[1].id).getByTestId('animated-text');
  await expect(second.locator('text').first()).toHaveAttribute('font-size',String(rendered[1].size));
  await page.getByRole('button',{name:/Afficher tout le texte/}).click();
  expect(await second.locator('text').evaluateAll(elements=>elements.map(el=>({text:el.textContent,x:el.getAttribute('x'),y:el.getAttribute('y')})))).toEqual(coordinates);
});

test('texte des bulles : taille maximale, marges verticales équilibrées et apparition stable',async({},testInfo)=>{
  const document=fixture(),shot=document.shots[0],normal=newBubble(),long=newBubble(),wide=newBubble();
  shot.dialogueStart=0;shot.transition={type:'cut',duration:0};
  Object.assign(normal,{text:'La serre s’éveille.',fontSize:32,autoHeight:false,x:.04,y:.08,width:.43,height:.16});
  Object.assign(long,{text:'Chaque plante retrouve sa place dans le jardin de Lunaria. '.repeat(8),
    fontSize:48,autoHeight:false,x:.52,y:.08,width:.43,height:.2,textAnimation:{...newTextAnimation(),speed:2}});
  // Georgia's real Q is wider than the deterministic fallback: exercise font measurement.
  Object.assign(wide,{text:'QQQQQQQQQQQQ',fontSize:48,autoHeight:false,x:.04,y:.33,width:447.68/1600,height:.13});
  shot.bubbles=[normal,long,wide];
  await openProjectFilm(prepareCinematic(document));
  const normalText=page.getByTestId('bubble-'+normal.id).getByTestId('bubble-text');
  const longText=page.getByTestId('bubble-'+long.id).getByTestId('bubble-text');
  const wideText=page.getByTestId('bubble-'+wide.id).getByTestId('bubble-text');
  await expect(normalText).toHaveAttribute('font-size','32');
  const reducedSize=Number(await longText.getAttribute('font-size'));
  expect(reducedSize).toBeGreaterThan(0);expect(reducedSize).toBeLessThan(48);
  expect(Number(await wideText.getAttribute('font-size'))).toBeLessThan(48);
  for(const text of [normalText,longText,wideText]) {
    const bounds=await text.evaluate(element=>{
      const box=(element as unknown as SVGGraphicsElement).getBBox(),area=element.parentElement!;
      return {x:box.x,y:box.y,right:box.x+box.width,bottom:box.y+box.height,
        width:Number(area.getAttribute('width')),height:Number(area.getAttribute('height'))};
    });
    expect(bounds.x,JSON.stringify(bounds)).toBeGreaterThanOrEqual(-.1);expect(bounds.y,JSON.stringify(bounds)).toBeGreaterThanOrEqual(-.1);
    expect(bounds.right).toBeLessThanOrEqual(bounds.width+.1);expect(bounds.bottom).toBeLessThanOrEqual(bounds.height+.1);
    const ink=await text.evaluate(element=>{
      const canvas=document.createElement('canvas').getContext('2d')!,size=Number(element.getAttribute('font-size'));
      canvas.font=`${size}px Georgia, serif`;
      const rows=Array.from(element.children).map(row=>{const metrics=canvas.measureText(row.textContent||'Hg'),baseline=Number(row.getAttribute('y'));
        return {top:baseline-metrics.actualBoundingBoxAscent,bottom:baseline+metrics.actualBoundingBoxDescent};});
      return {top:Math.min(...rows.map(row=>row.top)),bottom:Math.max(...rows.map(row=>row.bottom)),height:Number(element.parentElement!.getAttribute('height'))};
    });
    expect(Math.abs(ink.top-(ink.height-ink.bottom)),JSON.stringify(ink)).toBeLessThan(.1);
  }
  // The next integer size must overflow after rewrapping with the actual font.
  const larger=await longText.evaluate((element,text)=>{
    const size=Number(element.getAttribute('font-size'))+1,area=element.parentElement!,width=Number(area.getAttribute('width')),height=Number(area.getAttribute('height'));
    const canvas=document.createElement('canvas').getContext('2d')!;canvas.font=`${size}px Georgia, serif`;
    const lines:string[]=[];let line='';
    for(const word of text.trim().split(/\s+/)) {
      if(line&&canvas.measureText(line+' '+word).width<=width){line+=' '+word;continue;}
      if(line)lines.push(line);line=word;
    }
    lines.push(line);
    const boxes=lines.map((row,index)=>{const m=canvas.measureText(row);return {top:index*size*1.32-m.actualBoundingBoxAscent,bottom:index*size*1.32+m.actualBoundingBoxDescent,width:Math.max(m.width,m.actualBoundingBoxLeft+m.actualBoundingBoxRight)};});
    return Math.max(...boxes.map(box=>box.width))>width+1e-7||Math.max(...boxes.map(box=>box.bottom))-Math.min(...boxes.map(box=>box.top))>height+1e-7;
  },long.text);
  expect(larger).toBe(true);
  const screenshot=testInfo.outputPath('bubble-text-fit.png');
  await page.getByTestId('scene').screenshot({path:screenshot});
  await testInfo.attach('texte complet ajusté et texte court à sa taille',{path:screenshot,contentType:'image/png'});
  if(process.env.LUNARIA_TEXT_FIT_CAPTURE) {
    await fs.mkdir(path.dirname(process.env.LUNARIA_TEXT_FIT_CAPTURE),{recursive:true});
    await fs.copyFile(screenshot,process.env.LUNARIA_TEXT_FIT_CAPTURE);
  }
  const saved=await saveProjectFilm();
  expect(saved.shots[0].bubbles.map(b=>b.fontSize)).toEqual([32,48,48]);
  expect(saved.shots[0].bubbles.map(b=>b.text)).toEqual(shot.bubbles.map(b=>b.text));
  await page.getByRole('button',{name:'Lire depuis ce plan',exact:true}).first().click();
  await page.getByRole('button',{name:/Cliquer pour continuer/}).click();
  const letters=page.getByTestId('bubble-'+long.id).getByTestId('animated-text').locator('text');
  await expect(letters.first()).toHaveAttribute('font-size',String(reducedSize));
  await page.getByRole('button',{name:/Afficher tout le texte/}).click();
  expect(await letters.evaluateAll(elements=>Array.from(new Set(elements.map(element=>element.getAttribute('font-size')))))).toEqual([String(reducedSize)]);
  expect(await letters.evaluateAll(elements=>elements.map(element=>Number(element.parentElement!.getAttribute('data-text-unit')))))
    .toEqual(bubbleTextUnits(long).filter(unit=>/\S/u.test(unit.text)).map(unit=>unit.index));
  expect((await letters.allTextContents()).join('')).toBe(long.text.replace(/\s/gu,''));
  await expect(page.getByTestId('bubble-'+long.id)).toBeVisible();
  const animatedBounds=await page.getByTestId('animated-text').evaluate(element=>{
    const box=(element as unknown as SVGGraphicsElement).getBBox(),area=element.parentElement!;
    return {x:box.x,y:box.y,right:box.x+box.width,bottom:box.y+box.height,
      width:Number(area.getAttribute('width')),height:Number(area.getAttribute('height'))};
  });
  expect(animatedBounds.x).toBeGreaterThanOrEqual(-.1);expect(animatedBounds.y).toBeGreaterThanOrEqual(-.1);
  expect(animatedBounds.right).toBeLessThanOrEqual(animatedBounds.width+.1);
  expect(animatedBounds.bottom).toBeLessThanOrEqual(animatedBounds.height+.1);
  const animatedInk=await letters.evaluateAll(elements=>{
    const canvas=document.createElement('canvas').getContext('2d')!,size=Number(elements[0].getAttribute('font-size'));canvas.font=`${size}px Georgia, serif`;
    const rows=elements.map(element=>{const metrics=canvas.measureText(element.textContent||''),baseline=Number(element.getAttribute('y'));
      return {top:baseline-metrics.actualBoundingBoxAscent,bottom:baseline+metrics.actualBoundingBoxDescent};});
    return {top:Math.min(...rows.map(row=>row.top)),bottom:Math.max(...rows.map(row=>row.bottom)),height:Number(elements[0].parentElement!.parentElement!.parentElement!.getAttribute('height'))};
  });
  expect(Math.abs(animatedInk.top-(animatedInk.height-animatedInk.bottom)),JSON.stringify(animatedInk)).toBeLessThan(.1);
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
test('The preview animates the whole bubble and saves its setting',async()=>{
  const doc=fixture(),source=path.join(temp,'bubble-source.json');
  await openProjectFilm(doc,source);
  await page.locator('.layer-row').first().click();
  await expect(page.getByLabel('Apparition de la bulle')).toHaveValue('pop');
  await page.getByLabel('Apparition de la bulle').selectOption('left');
  await page.getByLabel('Durée de l’animation de la bulle').fill('3');
  await page.getByLabel('Durée de l’animation de la bulle').press('Enter');
  await page.getByRole('button',{name:'Enregistrer le projet',exact:true}).click();
  await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
  const project=JSON.parse(await fs.readFile(source,'utf8'));
  const saved=project.cinematics.find((film:Cinematic)=>film.id===doc.id) as Cinematic;
  expect(saved.schemaVersion).toBe(3);
  expect(saved.shots[0].bubbles[0].bubbleEntry).toEqual({preset:'left',duration:3});
  await page.getByRole('button',{name:'Tester la réplique',exact:true}).click();
  const bubble=page.getByTestId(`bubble-${doc.shots[0].bubbles[0].id}`);
  await expect(bubble).toBeVisible();
  await expect.poll(async()=>{
    const transform=await bubble.getAttribute('transform');
    return Number(transform?.match(/^translate\(([^,]+),/)?.[1] ?? 999);
  }).toBeLessThan(784);
  await page.screenshot({path:path.join(ROOT,'test-results','bubble-entry-preview.png')});
});
test('Shouting triggers and saves a visible burst around the bubble',async()=>{
  const doc=fixture(),source=path.join(temp,'shout-source.json');
  await openProjectFilm(doc,source);
  await page.locator('.layer-row').first().click();
  await page.getByRole('button',{name:'Cri !',exact:true}).click();
  await expect(page.getByLabel('Apparition de la bulle')).toHaveValue('burst');
  await expect(page.getByLabel('Effet du texte',{exact:true})).toHaveValue('shout');
  await page.getByLabel('Durée de l’animation de la bulle').fill('3');
  await page.getByLabel('Durée de l’animation de la bulle').press('Enter');
  await page.getByRole('button',{name:'Enregistrer le projet',exact:true}).click();
  await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
  const project=JSON.parse(await fs.readFile(source,'utf8'));
  const saved=project.cinematics.find((film:Cinematic)=>film.id===doc.id) as Cinematic;
  expect(saved.shots[0].bubbles[0].bubbleEntry).toEqual({preset:'burst',duration:3});
  await page.getByRole('button',{name:'Tester la réplique',exact:true}).click();
  await page.getByRole('button',{name:'Pause des mouvements'}).click();
  const timeline=page.getByLabel('Temps de l’aperçu des mouvements');
  await timeline.evaluate((input:HTMLInputElement)=>{
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,'0.75');
    input.dispatchEvent(new Event('input',{bubbles:true}));
    input.dispatchEvent(new Event('change',{bubbles:true}));
  });
  await expect(page.locator('.motion-preview-bar output')).toContainText('0.8 /');
  await expect(page.getByTestId(`bubble-burst-${doc.shots[0].bubbles[0].id}`).locator('[data-burst-ray]')).toHaveCount(8);
  await page.getByLabel('Apparition de la bulle').scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(ROOT,'test-results','bubble-explosion-preview.png')});
});
test('sortie d’un ennemi conservée par la sauvegarde native',async()=>{
  const d=fixture();d.shots[0].actors[0].role='enemy';await openFixture(prepareCinematic(d));
  await page.getByRole('button',{name:'Sélectionner Objet A',exact:true}).click();
  await page.getByLabel('Animation de sortie',{exact:true}).selectOption('shrink');
  const result=await saveCurrent();expect(result.schemaVersion).toBe(3);expect(result.shots[0].actors[0].role).toBe('enemy');
  expect(result.shots[0].actors[0].exit?.preset).toBe('shrink');
});
