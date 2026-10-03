import {test,expect,_electron,type ElectronApplication} from '@playwright/test';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const FILE='C:/dev/Lunaria/HISTOIRE DE LUNARIA/Cinematiques studio/lunaria.game.json';
test('actual Plaque and Canette project loads drawn attacks without missing art or file mutation',async({},info)=>{
 const before=await fs.readFile(FILE),temp=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-polluters-e2e-')),profile=path.join(temp,'profile');
 let app:ElectronApplication|undefined;
 try{
  await fs.mkdir(profile);await fs.writeFile(path.join(profile,'settings.json'),JSON.stringify({libraryRoot:'C:/dev/Lunaria/LunariaArtLibrary'}));
  const env=Object.fromEntries(Object.entries(process.env).filter((entry):entry is [string,string]=>typeof entry[1]==='string'));delete env.LUNARIA_DEV_URL;
  app=await _electron.launch({args:[ROOT],env:{...env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:profile}});
  const page=await app.firstWindow();await page.waitForURL('app://studio/index.html');
  await app.evaluate(({dialog},file)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]});},FILE);
  await page.locator('.studio-modebar').getByRole('button',{name:/^Niveaux/}).click();
  await page.locator('.gd-toolbar').getByRole('button',{name:'Ouvrir',exact:true}).click();
  await expect(page.locator('.gd-message')).toContainText('Projet ouvert.');
  await page.locator('.gd-message button').click();
  await page.locator('.gd-sections').getByRole('button',{name:/^Ennemis/}).click();
  for(const [name,attack,time,key,count]of [['Plaque','Plaque — crachat','0.28','plaque',6],['Canette pressée','Canette pressée — coup de pince','0.15','canette',6]] as const){
   await page.getByRole('complementary',{name:'Catalogue des ennemis'}).getByRole('button',{name:new RegExp('^'+name)}).click();
   const art=page.getByRole('region',{name:'Image principale de '+name}).getByRole('img',{name:(key==='plaque'?'Plaque':'Canette')+' combat · v1',exact:true});
   await expect(art).toBeVisible();await expect(art.locator('svg image')).toHaveAttribute('width','1254');
   await page.getByRole('button',{name:'Animations de '+name,exact:true}).click();
   await expect(page.locator('.lp-owned-list').getByRole('button')).toHaveCount(count);
   await page.locator('.lp-owned-list').getByRole('button',{name:new RegExp('^'+attack)}).click();
   await expect(page.getByLabel('Style de l’animation')).toHaveValue('frames');
   await expect(page.getByLabel('Images de l’animation').getByRole('button')).toHaveCount(8);
   await page.getByLabel('Curseur temporel de l’animation').fill(time);
   await expect(page.locator('.lp-owned-editor .lp-preview svg image').first()).toHaveAttribute('width','1536');
   await page.locator('.lp-owned-editor .lp-preview').getByLabel('Ancrages',{exact:true}).uncheck();
   await page.locator('.lp-owned-editor .lp-preview').screenshot({path:info.outputPath(key+'-studio-preview.png')});
   await page.getByLabel('Images de l’animation').screenshot({path:info.outputPath(key+'-studio-eight-frames.png')});
   await page.getByRole('button',{name:'Caractéristiques et attaques',exact:true}).click();
  }
  expect(await fs.readFile(FILE)).toEqual(before);
 }finally{
  if(app){await app.evaluate(({BrowserWindow})=>{for(const window of BrowserWindow.getAllWindows())window.destroy();}).catch(()=>undefined);await app.close();}
  await fs.rm(temp,{recursive:true,force:true});
 }
});
