import {test,expect,_electron,type ElectronApplication} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const FILE='C:/dev/Lunaria/HISTOIRE DE LUNARIA/Cinematiques studio/lunaria.game.json';

test('allied walk previews alternate, expose step controls and survive save/reopen',async({},info)=>{
 test.setTimeout(120000);
 const before=await fs.readFile(FILE);
 const temp=await fs.mkdtemp(path.join(ROOT,'work','ally-walk-'));
 const profile=path.join(temp,'profile'),target=path.join(temp,'escort.game.json');
 let app:ElectronApplication|undefined;
 const errors:string[]=[];
 try{
  await fs.mkdir(profile);await fs.writeFile(target,before);
  await fs.writeFile(path.join(profile,'settings.json'),JSON.stringify({libraryRoot:'C:/dev/Lunaria/LunariaArtLibrary'}));
  await fs.writeFile(path.join(profile,'game-recents.json'),JSON.stringify([{path:target,title:'Escorte',updatedAt:new Date().toISOString()}]));
  const env=Object.fromEntries(Object.entries(process.env).filter((e):e is [string,string]=>typeof e[1]==='string'));delete env.LUNARIA_DEV_URL;
  app=await _electron.launch({args:[ROOT],env:{...env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:profile}});
  const page=await app.firstWindow();page.on('pageerror',e=>errors.push(e.message));
  await page.waitForURL('app://studio/index.html');
  await expect(page.locator('.studio-project-state')).toContainText('escort.game.json');
  await app.evaluate(({dialog},file)=>{
   dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]});
   dialog.showSaveDialog=async()=>({canceled:false,filePath:file});
  },target);
  async function select(name:string){
   await page.locator('.studio-modebar').getByRole('button',{name:'Niveaux',exact:true}).click();
   await page.locator('.gd-sections').getByRole('button',{name:/^Plantes/}).click();
   await page.locator('.gd-catalog').getByRole('button',{name:new RegExp('^'+name)}).click();
   await page.getByRole('button',{name:'Animations et sons de '+name,exact:true}).click();
   await page.getByRole('button',{name:/^Ses animations \(/}).click();
   await page.locator('.lp-owned-list').getByRole('button',{name:new RegExp('^'+name+' — marche alternée')}).click();
  }
  for(const name of ['Radis','Rose','Noisetier']){
   await select(name);
   await expect(page.getByLabel('Mouvement',{exact:true})).toHaveValue('walk');
   const mesh=page.locator('.lp-owned-editor [data-walk-rig]');
   await expect(mesh).toHaveCount(1);
   const seek=page.locator('.lp-owned-editor').getByLabel('Curseur temporel de l’animation');
   await seek.fill('0');
   const first=await mesh.locator('[data-walk-triangle]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('transform')).join('|'));
   await seek.fill('0.6');
   expect(await mesh.locator('[data-walk-triangle]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('transform')).join('|'))).not.toEqual(first);
   await page.locator('.lp-owned-editor .lp-preview').getByLabel('Ancrages',{exact:true}).uncheck();
   await page.locator('.lp-owned-editor').screenshot({path:info.outputPath(name.toLowerCase()+'-walk-studio.png')});
  }
  await page.getByText('Profils, actions spéciales et image de repos',{exact:true}).click();
  await page.getByText('Image de repos et dimensions',{exact:true}).click();
  await page.locator('summary').filter({hasText:/^Marche articulée$/}).click();
  const stride=page.getByLabel('Longueur du pas',{exact:true});
  await stride.fill('21');await stride.blur();
  await page.locator('.studio-modebar').getByRole('button',{name:'Enregistrer le projet',exact:true}).click();
  await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
  const saved=JSON.parse(await fs.readFile(target,'utf8'));
  expect(saved.balance.plants.find((p:{id:string})=>p.id==='hazel').visual.walkRig.stride).toBe(21);
  await page.getByRole('button',{name:'Actions du fichier projet'}).click();
  await page.getByRole('button',{name:'Ouvrir un projet…',exact:true}).click();
  await select('Noisetier');
  await expect(page.locator('.lp-owned-editor [data-walk-rig]')).toHaveCount(1);
  expect(errors).toEqual([]);expect(await fs.readFile(FILE)).toEqual(before);
 }finally{
  if(app){await app.evaluate(({BrowserWindow})=>{for(const w of BrowserWindow.getAllWindows())w.destroy();}).catch(()=>undefined);await app.close();}
  const resolved=await fs.realpath(temp),parent=await fs.realpath(path.join(ROOT,'work'));
  if(!resolved.startsWith(parent+path.sep))throw new Error('Unexpected test cleanup path');
  await fs.rm(resolved,{recursive:true,force:true});
 }
});
