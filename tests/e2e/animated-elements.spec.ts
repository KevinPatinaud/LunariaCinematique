import { test, expect, _electron, type ElectronApplication } from '@playwright/test';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { publishCampaign } from '../../src/main/campaignPublisher.js';
import { newCinematic } from '../../src/shared/model.js';
import type { GameProject } from '../../src/shared/game/types.js';
import { parseGameProject } from '../../src/shared/game/validation.js';
import { seedProject } from '../fixtures/seed40.js';
import { fixturePresentation, PIXEL_PNG } from '../presentation-fixture.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('creates, places, saves, reopens and publishes fixed-image animations', async ({}, info) => {
  test.setTimeout(120000);
  const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-elements-'));
  const profile = path.join(folder, 'profile'), library = path.join(folder, 'library');
  const file = path.join(folder, 'test.game.json'), game = info.outputPath('published');
  const asset = (name: string) => `library://07_props/${name}.png` as const;
  let app: ElectronApplication | undefined;
  try {
    await fs.mkdir(profile);
    await fs.mkdir(path.join(library, '07_props'), { recursive: true });
    for (const name of ['wheel', 'smoke', 'drop', 'splash'])
      await fs.writeFile(path.join(library, '07_props', `${name}.png`), PIXEL_PNG);
    const project = fixturePresentation(seedProject(), asset('wheel'));
    const film = newCinematic();
    film.title = 'Démo des éléments';
    film.shots[0].duration = 8;
    project.cinematics = [film];
    project.levels = project.levels.slice(0, 1);
    project.campaign = {
      cinematics: [{ id: 'film_elements', title: film.title, documentId: film.id, file: 'elements.cinematic.json' }],
      steps: [{ id: 'intro', kind: 'cinematic', cinematicId: 'film_elements', skippable: true },
        { id: 'level', kind: 'level', levelId: project.levels[0].id }],
    };
    await fs.writeFile(file, JSON.stringify(parseGameProject(project)));
    await fs.writeFile(path.join(profile, 'settings.json'), JSON.stringify({ libraryRoot: library }));
    const env = { ...process.env, LUNARIA_E2E: '1', LUNARIA_TEST_USER_DATA: profile };
    delete (env as NodeJS.ProcessEnv).LUNARIA_DEV_URL;
    app = await _electron.launch({ args: [root], env: env as Record<string, string> });
    const page = await app.firstWindow();
    await page.waitForURL('app://studio/index.html');
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await app.evaluate(({ dialog, BrowserWindow }, target) => {
      BrowserWindow.getAllWindows()[0].setSize(1500, 950);
      dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [target] });
      dialog.showMessageBox = async () => ({ response: 1, checkboxChecked: false });
    }, file);
    async function openProject() {
      await page.getByRole('button', { name: 'Actions du fichier projet' }).click();
      await page.getByRole('button', { name: 'Ouvrir un projet…', exact: true }).click();
      await expect(page.getByLabel('Titre de la cinématique')).toHaveValue(film.title);
    }
    await openProject();
    await page.getByRole('tab', { name: /Éléments animés/ }).click();
    const gallery = page.getByLabel('Bibliothèque de ressources');
    async function chooseImage(name: string) {
      const picker = page.getByRole('dialog', { name: /Bibliothèque d’images pour/ });
      await picker.locator(`[data-asset-ref="${asset(name)}"]`).dblclick();
    }
    for (const [preset, name, image] of [['rotate', 'Roue peinte', 'wheel'], ['float', 'Fumée', 'smoke'], ['fall', 'Goutte', 'drop'], ['exhale', 'Souffle', 'smoke']]) {
      await gallery.getByRole('button', { name: 'Créer un élément animé' }).click();
      const editor = page.getByRole('dialog', { name: 'Créer un élément animé' });
      await editor.getByLabel('Nom de l’élément').fill(name);
      await editor.getByLabel('Préréglage').selectOption(preset);
      await editor.getByRole('button', { name: 'Choisir une image' }).click();
      await chooseImage(image);
      if (preset === 'fall') {
        await editor.getByRole('button', { name: 'Choisir une image' }).nth(1).click();
        await chooseImage('splash');
        await editor.screenshot({ path: info.outputPath('editor.png') });
      }
      if (preset === 'exhale') {
        const height = editor.getByLabel('Taille à l’insertion (% de la hauteur du plan)');
        await height.fill('10');
        await height.press('Tab');
      }
      await editor.getByRole('button', { name: 'Enregistrer l’élément' }).click();
      await expect(editor).toHaveCount(0);
      const tile = gallery.getByRole('button', { name: new RegExp('^' + name) });
      if (preset === 'float' || preset === 'exhale') await tile.dragTo(page.getByTestId('scene'), { targetPosition: { x: 120, y: 160 } });
      else {
        await tile.click();
        await gallery.getByRole('button', { name: 'Ajouter au plan' }).click();
      }
      await expect(page.locator(`.scene-svg [data-element-preset="${preset}"] image`)).toHaveAttribute('href', /lunaria-asset/);
    }
    const origin = page.locator('.scene-svg [data-element-preset="exhale"] [data-element-origin]');
    await expect(origin).toBeVisible();
    const sceneBox = (await page.getByTestId('scene').boundingBox())!;
    const originBox = (await origin.boundingBox())!;
    expect(originBox.x + originBox.width / 2 - sceneBox.x).toBeCloseTo(120, -1);
    expect(originBox.y + originBox.height / 2 - sceneBox.y).toBeCloseTo(160, -1);
    await page.getByRole('button', { name: 'Inverser le sens de la fumée' }).click();
    const mirroredOrigin = (await origin.boundingBox())!;
    expect(mirroredOrigin.x).toBeCloseTo(originBox.x, 0);
    expect(mirroredOrigin.y).toBeCloseTo(originBox.y, 0);
    await page.getByRole('button', { name: 'Sélectionner Goutte', exact: true }).click();
    const start = page.getByLabel('Déclenchement (s)', { exact: true });
    await start.fill('1,25');
    await start.press('Tab');
    const speed = page.getByLabel('Vitesse (×)', { exact: true });
    await speed.fill('1,5');
    await speed.press('Tab');
    await page.getByRole('button', { name: 'Prévisualiser dans le plan' }).click();
    await page.getByRole('button', { name: 'Pause des mouvements' }).click();
    const clock = page.getByLabel('Temps de l’aperçu des mouvements');
    const movingDrop = page.locator('.scene-svg [data-element-preset="fall"] image');
    await clock.fill('1');
    await expect(movingDrop).toHaveCount(0);
    await clock.fill('1.5');
    await expect(movingDrop).toHaveAttribute('href', /drop\.png/);
    await clock.fill('1.78');
    await expect(movingDrop).toHaveAttribute('href', /splash\.png/);
    await clock.fill('2');
    await expect(movingDrop).toHaveCount(0);
    const wheel = page.locator('.scene-svg [data-element-preset="rotate"] image');
    await clock.fill('0.5');
    await expect(wheel).toHaveAttribute('transform', /rotate\(90\)/);
    await expect(page.locator('.scene-svg [data-element-preset="float"] image')).toHaveAttribute('opacity', '0.5877852522924731');
    await page.getByRole('button', { name: 'Retour au placement' }).click();
    await page.getByRole('button', { name: 'Enregistrer le projet' }).click();
    await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
    const saved: GameProject = JSON.parse(await fs.readFile(file, 'utf8'));
    const added = saved.cinematics![0].shots[0].actors;
    expect(added.map(actor => actor.name)).toEqual(['Roue peinte', 'Fumée', 'Goutte', 'Souffle']);
    expect(added[3].height).toBeCloseTo(0.1);
    expect(added[2].animation).toMatchObject({ speed: 1.5, elementPlayback: { start: 1.25, loop: false } });
    expect(added[1].x).toBeLessThan(0.4);
    await openProject();
    await expect(page.locator('.scene-svg [data-element-preset]')).toHaveCount(4);
    await page.screenshot({ path: info.outputPath('studio.png') });
    for (const marker of ['project.godot', 'app/controllers/campaign_flow.gd', 'domain/logic/event_runtime.gd', 'domain/presentation/animation_registry.gd']) {
      const target = path.join(game, marker);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, marker.endsWith('.godot') ? '[application]' : 'extends RefCounted');
    }
    const result = await publishCampaign(saved, game, library);
    const published: GameProject = JSON.parse(await fs.readFile(result.path, 'utf8'));
    const publishedFilm = JSON.parse(await fs.readFile(path.join(game, published.campaign!.cinematics[0].file), 'utf8'));
    expect(publishedFilm.shots[0].actors[2].animation).toEqual(added[2].animation);
    expect(published.presentation!.animations.find(clip => clip.id === added[2].animation!.animationId)?.frames[1].asset).toBe(asset('splash'));
    expect(await fs.readFile(path.join(game, 'LunariaArtLibrary/07_props/splash.png'))).toEqual(PIXEL_PNG);
    expect(errors).toEqual([]);
  } finally {
    await app?.close();
    await fs.rm(folder, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
  }
});
