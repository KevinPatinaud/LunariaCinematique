import {test, expect, _electron, type ElectronApplication, type Page} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {seedProject} from '../../src/shared/game/seed.js';
import {newActor, newBubble, newCinematic, newShot, type Actor, type Bubble, type Asset, type Cinematic} from '../../src/shared/model.js';
import {newMotion, newMovement} from '../../src/shared/motion.js';
import {newTextAnimation} from '../../src/shared/textAnimation.js';
import {prepareCinematic} from '../../src/shared/geometry.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const asset: Asset = {ref:'library://actors/test.png', path:'actors/test.png', name:'Élément A', folder:'actors', kind:'character', bytes:1, modified:0, url:'', thumbnail:''};
let app: ElectronApplication, page: Page, dir: string, projectFile: string, film: Cinematic;
let errors: string[];

test.beforeEach(async () => {
  errors=[];
  dir=await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-inspector-selection-'));
  projectFile=path.join(dir, 'test.game.json');
  const profile=path.join(dir, 'profile'), library=path.join(dir, 'library');
  await fs.mkdir(profile);
  await fs.mkdir(path.join(library, 'actors'), {recursive:true});
  await fs.copyFile(path.join(ROOT, 'example-library/06_ui/dialogues/tooltip_ornate_v01.png'), path.join(library, 'actors/test.png'));
  await fs.writeFile(path.join(profile, 'settings.json'), JSON.stringify({libraryRoot:library}));
  film=newCinematic(); film.schemaVersion=3;
  film.shots[0].name='Plan A';
  film.shots[0].duration=15;
  film.shots[0].actors=['character','enemy','prop'].map((role, index) => {
    const actor=newActor({...asset, name:`Élément ${'ABC'[index]}`}, 1.5, .08+index*.3, .6, role as 'character'|'enemy'|'prop');
    actor.width=.18; actor.height=.2;
    actor.entry={preset:'fade', duration:.8, delay:0};
    actor.exit={preset:'fade', duration:.8, start:10};
    actor.movement={...newMovement(actor), enabled:true, dx:.05, dy:0, duration:2, delay:0};
    actor.motion={...newMotion('float'), delay:0};
    return actor;
  });
  film.shots[0].bubbles=[0,1].map(index => {
    const bubble=newBubble(film.shots[0].actors[index].id);
    bubble.text=`Réplique ${index+1}`; bubble.x=.08+index*.5; bubble.y=.08; bubble.width=.35;
    bubble.textAnimation=newTextAnimation('typewriter');
    bubble.advance={mode:'auto', seconds:3};
    bubble.bubbleEntry={preset:'pop', duration:.3};
    return bubble;
  });
  const second=newShot(); second.name='Plan B'; second.duration=15;
  film.shots.push(second);
  film=prepareCinematic(film);
  const project=seedProject(); project.levels=[]; project.campaign={steps:[], cinematics:[]}; project.cinematics=[film];
  await fs.writeFile(projectFile, JSON.stringify(project));
  const env={...process.env, LUNARIA_E2E:'1', LUNARIA_TEST_USER_DATA:profile}; delete env.LUNARIA_DEV_URL;
  app=await _electron.launch({args:[ROOT], env:env as Record<string,string>});
  page=await app.firstWindow(); page.on('pageerror', error => errors.push(error.message));
  await page.waitForURL('app://studio/index.html');
  await app.evaluate(({dialog}, file) => {
    dialog.showOpenDialog=async()=>({canceled:false, filePaths:[file]});
    dialog.showMessageBox=async()=>({response:1, checkboxChecked:false});
  }, projectFile);
  await page.getByRole('button',{name:'Actions du fichier projet'}).click();await page.getByRole('button',{name:'Ouvrir un projet…',exact:true}).click();
  await expect(page.getByLabel('Nom du plan', {exact:true})).toHaveValue('Plan A');
});

test.afterEach(async ({}, info) => {
  if (page && !page.isClosed() && info.status!==info.expectedStatus) await info.attach('inspecteur', {body:await page.screenshot(), contentType:'image/png'});
  await app?.close();
  await fs.rm(dir, {recursive:true, force:true});
  expect(errors).toEqual([]);
});

async function selectActor(index: number) {
  await page.getByRole('button', {name:`Sélectionner Élément ${'ABC'[index]}`, exact:true}).click();
}
async function saveFilm() {
  await page.getByRole('button', {name:'Enregistrer le projet', exact:true}).click();
  await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
  return JSON.parse(await fs.readFile(projectFile, 'utf8')).cinematics[0] as Cinematic;
}

test('The edited delay stays with the character after selecting an enemy', async ({}, info) => {
  await selectActor(0);
  const delay=page.getByRole('textbox', {name:'Délai d’apparition', exact:true});
  await delay.fill('2,4');
  await page.getByTestId(`actor-${film.shots[0].actors[1].id}`).click();
  await expect(page.getByLabel('Nom de l’ennemi', {exact:true})).toHaveValue('Élément B');
  await expect(delay).toHaveValue('0');
  await selectActor(0);
  await expect(delay).toHaveValue('2.4');
  const saved=await saveFilm();
  expect(saved.shots[0].actors.map(actor=>actor.entry.delay)).toEqual([2.4,0,0]);
  await page.getByRole('button',{name:'Actions du fichier projet'}).click();await page.getByRole('button',{name:'Ouvrir un projet…',exact:true}).click();
  await expect(page.getByLabel('Nom du plan', {exact:true})).toHaveValue('Plan A');
  await selectActor(0); await expect(delay).toHaveValue('2.4');
  await delay.scrollIntoViewIfNeeded();
  await page.screenshot({path:info.outputPath('delai-apparition-selection.png')});
  await selectActor(1); await expect(delay).toHaveValue('0');
});

test('Durations, delays and transforms stay with their items during scene selection', async () => {
  test.setTimeout(90000);
  const cases: {label:string; text:string; read:(actor:Actor)=>number; expected:number; details?:string}[]=[
    {label:'Durée de l’apparition', text:'1,7', read:actor=>actor.entry.duration, expected:1.7},
    {label:'Durée du déplacement', text:'4.2', read:actor=>actor.movement!.duration, expected:4.2},
    {label:'Délai du déplacement', text:'1,3', read:actor=>actor.movement!.delay, expected:1.3},
    {label:'Décalage horizontal', text:'12', read:actor=>actor.movement!.dx, expected:.12, details:'Ajuster la trajectoire'},
    {label:'Décalage vertical', text:'-8', read:actor=>actor.movement!.dy, expected:-.08, details:'Ajuster la trajectoire'},
    {label:'Durée du cycle', text:'5,4', read:actor=>actor.motion!.period, expected:5.4},
    {label:'Délai de l’effet', text:'2.1', read:actor=>actor.motion!.delay, expected:2.1},
    {label:'Durée de la sortie', text:'1.2', read:actor=>actor.exit!.duration, expected:1.2},
    {label:'Délai de disparition', text:'11,3', read:actor=>actor.exit!.start, expected:11.3},
    {label:'Rotation de l’élément', text:'15', read:actor=>actor.rotation??0, expected:15, details:'Orientation et transparence'},
  ];
  for (const item of cases) {
    await selectActor(0);
    if (item.details) await page.getByText(item.details, {exact:true}).click();
    await page.getByRole('textbox', {name:item.label, exact:true}).fill(item.text);
    await page.getByTestId(`actor-${film.shots[0].actors[2].id}`).click();
    const saved=await saveFilm();
    expect(item.read(saved.shots[0].actors[0]), item.label).toBe(item.expected);
    expect(item.read(saved.shots[0].actors[2]), item.label).toBe(item.read(film.shots[0].actors[2]));
    expect(saved.shots[0].actors[1]).toEqual(film.shots[0].actors[1]);
  }
});

test('Input stays with its bubble when another bubble or a character is selected', async () => {
  test.setTimeout(90000);
  const cases: {label:string; text:string; read:(bubble:Bubble)=>number; expected:number}[]=[
    {label:'Durée de l’animation de la bulle', text:'.7', read:bubble=>bubble.bubbleEntry!.duration, expected:.7},
    {label:'Vitesse d’écriture', text:'24', read:bubble=>bubble.textAnimation!.speed, expected:24},
    {label:'Délai du texte', text:'2,6', read:bubble=>bubble.textAnimation!.delay, expected:2.6},
    {label:'Temps de lecture', text:'4.8', read:bubble=>bubble.advance.seconds, expected:4.8},
  ];
  for (const item of cases) {
    await page.getByTestId(`layer-${film.shots[0].bubbles[0].id}`).locator('.layer-select').click();
    await page.getByRole('textbox', {name:item.label, exact:true}).fill(item.text);
    await page.getByTestId(`bubble-${film.shots[0].bubbles[1].id}`).locator('g.movable > rect').first().click();
    await expect(page.getByRole('textbox', {name:item.label, exact:true})).toHaveValue(String(item.read(film.shots[0].bubbles[1])));
    const saved=await saveFilm();
    expect(item.read(saved.shots[0].bubbles[0]), item.label).toBe(item.expected);
    expect(saved.shots[0].bubbles[1]).toEqual(film.shots[0].bubbles[1]);
  }
  await page.getByRole('textbox', {name:'Délai du texte', exact:true}).fill('1,9');
  await page.getByTestId(`actor-${film.shots[0].actors[0].id}`).click();
  const saved=await saveFilm();
  expect(saved.shots[0].bubbles[1].textAnimation!.delay).toBe(1.9);
  expect(saved.shots[0].actors).toEqual(film.shots[0].actors);
});

test('Layer, background and multiple selections commit the original field', async () => {
  const delay=page.getByRole('textbox', {name:'Délai d’apparition', exact:true});
  await selectActor(0); await delay.fill('2.3');
  await selectActor(1); await expect(delay).toHaveValue('0');
  await delay.fill('3,4');
  await page.getByTestId(`actor-${film.shots[0].actors[2].id}`).click({modifiers:['Shift']});
  await expect(page.locator('.multi-selection-note')).toContainText('2 éléments');
  await selectActor(2); await delay.fill('4,5');
  await page.getByTestId('scene').click({position:{x:30, y:30}});
  await expect(page.getByLabel('Nom du plan', {exact:true})).toHaveValue('Plan A');
  const saved=await saveFilm();
  expect(saved.shots[0].actors.map(actor=>actor.entry.delay)).toEqual([2.3,3.4,4.5]);
});

test('un glisser après une saisie valide conserve la modification et le déplacement', async () => {
  await selectActor(0);
  await page.getByRole('textbox', {name:'Délai d’apparition', exact:true}).fill('2.5');
  const box=await page.getByTestId(`actor-${film.shots[0].actors[1].id}`).boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x+box!.width/2, box!.y+box!.height/2);
  await page.mouse.down();
  await page.mouse.move(box!.x+box!.width/2+50, box!.y+box!.height/2+20, {steps:6});
  await page.mouse.up();
  const saved=await saveFilm();
  expect(saved.shots[0].actors[0].entry.delay).toBe(2.5);
  expect(saved.shots[0].actors[1].entry.delay).toBe(0);
  expect(saved.shots[0].actors[1].x).toBeGreaterThan(film.shots[0].actors[1].x+.02);
  expect(saved.shots[0].actors[1].y).toBeGreaterThan(film.shots[0].actors[1].y+.01);
});

test('Shot fields do not carry unsaved edits into the next shot', async () => {
  await page.getByRole('textbox', {name:'Durée du plan', exact:true}).fill('18,5');
  await page.getByTestId('shot-card-1').click();
  await expect(page.getByRole('textbox', {name:'Durée du plan', exact:true})).toHaveValue('15');
  await page.getByRole('textbox', {name:'Début des dialogues', exact:true}).fill('2,8');
  await page.getByTestId('shot-card-0').click();
  const saved=await saveFilm();
  expect(saved.shots.map(shot=>shot.duration)).toEqual([18.5,15]);
  expect(saved.shots.map(shot=>shot.dialogueStart)).toEqual([film.shots[0].dialogueStart,2.8]);
});

test('Incomplete edits are discarded and Enter, Escape, Tab and Ctrl+S retain their behavior', async () => {
  await selectActor(0);
  const delay=page.getByRole('textbox', {name:'Délai d’apparition', exact:true});
  for (const invalid of ['', '-', 'abc', '2,,4']) {
    await delay.fill(invalid);
    await page.getByTestId(`actor-${film.shots[0].actors[1].id}`).click();
    await expect(delay).toHaveValue('0');
    await selectActor(0); await expect(delay).toHaveValue('0');
  }
  await delay.fill('1,6'); await delay.press('Enter');
  await expect(delay).not.toBeFocused(); await expect(delay).toHaveValue('1.6');
  await delay.fill('9'); await delay.press('Escape');
  await expect(delay).toHaveValue('1.6');
  await page.getByTestId(`actor-${film.shots[0].actors[1].id}`).click();
  await delay.fill('3,1'); await delay.press('Tab');
  await expect(delay).toHaveValue('3.1');
  await selectActor(2); await delay.fill('4,2'); await delay.press('Control+s');
  await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
  const saved=JSON.parse(await fs.readFile(projectFile, 'utf8')).cinematics[0] as Cinematic;
  expect(saved.shots[0].actors.map(actor=>actor.entry.delay)).toEqual([1.6,3.1,4.2]);
});

test('un délai différent et une entrée sans animation ne récupèrent pas la saisie précédente', async () => {
  const delay=page.getByRole('textbox', {name:'Délai d’apparition', exact:true});
  await selectActor(1); await delay.fill('6.2'); await delay.press('Tab');
  await selectActor(2); await page.getByRole('combobox', {name:'Entrée', exact:true}).selectOption('none');
  await selectActor(0); await delay.fill('2,4');
  await page.getByTestId(`actor-${film.shots[0].actors[1].id}`).click();
  await expect(delay).toHaveValue('6.2');
  await selectActor(0); await delay.fill('2,5');
  await page.getByTestId(`actor-${film.shots[0].actors[2].id}`).click();
  await expect(delay).toHaveCount(0);
  const saved=await saveFilm();
  expect(saved.shots[0].actors.map(actor=>actor.entry.delay)).toEqual([2.5,6.2,0]);
  expect(saved.shots[0].actors[2].entry.preset).toBe('none');
});

test('changer de cinématique conserve la saisie sur le film et le plan d’origine', async () => {
  // IDs may repeat across separately authored films; the document is part of the form identity.
  const other=structuredClone(film); other.id='CIN_other'; other.title='Autre film';
  const project=JSON.parse(await fs.readFile(projectFile, 'utf8')); project.cinematics.push(other);
  await fs.writeFile(projectFile, JSON.stringify(project));
  await page.getByRole('button',{name:'Actions du fichier projet'}).click();await page.getByRole('button',{name:'Ouvrir un projet…',exact:true}).click();
  await selectActor(0);
  const delay=page.getByRole('textbox', {name:'Délai d’apparition', exact:true});
  await delay.fill('2,7');
  await page.getByRole('combobox', {name:'Cinématique du projet', exact:true}).selectOption(other.id);
  await selectActor(0); await expect(delay).toHaveValue('0');
  await delay.fill('1,9');
  await page.getByRole('combobox', {name:'Cinématique du projet', exact:true}).selectOption(film.id);
  await selectActor(0); await expect(delay).toHaveValue('2.7');
  await saveFilm();
  const saved=JSON.parse(await fs.readFile(projectFile, 'utf8')).cinematics as Cinematic[];
  expect(saved.map(item=>item.shots[0].actors[0].entry.delay)).toEqual([2.7,1.9]);
});
