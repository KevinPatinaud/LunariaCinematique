/** Native Electron scenarios, supplied for Windows CI; not run in the delivery container. */
import {test,expect,_electron,type ElectronApplication,type Page} from '@playwright/test';
import {promises as fs} from 'node:fs';import path from 'node:path';import os from 'node:os';import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
let app:ElectronApplication,page:Page,dir:string,target:string;
test.beforeEach(async()=>{
 dir=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-logic-'));target=path.join(dir,'game.json');
 const env=Object.fromEntries(Object.entries(process.env).filter((e):e is [string,string]=>typeof e[1]==='string'));delete env.LUNARIA_DEV_URL;
 app=await _electron.launch({args:[ROOT],env:{...env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:path.join(dir,'profile')}});
 page=await app.firstWindow();await page.waitForURL('app://studio/index.html');
 await app.evaluate(({dialog},file)=>{dialog.showSaveDialog=async()=>({canceled:false,filePath:file});dialog.showMessageBox=async()=>({response:1,checkboxChecked:false});},target);
 await page.locator('.studio-modebar').getByRole('button',{name:/^Niveaux/}).click();
});
test.afterEach(async({},info)=>{if(page&&!page.isClosed()&&info.status!==info.expectedStatus)await info.attach('logic',{body:await page.screenshot(),contentType:'image/png'});await app?.close();await fs.rm(dir,{recursive:true,force:true});});
async function nav(name:RegExp){await page.getByRole('navigation',{name:'Sections du mode Niveaux'}).getByRole('button',{name}).click();}
async function save(){await page.locator('.gd-toolbar').getByRole('button',{name:'Enregistrer',exact:true}).click();await expect(page.locator('.gd-message')).toContainText('enregistrés');return JSON.parse(await fs.readFile(target,'utf8'));}
test('create priority behavior and retain it in schema 4',async()=>{
 await nav(/^Comportements/);await page.getByRole('button',{name:'+ Comportement',exact:true}).click();await page.getByLabel('Nom du comportement',{exact:true}).fill('Recul contrôlé');await page.getByLabel('Utilisation des capacités').selectOption('priority');
 await page.getByLabel('Action de règle 1').selectOption('retreat');const doc=await save();expect(doc.schemaVersion).toBe(4);expect(doc.logic.behaviors.at(-1).rules[0].action).toBe('retreat');
});
test('global attribution links back to the behavior',async()=>{
 await nav(/^Ennemis/);await page.getByLabel('Comportement attribué').selectOption('ai_fixed');await page.getByRole('button',{name:'Éditer les règles et phases →',exact:true}).click();await expect(page.getByLabel('Nom du comportement')).toHaveValue('Ennemi immobile');const doc=await save();expect(doc.balance.enemies[0].behaviorId).toBe('ai_fixed');
});
test('bounded recurring event persists authored reinforcements',async()=>{
 await nav(/^Niveaux/);await page.getByRole('button',{name:'Événements & dialogue',exact:true}).click();await page.getByRole('button',{name:'+ Événement',exact:true}).click();await page.getByLabel('Déclencheur',{exact:true}).selectOption('interval');await page.getByLabel('Action 1',{exact:true}).selectOption('spawn');await page.getByLabel('Nombre 1',{exact:true}).fill('4');await page.getByLabel('Nombre 1',{exact:true}).press('Tab');const doc=await save();expect(doc.levels[0].events[0].actions[0].count).toBe(4);expect(doc.levels[0].events[0].once).toBe(false);
});
test('new project keeps global rules and a fresh valid campaign frontier',async()=>{
 await page.locator('.gd-toolbar').getByRole('button',{name:'Nouveau',exact:true}).click();const doc=await save();expect(doc.levels).toHaveLength(1);expect(doc.campaign.steps[0].levelId).toBe(doc.levels[0].id);expect(doc.logic.behaviors).toHaveLength(9);
});
