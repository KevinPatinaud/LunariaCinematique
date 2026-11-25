import {test,expect,_electron,type ElectronApplication} from '@playwright/test';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');

test('Lierre shows editable binding, accurate preview and persisted values',async()=>{
 test.setTimeout(90000);
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-ivy-'));
 const target=path.join(dir,'ivy.game.json');
 const env=Object.fromEntries(Object.entries(process.env).filter((e):e is [string,string]=>typeof e[1]==='string'));
 delete env.LUNARIA_DEV_URL;
 let app:ElectronApplication|undefined;
 try{
  app=await _electron.launch({args:[ROOT],env:{...env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:path.join(dir,'profile')}});
  const page=await app.firstWindow();
  await page.waitForURL('app://studio/index.html');
  await app.evaluate(({dialog},file)=>{dialog.showSaveDialog=async()=>({canceled:false,filePath:file});dialog.showMessageBox=async()=>({response:1,checkboxChecked:false});},target);
  await page.locator('.studio-sections').getByRole('button',{name:/^Plantes/}).click();
  await expect(page.getByRole('complementary',{name:'Catalogue des plantes'}).getByRole('button',{name:/^Lierre/})).toHaveCount(1);
  await expect(page.getByRole('complementary',{name:'Catalogue des plantes'}).getByRole('button',{name:/^Fougère/})).toHaveCount(0);
  await page.getByRole('complementary',{name:'Catalogue des plantes'}).getByRole('button',{name:/^Lierre/}).click();
  await page.getByRole('button',{name:'Capacités',exact:true}).click();
  await expect(page.getByLabel('Nom de la capacité')).toHaveValue('Étreinte de lierre');
  const duration=page.getByLabel('Libération au plus tard (s)',{exact:true});
  await expect(duration).toHaveValue('6');
  await expect(page.getByLabel('Intervalle des pulsations (s)',{exact:true})).toHaveValue('1');
  await page.getByText('Cible d’essai et calcul des résultats',{exact:true}).click();
  await expect(page.locator('.gd-combat-probe')).toContainText('entre 3 et 6 s');
  await expect(page.locator('.gd-combat-probe')).toContainText('déplacements et attaques ralentis de 80 %');
  await expect(page.locator('.gd-combat-probe')).toContainText('Étreinte de lierre');
  const out=process.env.IVY_ARTIFACT_DIR??path.join(ROOT,'work','ivy');
  await fs.mkdir(out,{recursive:true});
  await duration.scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(out,'lierre-studio.png')});
  await duration.fill('4');await duration.press('Tab');
  await expect(page.locator('.gd-combat-probe')).toContainText('entre 2 et 4 s');
  await page.locator('.studio-modebar').getByRole('button',{name:'Enregistrer le projet'}).click();
  await expect(page.locator('.gd-message')).toContainText('enregistrés');
  const saved=JSON.parse(await fs.readFile(target,'utf8'));
  expect(saved.combat.effects.find((x:{id:string})=>x.id==='fx_ivy_bind').duration).toBe(4);
  expect(saved.combat.abilities.find((x:{id:string})=>x.id==='ab_ivy_binding').effects).toEqual(['fx_ivy_impact','fx_ivy_bind']);
 }finally{
  if(app){const child=app.process();try{await app.evaluate(({app})=>{setTimeout(()=>app.exit(0),0);});}catch{}await Promise.race([app.close().catch(()=>{}),new Promise<void>(resolve=>setTimeout(resolve,5000))]);if(child.exitCode===null)child.kill();}
  await fs.rm(dir,{recursive:true,force:true,maxRetries:15,retryDelay:200});
 }
});
