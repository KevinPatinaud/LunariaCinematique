import { test, expect, _electron, type ElectronApplication, type Page } from '@playwright/test';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { seedProject } from '../../src/shared/game/seed.js';
import { newCinematic } from '../../src/shared/model.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let app: ElectronApplication, page: Page, dir: string, file: string;

async function openFixture(count = 4) {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-film-order-'));
  file = path.join(dir, 'order.game.json');
  const project = seedProject();
  project.levels = [];
  project.cinematics = Array.from({ length: count }, (_, index) => {
    const film = newCinematic();
    film.id = `CIN_ORDER_${index + 1}`;
    film.title = ['Le départ', 'Le jardin', 'Une épine de plus', 'Le retour'][index] ?? `Film ${index + 1}`;
    if (index !== 1) film.category = 'Histoire';
    return film;
  });
  project.campaign = {
    cinematics: project.cinematics.slice(0, 2).map((film, i) => ({ id: `film_${i}`, title: film.title, file: `film_${i}.json`, documentId: film.id })),
    steps: [1, 0].map(i => ({ id: `step_${i}`, kind: 'cinematic' as const, cinematicId: `film_${i}`, skippable: true })),
  };
  await fs.writeFile(file, JSON.stringify(project));
  const env: NodeJS.ProcessEnv = { ...process.env, LUNARIA_E2E: '1', LUNARIA_TEST_USER_DATA: path.join(dir, 'profile') };
  delete env.LUNARIA_DEV_URL;
  app = await _electron.launch({ args: [ROOT], env: env as Record<string, string> });
  page = await app.firstWindow();
  await page.waitForURL('app://studio/index.html');
  await app.evaluate(({ dialog, BrowserWindow }, target) => {
    BrowserWindow.getAllWindows()[0].setContentSize(1462, 1050);
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [target] });
  }, file);
  await page.setViewportSize({ width: 1462, height: 1050 });
  await page.locator('.top-actions').getByRole('button', { name: 'Ouvrir le projet' }).click();
  await expect(page.getByLabel('Titre de la cinématique')).toHaveValue('Le départ');
  await page.locator('.top-actions').getByRole('button', { name: /Toutes les cinématiques/ }).click();
  return project;
}

const browser = () => page.getByRole('dialog', { name: 'Toutes les cinématiques' });
const row = (number: number) => browser().locator(`[data-film-id="CIN_ORDER_${number}"]`);
const order = () => browser().locator('.cinematics-browser-row').evaluateAll(rows => rows.map(row => row.getAttribute('data-film-id')));
const ids = (...numbers: number[]) => numbers.map(n => `CIN_ORDER_${n}`);

async function drag(source: number, target: number, placement: 'before' | 'after') {
  const handle = row(source).locator('.cinematics-browser-film');
  await handle.scrollIntoViewIfNeeded();
  const start = await handle.boundingBox();
  const bounds = await browser().locator('.cinematics-browser-list').boundingBox();
  const box = await row(target).boundingBox();
  if (!start || !box || !bounds) throw new Error('Missing drag geometry');
  const targetY = (box: { y: number; height: number }) => box.y + box.height * (placement === 'before' ? .2 : .65);
  await page.mouse.move(start.x + 30, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(start.x + 40, start.y + start.height / 2, { steps: 2 });
  const hoverY = Math.max(bounds.y + 16, Math.min(bounds.y + bounds.height - 16, targetY(box)));
  await page.mouse.move(box.x + 50, hoverY, { steps: 8 });
  // Chromium emits dragover after a second move over the same target.
  await page.mouse.move(box.x + 50, hoverY);
  await expect.poll(async () => {
    const rect = await row(target).boundingBox();
    return !!rect && targetY(rect) >= bounds.y + 10 && targetY(rect) <= bounds.y + bounds.height - 10;
  }).toBe(true);
  const destination = await row(target).boundingBox();
  if (!destination) throw new Error('Missing drop target');
  await page.mouse.move(destination.x + 50, targetY(destination), { steps: 2 });
  await page.mouse.move(destination.x + 50, targetY(destination));
  await expect(row(target)).toHaveClass(new RegExp(`drop-${placement}`));
  await page.mouse.up();
}

test.afterEach(async () => {
  if (app) {
    await app.evaluate(({ BrowserWindow }) => { for (const window of BrowserWindow.getAllWindows()) window.destroy(); }).catch(() => undefined);
    await app.close().catch(() => undefined);
  }
  if (dir) await fs.rm(dir, { recursive: true, force: true });
});

test('drag films before and after a distant target, cancel, filter, save and reopen', async ({}, info) => {
  test.setTimeout(90_000);
  const original = await openFixture();
  await drag(4, 1, 'before');
  await expect.poll(order).toEqual(ids(4, 1, 2, 3));
  await expect(row(1).locator('.cinematics-browser-film')).toHaveAttribute('aria-current', 'true');
  await expect(browser().locator('.dragging, .drop-before, .drop-after')).toHaveCount(0);
  await drag(4, 3, 'after');
  await expect.poll(order).toEqual(ids(1, 2, 3, 4));
  await drag(1, 4, 'after');
  await expect.poll(order).toEqual(ids(2, 3, 4, 1));
  await expect(row(1).locator('.cinematics-browser-number')).toHaveText('04');

  // Releasing outside the list cancels, even after a valid insertion marker appears.
  const source = await row(2).locator('.cinematics-browser-film').boundingBox();
  const target = await row(3).boundingBox();
  if (!source || !target) throw new Error('Missing drag geometry');
  await page.mouse.move(source.x + 30, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x + 50, target.y + target.height - 12, { steps: 8 });
  await page.mouse.move(target.x + 50, target.y + target.height - 12);
  await expect(row(3)).toHaveClass(/drop-after/);
  await page.screenshot({ path: info.outputPath('cinematic-drop-marker.png') });
  await browser().getByLabel('Rechercher une cinématique').hover();
  await page.mouse.up();
  await expect.poll(order).toEqual(ids(2, 3, 4, 1));
  await expect(browser().locator('.dragging, .drop-before, .drop-after')).toHaveCount(0);

  await browser().getByLabel('Rechercher une cinématique').fill('depart');
  await expect(row(1).locator('.cinematics-browser-film')).toHaveAttribute('draggable', 'false');
  await expect(browser().getByRole('button', { name: 'Monter Le départ' })).toBeDisabled();
  await browser().getByLabel('Rechercher une cinématique').fill('');
  await browser().getByLabel('Filtrer par catégorie').selectOption('Histoire');
  await drag(1, 3, 'before');
  await expect.poll(order).toEqual(ids(1, 3, 4));
  await browser().getByLabel('Filtrer par catégorie').selectOption('*');
  await expect.poll(order).toEqual(ids(2, 1, 3, 4));
  await browser().getByRole('button', { name: 'Monter Le départ' }).click();
  await expect.poll(order).toEqual(ids(1, 2, 3, 4));
  await drag(4, 2, 'before');
  await expect.poll(order).toEqual(ids(1, 4, 2, 3));
  await page.setViewportSize({ width: 850, height: 900 });
  await expect(row(4).locator('.cinematics-browser-grip')).toBeVisible();
  await page.screenshot({ path: info.outputPath('cinematic-order-narrow.png') });
  await browser().getByRole('button', { name: 'Fermer' }).click();
  await expect(page.getByLabel('Titre de la cinématique')).toHaveValue('Le départ');
  await page.getByRole('button', { name: 'Enregistrer le projet', exact: true }).click();
  await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
  const saved = JSON.parse(await fs.readFile(file, 'utf8'));
  expect(saved.cinematics.map((film: { id: string }) => film.id)).toEqual(ids(1, 4, 2, 3));
  expect(saved.campaign).toEqual(original.campaign);
  for (const film of original.cinematics!) expect(saved.cinematics.find((item: { id: string }) => item.id === film.id)).toEqual(film);
  await page.locator('.top-actions').getByRole('button', { name: 'Ouvrir le projet' }).click();
  await page.locator('.top-actions').getByRole('button', { name: /Toutes les cinématiques/ }).click();
  await expect.poll(order).toEqual(ids(1, 4, 2, 3));
});

test('a native drag scrolls a long list and can insert after the last film', async () => {
  test.setTimeout(60_000);
  await openFixture(12);
  const list = browser().locator('.cinematics-browser-list');
  const source = await row(1).locator('.cinematics-browser-film').boundingBox();
  const bounds = await list.boundingBox();
  if (!source || !bounds) throw new Error('Missing list geometry');
  await page.mouse.move(source.x + 30, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x + 60, bounds.y + bounds.height - 12, { steps: 12 });
  await page.mouse.move(bounds.x + 60, bounds.y + bounds.height - 12);
  await expect.poll(() => list.evaluate(list => list.scrollTop + list.clientHeight >= list.scrollHeight - 2)).toBe(true);
  const last = await row(12).boundingBox();
  if (!last) throw new Error('Missing last film');
  await page.mouse.move(last.x + 60, last.y + last.height - 12, { steps: 3 });
  await page.mouse.move(last.x + 60, last.y + last.height - 12);
  await expect(row(12)).toHaveClass(/drop-after/);
  await page.mouse.up();
  await expect.poll(order).toEqual(ids(2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1));
});
