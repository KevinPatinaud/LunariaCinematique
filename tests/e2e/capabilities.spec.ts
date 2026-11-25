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
const ROOT = path.resolve(".");
let app: ElectronApplication, page: Page, dir: string, target: string;
const failures: string[] = [];
test.beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "lunaria-capabilities-"));
  target = path.join(dir, "project.game.json");
  await fs.mkdir(path.join(dir, "profile"));
  await fs.writeFile(
    path.join(dir, "profile", "game-preview.json"),
    JSON.stringify({
      gameRoot: "C:/dev/Lunaria/game",
      godotPath: "C:/Program Files/Godot/Godot_v4.7.2-stable_win64_console.exe",
    }),
  );
  const env = { ...process.env };
  delete env.LUNARIA_DEV_URL;
  app = await _electron.launch({
    args: [ROOT],
    env: {
      ...env,
      LUNARIA_E2E: "1",
      LUNARIA_TEST_USER_DATA: path.join(dir, "profile"),
    },
  });
  page = await app.firstWindow();
  failures.length = 0;
  page.on("pageerror", (e) => failures.push(e.message));
  await page.waitForURL("app://studio/index.html");
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
  }, target);
  await page
    .locator(".studio-sections")
    .getByRole("button", { name: /^Plantes/ })
    .click();
});
test.afterEach(async ({}, info) => {
  if (info.status !== info.expectedStatus)
    await info.attach("capabilities", {
      body: await page.screenshot(),
      contentType: "image/png",
    });
  const child = app.process();
  try {
    await app.evaluate(({ app }) => app.exit(0));
  } catch {}
  await app.close().catch(() => {});
  if (child.exitCode === null) child.kill();
  await fs.rm(dir, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 150,
  });
  expect(failures).toEqual([]);
});
async function owner(name: string) {
  await page
    .getByRole("complementary", { name: "Catalogue des plantes" })
    .getByRole("button", { name: new RegExp("^" + name) })
    .click();
  await page.getByRole("button", { name: "Capacités", exact: true }).click();
}
async function save() {
  await page
    .locator(".studio-modebar")
    .getByRole("button", { name: "Enregistrer le projet" })
    .click();
  await expect(page.locator(".gd-message")).toContainText("enregistrés");
  return JSON.parse(await fs.readFile(target, "utf8"));
}
test("Lierre edits named mechanics on its own sheet, persists and opens an isolated workshop", async () => {
  await owner("Lierre");
  await expect(
    page.getByLabel("Ralentissement des déplacements et attaques (%)"),
  ).toHaveValue("80");
  await expect(
    page.getByLabel("Dégâts par pulsation (PV)", { exact: true }),
  ).toHaveValue("6");
  const radius = page.getByLabel("Rayon de l’explosion (cases)");
  await radius.fill("1,7");
  await radius.press("Tab");
  const document = await save();
  expect(
    document.combat.effects.find((x: any) => x.id === "fx_ivy_bind").binding
      .radius,
  ).toBe(1.7);
  // Clicking Test commits the focused draft without requiring a prior save.
  await radius.fill("1,9");
  await page.getByRole("button", { name: "▶ Tester cette capacité" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Atelier de combat ouvert" }),
  ).toBeVisible();
  const files = await fs.readdir(
    path.join(dir, "profile", "capability-workshops"),
  );
  expect(files).toHaveLength(1);
  const snapshot = JSON.parse(
    await fs.readFile(
      path.join(dir, "profile", "capability-workshops", files[0]),
      "utf8",
    ),
  );
  expect(
    snapshot.combat.effects.find((x: any) => x.id === "fx_ivy_bind").binding
      .radius,
  ).toBe(1.9);
  expect(snapshot.levels).toEqual([]);
  await page.getByRole("button", { name: "Actions du fichier projet", exact: true }).click();
  await page.getByRole("button", { name: "Ouvrir un projet…", exact: true }).click();
  await expect(page.locator(".gd-message")).toContainText("Projet ouvert.");
  await page
    .locator(".studio-sections")
    .getByRole("button", { name: /^Plantes/ })
    .click();
  await owner("Lierre");
  await expect(radius).toHaveValue("1.7");
  await page.locator(".gd-message button").click();
  await page.getByText('Projet Lunaria enregistré : niveaux et cinématiques dans un seul fichier.',{exact:true}).waitFor({state:'hidden'});
  await page.getByLabel("Nom de la capacité").scrollIntoViewIfNeeded();
  await page
    .locator(".cap-editor")
    .evaluate((element) => element.scrollIntoView({ block: "start" }));
  const output =
    process.env.CAPABILITY_ARTIFACT_DIR ??
    path.join(ROOT, "work", "capabilities");
  await fs.mkdir(output, { recursive: true });
  await page.screenshot({ path: path.join(output, "fougere-studio.png") });
  await page.getByRole('region',{name:'Effet 2',exact:true}).evaluate(element=>element.scrollIntoView({block:'start'}));
  await page.screenshot({path:path.join(output,'fougere-effets.png')});
  await app
    .browserWindow(page)
    .then((w) => w.evaluate((window) => window.setSize(1024, 820)));
  await page
    .getByRole("button", { name: "▶ Tester cette capacité" })
    .scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("button", { name: "▶ Tester cette capacité" }),
  ).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: path.join(output, "fougere-studio-1024.png") });
});
test("personalizing Noisetier copies its dependency graph and preserves Baobab after reopening", async () => {
  await owner("Noisetier");
  const value = page.getByLabel("PV par déclenchement");
  await value.fill("9");
  await value.press("Tab");
  const doc = await save(),
    hazel = doc.balance.plants.find((x: any) => x.id === "hazel");
  expect(hazel.ability_ids[0]).not.toBe("ab_personal_regeneration");
  const local = doc.combat.abilities.find(
    (x: any) => x.id === hazel.ability_ids[0],
  );
  expect(local.effects[0]).not.toBe("fx_regen");
  expect(doc.combat.effects.find((x: any) => x.id === "fx_regen").amount).toBe(
    4,
  );
  const count = doc.combat.abilities.length;
  await value.fill("11");
  await value.press("Tab");
  const edited = await save();
  expect(edited.combat.abilities).toHaveLength(count);
  expect(
    edited.balance.plants.find((x: any) => x.id === "hazel").ability_ids,
  ).toEqual(hazel.ability_ids);
  await owner("Baobab");
  await page.getByRole("button", { name: /^Régénération personnelle/ }).click();
  await expect(value).not.toHaveValue("9");
  await page.getByRole("button", { name: "Actions du fichier projet", exact: true }).click();
  await page.getByRole("button", { name: "Ouvrir un projet…", exact: true }).click();
  await expect(page.locator(".gd-message")).toContainText("Projet ouvert.");
  await page
    .locator(".studio-sections")
    .getByRole("button", { name: /^Plantes/ })
    .click();
  await owner("Noisetier");
  await expect(value).toHaveValue("11");
});
test("a full duplicate keeps vine behavior while its effect edits stay independent", async () => {
  await page.locator(".studio-more-trigger").click();
  await page
    .locator(".studio-more-popover")
    .getByRole("button", { name: /^Modèles de capacités/ })
    .click();
  await page.getByLabel("Rechercher une capacité").fill("Crosse");
  await page
    .locator(".cap-library .gd-catalog")
    .getByRole("button", { name: /Étreinte de lierre/ })
    .click();
  await page.getByRole("button", { name: "Dupliquer entièrement" }).click();
  const radius = page.getByLabel("Rayon de l’explosion (cases)");
  await radius.fill("2");
  await radius.press("Tab");
  const doc = await save(),
    copy = doc.combat.abilities.find(
      (x: any) => x.name === "Étreinte de lierre — copie",
    );
  expect(copy.effects).not.toContain("fx_ivy_bind");
  expect(copy.projectileId).not.toBe("proj_ivy_vine");
  expect(
    doc.combat.effects.find((x: any) => x.id === copy.effects[1]).binding
      .radius,
  ).toBe(2);
  expect(
    doc.combat.effects.find((x: any) => x.id === "fx_ivy_bind").binding.radius,
  ).toBe(1.25);
});
