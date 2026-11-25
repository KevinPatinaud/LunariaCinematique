import { test, expect, _electron, type ElectronApplication, type Page } from '@playwright/test';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let app: ElectronApplication, page: Page, dir: string, target: string;

test.beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-lunas-ui-'));
  target = path.join(dir, 'lunas.game.json');
  const env = Object.fromEntries(
    Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  );
  delete env.LUNARIA_DEV_URL;
  app = await _electron.launch({
    args: [ROOT],
    env: { ...env, LUNARIA_E2E: '1', LUNARIA_TEST_USER_DATA: path.join(dir, 'profile') },
  });
  page = await app.firstWindow();
  await page.waitForURL('app://studio/index.html');
  await app.evaluate(({ dialog }, destination) => {
    dialog.showSaveDialog = async () => ({ canceled: false, filePath: destination });
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [destination] });
    dialog.showMessageBox = async () => ({ response: 1, checkboxChecked: false });
  }, target);
});

test.afterEach(async () => {
  if (app) {
    const child = app.process();
    try {
      await app.evaluate(({ app }) => {
        setTimeout(() => app.exit(0), 0);
      });
    } catch {}
    await Promise.race([app.close().catch(() => {}), new Promise<void>((resolve) => setTimeout(resolve, 5000))]);
    if (child.exitCode === null) child.kill();
  }
  await fs.rm(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
});

test('new levels select all Luna objectives and both editors persist changes', async () => {
  await page.locator('.studio-sections').getByRole('button', { name: 'Campagne', exact: true }).click();
  await page.getByRole('button', { name: 'Créer un premier niveau' }).click();
  await page.locator('.studio-sections').getByRole('button', { name: /^Niveaux/ }).click();

  await page.getByRole('navigation', { name: 'Édition du niveau' }).getByRole('button', { name: 'Lunas', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Objectifs complémentaires', exact: true })).toBeVisible();
  for (const name of ['Sans perte', 'Sans pluie', 'Biodiversité']) {
    await expect(page.getByRole('checkbox', { name, exact: true })).toBeChecked();
  }
  await expect(page.getByText(/1\s000 Lunas/)).toBeVisible();
  await expect(page.getByText('750 Lunas')).toBeVisible();

  await page.setViewportSize({ width: 1280, height: 900 });
  await fs.mkdir(path.join(ROOT, 'work/luna-gains'), { recursive: true });
  await page.screenshot({ path: path.join(ROOT, 'work/luna-gains/level-lunas.png') });

  await page.getByRole('checkbox', { name: 'Sans pluie', exact: true }).uncheck();
  await expect(page.getByText('500 Lunas')).toBeVisible();

  await page.getByRole('region', { name: 'Objectifs complémentaires', exact: true })
    .getByRole('button', { name: 'Économie Luna', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Économie Luna' })).toBeVisible();
  const table = page.getByRole('table', { name: 'Objectifs complémentaires par niveau' });
  await expect(table.getByRole('checkbox', { name: /^Sans pluie —/ })).not.toBeChecked();
  const noLoss = table.getByRole('checkbox', { name: /^Sans perte —/ });
  await noLoss.uncheck();
  await noLoss.check();
  await table.getByRole('checkbox', { name: /^Biodiversité —/ }).uncheck();

  const openLevel = table.getByRole('button', { name: /^Ouvrir la fiche Luna de / });
  await openLevel.click();
  await expect(page.getByRole('checkbox', { name: 'Biodiversité', exact: true })).not.toBeChecked();
  await expect(page.getByText('250 Lunas')).toBeVisible();
  await page.getByRole('region', { name: 'Objectifs complémentaires', exact: true })
    .getByRole('button', { name: 'Économie Luna', exact: true }).click();

  await expect(page.getByLabel('Chance de drop par ennemi (%)')).toBeHidden();
  await page.screenshot({ path: path.join(ROOT, 'work/luna-gains/economy-overview.png') });
  await page.getByText('Drops aléatoires sur les pollueurs', { exact: true }).click();
  await expect(page.getByLabel('Chance de drop par ennemi (%)')).toHaveValue('10');
  await expect(page.getByLabel('Petit gain (Lunas)')).toHaveValue('5');
  await expect(page.getByLabel('Grand gain (Lunas)')).toHaveValue('25');
  await expect(page.getByLabel('Part du grand gain (%)')).toHaveValue('20');

  await page.getByLabel('Chance de drop par ennemi (%)').fill('12.5');
  await page.getByLabel('Chance de drop par ennemi (%)').press('Tab');
  await page.getByLabel('Petit gain (Lunas)').fill('10');
  await page.getByLabel('Petit gain (Lunas)').press('Tab');
  await page.getByLabel('Grand gain (Lunas)').fill('40');
  await page.getByLabel('Grand gain (Lunas)').press('Tab');
  await page.getByLabel('Part du grand gain (%)').fill('25');
  await page.getByLabel('Part du grand gain (%)').press('Tab');

  // Save and verify JSON
  await page.locator('.studio-modebar').getByRole('button', { name: 'Enregistrer le projet' }).click();
  await expect
    .poll(async () => {
      try {
        return JSON.parse(await fs.readFile(target, 'utf8')).lunas?.enemyDrop?.chance;
      } catch {
        return null;
      }
    })
    .toBe(0.125);

  const saved = JSON.parse(await fs.readFile(target, 'utf8'));
  expect(saved.lunas.enemyDrop).toEqual({
    enabled: true,
    chance: 0.125,
    smallAmount: 10,
    largeAmount: 40,
    largeChance: 0.25,
  });
  expect(saved.levels[0].lunaRewards).toEqual({
    firstClear: 1000,
    mastery: {
      noPlantLost: 250,
      noRain: 0,
      biodiversity: 0,
    },
  });
  expect(saved.rewards).toBeUndefined();

  await page.getByRole('button', { name: 'Actions du fichier projet' }).click();
  await page.getByRole('button', { name: 'Ouvrir un projet…', exact: true }).click();
  await expect(page.getByText('Projet ouvert.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Plus de sections et options avancées' }).click();
  await page.getByRole('region', { name: 'Autres écrans et options avancées' })
    .getByRole('button', { name: /^Économie Luna/ }).click();
  await expect(noLoss).toBeChecked();
  await expect(table.getByRole('checkbox', { name: /^Sans pluie —/ })).not.toBeChecked();
  await expect(table.getByRole('checkbox', { name: /^Biodiversité —/ })).not.toBeChecked();
});
