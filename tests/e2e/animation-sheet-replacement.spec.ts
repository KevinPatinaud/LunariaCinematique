/** Real art and Electron authoring, with isolated project, library and publication. */
import {test,expect,_electron,type ElectronApplication} from '@playwright/test';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {seedProject} from '../fixtures/seed40.js';
import {fixturePresentation,PIXEL_PNG} from '../presentation-fixture.js';
import type {GameProject} from '../../src/shared/game/types.js';
import {SLOT_LABELS} from '../../src/shared/presentation/types.js';
import {presentationAssets} from '../../src/shared/presentation/runtime.js';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const FILE='C:/dev/Lunaria/HISTOIRE DE LUNARIA/Cinematiques studio/lunaria.game.json';
const ART='C:/dev/Lunaria/LunariaArtLibrary';

test('Radis et Rose: une planche par action, édition, remplacement, réouverture et publication',async({},info)=>{
 test.setTimeout(180000);
 const before=await fs.readFile(FILE),source:GameProject=JSON.parse(before.toString());
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-starter-actions-'));
 const profile=path.join(temp,'profile'),library=path.join(temp,'library'),file=path.join(temp,'starters.game.json'),game=path.join(temp,'game');
 let app:ElectronApplication|undefined;
 try{
  await fs.mkdir(profile);await fs.mkdir(library);
  // Use actual starter animation data and pixels; unrelated media are tiny fixtures.
  const project=fixturePresentation(seedProject(),'library://pixel.png');
  for(const id of ['radish','rose']){
   project.balance.plants.find(s=>s.id===id)!.visual=structuredClone(source.balance.plants.find(s=>s.id===id)!.visual);
   project.presentation!.animations=project.presentation!.animations.filter(a=>a.ownerSpeciesId!==id);
   project.presentation!.animations.push(...structuredClone(source.presentation!.animations.filter(a=>a.ownerSpeciesId===id)));
   const index=project.presentation!.profiles.findIndex(p=>p.id===`profile_${id}`);
   project.presentation!.profiles[index]=structuredClone(source.presentation!.profiles.find(p=>p.id===`profile_${id}`)!);
  }
  project.levels=project.levels.slice(0,1);
  project.campaign={steps:[{id:'starter_animation_step',kind:'level',levelId:project.levels[0].id}],cinematics:[]};
  await fs.writeFile(path.join(library,'pixel.png'),PIXEL_PNG);
  for(const ref of presentationAssets(project)){
   if(ref==='library://pixel.png')continue;
   const relative=ref.slice('library://'.length),target=path.join(library,relative);
   await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(path.join(ART,relative),target);
  }
  const shot=project.presentation!.animations.find(a=>a.id==='radish_throw')!;
  const replacement='library://radish-attack-edited.png';
  await fs.copyFile(path.join(library,shot.frames[0].asset.slice('library://'.length)),path.join(library,'radish-attack-edited.png'));
  for(const marker of ['project.godot','app/controllers/campaign_flow.gd','domain/logic/event_runtime.gd','domain/presentation/animation_registry.gd']){
   const target=path.join(game,marker);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,marker.endsWith('.godot')?'[application]':'extends RefCounted');
  }
  await fs.mkdir(path.join(game,'content/design'),{recursive:true});
  await fs.writeFile(file,JSON.stringify(project));await fs.writeFile(path.join(game,'content/design/game_content.json'),JSON.stringify(project));
  await fs.writeFile(path.join(profile,'settings.json'),JSON.stringify({libraryRoot:library}));
  const env=Object.fromEntries(Object.entries(process.env).filter((entry):entry is [string,string]=>typeof entry[1]==='string'));delete env.LUNARIA_DEV_URL;
  app=await _electron.launch({args:[ROOT],env:{...env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:profile}});
  const page=await app.firstWindow();await page.waitForURL('app://studio/index.html');
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await app.evaluate(({dialog,BrowserWindow},{file,game})=>{
   BrowserWindow.getAllWindows()[0].setSize(1600,1050);
   dialog.showOpenDialog=async(...args:any[])=>({canceled:false,filePaths:[args.at(-1).properties?.includes('openDirectory')?game:file]});
   dialog.showSaveDialog=async()=>({canceled:false,filePath:file});
   dialog.showMessageBox=async()=>({response:1,checkboxChecked:false});
  },{file,game});
  await page.locator('.studio-modebar').getByRole('button',{name:/^Niveaux/}).click();
  async function open(){
   await page.getByRole('button',{name:'Actions du fichier projet'}).click();await page.getByRole('button',{name:'Ouvrir un projet…',exact:true}).click();
   await expect(page.locator('.gd-message')).toContainText('Projet ouvert.');await page.locator('.gd-message button').click();
  }
  async function select(id:string,name:string){
   await page.locator('.gd-sections').getByRole('button',{name:/^Plantes/}).click();
   await page.getByRole('complementary',{name:'Catalogue des plantes'}).getByRole('button',{name:new RegExp('^'+name)}).click();
   await page.getByRole('button',{name:'Animations et sons de '+name,exact:true}).click();
   await page.getByRole('button',{name:/^Ses animations \(/}).click();
   await expect(page.locator('.lp-owned-list').getByRole('button')).toHaveCount(id==='radish'?8:9);
  }
  async function edit(label:string,value:string){const field=page.getByLabel(label,{exact:true});await field.fill(value);await field.press('Tab');}
  await open();
  for(const [id,name] of [['radish','Radis'],['rose','Rose']]){
   await select(id,name);
   const animations=project.presentation!.animations.filter(a=>a.ownerSpeciesId===id);
   expect(new Set(animations.map(a=>a.frames[0].asset)).size).toBe(animations.length);
   for(const animation of animations){
    expect(new Set(animation.frames.map(f=>f.asset)).size).toBe(1);
    await page.locator('.lp-owned-list').getByRole('button',{name:animation.name+' '+animation.frames.length+' image'+(animation.frames.length>1?'s':''),exact:true}).click();
    await expect(page.getByLabel('Images de l’animation').getByRole('button')).toHaveCount(animation.frames.length);
    await expect(page.locator('.lp-frame-editor')).toContainText(path.basename(animation.frames[0].asset));
    await page.getByLabel('Curseur temporel de l’animation').fill('0.2');
    await expect(page.locator('.lp-owned-editor .lp-preview svg image').first()).toHaveAttribute('href',/asset/);
    await expect(page.locator('.lp-owned-editor')).not.toContainText('Ressource à relier');
   }
   await page.getByRole('button',{name:'Actions du personnage',exact:true}).click();
   for(const binding of project.presentation!.profiles.find(p=>p.id===`profile_${id}`)!.slots)
    await expect(page.getByLabel('Animation pour '+(SLOT_LABELS[binding.slot]??binding.slot),{exact:true})).toHaveValue(binding.animationId);
   await page.locator('.lp-species-actions').screenshot({path:info.outputPath(id+'-actions-studio.png')});
   await page.getByRole('button',{name:`Ses animations (${animations.length})`,exact:true}).click();
  }
  await select('radish','Radis');
  await page.locator('.lp-owned-list').getByRole('button',{name:new RegExp('^'+shot.name)}).click();
  await edit('Temps d’affichage (s)','0.075');
  await page.getByRole('button',{name:'Afficher les réglages avancés',exact:true}).click();
  await page.getByLabel('Position des pieds propre à cette image').check();
  await edit('Pieds — horizontal','0.51');await edit('Échelle horizontale','1.08');
  await edit('Moment précis (s)','0.2');
  await page.getByRole('button',{name:'Choisir ou importer une planche',exact:true}).click();
  const picker=page.getByRole('dialog',{name:'Bibliothèque d’images pour Planche à découper'});
  await picker.locator(`[data-asset-ref="${replacement}"]`).dblclick();
  await page.getByRole('button',{name:'Remplacer la planche',exact:true}).click();
  await expect(page.getByLabel('Planche utilisée par l’animation')).toContainText('radish-attack-edited.png');
  await expect(page.getByLabel('Images de l’animation').getByRole('button')).toHaveCount(4);
  await expect(page.getByLabel('Temps d’affichage (s)',{exact:true})).toHaveValue('0.075');
  await expect(page.getByLabel('Pieds — horizontal',{exact:true})).toHaveValue('0.51');
  await page.locator('.lp-images-step').screenshot({path:info.outputPath('radis-planche-studio.png')});
  await select('rose','Rose');
  const idle=project.presentation!.animations.find(a=>a.id==='rose_idle')!;
  await page.locator('.lp-owned-list').getByRole('button',{name:new RegExp('^'+idle.name)}).click();
  await page.getByLabel('Jouer en boucle').uncheck();
  await page.locator('.studio-modebar').getByRole('button',{name:'Enregistrer le projet'}).click();
  await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
  const saved:GameProject=JSON.parse(await fs.readFile(file,'utf8'));
  const changed=saved.presentation!.animations.find(a=>a.id===shot.id)!;
  expect(changed.frames).toEqual(shot.frames.map((f,i)=>({...f,asset:replacement,...(i===0?{duration:.075,anchor:{...(f.anchor??shot.anchor),x:.51}}:{})})));
  expect(changed.transform.scaleX).toBe(1.08);expect(changed.markers.find(m=>m.type==='release')!.at).toBe(.2);
  expect(saved.presentation!.animations.find(a=>a.id===idle.id)!.loop).toBe(false);
  await open();await select('radish','Radis');
  await page.locator('.lp-owned-list').getByRole('button',{name:new RegExp('^'+shot.name)}).click();
  await expect(page.getByLabel('Planche utilisée par l’animation')).toContainText('radish-attack-edited.png');
  await expect(page.getByLabel('Temps d’affichage (s)',{exact:true})).toHaveValue('0.075');
  await expect(page.getByLabel('Moment précis (s)',{exact:true})).toHaveValue('0.2');
  await page.locator('.gd-delivery > summary').click();
  await page.getByRole('button',{name:'Publier la campagne',exact:true}).click();
  await expect(page.locator('.gd-message')).toContainText('Publié');
  const published:GameProject=JSON.parse(await fs.readFile(path.join(game,'content/design/game_content.json'),'utf8'));
  expect(published.presentation).toEqual(saved.presentation);
  for(const animation of published.presentation!.animations.filter(a=>['radish','rose'].includes(a.ownerSpeciesId??'')))
   for(const ref of new Set(animation.frames.map(f=>f.asset)))
    expect(await fs.readFile(path.join(game,'LunariaArtLibrary',ref.slice('library://'.length)))).toEqual(await fs.readFile(path.join(library,ref.slice('library://'.length))));
  expect(errors).toEqual([]);expect(await fs.readFile(FILE)).toEqual(before);
 }finally{
  if(app){await app.evaluate(({BrowserWindow})=>{for(const window of BrowserWindow.getAllWindows())window.destroy();}).catch(()=>undefined);await app.close();}
  await fs.rm(temp,{recursive:true,force:true,maxRetries:10,retryDelay:200});
 }
});
