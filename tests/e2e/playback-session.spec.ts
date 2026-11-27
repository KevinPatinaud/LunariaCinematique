import { test, expect, _electron, type ElectronApplication, type Page } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { newCinematic, newShot } from '../../src/shared/model.js';
import { seedProject } from '../fixtures/seed40.js';
import { PIXEL_PNG } from '../presentation-fixture.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let app: ElectronApplication, page: Page, dir: string, file: string, original: string;
let pageErrors: string[];
type DeferredImages = Window & { pendingImages: number; releaseImages(): Promise<void> };

test.beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-playback-session-'));
  const library = path.join(dir, 'library'), profile = path.join(dir, 'profile');
  await fs.mkdir(library); await fs.mkdir(profile);
  await fs.writeFile(path.join(library, 'normal.png'), PIXEL_PNG);
  await fs.writeFile(path.join(library, 'slow.png'), PIXEL_PNG);
  await fs.writeFile(path.join(profile, 'settings.json'), JSON.stringify({ libraryRoot: library }));
  const first = newCinematic(); first.id = 'FILM_FIRST'; first.title = 'Premier film';
  first.shots = [newShot('library://normal.png'), newShot('library://slow.png')];
  first.shots.forEach(shot => { shot.duration = 20; });
  const second = newCinematic(); second.id = 'FILM_SECOND'; second.title = 'Second film';
  second.shots = [newShot('library://normal.png')]; second.shots[0].duration = 20;
  const project = seedProject(); project.cinematics = [first, second];
  file = path.join(dir, 'preview.game.json'); original = JSON.stringify(project);
  await fs.writeFile(file, original);
  const env = { ...process.env, LUNARIA_E2E: '1', LUNARIA_TEST_USER_DATA: profile };
  delete env.LUNARIA_DEV_URL;
  app = await _electron.launch({ args: [ROOT], env: env as Record<string, string> });
  page = await app.firstWindow(); pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.waitForURL('app://studio/index.html');
  await page.evaluate(() => {
    const target = window as DeferredImages;
    const descriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')!;
    const pending: { image: HTMLImageElement; source: string }[] = [];
    target.pendingImages = 0;
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      ...descriptor,
      set(this: HTMLImageElement, source: string) {
        if (source.includes('slow.png')) {
          pending.push({ image: this, source }); target.pendingImages = pending.length;
        } else descriptor.set!.call(this, source);
      },
    });
    target.releaseImages = async () => {
      await Promise.all(pending.splice(0).map(({ image, source }) => new Promise<void>(resolve => {
        image.addEventListener('load', () => resolve(), { once: true });
        image.addEventListener('error', () => resolve(), { once: true });
        descriptor.set!.call(image, source);
      })));
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    };
  });
  await app.evaluate(({ dialog }, file) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [file] });
    dialog.showMessageBox = async () => ({ response: 1, checkboxChecked: false });
  }, file);
  await expect(page.locator('.studio-save')).toBeEnabled();
  await page.getByRole('button', { name: 'Actions du fichier projet' }).click();
  await page.getByRole('button', { name: 'Ouvrir un projet…', exact: true }).click();
  await expect(page.getByLabel('Titre de la cinématique')).toHaveValue('Premier film');
});

test.afterEach(async () => {
  if (app) {
    await app.evaluate(({ BrowserWindow }) => { for (const window of BrowserWindow.getAllWindows()) window.destroy(); }).catch(() => {});
    await app.close();
  }
  expect(await fs.readFile(file, 'utf8')).toBe(original);
  await fs.rm(dir, { recursive: true, force: true });
  expect(pageErrors).toEqual([]);
});

async function startDelayedPreview() {
  await page.getByTestId('shot-card-1').click();
  await page.getByTestId('play-from-current').click();
  await expect.poll(() => page.evaluate(() => (window as DeferredImages).pendingImages)).toBeGreaterThan(0);
}

test('changing films during preload cancels the old start and keeps the new film in editing mode', async ({}, info) => {
  await startDelayedPreview();
  await expect(page.getByRole('button', { name: 'Quitter l’aperçu', exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath('chargement-annulable.png') });
  await page.getByLabel('Cinématique du projet').selectOption('FILM_SECOND');
  await expect(page.getByLabel('Titre de la cinématique')).toHaveValue('Second film');
  await page.evaluate(() => (window as DeferredImages).releaseImages());
  await expect(page.getByRole('button', { name: 'Quitter l’aperçu', exact: true })).toHaveCount(0);
  await expect(page.getByTestId('play-all')).toBeEnabled();
  await expect(page.locator('.canvas-topline')).not.toContainText('Lecture');
});

test('a pending preview can be stopped immediately and never starts when the image finally loads', async () => {
  await startDelayedPreview();
  await page.getByRole('button', { name: 'Quitter l’aperçu', exact: true }).click();
  await expect(page.getByTestId('play-all')).toBeEnabled();
  await page.evaluate(() => (window as DeferredImages).releaseImages());
  await expect(page.getByRole('button', { name: 'Quitter l’aperçu', exact: true })).toHaveCount(0);
  await expect(page.getByLabel('Titre de la cinématique')).toHaveValue('Premier film');
});

test('adding an unrelated image to the watched library keeps playback running', async () => {
  await startDelayedPreview();
  await page.evaluate(() => (window as DeferredImages).releaseImages());
  await expect(page.locator('.canvas-topline')).toContainText('Lecture · Plan 02 / 2');

  const refreshed = page.waitForEvent('console', {
    predicate: message => message.text() === 'Unrelated image scanned',
  });
  await page.evaluate(() => {
    const stopListening = window.lunaria!.onLibraryChanged(snapshot => {
      if (!snapshot.assets.some(asset => asset.ref === 'library://unrelated.png')) return;
      stopListening();
      console.info('Unrelated image scanned');
    });
  });
  await fs.writeFile(path.join(dir, 'library', 'unrelated.png'), PIXEL_PNG);
  await refreshed;

  const timecode = page.locator('.timecode');
  await expect(timecode).toBeVisible();
  const elapsed = await timecode.innerText();
  await expect(timecode).not.toHaveText(elapsed);
  await expect(page.locator('.canvas-topline')).toContainText('Lecture · Plan 02 / 2');
});
