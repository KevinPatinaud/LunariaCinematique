import {test,expect,_electron,type ElectronApplication,type Page} from '@playwright/test';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
let app:ElectronApplication,page:Page,dir:string,target:string;
test.beforeEach(async()=>{
 dir=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-escort-'));target=path.join(dir,'escort.game.json');
 await fs.mkdir(path.join(dir,'profile'));
 await fs.writeFile(path.join(dir,'profile','settings.json'),JSON.stringify({libraryRoot:'C:/dev/Lunaria/LunariaArtLibrary'}));
 const env=Object.fromEntries(Object.entries(process.env).filter((entry):entry is [string,string]=>typeof entry[1]==='string'));delete env.LUNARIA_DEV_URL;
 app=await _electron.launch({args:[ROOT],env:{...env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:path.join(dir,'profile')}});
 page=await app.firstWindow();await page.waitForURL('app://studio/index.html');
 await app.evaluate(({dialog,BrowserWindow},target)=>{
  BrowserWindow.getAllWindows()[0].setSize(1400,1050);
  dialog.showSaveDialog=async()=>({canceled:false,filePath:target});
  dialog.showOpenDialog=async()=>({canceled:false,filePaths:[target]});
  dialog.showMessageBox=async()=>({response:1,checkboxChecked:false});
 },target);
});
test.afterEach(async()=>{
 if(app){const child=app.process();try{await app.evaluate(({app})=>{setTimeout(()=>app.exit(0),0);});}catch{}
  await Promise.race([app.close().catch(()=>{}),new Promise<void>(resolve=>setTimeout(resolve,5000))]);if(child.exitCode===null)child.kill();}
 await fs.rm(dir,{recursive:true,force:true,maxRetries:10,retryDelay:200});
});
test('author, save and reopen multiple escorted sprouts on chosen lanes',async()=>{
 await page.locator('.studio-modebar').getByRole('button',{name:/^Niveaux/}).click();
 await page.getByRole('button',{name:'Créer un premier niveau'}).click();
 await page.getByRole('button',{name:'Paramètres',exact:true}).click();
 await page.getByLabel('Objectif du niveau').selectOption('escort');
 const editor=page.getByRole('region',{name:'Jeunes pousses à escorter'});
 await expect(page.getByLabel('Consigne du niveau')).toHaveValue('Conquérir les cinq allées et escorter toutes les pousses à droite.');
 await expect(editor.getByRole('status')).toContainText('1 pousse à escorter');
 await expect(editor.getByRole('img',{name:'Sprite végétal Lunaria en marche',exact:true})).toBeVisible();
 for(const [row,value] of [[1,'2'],[5,'2']] as const){await page.getByLabel(`Allée ${row} — pousses`).fill(value);await page.getByLabel(`Allée ${row} — pousses`).press('Tab');}
 await expect(editor.getByRole('status')).toContainText('5 pousses à escorter');
 for(const [label,value] of [['Points de vie de chaque pousse','175'],['Vitesse des pousses (cases par seconde)','0,09'],['Intervalle entre deux départs sur la même allée (secondes)','12']] as const){await page.getByLabel(label).fill(value);await page.getByLabel(label).press('Tab');}
 await page.getByLabel('Graines par allée capturée').fill('37');await page.getByLabel('Graines par allée capturée').press('Tab');
 await page.locator('.studio-modebar').getByRole('button',{name:'Enregistrer le projet'}).click();
 await expect.poll(async()=>{try{return JSON.parse(await fs.readFile(target,'utf8')).levels[0].escort.laneCounts;}catch{return [];}}).toEqual([2,0,1,0,2]);
 const saved=JSON.parse(await fs.readFile(target,'utf8'));expect(saved.levels[0].escort).toMatchObject({speed:0.09,maxHp:175,departureInterval:12});expect(saved.levels[0].laneCaptureSeedReward).toBe(37);
 await expect(page.locator('.gd-footer')).not.toContainText('Opération en cours');
 await page.getByRole('button',{name:'Fermer le message des niveaux'}).click();
 await page.getByRole('button',{name:'Ouvrir',exact:true}).click();
 await expect(page.getByText('Projet ouvert.',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Fermer le message des niveaux'}).click();
 await page.locator('.gd-sections').getByRole('button',{name:/^Niveaux/}).click();
 await page.getByRole('button',{name:'Paramètres',exact:true}).click();
 await expect(page.getByLabel('Objectif du niveau')).toHaveValue('escort');
 await expect(page.getByLabel('Allée 5 — pousses')).toHaveValue('2');
 await expect(page.getByLabel('Vitesse des pousses (cases par seconde)')).toHaveValue('0.09');
 await fs.mkdir(path.join(ROOT,'work'),{recursive:true});
 await editor.screenshot({path:path.join(ROOT,'work','escort-studio.png')});
 await page.getByLabel('Objectif du niveau').selectOption('advance');
 await expect(editor).toHaveCount(0);
 await page.locator('.studio-modebar').getByRole('button',{name:'Enregistrer le projet'}).click();
 await expect.poll(async()=>JSON.parse(await fs.readFile(target,'utf8')).levels[0].escort).toBeUndefined();
});
