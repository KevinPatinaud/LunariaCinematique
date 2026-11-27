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
import { seedProject } from "../../src/shared/game/seed.js";
import { newLevel } from "../../src/shared/game/types.js";
import { newCinematic } from "../../src/shared/model.js";
import { fixturePresentation, PIXEL_PNG } from "../presentation-fixture.js";
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
  errors = [];
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "lunaria-level-campaign-"));
  file = path.join(dir, "project.game.json");
  const profile = path.join(dir, "profile"),
    library = path.join(dir, "library");
  await fs.mkdir(profile);
  await fs.mkdir(library);
  await fs.writeFile(path.join(library, "pixel.png"), PIXEL_PNG);
  original = fixturePresentation(seedProject(), "library://pixel.png");
  const a = newLevel(["radish", "rose"], "runner"),
    b = newLevel(["rose"], "runner"),
    off = newLevel(["radish"], "runner");
  a.title = "A";
  b.title = "B";
  off.title = "Réserve";
  delete a.objectiveTextMode;
  original.levels = [b, off, a];
  const intro = newCinematic(),
    between = newCinematic();
  intro.id = "CIN_INTRO_TEST";
  between.id = "CIN_BETWEEN_TEST";
  intro.title = "Introduction";
  between.title = "Intermède";
  original.cinematics = [intro, between];
  original.campaign = {
    cinematics: [
      {
        id: "intro_film",
        title: intro.title,
        documentId: intro.id,
        file: "intro.json",
      },
      {
        id: "between_film",
        title: between.title,
        documentId: between.id,
        file: "between.json",
      },
    ],
    steps: [
      {
        id: "intro",
        kind: "cinematic",
        cinematicId: "intro_film",
        skippable: false,
      },
      { id: "level_a", kind: "level", levelId: a.id },
      {
        id: "between",
        kind: "cinematic",
        cinematicId: "between_film",
        skippable: true,
      },
      { id: "level_b", kind: "level", levelId: b.id },
    ],
  };
  await fs.writeFile(file, JSON.stringify(original));
  await fs.writeFile(
    path.join(profile, "settings.json"),
    JSON.stringify({ libraryRoot: library }),
  );
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
    await info.attach("levels-campaign", {
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
async function levels(name = "A") {
  await page
    .locator(".studio-sections")
    .getByRole("button", { name: /^Niveaux/ })
    .click();
  await page
    .locator(".gd-level-items button")
    .filter({ has: page.getByText(name, { exact: true }) })
    .click();
}
async function settings() {
  await levels();
  await page.getByRole("button", { name: "Paramètres", exact: true }).click();
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
  await page.locator(".gd-message button").click();
}

test("archive films and levels in place, filter them, and keep their campaign steps", async ({}, info) => {
  await page.setViewportSize({ width: 1462, height: 900 });
  const mode = page.locator(".studio-modebar");
  const filterName = "Filtrer par statut d’archivage";
  const rows = page.locator(".gd-level-items button");
  const filmBrowser = page.getByRole("dialog", { name: "Toutes les cinématiques" });
  const openFilmBrowser = () =>
    page.locator(".top-actions").getByRole("button", { name: /Toutes les cinématiques/ }).click();
  const filmRows = filmBrowser.locator(".cinematics-browser-row");

  await levels("A");
  await expect(rows).toHaveCount(3);
  await page.screenshot({ path: info.outputPath("levels-before-archive.png") });
  await page.getByRole("button", { name: "Archiver", exact: true }).click();
  await expect(rows.first()).toContainText("Archivé");
  await page.getByRole("button", { name: "Annuler", exact: true }).click();
  await expect(rows.first()).not.toContainText("Archivé");
  await page.getByRole("button", { name: "Rétablir", exact: true }).click();
  await expect(rows.first()).toContainText("Archivé");
  await levels("Réserve");
  await page.getByRole("button", { name: "Archiver", exact: true }).click();
  await page.getByLabel(filterName).selectOption("active");
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText("B");
  await page.getByLabel(filterName).selectOption("archived");
  await expect(rows).toHaveCount(2);
  await expect(rows.first()).toContainText("A");
  await page.getByLabel(filterName).selectOption("all");
  await page.screenshot({ path: info.outputPath("levels-after-archive.png") });

  await mode.getByRole("button", { name: "Cinématiques", exact: true }).click();
  await openFilmBrowser();
  await expect(filmRows).toHaveCount(2);
  await page.screenshot({ path: info.outputPath("films-before-archive.png") });
  await filmBrowser.getByRole("button", { name: "Archiver Introduction", exact: true }).click();
  await expect(filmRows.first()).toContainText("Archivé");
  await expect(filmRows.first().getByRole("button", { name: "Supprimer Introduction" })).toBeEnabled();
  await page.screenshot({ path: info.outputPath("films-after-archive.png") });
  await page.setViewportSize({ width: 1000, height: 720 });
  await expect(filmRows.first().getByRole("button", { name: "Désarchiver Introduction" })).toBeInViewport();
  await page.screenshot({ path: info.outputPath("films-after-archive-1000.png") });
  await page.setViewportSize({ width: 1462, height: 900 });
  await filmBrowser.getByLabel(filterName).selectOption("active");
  await expect(filmRows).toHaveCount(1);
  await expect(filmRows.first()).toContainText("Intermède");
  await filmBrowser.getByLabel(filterName).selectOption("archived");
  await expect(filmRows).toHaveCount(1);
  await filmRows.first().getByRole("button", { name: /^Ouvrir Introduction/ }).click();
  await expect(page.getByLabel("Titre de la cinématique")).toHaveValue("Introduction");

  await page.locator(".studio-sections").getByRole("button", { name: /^Campagne/ }).click();
  const steps = page.locator(".gd-step-card");
  await expect(steps).toHaveCount(4);
  await expect(steps.nth(0)).toHaveAccessibleName("Étape 1 · Introduction · Archivé");
  await expect(steps.nth(1)).toHaveAccessibleName("Étape 2 · A · Archivé");
  await page.getByRole("tab", { name: "Niveaux", exact: true }).click();
  await expect(page.getByRole("button", { name: /Sélectionner « Réserve ».*Archivé/ })).toBeVisible();
  await page.screenshot({ path: info.outputPath("campaign-with-archives.png") });
  const data = await save();
  expect(data.campaign).toEqual(original.campaign);
  expect(data.contentArchives).toEqual({
    cinematics: [original.cinematics![0].id],
    levels: [original.levels[2].id, original.levels[1].id],
  });

  await reopen();
  await levels("A");
  await expect(rows.first()).toContainText("Archivé");
  await page.getByRole("button", { name: "Désarchiver", exact: true }).click();
  await expect(rows.first()).not.toContainText("Archivé");
  await levels("Réserve");
  await page.getByRole("button", { name: "Supprimer", exact: true }).click();
  await expect(rows).toHaveCount(2);
  await mode.getByRole("button", { name: "Cinématiques", exact: true }).click();
  await openFilmBrowser();
  await filmBrowser.getByRole("button", { name: "Désarchiver Introduction", exact: true }).click();
  await expect(filmRows.first()).not.toContainText("Archivé");
  await filmBrowser.getByRole("button", { name: "Fermer", exact: true }).click();
  expect((await save()).contentArchives).toBeUndefined();
});

test("duplicate directly in the campaign, undo atomically, redo, save and reopen without changing source waves", async () => {
  await levels();
  await expect(
    page.locator(".gd-level-items").getByRole("button").first(),
  ).toContainText("A");
  await expect(
    page.getByRole("region", { name: "Place du niveau dans la campagne" }),
  ).toContainText("Niveau 1 · étape 2");
  await page.getByRole("button", { name: "Dupliquer", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Dupliquer le niveau" });
  await expect(dialog.getByLabel("Placer la copie")).toHaveValue("between");
  await dialog.getByLabel("Nom de la copie").fill("A bis");
  await dialog
    .getByRole("button", { name: "Créer la copie", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "A bis", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Voir dans la campagne" }).click();
  await expect(page.locator(".gd-step-card").nth(2)).toContainText("A bis");
  await expect(page.locator(".gd-step-card").nth(3)).toContainText("Intermède");
  await page.getByRole("button", { name: "Annuler", exact: true }).click();
  await expect(page.locator(".gd-level-items").getByRole("button")).toHaveCount(
    3,
  );
  await page.getByRole("button", { name: "Rétablir", exact: true }).click();
  const data = await save(),
    source = data.levels.find((l: any) => l.title === "A"),
    copy = data.levels.find((l: any) => l.title === "A bis");
  expect(source.waves).toEqual(
    original.levels.find((l) => l.title === "A")!.waves,
  );
  expect(copy.waves[0].id).not.toBe(source.waves[0].id);
  expect(
    data.campaign.steps.map((s: any) =>
      s.kind === "level"
        ? data.levels.find((l: any) => l.id === s.levelId).title
        : s.cinematicId,
    ),
  ).toEqual(["intro_film", "A", "A bis", "between_film", "B"]);
  await reopen();
  await levels("A bis");
  await expect(
    page.getByRole("region", { name: "Place du niveau dans la campagne" }),
  ).toContainText("Niveau 2 · étape 3");
});
test("new level is created at the exact insertion rail, preserving the surrounding cinematics", async () => {
  await page
    .locator(".studio-sections")
    .getByRole("button", { name: /^Campagne/ })
    .click();
  await page
    .getByRole("button", {
      name: "Insérer entre les étapes 3 et 4",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Créer un niveau ici", exact: true })
    .click();
  await expect(page.getByLabel("Nom du niveau")).toHaveValue("Nouveau niveau");
  await expect(
    page.getByRole("region", { name: "Place du niveau dans la campagne" }),
  ).toContainText("Niveau 2 · étape 4");
  await expect(page.getByLabel("Consigne automatique")).toBeChecked();
  const data = await save();
  expect(data.campaign.steps[2].cinematicId).toBe("between_film");
  expect(data.campaign.steps[3].levelId).toBe(
    data.levels.find((l: any) => l.title === "Nouveau niveau").id,
  );
  expect(data.campaign.steps[4].levelId).toBe(
    original.levels.find((l) => l.title === "B")!.id,
  );
});
test("outside levels can be found, placed before a film and removed without deleting their content", async () => {
  await page
    .locator(".studio-sections")
    .getByRole("button", { name: /^Campagne/ })
    .click();
  await page
    .getByRole("button", { name: "Voir les niveaux hors parcours" })
    .click();
  await expect(
    page.getByLabel("Filtrer par place dans la campagne"),
  ).toHaveValue("outside");
  await expect(page.locator(".gd-level-items button")).toHaveCount(1);
  await page.locator(".gd-level-items button").click();
  await page.getByRole("button", { name: "Ajouter au parcours…" }).click();
  await page
    .getByLabel("Place dans la campagne", { exact: true })
    .selectOption("intro");
  await page.getByRole("button", { name: "Appliquer le placement" }).click();
  await expect(
    page.getByRole("region", { name: "Place du niveau dans la campagne" }),
  ).toContainText("Niveau 1 · étape 1");
  await page
    .getByLabel("Filtrer par place dans la campagne")
    .selectOption("all");
  await page.getByRole("button", { name: "Changer sa place…" }).click();
  await page
    .getByLabel("Place dans la campagne", { exact: true })
    .selectOption("@outside");
  await page.getByRole("button", { name: "Appliquer le placement" }).click();
  const data = await save();
  expect(data.levels).toHaveLength(3);
  expect(data.campaign.steps).toEqual(original.campaign!.steps);
});
test("objective review is cancellable and authored default-looking text survives change, undo and reopening", async () => {
  await settings();
  await expect(page.getByLabel("Consigne automatique")).not.toBeChecked();
  await page.getByLabel("Objectif du niveau").selectOption("escort");
  await expect(page.getByLabel("Consigne du niveau")).toHaveValue(
    "Repousser les vagues.",
  );
  await page.getByLabel("Objectif du niveau").selectOption("advance");
  const dialog = page.getByRole("dialog", {
    name: "Changer l’objectif du niveau",
  });
  await expect(dialog).toContainText("réglages propres");
  await dialog
    .getByRole("button", { name: "Garder l’objectif actuel" })
    .click();
  await expect(page.getByLabel("Objectif du niveau")).toHaveValue("escort");
  await page.getByLabel("Objectif du niveau").selectOption("advance");
  await page
    .getByRole("button", { name: "Appliquer le nouvel objectif" })
    .click();
  await page.getByLabel("Consigne automatique").check();
  await expect(page.getByLabel("Consigne du niveau")).toHaveValue(
    "Conquérir les cinq allées.",
  );
  await page.getByRole("button", { name: "Annuler", exact: true }).click();
  await expect(page.getByLabel("Consigne du niveau")).toHaveValue(
    "Repousser les vagues.",
  );
  const data = await save(),
    a = data.levels.find((l: any) => l.title === "A");
  expect(a.objective.type).toBe("advance");
  expect(a.escort).toBeUndefined();
  expect(a.objectiveTextMode).toBeUndefined();
  await reopen();
  await settings();
  await expect(page.getByLabel("Consigne du niveau")).toHaveValue(
    "Repousser les vagues.",
  );
});
test("occupied-board conversion previews the timing loss and remains one undoable edit", async () => {
  await settings();
  await page.getByLabel("Objectif du niveau").selectOption("occupied_board");
  await expect(page.getByRole("dialog")).toContainText(
    "délais et intervalles passeront à zéro",
  );
  await page.getByRole("button", { name: "Garder l’objectif actuel" }).click();
  expect((await save()).levels.find((l: any) => l.title === "A").waves).toEqual(
    original.levels.find((l) => l.title === "A")!.waves,
  );
  await page.getByLabel("Objectif du niveau").selectOption("occupied_board");
  await page
    .getByRole("button", { name: "Appliquer le nouvel objectif" })
    .click();
  const data = await save(),
    a = data.levels.find((l: any) => l.title === "A");
  expect(a.waves[0].groups[0]).toMatchObject({
    start: 0,
    interval: 0,
    placement: { rowMin: 0, rowMax: 0, colMin: 6, colMax: 6 },
  });
  await page.getByRole("button", { name: "Annuler", exact: true }).click();
  const restored = await save();
  expect(restored.levels.find((l: any) => l.title === "A").waves).toEqual(
    original.levels.find((l) => l.title === "A")!.waves,
  );
});
test("rewards compare all levels and link to the sole wave editor, with zero preserved on save", async () => {
  await page.locator(".studio-sections").getByRole("button", { name: "Niveaux", exact: true }).click();
  await page.getByRole("button", { name: "Comparer les graines", exact: true }).click();
  const table = page.getByRole("table");
  await expect(table.getByRole("row")).toHaveCount(4);
  await expect(table.locator("input")).toHaveCount(0);
  await table
    .getByRole("button", { name: "Modifier les vagues de A", exact: true })
    .click();
  await page.getByLabel("Graines pour la vague éliminée").fill("0");
  await page.getByLabel("Graines pour la vague éliminée").press("Tab");
  await page.getByRole("button", { name: "Comparer les graines", exact: true }).click();
  await expect(
    table
      .getByRole("row")
      .filter({ has: page.getByRole("rowheader", { name: /^A / }) }),
  ).toContainText("0");
  const data = await save();
  expect(
    data.levels.find((l: any) => l.title === "A").waves[0].seedReward,
  ).toBe(0);
});
test("placement, duplication and objective controls remain reachable at 1024 pixels", async () => {
  await settings();
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.getByRole("button", { name: "Changer sa place…" }).click();
  await expect(
    page.getByLabel("Place dans la campagne", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Annuler le placement" }).click();
  await page.getByRole("button", { name: "Dupliquer", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Créer la copie" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
