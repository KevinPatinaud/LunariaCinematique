import {test,expect,_electron,type ElectronApplication,type Page} from '@playwright/test';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
test('levels and complete films save and reopen in one JSON',async()=>{
 test.setTimeout(120000);
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-unified-e2e-'));
 const file=path.join(dir,'lunaria.game.json'),profile=path.join(dir,'profile');
 let app:ElectronApplication|undefined;
 try{
  await fs.mkdir(profile);
  const env:NodeJS.ProcessEnv={...process.env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:profile};delete env.LUNARIA_DEV_URL;
  app=await _electron.launch({args:[ROOT],env:env as Record<string,string>});
  let page:Page=await app.firstWindow();await page.waitForURL('app://studio/index.html');
  await app.evaluate(({dialog},target)=>{
   dialog.showSaveDialog=async()=>({canceled:false,filePath:target});
   dialog.showOpenDialog=async()=>({canceled:false,filePaths:[target]});
   dialog.showMessageBox=async()=>({response:1,checkboxChecked:false});
  },file);
  await page.locator('.studio-modebar').getByRole('button',{name:/^Niveaux/}).click();
  await expect(page.getByRole('button',{name:'Enregistrer le projet'})).toHaveCount(1);
  await expect(page.getByRole('button',{name:'Enregistrer sous',exact:true})).toHaveCount(0);
  await page.locator('.gd-sections').getByRole('button',{name:/^Niveaux/}).click();
  await expect(page.getByRole('heading',{name:'Aucun niveau'})).toBeVisible();
  await page.getByRole('button',{name:'+ Créer un niveau'}).first().click();
  await page.getByLabel('Continent du niveau').selectOption('2');
  await page.locator('.studio-modebar').getByRole('button',{name:/^Cinématiques/}).click();
  await expect(page.getByRole('button',{name:'Enregistrer le projet'})).toHaveCount(1);
  await page.getByRole('button',{name:'Nouvelle cinématique'}).click();
  await page.getByLabel('Titre de la cinématique').fill('Film dans le projet');
  await page.getByLabel('Titre de la cinématique').press('Tab');
  await page.getByRole('button',{name:'Enregistrer le projet'}).click();
  await expect.poll(async()=>{try{return JSON.parse(await fs.readFile(file,'utf8')).cinematics?.[0]?.title;}catch{return ''}}).toBe('Film dans le projet');
  await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
  const saved=JSON.parse(await fs.readFile(file,'utf8'));
  expect(saved.levels).toHaveLength(1);expect(saved.levels[0].act).toBe(2);
  expect(saved.campaign.steps.filter((step:{kind:string})=>step.kind==='level')).toHaveLength(1);
  expect(saved.cinematics).toHaveLength(1);expect(saved.cinematics[0].shots.length).toBeGreaterThan(0);
  await page.getByRole('button',{name:'Ouvrir le projet'}).click();
  await expect(page.getByLabel('Titre de la cinématique')).toHaveValue('Film dans le projet');
  await page.locator('.studio-modebar').getByRole('button',{name:/^Niveaux/}).click();
  await page.locator('.gd-sections').getByRole('button',{name:/^Niveaux/}).click();
  await expect(page.locator('.gd-level-items button')).toHaveCount(1);
  await page.locator('.studio-modebar').getByRole('button',{name:/^Cinématiques/}).click();
  await expect(page.getByLabel('Cinématique du projet')).toHaveCount(0);
  for(const width of [1462,1280,1000]){
   await page.setViewportSize({width,height:800});
   const layout=await page.evaluate(()=>{
    const bar=document.querySelector('.topbar')!.getBoundingClientRect();
    const heading=document.querySelector('.project-heading')!.getBoundingClientRect();
    const actions=document.querySelector('.top-actions')!.getBoundingClientRect();
    const save=document.querySelector('.studio-modebar .studio-save')!.getBoundingClientRect();
    return {barBottom:bar.bottom,headingBottom:heading.bottom,actionsBottom:actions.bottom,actionsRight:actions.right,saveRight:save.right,viewport:innerWidth};
   });
   expect(layout.headingBottom).toBeLessThanOrEqual(layout.barBottom+1);
   expect(layout.actionsBottom).toBeLessThanOrEqual(layout.barBottom+1);
   expect(layout.actionsRight).toBeLessThanOrEqual(layout.viewport+1);
   expect(layout.saveRight).toBeLessThanOrEqual(layout.viewport+1);
  }
  await page.setViewportSize({width:1462,height:800});
  await page.getByRole('button',{name:'Nouvelle cinématique'}).click();
  await expect(page.getByLabel('Cinématique du projet')).toBeVisible();
  expect((await page.getByLabel('Cinématique du projet').boundingBox())!.width).toBeLessThanOrEqual(150);
  await page.getByRole('button',{name:'Enregistrer le projet'}).click();
  await expect.poll(async()=>JSON.parse(await fs.readFile(file,'utf8')).cinematics.length).toBe(2);
  await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
  expect(new Set(JSON.parse(await fs.readFile(file,'utf8')).cinematics.map((film:{id:string})=>film.id)).size).toBe(2);
  await app.close();app=undefined;
  app=await _electron.launch({args:[ROOT],env:env as Record<string,string>});
  page=await app.firstWindow();await page.waitForURL('app://studio/index.html');
  await expect(page.getByLabel('Titre de la cinématique')).toHaveValue('Film dans le projet');
  await expect(page.getByLabel('Cinématique du projet').locator('option')).toHaveCount(3);
  await page.locator('.studio-modebar').getByRole('button',{name:/^Niveaux/}).click();
  await expect(page.getByLabel('Titre du projet de niveaux')).toHaveValue(saved.title);
  await expect(page.locator('.gd-project-name small')).toContainText(file);
  await page.locator('.gd-sections').getByRole('button',{name:/^Niveaux/}).click();
  await expect(page.locator('.gd-level-items button')).toHaveCount(1);
  await app.evaluate(({dialog})=>{dialog.showSaveDialog=async()=>{throw new Error('Le projet rouvert doit garder son fichier.');};});
  await page.getByLabel('Titre du projet de niveaux').fill('Projet rouvert automatiquement');
  await page.locator('.studio-modebar').getByRole('button',{name:'Enregistrer le projet'}).click();
  await expect.poll(async()=>JSON.parse(await fs.readFile(file,'utf8')).title).toBe('Projet rouvert automatiquement');
  await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
  await app.close();app=undefined;
  const draft=JSON.parse(await fs.readFile(file,'utf8'));draft.title='Brouillon local du même projet';
  await fs.writeFile(path.join(profile,'game-recovery.json'),JSON.stringify(draft));
  app=await _electron.launch({args:[ROOT],env:env as Record<string,string>});
  page=await app.firstWindow();await page.waitForURL('app://studio/index.html');
  await page.locator('.studio-modebar').getByRole('button',{name:/^Niveaux/}).click();
  await expect(page.getByLabel('Titre du projet de niveaux')).toHaveValue('Projet rouvert automatiquement');
  await expect(page.locator('.gd-recovery')).toContainText('Brouillon local du même projet');
  await page.locator('.gd-recovery').getByRole('button',{name:'Reprendre'}).click();
  await expect(page.getByLabel('Titre du projet de niveaux')).toHaveValue('Brouillon local du même projet');
  await page.locator('.studio-modebar').getByRole('button',{name:'Enregistrer le projet'}).click();
  await expect.poll(async()=>JSON.parse(await fs.readFile(file,'utf8')).title).toBe('Brouillon local du même projet');
  await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
  const copyFile=path.join(dir,'copie.game.json');
  await app.evaluate(({dialog},target)=>{dialog.showSaveDialog=async()=>({canceled:false,filePath:target});},copyFile);
  await page.locator('.gd-toolbar').getByRole('button',{name:'Récents'}).click();
  await page.locator('.gd-recents').getByRole('button',{name:'Créer une copie du projet…'}).click();
  await expect.poll(async()=>{try{return JSON.parse(await fs.readFile(copyFile,'utf8')).title;}catch{return '';}}).toBe('Brouillon local du même projet');
  await expect(page.locator('.gd-project-name small')).toContainText(copyFile);
  await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
  expect(JSON.parse(await fs.readFile(file,'utf8')).title).toBe('Brouillon local du même projet');
 }finally{
  if(app){
   await app.evaluate(({BrowserWindow})=>{for(const window of BrowserWindow.getAllWindows())window.destroy();}).catch(()=>{});
   await app.close();
  }
  await fs.rm(dir,{recursive:true,force:true});
 }
});
