import {test,expect,_electron,type ElectronApplication,type Page} from '@playwright/test';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
let app:ElectronApplication,page:Page,dir:string,target:string;
test.beforeEach(async()=>{
 dir=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-rewards-ui-'));
 target=path.join(dir,'rewards.game.json');
 const env=Object.fromEntries(Object.entries(process.env).filter((entry):entry is [string,string]=>typeof entry[1]==='string'));
 delete env.LUNARIA_DEV_URL;
 app=await _electron.launch({args:[ROOT],env:{...env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:path.join(dir,'profile')}});
 page=await app.firstWindow();await page.waitForURL('app://studio/index.html');
 await app.evaluate(({dialog},destination)=>{
  dialog.showSaveDialog=async()=>({canceled:false,filePath:destination});
  dialog.showMessageBox=async()=>({response:1,checkboxChecked:false});
 },target);
});
test.afterEach(async()=>{
 if(app){
  const child=app.process();
  try{await app.evaluate(({app})=>{setTimeout(()=>app.exit(0),0);});}catch{}
  await Promise.race([app.close().catch(()=>{}),new Promise<void>(resolve=>setTimeout(resolve,5000))]);
  if(child.exitCode===null)child.kill();
 }
 await fs.rm(dir,{recursive:true,force:true,maxRetries:10,retryDelay:200});
});

test('Seed rewards are configured in levels without a separate rewards page or combo bonuses',async()=>{
 await page.locator('.studio-sections').getByRole('button',{name:'Campagne',exact:true}).click();
 await page.getByRole('button',{name:'Créer un premier niveau'}).click();
 await page.locator('.studio-sections').getByRole('button',{name:/^Niveaux/}).click();
 await expect(page.locator('.studio-sections').getByRole('button',{name:'Récompenses',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Comparer les graines',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Graines des niveaux'})).toBeVisible();
 await expect(page.getByLabel('Activer le bonus de combo')).toHaveCount(0);
 await page.getByRole('table').getByRole('button',{name:/^Modifier les vagues/}).first().click();
 await page.getByLabel('Graines pour la vague éliminée').fill('73');
 await page.getByLabel('Graines pour la vague éliminée').press('Tab');
 await page.getByRole('button',{name:'Comparer les graines',exact:true}).click();
 await expect(page.getByRole('table')).toContainText('73');
 await page.locator('.studio-modebar').getByRole('button',{name:'Enregistrer le projet'}).click();
 await expect.poll(async()=>{try{return JSON.parse(await fs.readFile(target,'utf8')).levels[0].waves[0].seedReward;}catch{return null;}}).toBe(73);
 expect(JSON.parse(await fs.readFile(target,'utf8')).rewards).toBeUndefined();
 await page.setViewportSize({width:1280,height:900});
 await fs.mkdir(path.join(ROOT,'work/simplification-v2'),{recursive:true});
 await page.screenshot({path:path.join(ROOT,'work/simplification-v2/graines.png')});
 await page.getByRole('button',{name:'← Fiches des niveaux',exact:true}).click();
 await page.getByRole('button',{name:'Paramètres',exact:true}).click();
 await expect(page.getByLabel('Objectif du niveau').locator('option[value="operation"],option[value="rescue"]')).toHaveCount(0);
 await page.getByRole('button',{name:'Événements',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Dialogue pendant la mission'})).toHaveCount(0);
});

test('Character sheets group character tools and keep templates under advanced controls',async()=>{
 const main=page.getByRole('navigation',{name:'Navigation du Studio'});
 await expect(main.getByRole('button',{name:/Modèles|Bibliothèque|Comportements|Récompenses/})).toHaveCount(0);
 await main.getByRole('button',{name:/^Plantes/}).click();
 const sheet=page.getByRole('navigation',{name:'Fiche de Radis'});
 for(const tab of ['Capacités','Comportement','Animations et sons de Radis','Caractéristiques']){
  await sheet.getByRole('button',{name:tab,exact:true}).click();
  await expect(sheet.getByRole('button',{name:tab,exact:true})).toHaveClass(/active/);
 }
 await sheet.getByRole('button',{name:'Capacités',exact:true}).click();
 await page.getByLabel('Nom de la capacité',{exact:true}).fill('Graine du voyage');
 await page.getByLabel('Nom de la capacité',{exact:true}).press('Tab');
 await sheet.getByRole('button',{name:'Comportement',exact:true}).click();
 await sheet.getByRole('button',{name:'Capacités',exact:true}).click();
 await expect(page.getByLabel('Nom de la capacité',{exact:true})).toHaveValue('Graine du voyage');
 await page.setViewportSize({width:1280,height:900});
 await fs.mkdir(path.join(ROOT,'work/simplification-v2'),{recursive:true});
 await page.screenshot({path:path.join(ROOT,'work/simplification-v2/personnage.png')});
 await expect(page.locator('.studio-more-trigger')).toHaveAttribute('aria-expanded','false');
 await page.locator('.studio-more-trigger').click();
 for(const name of ['Modèles de capacités','Modèles de comportements','Profils avancés'])await expect(page.getByRole('button',{name:new RegExp('^'+name)})).toBeVisible();
 await page.getByRole('button',{name:/^Modèles de capacités/}).click();
 await expect(page.locator('.gd-advanced-context')).toBeVisible();
 await page.setViewportSize({width:980,height:820});
 await page.screenshot({path:path.join(ROOT,'work/simplification-v2/options-avancees.png')});
});
