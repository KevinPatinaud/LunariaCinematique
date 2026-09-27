import { test, expect, _electron, type ElectronApplication } from '@playwright/test';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('déplacer un plan par numéro, par flèche, puis annuler et enregistrer', async ({}, info) => {
  test.setTimeout(90_000);
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-shot-order-'));
  const target = path.join(dir, 'project.game.json');
  const env: NodeJS.ProcessEnv = { ...process.env, LUNARIA_E2E: '1', LUNARIA_TEST_USER_DATA: path.join(dir, 'profile') };
  delete env.LUNARIA_DEV_URL;
  let app: ElectronApplication | undefined;
  try {
    app = await _electron.launch({ args: [ROOT], env: env as Record<string, string> });
    const page = await app.firstWindow();
    await page.waitForURL('app://studio/index.html');
    await page.setViewportSize({ width: 1462, height: 900 });
    await app.evaluate(({ dialog }, file) => { dialog.showSaveDialog = async () => ({ canceled: false, filePath: file }); }, target);

    for (let count = 2; count <= 4; count++) {
      await page.getByRole('button', { name: 'Continuer ce plan', exact: true }).click();
      await expect(page.locator('.shot-card')).toHaveCount(count);
    }
    const ids = await page.locator('.shot-card').evaluateAll(cards => cards.map(card => card.getAttribute('data-shot-id')));
    const movedId = ids[1]!;
    await page.getByTestId('shot-card-1').click();
    const position = page.getByLabel('Position du plan sélectionné');
    await expect(position).toHaveValue('2');
    await position.selectOption('4');
    await expect(page.getByTestId('shot-card-3')).toHaveAttribute('data-shot-id', movedId);
    await expect(position).toHaveValue('4');
    await page.getByRole('button', { name: 'Déplacer le plan vers la gauche' }).click();
    await expect(page.getByTestId('shot-card-2')).toHaveAttribute('data-shot-id', movedId);
    await expect(position).toHaveValue('3');
    await page.getByTestId('shot-card-2').click();
    await page.keyboard.press('Control+z');
    await expect(page.getByTestId('shot-card-3')).toHaveAttribute('data-shot-id', movedId);
    await page.screenshot({ path: info.outputPath('shot-order.png') });
    await page.setViewportSize({ width: 1000, height: 800 });
    await expect(position).toBeVisible();
    await page.screenshot({ path: info.outputPath('shot-order-narrow.png') });

    await page.getByRole('button', { name: 'Enregistrer le projet' }).click();
    await expect.poll(async () => {
      try { return JSON.parse(await fs.readFile(target, 'utf8')).cinematics[0].shots.map((shot: { id: string }) => shot.id); }
      catch { return []; }
    }).toEqual([ids[0], ids[2], ids[3], movedId]);
  } finally {
    if (app) {
      await app.evaluate(({ BrowserWindow }) => { for (const window of BrowserWindow.getAllWindows()) window.destroy(); }).catch(() => undefined);
      await app.close().catch(() => undefined);
    }
    await fs.rm(dir, { recursive: true, force: true });
  }
});
