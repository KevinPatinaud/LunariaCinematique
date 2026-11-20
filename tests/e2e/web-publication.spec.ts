import { test, expect, _electron } from '@playwright/test';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { seedProject } from '../fixtures/seed40.js';
import { newLevel } from '../../src/shared/game/types.js';
import { fixturePresentation, PIXEL_PNG } from '../presentation-fixture.js';

const studio = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('The publication button prepares the first level and waits for installation confirmation', async () => {
  test.setTimeout(60000);
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-web-e2e-'));
  const site = path.join(profile, 'LunariaWebsite');
  const game = path.join(profile, 'game');
  const file = path.join(profile, 'project.game.json');
  const library = path.join(profile, 'library');
  await fs.mkdir(library);
  await fs.writeFile(path.join(library, 'pixel.png'), PIXEL_PNG);
  await fs.writeFile(path.join(profile, 'settings.json'), JSON.stringify({ libraryRoot: library }));
  const project = fixturePresentation(seedProject(), 'library://pixel.png');
  const chosen = { ...newLevel(['radish'], 'runner'), title: 'Le premier niveau du parcours' };
  project.levels.push(chosen);
  project.campaign = {
    cinematics: [],
    steps: [{ id: 'first_web_step', kind: 'level', levelId: chosen.id }],
  };
  const sourceContent = path.join(game, 'content/design/game_content.json');
  const deployedManifest = path.join(site, 'published-manifest.json');
  const godot = path.join(profile, 'godot.exe'); // Only the external builder executes Godot, stubbed here.
  for (const folder of ['app/controllers', 'domain/logic', 'domain/presentation', 'content/design']) await fs.mkdir(path.join(game, folder), { recursive: true });
  for (const marker of ['project.godot', 'app/controllers/campaign_flow.gd', 'domain/logic/event_runtime.gd', 'domain/presentation/animation_registry.gd']) {
    await fs.writeFile(path.join(game, marker), 'fixture');
  }
  await fs.writeFile(sourceContent, '{}');
  await fs.writeFile(godot, 'fixture');
  await fs.writeFile(file, JSON.stringify(project));
  await fs.writeFile(path.join(profile, 'game-preview.json'), JSON.stringify({ gameRoot: game, godotPath: godot }));
  await fs.writeFile(path.join(profile, 'web-publication.json'), JSON.stringify({ website: site }));
  await fs.mkdir(path.join(site, 'tools'), { recursive: true });
  await fs.writeFile(path.join(site, 'package.json'), '{"name":"lunaria-web-vite"}');
  await fs.writeFile(path.join(site, 'tools/build-godot-demo.mjs'), `
import fs from 'node:fs/promises'; import path from 'node:path';
const project = JSON.parse(await fs.readFile(path.join(process.env.LUNARIA_GAME_SOURCE, 'content/design/game_content.json'), 'utf8'));
const [level] = project.levels;
await fs.mkdir(process.argv[2]);
await fs.writeFile(path.join(process.argv[2], 'manifest.json'), JSON.stringify({ levelId: level.id, title: level.title, levels: project.levels.length }));
`);
  await fs.writeFile(path.join(site, 'tools/verify-godot-demo.mjs'), `import fs from 'node:fs/promises'; await fs.access(process.argv[2] + '/manifest.json');`);
  await fs.writeFile(path.join(site, 'tools/publish-godot-demo.mjs'), `
import fs from 'node:fs/promises';
if (process.argv[2] !== '--local') throw Error('Unexpected target');
await fs.copyFile(process.argv[3] + '/manifest.json', 'published-manifest.json');
console.log(JSON.stringify({path:'published-manifest.json'}));
`);
  const env = { ...process.env, LUNARIA_E2E: '1', LUNARIA_TEST_USER_DATA: profile };
  delete env.LUNARIA_DEV_URL;
  const app = await _electron.launch({ args: [studio], env: env as Record<string, string> });
  try {
    const page = await app.firstWindow();
    await page.waitForURL('app://studio/index.html');
    await app.evaluate(({ dialog }, projectFile) => {
      dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [projectFile] });
      dialog.showMessageBox = async () => ({ response: 0, checkboxChecked: false });
    }, file);
    await page.locator('.studio-modebar').getByRole('button', { name: 'Niveaux', exact: true }).click();
    await page.getByRole('button', { name: 'Actions du fichier projet' }).click();
    await page.getByRole('button', { name: 'Ouvrir un projet…', exact: true }).click();
    const status = page.locator('.gd-message');
    await expect(status).toContainText('Projet ouvert');
    const publish = async () => {
      await page.locator('.gd-delivery > summary').click();
      await page.getByRole('button', { name: 'Publier le premier niveau sur le Web', exact: true }).click();
    };
    await publish();
    await expect(status).toContainText('Publication Web annulée.');
    await expect(fs.stat(deployedManifest)).rejects.toMatchObject({ code: 'ENOENT' });

    await app.evaluate(({ dialog }) => { dialog.showMessageBox = async () => ({ response: 1, checkboxChecked: false }); });
    await publish();
    await expect(status).toContainText('est prêt sur le site local');
    expect(JSON.parse(await fs.readFile(deployedManifest, 'utf8'))).toEqual({ levelId: chosen.id, title: chosen.title, levels: 1 });
    expect(await fs.readFile(sourceContent, 'utf8')).toBe('{}');
  } finally {
    await app.close();
    await fs.rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
});
