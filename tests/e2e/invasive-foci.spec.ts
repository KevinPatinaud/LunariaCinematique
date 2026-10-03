import {test, expect, _electron, type ElectronApplication, type Page} from '@playwright/test';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
let app:ElectronApplication,page:Page,dir:string,target:string;

test.beforeEach(async()=>{
 dir=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-foci-'));
 target=path.join(dir,'foci.game.json');
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
 if(app)await app.close();
 await fs.rm(dir,{recursive:true,force:true,maxRetries:10,retryDelay:200});
});

test('a level authors and saves positioned invasive foci and timed reinforcements',async()=>{
 await page.locator('.studio-modebar').getByRole('button',{name:/^Niveaux/}).click();
 await page.getByRole('button',{name:'Créer un premier niveau'}).click();
 await page.getByRole('button',{name:'Paramètres'}).click();
 await page.getByLabel('Objectif du niveau').selectOption('invasive_foci');
 const editor=page.getByRole('region',{name:'Foyers invasifs'});
 await expect(editor).toBeVisible();
 await expect(editor).toContainText('toutes les 30 secondes');
 await expect(editor.getByLabel('Intervalle des renforts (secondes)')).toHaveValue('30');
 await expect(page.getByLabel('Consigne du niveau')).toHaveValue('Détruire tous les foyers invasifs et leurs derniers renforts.');
 await editor.getByRole('button',{name:'Allée 1, colonne 7'}).click();
 await editor.getByRole('button',{name:'+ Foyer'}).click();
 await editor.getByLabel('Ennemi envoyé en renfort').selectOption('runner');
 await editor.getByLabel('Intervalle des renforts (secondes)').fill('7.5');
 await page.locator('.studio-modebar').getByRole('button',{name:'Enregistrer le projet'}).click();
 await expect.poll(async()=>{
  try {return JSON.parse(await fs.readFile(target,'utf8')).levels[0].invasiveFoci?.positions.length;} catch {return 0;}
 }).toBe(3);
 const saved=JSON.parse(await fs.readFile(target,'utf8'));
 expect(saved.levels[0].objective).toEqual({type:'invasive_foci',target:0});
 expect(saved.levels[0].invasiveFoci).toEqual({positions:[{row:0,col:6},{row:3,col:5},{row:2,col:5}],reinforcementEnemyId:'runner',interval:7.5});
 await expect(page.locator('.gd-footer')).not.toContainText('erreur(s)');
 await page.getByRole('button',{name:'Fermer le message des niveaux'}).click();
 await fs.mkdir(path.join(ROOT,'work'),{recursive:true});
 await editor.screenshot({path:path.join(ROOT,'work','invasive-foci-studio.png')});
});
