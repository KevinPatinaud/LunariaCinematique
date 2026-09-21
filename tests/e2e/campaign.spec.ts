/** Native Electron campaign scenarios: run with the declared dependencies via npm run test:e2e.
 * Dialog choices are stubbed, but the packaged renderer, preload, IPC and Node filesystem are real.
 */
import {test,expect,_electron,type ElectronApplication,type Page} from '@playwright/test';
import {promises as fs} from 'node:fs';import path from 'node:path';import os from 'node:os';import {fileURLToPath} from 'node:url';
import {seedProject} from '../../src/shared/game/seed.js';import {ensureCampaign} from '../../src/shared/game/campaign.js';import {newCinematic} from '../../src/shared/model.js';
import {fixturePresentation,PIXEL_PNG} from '../presentation-fixture.js';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');let app:ElectronApplication,page:Page,dir:string,movies:string,file:string,game:string,library:string,profile:string;
test.beforeEach(async()=>{
 dir=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-campaign-e2e-'));movies=path.join(dir,'movies');file=path.join(dir,'campaign.game.json');game=path.join(dir,'game');library=path.join(dir,'library');profile=path.join(dir,'profile');
 await fs.mkdir(movies,{recursive:true});await fs.mkdir(library);await fs.mkdir(profile);await fs.mkdir(path.join(game,'app/controllers'),{recursive:true});await fs.mkdir(path.join(game,'content/design'),{recursive:true});
 await fs.mkdir(path.join(game,'domain/logic'),{recursive:true});await fs.mkdir(path.join(game,'domain/presentation'),{recursive:true});await fs.writeFile(path.join(game,'domain/logic/event_runtime.gd'),'extends RefCounted');
 await fs.writeFile(path.join(game,'domain/presentation/animation_registry.gd'),'extends RefCounted');await fs.writeFile(path.join(game,'project.godot'),'[application]');await fs.writeFile(path.join(game,'app/controllers/campaign_flow.gd'),'extends RefCounted');
 const movie=newCinematic();movie.id='CIN_TEST_CAMPAIGN';movie.title='Introduction de test';await fs.writeFile(path.join(movies,'intro.json'),JSON.stringify(movie));
 const p=fixturePresentation(seedProject(),'library://pixel.png');p.levels=p.levels.slice(0,2);const c=ensureCampaign(p);c.cinematics=[{id:'film_test',title:movie.title,file:'intro.json',documentId:movie.id}];c.steps.unshift({id:'step_intro',kind:'cinematic',cinematicId:'film_test',skippable:false});
 await fs.writeFile(file,JSON.stringify(p));await fs.writeFile(path.join(game,'content/design/game_content.json'),JSON.stringify(p));
 await fs.writeFile(path.join(library,'pixel.png'),PIXEL_PNG);await fs.writeFile(path.join(profile,'settings.json'),JSON.stringify({libraryRoot:library}));
 const env:NodeJS.ProcessEnv={...process.env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:profile};delete env.LUNARIA_DEV_URL;
 app=await _electron.launch({args:[ROOT],env:env as Record<string,string>});page=await app.firstWindow();await page.waitForURL('app://studio/index.html');
 await app.evaluate(({dialog},{file,game,movies,movieFile})=>{
  dialog.showMessageBox=async()=>({response:1,checkboxChecked:false});
  dialog.showSaveDialog=async()=>({canceled:false,filePath:file});
  dialog.showOpenDialog=async(...args:any[])=>{const options=args.at(-1);return{canceled:false,filePaths:[options.properties?.includes('openDirectory')?(options.title?.includes('project.godot')?game:movies):options.title?.includes('Ajouter une cinématique')?movieFile:file]};};
 },{file,game,movies,movieFile:path.join(movies,'intro.json')});
 await page.locator('.studio-modebar').getByRole('button',{name:/^Niveaux/}).click();
 await page.locator('.gd-toolbar').getByRole('button',{name:'Ouvrir',exact:true}).click();await expect(page.locator('.gd-step-card')).toHaveCount(3);
 await page.locator('.gd-step-card').filter({hasText:'Introduction de test'}).click();
 await page.getByRole('button',{name:'Choisir le dossier…',exact:true}).click();
 if(await page.getByRole('button',{name:'Fermer le message des niveaux'}).isVisible())await page.getByRole('button',{name:'Fermer le message des niveaux'}).click();
});
test.afterEach(async()=>{await app?.close();await fs.rm(dir,{recursive:true,force:true});});
test('sequence reordering and undo are persisted through real IPC',async()=>{
 await page.getByRole('button',{name:'Descendre l’étape',exact:true}).click();await expect(page.locator('.gd-step-card').nth(1)).toContainText('Introduction de test');
 await page.keyboard.press('Control+z');await expect(page.locator('.gd-step-card').first()).toContainText('Introduction de test');
 await page.getByRole('button',{name:'Répéter ce film juste après'}).click();await expect(page.locator('.gd-step-card')).toHaveCount(4);
 await page.locator('.gd-toolbar').getByRole('button',{name:'Enregistrer',exact:true}).click();await expect(page.locator('.gd-message')).toContainText('enregistrés');
 const saved=JSON.parse(await fs.readFile(file,'utf8'));expect(saved.campaign.steps).toHaveLength(4);expect(saved.campaign.cinematics).toHaveLength(1);
});
test('explicit insertion rail places a cinematic between two levels',async()=>{
 await expect(page.getByText('Le jeu lit cette liste de haut en bas.')).toBeVisible();
 await page.getByRole('button',{name:'Insérer entre les étapes 2 et 3',exact:true}).click();
 await expect(page.getByText('Il sera joué à cet endroit précis.')).toBeVisible();
 await page.getByRole('button',{name:'Choisir une cinématique entre les étapes 2 et 3',exact:true}).click();
 await expect(page.locator('.gd-step-card')).toHaveCount(4);await expect(page.locator('.gd-step-card').nth(2)).toContainText('Introduction de test');
});
test('linked film opens in cinematic mode without replacing the level document',async()=>{
 await page.getByRole('button',{name:'Ouvrir dans l’éditeur de cinématiques'}).click();await expect(page.getByLabel('Titre de la cinématique')).toHaveValue('Introduction de test');
 await page.locator('.studio-modebar').getByRole('button',{name:/^Niveaux/}).click();await expect(page.locator('.gd-step-card')).toHaveCount(3);
});
test('native grouped publisher installs film before committing the sequence',async()=>{
 await page.getByRole('button',{name:'Publier la campagne',exact:true}).click();await expect(page.locator('.gd-message')).toContainText('Publié');
 const published=JSON.parse(await fs.readFile(path.join(game,'content/design/game_content.json'),'utf8'));expect(published.campaign.steps).toHaveLength(3);
 expect(published.campaign.cinematics[0].file).toMatch(/^content\/cinematics\/studio\//);const d=JSON.parse(await fs.readFile(path.join(game,published.campaign.cinematics[0].file),'utf8'));expect(d.id).toBe('CIN_TEST_CAMPAIGN');
});
