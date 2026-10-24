/** Native Electron campaign scenarios: run with the declared dependencies via npm run test:e2e.
 * Dialog choices are stubbed, but the packaged renderer, preload, IPC and Node filesystem are real.
 */
import {test,expect,_electron,type ElectronApplication,type Page} from '@playwright/test';
import {promises as fs} from 'node:fs';import path from 'node:path';import os from 'node:os';import {fileURLToPath} from 'node:url';
import {seedProject} from '../fixtures/seed40.js';import {ensureCampaign} from '../../src/shared/game/campaign.js';import {newCinematic} from '../../src/shared/model.js';
import {fixturePresentation,PIXEL_PNG} from '../presentation-fixture.js';
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
 await page.locator('.studio-modebar').getByRole('button',{name:/^Niveaux/}).click();
 await page.getByRole('button',{name:'Actions du fichier projet'}).click();await page.getByRole('button',{name:'Ouvrir un projet…',exact:true}).click();await expect(page.locator('.gd-step-card')).toHaveCount(3);
 await page.locator('.gd-step-card').filter({hasText:'Introduction de test'}).click();
 if(await page.getByRole('button',{name:'Fermer le message des niveaux'}).isVisible())await page.getByRole('button',{name:'Fermer le message des niveaux'}).click();
});
test.afterEach(async()=>{await app?.evaluate(({BrowserWindow})=>{for(const w of BrowserWindow.getAllWindows())w.destroy();}).catch(()=>{});await app?.close();await fs.rm(dir,{recursive:true,force:true});});
test('sequence reordering and undo are persisted through real IPC',async()=>{
 await page.getByRole('button',{name:'Descendre l’étape',exact:true}).click();await expect(page.locator('.gd-step-card').nth(1)).toContainText('Introduction de test');
 await page.keyboard.press('Control+z');await expect(page.locator('.gd-step-card').first()).toContainText('Introduction de test');
 await page.getByRole('button',{name:'Répéter ce film juste après'}).click();await expect(page.locator('.gd-step-card')).toHaveCount(4);
 await page.locator('.studio-modebar').getByRole('button',{name:'Enregistrer le projet'}).click();await expect(page.locator('.gd-message')).toContainText('enregistrés');
 const saved=JSON.parse(await fs.readFile(file,'utf8'));expect(saved.campaign.steps).toHaveLength(4);expect(saved.campaign.cinematics).toHaveLength(1);
});
test('explicit insertion rail places a cinematic between two levels',async()=>{
 await expect(page.getByText('Le jeu lit cette liste de haut en bas.')).toBeVisible();
 await page.getByRole('button',{name:'Insérer entre les étapes 2 et 3',exact:true}).click();
 await expect(page.getByText('Les films sont enregistrés avec les niveaux.')).toBeVisible();
 await page.getByRole('button',{name:'Placer ce film',exact:true}).click();
 await expect(page.locator('.gd-step-card')).toHaveCount(4);await expect(page.locator('.gd-step-card').nth(2)).toContainText('Introduction de test');
});
test('project film opens in cinematic mode without replacing the level document',async()=>{
 await page.getByRole('button',{name:'Ouvrir dans l’éditeur de cinématiques'}).click();await expect(page.getByLabel('Titre de la cinématique')).toHaveValue('Introduction de test');
 await page.locator('.studio-modebar').getByRole('button',{name:/^Niveaux/}).click();await expect(page.locator('.gd-step-card')).toHaveCount(3);
});
test('native grouped publisher installs film before committing the sequence',async()=>{
 await page.locator('.gd-delivery > summary').click();await page.getByRole('button',{name:'Publier la campagne',exact:true}).click();await expect(page.locator('.gd-message')).toContainText('Publié');
 const published=JSON.parse(await fs.readFile(path.join(game,'content/design/game_content.json'),'utf8'));expect(published.campaign.steps).toHaveLength(3);
 expect(published.campaign.cinematics[0].file).toMatch(/^content\/cinematics\/studio\//);const d=JSON.parse(await fs.readFile(path.join(game,published.campaign.cinematics[0].file),'utf8'));expect(d.id).toBe('CIN_TEST_CAMPAIGN');
});

test('la fin actuelle est déplaçable, annulable, persistée et coupe la publication',async()=>{
 test.setTimeout(60000);
 await page.getByRole('button',{name:'Insérer entre les étapes 2 et 3',exact:true}).click();
 await page.getByRole('button',{name:'Insérer la fin actuelle ici',exact:true}).click();
 const end=page.locator('.gd-step-item.end');
 await expect(end).toHaveCount(1);await expect(page.locator('.gd-step-card')).toHaveCount(4);
 await expect(page.locator('.gd-step-item.preparing')).toHaveCount(1);
 await expect(page.locator('.gd-step-item.preparing')).toContainText('SUITE EN PRÉPARATION');
 await page.keyboard.press('Control+z');await expect(end).toHaveCount(0);
 await page.keyboard.press('Control+y');await expect(end).toHaveCount(1);
 await end.locator('button').click();
 await page.getByRole('button',{name:'Descendre l’étape',exact:true}).click();
 await expect(page.locator('.gd-step-item.preparing')).toHaveCount(0);
 await page.getByRole('button',{name:'Monter l’étape',exact:true}).click();
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
 await expect(end).toHaveCount(1);await expect(page.locator('.gd-step-item.preparing')).toHaveCount(1);
 await page.locator('.gd-delivery > summary').click();await page.getByRole('button',{name:'Publier la campagne',exact:true}).click();
 await expect(page.locator('.gd-message')).toContainText('Publié');
 const published=JSON.parse(await fs.readFile(path.join(game,'content/design/game_content.json'),'utf8'));
 expect(published.levels).toHaveLength(1);expect(published.campaign.steps.map((s:any)=>s.kind)).toEqual(['cinematic','level','end']);
 expect(JSON.parse(await fs.readFile(file,'utf8'))).toEqual(saved);
 await end.locator('button').click();await expect(page.locator('.gd-campaign-inspector')).toContainText('Le jeu affiche le message de fin');
 if(process.env.LUNARIA_CAMPAIGN_CAPTURE){
  await app.evaluate(({BrowserWindow})=>{BrowserWindow.getAllWindows()[0].setSize(1440,1080);});
  if(await page.getByRole('button',{name:'Fermer le message des niveaux'}).isVisible())await page.getByRole('button',{name:'Fermer le message des niveaux'}).click();
  await end.scrollIntoViewIfNeeded();await page.screenshot({path:process.env.LUNARIA_CAMPAIGN_CAPTURE});
 }
 await page.getByRole('button',{name:'Retirer du parcours',exact:true}).click();
 await expect(end).toHaveCount(0);await expect(page.locator('.gd-step-item.preparing')).toHaveCount(0);
 await page.keyboard.press('Control+z');await expect(end).toHaveCount(1);
});

test('la borne se déplace par glisser-déposer et reste accessible dans une fenêtre étroite',async()=>{
 await app.evaluate(({BrowserWindow})=>{BrowserWindow.getAllWindows()[0].setSize(1440,1280);});
 await page.getByRole('button',{name:'Insérer entre les étapes 2 et 3',exact:true}).click();
 await page.getByRole('button',{name:'Insérer la fin actuelle ici',exact:true}).click();
 const end=page.locator('.gd-step-item.end');
 await end.locator('.gd-step-grip').dragTo(page.getByRole('button',{name:'Insérer au début de la campagne',exact:true}));
 await expect(page.locator('.gd-step-item.preparing')).toHaveCount(3);
 await page.keyboard.press('Control+z');await expect(page.locator('.gd-step-item.preparing')).toHaveCount(1);
 await app.evaluate(({BrowserWindow})=>{BrowserWindow.getAllWindows()[0].setSize(1050,780);});
 await end.locator('button').click();
 const remove=page.getByRole('button',{name:'Retirer du parcours',exact:true});
 await remove.scrollIntoViewIfNeeded();await expect(remove).toBeVisible();
 const box=await remove.boundingBox();expect(box).not.toBeNull();
 expect(box!.y).toBeGreaterThanOrEqual(0);expect(box!.y+box!.height).toBeLessThanOrEqual(await page.evaluate(()=>innerHeight));
 await remove.click();await expect(end).toHaveCount(0);
});

test('un niveau après la fin actuelle reste testable dans une copie isolée',async()=>{
 const godot=path.join(dir,'fake-godot.exe');await fs.writeFile(godot,'test');
 await app.evaluate(({dialog},{game,godot})=>{dialog.showOpenDialog=async(...args:any[])=>({canceled:false,filePaths:[args.at(-1).title?.includes('Godot pour lancer')?godot:game]});},{game,godot});
 await page.getByRole('button',{name:'Insérer entre les étapes 2 et 3',exact:true}).click();
 await page.getByRole('button',{name:'Insérer la fin actuelle ici',exact:true}).click();
 await page.locator('.gd-step-item.preparing button').dblclick();
 await expect(page.getByText('Suite en préparation · après la fin actuelle, non publié.',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:/Jouer ce niveau/}).click();
 await expect(page.locator('.gd-message')).toContainText('Lunaria lancé sur');
 const snapshots=await fs.readdir(path.join(profile,'level-previews'));
 expect(snapshots).toHaveLength(1);
 const preview=JSON.parse(await fs.readFile(path.join(profile,'level-previews',snapshots[0],'content/design/game_content.json'),'utf8'));
 expect(preview.levels).toHaveLength(2);expect(preview.campaign.steps.at(-1).kind).toBe('end');
 await page.locator('.gd-sections').getByRole('button',{name:/^Campagne/}).click();
 await expect(page.locator('.gd-step-item.end')).toHaveCount(1);
 await expect(page.locator('.gd-step-item.preparing')).toHaveCount(1);
});
