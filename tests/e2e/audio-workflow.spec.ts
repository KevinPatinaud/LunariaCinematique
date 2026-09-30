import {test,expect,_electron,type ElectronApplication,type Page} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {seedProject} from '../../src/shared/game/seed.js';
import {demoCinematic} from '../../src/shared/demo.js';
import {newBubble, type Cinematic} from '../../src/shared/model.js';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
let app:ElectronApplication,page:Page,dir:string,file:string,doc:Cinematic;
let errors:string[];
function wav(){const rate=8000,n=rate*12,b=Buffer.alloc(44+n*2);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*2,40);for(let i=0;i<n;i++)b.writeInt16LE(Math.round(Math.sin(i*2*Math.PI*220/rate)*800),44+i*2);return b;}
test.beforeEach(async()=>{
  dir=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-audio-e2e-'));file=path.join(dir,'audio.game.json');const library=path.join(dir,'library'),profile=path.join(dir,'profile');
  await fs.cp(path.join(ROOT,'example-library'),library,{recursive:true});await fs.mkdir(path.join(library,'audio'));await fs.writeFile(path.join(library,'audio','ambiance.wav'),wav());await fs.writeFile(path.join(library,'audio','bulle.wav'),wav());
  doc=demoCinematic();doc.shots.forEach(s=>{s.duration=2;s.dialogueStart=.3;s.bubbles.forEach(b=>b.advance={mode:'auto',seconds:1});});
  const project=seedProject();project.cinematics=[doc];await fs.writeFile(file,JSON.stringify(project));await fs.mkdir(profile);await fs.writeFile(path.join(profile,'settings.json'),JSON.stringify({libraryRoot:library}));
  const env={...process.env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:profile};delete env.LUNARIA_DEV_URL;
  app=await _electron.launch({args:[ROOT],env:env as Record<string,string>});page=await app.firstWindow();errors=[];page.on('pageerror',e=>errors.push(e.message));await page.waitForURL('app://studio/index.html');await page.setViewportSize({width:1462,height:960});
  await app.evaluate(({dialog},file)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]});dialog.showSaveDialog=async()=>({canceled:false,filePath:file});dialog.showMessageBox=async()=>({response:1,checkboxChecked:false});},file);
  await expect(page.locator('.studio-save')).toBeEnabled();await page.getByRole('button',{name:'Ouvrir le projet',exact:true}).click();await expect(page.getByLabel('Titre de la cinématique')).toHaveValue(doc.title);
});
test.afterEach(async()=>{if(app){await app.evaluate(({BrowserWindow})=>{for(const w of BrowserWindow.getAllWindows())w.destroy();}).catch(()=>{});await app.close();}await fs.rm(dir,{recursive:true,force:true});expect(errors).toEqual([]);});

test('configure ranges, fades and a bubble sound, save and reopen; responsive controls',async({},info)=>{
  await page.getByRole('button',{name:'Son',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Son de la cinématique'});
  await dialog.getByLabel('Rechercher un son',{exact:true}).fill('introuvable-xyz');await expect(dialog.getByRole('button',{name:'Ajouter une musique',exact:true})).toBeDisabled();
  await dialog.getByLabel('Rechercher un son',{exact:true}).fill('ambiance');await dialog.getByRole('button',{name:'Ajouter une musique',exact:true}).click();
  const music=dialog.getByRole('region',{name:'Musique 1'});await music.getByLabel('S’arrête après le plan').selectOption(doc.shots[1].id);await music.getByLabel('Montée progressive (s)').fill('0,5');await music.getByLabel('Montée progressive (s)').press('Tab');await music.getByLabel('Diminution progressive (s)').fill('1.5');await music.getByLabel('Diminution progressive (s)').press('Tab');
  await expect(music.getByLabel('Du plan 1 au plan 2')).toBeVisible();await page.screenshot({path:info.outputPath('musiques-et-fondus.png')});
  await dialog.getByRole('tab',{name:/Sons de ce plan/}).click();await dialog.getByLabel('Rechercher un son',{exact:true}).fill('bulle');await dialog.getByRole('button',{name:'Ajouter un son',exact:true}).click();const sound=dialog.getByRole('region',{name:'Son 1',exact:true});await sound.getByLabel('Déclencheur').selectOption('bubble_open');await sound.getByLabel('Délai après l’événement (s)').fill('0.2');await sound.getByLabel('Délai après l’événement (s)').press('Tab');
  await expect(sound.getByLabel('Cible du son')).toHaveValue(doc.shots[0].bubbles[0].id);await page.screenshot({path:info.outputPath('sons-evenements.png')});
  await page.setViewportSize({width:1000,height:720});expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);await sound.getByLabel('Durée maximale (s)').fill('2');await sound.getByLabel('Durée maximale (s)').press('Tab');await page.screenshot({path:info.outputPath('audio-1000px.png')});
  await dialog.getByRole('button',{name:'Retour au montage'}).click();await page.locator('.studio-save').click();await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
  const saved=JSON.parse(await fs.readFile(file,'utf8')).cinematics[0];expect(saved.musicTracks[0]).toMatchObject({startShotId:doc.shots[0].id,endShotId:doc.shots[1].id,fadeIn:.5,fadeOut:1.5});expect(saved.shots[0].sounds[0]).toMatchObject({event:'bubble_open',targetId:doc.shots[0].bubbles[0].id,delay:.2,duration:2});
  await page.getByRole('button',{name:'Ouvrir le projet',exact:true}).click();await page.getByRole('button',{name:'Son',exact:true}).click();await expect(page.getByRole('region',{name:'Musique 1'}).getByLabel('Diminution progressive (s)')).toHaveValue('1.5');
});

test('real media plays continuously through two slides, fades and stops, then restarts from current slide',async()=>{
  await page.getByRole('button',{name:'Son',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Son de la cinématique'});await dialog.getByLabel('Son à ajouter').selectOption('library://audio/ambiance.wav');await dialog.getByRole('button',{name:'Ajouter une musique',exact:true}).click();await dialog.getByLabel('S’arrête après le plan').selectOption(doc.shots[1].id);await dialog.getByRole('button',{name:'Retour au montage'}).click();
  await page.evaluate(()=>{const Native=window.Audio;const w=window as unknown as {__audio:HTMLAudioElement[];__events:unknown[]};w.__audio=[];w.__events=[];window.Audio=function(src?:string){const a=new Native(src);w.__audio.push(a);for(const name of ['loadedmetadata','playing','pause','seeking','seeked'])a.addEventListener(name,()=>w.__events.push([name,performance.now(),a.currentTime]));return a;} as typeof Audio;});
  await page.getByTestId('play-all').click();
  await expect.poll(()=>page.evaluate(()=>(window as unknown as {__audio:HTMLAudioElement[]}).__audio[0]?.currentTime??0)).toBeGreaterThan(.25);
  const beforeBoundary=await page.evaluate(()=>(window as unknown as {__audio:HTMLAudioElement[]}).__audio[0].currentTime);
  await expect(page.locator('.canvas-topline')).toContainText('Plan 02',{timeout:6000});
  const mid=await page.evaluate(()=>{const a=(window as unknown as {__audio:HTMLAudioElement[]}).__audio;return {count:a.length,time:a[0].currentTime,volume:a[0].volume};});expect(mid.count).toBe(1);expect(mid.time).toBeGreaterThan(beforeBoundary);expect(mid.volume).toBeCloseTo(.65,1);const events=await page.evaluate(()=>(window as unknown as {__events:[string,number,number][]}).__events);expect(events.filter(e=>e[0]==='seeking')).toHaveLength(1);expect(events.filter(e=>e[0]==='pause')).toHaveLength(0);
  await expect.poll(()=>page.evaluate(()=>(window as unknown as {__audio:HTMLAudioElement[]}).__audio[0].volume),{timeout:5000}).toBeLessThan(.5);
  await expect(page.locator('.canvas-topline')).toContainText('Plan 03',{timeout:5000});await expect.poll(()=>page.evaluate(()=>(window as unknown as {__audio:HTMLAudioElement[]}).__audio[0].getAttribute('src'))).toBeNull();
  await page.getByRole('button',{name:'Quitter l’aperçu',exact:true}).click();await page.getByTestId('shot-card-1').click();await page.getByTestId('play-from-current').click();await expect.poll(()=>page.evaluate(()=>(window as unknown as {__audio:HTMLAudioElement[]}).__audio.length)).toBe(2);await page.getByRole('button',{name:'Quitter l’aperçu',exact:true}).click();
});

test('an event sound waits for its clicked bubble, plays once, pauses and resumes',async()=>{
  const second=newBubble(null,'narration');second.text='La seconde réplique déclenche le son.';second.style='plain';
  doc.shots[0].duration=20;doc.shots[0].bubbles[0].advance.mode='click';doc.shots[0].bubbles.push(second);
  doc.shots[0].sounds=[{id:'bubble-cue',asset:'library://audio/bulle.wav',volume:.6,loop:false,fadeIn:.2,fadeOut:0,event:'bubble_open',targetId:second.id,delay:0,duration:0}];
  const project=JSON.parse(await fs.readFile(file,'utf8'));project.cinematics=[doc];await fs.writeFile(file,JSON.stringify(project));await page.getByRole('button',{name:'Ouvrir le projet',exact:true}).click();
  await page.evaluate(()=>{const Native=window.Audio;const w=window as unknown as {__audio:HTMLAudioElement[]};w.__audio=[];window.Audio=function(src?:string){const a=new Native(src);w.__audio.push(a);return a;} as typeof Audio;});
  await page.getByTestId('play-all').click();await expect(page.locator('.continue-button')).toBeEnabled();expect(await page.evaluate(()=>(window as unknown as {__audio:HTMLAudioElement[]}).__audio.length)).toBe(0);
  await page.locator('.continue-button').click();await expect.poll(()=>page.evaluate(()=>(window as unknown as {__audio:HTMLAudioElement[]}).__audio[0]?.currentTime??0)).toBeGreaterThan(.1);
  await page.getByRole('button',{name:'Pause',exact:true}).click();await expect.poll(()=>page.evaluate(()=>(window as unknown as {__audio:HTMLAudioElement[]}).__audio[0].paused)).toBe(true);
  const time=await page.evaluate(()=>(window as unknown as {__audio:HTMLAudioElement[]}).__audio[0].currentTime);
  await page.getByRole('button',{name:'Reprendre',exact:true}).click();await expect.poll(()=>page.evaluate(()=>(window as unknown as {__audio:HTMLAudioElement[]}).__audio[0].currentTime)).toBeGreaterThan(time+.1);
  expect(await page.evaluate(()=>(window as unknown as {__audio:HTMLAudioElement[]}).__audio.length)).toBe(1);
  await page.getByRole('button',{name:'Quitter l’aperçu',exact:true}).click();await expect.poll(()=>page.evaluate(()=>(window as unknown as {__audio:HTMLAudioElement[]}).__audio[0].getAttribute('src'))).toBeNull();
});
