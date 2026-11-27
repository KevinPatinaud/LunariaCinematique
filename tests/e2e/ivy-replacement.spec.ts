import {test,expect,_electron,type ElectronApplication} from '@playwright/test';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT=path.resolve('.');
const AUTHOR='C:/dev/Lunaria/HISTOIRE DE LUNARIA/Cinematiques studio/lunaria.game.json';

test('the actual campaign opens all four replaced films and one ivy with its owned art',async({},info)=>{
 test.setTimeout(90000);
 const before=await fs.readFile(AUTHOR),dir=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-ivy-replacement-'));
 const file=path.join(dir,'campaign.game.json'),profile=path.join(dir,'profile');
 let app:ElectronApplication|undefined;
 const errors:string[]=[];
 try{
  await fs.writeFile(file,before);await fs.mkdir(profile);
  await fs.writeFile(path.join(profile,'settings.json'),JSON.stringify({libraryRoot:'C:/dev/Lunaria/LunariaArtLibrary'}));
  const env={...process.env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:profile};delete env.LUNARIA_DEV_URL;
  app=await _electron.launch({args:[ROOT],env:env as Record<string,string>});
  const page=await app.firstWindow();page.on('pageerror',e=>errors.push(e.message));
  await page.waitForURL('app://studio/index.html');
  await app.evaluate(({dialog},file)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]});},file);
  await page.locator('.studio-sections').getByRole('button',{name:'Campagne',exact:true}).click();
  await page.getByRole('button',{name:'Actions du fichier projet',exact:true}).click();
  await page.getByRole('button',{name:'Ouvrir un projet…',exact:true}).click();
  await expect(page.locator('.gd-message')).toContainText('Projet ouvert.');
  await page.locator('.gd-message button').click();
  for(const title of ['08 - Un guide dans les ruines','09 - Les souvenirs de Lierre','10 - Le marché oublié','11 - La nurserie']){
   await page.getByRole('button',{name:`Modifier « ${title} »`,exact:true}).click();
   await expect(page.getByLabel('Titre de la cinématique',{exact:true})).toHaveValue(title);
   await page.screenshot({path:info.outputPath(title.slice(0,2)+'-studio.png')});
   await page.locator('.studio-sections').getByRole('button',{name:'Campagne',exact:true}).click();
  }
  await page.locator('.studio-sections').getByRole('button',{name:/^Plantes/}).click();
  const plants=page.getByRole('complementary',{name:'Catalogue des plantes'});
  await expect(plants.getByRole('button',{name:/^Lierre/})).toHaveCount(1);
  await expect(plants.getByRole('button',{name:/^Fougère/})).toHaveCount(0);
  await plants.getByRole('button',{name:/^Lierre/}).click();
  await page.getByRole('button',{name:'Animations et sons de Lierre',exact:true}).click();
  await page.getByRole('button',{name:/^Ses animations \(/}).click();
  await expect(page.locator('.lp-owned-list').getByRole('button')).toHaveCount(4);
  await page.locator('.lp-owned-list').getByRole('button',{name:/^Lierre — lancement de liane/}).click();
  await expect(page.getByLabel('Images de l’animation').getByRole('button')).toHaveCount(3);
  await page.getByLabel('Curseur temporel de l’animation').fill('0.18');
  await page.locator('.lp-owned-editor .lp-preview').screenshot({path:info.outputPath('lierre-attaque-studio.png')});
  expect(errors).toEqual([]);expect(await fs.readFile(AUTHOR)).toEqual(before);
 }finally{
  if(app){await app.evaluate(({BrowserWindow})=>{for(const w of BrowserWindow.getAllWindows())w.destroy();}).catch(()=>undefined);await app.close();}
  if(!path.resolve(dir).startsWith(path.resolve(os.tmpdir())+path.sep))throw Error('Unexpected temporary directory');
  await fs.rm(dir,{recursive:true,force:true,maxRetries:10,retryDelay:150});
 }
});
