/** Native renderer + preload + IPC scenarios. Supplied, not executed in the build container. */
import {test,expect,_electron,type ElectronApplication,type Page} from '@playwright/test';
import {promises as fs} from 'node:fs';import path from 'node:path';import os from 'node:os';import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
let app:ElectronApplication,page:Page,dir:string,target:string;
test.beforeEach(async()=>{
 dir=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-abilities-'));target=path.join(dir,'game.json');
 const env=Object.fromEntries(Object.entries(process.env).filter((e):e is [string,string]=>typeof e[1]==='string'));delete env.LUNARIA_DEV_URL;
 app=await _electron.launch({args:[ROOT],env:{...env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:path.join(dir,'profile')}});
 page=await app.firstWindow();await page.waitForURL('app://studio/index.html');
 await app.evaluate(({dialog},target)=>{dialog.showSaveDialog=async()=>({canceled:false,filePath:target});dialog.showMessageBox=async()=>({response:1,checkboxChecked:false});},target);
 await page.locator('.studio-modebar').getByRole('button',{name:/^Niveaux/}).click();
 await page.getByRole('navigation',{name:'Sections du mode Niveaux'}).getByRole('button',{name:'Capacités',exact:true}).click();
});
test.afterEach(async({},info)=>{if(page&&!page.isClosed()&&info.status!==info.expectedStatus)await info.attach('combat',{body:await page.screenshot(),contentType:'image/png'});await app?.close();await fs.rm(dir,{recursive:true,force:true});});
async function save(){await page.locator('.gd-toolbar').getByRole('button',{name:'Enregistrer',exact:true}).click();await expect(page.locator('.gd-message')).toContainText('enregistrés');return JSON.parse(await fs.readFile(target,'utf8'));}
test('catalogs persist with v4 and global references',async()=>{
 await expect(page.getByLabel('Nom de la définition')).toHaveValue('Graines vaillantes');
 await page.getByLabel('Cadence',{exact:true}).selectOption('fixed');
 await page.getByLabel('Intervalle entre utilisations (s)',{exact:true}).fill('2,5');await page.getByLabel('Intervalle entre utilisations (s)',{exact:true}).press('Tab');
 const doc=await save();expect(doc.schemaVersion).toBe(4);expect(doc.combat.abilities[0].cooldown).toBe(2.5);expect(doc.balance.plants[0].ability_ids).toContain('ab_radish');
});
test('incompatible targets block publishing and referenced definitions are protected',async()=>{
 await expect(page.getByRole('button',{name:'Supprimer',exact:true})).toBeDisabled();
 await page.getByLabel('Camp ciblé').selectOption('ally');await expect(page.getByRole('button',{name:'Publier la campagne',exact:true})).toBeDisabled();
 await page.getByLabel('Camp ciblé').selectOption('opponent');await expect(page.getByRole('button',{name:'Publier la campagne',exact:true})).toBeEnabled();
});
test('empty effect chain remains recoverable as a draft',async()=>{
 await page.getByRole('button',{name:'Retirer effet 1',exact:true}).click();await expect(page.getByRole('button',{name:'Publier la campagne',exact:true})).toBeDisabled();
 await expect.poll(async()=>{try{const p=JSON.parse(await fs.readFile(path.join(dir,'profile/game-recovery.json'),'utf8'));return p.combat.abilities[0].effects.length;}catch{return -1;}}).toBe(0);
 await page.getByLabel('Ajouter un effet',{exact:true}).selectOption('fx_attack');expect((await save()).combat.abilities[0].effects).toEqual(['fx_attack']);
});
test('same ability can be assigned to an enemy without copying its definition',async()=>{
 await page.getByRole('navigation',{name:'Sections du mode Niveaux'}).getByRole('button',{name:/^Ennemis/}).click();
 await page.getByLabel('Ajouter une capacité à l’espèce').selectOption('ab_radish');
 const doc=await save();expect(doc.balance.enemies[0].ability_ids).toContain('ab_radish');expect(doc.combat.abilities.filter((a:{id:string})=>a.id==='ab_radish')).toHaveLength(1);
});
