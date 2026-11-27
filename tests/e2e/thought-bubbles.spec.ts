import { test, expect, _electron, type ElectronApplication } from '@playwright/test';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedProject } from '../../src/shared/game/seed.js';
import { newActor, newBubble, newCinematic, type Asset } from '../../src/shared/model.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('adds, converts, saves and plays a thought bubble alongside dialogue', async ({}, info) => {
  test.setTimeout(90_000);
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-thought-'));
  const profile = path.join(dir, 'profile');
  const library = path.join(ROOT, 'example-library');
  const source = path.join(dir, 'thought.game.json');
  let app: ElectronApplication | undefined;
  try {
    await fs.mkdir(profile);
    await fs.writeFile(path.join(profile, 'settings.json'), JSON.stringify({ libraryRoot: library }));
    const film = newCinematic();
    const shot = film.shots[0];
    shot.name = 'Dans la serre';
    shot.background.asset = 'library://01_europe/lunaria/interieur_serre/greenhouse_aisle_wide_variant_v01.png';
    const actorAsset: Asset = {
      ref: 'library://06_ui/dialogues/tooltip_ornate_v01.png',
      path: '06_ui/dialogues/tooltip_ornate_v01.png', name: 'Rose', folder: '06_ui',
      kind: 'character', bytes: 1, modified: 0, url: '', thumbnail: '',
    };
    const actor = newActor(actorAsset, 1.5, 0.62, 0.55);
    shot.actors.push(actor);
    const dialogue = newBubble(actor.id);
    dialogue.x = 0.15;
    dialogue.y = 0.24;
    dialogue.text = 'Tu viens, Rose ?';
    dialogue.style = 'simple';
    dialogue.frameAsset = 'library://06_ui/dialogues/dialogue_panel_simple_v01.png';
    shot.bubbles.push(dialogue);
    const project = seedProject();
    project.levels = [];
    project.campaign = { steps: [], cinematics: [] };
    project.cinematics = [film];
    await fs.writeFile(source, JSON.stringify(project));

    const env: NodeJS.ProcessEnv = { ...process.env, LUNARIA_E2E: '1', LUNARIA_TEST_USER_DATA: profile };
    delete env.LUNARIA_DEV_URL;
    app = await _electron.launch({ args: [ROOT], env: env as Record<string, string> });
    const page = await app.firstWindow();
    await page.waitForURL('app://studio/index.html');
    await app.evaluate(({ dialog }, file) => {
      dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [file] });
    }, source);
    async function openProject() {
      await page.getByRole('button', { name: 'Actions du fichier projet' }).click();
      await page.getByRole('button', { name: 'Ouvrir un projet…', exact: true }).click();
      await expect(page.getByLabel('Nom du plan')).toHaveValue(shot.name);
    }
    await openProject();
    const type = page.getByRole('group', { name: 'Type de bulle' });
    await page.getByRole('button', { name: 'Sélectionner 1. Tu viens, Rose ?', exact: true }).click();
    await type.getByRole('button', { name: 'Pensée' }).click();
    await expect(page.getByTestId(`bubble-${dialogue.id}`).getByTestId('thought-paper')).toBeVisible();
    await expect(page.getByTestId('thought-trail').locator('circle')).toHaveCount(3);
    await expect(page.getByLabel('Texte de la bulle')).toHaveValue(dialogue.text);
    await type.getByRole('button', { name: 'Dialogue' }).click();
    await expect(page.getByTestId('thought-trail')).toHaveCount(0);

    await page.getByRole('button', { name: 'Sélectionner Rose' }).click();
    await page.getByRole('button', { name: 'Ajouter une bulle de pensée' }).click();
    await expect(type.getByRole('button', { name: 'Pensée', pressed: true })).toBeVisible();
    await expect(page.getByLabel('Personnage de la bulle')).toHaveValue(actor.id);
    const text = 'J’ai entendu quelque chose près des plantes.';
    await page.getByLabel('Texte de la bulle').fill(text);
    const trailMode = page.getByLabel(/Pastilles de la pensée/);
    await trailMode.selectOption('none');
    await expect(page.getByTestId('thought-trail')).toHaveCount(0);
    await trailMode.selectOption('manual');
    await expect(page.getByTestId('tail-handle')).toBeVisible();
    await trailMode.selectOption('auto');
    await expect(page.getByTestId('thought-trail').locator('circle')).toHaveCount(3);

    await page.getByRole('button', { name: 'Enregistrer le projet' }).click();
    const readBubbles = async () => JSON.parse(await fs.readFile(source, 'utf8')).cinematics[0].shots[0].bubbles;
    await expect.poll(async () => (await readBubbles()).map((bubble: { kind: string }) => bubble.kind)).toEqual(['speech', 'thought']);
    const [, thought] = await readBubbles();
    expect(thought).toMatchObject({ kind: 'thought', text, speakerId: actor.id, tail: { mode: 'auto' } });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 10_000 });
    await openProject();
    const previewThought = page.getByTestId(`bubble-${thought.id}`);
    await expect(previewThought.getByTestId('thought-paper').locator('image')).toHaveCount(9);
    await expect(previewThought.getByTestId('thought-trail').locator('circle')).toHaveCount(3);
    await page.getByRole('button', { name: 'Tout lire', exact: true }).click();
    const previewDialogue = page.getByTestId(`bubble-${dialogue.id}`);
    await expect(previewDialogue).toBeVisible();
    await expect(previewThought).toHaveCount(0);
    await page.getByRole('button', { name: /^Cliquer pour continuer/ }).click();
    await expect(previewThought.getByTestId('thought-trail').locator('circle')).toHaveCount(3);
    await page.screenshot({ path: info.outputPath('thought-preview.png') });
  } finally {
    if (app) {
      await app.evaluate(({ BrowserWindow }) => {
        for (const window of BrowserWindow.getAllWindows()) window.destroy();
      }).catch(() => undefined);
      await app.close().catch(() => undefined);
    }
    await fs.rm(dir, { recursive: true, force: true });
  }
});
