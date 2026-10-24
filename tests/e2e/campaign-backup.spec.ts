import { test, expect, _electron, type ElectronApplication } from '@playwright/test';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { seedProject } from '../fixtures/seed40.js';
import { fixturePresentation, PIXEL_PNG } from '../presentation-fixture.js';
import { newCinematic } from '../../src/shared/model.js';
import { campaignBackupAssets, campaignBackupLibrary } from '../../src/main/campaignBackup.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BUTTON = 'Sauvegarder la campagne…';
test('complete snapshots preserve unsaved edits and restore with their own library', async ({}, info) => {
  test.setTimeout(120000);
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-backup-e2e-'));
  let app: ElectronApplication | undefined;
  try {
    const file = path.join(temp, 'working.game.json'), profile = path.join(temp, 'profile');
    const library = path.join(temp,'library'), destination = path.join(temp,'backups');
    await fs.mkdir(profile); await fs.mkdir(library); await fs.mkdir(destination);
    const project = fixturePresentation(seedProject(), 'library://pixel.png'); project.levels = project.levels.slice(0,2);
    const film = newCinematic(); film.id='CIN_BACKUP';film.title='Film à conserver';film.shots[0].background.asset='library://pixel.png';
    film.shots[0].audio={asset:'library://sons/ambiance.ogg',volume:.5,loop:true};
    project.cinematics=[film];project.campaign={steps:[{id:'backup_level',kind:'level',levelId:project.levels[0].id}],cinematics:[]};
    for (const ref of campaignBackupAssets(project)) {
      const asset=path.join(library,...ref.slice(10).split('/'));await fs.mkdir(path.dirname(asset),{recursive:true});await fs.writeFile(asset,PIXEL_PNG);
    }
    await fs.writeFile(file,JSON.stringify(project));const original=await fs.readFile(file);
    await fs.writeFile(path.join(profile,'settings.json'),JSON.stringify({libraryRoot:library}));
    await fs.writeFile(path.join(profile,'game-recents.json'),JSON.stringify([{path:file,title:project.title,updatedAt:new Date().toISOString()}]));
    const env:NodeJS.ProcessEnv={...process.env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:profile};delete env.LUNARIA_DEV_URL;
    app=await _electron.launch({args:[ROOT],env:env as Record<string,string>});const page=await app.firstWindow();
    await page.waitForURL('app://studio/index.html');await page.setViewportSize({width:1462,height:900});
    await expect(page.locator('.studio-project-state')).toContainText('working.game.json');
    await expect(page.locator('.studio-save')).toBeEnabled();
    await app.evaluate(({dialog},folder)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[folder]});dialog.showMessageBox=async()=>({response:1,checkboxChecked:false});},destination);
    await page.getByLabel('Titre de la cinématique').fill('Film avec modifications en cours');
    await page.getByRole('button',{name:'Vue du projet',exact:true}).click();
    const overview=page.getByRole('dialog',{name:'Vue du projet'});
    await expect(overview.getByRole('button',{name:BUTTON})).toBeInViewport();
    await page.screenshot({path:info.outputPath('backup-project-overview.png')});
    await overview.getByRole('button',{name:BUTTON}).click();
    await expect(page.locator('.toast')).toContainText('Sauvegarde complète créée');
    await expect(page.locator('.studio-save')).toBeEnabled();
    const folders=await fs.readdir(destination);expect(folders).toHaveLength(1);
    const snapshotFile=path.join(destination,folders[0],'lunaria.game.json');const snapshotText=await fs.readFile(snapshotFile,'utf8');
    const snapshot=JSON.parse(snapshotText);
    expect(snapshot.cinematics[0].title).toBe('Film avec modifications en cours');expect(snapshot.levels).toHaveLength(2);
    expect(snapshot.campaign.steps).toHaveLength(1);expect(snapshot.balance).toEqual(project.balance);
    expect(snapshot.presentation).toEqual(project.presentation);
    expect(await fs.readFile(file)).toEqual(original);
    await expect(page.locator('.studio-project-state')).toContainText('working.game.json');
    await expect(page.locator('.studio-project-state')).toContainText('Modifications non enregistrées');

    await page.locator('.studio-modebar').getByRole('button',{name:'Niveaux',exact:true}).click();
    await page.getByLabel('Titre du projet de niveaux').fill('Deuxième sauvegarde');
    await expect(page.locator('.gd-campaign').getByRole('button',{name:BUTTON})).toBeInViewport();
    for(const width of [1462,1000]){
      await page.setViewportSize({width,height:900});
      await expect(page.locator('.gd-campaign').getByRole('button',{name:BUTTON})).toBeInViewport();
      await page.screenshot({path:info.outputPath(`backup-campaign-${width}.png`)});
    }
    await page.locator('.gd-campaign').getByRole('button',{name:BUTTON}).click();
    await expect(page.locator('.toast')).toContainText('Sauvegarde complète créée');
    await expect(page.locator('.studio-save')).toBeEnabled();
    expect(await fs.readdir(destination)).toHaveLength(2);
    expect(await fs.readFile(snapshotFile,'utf8')).toBe(snapshotText);expect(await fs.readFile(file)).toEqual(original);
    await app.evaluate(({dialog})=>{dialog.showOpenDialog=async()=>({canceled:true,filePaths:[]});});
    await page.locator('.gd-campaign').getByRole('button',{name:BUTTON}).click();
    await expect(page.locator('.toast')).toContainText('Sauvegarde annulée');
    expect(await fs.readdir(destination)).toHaveLength(2);
    await expect(page.locator('.studio-project-state')).toContainText('Modifications non enregistrées');

    await fs.rm(library,{recursive:true});
    const resumed=path.join(temp,'resumed.game.json');
    await app.evaluate(({dialog},targets)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[targets.snapshot]});dialog.showSaveDialog=async()=>({canceled:false,filePath:targets.resumed});},{snapshot:snapshotFile,resumed});
    await page.getByRole('button',{name:'Actions du fichier projet'}).click();await page.getByRole('button',{name:'Ouvrir un projet…',exact:true}).click();
    await expect(page.locator('.gd-message')).toContainText('Sauvegarde ouverte avec ses images et sons');
    expect(JSON.parse(await fs.readFile(path.join(profile,'settings.json'),'utf8')).libraryRoot).toBe(path.join(destination,folders[0],'LunariaArtLibrary'));
    await expect(page.getByLabel('Titre du projet de niveaux')).toHaveValue(snapshot.title);
    await page.getByRole('button',{name:'Enregistrer le projet',exact:true}).click();
    await expect(page.locator('.studio-project-state')).toContainText('resumed.game.json');
    expect(JSON.parse(await fs.readFile(resumed,'utf8'))).toEqual(snapshot);
    expect(await fs.readFile(snapshotFile,'utf8')).toBe(snapshotText);
    expect(await campaignBackupLibrary(snapshotFile)).toBe(path.join(destination,folders[0],'LunariaArtLibrary'));
    await page.locator('.studio-modebar').getByRole('button',{name:'Cinématiques',exact:true}).click();
    await expect(page.getByLabel('Titre de la cinématique')).toHaveValue('Film avec modifications en cours');
    await page.locator('.top-actions').getByRole('button',{name:/Toutes les cinématiques/}).click();
    await expect(page.getByRole('dialog',{name:'Toutes les cinématiques'}).getByRole('button',{name:BUTTON})).toBeVisible();
  } finally {
    if(app){await app.evaluate(({BrowserWindow})=>{for(const window of BrowserWindow.getAllWindows())window.destroy();}).catch(()=>undefined);await app.close().catch(()=>undefined);}
    await fs.rm(temp,{recursive:true,force:true});
  }
});
