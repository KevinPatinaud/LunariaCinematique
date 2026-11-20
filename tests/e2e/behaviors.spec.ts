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
import { parseGameProject } from "../../src/shared/game/validation.js";
import { newPhase } from "../../src/shared/game/logic.js";
const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
let app: ElectronApplication,
  page: Page,
  dir: string,
  file: string,
  errors: string[],
  original: ReturnType<typeof seedProject>;
test.beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "lunaria-behaviors-e2e-"));
  file = path.join(dir, "project.game.json");
  const profile = path.join(dir, "profile");
  await fs.mkdir(profile);
  original = parseGameProject(seedProject());
  original.levels = [];
  original.campaign = { steps: [], cinematics: [] };
  original.cinematics = [];
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
test.afterEach(async () => {
  await app
    ?.evaluate(({ BrowserWindow }) => {
      for (const w of BrowserWindow.getAllWindows()) w.destroy();
    })
    .catch(() => {});
  await app?.close();
  await fs.rm(dir, { recursive: true, force: true });
  expect(errors).toEqual([]);
});
async function species(name = "Lierre", team = "Plantes alliées") {
  await page
    .locator(".gd-sections")
    .getByRole("button", { name: new RegExp("^" + team) })
    .click();
  await page
    .locator(".gd-catalog")
    .getByRole("button", { name: new RegExp("^" + name) })
    .click();
  await page
    .getByRole("navigation", { name: "Fiche de " + name })
    .getByRole("button", { name: "Comportement", exact: true })
    .click();
}
const sub = (name: string) =>
  page
    .getByRole("navigation", { name: "Réglages du comportement" })
    .getByRole("button", { name, exact: true });
async function save() {
  await page
    .getByRole("button", { name: "Enregistrer le projet", exact: true })
    .click();
  await expect(page.locator(".studio-project-state")).toContainText(
    "Projet enregistré",
  );
  return JSON.parse(await fs.readFile(file, "utf8"));
}
async function capture(name: string) {
  if (process.env.LUNARIA_BEHAVIOR_CAPTURE)
    await page.screenshot({
      path: path.join(process.env.LUNARIA_BEHAVIOR_CAPTURE, name),
    });
}
test("personal phases preserve the shared model, undo completely, and survive save/reopen", async () => {
  await species();
  const initial = original.balance.plants.find(
    (p) => p.id === "ivy",
  )!.behaviorId!;
  await expect(page.locator(".behavior-scope")).toContainText(
    "Réglages personnels · Lierre",
  );
  await sub("Phases").click();
  await page.getByRole("button", { name: "+ Phase", exact: true }).click();
  await page.getByLabel("Nom phase 2", { exact: true }).fill("Liane tenace");
  await page.getByLabel("Seuil PV phase 2 (%)", { exact: true }).fill("40");
  await page.getByLabel("Seuil PV phase 2 (%)", { exact: true }).press("Tab");
  await capture("comportement-phases.png");
  let doc = await save();
  let ivy = doc.balance.plants.find((s: any) => s.id === "ivy"),
    model = doc.logic.behaviors.find((b: any) => b.id === ivy.behaviorId);
  expect(ivy.behaviorId).not.toBe(initial);
  expect(model.phases[1].healthBelow).toBe(40);
  expect(model.phases[1].name).toBe("Liane tenace");
  expect(doc.logic.behaviors.find((b: any) => b.id === initial)).toEqual(
    original.logic!.behaviors.find((b) => b.id === initial),
  );
  expect(doc.balance.plants.filter((s: any) => s.id !== "ivy")).toEqual(
    original.balance.plants.filter((s) => s.id !== "ivy"),
  );
  await page.getByRole("button", { name: "Actions du fichier projet", exact: true }).click();
  await page.getByRole("button", { name: "Ouvrir un projet…", exact: true }).click();
  await expect(page.locator(".gd-message")).toContainText("Projet ouvert.");
  await species();
  await sub("Phases").click();
  await page
    .getByRole("navigation", { name: "Phases du comportement" })
    .getByRole("button", { name: /Liane tenace/ })
    .click();
  await expect(page.getByLabel("Seuil PV phase 2 (%)")).toHaveValue("40");
  await page.getByRole("button", { name: "Supprimer cette phase" }).click();
  await page.getByRole("button", { name: "Annuler", exact: true }).click();
  await expect(
    page.getByRole("navigation", { name: "Phases du comportement" }),
  ).toContainText("Liane tenace");
});
test("the capability shortcut keeps the selected owner and decision trace explains the winning rule", async () => {
  await species("Noisetier");
  await page
    .getByRole("navigation", { name: "Fiche de Noisetier" })
    .getByRole("button", { name: "Capacités", exact: true })
    .click();
  await page
    .getByText("Organisation du combat et valeurs de référence", {
      exact: true,
    })
    .click();
  await page
    .getByRole("button", {
      name: "Configurer les priorités et phases",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("region", { name: "Comportement de Noisetier" }),
  ).toBeVisible();
  await sub("Priorités").click();
  await page.getByLabel("Utilisation des attaques").selectOption("priority");
  await page.getByRole("button", { name: "+ Règle", exact: true }).click();
  await sub("Tester").click();
  await expect(page.getByLabel("Décision du comportement")).toContainText(
    "Porteur : Noisetier",
  );
  const readiness = page.getByRole("checkbox", { name: /^Capacité prête/ });
  await expect(page.locator(".behavior-rule-trace")).toContainText("Retenue");
  await expect(page.locator(".behavior-rule-trace")).toContainText(
    "Une règle précédente a gagné",
  );
  for (let i = 0; i < (await readiness.count()); i++)
    await readiness.nth(i).uncheck();
  await expect(page.locator(".behavior-rule-trace")).toContainText(
    "Capacité en recharge",
  );
  await capture("comportement-test.png");
  await page.getByRole("button", { name: "Recommencer à 100 %" }).click();
  const targets = page.getByRole("checkbox", { name: /^Cible disponible/ });
  for (let i = 0; i < (await targets.count()); i++)
    await targets.nth(i).uncheck();
  await expect(page.locator(".behavior-rule-trace")).toContainText(
    "Aucune cible à portée",
  );
});
test("preview retains crossed phases after healing and never edits the project", async () => {
  await species();
  await sub("Phases").click();
  await page.getByRole("button", { name: "+ Phase", exact: true }).click();
  await page.getByRole("button", { name: "+ Phase", exact: true }).click();
  await save();
  await sub("Tester").click();
  await page.getByLabel("PV de test (%)").fill("20");
  await page.getByLabel("PV de test (%)").press("Tab");
  await expect(page.getByLabel("Décision du comportement")).toContainText(
    "Phase : Phase 3",
  );
  await page.getByLabel("PV de test (%)").fill("95");
  await page.getByLabel("PV de test (%)").press("Tab");
  await expect(page.getByLabel("Décision du comportement")).toContainText(
    "Phase : Phase 3",
  );
  await expect(page.locator(".studio-project-state")).toContainText(
    "Projet enregistré",
  );
  await page.getByRole("button", { name: "Recommencer à 100 %" }).click();
  await expect(page.getByLabel("Décision du comportement")).toContainText(
    "Phase : Normal",
  );
});
test("shared editing is an explicit choice and keeps the selected group linked", async () => {
  await species();
  const initial = original.balance.plants.find(
    (p) => p.id === "ivy",
  )!.behaviorId!;
  const count = original.balance.plants.filter(
    (p) => p.behaviorId === initial,
  ).length;
  await page
    .getByRole("button", { name: "Modifier le modèle partagé…" })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Modifier le comportement partagé",
  });
  await expect(dialog).toContainText("Lierre");
  await dialog
    .getByRole("button", {
      name: "Modifier pour les " + count + " personnages",
    })
    .click();
  await page
    .getByLabel("Nom du comportement", { exact: true })
    .fill("Défense commune");
  const doc = await save();
  expect(doc.balance.plants.find((s: any) => s.id === "ivy").behaviorId).toBe(
    initial,
  );
  expect(doc.logic.behaviors.find((b: any) => b.id === initial).name).toBe(
    "Défense commune",
  );
  expect(doc.logic.behaviors.length).toBe(original.logic!.behaviors.length);
  await capture("comportement-partage.png");
});
test("template application defaults to a personal copy and remains undoable", async () => {
  await species();
  await page.getByRole("button", { name: "Appliquer un modèle…" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Appliquer un modèle de comportement",
  });
  await expect(
    dialog.getByRole("radio", { name: /^Copie personnelle/ }),
  ).toBeChecked();
  await dialog
    .getByRole("button", { name: "Appliquer une copie personnelle" })
    .click();
  let doc = await save();
  expect(
    doc.balance.plants.find((s: any) => s.id === "ivy").behaviorId,
  ).not.toBe(original.balance.plants.find((s) => s.id === "ivy")!.behaviorId);
  await page.getByRole("button", { name: "Annuler", exact: true }).click();
  doc = await save();
  expect(doc.balance.plants.find((s: any) => s.id === "ivy").behaviorId).toBe(
    original.balance.plants.find((s) => s.id === "ivy")!.behaviorId,
  );
});
test("the advanced model library protects live users and requires an explicit test carrier", async () => {
  await page
    .locator(".gd-sections")
    .getByRole("button", { name: /^Comportements/ })
    .click();
  await expect(
    page.getByLabel("Nom du comportement", { exact: true }),
  ).toBeDisabled();
  await sub("Tester").click();
  await expect(
    page.getByText(
      "Choisis un porteur dans le catalogue de ce camp pour tester ce modèle.",
      { exact: false },
    ),
  ).toBeVisible();
  await page.getByLabel("Porteur de l’essai du modèle").selectOption("ivy");
  await expect(page.getByLabel("Décision du comportement")).toContainText(
    "Porteur : Lierre",
  );
  await capture("modeles-comportements.png");
  await page.getByRole("button", { name: "Lierre →", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Comportement de Lierre" }),
  ).toBeVisible();
  for (const width of [1462, 1024]) {
    await page.setViewportSize({ width, height: 820 });
    const button = await page
      .getByRole("button", { name: "Enregistrer le projet" })
      .boundingBox();
    expect(button!.x + button!.width).toBeLessThanOrEqual(width);
    expect(
      await page
        .locator(".behavior-tabs")
        .evaluate((el) => el.getBoundingClientRect().right),
    ).toBeLessThanOrEqual(width);
  }
});

test("numeric phase drafts commit to their owner across immediate phase and character changes", async () => {
  const sharedId = original.balance.plants.find(
    (s) => s.id === "ivy",
  )!.behaviorId!;
  original
    .logic!.behaviors.find((b) => b.id === sharedId)!
    .phases.push(newPhase(1), newPhase(2));
  await fs.writeFile(file, JSON.stringify(original));
  await page.getByRole("button", { name: "Actions du fichier projet", exact: true }).click();
  await page.getByRole("button", { name: "Ouvrir un projet…", exact: true }).click();
  await expect(page.locator(".gd-message")).toContainText("Projet ouvert.");
  await species();
  await sub("Phases").click();
  const phases = () =>
    page.getByRole("navigation", { name: "Phases du comportement" });
  await phases().getByRole("button").nth(1).click();
  await page.getByLabel("Seuil PV phase 2 (%)").fill("44");
  await phases().getByRole("button").nth(0).click();
  await phases().getByRole("button").nth(1).click();
  await expect(page.getByLabel("Seuil PV phase 2 (%)")).toHaveValue("44");
  await phases().getByRole("button").nth(2).click();
  await page.getByLabel("Seuil PV phase 3 (%)").fill("20");
  await page
    .locator(".gd-catalog")
    .getByRole("button", { name: /^Noisetier/ })
    .click();
  await expect(
    page.getByRole("region", { name: "Comportement de Noisetier" }),
  ).toBeVisible();
  await species();
  await sub("Phases").click();
  await phases().getByRole("button").nth(2).click();
  await expect(page.getByLabel("Seuil PV phase 3 (%)")).toHaveValue("20");
  const doc = await save(),
    privateId = doc.balance.plants.find((s: any) => s.id === "ivy").behaviorId;
  expect(privateId).not.toBe(sharedId);
  expect(doc.logic.behaviors.find((b: any) => b.id === sharedId)).toEqual(
    original.logic!.behaviors.find((b) => b.id === sharedId),
  );
  expect(doc.balance.plants.filter((s: any) => s.id !== "ivy")).toEqual(
    original.balance.plants.filter((s) => s.id !== "ivy"),
  );
  await page.getByRole("button", { name: "Actions du fichier projet", exact: true }).click();
  await page.getByRole("button", { name: "Ouvrir un projet…", exact: true }).click();
  await expect(page.locator(".gd-message")).toContainText("Projet ouvert.");
  await species();
  await sub("Phases").click();
  await phases().getByRole("button").nth(2).click();
  await expect(page.getByLabel("Seuil PV phase 3 (%)")).toHaveValue("20");
});
