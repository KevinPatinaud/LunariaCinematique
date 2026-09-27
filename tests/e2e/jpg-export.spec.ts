import { test, expect, _electron, type ElectronApplication } from '@playwright/test';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { newBubble, newCinematic, newShot } from '../../src/shared/model.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('exporte chaque plan en JPG dans son ordre, avec le titre et sans repères', async ({}, info) => {
  test.setTimeout(90_000);
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-jpg-export-'));
  const library = path.join(ROOT, 'example-library');
  const profile = path.join(dir, 'profile');
  const source = path.join(dir, 'film.cinematic.json');
  const destination = path.join(dir, 'exports');
  await fs.mkdir(profile);
  await fs.mkdir(destination);
  await fs.writeFile(path.join(profile, 'settings.json'), JSON.stringify({ libraryRoot: library }));
  const film = newCinematic();
  film.id = 'CIN_EXPORT_TEST';
  film.title = 'L’aube : Forêt';
  film.shots[0].name = 'Début';
  film.shots[0].background.asset = 'library://01_europe/lunaria/interieur_serre/greenhouse_aisle_wide_variant_v01.png';
  const bubble = newBubble(null);
  bubble.text = 'Bonjour Lunaria';
  film.shots[0].bubbles.push(bubble);
  const second = newShot();
  second.name = 'Suite';
  film.shots.push(second);
  await fs.writeFile(source, JSON.stringify(film));
  const env: NodeJS.ProcessEnv = { ...process.env, LUNARIA_E2E: '1', LUNARIA_TEST_USER_DATA: profile };
  delete env.LUNARIA_DEV_URL;
  let app: ElectronApplication | undefined;
  try {
    app = await _electron.launch({ args: [ROOT], env: env as Record<string, string> });
    const page = await app.firstWindow();
    await page.waitForURL('app://studio/index.html');
    await app.evaluate(({ dialog }, file) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [file] }); }, source);
    await page.getByRole('button', { name: 'Importer un film' }).click();
    await expect(page.getByLabel('Titre de la cinématique')).toHaveValue(film.title);
    await page.setViewportSize({ width: 1000, height: 800 });
    await expect(page.getByRole('button', { name: 'Exporter en JPG' })).toBeInViewport();
    await page.screenshot({ path: info.outputPath('export-button.png') });
    await app.evaluate(({ dialog }, folder) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [folder] }); }, destination);
    await page.getByRole('button', { name: 'Exporter en JPG' }).click();
    await expect(page.locator('.toast')).toContainText('2 JPG exportés', { timeout: 30_000 });
    const folder = path.join(destination, 'L’aube Forêt - JPG');
    const names = await fs.readdir(folder);
    expect(names).toEqual(['01 - L’aube Forêt.jpg', '02 - L’aube Forêt.jpg']);
    const files = await Promise.all(names.map(name => fs.readFile(path.join(folder, name))));
    for (const file of files) {
      expect(file.subarray(0, 2)).toEqual(Buffer.from([0xff, 0xd8]));
      expect(file.subarray(-2)).toEqual(Buffer.from([0xff, 0xd9]));
      expect(file.length).toBeGreaterThan(5000);
    }
    expect(files[0].equals(files[1])).toBe(false);
    const sizes = await app.evaluate(({ nativeImage }, files) => files.map(file => nativeImage.createFromPath(file).getSize()), names.map(name => path.join(folder, name)));
    expect(sizes).toEqual([{ width: 1600, height: 900 }, { width: 1600, height: 900 }]);
    await fs.copyFile(path.join(folder, names[0]), info.outputPath('export-first.jpg'));
    await page.getByRole('button', { name: 'Exporter en JPG' }).click();
    await expect.poll(async () => fs.readdir(path.join(destination, 'L’aube Forêt - JPG (2)')).catch(() => [])).toEqual(names);
    expect(await fs.readdir(folder)).toEqual(names);
  } finally {
    if (app) {
      await app.evaluate(({ BrowserWindow }) => { for (const window of BrowserWindow.getAllWindows()) window.destroy(); }).catch(() => undefined);
      await app.close().catch(() => undefined);
    }
    await fs.rm(dir, { recursive: true, force: true });
  }
});
