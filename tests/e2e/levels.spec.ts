/** Native Electron regression scenarios. Provided for npm run test:e2e;
 * not executed in the delivery environment (see TEST_REPORT_V1_6.md).
 */
import { test, expect, _electron, type ElectronApplication, type Page } from '@playwright/test';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { seedProject } from '../../src/shared/game/seed.js';
import { fixturePresentation, PIXEL_PNG } from '../presentation-fixture.js';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
let app:ElectronApplication,page:Page,temp:string,target:string,library:string,profile:string,errors:string[];
test.beforeEach(async()=>{
 temp=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-levels-e2e-'));target=path.join(temp,'campaign.game.json');library=path.join(temp,'library');profile=path.join(temp,'profile');errors=[];
 await fs.mkdir(library);await fs.mkdir(profile);await fs.writeFile(path.join(library,'pixel.png'),PIXEL_PNG);
 await fs.writeFile(path.join(profile,'settings.json'),JSON.stringify({libraryRoot:library}));await fs.writeFile(target,JSON.stringify(fixturePresentation(seedProject(),'library://pixel.png')));
 const env=Object.fromEntries(Object.entries(process.env).filter((e):e is [string,string]=>typeof e[1]==='string'));
 delete env.LUNARIA_DEV_URL;
 app=await _electron.launch({args:[ROOT],env:{...env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:profile}});
 page=await app.firstWindow();page.on('pageerror',e=>errors.push(e.message));
 await page.waitForURL('app://studio/index.html');
 await app.evaluate(({dialog},target)=>{
  dialog.showSaveDialog=async()=>({canceled:false,filePath:target});
  dialog.showOpenDialog=async()=>({canceled:false,filePaths:[target]});
  dialog.showMessageBox=async()=>({response:1,checkboxChecked:false});
 },target);
 await page.locator('.studio-modebar').getByRole('button',{name:/^Niveaux/}).click();
 await page.locator('.gd-toolbar').getByRole('button',{name:'Ouvrir',exact:true}).click();
 await expect(page.getByLabel('Titre du projet de niveaux')).toBeVisible();
 await expect(page.locator('.gd-message')).toContainText('Projet ouvert.');
 await page.locator('.gd-sections').getByRole('button',{name:/^Niveaux/}).click();
});
test.afterEach(async({},info)=>{
 if(page&&!page.isClosed()&&info.status!==info.expectedStatus)await info.attach('niveaux',{body:await page.screenshot(),contentType:'image/png'});
 if(app)await app.close();await fs.rm(temp,{recursive:true,force:true});expect(errors).toEqual([]);
});
async function save(){
 await page.locator('.gd-toolbar').getByRole('button',{name:'Enregistrer',exact:true}).click();
 await expect(page.locator('.gd-message')).toContainText('enregistrés');
 return JSON.parse(await fs.readFile(target,'utf8'));
}
test('catalogue global enregistré une seule fois et conservation entre modes',async()=>{
 await page.getByRole('button',{name:'Plantes alliées Équilibrage global'}).click();
 await page.getByLabel('Dégâts par attaque',{exact:true}).fill('47');
 await page.getByLabel('Dégâts par attaque',{exact:true}).press('Tab');
 await page.locator('.studio-modebar').getByRole('button',{name:/^Cinématiques/}).click();
 await expect(page.getByTestId('play-from-current')).toBeVisible();
 await page.locator('.studio-modebar').getByRole('button',{name:/^Niveaux/}).click();
 const data=await save();expect(data.balance.plants[0].damage).toBe(47);expect(data.levels).toEqual(seedProject().levels);
});
test('effectif de vague et roster sont enregistrés sans recopier les statistiques',async()=>{
 await page.getByLabel('Nombre du groupe 1',{exact:true}).fill('7');await page.getByLabel('Nombre du groupe 1',{exact:true}).press('Tab');
 await page.getByRole('button',{name:'Plantes disponibles',exact:true}).click();
 await page.getByLabel('Autoriser Fougère',{exact:true}).check();
 const data=await save();expect(data.levels[0].waves[0].groups[0].count).toBe(7);expect(data.levels[0].allowedPlants).toContain('fern');
 expect(Object.hasOwn(data.levels[0],'damage')).toBe(false);
});
test('publication native choisit le projet Godot et ne modifie que le contenu de jeu',async()=>{
 const game=path.join(temp,'game');await fs.mkdir(path.join(game,'content/design'),{recursive:true});
 await fs.mkdir(path.join(game,'domain/logic'),{recursive:true});await fs.mkdir(path.join(game,'domain/presentation'),{recursive:true});await fs.writeFile(path.join(game,'domain/logic/event_runtime.gd'),'extends RefCounted');
 await fs.writeFile(path.join(game,'project.godot'),'[application]\n');
 await fs.writeFile(path.join(game,'content/design/game_content.gd'),'extends RefCounted\n');
 await fs.mkdir(path.join(game,'app/controllers'),{recursive:true});await fs.writeFile(path.join(game,'app/controllers/campaign_flow.gd'),'extends RefCounted\n');
 await fs.writeFile(path.join(game,'domain/presentation/animation_registry.gd'),'extends RefCounted\n');
 await fs.writeFile(path.join(game,'content/design/game_content.json'),JSON.stringify(seedProject()));
 await fs.writeFile(path.join(game,'art.png'),'sentinel');
 await app.evaluate(({dialog},game)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[game]});},game);
 await page.getByLabel('Titre du projet de niveaux').fill('Campagne publiée');
 await page.getByRole('button',{name:'Publier la campagne',exact:true}).click();
 await expect(page.locator('.gd-message')).toContainText('Publié');
 const document=JSON.parse(await fs.readFile(path.join(game,'content/design/game_content.json'),'utf8'));
 expect(document.title).toBe('Campagne publiée');expect(await fs.readFile(path.join(game,'art.png'),'utf8')).toBe('sentinel');
 expect(JSON.parse(await fs.readFile(path.join(game,'content/design/game_content.json.bak'),'utf8')).title).toBe(seedProject().title);
});
