import {test, expect, _electron, type ElectronApplication, type Page} from '@playwright/test';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
let app:ElectronApplication,page:Page,dir:string,target:string;

test.beforeEach(async()=>{
 dir=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-advance-'));
 target=path.join(dir,'advance.game.json');
 const env=Object.fromEntries(Object.entries(process.env).filter((entry):entry is [string,string]=>typeof entry[1]==='string'));
 delete env.LUNARIA_DEV_URL;
 app=await _electron.launch({args:[ROOT],env:{...env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:path.join(dir,'profile')}});
 page=await app.firstWindow();
 await page.waitForURL('app://studio/index.html');
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

test('a level can author and save the five-lane advance objective',async()=>{
 await page.locator('.studio-modebar').getByRole('button',{name:/^Niveaux/}).click();
 await page.getByRole('button',{name:'Créer un premier niveau'}).click();
 await page.getByRole('button',{name:'Paramètres'}).click();
 await page.getByLabel('Objectif du niveau').selectOption('advance');
 await expect(page.getByText(/Place les plantes dans les deux premières colonnes/)).toBeVisible();
 await expect(page.getByLabel('Consigne du niveau')).toHaveValue('Conquérir les cinq allées.');
 await expect(page.getByLabel('Graines par allée capturée')).toHaveValue('0');
 await page.getByLabel('Graines par allée capturée').fill('37');
 await page.getByRole('button',{name:'Récompenses',exact:true}).click();
 await expect(page.getByLabel('Graines par allée capturée')).toHaveValue('37');
 await page.getByLabel('Graines par allée capturée').fill('53');
 await expect(page.getByText(/Le décor progresse de 20 % à chaque capture/)).toBeVisible();
 await page.locator('.studio-modebar').getByRole('button',{name:'Enregistrer le projet'}).click();
 await expect.poll(async()=>{
  try {return JSON.parse(await fs.readFile(target,'utf8')).levels[0].objective.type;} catch {return '';}
 }).toBe('advance');
 const saved=JSON.parse(await fs.readFile(target,'utf8'));
 expect(saved.levels[0].objective).toEqual({type:'advance',target:0});
 expect(saved.levels[0].laneCaptureSeedReward).toBe(53);
 await expect(page.locator('.gd-footer')).not.toContainText('Opération en cours');
 await page.getByRole('button',{name:'Fermer le message des niveaux'}).click();
 await page.getByLabel('Graines par allée capturée').scrollIntoViewIfNeeded();
 const rewardBounds=await page.getByLabel('Graines par allée capturée').boundingBox();
 const footerBounds=await page.locator('.gd-footer').boundingBox();
 expect(rewardBounds!.y+rewardBounds!.height).toBeLessThanOrEqual(footerBounds!.y);
 await expect(page.locator('.gd-sections')).toBeVisible();
 await fs.mkdir(path.join(ROOT,'work'),{recursive:true});
 await page.screenshot({path:path.join(ROOT,'work','advance-level-studio.png')});
 await page.locator('.gd-sections').getByRole('button',{name:/^Niveaux/}).click();
 await page.getByRole('button',{name:'Vagues & ennemis',exact:true}).click();
 await expect(page.getByLabel('Allée du groupe 1').getByRole('option',{name:'Aléatoire équilibré',exact:true})).toHaveCount(1);
 await expect(page.getByText(/Avec quatre allées conquises, il reste environ 20 %/)).toBeVisible();
 await expect(page.getByText('5 ennemis prévus maximum',{exact:true})).toBeVisible();
 await expect(page.getByText(/Toutes les allées sont ouvertes dans cet aperçu/)).toBeVisible();
 await page.screenshot({path:path.join(ROOT,'work','advance-random-arrivals-studio.png')});
});
