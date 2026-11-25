import { test, expect, _electron, type ElectronApplication } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { seedProject } from "../fixtures/seed40.js";
import { fixturePresentation, PIXEL_PNG } from "../presentation-fixture.js";
import { newActor, newCinematic, type Asset } from "../../src/shared/model.js";
import { newAnimation } from "../../src/shared/presentation/factories.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("live presentation uses protect closed and unplaced films, follow undo, and preserve deletion after reopening", async ({}, info) => {
  test.setTimeout(60000);
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "lunaria-presentation-usages-"));
  const file = path.join(dir, "project.game.json");
  const library = path.join(dir, "library");
  const profile = path.join(dir, "profile");
  let app: ElectronApplication | undefined;
  const errors: string[] = [];
  try {
    await fs.mkdir(library);
    await fs.mkdir(profile);
    await fs.writeFile(path.join(library, "pixel.png"), PIXEL_PNG);
    await fs.writeFile(path.join(profile, "settings.json"), JSON.stringify({ libraryRoot: library }));
    const project = fixturePresentation(seedProject(), "library://pixel.png");
    project.levels = [];
    const protectedAnimation = { ...newAnimation(), id: "usage_protected", name: "Animation protégée", ownerSpeciesId: "" };
    const freeAnimation = { ...newAnimation(), id: "usage_free", name: "Animation libre", ownerSpeciesId: "" };
    project.presentation!.animations.push(protectedAnimation, freeAnimation);
    const asset: Asset = { ref: "library://pixel.png", path: "pixel.png", name: "Acteur", folder: "", kind: "character", bytes: PIXEL_PNG.length, modified: 0, url: "", thumbnail: "" };
    const opened = newCinematic();
    opened.title = "Film ouvert";
    project.cinematics = [opened, ...["Film fermé", "Suite après la fin", "Film hors parcours"].map((title, index) => {
      const film = newCinematic();
      film.id = "usage_film_" + index;
      film.title = title;
      film.schemaVersion = 4;
      film.presentationCatalog = { projectId: project.id, file: "content/design/game_content.json" };
      const actor = newActor(asset, 1);
      actor.name = "Acteur " + title;
      actor.animation = { mode: "animation", animationId: protectedAnimation.id, speciesId: "radish", slot: "attack", speed: 1 };
      film.shots[0].actors = [actor];
      return film;
    })];
    project.campaign = {
      cinematics: project.cinematics.slice(1, 3).map((film, index) => ({ id: "usage_link_" + index, title: film.title, file: film.id + ".json", documentId: film.id })),
      steps: [
        { id: "usage_closed_step", kind: "cinematic", cinematicId: "usage_link_0", skippable: true },
        { id: "usage_end", kind: "end" },
        { id: "usage_after_end", kind: "cinematic", cinematicId: "usage_link_1", skippable: true },
      ],
    };
    await fs.writeFile(file, JSON.stringify(project));
    await fs.writeFile(path.join(profile, "game-recents.json"), JSON.stringify([{ path: file, title: project.title, updatedAt: new Date().toISOString() }]));
    const env = { ...process.env, LUNARIA_E2E: "1", LUNARIA_TEST_USER_DATA: profile };
    delete env.LUNARIA_DEV_URL;
    app = await _electron.launch({ args: [ROOT], env: env as Record<string, string> });
    const page = await app.firstWindow();
    page.on("pageerror", (error) => errors.push(error.message));
    await page.waitForURL("app://studio/index.html");
    await expect(page.getByLabel("Titre de la cinématique")).toHaveValue("Film ouvert");
    await app.evaluate(({ dialog }, target) => {
      dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [target] });
      dialog.showSaveDialog = async () => ({ canceled: false, filePath: target });
      dialog.showMessageBox = async () => ({ response: 1, checkboxChecked: false });
    }, file);

    async function animations() {
      const trigger = page.locator(".studio-more-trigger");
      if ((await trigger.getAttribute("aria-expanded")) !== "true") await trigger.click();
      await page.locator(".studio-more-popover").getByRole("button", { name: /^Animations communes/ }).click();
    }
    async function inspectProtected() {
      await animations();
      await page.locator(".lp-catalog-items").getByRole("button", { name: /^Animation protégée/ }).click();
      const technical = page.locator(".lp-technical").first();
      if (await technical.getAttribute("open") === null) await technical.locator("summary").click();
    }
    const references = () => page.locator(".lp-reference-list span");
    const remove = () => page.locator(".lp-editor-heading").getByRole("button", { name: "Supprimer", exact: true });
    await inspectProtected();
    await expect(references()).toHaveCount(3);
    for (const title of ["Film fermé", "Suite après la fin", "Film hors parcours"])
      await expect(page.locator(".lp-reference-list")).toContainText(title);
    await expect(remove()).toBeDisabled();
    await expect(page.getByRole("button", { name: "Vérifier les films liés", exact: true })).toHaveCount(0);
    await page.screenshot({ path: info.outputPath("usages-presentation.png") });

    // Editing a closed film changes the index immediately; no refresh request is needed.
    await page.locator(".studio-modebar").getByRole("button", { name: "Cinématiques", exact: true }).click();
    await page.getByLabel("Cinématique du projet").selectOption("usage_film_0");
    await page.getByRole("button", { name: "Sélectionner Acteur Film fermé", exact: true }).click();
    await page.getByLabel("Source de l’acteur", { exact: true }).selectOption("static");
    await inspectProtected();
    await expect(references()).toHaveCount(2);
    await expect(remove()).toBeDisabled();
    await page.getByRole("button", { name: "Annuler", exact: true }).click();
    await inspectProtected();
    await expect(references()).toHaveCount(3);
    await page.getByRole("button", { name: "Rétablir", exact: true }).click();
    await inspectProtected();
    await expect(references()).toHaveCount(2);

    // An unused definition remains removable, undoable, persistable and reopenable.
    await page.locator(".lp-catalog-items").getByRole("button", { name: /^Animation libre/ }).click();
    await expect(remove()).toBeEnabled();
    await remove().click();
    await expect(page.locator(".lp-catalog-items").getByRole("button", { name: /^Animation libre/ })).toHaveCount(0);
    await page.getByRole("button", { name: "Annuler", exact: true }).click();
    await expect(page.locator(".lp-catalog-items").getByRole("button", { name: /^Animation libre/ })).toHaveCount(1);
    await page.getByRole("button", { name: "Rétablir", exact: true }).click();
    await expect(page.locator(".lp-catalog-items").getByRole("button", { name: /^Animation libre/ })).toHaveCount(0);
    await page.getByRole("button", { name: "Enregistrer le projet", exact: true }).click();
    await expect(page.locator(".studio-project-state")).toContainText("Projet enregistré");
    const saved = JSON.parse(await fs.readFile(file, "utf8"));
    expect(saved.presentation.animations.some((animation: { id: string }) => animation.id === freeAnimation.id)).toBe(false);
    expect(saved.presentation.animations.some((animation: { id: string }) => animation.id === protectedAnimation.id)).toBe(true);
    expect(saved.cinematics).toHaveLength(4);
    await page.getByRole("button", { name: "Actions du fichier projet" }).click();
    await page.getByRole("button", { name: "Ouvrir un projet…", exact: true }).click();
    await inspectProtected();
    await expect(references()).toHaveCount(2);
    await expect(remove()).toBeDisabled();
    await expect(page.locator(".lp-catalog-items").getByRole("button", { name: /^Animation libre/ })).toHaveCount(0);
  } finally {
    if (app) {
      await app.evaluate(({ BrowserWindow }) => { for (const window of BrowserWindow.getAllWindows()) window.destroy(); }).catch(() => {});
      await app.close();
    }
    await fs.rm(dir, { recursive: true, force: true });
    expect(errors).toEqual([]);
  }
});
