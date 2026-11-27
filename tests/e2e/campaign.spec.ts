/** Native Electron campaign scenarios: run with the declared dependencies via npm run test:e2e.
 * Dialog choices are stubbed, but the packaged renderer, preload, IPC and Node filesystem are real.
 */
import {test,expect,_electron,type ElectronApplication,type Page} from '@playwright/test';
import {promises as fs} from 'node:fs';import path from 'node:path';import os from 'node:os';import {fileURLToPath} from 'node:url';
import {seedProject} from '../fixtures/seed40.js';import {ensureCampaign} from '../../src/shared/game/campaign.js';import {newCinematic,newShot} from '../../src/shared/model.js';
import {fixturePresentation,PIXEL_PNG} from '../presentation-fixture.js';
import {cloneLevel} from '../../src/shared/game/types.js';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');let app:ElectronApplication,page:Page,dir:string,movies:string,file:string,game:string,library:string,profile:string;
test.beforeEach(async()=>{
 dir=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-campaign-e2e-'));movies=path.join(dir,'movies');file=path.join(dir,'campaign.game.json');game=path.join(dir,'game');library=path.join(dir,'library');profile=path.join(dir,'profile');
 await fs.mkdir(movies,{recursive:true});await fs.mkdir(library);await fs.mkdir(profile);await fs.mkdir(path.join(game,'app/controllers'),{recursive:true});await fs.mkdir(path.join(game,'content/design'),{recursive:true});
 await fs.mkdir(path.join(game,'domain/logic'),{recursive:true});await fs.mkdir(path.join(game,'domain/presentation'),{recursive:true});await fs.writeFile(path.join(game,'domain/logic/event_runtime.gd'),'extends RefCounted');
 await fs.writeFile(path.join(game,'domain/presentation/animation_registry.gd'),'extends RefCounted');await fs.writeFile(path.join(game,'project.godot'),'[application]');await fs.writeFile(path.join(game,'app/controllers/campaign_flow.gd'),'extends RefCounted');
 const movie=newCinematic();movie.id='CIN_TEST_CAMPAIGN';movie.title='Introduction de test';await fs.writeFile(path.join(movies,'intro.json'),JSON.stringify(movie));
 const p=fixturePresentation(seedProject(),'library://pixel.png');p.cinematics=[movie];p.levels=p.levels.slice(0,2);const c=ensureCampaign(p);c.cinematics=[{id:'film_test',title:movie.title,file:'intro.json',documentId:movie.id}];c.steps.unshift({id:'step_intro',kind:'cinematic',cinematicId:'film_test',skippable:false});
 await fs.writeFile(file,JSON.stringify(p));await fs.writeFile(path.join(game,'content/design/game_content.json'),JSON.stringify(p));
 await fs.writeFile(path.join(library,'pixel.png'),PIXEL_PNG);await fs.writeFile(path.join(profile,'settings.json'),JSON.stringify({libraryRoot:library}));
 const env:NodeJS.ProcessEnv={...process.env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:profile};delete env.LUNARIA_DEV_URL;
 app=await _electron.launch({args:[ROOT],env:env as Record<string,string>});page=await app.firstWindow();await page.waitForURL('app://studio/index.html');
 await app.evaluate(({dialog},{file,game,movies,movieFile})=>{
  dialog.showMessageBox=async()=>({response:1,checkboxChecked:false});
  dialog.showSaveDialog=async()=>({canceled:false,filePath:file});
  dialog.showOpenDialog=async(...args:any[])=>{const options=args.at(-1);return{canceled:false,filePaths:[options.properties?.includes('openDirectory')?(options.title?.includes('project.godot')?game:movies):options.title?.includes('Importer une cinématique')?movieFile:file]};};
 },{file,game,movies,movieFile:path.join(movies,'intro.json')});
 await page.locator('.studio-sections').getByRole('button',{name:'Campagne',exact:true}).click();
 await page.getByRole('button',{name:'Actions du fichier projet'}).click();await page.getByRole('button',{name:'Ouvrir un projet…',exact:true}).click();await expect(page.locator('.gd-step-card')).toHaveCount(3);
 await page.locator('.gd-step-card').filter({hasText:'Introduction de test'}).click();
 if(await page.getByRole('button',{name:'Fermer le message des niveaux'}).isVisible())await page.getByRole('button',{name:'Fermer le message des niveaux'}).click();
});
test.afterEach(async()=>{await app?.evaluate(({BrowserWindow})=>{for(const w of BrowserWindow.getAllWindows())w.destroy();}).catch(()=>{});await app?.close();await fs.rm(dir,{recursive:true,force:true});});
test('sequence reordering and undo are persisted through real IPC',async()=>{
 await page.locator('.gd-step-card').first().press('Alt+ArrowDown');await expect(page.locator('.gd-step-card').nth(1)).toContainText('Introduction de test');
 await page.keyboard.press('Control+z');await expect(page.locator('.gd-step-card').first()).toContainText('Introduction de test');
 await page.getByRole('button',{name:'Insérer entre les étapes 1 et 2',exact:true}).click();
 await page.getByRole('button',{name:'Placer ce film',exact:true}).click();await expect(page.locator('.gd-step-card')).toHaveCount(4);
 await page.locator('.studio-modebar').getByRole('button',{name:'Enregistrer le projet'}).click();await expect(page.locator('.gd-message')).toContainText('enregistrés');
 const saved=JSON.parse(await fs.readFile(file,'utf8'));expect(saved.campaign.steps).toHaveLength(4);expect(saved.campaign.cinematics).toHaveLength(1);
});
test('explicit insertion rail places a cinematic between two levels',async()=>{
 await expect(page.getByText('Le jeu lit cette liste de haut en bas.')).toBeVisible();
 await page.getByRole('button',{name:'Insérer entre les étapes 2 et 3',exact:true}).click();
 await expect(page.getByRole('combobox', { name: 'Cinématique à placer' })).toBeVisible();
 await page.getByRole('button',{name:'Placer ce film',exact:true}).click();
 await expect(page.locator('.gd-step-card')).toHaveCount(4);await expect(page.locator('.gd-step-card').nth(2)).toContainText('Introduction de test');
});
test('project film opens in cinematic mode without replacing the level document',async()=>{
 await expect(page.getByRole('complementary', {name:'Détails de l’étape'})).toHaveCount(0);
 await page.getByRole('button',{name:'Modifier « Introduction de test »',exact:true}).click();
 await expect(page.getByLabel('Titre de la cinématique')).toHaveValue('Introduction de test');
 const continuity=page.getByLabel('Continuité dans la campagne');
 await expect(continuity).toContainText('Étape 1 du parcours');
 await continuity.getByRole('button',{name:/^Niveau :/}).click();
 const placement=page.getByRole('region',{name:'Place du niveau dans la campagne'});
 await expect(placement).toContainText('Niveau 1 · étape 2');
 await placement.getByRole('button',{name:'← Cinématique « Introduction de test »'}).click();
 await expect(page.getByLabel('Titre de la cinématique')).toHaveValue('Introduction de test');
 await continuity.getByRole('button',{name:'Étape 1 du parcours'}).click();
 await expect(page.locator('.gd-step-card')).toHaveCount(3);
 const levelRow = page.locator('.gd-step-item.level').first();
 await levelRow.getByRole('button', {name:/^Modifier «/}).click();
 await expect(page.getByRole('region',{name:'Place du niveau dans la campagne'})).toContainText('Niveau 1 · étape 2');
});
test('native grouped publisher installs film before committing the sequence',async()=>{
 await page.locator('.gd-delivery > summary').click();await page.getByRole('button',{name:'Publier la campagne',exact:true}).click();await expect(page.locator('.gd-message')).toContainText('Publié');
 const published=JSON.parse(await fs.readFile(path.join(game,'content/design/game_content.json'),'utf8'));expect(published.campaign.steps).toHaveLength(3);
 expect(published.campaign.cinematics[0].file).toMatch(/^content\/cinematics\/studio\//);const d=JSON.parse(await fs.readFile(path.join(game,published.campaign.cinematics[0].file),'utf8'));expect(d.id).toBe('CIN_TEST_CAMPAIGN');
});

test('publication rejects an incompatible target schema before opening confirmation',async()=>{
 const design=path.join(game,'content/design');
 const content=path.join(design,'game_content.json');
 const before=await fs.readFile(content,'utf8');
 const oldSchema={type:'object',properties:{schemaVersion:{type:'number',maximum:3}}};
 await fs.writeFile(path.join(design,'game-project.schema.json'),JSON.stringify(oldSchema));
 await app.evaluate(({dialog})=>{
  dialog.showMessageBox=async()=>{throw Error('Unexpected publication confirmation');};
 });

 await page.locator('.gd-delivery > summary').click();
 await page.getByRole('button',{name:'Publier la campagne',exact:true}).click();
 await expect(page.locator('.gd-message')).toContainText('Le jeu cible utilise un contrat obsolète');
 expect(await fs.readFile(content,'utf8')).toBe(before);
 await expect(fs.stat(path.join(game,'LunariaArtLibrary'))).rejects.toMatchObject({code:'ENOENT'});
});

test('The campaign endpoint can be moved, undone and saved, and it limits publication',async()=>{
 test.setTimeout(60000);
 await page.getByRole('button',{name:'Insérer entre les étapes 2 et 3',exact:true}).click();
 await page.getByRole('button',{name:'Insérer la fin actuelle ici',exact:true}).click();
 const end=page.locator('.gd-step-item.end');
 await expect(end).toHaveCount(1);await expect(page.locator('.gd-step-card')).toHaveCount(4);
 await expect(page.locator('.gd-step-item.preparing')).toHaveCount(1);
 await expect(page.getByText('Suite en préparation', { exact: true })).toBeVisible();
 await page.keyboard.press('Control+z');await expect(end).toHaveCount(0);
 await page.keyboard.press('Control+y');await expect(end).toHaveCount(1);
 await end.locator('.gd-step-card').press('Alt+ArrowDown');
 await expect(page.locator('.gd-step-item.preparing')).toHaveCount(0);
 await end.locator('.gd-step-card').press('Alt+ArrowUp');
 await expect(page.locator('.gd-step-item.preparing')).toHaveCount(1);
 // The insertion action relocates the same boundary instead of creating another one.
 await page.getByRole('button',{name:'Insérer après la dernière étape',exact:true}).click();
 await page.getByRole('button',{name:'Déplacer la fin actuelle ici',exact:true}).click();
 await expect(end).toHaveCount(1);await expect(page.locator('.gd-step-item.preparing')).toHaveCount(0);
 await page.keyboard.press('Control+z');await expect(page.locator('.gd-step-item.preparing')).toHaveCount(1);
 await page.locator('.studio-modebar').getByRole('button',{name:'Enregistrer le projet'}).click();
 await expect(page.locator('.gd-message')).toContainText('enregistrés');
 const saved=JSON.parse(await fs.readFile(file,'utf8'));
 expect(saved.levels).toHaveLength(2);expect(saved.campaign.steps.map((s:any)=>s.kind)).toEqual(['cinematic','level','end','level']);
 await page.getByRole('button',{name:'Actions du fichier projet'}).click();
 await page.getByRole('button',{name:'Ouvrir un projet…',exact:true}).click();
 await expect(page.locator('.gd-message')).toContainText('Projet ouvert.');
 await expect(end).toHaveCount(1);await expect(page.locator('.gd-step-item.preparing')).toHaveCount(1);
 await page.locator('.gd-delivery > summary').click();await page.getByRole('button',{name:'Publier la campagne',exact:true}).click();
 await expect(page.locator('.gd-message')).toContainText('Publié');
 const published=JSON.parse(await fs.readFile(path.join(game,'content/design/game_content.json'),'utf8'));
 expect(published.levels).toHaveLength(1);expect(published.campaign.steps.map((s:any)=>s.kind)).toEqual(['cinematic','level','end']);
 expect(JSON.parse(await fs.readFile(file,'utf8'))).toEqual(saved);
 await expect(end.locator('.gd-step-card')).toContainText('Fin actuelle de la partie jouable');
 if(process.env.LUNARIA_CAMPAIGN_CAPTURE){
  await app.evaluate(({BrowserWindow})=>{BrowserWindow.getAllWindows()[0].setSize(1440,1080);});
  if(await page.getByRole('button',{name:'Fermer le message des niveaux'}).isVisible())await page.getByRole('button',{name:'Fermer le message des niveaux'}).click();
  await end.scrollIntoViewIfNeeded();await page.screenshot({path:process.env.LUNARIA_CAMPAIGN_CAPTURE});
 }
 await end.locator('.gd-step-card').press('Delete');
 await expect(end).toHaveCount(0);await expect(page.locator('.gd-step-item.preparing')).toHaveCount(0);
 await page.keyboard.press('Control+z');await expect(end).toHaveCount(1);
});

test('The endpoint can be dragged and remains accessible in a narrow window',async()=>{
 await app.evaluate(({BrowserWindow})=>{BrowserWindow.getAllWindows()[0].setSize(1440,1280);});
 await page.getByRole('button',{name:'Insérer entre les étapes 2 et 3',exact:true}).click();
 await page.getByRole('button',{name:'Insérer la fin actuelle ici',exact:true}).click();
 const end=page.locator('.gd-step-item.end');
 await end.locator('.gd-step-grip').dragTo(page.getByRole('button',{name:'Insérer au début de la campagne',exact:true}));
 await expect(page.locator('.gd-step-item.preparing')).toHaveCount(3);
 await page.keyboard.press('Control+z');await expect(page.locator('.gd-step-item.preparing')).toHaveCount(1);
 await app.evaluate(({BrowserWindow})=>{BrowserWindow.getAllWindows()[0].setSize(1050,780);});
 const endCard = end.locator('.gd-step-card');
 await endCard.scrollIntoViewIfNeeded();
 await expect(endCard).toBeInViewport({ratio:1});
 await endCard.press('Delete');await expect(end).toHaveCount(0);
});

test('un niveau après la fin actuelle reste testable dans une copie isolée',async()=>{
 const godot=path.join(dir,'fake-godot.exe');await fs.writeFile(godot,'test');
 await app.evaluate(({dialog},{game,godot})=>{dialog.showOpenDialog=async(...args:any[])=>({canceled:false,filePaths:[args.at(-1).title?.includes('Godot pour lancer')?godot:game]});},{game,godot});
 await page.getByRole('button',{name:'Insérer entre les étapes 2 et 3',exact:true}).click();
 await page.getByRole('button',{name:'Insérer la fin actuelle ici',exact:true}).click();
 await page.locator('.gd-step-item.preparing .gd-step-card').dblclick();
 await expect(page.getByText('Suite en préparation · après la fin actuelle, non publié.',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:/Jouer ce niveau/}).click();
 await expect(page.locator('.gd-message')).toContainText('Lunaria lancé sur');
 const snapshots=await fs.readdir(path.join(profile,'level-previews'));
 expect(snapshots).toHaveLength(1);
 const preview=JSON.parse(await fs.readFile(path.join(profile,'level-previews',snapshots[0],'content/design/game_content.json'),'utf8'));
 expect(preview.levels).toHaveLength(2);expect(preview.campaign.steps.at(-1).kind).toBe('end');
 await page.locator('.studio-sections').getByRole('button',{name:'Campagne',exact:true}).click();
 await expect(page.locator('.gd-step-item.end')).toHaveCount(1);
 await expect(page.locator('.gd-step-item.preparing')).toHaveCount(1);
});

test('The herbarium and travel book unlock milestones can be inserted, moved, dragged, undone, saved, published and removed',async()=>{
 test.setTimeout(60000);
 await page.getByRole('button',{name:'Insérer entre les étapes 2 et 3',exact:true}).click();
 await page.getByRole('button',{name:'Insérer le déblocage de L’herbier ici',exact:true}).click();
 const herbarium=page.locator('.gd-step-item.unlock_herbarium');
 await expect(herbarium).toHaveCount(1);
 await expect(page.getByRole('button', { name: /L’herbier, étape 3/ })).toBeVisible();
 await page.getByRole('button',{name:'Insérer après la dernière étape',exact:true}).click();
 await page.getByRole('button',{name:'Insérer le déblocage du Carnet ici',exact:true}).click();
 const unlock=page.locator('.gd-step-item.unlock_travel_book');
 await expect(unlock).toHaveCount(1);
 await expect(page.locator('.gd-step-card')).toHaveCount(5);
 await expect(page.getByRole('button', { name: /Carnet de voyage, étape 5/ })).toBeVisible();
 await page.keyboard.press('Control+z');await expect(unlock).toHaveCount(0);
 await page.keyboard.press('Control+y');await expect(unlock).toHaveCount(1);
 await herbarium.locator('.gd-step-card').press('Alt+ArrowUp');
 await expect(page.getByRole('button', { name: /L’herbier, étape 2/ })).toBeVisible();
 // Inserting again relocates the single herbarium milestone instead of creating a duplicate.
 await page.getByRole('button',{name:'Insérer entre les étapes 3 et 4',exact:true}).click();
 await page.getByRole('button',{name:'Déplacer le déblocage de L’herbier ici',exact:true}).click();
 await expect(herbarium).toHaveCount(1);
 await expect(page.getByRole('button', { name: /L’herbier, étape 3/ })).toBeVisible();
 // Drag and drop works on both milestone cards.
 await unlock.locator('.gd-step-grip').dragTo(page.getByRole('button',{name:'Insérer entre les étapes 3 et 4',exact:true}));
 await page.locator('.studio-modebar').getByRole('button',{name:'Enregistrer le projet'}).click();
 await expect(page.locator('.gd-message')).toContainText('enregistrés');
 const saved=JSON.parse(await fs.readFile(file,'utf8'));
 expect(saved.campaign.steps.map((s:any)=>s.kind)).toEqual(['cinematic','level','unlock_herbarium','unlock_travel_book','level']);
 await page.getByRole('button',{name:'Actions du fichier projet'}).click();
 await page.getByRole('button',{name:'Ouvrir un projet…',exact:true}).click();
 await expect(page.locator('.gd-delivery > summary')).not.toHaveAttribute('aria-disabled','true');
 await expect(herbarium).toHaveCount(1);
 await expect(unlock).toHaveCount(1);
 await page.locator('.gd-delivery > summary').click();
 await page.getByRole('button',{name:'Publier la campagne',exact:true}).click();
 await expect(page.locator('.gd-message')).toContainText('Publié');
 const published=JSON.parse(await fs.readFile(path.join(game,'content/design/game_content.json'),'utf8'));
 expect(published.levels).toHaveLength(2);
 expect(published.campaign.steps.map((s:any)=>s.kind)).toEqual(['cinematic','level','unlock_herbarium','unlock_travel_book','level']);
 await herbarium.locator('.gd-step-card').press('Delete');
 await expect(herbarium).toHaveCount(0);
 await unlock.locator('.gd-step-card').press('Delete');
 await expect(unlock).toHaveCount(0);
 await expect(page.getByRole('navigation', { name: 'Raccourcis du parcours' })).toHaveCount(0);
});

test('milestone shortcuts reveal their selected steps in a compact campaign window', async ({}, info) => {
  const project = JSON.parse(await fs.readFile(file, 'utf8'));
  const [intro, firstLevel, secondLevel] = project.campaign.steps;
  project.campaign.steps = Array.from({ length: 25 }, (_, index) => {
    const id = `step_compact_${index + 1}`;
    if (index === 8) return { id, kind: 'unlock_herbarium' };
    if (index === 17) return { id, kind: 'end' };
    if (index === 23) return { id, kind: 'unlock_travel_book' };
    if (index === 1) return { ...firstLevel, id };
    if (index === 3) return { ...secondLevel, id };
    return { ...intro, id };
  });
  await fs.writeFile(file, JSON.stringify(project));
  await page.setViewportSize({ width: 1000, height: 680 });
  await page.getByRole('button', { name: 'Actions du fichier projet' }).click();
  await page.getByRole('button', { name: 'Ouvrir un projet…', exact: true }).click();
  const cards = page.locator('.gd-step-card');
  await expect(cards).toHaveCount(25);
  const closeMessage = page.getByRole('button', { name: 'Fermer le message des niveaux' });
  if (await closeMessage.isVisible()) await closeMessage.click();
  await expect(cards.nth(3)).toBeInViewport({ ratio: 1 });
  const campaign = page.getByRole('region', { name: 'Campagne', exact: true });
  expect(await campaign.evaluate((area) => area.scrollWidth - area.clientWidth)).toBe(0);
  await expect(page.getByRole('complementary', {name:'Détails de l’étape'})).toHaveCount(0);
  const track = page.getByRole('region', {name:'Parcours',exact:true});
  expect((await track.boundingBox())!.width).toBeGreaterThan(650);
  const reserve = page.getByRole('complementary', {name:'À placer'});
  expect((await reserve.boundingBox())!.x).toBeGreaterThan((await track.boundingBox())!.x);

  const shortcuts = page.getByRole('navigation', { name: 'Raccourcis du parcours' });
  for (const [name, index] of [
    [/L’herbier, étape 9/, 8],
    [/Fin actuelle, étape 18.*7 étapes en préparation/, 17],
    [/Carnet de voyage, étape 24.*Hors version jouable/, 23],
  ] as const) {
    await shortcuts.getByRole('button', { name }).click();
    const card = cards.nth(index);
    await expect(card).toBeInViewport({ ratio: 1 });
    await expect(card).toBeFocused();
    await expect(card).toHaveAttribute('aria-pressed', 'true');
    if (index === 17) {
      await expect(page.getByText('Suite en préparation', { exact: true })).toBeInViewport({ ratio: 1 });
    }
  }
  await page.screenshot({ path: info.outputPath('campaign-compact.png') });

  const insertion = page.getByRole('button', { name: 'Insérer entre les étapes 23 et 24', exact: true });
  await insertion.focus();
  await page.keyboard.press('Enter');
  await expect(insertion).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('combobox', { name: 'Cinématique à placer' }).focus();
  await page.keyboard.press('Escape');
  await expect(insertion).toHaveAttribute('aria-expanded', 'false');
  await expect(insertion).toBeFocused();
});

test('campaign previews open independently from the compact default', async () => {
  const project = JSON.parse(await fs.readFile(file, 'utf8'));
  project.title = 'Campagne des aperçus';
  const film = project.cinematics[0];
  film.shots = Array.from({ length: 12 }, (_, index) => ({
    ...newShot('library://pixel.png'),
    name: `Plan de test ${index + 1}`,
  }));
  project.levels[0].terrainImage = 'library://pixel.png';
  await fs.writeFile(file, JSON.stringify(project));
  await page.setViewportSize({ width: 1000, height: 680 });
  await page.getByRole('button', { name: 'Actions du fichier projet' }).click();
  await page.getByRole('button', { name: 'Ouvrir un projet…', exact: true }).click();
  await expect(page.getByLabel('Titre du projet')).toHaveValue(project.title);

  const filmToggle = page.getByRole('button', { name: /l’aperçu de l’étape 1$/ });
  const levelToggle = page.getByRole('button', { name: /l’aperçu de l’étape 2$/ });
  await expect(page.locator('.gd-step-preview')).toHaveCount(0);
  await expect(filmToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(levelToggle).toHaveAttribute('aria-expanded', 'false');
  await filmToggle.press('Enter');
  await expect(filmToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(levelToggle).toHaveAttribute('aria-expanded', 'false');

  const preview = page.getByRole('group', { name: 'Plans de la cinématique « Introduction de test »' });
  const strip = preview.locator('.gd-film-frames');
  const slides = strip.locator('li');
  await expect(slides).toHaveCount(12);
  const track = page.getByRole('region', {name:'Parcours',exact:true});
  expect(await track.evaluate((element) => {
    const { left, right } = element.getBoundingClientRect();
    return left >= 0 && right <= window.innerWidth;
  })).toBe(true);
  await expect(slides.first()).toContainText('Plan de test 1');
  await expect(slides.first().locator('svg.scene-svg image[data-background]')).toHaveCount(1);
  await expect(slides.last().locator('svg.scene-svg')).toHaveCount(0);
  await strip.focus();
  await strip.press('ArrowRight');
  await expect.poll(() => strip.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  await strip.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
  await expect(slides.last()).toBeInViewport({ ratio: 0.85 });
  await expect(slides.last().locator('svg.scene-svg image[data-background]')).toHaveCount(1);

  await levelToggle.click();
  await expect(levelToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(filmToggle).toHaveAttribute('aria-expanded', 'true');
  const terrain = page.getByRole('img', { name: /^Fond du plateau —/ }).first();
  await terrain.scrollIntoViewIfNeeded();
  await expect.poll(() => terrain.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByText('Aucun fond configuré', { exact: true })).toHaveCount(0);

  await filmToggle.click();
  await expect(filmToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(preview).toHaveCount(0);
  await expect(terrain).toHaveCount(1);

  await page.getByRole('button', { name: 'Tout déplier', exact: true }).click();
  await expect(page.locator('.gd-step-preview')).toHaveCount(3);
  await expect(page.getByText('Aucun fond configuré', { exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: 'Tout replier', exact: true }).click();
  await expect(page.locator('.gd-step-preview')).toHaveCount(0);

  await filmToggle.click();
  await expect(preview).toHaveCount(1);
  project.title = 'Campagne rouverte';
  await fs.writeFile(file, JSON.stringify(project));
  await page.getByRole('button', { name: 'Actions du fichier projet' }).click();
  await page.getByRole('button', { name: 'Ouvrir un projet…', exact: true }).click();
  await expect(page.getByLabel('Titre du projet')).toHaveValue(project.title);
  await expect(filmToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('.gd-step-preview')).toHaveCount(0);
  await expect(page.locator('.gd-step-card')).toHaveCount(3);
});

test('unplaced media previews can be dragged into the campaign and return after withdrawal', async () => {
  const project = JSON.parse(await fs.readFile(file, 'utf8'));
  project.title = 'Campagne avec contenus à placer';
  const spareFilm = newCinematic();
  spareFilm.id = 'CIN_RESERVE';
  spareFilm.title = 'Cinématique à placer';
  spareFilm.shots = [newShot('library://pixel.png'), newShot('library://pixel.png')];
  project.cinematics.push(spareFilm);
  const spareLevel = cloneLevel(project.levels[0]);
  spareLevel.title = 'Niveau à placer';
  spareLevel.terrainImage = 'library://pixel.png';
  project.levels.push(spareLevel);
  await fs.writeFile(file, JSON.stringify(project));

  await page.setViewportSize({ width: 1000, height: 680 });
  await page.getByRole('button', { name: 'Actions du fichier projet' }).click();
  await page.getByRole('button', { name: 'Ouvrir un projet…', exact: true }).click();
  await expect(page.getByLabel('Titre du projet')).toHaveValue(project.title);
  const notice = page.getByRole('button', { name: 'Fermer le message des niveaux' });
  if (await notice.isVisible()) await notice.click();

  const reserve = page.getByRole('complementary', { name: 'À placer' });
  const cinemaTab = reserve.getByRole('tab', { name: 'Cinématiques', exact: true });
  const levelsTab = reserve.getByRole('tab', { name: 'Niveaux', exact: true });
  const cinemaTile = reserve.getByRole('button', { name: 'Sélectionner « Cinématique à placer » pour l’insérer' });
  const levelTile = reserve.getByRole('button', { name: 'Sélectionner « Niveau à placer » pour l’insérer' });
  const cards = page.locator('.gd-step-card');
  const filmCard = cards.filter({ hasText: 'Cinématique à placer' });

  await expect(cinemaTab).toHaveAttribute('aria-selected', 'true');
  await expect(reserve.getByRole('button', { name: /Introduction de test/ })).toHaveCount(0);
  await expect(cinemaTile.locator('svg.scene-svg image[data-background]')).toHaveCount(1);
  await expect(cinemaTile.locator('[data-preview-shot]')).toHaveAttribute('data-preview-shot', spareFilm.shots[1].id);
  await reserve.getByRole('button', { name: 'Mettre en pause les aperçus', exact: true }).click();
  await expect(reserve.getByRole('button', { name: 'Lancer les aperçus', exact: true })).toBeVisible();
  await cinemaTile.dragTo(page.getByRole('button', { name: 'Insérer entre les étapes 2 et 3', exact: true }));
  await expect(filmCard).toHaveAttribute('aria-label', 'Étape 3 · Cinématique à placer');
  await expect(cinemaTile).toHaveCount(0);

  await cinemaTab.press('ArrowRight');
  await expect(levelsTab).toBeFocused();
  await expect(levelsTab).toHaveAttribute('aria-selected', 'true');
  await expect(reserve.locator('.gd-reserve-tile')).toHaveCount(1);
  await expect.poll(() => levelTile.locator('img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await levelTile.dragTo(page.getByRole('button', { name: 'Insérer après la dernière étape', exact: true }));
  await expect(cards.last()).toContainText('Niveau à placer');
  await expect(levelTile).toHaveCount(0);
  await page.keyboard.press('Control+z');
  await expect(levelTile).toBeVisible();
  await page.keyboard.press('Control+y');
  await expect(levelTile).toHaveCount(0);

  await cinemaTab.click();
  await filmCard.press('Delete');
  await expect(cinemaTile).toBeVisible();
  await cinemaTile.press('Enter');
  await expect(cinemaTile).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Insérer au début de la campagne', exact: true }).press('Enter');
  await expect(cards.first()).toContainText('Cinématique à placer');
  await expect(filmCard).toHaveCount(1);
  await expect(cinemaTile).toHaveCount(0);
});
