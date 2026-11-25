import { test, expect, _electron, type ElectronApplication } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FILE = 'C:/dev/Lunaria/HISTOIRE DE LUNARIA/Cinematiques studio/lunaria.game.json';

test('Noisetier: shield defense previews on the character sheet and survives save/reopen', async ({}, info) => {
  const before = await fs.readFile(FILE);
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-hazel-defense-'));
  const profile = path.join(temp, 'profile'), target = path.join(temp, 'noisetier.game.json');
  let app: ElectronApplication | undefined;
  const errors: string[] = [];
  try {
    await fs.mkdir(profile);
    await fs.writeFile(target, before);
    await fs.writeFile(path.join(profile, 'settings.json'), JSON.stringify({ libraryRoot: 'C:/dev/Lunaria/LunariaArtLibrary' }));
    await fs.writeFile(path.join(profile, 'game-recents.json'), JSON.stringify([{ path: target, title: 'Noisetier', updatedAt: new Date().toISOString() }]));
    const env = Object.fromEntries(Object.entries(process.env).filter((entry): entry is [string,string] => typeof entry[1] === 'string'));
    delete env.LUNARIA_DEV_URL;
    app = await _electron.launch({ args: [ROOT], env: { ...env, LUNARIA_E2E: '1', LUNARIA_TEST_USER_DATA: profile } });
    const page = await app.firstWindow();
    page.on('pageerror', error => errors.push(error.message));
    await page.waitForURL('app://studio/index.html');
    await expect(page.locator('.studio-project-state')).toContainText('noisetier.game.json');
    await app.evaluate(({ dialog }, file) => {
      dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [file] });
      dialog.showSaveDialog = async () => ({ canceled: false, filePath: file });
    }, target);
    async function selectHazel() {
      await page.locator('.studio-sections').getByRole('button', { name: /^Plantes/ }).click();
      await page.locator('.gd-catalog').getByRole('button', { name: /^Noisetier/ }).click();
      await page.getByRole('button', { name: 'Animations et sons de Noisetier', exact: true }).click();
      await expect(page.getByLabel('Animation pour Touché', { exact: true })).toHaveValue('hazel_defense');
      await page.getByRole('button', { name: /^Ses animations \(/ }).click();
      await expect(page.locator('.lp-owned-list').getByRole('button')).toHaveCount(2);
      await page.locator('.lp-owned-list').getByRole('button', { name: /^Noisetier — garde au bouclier/ }).click();
    }
    await selectHazel();
    await expect(page.getByLabel('Style de l’animation')).toHaveValue('combined');
    await expect(page.getByLabel('Images de l’animation').getByRole('button')).toHaveCount(4);
    for (const [time, region] of [['0.03', '0 0 627 612'], ['0.1', '627 0 627 612'], ['0.25', '0 612 627 612'], ['0.45', '627 612 627 612']]) {
      await page.getByLabel('Curseur temporel de l’animation').fill(time);
      await expect(page.locator('.lp-owned-editor .lp-preview svg image').first()).toHaveAttribute('width', '1254');
      await expect(page.locator('.lp-owned-editor .lp-preview svg svg').first()).toHaveAttribute('viewBox', region);
    }
    await page.locator('.lp-owned-editor .lp-preview').getByLabel('Ancrages', { exact: true }).uncheck();
    await page.getByLabel('Curseur temporel de l’animation').fill('0.1');
    await page.locator('.lp-owned-editor').screenshot({ path: info.outputPath('noisetier-studio.png') });
    await page.locator('.studio-modebar').getByRole('button', { name: 'Enregistrer le projet', exact: true }).click();
    await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
    const saved = JSON.parse(await fs.readFile(target, 'utf8'));
    expect(saved.presentation.profiles.find((p: { id: string }) => p.id === 'profile_hazel').slots).toContainEqual({ slot: 'hit', animationId: 'hazel_defense' });
    expect(saved.balance.plants.find((p: { id: string }) => p.id === 'hazel')).toEqual(JSON.parse(before.toString()).balance.plants.find((p: { id: string }) => p.id === 'hazel'));
    await page.getByRole('button', { name: 'Actions du fichier projet' }).click();
    await page.getByRole('button', { name: 'Ouvrir un projet…', exact: true }).click();
    await selectHazel();
    expect(errors).toEqual([]);
    expect(await fs.readFile(FILE)).toEqual(before);
  } finally {
    if (app) {
      await app.evaluate(({ BrowserWindow }) => { for (const window of BrowserWindow.getAllWindows()) window.destroy(); }).catch(() => undefined);
      await app.close();
    }
    await fs.rm(temp, { recursive: true, force: true });
  }
});
