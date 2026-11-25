import {
  test,
  expect,
  _electron,
  type ElectronApplication,
  type Page,
} from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { emptyProject } from "../../src/shared/projectSession.js";
import { newCinematic } from "../../src/shared/model.js";
import { GameDocuments } from "../../src/main/gameDocuments.js";
const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
let app: ElectronApplication,
  page: Page,
  dir: string,
  file: string,
  profile: string,
  errors: string[];
test.beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "lunaria-session-e2e-"));
  file = path.join(dir, "project.game.json");
  profile = path.join(dir, "profile");
  await fs.mkdir(profile);
  const project = emptyProject();
  const film = newCinematic();
  film.id = "film_A";
  film.title = "Film A";
  project.cinematics = [film];
  await fs.writeFile(file, JSON.stringify(project));
  await fs.writeFile(
    path.join(profile, "game-recents.json"),
    JSON.stringify([
      { path: file, title: project.title, updatedAt: new Date().toISOString() },
    ]),
  );
  await launch();
});
async function launch() {
  const env = {
    ...process.env,
    LUNARIA_E2E: "1",
    LUNARIA_TEST_USER_DATA: profile,
  };
  delete env.LUNARIA_DEV_URL;
  app = await _electron.launch({
    args: [ROOT],
    env: env as Record<string, string>,
  });
  page = await app.firstWindow();
  errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.waitForURL("app://studio/index.html");
  await expect(page.getByLabel("Titre de la cinématique")).toHaveValue(
    "Film A",
  );
  await app.evaluate(({ dialog }, target) => {
    dialog.showSaveDialog = async () => ({ canceled: false, filePath: target });
    dialog.showOpenDialog = async () => ({
      canceled: false,
      filePaths: [target],
    });
    dialog.showMessageBox = async () => ({
      response: 1,
      checkboxChecked: false,
    });
  }, file);
}
async function stop() {
  await app.evaluate(({ BrowserWindow }) => {
    for (const w of BrowserWindow.getAllWindows()) w.destroy();
  });
  await app.close();
}
test.afterEach(async () => {
  if (app) await stop().catch(() => {});
  await fs.rm(dir, { recursive: true, force: true });
  expect(errors).toEqual([]);
});
const mode = (name: string) =>
  page.locator(".studio-modebar").getByRole("button", { name, exact: true });
const undo = () =>
  page.getByRole("button", { name: "Annuler", exact: true }).click();
const redo = () =>
  page.getByRole("button", { name: "Rétablir", exact: true }).click();
test("cross-film and cross-mode undo follows the edited object and keeps a single save baseline", async () => {
  await page.getByRole("button", { name: "Nouvelle cinématique" }).click();
  await page.getByLabel("Titre de la cinématique").fill("Film B");
  await page.getByLabel("Titre de la cinématique").press("Tab");
  await page.getByLabel("Cinématique du projet").selectOption("film_A");
  await page.getByLabel("Titre de la cinématique").fill("Film A modifié");
  await page.getByLabel("Titre de la cinématique").press("Tab");
  await mode("Niveaux").click();
  await page.getByRole("button", { name: "+ Créer un niveau" }).first().click();
  await page.getByLabel("Continent du niveau").selectOption("2");
  await mode("Cinématiques").click();
  await page
    .getByLabel("Cinématique du projet")
    .selectOption({ label: "Film B" });
  await undo();
  await expect(mode("Niveaux")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Continent du niveau")).toHaveValue("0");
  await undo();
  await expect(
    page.getByRole("heading", { name: "Aucun niveau" }),
  ).toBeVisible();
  await undo();
  await expect(mode("Cinématiques")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Titre de la cinématique")).toHaveValue(
    "Film A",
  );
  await undo();
  await expect(page.getByLabel("Titre de la cinématique")).toHaveValue(
    "Nouvelle cinématique",
  );
  await redo();
  await expect(page.getByLabel("Titre de la cinématique")).toHaveValue(
    "Film B",
  );
  await page.getByRole("button", { name: "Enregistrer le projet" }).click();
  await expect(page.locator(".studio-project-state")).toContainText(
    "Projet enregistré",
  );
  await undo();
  await expect(page.locator(".studio-project-state")).toContainText(
    "Modifications non enregistrées",
  );
  await redo();
  await expect(page.locator(".studio-project-state")).toContainText(
    "Projet enregistré",
  );
  await page.getByRole("button", { name: "Historique", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Historique du projet" }),
  ).toContainText("Film B");
  if (process.env.LUNARIA_SESSION_CAPTURE)
    await page.screenshot({
      path: path.join(
        process.env.LUNARIA_SESSION_CAPTURE,
        "historique-projet.png",
      ),
    });
  await page.getByRole("button", { name: "Fermer", exact: true }).click();
  for (const width of [1462, 1024, 780]) {
    await page.setViewportSize({ width, height: 820 });
    const rect = await page
      .getByRole("button", { name: "Enregistrer le projet" })
      .boundingBox();
    expect(rect!.x + rect!.width).toBeLessThanOrEqual(width);
    expect(rect!.y + rect!.height).toBeLessThan(120);
    if (process.env.LUNARIA_SESSION_CAPTURE && width === 1024)
      await page.screenshot({
        path: path.join(process.env.LUNARIA_SESSION_CAPTURE, "projet-1024.png"),
      });
  }
});
test("disk conflict offers field choices, preserves both files, and saves the combined result", async () => {
  await page.getByLabel("Titre de la cinématique").fill("Titre local");
  await page.getByLabel("Titre de la cinématique").press("Tab");
  const remote = JSON.parse(await fs.readFile(file, "utf8"));
  remote.cinematics[0].title = "Titre disque";
  remote.balance.plants[0].damage = 333;
  await fs.writeFile(file, JSON.stringify(remote));
  await page.getByRole("button", { name: "Enregistrer le projet" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Le fichier a changé sur le disque",
  });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Titre local");
  await expect(dialog).toContainText("Titre disque");
  if (process.env.LUNARIA_SESSION_CAPTURE)
    await page.screenshot({
      path: path.join(
        process.env.LUNARIA_SESSION_CAPTURE,
        "comparaison-sauvegarde.png",
      ),
    });
  await expect(
    dialog.getByRole("button", { name: "Réunir et enregistrer" }),
  ).toBeDisabled();
  await dialog.getByRole("radio", { name: /Mon brouillon/ }).check();
  await dialog.getByRole("button", { name: "Réunir et enregistrer" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator(".studio-project-state")).toContainText(
    "Projet enregistré",
  );
  const saved = JSON.parse(await fs.readFile(file, "utf8"));
  expect(saved.cinematics[0].title).toBe("Titre local");
  expect(saved.balance.plants[0].damage).toBe(333);
  const folders = await fs.readdir(path.join(profile, "project-conflicts"));
  expect(folders).toHaveLength(1);
  const retained = path.join(profile, "project-conflicts", folders[0]);
  expect(
    JSON.parse(
      await fs.readFile(path.join(retained, "brouillon.game.json"), "utf8"),
    ).cinematics[0].title,
  ).toBe("Titre local");
  expect(
    JSON.parse(
      await fs.readFile(path.join(retained, "disque.game.json"), "utf8"),
    ).cinematics[0].title,
  ).toBe("Titre disque");
  await undo();
  await expect(page.locator(".studio-project-state")).toContainText(
    "Modifications non enregistrées",
  );
  await redo();
  await expect(page.locator(".studio-project-state")).toContainText(
    "Projet enregistré",
  );
});
test("recovery is available from cinematics and merges newer disk changes before saving", async () => {
  await stop();
  const base = JSON.parse(await fs.readFile(file, "utf8")),
    draft = structuredClone(base),
    remote = structuredClone(base);
  draft.cinematics[0].title = "Titre récupéré";
  remote.balance.plants[0].damage = 555;
  await new GameDocuments(profile).recover(draft, { base, path: file });
  await fs.writeFile(file, JSON.stringify(remote));
  await launch();
  await expect(page.locator(".project-recovery")).toBeVisible();
  await page
    .locator(".project-recovery")
    .getByRole("button", { name: "Reprendre" })
    .click();
  await expect(page.getByLabel("Titre de la cinématique")).toHaveValue(
    "Titre récupéré",
  );
  await expect(page.locator(".studio-project-state")).toContainText(
    "Modifications non enregistrées",
  );
  await undo();
  await expect(page.getByLabel("Titre de la cinématique")).toHaveValue(
    "Film A",
  );
  await redo();
  await page.getByRole("button", { name: "Enregistrer le projet" }).click();
  await expect(page.locator(".studio-project-state")).toContainText(
    "Projet enregistré",
  );
  expect(
    JSON.parse(await fs.readFile(file, "utf8")).balance.plants[0].damage,
  ).toBe(555);
});
test('native close cancellation preserves the draft; confirmed discard does not resurrect it after restart',async()=>{
 await page.getByLabel('Titre de la cinématique').fill('À abandonner');
 await expect.poll(async()=>{try{return JSON.parse(await fs.readFile(path.join(profile,'game-recovery.json'),'utf8')).cinematics[0].title;}catch{return '';}}).toBe('À abandonner');
 await app.evaluate(({dialog,BrowserWindow})=>{dialog.showMessageBox=async()=>({response:2,checkboxChecked:false});BrowserWindow.getAllWindows()[0].close();});
 await expect(page.getByRole('button',{name:'Enregistrer le projet'})).toBeEnabled();await expect(page.getByLabel('Titre de la cinématique')).toHaveValue('À abandonner');
 const closed=app.waitForEvent('close');await app.evaluate(({dialog,BrowserWindow})=>{dialog.showMessageBox=async()=>({response:1,checkboxChecked:false});BrowserWindow.getAllWindows()[0].close();});await closed;
 expect(JSON.parse(await fs.readFile(file,'utf8')).cinematics[0].title).toBe('Film A');await expect.poll(async()=>{try{await fs.access(path.join(profile,'game-recovery.json'));return true;}catch{return false;}}).toBe(false);
 await launch();await expect(page.locator('.project-recovery')).toHaveCount(0);await expect(page.locator('.studio-project-state')).toContainText('Projet enregistré');
});
