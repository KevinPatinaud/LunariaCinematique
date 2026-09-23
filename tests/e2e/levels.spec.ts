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
test('image du personnage et animations par planche ou fichiers séparés',async()=>{
 await fs.writeFile(path.join(library,'sheet.png'),Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAADklEQVR4nGP4z8AAQv8BD/kD/YURmXYAAAAASUVORK5CYII=','base64'));
 await fs.writeFile(path.join(library,'second.png'),PIXEL_PNG);
 await page.getByRole('button',{name:'Plantes alliées Équilibrage global'}).click();
 await expect(page.getByRole('heading',{name:'Image du personnage'})).toBeVisible();
 await page.getByRole('region',{name:'Image principale de Radis'}).getByRole('button',{name:'Choisir ou importer une image'}).click();
 await page.getByRole('button',{name:'Utiliser sheet.png'}).click();
 await page.getByRole('button',{name:'Animations de Radis',exact:true}).click();
 await page.getByLabel('Créer une animation pour Radis').selectOption('attack');
 await page.getByLabel('Style de l’animation').selectOption('frames');
 await page.getByRole('button',{name:'Une planche de frames'}).click();
 await page.getByRole('button',{name:'Choisir ou importer une planche'}).click();
 await page.getByRole('button',{name:'Utiliser sheet.png'}).click();
 await page.getByLabel('Colonnes',{exact:true}).fill('2');
 await page.getByLabel('Colonnes',{exact:true}).press('Tab');
 await page.getByRole('button',{name:'Ajouter les 2 frames'}).click();
 await expect(page.getByLabel('Images de l’animation').getByRole('button')).toHaveCount(2);
 expect(await page.getByLabel('Images de l’animation').locator('svg').evaluateAll(elements=>elements.map(element=>element.getAttribute('viewBox')))).toEqual(['0 0 1 1','1 0 1 1']);
 await page.getByRole('button',{name:'Plusieurs images'}).click();
 await page.getByRole('button',{name:'Sélectionner ou importer plusieurs images'}).click();
 await page.getByRole('button',{name:'Sélectionner second.png'}).click();
 await page.getByRole('button',{name:'Sélectionner pixel.png'}).click();
 await page.getByRole('button',{name:'Ajouter 2 images'}).click();
 await expect(page.getByLabel('Images de l’animation').getByRole('button')).toHaveCount(4);
 const data=await save();
 expect(data.balance.plants[0].visual.sprite.asset).toBe('library://sheet.png');
 const animation=data.presentation.animations.find((entry:any)=>entry.ownerSpeciesId==='radish'&&entry.name==='Radis — Attaque');
 expect(animation).toBeTruthy();
 expect(animation.frames.map((frame:any)=>frame.asset)).toEqual(['library://sheet.png','library://sheet.png','library://second.png','library://pixel.png']);
 expect(animation.frames[0].region).toEqual({x:0,y:0,width:1,height:1});
 expect(animation.frames[1].region).toEqual({x:1,y:0,width:1,height:1});
});
test('importer une image externe dans la bibliothèque depuis la fiche du personnage',async()=>{
 const external=path.join(temp,'new-character.png');await fs.writeFile(external,PIXEL_PNG);
 await app.evaluate(({dialog},selected)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[selected]});},external);
 await page.getByRole('button',{name:'Plantes alliées Équilibrage global'}).click();
 await page.getByRole('region',{name:'Image principale de Radis'}).getByRole('button',{name:'Choisir ou importer une image'}).click();
 await page.getByRole('button',{name:'Importer des fichiers…'}).click();
 await expect(page.getByRole('region',{name:'Image principale de Radis'})).toContainText('studio_imports/new-character.png');
 expect(await fs.readFile(path.join(library,'studio_imports','new-character.png'))).toEqual(PIXEL_PNG);
 const data=await save();expect(data.balance.plants[0].visual.sprite.asset).toBe('library://studio_imports/new-character.png');
});
test('effectif de vague et roster sont enregistrés sans recopier les statistiques',async()=>{
 await page.getByLabel('Nombre du groupe 1',{exact:true}).fill('7');await page.getByLabel('Nombre du groupe 1',{exact:true}).press('Tab');
 await page.getByRole('button',{name:'Plantes disponibles',exact:true}).click();
 await page.getByLabel('Autoriser Fougère',{exact:true}).check();
 const data=await save();expect(data.levels[0].waves[0].groups[0].count).toBe(7);expect(data.levels[0].allowedPlants).toContain('fern');
 expect(Object.hasOwn(data.levels[0],'damage')).toBe(false);
});
test('interface simplifiée sans récit ni objectifs bonus',async()=>{
 await expect(page.getByRole('button',{name:'Récit & objectifs bonus',exact:true})).toHaveCount(0);
 await expect(page.getByText(/Objectifs bonus/)).toHaveCount(0);
 await page.getByRole('button',{name:'Événements & dialogue',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Dialogue pendant la mission'})).toBeVisible();
 const data=await save();expect(Object.hasOwn(data.levels[0],'optionalGoals')).toBe(false);
});
test('le niveau sélectionné est publié et lancé avec un profil de test isolé',async()=>{
 const game=path.join(temp,'preview-game'),godot=path.join(temp,'fake-godot.exe');
 for(const folder of ['content/design','app/controllers','domain/logic','domain/presentation'])await fs.mkdir(path.join(game,folder),{recursive:true});
 for(const marker of ['project.godot','app/controllers/campaign_flow.gd','domain/logic/event_runtime.gd','domain/presentation/animation_registry.gd'])await fs.writeFile(path.join(game,...marker.split('/')),'marker');
 await fs.writeFile(path.join(game,'content/design/game_content.json'),'{}');await fs.writeFile(godot,'fake');
 await app.evaluate(({dialog},{game,godot})=>{dialog.showOpenDialog=async(...args:any[])=>{const options=args.at(-1);return{canceled:false,filePaths:[options.title?.includes('Godot pour lancer')?godot:game]};};},{game,godot});
 const title=(await page.locator('.gd-section-heading h1').first().textContent())?.trim()??'';
 expect(title).not.toBe('');
 await page.getByRole('button',{name:/Jouer ce niveau/}).click();
 await expect(page.locator('.gd-message')).toContainText(`Lunaria lancé sur « ${title} »`);
 const published=JSON.parse(await fs.readFile(path.join(game,'content/design/game_content.json'),'utf8'));
 expect(published.levels.some((level:any)=>level.title===title)).toBe(true);
 const settings=JSON.parse(await fs.readFile(path.join(profile,'game-preview.json'),'utf8'));
 expect(settings.gameRoot).toBe(await fs.realpath(game));expect(typeof settings.godotPath).toBe('string');
});
test('les builds PC et Android synchronisent le projet et produisent leurs artefacts',async()=>{
 const repository=path.join(temp,'build-repository'),game=path.join(repository,'game');
 for(const folder of ['content/design','app/controllers','domain/logic','domain/presentation'])await fs.mkdir(path.join(game,folder),{recursive:true});
 for(const marker of ['project.godot','app/controllers/campaign_flow.gd','domain/logic/event_runtime.gd','domain/presentation/animation_registry.gd'])await fs.writeFile(path.join(game,...marker.split('/')),'marker');
 await fs.writeFile(path.join(game,'content/design/game_content.json'),'{}');
 await app.evaluate(({dialog},game)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[game]});},game);
 await page.getByRole('button',{name:'Build PC',exact:true}).click();
 await expect(page.locator('.gd-message')).toContainText('Build PC terminé');
 await expect.poll(()=>fs.stat(path.join(repository,'build/windows/Lunaria.exe')).then(s=>s.size)).toBeGreaterThan(0);
 await page.getByRole('button',{name:'Build Android',exact:true}).click();
 await expect(page.locator('.gd-message')).toContainText('Build Android terminé');
 await expect.poll(()=>fs.stat(path.join(repository,'build/android/Lunaria.apk')).then(s=>s.size)).toBeGreaterThan(0);
 const published=JSON.parse(await fs.readFile(path.join(game,'content/design/game_content.json'),'utf8'));
 expect(published.title).toBe(seedProject().title);
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
