import { test, expect, _electron, type ElectronApplication, type Page } from "@playwright/test";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
let app: ElectronApplication, page: Page, dir: string;

test.beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "lunaria-audit-ui-"));
  const env = Object.fromEntries(
    Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
  delete env.LUNARIA_DEV_URL;
  app = await _electron.launch({
    args: [ROOT],
    env: { ...env, LUNARIA_E2E: "1", LUNARIA_TEST_USER_DATA: path.join(dir, "profile") },
  });
  page = await app.firstWindow();
  await page.waitForURL("app://studio/index.html");
});

test.afterEach(async () => {
  if (app) {
    const child = app.process();
    try {
      await app.evaluate(({ app }) => {
        setTimeout(() => app.exit(0), 0);
      });
    } catch {}
    await Promise.race([
      app.close().catch(() => {}),
      new Promise<void>((resolve) => setTimeout(resolve, 5000)),
    ]);
    if (child.exitCode === null) child.kill();
  }
  await fs.rm(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
});

test("Audit section displays live plant and level tables and navigates to editors", async () => {
  await page.locator(".studio-modebar").getByRole("button", { name: /^Niveaux/ }).click();
  await page.getByRole("button", { name: "Créer un premier niveau" }).click();

  const nav = page.locator(".gd-sections");
  await nav.getByRole("button", { name: /^Audit/ }).click();

  await expect(page.getByRole("heading", { name: "Plantes, niveaux, économie & rythme" })).toBeVisible();
  const plantsSection = page.getByRole("region", { name: "Tableau d’équilibrage des plantes alliées" });
  const levelsSection = page.getByRole("region", { name: "Tableau d’économie et de courbe des niveaux" });
  await expect(plantsSection.getByRole("table")).toContainText("Radis");
  await expect(levelsSection.getByRole("table")).toContainText("Nouveau niveau");

  // Jump from Audit directly to Radis sheet, edit its cost, and confirm live update in Audit
  await plantsSection.getByRole("button", { name: "Ouvrir la fiche de Radis" }).click();
  const costField = page.getByLabel("Coût en graines");
  await costField.fill("115");
  await costField.press("Tab");

  await nav.getByRole("button", { name: /^Audit/ }).click();
  await expect(plantsSection.getByRole("table")).toContainText("115");

  // Jump from Audit directly to level settings
  await levelsSection.getByRole("button", { name: /^Modifier les paramètres de/ }).first().click();
  await expect(page.getByRole("button", { name: "Paramètres", exact: true })).toHaveClass(/active/);
});
