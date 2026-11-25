import {
  test,
  expect,
  _electron,
  type ElectronApplication,
  type Page,
} from "@playwright/test";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { newCinematic } from "../../src/shared/model.js";
import { seedProject } from "../fixtures/seed40.js";
import { fixturePresentation } from "../presentation-fixture.js";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const OUTPUT = process.env.LUNARIA_QA_OUTPUT || path.join(ROOT,"test-results","terrain-pair-captures");
let app: ElectronApplication,
  page: Page,
  folder: string,
  profile: string,
  library: string,
  projectFile: string;
let errors: string[], project: ReturnType<typeof seedProject>;
async function boot() {
  const env = {
    ...process.env,
    LUNARIA_E2E: "1",
    LUNARIA_TEST_USER_DATA: profile,
    LUNARIA_E2E_IMAGE_RESULT: path.join(profile, "panorama.png"),
    LUNARIA_E2E_TERRAIN_RESULT: path.join(profile, "terrain.png"),
    LUNARIA_E2E_TERRAIN_RESTORED_RESULT: path.join(profile,"restored.png"),
    LUNARIA_E2E_IMAGE_MANUAL: "1",
  };
  delete env.LUNARIA_DEV_URL;
  app = await _electron.launch({ args: [ROOT], env });
  page = await app.firstWindow();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.waitForURL("app://studio/index.html");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator(".studio-project-state")).toContainText(
    path.basename(projectFile),
  );
}
async function stop() {
  await app
    .evaluate(({ BrowserWindow }) => {
      for (const window of BrowserWindow.getAllWindows()) window.destroy();
    })
    .catch(() => undefined);
  await app.close().catch(() => undefined);
}
test.beforeEach(async () => {
  errors = [];
  await fs.mkdir(OUTPUT,{recursive:true});
  folder = await fs.mkdtemp(path.join(os.tmpdir(), "lunaria-image-tasks-ui-"));
  profile = path.join(folder, "profile");
  library = path.join(profile, "library");
  projectFile = path.join(folder, "project.game.json");
  await fs.mkdir(library, { recursive: true });
  const source = path.join(
    ROOT,
    "example-library/01_europe/lunaria/interieur_serre/greenhouse_aisle_wide_variant_v01.png",
  );
  await fs.copyFile(source, path.join(library, "source.png"));
  await fs.copyFile(source, path.join(library, "old.png"));
  const film = newCinematic();
  film.title = "La serre";
  film.shots[0].background.asset = "library://source.png";
  project = fixturePresentation(seedProject(), "library://source.png");
  project.cinematics = [film];
  project.levels[0].terrainImage = "library://old.png";
  project.campaign = {
    cinematics: [
      { id: "film", title: film.title, documentId: film.id, file: "film.json" },
    ],
    steps: [
      {
        id: "film-step",
        kind: "cinematic",
        cinematicId: "film",
        skippable: true,
      },
      { id: "level-step", kind: "level", levelId: project.levels[0].id },
    ],
  };
  await fs.writeFile(projectFile, JSON.stringify(project));
  await fs.writeFile(
    path.join(profile, "settings.json"),
    JSON.stringify({ libraryRoot: library }),
  );
  await fs.writeFile(
    path.join(profile, "game-recents.json"),
    JSON.stringify([
      {
        path: projectFile,
        title: project.title,
        updatedAt: new Date().toISOString(),
      },
    ]),
  );
  await boot();
  const images = await app.evaluate(({ nativeImage }) => [
    Array.from(
      nativeImage
        .createFromBitmap(Buffer.alloc(2000 * 900 * 4, 230), {
          width: 2000,
          height: 900,
        })
        .toPNG(),
    ),
    Array.from(
      nativeImage
        .createFromBitmap(Buffer.alloc(1600 * 900 * 4, 250), {
          width: 1600,
          height: 900,
        })
        .toPNG(),
    ),
  ]);
  // Fully opaque fixtures use different colours and dimensions from the source.
  const opaque = await app.evaluate(
    ({ nativeImage }, images) =>
      images.map((bytes) => {
        const image = nativeImage.createFromBuffer(Buffer.from(bytes)),
          bitmap = image.toBitmap();
        for (let i = 3; i < bitmap.length; i += 4) bitmap[i] = 255;
        return Array.from(
          nativeImage.createFromBitmap(bitmap, image.getSize()).toPNG(),
        );
      }),
    images,
  );
  await fs.writeFile(
    path.join(profile, "panorama.png"),
    Buffer.from(opaque[0]),
  );
  await fs.writeFile(path.join(profile, "terrain.png"), Buffer.from(opaque[1]));
  const restored=await app.evaluate(({nativeImage})=>{const pixels=Buffer.alloc(1600*900*4,160);for(let i=3;i<pixels.length;i+=4)pixels[i]=255;return Array.from(nativeImage.createFromBitmap(pixels,{width:1600,height:900}).toPNG());});
  await fs.writeFile(path.join(profile,"restored.png"),Buffer.from(restored));
});
test.afterEach(async ({}, info) => {
  if (page && !page.isClosed() && info.status !== info.expectedStatus)
    await info.attach("image-tasks-failure", {
      body: await page.screenshot(),
      contentType: "image/png",
    });
  await stop();
  await fs.rm(folder, { recursive: true, force: true });
  expect(errors).toEqual([]);
});
const center = () =>
  page.getByRole("dialog", { name: "Tâches et résultats", exact: true });
async function openCenter() {
  await page.getByRole("button", { name: /^Tâches et résultats/ }).click();
  await expect(center()).toBeVisible();
}
async function background() {
  await page
    .getByRole("button", { name: "Adapter en 20:9 (IA)", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Adapter le décor en 20:9" });
  await dialog
    .getByRole("button", { name: "Générer le panorama 20:9", exact: true })
    .click();
  const img = dialog.getByAltText("Décor original");
  await expect(img).toBeVisible();
  const id = new URL((await img.getAttribute("src"))!).pathname.split("/")[1];
  await dialog.getByRole("button", { name: "Réduire", exact: true }).click();
  return id;
}
async function terrain() {
  await page
    .locator(".studio-sections")
    .getByRole("button", { name: /^Niveaux/ })
    .click();
  await page.getByRole("button", { name: "Paramètres", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Générer les terrains pollué et nettoyé (IA)",
      exact: true,
    })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Générer les deux états du terrain",
    exact: true,
  });
  await dialog
    .getByLabel("Précisions pour le terrain")
    .fill("Conserver les dalles de la serre.");
  await dialog
    .getByRole("button", { name: "Générer les deux états", exact: true })
    .click();
  const source = dialog.getByAltText("Référence pour le terrain");
  await expect(source).toHaveAttribute("src", /lunaria-correction/);
  const id = new URL((await source.getAttribute("src"))!).pathname.split(
    "/",
  )[1];
  await dialog.getByRole("button", { name: "Réduire", exact: true }).click();
  return id;
}
const card = (id: string) => center().locator(`[data-task-id="${id}"] button`);
async function release(id: string) {
  await fs.writeFile(
    path.join(profile, "background-corrections", id, "fixture-release"),
    "ready",
  );
}

test("common queue, minimize, renderer reload, full restart, result validation, undo and safe cleanup", async () => {
  test.setTimeout(120000);
  const before = await fs.readFile(path.join(library, "source.png"));
  const bg = await background(),
    ground = await terrain();
  await openCenter();
  await expect(card(bg)).toContainText("Génération en cours");
  await expect(card(ground)).toContainText("En attente");
  await page.screenshot({
    path: path.join(OUTPUT, "generation-images-file.png"),
  });
  await card(ground).click();
  await expect(center()).toContainText("Une autre image est en cours");
  await release(bg);
  await expect(card(bg)).toContainText("À valider");
  await expect(card(ground)).toContainText("À valider");
  expect(await fs.readFile(path.join(library, "source.png"))).toEqual(before);
  expect(
    JSON.parse(await fs.readFile(projectFile, "utf8")).levels[0].terrainImage,
  ).toBe("library://old.png");
  await center().getByRole("button", { name: "Fermer", exact: true }).click();
  await page.reload();
  await openCenter();
  await expect(card(ground)).toContainText("À valider");
  await stop();
  await boot();
  await openCenter();
  await card(ground).click();
  await expect(
    center().getByAltText("Terrain pollué de la tâche"),
  ).toHaveJSProperty("naturalWidth", 1600);
  await expect(center().getByLabel("Niveau de destination")).toHaveCount(0);
  await expect(center()).toContainText(`Les deux terrains seront affectés à : ${project.levels[0].title}`);
  await center().getByRole("button", { name: "Choisir un autre niveau" }).click();
  await expect(center().getByLabel("Niveau de destination")).toHaveValue("");
  await card(bg).click();
  await card(ground).click();
  await expect(center().getByLabel("Niveau de destination")).toHaveCount(0);
  await center()
    .getByRole("checkbox", { name: "Afficher la grille indicative de 5 × 8" })
    .check();
  await expect(
    center()
      .getByLabel("Grille indicative de 5 allées et 8 colonnes")
      .locator("span"),
  ).toHaveCount(40);
  await page.screenshot({
    path: path.join(OUTPUT, "generation-images-resultat.png"),
  });
  await page.setViewportSize({ width: 1000, height: 680 });
  expect(
    await center().evaluate((node) => node.scrollWidth <= node.clientWidth),
  ).toBe(true);
  await center()
    .getByRole("button", { name: "Utiliser les deux terrains pour le niveau" })
    .scrollIntoViewIfNeeded();
  await expect(
    center().getByRole("button", {
      name: "Utiliser les deux terrains pour le niveau",
    }),
  ).toBeInViewport();
  await page.screenshot({
    path: path.join(OUTPUT, "generation-images-compact.png"),
  });
  await center()
    .getByRole("button", { name: "Utiliser les deux terrains pour le niveau" })
    .click();
  await expect(card(ground)).toContainText("Affectée");
  await expect(center()).toContainText(`Déjà affectés à : ${project.levels[0].title}`);
  await expect(center().getByRole("button", { name: "Utiliser les deux terrains pour le niveau" })).toHaveCount(0);
  await card(bg).click();
  await card(ground).click();
  await expect(center()).toContainText("Déjà affectés à");
  await center().getByRole("button", {name:"Fermer", exact:true}).click();
  await page.keyboard.press("Control+z");
  await openCenter(); await card(ground).click();
  await expect(card(ground)).toContainText("À affecter");
  await expect(center().getByLabel("Niveau de destination")).toHaveCount(0);
  await expect(center().getByRole("button", { name: "Utiliser les deux terrains pour le niveau" })).toBeEnabled();
  await center().getByRole("button", {name:"Fermer", exact:true}).click();
  await page.keyboard.press("Control+Shift+z");
  await page.locator(".studio-modebar").getByRole("button",{name:"Enregistrer le projet",exact:true}).click();
  await page.reload(); await openCenter(); await card(ground).click();
  await expect(card(ground)).toContainText("Affectée");
  await expect(center()).toContainText("Projet enregistré.");
  await expect(center().getByLabel("Niveau de destination")).toHaveCount(0);
  await center().getByRole("button",{name:"Choisir un autre niveau"}).click();
  await center().getByLabel("Niveau de destination").selectOption(project.levels[0].id);
  await expect(center().getByRole("button", { name: "Utiliser les deux terrains pour le niveau" })).toBeDisabled();
  const applied = await page.evaluate(
    (id) => window.lunaria!.getTerrainGeneration(id),
    ground,
  );
  expect(applied.terrainRef).toBeTruthy();
  expect(applied.restoredTerrainRef).toBeTruthy();
  await card(bg).click();
  await center()
    .getByRole("button", { name: "Remplacer le fichier d’origine" })
    .click();
  await expect(card(bg)).toContainText("Validée");
  const savedBg = await page.evaluate(
    (id) => window.lunaria!.getBackgroundCorrection(id),
    bg,
  );
  expect(await fs.readFile(savedBg.backupPath!)).toEqual(before);
  // A third ready result survives cleanup of the two applied jobs.
  const third = await page.evaluate(
    (request) => window.lunaria!.startTerrainGeneration(request),
    {
      ref: "library://old.png" as const,
      levelTitle: "Autre proposition",
      instructions: "",
    },
  );
  await expect(card(third.id)).toContainText("À valider");
  await center()
    .getByRole("button", { name: "Nettoyer les tâches terminées" })
    .click();
  await expect(center().locator(".image-task-card")).toHaveCount(1);
  await expect(card(third.id)).toContainText("À valider");
  expect(await fs.readFile(savedBg.backupPath!)).toEqual(before);
  await expect
    .poll(
      async () =>
        !!(await fs
          .stat(path.join(library, applied.terrainRef!.slice(10)))
          .catch(() => undefined)),
    )
    .toBe(true);
  await center().getByRole("button", { name: "Fermer", exact: true }).click();
  await page.keyboard.press("Control+z");
  await expect(page.locator(".background-job")).toHaveCount(0);
  await page.keyboard.press("Control+Shift+z");
  await page
    .locator(".studio-modebar")
    .getByRole("button", { name: "Enregistrer le projet", exact: true })
    .click();
  await expect
    .poll(
      async () =>
        JSON.parse(await fs.readFile(projectFile, "utf8")).levels[0]
          .terrainImage,
    )
    .toBe(applied.terrainRef);
});

test('deleting a proposal under test restores the original scene and removes the local follow-up', async () => {
  const before = await fs.readFile(path.join(library, 'source.png'));
  const bg = await background(); await release(bg);
  await expect(page.locator('.background-job')).toContainText('Proposition corrigée disponible');
  await page.getByRole('button', { name: 'Adapter en 20:9 (IA)', exact: true }).click();
  await page.getByRole('dialog', { name: 'Adapter le décor en 20:9' }).getByRole('button', { name: 'Tester dans ce plan' }).click();
  const scene = page.locator('[data-testid="scene"] image[data-background]');
  await expect(scene).toHaveAttribute('href', /lunaria-correction/);
  await openCenter(); await card(bg).click();
  await center().getByRole('button', { name: 'Supprimer la tâche', exact: true }).click();
  await expect(card(bg)).toContainText('À valider');
  await center().getByRole('button', { name: 'Confirmer la suppression de cette proposition', exact: true }).click();
  await expect(center()).toContainText('Aucune génération pour le moment');
  await center().getByRole('button', { name: 'Fermer', exact: true }).click();
  await expect(page.locator('.background-job')).toHaveCount(0);
  await expect(scene).not.toHaveAttribute('href', /lunaria-correction/);
  expect(await fs.readFile(path.join(library, 'source.png'))).toEqual(before);
});

test("queued cancellation, interrupted work and explicit retry survive restart", async () => {
  test.setTimeout(90000);
  const bg = await background(),
    ground = await terrain();
  await openCenter();
  await card(ground).click();
  await center().getByRole("button", { name: "Annuler la génération" }).click();
  await expect(card(ground)).toContainText("Annulée");
  expect(
    await fs
      .stat(
        path.join(
          profile,
          "terrain-generations",
          ground,
          "fixture-request.json",
        ),
      )
      .catch(() => undefined),
  ).toBeUndefined();
  await stop();
  await boot();
  await openCenter();
  await expect(card(bg)).toContainText("Interrompue");
  await expect(card(ground)).toContainText("Annulée");
  await card(bg).click();
  await page.screenshot({
    path: path.join(OUTPUT, "generation-images-reprise.png"),
  });
  await center().getByRole("button", { name: "Relancer cette tâche" }).click();
  const newCard = center()
    .locator(".image-task-card")
    .filter({ hasText: "Génération en cours" });
  await expect(newCard).toHaveCount(1);
  await center().getByRole("button", { name: "Annuler la génération" }).click();
  await expect(newCard).toHaveCount(0);
  await center()
    .getByRole("button", { name: "Nettoyer les tâches terminées" })
    .click();
  await expect(center()).toContainText("Aucune génération pour le moment");
  expect(
    await fs
      .stat(path.join(library, "studio_generated"))
      .catch(() => undefined),
  ).toBeUndefined();
});

test("a result from another project requires an explicit destination before applying", async () => {
  const ground = await terrain();
  await openCenter();
  await expect(card(ground)).toContainText("À valider");
  await center().getByRole("button", { name: "Fermer", exact: true }).click();
  const other = path.join(folder, "other.game.json");
  await fs.writeFile(
    other,
    JSON.stringify({
      ...project,
      title: "Autre projet avec les mêmes identifiants",
    }),
  );
  await app.evaluate(({ dialog }, file) => {
    dialog.showOpenDialog = async () => ({
      canceled: false,
      filePaths: [file],
    });
  }, other);
  await page.getByRole('button',{name:'Actions du fichier projet'}).click();
  await page.getByRole('button',{name:'Ouvrir un projet…',exact:true}).click();
  await expect(page.locator(".studio-project-state")).toContainText(
    "other.game.json",
  );
  await openCenter();
  await card(ground).click();
  await expect(center().getByLabel("Niveau de destination")).toHaveValue("");
  await expect(
    center().getByRole("button", {
      name: "Utiliser les deux terrains pour le niveau",
    }),
  ).toBeDisabled();
  await center()
    .getByLabel("Niveau de destination")
    .selectOption(project.levels[0].id);
  await center()
    .getByRole("button", { name: "Utiliser les deux terrains pour le niveau" })
    .click();
  await expect(card(ground)).toContainText("Affectée");
  await center().getByRole("button", { name: "Fermer", exact: true }).click();
  await page
    .locator(".studio-modebar")
    .getByRole("button", { name: "Enregistrer le projet", exact: true })
    .click();
  await expect
    .poll(
      async () =>
        JSON.parse(await fs.readFile(other, "utf8")).levels[0].terrainImage,
    )
    .toMatch(/^library:\/\/studio_generated/);
  expect(
    JSON.parse(await fs.readFile(projectFile, "utf8")).levels[0].terrainImage,
  ).toBe("library://old.png");
});
