import { test, expect, _electron, type ElectronApplication } from '@playwright/test';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('browse, search and create films within the same project', async ({}, info) => {
  test.setTimeout(90000);
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-films-e2e-'));
  const file = path.join(dir, 'films.game.json');
  const backupFile = path.join(dir, 'films-backup.game.json');
  const env: NodeJS.ProcessEnv = { ...process.env, LUNARIA_E2E: '1', LUNARIA_TEST_USER_DATA: path.join(dir, 'profile') };
  delete env.LUNARIA_DEV_URL;
  let app: ElectronApplication | undefined;
  try {
    app = await _electron.launch({ args: [ROOT], env: env as Record<string, string> });
    const page = await app.firstWindow();
    await page.waitForURL('app://studio/index.html');
    await page.setViewportSize({ width: 1462, height: 900 });
    await app.evaluate(({ dialog }, targets) => {
      let saveDialogCount = 0;
      dialog.showSaveDialog = async () => ({ canceled: false, filePath: targets[Math.min(saveDialogCount++, targets.length - 1)] });
      dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [targets[0]] });
      dialog.showMessageBox = async () => ({ response: 1, checkboxChecked: false });
    }, [file, backupFile]);

    await page.locator('.top-actions').getByRole('button', { name: /Toutes les cinématiques/ }).click();
    let browser = page.getByRole('dialog', { name: 'Toutes les cinématiques' });
    await expect(browser).toContainText('Ce projet ne contient encore aucune cinématique.');
    await browser.getByRole('button', { name: '+ Nouvelle cinématique' }).click();
    await expect(page.getByLabel('Titre de la cinématique')).toBeFocused();
    await page.getByLabel('Titre de la cinématique').fill('Le départ');
    await page.locator('.top-actions').getByRole('button', { name: 'Nouvelle cinématique' }).click();
    await page.getByLabel('Titre de la cinématique').fill('Le jardin');
    await page.locator('.top-actions').getByRole('button', { name: 'Nouvelle cinématique' }).click();
    await page.getByLabel('Titre de la cinématique').fill('Le retour');

    await page.locator('.top-actions').getByRole('button', { name: /Toutes les cinématiques/ }).click();
    browser = page.getByRole('dialog', { name: 'Toutes les cinématiques' });
    await expect(browser.locator('.cinematics-browser-film')).toHaveCount(3);
    await expect(browser).toContainText('3 cinématiques dans ce projet');
    await browser.getByLabel('Rechercher une cinématique').fill('depart');
    await expect(browser.locator('.cinematics-browser-film')).toHaveCount(1);
    await browser.locator('.cinematics-browser-film').click();
    await expect(page.getByLabel('Titre de la cinématique')).toHaveValue('Le départ');
    await page.getByRole('button', { name: 'Vue du projet', exact: true }).click();
    await page.getByRole('dialog', { name: 'Vue du projet' }).getByRole('button', { name: 'Voir toutes les cinématiques' }).click();
    await expect(page.getByRole('dialog', { name: 'Toutes les cinématiques' }).locator('.cinematics-browser-film')).toHaveCount(3);
    await page.getByRole('dialog', { name: 'Toutes les cinématiques' }).getByRole('button', { name: 'Fermer' }).click();
    await page.locator('.studio-modebar').getByRole('button', { name: 'Enregistrer le projet' }).click();
    await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
    await expect.poll(async () => JSON.parse(await fs.readFile(file, 'utf8')).cinematics.map((film: { title: string }) => film.title)).toEqual(['Le départ', 'Le jardin', 'Le retour']);
    await expect(page.locator('.studio-save')).toBeEnabled();

    await page.locator('.top-actions').getByRole('button', { name: 'Ouvrir le projet' }).click();
    await page.locator('.top-actions').getByRole('button', { name: /Toutes les cinématiques/ }).click();
    browser = page.getByRole('dialog', { name: 'Toutes les cinématiques' });
    await expect(browser.locator('.cinematics-browser-film')).toHaveCount(3);
    await page.screenshot({ path: info.outputPath('cinematics-browser.png') });
    await browser.getByLabel('Rechercher une cinématique').fill('retour');
    await browser.locator('.cinematics-browser-film').click();
    await expect(page.getByLabel('Titre de la cinématique')).toHaveValue('Le retour');

    await page.locator('.top-actions').getByRole('button', { name: /Toutes les cinématiques/ }).click();
    browser = page.getByRole('dialog', { name: 'Toutes les cinématiques' });
    await browser.getByRole('button', { name: 'Dupliquer la cinématique Le départ' }).click();
    await expect(page.getByLabel('Titre de la cinématique')).toHaveValue('Le départ — copie');
    await page.locator('.studio-modebar').getByRole('button', { name: 'Enregistrer le projet' }).click();
    await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
    await expect.poll(async () => JSON.parse(await fs.readFile(file, 'utf8')).cinematics.map((film: { title: string }) => film.title)).toEqual(['Le départ', 'Le jardin', 'Le retour', 'Le départ — copie']);
    const original = JSON.parse(await fs.readFile(file, 'utf8'));
    expect(original.cinematics[3].id).not.toBe(original.cinematics[0].id);
    expect(original.cinematics[3].shots[0].id).not.toBe(original.cinematics[0].shots[0].id);

    await page.locator('.top-actions').getByRole('button', { name: /Toutes les cinématiques/ }).click();
    browser = page.getByRole('dialog', { name: 'Toutes les cinématiques' });
    await browser.getByRole('button', { name: 'Créer une copie du projet…' }).click();
    await expect(page.locator('.studio-project-state')).toContainText('films-backup.game.json');
    await expect.poll(async () => JSON.parse(await fs.readFile(backupFile, 'utf8')).cinematics.map((film: { title: string }) => film.title)).toEqual(['Le départ', 'Le jardin', 'Le retour', 'Le départ — copie']);

    await page.locator('.top-actions').getByRole('button', { name: /Toutes les cinématiques/ }).click();
    browser = page.getByRole('dialog', { name: 'Toutes les cinématiques' });
    await browser.getByLabel('Catégorie de Le retour', { exact: true }).selectOption('__new__');
    await browser.getByLabel('Nouvelle catégorie de Le retour').fill('Chapitre final');
    await browser.getByRole('button', { name: 'Créer et classer' }).click();
    await browser.getByLabel('Filtrer par catégorie').selectOption('Chapitre final');
    await expect(browser.locator('.cinematics-browser-film')).toHaveCount(1);
    await browser.getByLabel('Filtrer par catégorie').selectOption('*');
    await browser.getByRole('button', { name: 'Renommer Le retour' }).click();
    await browser.getByLabel('Nouveau titre de Le retour').fill('Le retour final');
    await browser.getByRole('button', { name: 'Enregistrer le titre' }).click();
    await browser.getByRole('button', { name: 'Monter Le retour final' }).click();
    await expect(browser.locator('.cinematics-browser-film').nth(1)).toContainText('Le retour final');
    await browser.getByRole('button', { name: 'Supprimer Le jardin' }).click();
    await expect(browser.locator('.cinematics-browser-film')).toHaveCount(3);
    await page.screenshot({ path: info.outputPath('cinematics-browser-admin.png') });
    await browser.getByRole('button', { name: 'Fermer' }).click();
    await page.locator('.studio-modebar').getByRole('button', { name: 'Enregistrer le projet' }).click();
    await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
    await expect.poll(async () => JSON.parse(await fs.readFile(backupFile, 'utf8')).cinematics.map((film: { title: string; category?: string }) => [film.title, film.category ?? ''])).toEqual([
      ['Le départ', ''], ['Le retour final', 'Chapitre final'], ['Le départ — copie', ''],
    ]);
    await page.locator('.top-actions').getByRole('button', { name: /Toutes les cinématiques/ }).click();
    browser = page.getByRole('dialog', { name: 'Toutes les cinématiques' });
    for (const title of ['Le départ — copie', 'Le retour final', 'Le départ']) {
      await browser.getByRole('button', { name: `Supprimer ${title}` }).click();
    }
    await expect(browser.locator('.cinematics-browser-film')).toHaveCount(0);
    await browser.getByRole('button', { name: 'Fermer' }).click();
    await page.locator('.studio-modebar').getByRole('button', { name: 'Enregistrer le projet' }).click();
    await expect.poll(async () => JSON.parse(await fs.readFile(backupFile, 'utf8')).cinematics.length).toBe(0);
  } finally {
    if (app) {
      await app.evaluate(({ BrowserWindow }) => { for (const window of BrowserWindow.getAllWindows()) window.destroy(); }).catch(() => undefined);
      await app.close().catch(() => undefined);
    }
    await fs.rm(dir, { recursive: true, force: true });
  }
});
