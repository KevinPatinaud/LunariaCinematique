import {test,expect,_electron,type ElectronApplication} from '@playwright/test';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const FILE='C:/dev/Lunaria/HISTOIRE DE LUNARIA/Cinematiques studio/lunaria.game.json';
test('Poubelle: les quatre animations du projet réel se prévisualisent et restent après réouverture',async({},info)=>{
 const before=await fs.readFile(FILE),temp=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-poubelle-art-')),profile=path.join(temp,'profile'),target=path.join(temp,'poubelle.game.json');
 let app:ElectronApplication|undefined;
 try{
  await fs.mkdir(profile);await fs.writeFile(target,before);await fs.writeFile(path.join(profile,'settings.json'),JSON.stringify({libraryRoot:'C:/dev/Lunaria/LunariaArtLibrary'}));
  const env=Object.fromEntries(Object.entries(process.env).filter((entry):entry is [string,string]=>typeof entry[1]==='string'));delete env.LUNARIA_DEV_URL;
  app=await _electron.launch({args:[ROOT],env:{...env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:profile}});
  const page=await app.firstWindow();await page.waitForURL('app://studio/index.html');
  await app.evaluate(({dialog},file)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]});},target);
  await page.locator('.studio-modebar').getByRole('button',{name:/^Niveaux/}).click();
  await page.getByRole('button',{name:'Actions du fichier projet'}).click();await page.getByRole('button',{name:'Ouvrir un projet…',exact:true}).click();
  await expect(page.locator('.gd-message')).toContainText('Projet ouvert.');
  await page.locator('.gd-message button').click();
  async function selectBin(){
   await page.locator('.gd-sections').getByRole('button',{name:/^Ennemis/}).click();
   await page.getByRole('complementary',{name:'Catalogue des ennemis'}).getByRole('button',{name:/^Poubelle/}).click();
   await page.getByRole('button',{name:'Animations et sons de Poubelle',exact:true}).click();
   await page.getByRole('button',{name:/^Ses animations \(/}).click();
   await expect(page.locator('.lp-owned-list').getByRole('button')).toHaveCount(4);
  }
  await selectBin();
  for(const action of ['veille et clignement','ouverture du couvercle','choc sur le métal','écrasement']){
   await page.locator('.lp-owned-list').getByRole('button',{name:new RegExp('^Poubelle — '+action)}).click();
   await expect(page.getByLabel('Style de l’animation')).toHaveValue('frames');
   await expect(page.getByLabel('Images de l’animation').getByRole('button')).toHaveCount(4);
   await page.getByLabel('Curseur temporel de l’animation').fill('0.2');
   await expect(page.locator('.lp-owned-editor .lp-preview svg image').first()).toHaveAttribute('width','1254');
  }
  await page.locator('.lp-owned-editor .lp-preview').getByLabel('Ancrages',{exact:true}).uncheck();
  await page.locator('.lp-owned-editor').screenshot({path:info.outputPath('poubelle-studio-animations.png')});
  await page.locator('.studio-modebar').getByRole('button',{name:'Enregistrer le projet'}).click();
  await expect(page.locator('.gd-message')).toContainText('enregistrés');
  const saved=JSON.parse(await fs.readFile(target,'utf8'));
  expect(saved.balance.enemies.find((e:{id:string})=>e.id==='poubelle').animationProfileId).toBe('profile_poubelle');
  expect(saved.presentation.animations.filter((a:{ownerSpeciesId:string})=>a.ownerSpeciesId==='poubelle')).toHaveLength(4);
  await page.getByRole('button',{name:'Actions du fichier projet'}).click();await page.getByRole('button',{name:'Ouvrir un projet…',exact:true}).click();
  await expect(page.locator('.gd-message')).toContainText('Projet ouvert.');
  await page.locator('.gd-message button').click();await selectBin();
  expect(await fs.readFile(FILE)).toEqual(before);
 }finally{
  if(app){await app.evaluate(({BrowserWindow})=>{for(const window of BrowserWindow.getAllWindows())window.destroy();}).catch(()=>undefined);await app.close();}
  await fs.rm(temp,{recursive:true,force:true});
 }
});
