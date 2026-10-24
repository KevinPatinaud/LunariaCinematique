import { test, expect, _electron, type ElectronApplication, type Page } from '@playwright/test';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { seedProject } from '../fixtures/seed40.js';
import { fixturePresentation, PIXEL_PNG } from '../presentation-fixture.js';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const BUTTON='Builder et Déployer sur le téléphone connecté';
let app:ElectronApplication,page:Page,temp:string,game:string,file:string;
test.beforeEach(async()=>{
 temp=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-android-e2e-'));game=path.join(temp,'repository/game');file=path.join(temp,'project.game.json');
 const library=path.join(temp,'library'),profile=path.join(temp,'profile');await fs.mkdir(library);await fs.mkdir(profile);
 await fs.writeFile(path.join(library,'pixel.png'),PIXEL_PNG);await fs.writeFile(path.join(profile,'settings.json'),JSON.stringify({libraryRoot:library}));
 await fs.writeFile(file,JSON.stringify(fixturePresentation(seedProject(),'library://pixel.png')));
 for(const folder of ['content/design','app/controllers','domain/logic','domain/presentation'])await fs.mkdir(path.join(game,folder),{recursive:true});
 for(const marker of ['project.godot','app/controllers/campaign_flow.gd','domain/logic/event_runtime.gd','domain/presentation/animation_registry.gd'])await fs.writeFile(path.join(game,marker),'marker');
 await fs.writeFile(path.join(game,'content/design/game_content.json'),'{}');
 await fs.writeFile(path.join(game,'export_presets.cfg'),'[preset.0]\nplatform="Android"\n[preset.0.options]\npackage/unique_name="org.gardiensduvivant.game"\n');
 const env={...process.env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:profile};delete env.LUNARIA_DEV_URL;
 app=await _electron.launch({args:[ROOT],env:env as Record<string,string>});page=await app.firstWindow();await page.waitForURL('app://studio/index.html');await page.setViewportSize({width:1280,height:800});
 await app.evaluate(({dialog},file)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]});dialog.showSaveDialog=async()=>({canceled:false,filePath:file});},file);
 await page.locator('.studio-modebar').getByRole('button',{name:'Niveaux',exact:true}).click();
 await page.getByRole('button',{name:'Actions du fichier projet'}).click();await page.getByRole('button',{name:'Ouvrir un projet…',exact:true}).click();await expect(page.locator('.gd-message')).toContainText('Projet ouvert.');
 await app.evaluate(({dialog},game)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[game]});},game);
});
test.afterEach(async()=>{await app?.close();await fs.rm(temp,{recursive:true,force:true});});

test('new button saves, publishes, builds, installs and launches through the native bridge',async({},info)=>{
 await page.getByLabel('Titre du projet de niveaux').fill('Campagne pour mon téléphone');
 await page.locator('.gd-delivery > summary').click();await expect(page.getByRole('button',{name:BUTTON,exact:true})).toBeInViewport();
 await page.screenshot({path:info.outputPath('android-menu.png')});
 await page.getByRole('button',{name:BUTTON,exact:true}).click();
 await expect(page.locator('.gd-message')).toContainText('Lunaria installé et lancé sur Téléphone test');
 const status=page.getByRole('region',{name:'Suivi du déploiement Android'});
 await expect(status).toBeInViewport();await expect(status).toContainText('Lunaria installé et lancé sur Téléphone test');
 await expect(status.locator('li.done')).toHaveCount(6);
 await page.setViewportSize({width:1000,height:720});await expect(status).toBeInViewport();
 expect(JSON.parse(await fs.readFile(file,'utf8')).title).toBe('Campagne pour mon téléphone');
 expect(JSON.parse(await fs.readFile(path.join(game,'content/design/game_content.json'),'utf8')).title).toBe('Campagne pour mon téléphone');
 const log=await fs.readFile(path.resolve(game,'../tools/build/.local/lunaria-android-deploy.log'),'utf8');
 expect(log).toContain('install -r');expect(log).toContain('Status: ok');
 await page.screenshot({path:info.outputPath('android-success.png')});
});

test('missing and unauthorized phone show actionable errors without building or publishing',async()=>{
 for(const devices of ['', 'phone unauthorized']){
  await app.evaluate((_electron,devices)=>{process.env.LUNARIA_E2E_ANDROID_DEVICES=devices;},devices);
  await page.locator('.gd-delivery > summary').click();await page.getByRole('button',{name:BUTTON,exact:true}).click();
  await expect(page.locator('.gd-message')).toContainText(devices?'Téléphone non autorisé':'Aucun téléphone Android connecté');
  await expect(page.getByRole('region',{name:'Suivi du déploiement Android'})).toContainText(devices?'Téléphone non autorisé':'Aucun téléphone Android connecté');
  expect(await fs.readFile(path.join(game,'content/design/game_content.json'),'utf8')).toBe('{}');
  await expect(page.locator('.studio-save')).toBeEnabled();
 }
});

test('multiple devices can be selected or canceled and project errors disable deployment',async()=>{
 await app.evaluate(({dialog})=>{process.env.LUNARIA_E2E_ANDROID_DEVICES='first device model:Premier\nsecond device model:Second';dialog.showMessageBox=async()=>({response:2,checkboxChecked:false});});
 await page.locator('.gd-delivery > summary').click();await page.getByRole('button',{name:BUTTON,exact:true}).click();
 await expect(page.locator('.gd-message')).toContainText('Déploiement Android annulé');
 expect(await fs.readFile(path.join(game,'content/design/game_content.json'),'utf8')).toBe('{}');
 await app.evaluate(({dialog})=>{dialog.showMessageBox=async()=>({response:1,checkboxChecked:false});});
 await page.locator('.gd-delivery > summary').click();await page.getByRole('button',{name:BUTTON,exact:true}).click();
 await expect(page.locator('.gd-message')).toContainText('Lunaria installé et lancé sur Second (second)');
 await page.getByLabel('Titre du projet de niveaux').fill('');await page.locator('.gd-delivery > summary').click();
 await expect(page.getByRole('button',{name:BUTTON,exact:true})).toBeDisabled();
});
