import {test,expect,_electron,type ElectronApplication} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {seedProject} from '../../src/shared/game/seed.js';
import {newActor,newCinematic,newShot,type Asset} from '../../src/shared/model.js';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');

test('returning the actor in shot 18 to a static image allows validation, playback and saving',async({},info)=>{
 test.setTimeout(90000);
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-static-actor-'));
 const projectFile=path.join(dir,'lunaria.game.json'),profile=path.join(dir,'profile'),library=path.join(dir,'library');
 let app:ElectronApplication|undefined;
 try{
  await fs.mkdir(profile);await fs.mkdir(library);
  await fs.copyFile(path.join(ROOT,'example-library','06_ui','dialogues','tooltip_ornate_v01.png'),path.join(library,'image.png'));
  await fs.writeFile(path.join(profile,'settings.json'),JSON.stringify({libraryRoot:library}));
  const asset:Asset={ref:'library://image.png',path:'image.png',name:'Personnage test',folder:'',kind:'character',bytes:1,modified:0,url:'',thumbnail:''};
  const film=newCinematic();film.title='Retour à une image fixe';
  film.shots=Array.from({length:18},(_,index)=>({...newShot(asset.ref),name:`Plan ${index+1}`,duration:30}));
  const actor=newActor(asset,1);film.shots[17].actors.push(actor);
  const project=seedProject();project.levels=[];project.campaign={steps:[],cinematics:[]};project.cinematics=[film];
  await fs.writeFile(projectFile,JSON.stringify(project));
  const env={...process.env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:profile};delete env.LUNARIA_DEV_URL;
  app=await _electron.launch({args:[ROOT],env:env as Record<string,string>});
  const page=await app.firstWindow();await page.waitForURL('app://studio/index.html');
  await app.evaluate(({dialog},file)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]});},projectFile);
  await page.getByRole('button',{name:'Ouvrir le projet',exact:true}).click();
  await expect(page.getByLabel('Nom du plan')).toHaveValue('Plan 1');
  await page.getByTestId('shot-card-17').click();
  await page.getByRole('button',{name:'Sélectionner Personnage test',exact:true}).click();
  const source=page.getByLabel('Source de l’acteur',{exact:true});
  for(const mode of ['species','animation']){
   await source.selectOption(mode);
   await source.selectOption('static');
   await expect(source).toHaveValue('static');
   await page.getByTestId('play-from-current').click();
   await expect(page.locator('.scene-path')).toContainText('APERÇU');
   await expect(page.getByRole('heading',{name:'Diagnostics de la cinématique'})).toHaveCount(0);
   await page.keyboard.press('Escape');
   await expect(page.locator('.scene-path')).toHaveText('SCÈNEPlan 18');
   await page.getByRole('button',{name:'Sélectionner Personnage test',exact:true}).click();
  }
  await source.blur();await page.keyboard.press('Control+z');
  await expect(source).toHaveValue('animation');
  await page.keyboard.press('Control+Shift+z');
  await expect(source).toHaveValue('static');
  await page.getByRole('button',{name:'Enregistrer le projet',exact:true}).click();
  await expect(page.locator('.save-state')).toContainText('Projet enregistré');
  const saved=JSON.parse(await fs.readFile(projectFile,'utf8'));
  expect(saved.cinematics[0].shots[17].actors[0]).toEqual(actor);
  await page.getByTestId('play-from-current').click();
  await expect(page.locator('.scene-path')).toContainText('APERÇU');
  await page.screenshot({path:info.outputPath('static-actor-playback.png')});
 }finally{
  if(app){await app.evaluate(({BrowserWindow})=>{for(const window of BrowserWindow.getAllWindows())window.destroy();}).catch(()=>{});await app.close();}
  await fs.rm(dir,{recursive:true,force:true});
 }
});
