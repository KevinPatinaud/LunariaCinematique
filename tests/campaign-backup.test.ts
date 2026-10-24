import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { campaignBackupAssets, campaignBackupLibrary, createCampaignBackup } from '../src/main/campaignBackup.js';
import { GameDocuments } from '../src/main/gameDocuments.js';
import { parseGameProject } from '../src/shared/game/validation.js';
import { newCinematic } from '../src/shared/model.js';
import { seedProject } from './fixtures/seed40.js';
import { fixturePresentation, PIXEL_PNG } from './presentation-fixture.js';

async function fixture(run: (root: string, library: string, destination: string, project: ReturnType<typeof seedProject>) => Promise<void>) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-campaign-backup-'));
  try {
    const library = path.join(root, 'library'), destination = path.join(root, 'backups');
    await fs.mkdir(library); await fs.mkdir(destination);
    const project = fixturePresentation(seedProject(), 'library://pixel.png');
    const film = newCinematic(); film.id = 'CIN_SAUVEGARDE'; film.title = 'Un film hors parcours';
    film.shots[0].background.asset = 'library://décors/jardin.png';
    film.shots[0].audio = { asset: 'library://sons/ambiance.ogg', volume: .7, loop: true };
    project.cinematics = [film];
    project.campaign = { steps: [{id:'step_backup',kind:'level',levelId:project.levels[0].id}], cinematics: [] };
    for (const ref of campaignBackupAssets(project)) {
      const file = path.join(library, ...ref.slice(10).split('/'));
      await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, PIXEL_PNG);
    }
    await run(root, library, destination, project);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
}

test('snapshot retains all authored data, resources and active document ownership', () => fixture(async (root, library, destination, project) => {
  const docs = new GameDocuments(path.join(root,'profile'));
  const saved = await docs.save(project, '', path.join(root,'working.game.json'));
  const recents = (await docs.bootstrap()).recent;
  const source = await fs.readFile(saved.path), original = structuredClone(project);
  const changed = structuredClone(project); changed.levels[1].title = 'Modification non enregistrée';
  const snapshot = await createCampaignBackup(changed, library, destination);
  const restored = JSON.parse(await fs.readFile(snapshot.path,'utf8'));
  assert.deepEqual(restored, parseGameProject(changed));
  assert.equal(restored.levels.length, 40); assert.equal(restored.cinematics![0].title, 'Un film hors parcours');
  for (const ref of campaignBackupAssets(changed)) assert.deepEqual(await fs.readFile(path.join(snapshot.folder,'LunariaArtLibrary',...ref.slice(10).split('/'))), await fs.readFile(path.join(library,...ref.slice(10).split('/'))));
  assert.deepEqual(await fs.readFile(saved.path), source);
  assert.equal(docs.currentPath(saved.token), saved.path);
  assert.deepEqual((await docs.bootstrap()).recent, recents);
  assert.deepEqual(project, original);
  assert.equal((await docs.save(changed,saved.token)).path,saved.path);
}));

test('same-second backups remain distinct and reopen after moving without their source library', () => fixture(async (root, library, destination, project) => {
  const now = new Date('2026-10-10T12:13:14Z');
  const originalTitle = project.title, first = await createCampaignBackup(project,library,destination,now);
  project.title = 'Une autre version';
  const second = await createCampaignBackup(project,library,destination,now);
  assert.notEqual(first.folder,second.folder);
  assert.equal(JSON.parse(await fs.readFile(first.path,'utf8')).title,originalTitle);
  const moved = path.join(root,'moved');await fs.rename(first.folder,moved);await fs.rm(library,{recursive:true});
  assert.equal(await campaignBackupLibrary(path.join(moved,'lunaria.game.json')),path.join(moved,'LunariaArtLibrary'));
}));

test('missing resources and nonembedded films refuse an incomplete snapshot', () => fixture(async (_root, library, destination, project) => {
  await fs.unlink(path.join(library,'sons','ambiance.ogg'));
  await assert.rejects(createCampaignBackup(project,library,destination),/Ressource introuvable/);
  assert.deepEqual(await fs.readdir(destination),[]);
  await assert.rejects(createCampaignBackup(project,'',destination),/Connecte la bibliothèque/);
  project.campaign!.cinematics.push({id:'film_missing',title:'Film manquant',file:'missing.cinematic.json',documentId:'CIN_ABSENT'});
  await assert.rejects(createCampaignBackup(project,library,destination),/Intègre la cinématique/);
  assert.deepEqual(await fs.readdir(destination),[]);
}));

test('opening detects a changed asset or project and an omitted resource in the manifest', () => fixture(async (_root, library, destination, project) => {
  const snapshot = await createCampaignBackup(project,library,destination);
  const file = path.join(snapshot.folder,'LunariaArtLibrary','pixel.png');
  await fs.writeFile(file,'damaged');await assert.rejects(campaignBackupLibrary(snapshot.path),/endommagée/);
  await fs.writeFile(file,PIXEL_PNG);
  const text = await fs.readFile(snapshot.path,'utf8');await fs.writeFile(snapshot.path,text+' ');
  await assert.rejects(campaignBackupLibrary(snapshot.path),/endommagée/);await fs.writeFile(snapshot.path,text);
  const manifestFile=path.join(snapshot.folder,'sauvegarde.lunaria.json'),manifest=JSON.parse(await fs.readFile(manifestFile,'utf8'));
  manifest.files=manifest.files.filter((item:{path:string})=>!item.path.endsWith('ambiance.ogg'));
  await fs.writeFile(manifestFile,JSON.stringify(manifest));
  await assert.rejects(campaignBackupLibrary(snapshot.path),/absente du manifeste/);
}));

test('ordinary projects need no manifest and invalid manifest paths cannot escape', () => fixture(async (_root, library, destination, project) => {
  assert.equal(await campaignBackupLibrary(path.join(destination,'working.game.json')),null);
  const snapshot=await createCampaignBackup(project,library,destination);
  const file=path.join(snapshot.folder,'sauvegarde.lunaria.json'),manifest=JSON.parse(await fs.readFile(file,'utf8'));
  manifest.files[0].path='LunariaArtLibrary/../../outside.png';await fs.writeFile(file,JSON.stringify(manifest));
  await assert.rejects(campaignBackupLibrary(snapshot.path),/manifeste.*invalide/);
}));
