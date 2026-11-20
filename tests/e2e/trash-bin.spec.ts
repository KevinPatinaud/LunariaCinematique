import {test,expect,_electron,type ElectronApplication,type Page} from '@playwright/test';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {seedProject} from '../../src/shared/game/seed.js';
import {newLevel} from '../../src/shared/game/types.js';
import {ensureCampaign} from '../../src/shared/game/campaign.js';
import {fixturePresentation,PIXEL_PNG} from '../presentation-fixture.js';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');

test('Trash bin: fixed placement and lane blocking persist after reopening',async()=>{
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-poubelle-e2e-'));
 const target=path.join(temp,'poubelle.game.json'),library=path.join(temp,'library'),profile=path.join(temp,'profile');
 let app:ElectronApplication|undefined,page:Page|undefined;
 try{
  await fs.mkdir(library);await fs.mkdir(profile);
  await fs.writeFile(path.join(library,'pixel.png'),PIXEL_PNG);
  await fs.writeFile(path.join(profile,'settings.json'),JSON.stringify({libraryRoot:library}));
  const project=seedProject();project.levels=[newLevel(['radish','rose'],'runner')];ensureCampaign(project);
  await fs.writeFile(target,JSON.stringify(fixturePresentation(project,'library://pixel.png')));
  const env=Object.fromEntries(Object.entries(process.env).filter((entry):entry is [string,string]=>typeof entry[1]==='string'));
  delete env.LUNARIA_DEV_URL;
  app=await _electron.launch({args:[ROOT],env:{...env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:profile}});
  page=await app.firstWindow();
  await page.waitForURL('app://studio/index.html');
  await app.evaluate(({dialog},filename)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[filename]});},target);
  await page.locator('.studio-modebar').getByRole('button',{name:/^Niveaux/}).click();
  await page.getByRole('button',{name:'Actions du fichier projet'}).click();await page.getByRole('button',{name:'Ouvrir un projet…',exact:true}).click();
  await expect(page.locator('.gd-message')).toContainText('Projet ouvert.');
  await page.locator('.gd-sections').getByRole('button',{name:/^Niveaux/}).click();
  await page.getByRole('button',{name:'Vagues & ennemis'}).click();
  await page.getByLabel('Ennemi du groupe 1').selectOption('poubelle');
  await expect(page.locator('.gd-plaque-placement > p')).toContainText('projectiles la traversent');
  await page.getByRole('group',{name:'Position de Poubelle'}).getByRole('button',{name:'Allée 3, colonne 6',exact:true}).click();
  await page.locator('.studio-modebar').getByRole('button',{name:'Enregistrer le projet'}).click();
  await expect(page.locator('.gd-message')).toContainText('enregistrés');
  await expect.poll(async()=>JSON.parse(await fs.readFile(target,'utf8')).levels[0].waves[0].groups[0]).toMatchObject({enemyId:'poubelle',placement:{rowMin:2,rowMax:2,colMin:5,colMax:5}});
  await page.getByRole('button',{name:'Actions du fichier projet'}).click();await page.getByRole('button',{name:'Ouvrir un projet…',exact:true}).click();
  await expect(page.locator('.gd-message')).toContainText('Projet ouvert.');
  await page.locator('.gd-sections').getByRole('button',{name:/^Niveaux/}).click();
  await page.getByRole('button',{name:'Vagues & ennemis'}).click();
  await expect(page.getByLabel('Ennemi du groupe 1')).toHaveValue('poubelle');
  await expect(page.getByRole('group',{name:'Position de Poubelle'}).getByRole('button',{name:'Allée 3, colonne 6',exact:true})).toHaveAttribute('aria-pressed','true');
 }finally{
  if(app){await app.evaluate(({BrowserWindow})=>{for(const window of BrowserWindow.getAllWindows())window.destroy();}).catch(()=>undefined);await app.close();}
  await fs.rm(temp,{recursive:true,force:true});
 }
});
