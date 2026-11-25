import {
  test,
  expect,
  _electron,
  type ElectronApplication,
  type Page,
} from "@playwright/test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seedProject } from "../../src/shared/game/seed.js";
import { parseGameProject } from "../../src/shared/game/validation.js";
import { newLevel } from "../../src/shared/game/types.js";
const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
let app: ElectronApplication,
  page: Page,
  dir: string,
  file: string,
  original: ReturnType<typeof seedProject>,
  errors: string[];
test.beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "lunaria-enemy-rules-e2e-"));
  file = path.join(dir, "project.game.json");
  const profile = path.join(dir, "profile");
  await fs.mkdir(profile);
  original = parseGameProject(seedProject());
  original.balance.enemies.find((e) => e.id === "collector")!.archived = true;
  original.levels = [newLevel(["radish", "rose"], "runner")];
  original.cinematics = [];
  original.campaign = {
    steps: [
      { id: "step_rules", kind: "level", levelId: original.levels[0].id },
    ],
    cinematics: [],
  };
  await fs.writeFile(file, JSON.stringify(original));
  await fs.writeFile(
    path.join(profile, "game-recents.json"),
    JSON.stringify([
      {
        path: file,
        title: original.title,
        updatedAt: new Date().toISOString(),
      },
    ]),
  );
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
  await expect(page.locator(".studio-project-state")).toContainText(
    "project.game.json",
  );
  await app.evaluate(({ dialog }, file) => {
    dialog.showSaveDialog = async () => ({ canceled: false, filePath: file });
    dialog.showOpenDialog = async () => ({
      canceled: false,
      filePaths: [file],
    });
    dialog.showMessageBox = async () => ({
      response: 1,
      checkboxChecked: false,
    });
  }, file);
  await page
    .locator(".studio-modebar")
    .getByRole("button", { name: "Niveaux", exact: true })
    .click();
});
test.afterEach(async ({}, info) => {
  if (info.status !== info.expectedStatus && page && !page.isClosed())
    await info.attach("enemy-rules", {
      body: await page.screenshot(),
      contentType: "image/png",
    });
  await app
    ?.evaluate(({ BrowserWindow }) => {
      for (const w of BrowserWindow.getAllWindows()) w.destroy();
    })
    .catch(() => {});
  await app?.close();
  await fs.rm(dir, { recursive: true, force: true });
  expect(errors).toEqual([]);
});
async function enemy(id: string, tab = "Règles du plateau") {
  const source = original.balance.enemies.find((e) => e.id === id)!;
  await page
    .locator(".studio-sections")
    .getByRole("button", { name: /^Ennemis/ })
    .click();
  const toggle = page.locator(".gd-archive-toggle");
  if (
    ((await toggle.getAttribute("aria-pressed")) === "true") !==
    !!source.archived
  )
    await toggle.click();
  await page
    .locator(".gd-catalog")
    .getByRole("button", { name: new RegExp("^" + source.name) })
    .click();
  await page
    .getByRole("navigation", { name: "Fiche de " + source.name })
    .getByRole("button", { name: tab, exact: true })
    .click();
  return source;
}
async function save() {
  await page
    .getByRole("button", { name: "Enregistrer le projet", exact: true })
    .click();
  await expect(page.locator(".studio-project-state")).toContainText(
    "Projet enregistré",
  );
  return JSON.parse(await fs.readFile(file, "utf8"));
}
async function reopen() {
  await page
    .getByRole("button", { name: "Actions du fichier projet" })
    .click();
  await page
    .getByRole("button", { name: "Ouvrir un projet…", exact: true })
    .click();
  await expect(page.locator(".gd-message")).toContainText("Projet ouvert.");
}
async function waves() {
  await page
    .locator(".studio-sections")
    .getByRole("button", { name: /^Niveaux/ })
    .click();
  await page
    .getByRole("button", { name: "Vagues & ennemis", exact: true })
    .click();
}
async function capture(file: string) {
  if (process.env.LUNARIA_ENEMY_CAPTURE)
    await page.screenshot({
      path: path.join(process.env.LUNARIA_ENEMY_CAPTURE, file),
    });
}

test("generation period and species are editable, undoable and survive reopening", async () => {
  await enemy("plaque");
  await expect(
    page.getByRole("checkbox", {
      name: "Produire des renforts pendant le combat",
    }),
  ).toBeChecked();
  await page.getByLabel("Période des renforts (s)").fill("12.5");
  await page.getByLabel("Période des renforts (s)").press("Tab");
  await page
    .getByLabel("Ennemi produit", { exact: true })
    .selectOption("litterer");
  await expect(page.getByLabel("Résumé des règles du plateau")).toContainText(
    "12.5 s",
  );
  await page.getByRole("button", { name: "Annuler", exact: true }).click();
  await expect(page.getByLabel("Ennemi produit", { exact: true })).toHaveValue(
    "runner",
  );
  await page.getByRole("button", { name: "Rétablir", exact: true }).click();
  const doc = await save();
  expect(
    doc.balance.enemies.find((e: any) => e.id === "plaque").rules
      .reinforcements,
  ).toEqual({ enemyId: "litterer", interval: 12.5 });
  expect(doc.balance.enemies.filter((e: any) => e.id !== "plaque")).toEqual(
    original.balance.enemies.filter((e) => e.id !== "plaque"),
  );
  await capture("ennemi-generateur.png");
  await reopen();
  await enemy("plaque");
  await expect(page.getByLabel("Période des renforts (s)")).toHaveValue("12.5");
});
test("duplicated obstacle retains its properties and art, then can be placed under its own identity", async () => {
  const source = await enemy("poubelle", "Caractéristiques");
  await page
    .getByRole("button", { name: "Dupliquer l’ennemi", exact: true })
    .click();
  const name = source.name + " — copie";
  await expect(page.getByLabel("Nom de l’espèce")).toHaveValue(name);
  await page
    .getByRole("navigation", { name: "Fiche de " + name })
    .getByRole("button", { name: "Règles du plateau", exact: true })
    .click();
  await expect(
    page.getByRole("checkbox", {
      name: "Bloquer les ennemis de la même allée",
    }),
  ).toBeChecked();
  await page
    .getByRole("checkbox", { name: "Bloquer les ennemis de la même allée" })
    .uncheck();
  const doc = await save(),
    copy = doc.balance.enemies.find((e: any) => e.name === name);
  expect(copy.id).not.toBe("poubelle");
  expect(copy.behaviorId).not.toBe(source.behaviorId);
  expect(copy.animationProfileId).not.toBe(source.animationProfileId);
  expect(doc.balance.enemies.find((e: any) => e.id === "poubelle")).toEqual(
    source,
  );
  await capture("ennemi-obstacle-copie.png");
  await waves();
  await page.getByLabel("Ennemi du groupe 1").selectOption(copy.id);
  const grid = page.getByRole("group", {
    name: "Position de " + name,
    exact: true,
  });
  await grid
    .getByRole("button", { name: "Allée 3, colonne 6", exact: true })
    .click();
  const saved = await save();
  expect(saved.levels[0].waves[0].groups[0].placement).toEqual({
    rowMin: 2,
    rowMax: 2,
    colMin: 5,
    colMax: 5,
  });
});
test("contact and an on-board stationary arrival no longer depend on a species name", async () => {
  await enemy("cigarette");
  const solid = page.getByRole("checkbox", {
    name: "S’arrêter au contact d’une plante dans tous les objectifs",
  });
  await expect(solid).toBeChecked();
  await solid.uncheck();
  await page.getByRole("button", { name: "Annuler", exact: true }).click();
  await expect(solid).toBeChecked();
  await page.getByLabel("Position d’arrivée (cases)").fill("6.8");
  await page.getByLabel("Position d’arrivée (cases)").press("Tab");
  await enemy("cigarette", "Caractéristiques");
  await page.getByLabel("Vitesse (cases/s)").fill("0");
  await page.getByLabel("Vitesse (cases/s)").press("Tab");
  const doc = await save();
  expect(doc.balance.enemies.find((e: any) => e.id === "cigarette").speed).toBe(
    0,
  );
  expect(
    doc.balance.enemies.find((e: any) => e.id === "cigarette").rules.spawn.x,
  ).toBe(6.8);
});
test("copying an archived boss selects its active copy and preserves private animation ownership", async () => {
  const source = await enemy("collector", "Caractéristiques");
  await page
    .getByRole("button", { name: "Dupliquer l’ennemi", exact: true })
    .click();
  const name = source.name + " — copie";
  await expect(page.getByLabel("Nom de l’espèce")).toHaveValue(name);
  await page
    .getByRole("navigation", { name: "Fiche de " + name })
    .getByRole("button", { name: "Règles du plateau", exact: true })
    .click();
  await expect(
    page.getByRole("checkbox", { name: "Présenter cet ennemi comme un boss" }),
  ).toBeChecked();
  await page
    .getByRole("checkbox", {
      name: "Présenter cet ennemi comme un boss",
    })
    .uncheck();
  const doc = await save();
  expect(
    doc.balance.enemies.find((e: any) => e.name === name).rules.boss,
  ).toBe(false);
  expect(doc.balance.enemies.find((e: any) => e.id === "collector")).toEqual(
    source,
  );
});
test("changing deployment adapts existing groups and undo restores their exact position", async () => {
  await waves();
  await page.getByLabel("Ennemi du groupe 1").selectOption("plaque");
  await page
    .getByRole("group", { name: "Position de Plaque", exact: true })
    .getByRole("button", { name: "Allée 4, colonne 3", exact: true })
    .click();
  const before = await save();
  await enemy("plaque");
  await page
    .getByLabel("Mode d’apparition de l’ennemi")
    .selectOption("arrival");
  let doc = await save();
  expect(doc.levels[0].waves[0].groups[0]).not.toHaveProperty("placement");
  await page.getByRole("button", { name: "Annuler", exact: true }).click();
  doc = await save();
  expect(doc.levels[0].waves[0].groups).toEqual(
    before.levels[0].waves[0].groups,
  );
  for (const width of [1462, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    const button = await page
      .getByRole("button", { name: "Enregistrer le projet" })
      .boundingBox();
    expect(button!.x + button!.width).toBeLessThanOrEqual(width);
  }
  await capture("ennemi-1024.png");
});

test("a copied focus species is selectable and level generation explicitly replaces its own cycle", async () => {
  const source = await enemy("plaque", "Caractéristiques");
  await page
    .getByRole("button", { name: "Dupliquer l’ennemi", exact: true })
    .click();
  const name = source.name + " — copie";
  await page
    .getByRole("navigation", { name: "Fiche de " + name })
    .getByRole("button", { name: "Règles du plateau", exact: true })
    .click();
  await page.getByLabel("Période des renforts (s)").fill("3");
  await page.getByLabel("Période des renforts (s)").press("Tab");
  const before = await save(),
    copy = before.balance.enemies.find((e: any) => e.name === name);
  await page
    .locator(".studio-sections")
    .getByRole("button", { name: /^Niveaux/ })
    .click();
  await page.getByRole("button", { name: "Paramètres", exact: true }).click();
  await page.getByLabel("Objectif du niveau").selectOption("invasive_foci");
  const editor = page.getByRole("region", { name: "Foyers invasifs" });
  await editor.getByLabel("Espèce des foyers").selectOption(copy.id);
  await editor.getByLabel("Intervalle des renforts (secondes)").fill("7.5");
  await editor.getByLabel("Intervalle des renforts (secondes)").press("Tab");
  await expect(editor).toContainText("sans cumul");
  const doc = await save();
  expect(doc.levels[0].invasiveFoci.focusEnemyId).toBe(copy.id);
  expect(doc.levels[0].invasiveFoci.interval).toBe(7.5);
  expect(
    doc.balance.enemies.find((e: any) => e.id === copy.id).rules.reinforcements
      .interval,
  ).toBe(3);
  expect(doc.balance.enemies.find((e: any) => e.id === "plaque")).toEqual(
    source,
  );
  await capture("ennemi-foyers.png");
  await reopen();
  await page
    .locator(".studio-sections")
    .getByRole("button", { name: /^Niveaux/ })
    .click();
  await page.getByRole("button", { name: "Paramètres", exact: true }).click();
  await expect(editor.getByLabel("Espèce des foyers")).toHaveValue(copy.id);
});
