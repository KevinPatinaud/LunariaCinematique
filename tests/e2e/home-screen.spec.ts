/** Real Electron/IPC/filesystem authoring and publication with isolated media and destination. */
import {test,expect,_electron,type ElectronApplication,type Page} from '@playwright/test';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {seedProject} from '../fixtures/seed40.js';
import {fixturePresentation,PIXEL_PNG} from '../presentation-fixture.js';
import {defaultHomeScreen} from '../../src/shared/game/homeScreen.js';
import type {HomeScreen} from '../../src/shared/game/homeScreen.js';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
let app:ElectronApplication|undefined,page:Page,dir:string,file:string,game:string;

test.beforeEach(async()=>{
 dir=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-home-e2e-'));
 file=path.join(dir,'home.game.json');game=path.join(dir,'game');
 const library=path.join(dir,'library'),profile=path.join(dir,'profile');
 await fs.mkdir(library);await fs.mkdir(profile);
 for(const marker of ['project.godot','app/controllers/campaign_flow.gd','domain/logic/event_runtime.gd','domain/presentation/animation_registry.gd']){
  const target=path.join(game,marker);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,marker.endsWith('.godot')?'[application]':'extends RefCounted');
 }
 await fs.mkdir(path.join(game,'content/design'),{recursive:true});
 const project=fixturePresentation(seedProject(),'library://pixel.png');
 project.levels=project.levels.slice(0,1);
 project.campaign={steps:[{id:'home_test_step',kind:'level',levelId:project.levels[0].id}],cinematics:[]};
 project.homeScreen=defaultHomeScreen();
 project.homeScreen.background={...project.homeScreen.background,mode:'image',image:'library://home-only.png'};
 await fs.writeFile(file,JSON.stringify(project));
 await fs.writeFile(path.join(game,'content/design/game_content.json'),JSON.stringify(project));
 await fs.writeFile(path.join(library,'pixel.png'),PIXEL_PNG);
 await fs.writeFile(path.join(library,'home-only.png'),PIXEL_PNG);
 await fs.writeFile(path.join(library,'home-chosen.png'),PIXEL_PNG);
 await fs.writeFile(path.join(profile,'settings.json'),JSON.stringify({libraryRoot:library}));
 const env=Object.fromEntries(Object.entries(process.env).filter((entry):entry is [string,string]=>typeof entry[1]==='string'));
 delete env.LUNARIA_DEV_URL;
 app=await _electron.launch({args:[ROOT],env:{...env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:profile}});
 page=await app.firstWindow();await page.waitForURL('app://studio/index.html');
 page.on('pageerror',error=>console.error('Home editor renderer error:',error.message));
 await app.evaluate(({dialog,BrowserWindow},{file,game})=>{
  BrowserWindow.getAllWindows()[0].setSize(1600,1050);
  dialog.showSaveDialog=async()=>({canceled:false,filePath:file});
  dialog.showOpenDialog=async(...args:any[])=>({canceled:false,filePaths:[args.at(-1).properties?.includes('openDirectory')?game:file]});
  dialog.showMessageBox=async()=>({response:1,checkboxChecked:false});
 },{file,game});
 await page.locator('.studio-modebar').getByRole('button',{name:/^Niveaux/}).click();
 await page.locator('.gd-toolbar').getByRole('button',{name:'Ouvrir',exact:true}).click();
 await expect(page.getByText('Projet ouvert.',{exact:true})).toBeVisible();
 await dismissMessage();
 await page.locator('.gd-sections').getByRole('button',{name:'Écran d’accueil',exact:true}).click();
 await expect(page.getByTestId('home-screen-editor')).toBeVisible();
});

test.afterEach(async()=>{
 if(app){
  const child=app.process();
  try{await app.evaluate(({app})=>{setTimeout(()=>app.exit(0),0);});}catch{}
  await Promise.race([app.close().catch(()=>{}),new Promise<void>(resolve=>setTimeout(resolve,5000))]);
  if(child.exitCode===null)child.kill();app=undefined;
 }
 if(dir)await fs.rm(dir,{recursive:true,force:true,maxRetries:10,retryDelay:200});
});

async function dismissMessage(){
 const close=page.getByRole('button',{name:'Fermer le message des niveaux'});
 if(await close.isVisible())await close.click();
}
async function save():Promise<HomeScreen>{
 await page.locator('.studio-modebar').getByRole('button',{name:'Enregistrer le projet'}).click();
 await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
 await expect(page.locator('.gd-footer')).not.toContainText('Opération en cours');
 await dismissMessage();
 return JSON.parse(await fs.readFile(file,'utf8')).homeScreen;
}
async function setField(label:string,value:string){
 await page.getByLabel(label,{exact:true}).fill(value);await page.getByLabel(label,{exact:true}).press('Tab');
}
async function select(name:string){await page.getByRole('button',{name:'Sélectionner '+name,exact:true}).click();}

test('compose the home screen, undo, reopen and publish its data and dedicated media',async()=>{
 test.setTimeout(120000);
 const editor=page.getByTestId('home-screen-editor'),preview=page.locator('svg[aria-label="Aperçu de l’écran d’accueil"]');
 await expect(preview).toBeVisible();
 await editor.getByRole('button',{name:'Fond',exact:true}).click();
 await expect(page.getByLabel('Type de fond')).toHaveValue('image');
 await page.getByRole('button',{name:'Choisir une image',exact:true}).click();
 const images=page.getByRole('dialog',{name:'Bibliothèque d’images pour Image du fond'});
 await expect(images).toBeVisible();
 await images.locator('[data-asset-ref="library://home-chosen.png"]').dblclick();
 await expect(images).toHaveCount(0);
 await page.getByLabel('Cadrage du fond').selectOption('contain');
 await setField('Opacité du voile','0.22');
 await editor.getByRole('button',{name:'Reprise',exact:true}).click();
 await setField('Libellé — Nouvelle aventure','Entrer dans mon jardin');
 await setField('Libellé — Bataille à reprendre','Retour au combat');
 await expect(preview.locator('[data-element-id="continue"]')).toContainText('Entrer dans mon jardin');
 await page.getByLabel('État du joueur dans l’aperçu').selectOption('battle');
 await expect(preview.locator('[data-element-id="continue"]')).toContainText('Retour au combat');
 await page.getByLabel('État du joueur dans l’aperçu').selectOption('start');
 await select('Bouton principal');await setField('Texte','Jardin : {continue}');
 await expect(preview.locator('[data-element-id="continue"]')).toContainText('Jardin : Entrer dans mon jardin');
 await select('Titre');
 await setField('Texte','LUNARIA — MON JARDIN');
 await setField('Position X','91');await setField('Largeur','490');await setField('Taille du texte','30');
 await setField('Couleur du texte','#f4a340');
 await expect(preview).toContainText('LUNARIA — MON JARDIN');
 // Exercise actual pointer capture and logical-coordinate conversion, including the resize grip.
 const dragBy=async(selector:string,dx:number,dy:number)=>{
  const canvas=await preview.boundingBox(),box=await preview.locator(selector).boundingBox();
  expect(canvas).not.toBeNull();expect(box).not.toBeNull();
  const x=box!.x+box!.width/2,y=box!.y+box!.height/2;
  await page.mouse.move(x,y);await page.mouse.down();
  await page.mouse.move(x+dx*canvas!.width/1280,y+dy*canvas!.height/720,{steps:5});
  await page.mouse.up();
 };
 await dragBy('[data-element-id="title"] > rect',60,25);
 await expect(page.getByLabel('Position X',{exact:true})).toHaveValue('151');
 await expect(page.getByLabel('Position Y',{exact:true})).toHaveValue('137');
 await dragBy('.home-selection > rect:last-child',60,30);
 await expect(page.getByLabel('Largeur',{exact:true})).toHaveValue('550');
 await expect(page.getByLabel('Hauteur',{exact:true})).toHaveValue('120');
 await page.getByTitle('Annuler · Ctrl+Z',{exact:true}).click();
 await expect(page.getByLabel('Largeur',{exact:true})).toHaveValue('490');
 await expect(page.getByLabel('Hauteur',{exact:true})).toHaveValue('90');
 await expect(page.getByLabel('Position X',{exact:true})).toHaveValue('151');
 await page.getByTitle('Rétablir · Ctrl+Y',{exact:true}).click();
 await expect(page.getByLabel('Largeur',{exact:true})).toHaveValue('550');
 await expect(page.getByLabel('Hauteur',{exact:true})).toHaveValue('120');
 await select('Carnet de voyage');
 await setField('Texte','Explorer mon jardin');
 await page.getByLabel('Action du bouton',{exact:true}).selectOption('collection');
 await select('Sous-titre');
 await page.getByLabel('Afficher cet élément',{exact:true}).uncheck();
 await expect(preview.locator('[data-element-id="subtitle"]')).toHaveCount(0);

 await page.getByLabel('Type d’élément à ajouter').selectOption('text');
 await page.getByRole('button',{name:'Ajouter un élément',exact:true}).click();
 await setField('Nom de l’élément','Note de jardin');await setField('Texte','Bienvenue dans mon jardin');
 await page.getByRole('button',{name:'Reculer d’un plan',exact:true}).click();
 let saved=await save();
 const note=saved.elements.find(e=>e.name==='Note de jardin')!;
 expect(note).toBeDefined();
 expect(saved.elements.at(-2)?.id).toBe(note.id);
 expect(saved.elements.find(e=>e.id==='title')).toMatchObject({text:'LUNARIA — MON JARDIN',rect:{x:151,y:137,w:550,h:120},fontSize:30,color:'#f4a340'});
 expect(saved.background).toMatchObject({mode:'image',image:'library://home-chosen.png',fit:'contain',overlayOpacity:.22});
 expect(saved.elements.find(e=>e.id==='map')).toMatchObject({text:'Explorer mon jardin',action:'collection'});
 expect(saved.elements.find(e=>e.id==='subtitle')?.visible).toBe(false);
 expect(saved.continueLabels).toMatchObject({start:'Entrer dans mon jardin',battle:'Retour au combat'});
 expect(saved.elements.find(e=>e.id==='continue')?.text).toBe('Jardin : {continue}');

 await page.getByRole('button',{name:'Supprimer l’élément',exact:true}).click();
 await expect(page.getByRole('button',{name:'Sélectionner Note de jardin',exact:true})).toHaveCount(0);
 await page.getByTitle('Annuler · Ctrl+Z',{exact:true}).click();
 await expect(page.getByRole('button',{name:'Sélectionner Note de jardin',exact:true})).toBeVisible();
 saved=await save();
 expect(saved.elements.some(e=>e.id===note.id)).toBe(true);

 await page.locator('.gd-toolbar').getByRole('button',{name:'Ouvrir',exact:true}).click();
 await expect(page.getByText('Projet ouvert.',{exact:true})).toBeVisible();await dismissMessage();
 await page.locator('.gd-sections').getByRole('button',{name:'Écran d’accueil',exact:true}).click();
 await select('Titre');await expect(page.getByLabel('Texte',{exact:true})).toHaveValue('LUNARIA — MON JARDIN');
 await expect(page.getByLabel('Position X',{exact:true})).toHaveValue('151');
 await expect(page.getByLabel('Position Y',{exact:true})).toHaveValue('137');
 await expect(page.getByLabel('Largeur',{exact:true})).toHaveValue('550');
 await expect(page.getByLabel('Hauteur',{exact:true})).toHaveValue('120');
 await select('Sous-titre');await expect(page.getByLabel('Afficher cet élément')).not.toBeChecked();
 await select('Carnet de voyage');await expect(page.getByLabel('Action du bouton')).toHaveValue('collection');
 await expect(page.getByRole('button',{name:'Sélectionner Note de jardin',exact:true})).toBeVisible();
 await page.locator('.gd-delivery > summary').click();
 await page.getByRole('button',{name:'Publier la campagne',exact:true}).click();
 await expect(page.locator('.gd-message')).toContainText('Publié');
 const published=JSON.parse(await fs.readFile(path.join(game,'content/design/game_content.json'),'utf8'));
 expect(published.homeScreen).toEqual(saved);
 expect(await fs.readFile(path.join(game,'LunariaArtLibrary/home-chosen.png'))).toEqual(PIXEL_PNG);
 await dismissMessage();
 await fs.mkdir(path.join(ROOT,'work'),{recursive:true});
 await editor.screenshot({path:path.join(ROOT,'work','home-screen-studio-e2e.png')});
});
