import { test, expect, _electron, type ElectronApplication } from '@playwright/test';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { newCinematic, newShot } from '../../src/shared/model.js';
import { seedProject } from '../../src/shared/game/seed.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('compare, preview, play, discard, then replace with an exact original backup', async ({}, info) => {
  test.setTimeout(90000);
  const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-background-ui-'));
  const profile = path.join(folder, 'profile'), library = path.join(profile, 'library'), candidate = path.join(profile, 'candidate.png');
  await fs.mkdir(library, { recursive: true });
  const source = path.join(library, 'greenhouse.png');
  await fs.copyFile(path.join(ROOT, 'example-library/01_europe/lunaria/interieur_serre/greenhouse_aisle_wide_variant_v01.png'), source);
  const original = await fs.readFile(source);
  const film = newCinematic(); film.title = 'Correction du décor'; film.shots[0].background.asset = 'library://greenhouse.png'; film.shots[0].name = 'Plan à corriger';
  const second = newShot(film.shots[0].background.asset); second.name = 'Autre plan'; film.shots.push(second);
  const project = seedProject(); project.cinematics = [film];
  const projectFile = path.join(folder, 'project.game.json');
  await fs.writeFile(projectFile, JSON.stringify(project));
  const projectBefore = await fs.readFile(projectFile);
  await fs.writeFile(path.join(profile, 'settings.json'), JSON.stringify({ libraryRoot: library }));
  await fs.writeFile(path.join(profile, 'game-recents.json'), JSON.stringify([{path: projectFile,title: project.title,updatedAt: new Date().toISOString()}]));
  const env = {...process.env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:profile,LUNARIA_E2E_IMAGE_RESULT:candidate}; delete env.LUNARIA_DEV_URL;
  let app: ElectronApplication | undefined;
  const errors: string[] = [];
  try {
    app = await _electron.launch({args:[ROOT],env});
    const page = await app.firstWindow(); page.on('pageerror',error=>errors.push(error.message));
    await page.waitForURL('app://studio/index.html'); await page.setViewportSize({width:1600,height:1000});
    // Deterministic raster fixture exercises the real preload, protocol, files
    // and confirmation workflow; the separate live check covers native AI.
    const bytes = await app.evaluate(({nativeImage})=>Array.from(nativeImage.createFromBitmap(Buffer.alloc(2000*900*4,255),{width:2000,height:900}).toPNG()));
    await fs.writeFile(candidate,Buffer.from(bytes));
    await expect(page.getByLabel('Nom du plan',{exact:true})).toHaveValue('Plan à corriger');
    await page.getByRole('button',{name:'Adapter en 20:9 (IA)',exact:true}).click();
    const dialog=page.getByRole('dialog',{name:'Adapter le décor en 20:9'});
    await expect(dialog.getByLabel('Traitement du décor')).toHaveValue('extend');
    await dialog.getByLabel('Résolution du panorama').selectOption('2000');
    await dialog.getByRole('button',{name:'Générer le panorama 20:9',exact:true}).click();
    await expect(dialog.getByRole('button',{name:'Tester dans ce plan'})).toBeVisible();
    await expect(dialog.getByAltText('Décor corrigé proposé par Codex')).toHaveJSProperty('naturalWidth',2000);
    const proposalUrl=await dialog.getByAltText('Décor corrigé proposé par Codex').getAttribute('src');
    const firstJobId=new URL(proposalUrl!).pathname.split('/')[1];
    // Even deliberate changes in the centre of a generated image survive.
    // The previous centre-pasting implementation fails this pixel comparison.
    const wholeImageKept=await app.evaluate(({nativeImage},{profile,candidate,id})=>nativeImage.createFromPath(`${profile}/background-corrections/${id}/corrected.png`).toBitmap().equals(nativeImage.createFromPath(candidate).toBitmap()),{profile,candidate,id:firstJobId});
    expect(wholeImageKept).toBe(true);
    await dialog.getByRole('button',{name:'Tester dans ce plan'}).click();
    await expect(page.locator('[data-testid="scene"] image[data-background]')).toHaveAttribute('href',proposalUrl!);
    await page.getByTestId('shot-card-1').click();
    await expect(page.locator('[data-testid="scene"] image[data-background]')).not.toHaveAttribute('href',proposalUrl!);
    await page.getByRole('button',{name:'Voir la proposition'}).click();
    await dialog.getByRole('button',{name:'Tester dans ce plan'}).click();
    await expect(page.getByLabel('Nom du plan',{exact:true})).toHaveValue('Plan à corriger');
    await page.getByTestId('play-from-current').click();
    await expect(page.getByTestId('scene')).toHaveClass(/is-playing/);
    await expect(page.locator('[data-testid="scene"] image[data-background]')).toHaveAttribute('href',proposalUrl!);
    await page.getByRole('button',{name:'Quitter l’aperçu'}).click();
    await page.getByRole('button',{name:'Revenir à l’original'}).click();
    await expect(page.locator('[data-testid="scene"] image[data-background]')).not.toHaveAttribute('href',proposalUrl!);
    assertEqual(await fs.readFile(source),original);
    await page.getByRole('button',{name:'Voir la proposition'}).click(); await dialog.getByRole('button',{name:'Abandonner',exact:true}).click();
    assertEqual(await fs.readFile(source),original);
    await page.getByRole('button',{name:'Adapter en 20:9 (IA)',exact:true}).click();
    await dialog.getByLabel('Résolution du panorama').selectOption('2000');
    await dialog.getByRole('button',{name:'Générer le panorama 20:9',exact:true}).click();
    await expect(dialog.getByRole('button',{name:'Remplacer le fichier d’origine'})).toBeVisible();
    await page.screenshot({path:info.outputPath('background-comparison.png')});
    await dialog.getByRole('button',{name:'Remplacer le fichier d’origine'}).click();
    await expect(page.locator('.background-correction-status')).toContainText('original sauvegardé');
    const backups=await fs.readdir(path.join(library,'.lunaria-backups/backgrounds'));
    expect(backups).toHaveLength(1);
    assertEqual(await fs.readFile(path.join(library,'.lunaria-backups/backgrounds',backups[0])),original);
    expect((await fs.readFile(source)).equals(original)).toBe(false);
    assertEqual(await fs.readFile(projectFile),projectBefore);
    await page.getByTestId('shot-card-1').click();
    await expect(page.locator('[data-testid="scene"] image[data-background]')).toHaveAttribute('href',/^lunaria-asset:/);
    await expect(page.locator('[data-testid="scene"] clipPath rect')).toHaveAttribute('width','2000');
    // Rebuild a panorama without a recoverable original. Move the actual crop,
    // then prove that this crop is only used as an input to generation.
    await page.getByRole('button',{name:'Adapter en 20:9 (IA)',exact:true}).click();
    await expect(dialog.getByLabel('Traitement du décor')).toHaveValue('rebuild');
    await expect(dialog.getByTestId('panorama-core')).toHaveAttribute('x','200');
    const position=dialog.getByLabel('Position du centre 16:9',{exact:true});
    await position.focus();await position.press('End');
    await expect(dialog.getByTestId('panorama-core')).toHaveAttribute('x','400');
    await dialog.getByLabel('Résolution du panorama').selectOption('1600');
    await dialog.getByRole('button',{name:'Générer le panorama 20:9',exact:true}).click();
    await expect(dialog.getByRole('button',{name:'Tester dans ce plan'})).toBeVisible();
    const rebuiltUrl=(await dialog.getByAltText('Décor corrigé proposé par Codex').getAttribute('src'))!;
    const id=new URL(rebuiltUrl).pathname.split('/')[1];
    const pixels=await app.evaluate(({nativeImage},{source,profile,id,candidate})=>{
      const core=nativeImage.createFromPath(`${profile}/background-corrections/${id}/core.png`);
      const expected=nativeImage.createFromPath(source).crop({x:400,y:0,width:1600,height:900});
      const output=nativeImage.createFromPath(`${profile}/background-corrections/${id}/corrected.png`);
      const generated=nativeImage.createFromPath(candidate).resize({width:1600,height:720,quality:'best'});
      return {croppedExactly:core.toBitmap().equals(expected.toBitmap()),wholeGeneratedImage:output.toBitmap().equals(generated.toBitmap()),size:output.getSize()};
    },{source,profile,id,candidate});
    expect(pixels).toEqual({croppedExactly:true,wholeGeneratedImage:true,size:{width:1600,height:720}});
    const beforeAbandon=await fs.readFile(source);
    await dialog.getByRole('button',{name:'Modifier le cadrage'}).click();
    await expect(dialog.getByLabel('Position du centre 16:9',{exact:true})).toHaveValue('1');
    await dialog.getByRole('button',{name:'Recentrer',exact:true}).click();
    await expect(dialog.getByTestId('panorama-core')).toHaveAttribute('x','200');
    await dialog.getByRole('button',{name:'Abandonner',exact:true}).click();
    assertEqual(await fs.readFile(source),beforeAbandon);
    await page.setViewportSize({width:1000,height:800});
    await expect(page.getByRole('button',{name:'Adapter en 20:9 (IA)',exact:true})).toBeVisible();
    expect(errors).toEqual([]);
  } finally {
    if(app){await app.evaluate(({BrowserWindow})=>{for(const window of BrowserWindow.getAllWindows())window.destroy();}).catch(()=>{});await app.close().catch(()=>{});}
    await fs.rm(folder,{recursive:true,force:true});
  }
});
function assertEqual(actual:Buffer,expected:Buffer){expect(actual.equals(expected)).toBe(true);}

test('native mode keeps every generated pixel and sends the source at full resolution', async () => {
  test.setTimeout(60000);
  const folder=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-native-panorama-'));
  const profile=path.join(folder,'profile'),library=path.join(profile,'library'),candidate=path.join(profile,'candidate.png');
  await fs.mkdir(library,{recursive:true});
  const source=path.join(library,'greenhouse.png');
  await fs.copyFile(path.join(ROOT,'example-library/01_europe/lunaria/interieur_serre/greenhouse_aisle_wide_variant_v01.png'),source);
  const before=await fs.readFile(source),film=newCinematic(); film.shots[0].background.asset='library://greenhouse.png';
  const project=seedProject();project.cinematics=[film];const projectFile=path.join(folder,'project.game.json');
  await fs.writeFile(projectFile,JSON.stringify(project));
  await fs.writeFile(path.join(profile,'settings.json'),JSON.stringify({libraryRoot:library}));
  await fs.writeFile(path.join(profile,'game-recents.json'),JSON.stringify([{path:projectFile,title:project.title,updatedAt:new Date().toISOString()}]));
  const env={...process.env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:profile,LUNARIA_E2E_IMAGE_RESULT:candidate};delete env.LUNARIA_DEV_URL;
  let app:ElectronApplication|undefined;
  try {
    app=await _electron.launch({args:[ROOT],env});const page=await app.firstWindow();await page.waitForURL('app://studio/index.html');
    const bytes=await app.evaluate(({nativeImage})=>{
      const width=1870,height=841,pixels=Buffer.alloc(width*height*4,255);
      for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4;pixels[i]=x%251;pixels[i+1]=y%241;pixels[i+2]=(x+y)%239;}
      return Array.from(nativeImage.createFromBitmap(pixels,{width,height}).toPNG());
    });
    await fs.writeFile(candidate,Buffer.from(bytes));
    await page.getByRole('button',{name:'Adapter en 20:9 (IA)',exact:true}).click();
    const dialog=page.getByRole('dialog',{name:'Adapter le décor en 20:9'});
    await expect(dialog.getByLabel('Résolution du panorama')).toHaveValue('native');
    await dialog.getByRole('button',{name:'Générer le panorama 20:9',exact:true}).click();
    await expect(dialog.getByRole('button',{name:'Tester dans ce plan'})).toBeVisible();
    const img=dialog.getByAltText('Décor corrigé proposé par Codex');
    await expect(img).toHaveJSProperty('naturalWidth',1870);await expect(img).toHaveJSProperty('naturalHeight',841);
    const id=new URL((await img.getAttribute('src'))!).pathname.split('/')[1];
    const staged=path.join(profile,'background-corrections',id);
    assertEqual(await fs.readFile(path.join(staged,'corrected.png')),Buffer.from(bytes));
    const reference=await app.evaluate(({nativeImage},{staged,source})=>{
      const core=nativeImage.createFromPath(`${staged}/core.png`),canvas=nativeImage.createFromPath(`${staged}/canvas.png`),original=nativeImage.createFromPath(source);
      const size=core.getSize(),frame=canvas.getSize();
      const centre=canvas.crop({x:Math.floor((frame.width-size.width)/2),y:0,...size});
      return {source:original.getSize(),core:size,canvas:frame,exactReference:centre.toBitmap().equals(core.toBitmap()),leftAlpha:canvas.toBitmap()[3]};
    },{staged,source});
    expect(reference.core).toEqual(reference.source);expect(reference.canvas.height).toBe(reference.source.height);
    expect(reference.exactReference).toBe(true);expect(reference.leftAlpha).toBe(0);
    await dialog.getByRole('button',{name:'Remplacer le fichier d’origine'}).click();
    await expect(page.locator('.background-correction-status')).toContainText('original sauvegardé');
    assertEqual(await fs.readFile(source),Buffer.from(bytes));
    const backups=await fs.readdir(path.join(library,'.lunaria-backups/backgrounds'));
    assertEqual(await fs.readFile(path.join(library,'.lunaria-backups/backgrounds',backups[0])),before);
    // Native mode still refuses transparent output; preserving resolution is
    // not a bypass for technical validity checks.
    const transparent=await app.evaluate(({nativeImage})=>Array.from(nativeImage.createFromBitmap(Buffer.alloc(2000*900*4),{width:2000,height:900}).toPNG()));
    await fs.writeFile(candidate,Buffer.from(transparent));
    await page.getByRole('button',{name:'Adapter en 20:9 (IA)',exact:true}).click();
    await dialog.getByRole('button',{name:'Générer le panorama 20:9',exact:true}).click();
    await expect(dialog.getByRole('alert')).toContainText('transparente');
    await expect(dialog.getByRole('button',{name:'Remplacer le fichier d’origine'})).toHaveCount(0);
    assertEqual(await fs.readFile(source),Buffer.from(bytes));
  } finally {
    if(app){await app.evaluate(({BrowserWindow})=>{for(const window of BrowserWindow.getAllWindows())window.destroy();}).catch(()=>{});await app.close().catch(()=>{});}
    await fs.rm(folder,{recursive:true,force:true});
  }
});

test('minimize, queue different images, reopen and validate each independently', async ({}, info) => {
  test.setTimeout(90000);
  const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-parallel-background-ui-'));
  const profile = path.join(folder, 'profile'), library = path.join(profile, 'library'), candidate = path.join(profile, 'candidate.png');
  await fs.mkdir(library, { recursive: true });
  const firstFile = path.join(library, 'greenhouse.png'), secondFile = path.join(library, 'garden.png');
  await fs.copyFile(path.join(ROOT, 'example-library/01_europe/lunaria/interieur_serre/greenhouse_aisle_wide_variant_v01.png'), firstFile);
  await fs.copyFile(path.join(ROOT, 'example-library/01_europe/lunaria/interieur_serre/serre_lunaria_au_crepuscule_v01.png'), secondFile);
  const firstOriginal = await fs.readFile(firstFile), secondOriginal = await fs.readFile(secondFile);
  const film = newCinematic(); film.title = 'Décors en parallèle'; film.shots[0].background.asset = 'library://greenhouse.png'; film.shots[0].name = 'Première image';
  const second = newShot('library://garden.png'); second.name = 'Deuxième image'; film.shots.push(second);
  const project = seedProject(); project.cinematics = [film];
  const projectFile = path.join(folder, 'project.game.json');
  await fs.writeFile(projectFile, JSON.stringify(project));
  await fs.writeFile(path.join(profile, 'settings.json'), JSON.stringify({ libraryRoot: library }));
  await fs.writeFile(path.join(profile, 'game-recents.json'), JSON.stringify([{path: projectFile,title: project.title,updatedAt: new Date().toISOString()}]));
  const env = {...process.env,LUNARIA_E2E:'1',LUNARIA_TEST_USER_DATA:profile,LUNARIA_E2E_IMAGE_RESULT:candidate,LUNARIA_E2E_IMAGE_MANUAL:'1'}; delete env.LUNARIA_DEV_URL;
  const catalog = ['alpha','beta','gamma','delta'].map((name,index) => ({ id:`test-model-${name}`,label:`Modèle ${name}`,description:'',isDefault:index === 0 }));
  const modelsFile = path.join(profile,'codex-models.json');
  await fs.writeFile(modelsFile,JSON.stringify(catalog));
  let app: ElectronApplication | undefined;
  const errors: string[] = [];
  try {
    app = await _electron.launch({args:[ROOT],env});
    const page = await app.firstWindow(); page.on('pageerror',error=>errors.push(error.message));
    await page.waitForURL('app://studio/index.html'); await page.setViewportSize({width:1600,height:1000});
    const bytes = await app.evaluate(({nativeImage})=>Array.from(nativeImage.createFromBitmap(Buffer.alloc(2000*900*4,255),{width:2000,height:900}).toPNG()));
    await fs.writeFile(candidate,Buffer.from(bytes));
    const dialog = page.getByRole('dialog',{name:'Adapter le décor en 20:9'});
    const adapt = page.getByRole('button',{name:'Adapter en 20:9 (IA)',exact:true});
    const firstRow = page.locator('.background-job[data-ref="library://greenhouse.png"]');
    const secondRow = page.locator('.background-job[data-ref="library://garden.png"]');
    const release = async (id: string) => fs.writeFile(path.join(profile,'background-corrections',id,'fixture-release'),'ready');
    const jobId = async () => {
      const source = dialog.getByAltText('Décor original'); await expect(source).toBeVisible();
      return new URL((await source.getAttribute('src'))!).pathname.split('/')[1];
    };
    await expect(page.getByLabel('Nom du plan',{exact:true})).toHaveValue('Première image');
    await adapt.click();
    const modelChoice = dialog.getByLabel('Modèle Codex',{exact:true});
    const refreshModels = dialog.getByRole('button',{name:'Actualiser les modèles Codex',exact:true});
    await expect(modelChoice).toHaveValue('');
    await expect(modelChoice.locator('option')).toHaveCount(5);
    await expect(dialog.getByLabel('Identifiant du modèle Codex',{exact:true})).toHaveCount(0);
    await modelChoice.selectOption('test-model-alpha');
    await fs.writeFile(modelsFile,'{}'); await refreshModels.click();
    await expect(dialog.getByRole('alert')).toContainText('dernière liste détectée');
    await expect(modelChoice).toHaveValue('test-model-alpha');
    await expect(modelChoice.locator('option')).toHaveCount(5);
    await fs.writeFile(modelsFile,JSON.stringify(catalog)); await refreshModels.click();
    await expect(dialog.getByRole('alert')).toHaveCount(0);
    // Only the preference survives a renderer reload, not the draft entry.
    await dialog.getByRole('button',{name:'Réduire',exact:true}).click();
    await page.reload(); await adapt.click();
    await expect(modelChoice).toBeEnabled();
    await expect(modelChoice).toHaveValue('test-model-alpha');
    await page.screenshot({path:info.outputPath('codex-model-selection.png')});
    await dialog.getByLabel('Résolution du panorama').selectOption('2000');
    await dialog.getByLabel('Instructions de correction du décor').fill('Conserver les lignes de la première serre.');
    // A minimized draft retains its settings before generation starts.
    await dialog.getByRole('button',{name:'Réduire',exact:true}).click();
    await firstRow.getByRole('button',{name:'Rouvrir',exact:true}).click();
    await expect(dialog.getByLabel('Résolution du panorama')).toHaveValue('2000');
    await expect(modelChoice).toHaveValue('test-model-alpha');
    await expect(dialog.getByLabel('Instructions de correction du décor')).toHaveValue('Conserver les lignes de la première serre.');
    await dialog.getByRole('button',{name:'Générer le panorama 20:9',exact:true}).click();
    const firstId = await jobId();
    await expect(modelChoice).toBeDisabled();
    await dialog.getByRole('button',{name:'Réduire',exact:true}).click();
    await page.getByTestId('shot-card-1').click(); await adapt.click();
    await expect(dialog.getByLabel('Résolution du panorama')).toHaveValue('native');
    await expect(modelChoice).toHaveValue('test-model-alpha');
    await modelChoice.selectOption('test-model-beta');
    await dialog.getByLabel('Instructions de correction du décor').fill('Prolonger le jardin au crépuscule.');
    await dialog.getByRole('button',{name:'Générer le panorama 20:9',exact:true}).click();
    const secondId = await jobId(); expect(firstId).not.toBe(secondId);
    await dialog.getByRole('button',{name:'Réduire',exact:true}).click();
    await expect(page.locator('.background-jobs-heading')).toContainText('2 en cours');
    const states = await page.evaluate(async ids => Promise.all(ids.map(id => window.lunaria!.getBackgroundCorrection(id))),[firstId,secondId]);
    expect(states.map(job=>job.status)).toEqual(['generating','queued']);
    expect(states.map(job=>job.codexModel)).toEqual(['test-model-alpha','test-model-beta']);
    await expect(firstRow.locator('.background-job-model')).toContainText('test-model-alpha');
    await expect(secondRow.locator('.background-job-model')).toContainText('test-model-beta');
    await page.screenshot({path:info.outputPath('parallel-generations.png')});
    // The same image opens its existing job instead of launching a duplicate.
    await adapt.click(); expect(await jobId()).toBe(secondId);
    await dialog.getByRole('button',{name:'Réduire',exact:true}).click();
    await expect(page.locator('.background-job')).toHaveCount(2);
    await firstRow.getByRole('button',{name:'Rouvrir',exact:true}).click();
    await expect(dialog.getByLabel('Instructions de correction du décor')).toHaveValue('Conserver les lignes de la première serre.');
    await expect(modelChoice).toHaveValue('test-model-alpha');
    await dialog.getByRole('button',{name:'Annuler la génération',exact:true}).click();
    await expect(firstRow).toHaveCount(0); await expect(secondRow).toContainText('en cours');
    expect((await page.evaluate(id=>window.lunaria!.getBackgroundCorrection(id),firstId)).status).toBe('cancelled');
    await expect.poll(async () => (await page.evaluate(id=>window.lunaria!.getBackgroundCorrection(id),secondId)).status).toBe('generating');
    // Finish the second image while the first image's new modal is selected.
    await page.getByTestId('shot-card-0').click(); await adapt.click();
    await expect(modelChoice).toHaveValue('test-model-beta');
    await modelChoice.selectOption('');
    await dialog.getByLabel('Résolution du panorama').selectOption('2400');
    await dialog.getByRole('button',{name:'Générer le panorama 20:9',exact:true}).click();
    const retryId = await jobId();
    expect((await page.evaluate(id=>window.lunaria!.getBackgroundCorrection(id),retryId)).codexModel).toBeUndefined();
    await release(secondId); await expect(secondRow).toContainText('Proposition corrigée disponible');
    expect(await jobId()).toBe(retryId);
    await expect(dialog.getByLabel('Résolution du panorama')).toHaveValue('2400');
    await expect(dialog.getByRole('button',{name:'Tester dans ce plan'})).toHaveCount(0);
    await dialog.getByRole('button',{name:'Réduire',exact:true}).click();
    await secondRow.getByRole('button',{name:'Voir la proposition'}).click();
    await expect(dialog.getByAltText('Décor corrigé proposé par Codex')).toHaveJSProperty('naturalWidth',2000);
    const secondProposal = (await dialog.getByAltText('Décor corrigé proposé par Codex').getAttribute('src'))!;
    await expect(modelChoice).toHaveValue('test-model-beta');
    // A removed model stays visibly selected without discarding its proposal.
    await fs.writeFile(modelsFile,JSON.stringify(catalog.filter(model=>model.id !== 'test-model-beta')));
    await refreshModels.click();
    await expect(dialog.getByRole('alert')).toContainText('modèle mémorisé');
    await expect(modelChoice).toHaveValue('test-model-beta');
    await expect(dialog.getByRole('button',{name:'Générer une autre proposition',exact:true})).toBeDisabled();
    expect((await page.evaluate(id=>window.lunaria!.getBackgroundCorrection(id),secondId)).status).toBe('ready');
    await fs.writeFile(modelsFile,JSON.stringify(catalog)); await refreshModels.click();
    await expect(dialog.getByRole('alert')).toHaveCount(0);
    await modelChoice.selectOption('test-model-gamma');
    await expect(dialog.locator('.background-model-used')).toContainText('test-model-beta');
    await expect(secondRow.locator('.background-job-model')).toContainText('test-model-beta');
    // The first completion must not replace the second proposal in its open dialog.
    await release(retryId); await expect(firstRow).toContainText('Proposition corrigée disponible');
    await expect(dialog.getByAltText('Décor corrigé proposé par Codex')).toHaveAttribute('src',secondProposal);
    await dialog.getByRole('button',{name:'Tester dans ce plan'}).click();
    await expect(page.getByLabel('Nom du plan',{exact:true})).toHaveValue('Deuxième image');
    await expect(page.locator('[data-testid="scene"] image[data-background]')).toHaveAttribute('href',secondProposal);
    await firstRow.getByRole('button',{name:'Voir la proposition'}).click();
    await expect(dialog.getByAltText('Décor corrigé proposé par Codex')).toHaveJSProperty('naturalWidth',2400);
    const firstProposal = (await dialog.getByAltText('Décor corrigé proposé par Codex').getAttribute('src'))!;
    await dialog.getByRole('button',{name:'Tester dans ce plan'}).click();
    await expect(page.getByLabel('Nom du plan',{exact:true})).toHaveValue('Première image');
    await expect(page.locator('[data-testid="scene"] image[data-background]')).toHaveAttribute('href',firstProposal);
    await page.getByTestId('shot-card-1').click();
    await expect(page.locator('[data-testid="scene"] image[data-background]')).toHaveAttribute('href',secondProposal);
    await secondRow.getByRole('button',{name:'Revenir à l’original'}).click();
    await expect(page.locator('[data-testid="scene"] image[data-background]')).not.toHaveAttribute('href',secondProposal);
    await secondRow.getByRole('button',{name:'Voir la proposition'}).click();
    await dialog.getByRole('button',{name:'Remplacer le fichier d’origine'}).click();
    await expect(secondRow).toContainText('original sauvegardé'); await expect(firstRow).toContainText('Version corrigée en test');
    assertEqual(await fs.readFile(firstFile),firstOriginal);
    expect((await fs.readFile(secondFile)).equals(secondOriginal)).toBe(false);
    const backups = await fs.readdir(path.join(library,'.lunaria-backups/backgrounds'));
    expect(backups).toHaveLength(1); expect(backups[0]).toContain(secondId);
    assertEqual(await fs.readFile(path.join(library,'.lunaria-backups/backgrounds',backups[0])),secondOriginal);
    await page.setViewportSize({width:1000,height:800});
    await expect(adapt).toBeVisible(); await expect(firstRow.getByRole('button',{name:'Voir la proposition'})).toBeVisible();
    await page.getByRole('button',{name:'Replier le suivi'}).click();
    await expect(page.locator('#background-jobs-list')).toBeHidden();
    await page.getByRole('button',{name:'Afficher les traitements'}).click();
    await expect(firstRow).toBeVisible();
    await page.screenshot({path:info.outputPath('parallel-generations-narrow.png')});
    await firstRow.getByRole('button',{name:'Voir la proposition'}).click();
    await expect(dialog.getByRole('button',{name:'Réduire',exact:true})).toBeVisible();
    await modelChoice.selectOption('test-model-delta');
    await modelChoice.scrollIntoViewIfNeeded();
    const modelBounds = await modelChoice.boundingBox();
    expect(modelBounds).not.toBeNull();
    expect(modelBounds!.x).toBeGreaterThanOrEqual(0);
    expect(modelBounds!.x + modelBounds!.width).toBeLessThanOrEqual(1000);
    await page.screenshot({path:info.outputPath('codex-model-selection-narrow.png')});
    await dialog.getByRole('button',{name:'Abandonner',exact:true}).click();
    await expect(firstRow).toHaveCount(0); await expect(secondRow).toHaveCount(1);
    assertEqual(await fs.readFile(firstFile),firstOriginal);
    expect(JSON.parse(await fs.readFile(projectFile,'utf8'))).toEqual(project);
    expect(errors).toEqual([]);
  } finally {
    if(app){await app.evaluate(({BrowserWindow})=>{for(const window of BrowserWindow.getAllWindows())window.destroy();}).catch(()=>{});await app.close().catch(()=>{});}
    await fs.rm(folder,{recursive:true,force:true});
  }
});
