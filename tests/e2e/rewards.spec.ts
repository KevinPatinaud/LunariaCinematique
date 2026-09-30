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

test('combo and wave seed rewards can be configured and saved in Studio',async()=>{
 await page.locator('.studio-modebar').getByRole('button',{name:/^Niveaux/}).click();
 await page.getByRole('button',{name:'Créer un premier niveau'}).click();
 await page.getByRole('button',{name:'Récompenses',exact:true}).click();
 const toggle=page.getByLabel('Activer le bonus de combo');
 await expect(toggle).not.toBeChecked();
 await page.getByLabel('Graines supplémentaires par palier').fill('2');
 await page.getByLabel('Bonus de combo maximal (graines)').fill('5');
 await page.getByLabel('Vague 1 — graines',{exact:true}).fill('73');
 await toggle.check();
 await expect(page.getByText('Graines ajoutées : 3e élimination +2, 4e +4, 5e +5. Plafond : +5.',{exact:true})).toBeVisible();
 await page.locator('.studio-modebar').getByRole('button',{name:'Enregistrer le projet'}).click();
 await expect.poll(async()=>{
  try {return JSON.parse(await fs.readFile(target,'utf8')).rewards;} catch {return null;}
 }).toEqual({combo:{enabled:true,seedsPerStep:2,maxSeeds:5}});
 expect(JSON.parse(await fs.readFile(target,'utf8')).levels[0].waves[0].seedReward).toBe(73);
 await page.locator('.gd-sections').getByRole('button',{name:/^Niveaux/}).click();
 await page.getByRole('button',{name:'Vagues & ennemis'}).click();
 await expect(page.getByLabel('Graines pour la vague éliminée')).toHaveValue('73');
 await page.getByRole('button',{name:'Récompenses',exact:true}).click();
 await expect(toggle).toBeChecked();
 await toggle.uncheck();
 await page.locator('.studio-modebar').getByRole('button',{name:'Enregistrer le projet'}).click();
 await expect.poll(async()=>JSON.parse(await fs.readFile(target,'utf8')).rewards.combo.enabled).toBe(false);
 await page.getByRole('button',{name:'Fermer le message des niveaux'}).click();
 await page.setViewportSize({width:1440,height:1200});
 await fs.mkdir(path.join(ROOT,'work'),{recursive:true});
 await page.screenshot({path:path.join(ROOT,'work','rewards-studio.png')});
});
