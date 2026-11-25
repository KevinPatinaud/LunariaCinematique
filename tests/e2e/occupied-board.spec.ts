import {test,expect,_electron,type ElectronApplication,type Page} from '@playwright/test';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
let app:ElectronApplication,page:Page,dir:string,target:string;
test.beforeEach(async()=>{
 dir=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-occupied-'));target=path.join(dir,'occupied.game.json');await fs.mkdir(path.join(dir,'profile'));
 await fs.writeFile(path.join(dir,'profile','settings.json'),JSON.stringify({libraryRoot:'C:/dev/Lunaria/LunariaArtLibrary'}));
 const env=Object.fromEntries(Object.entries(process.env).filter((e):e is [string,string]=>typeof e[1]==='string'));delete env.LUNARIA_DEV_URL;
 app=await _electron.launch({args:[ROOT],env:{...env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:path.join(dir,'profile')}});
 page=await app.firstWindow();await page.waitForURL('app://studio/index.html');
 await app.evaluate(({dialog,BrowserWindow},target)=>{BrowserWindow.getAllWindows()[0].setSize(1440,1080);dialog.showSaveDialog=async()=>({canceled:false,filePath:target});dialog.showOpenDialog=async()=>({canceled:false,filePaths:[target]});dialog.showMessageBox=async()=>({response:1,checkboxChecked:false});},target);
});
test.afterEach(async()=>{
 if(app){const child=app.process();try{await app.evaluate(({app})=>{setTimeout(()=>app.exit(0),0);});}catch{}await Promise.race([app.close().catch(()=>{}),new Promise<void>(resolve=>setTimeout(resolve,5000))]);if(child.exitCode===null)child.kill();}
 await fs.rm(dir,{recursive:true,force:true,maxRetries:10,retryDelay:200});
});
test('paint mixed stacks, copy, erase, duplicate waves and reopen the exact board',async()=>{
 test.setTimeout(90000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.locator('.studio-sections').getByRole('button',{name:'Campagne',exact:true}).click();await page.getByRole('button',{name:'Créer un premier niveau'}).click();
 await page.getByRole('button',{name:'Paramètres',exact:true}).click();await page.getByLabel('Objectif du niveau').selectOption('occupied_board');await page.getByRole('button',{name:'Appliquer le nouvel objectif',exact:true}).click();
 await page.getByRole('button',{name:'Vagues & ennemis'}).click();
 const editor=page.getByRole('region',{name:'Placement des ennemis'}),board=editor.getByRole('group',{name:'Plateau de la vague'}),palette=editor.getByRole('group',{name:'Ennemi à placer'});
 await expect(page.getByLabel('Début du groupe 1')).toHaveCount(0);await expect(board.getByRole('button',{name:'Allée 3, colonne 4',exact:true})).toBeDisabled();await expect(board.getByRole('button',{name:'Allée 3, colonne 5',exact:true})).toBeEnabled();
 await editor.getByRole('button',{name:'Sélectionner une case',exact:true}).click();await board.getByRole('button',{name:'Allée 1, colonne 7',exact:true}).click();await editor.getByRole('button',{name:'Vider la case',exact:true}).click();
 await palette.getByRole('button',{name:'Canette pressée',exact:true}).click();for(let i=0;i<4;i++)await board.getByRole('button',{name:'Allée 3, colonne 5',exact:true}).click();
 await palette.getByRole('button',{name:'Plaque',exact:true}).click();await board.getByRole('button',{name:'Allée 3, colonne 5',exact:true}).click();
 await expect(editor.getByLabel('Quantité de Canette pressée')).toHaveValue('4');await expect(editor.getByLabel('Quantité de Plaque',{exact:true})).toHaveValue('1');
 await editor.getByRole('button',{name:'Copier vers une case…'}).click();await board.getByRole('button',{name:'Allée 4, colonne 8',exact:true}).click();
 await palette.getByRole('button',{name:'Canette pressée',exact:true}).click();await editor.getByRole('button',{name:'Gomme −1',exact:true}).click();await board.getByRole('button',{name:'Allée 4, colonne 8',exact:true}).click();
 await expect(editor.getByLabel('Quantité de Canette pressée')).toHaveValue('3');await editor.getByLabel('Quantité de Canette pressée').fill('6');await editor.getByLabel('Quantité de Canette pressée').press('Tab');
 await page.getByRole('button',{name:'Dupliquer la vague',exact:true}).click();await editor.getByRole('button',{name:'Sélectionner une case',exact:true}).click();await board.getByRole('button',{name:'Allée 4, colonne 8',exact:true}).click();await editor.getByRole('button',{name:'Vider la case',exact:true}).click();
 await page.locator('.studio-modebar').getByRole('button',{name:'Enregistrer le projet'}).click();
 await expect.poll(async()=>{try{return JSON.parse(await fs.readFile(target,'utf8')).levels[0].waves.map((w:any)=>w.groups.reduce((n:number,g:any)=>n+g.count,0));}catch{return [];}}).toEqual([12,5]);
 const saved=JSON.parse(await fs.readFile(target,'utf8'));expect(saved.levels[0].waves[0].groups.filter((g:any)=>g.placement.colMin===4).map((g:any)=>[g.enemyId,g.count])).toEqual([['runner',4],['plaque',1]]);
 await expect(page.locator('.gd-footer')).not.toContainText('Opération en cours');await page.getByRole('button',{name:'Fermer le message des niveaux'}).click();
 await page.getByRole('button',{name:'Actions du fichier projet'}).click();await page.getByRole('button',{name:'Ouvrir un projet…',exact:true}).click();await expect(page.locator('.gd-message')).toContainText('Projet ouvert.');await page.getByRole('button',{name:'Fermer le message des niveaux'}).click();
 await page.locator('.studio-sections').getByRole('button',{name:/^Niveaux/}).click();await page.getByRole('button',{name:'Vagues & ennemis'}).click();
 await expect(page.getByRole('tab',{name:'Vague 1 12 ennemis'})).toBeVisible();await expect(page.getByRole('tab',{name:'Vague 2 5 ennemis'})).toBeVisible();
 await editor.getByRole('button',{name:'Sélectionner une case',exact:true}).click();await board.getByRole('button',{name:'Allée 3, colonne 5',exact:true}).click();await expect(editor.getByLabel('Quantité de Canette pressée')).toHaveValue('4');
 await fs.mkdir(path.join(ROOT,'work','occupied-board'),{recursive:true});await editor.screenshot({path:path.join(ROOT,'work','occupied-board','studio.png')});await board.screenshot({path:path.join(ROOT,'work','occupied-board','studio-board.png')});
 await app.evaluate(({BrowserWindow})=>{BrowserWindow.getAllWindows()[0].setSize(1000,800);});await expect(board).toBeVisible();await board.screenshot({path:path.join(ROOT,'work','occupied-board','studio-compact.png')});
 expect(errors).toEqual([]);
});
