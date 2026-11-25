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
import { newLevel } from "../../src/shared/game/types.js";
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
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "lunaria-action-sounds-"));
  file = path.join(dir, "project.game.json");
  const profile = path.join(dir, "profile"),
    library = path.join(dir, "library");
  await fs.mkdir(profile);
  await fs.mkdir(library);
  original = fixturePresentation(seedProject(), "library://pixel.png");
  await fs.writeFile(path.join(library, "pixel.png"), PIXEL_PNG);
  // Decodable PCM, isolated from all authored sound files.
  const wav = Buffer.alloc(44 + 8000);
  wav.write("RIFF");
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(8000, 24);
  wav.writeUInt32LE(8000, 28);
  wav.writeUInt16LE(1, 32);
  wav.writeUInt16LE(8, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(8000, 40);
  for (let i = 44; i < wav.length; i++)
    wav[i] =
      128 + Math.round(30 * Math.sin(((i - 44) * Math.PI * 2 * 440) / 8000));
  for (const id of ["start", "release", "impact", "marker", "personal"]) {
    const asset = `library://${id}.wav` as const;
    await fs.writeFile(path.join(library, id + ".wav"), wav);
    original.presentation!.audio.push({
      id: "sound_" + id,
      name: "Son " + id,
      asset,
      bus: "sfx",
      volume: 0.2,
      loop: false,
      pitchVariation: 0,
      maxInstances: 4,
    });
  }
  for (const id of ["radish", "rose"])
    original.balance.plants.find((s) => s.id === id)!.animationProfileId =
      original.presentation!.defaultProfileId;
  const a = structuredClone(
    original.combat!.abilities.find((a) => a.id === "ab_basic_shot")!,
  );
  a.id = "test_action";
  a.name = "Tir de contrôle";
  a.cooldownSource = "fixed";
  a.cooldown = 0.1;
  a.presentation!.start.soundId = "sound_start";
  a.presentation!.releaseCue.soundId = "sound_release";
  a.presentation!.impact.soundId = "sound_impact";
  original.combat!.abilities.push(a);
  original.balance.plants.find((s) => s.id === "radish")!.ability_ids = [a.id];
  original.presentation!.profiles.find(
    (p) => p.id === original.presentation!.defaultProfileId,
  )!.events = [];
  const clip = original.presentation!.animations.find(
    (a) => a.id === "default_attack",
  )!;
  clip.duration = 0.4;
  clip.markers = [
    { id: "release_test", type: "release", at: 0.2, ref: "", attach: "launch" },
    {
      id: "terminal_sound",
      type: "sound",
      at: 0.4,
      ref: "sound_marker",
      attach: "head",
    },
  ];
  original.levels = [newLevel(["radish", "rose"], "runner")];
  original.cinematics = [];
  original.campaign = {
    steps: [{ id: "one", kind: "level", levelId: original.levels[0].id }],
    cinematics: [],
  };
  parseGameProject(original);
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
  errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.waitForURL("app://studio/index.html");
  await expect(page.locator(".studio-project-state")).toContainText(
    "project.game.json",
  );
  await app.evaluate(({ dialog }, file) => {
    dialog.showOpenDialog = async () => ({
      canceled: false,
      filePaths: [file],
    });
    dialog.showSaveDialog = async () => ({ canceled: false, filePath: file });
    dialog.showMessageBox = async () => ({
      response: 1,
      checkboxChecked: false,
    });
  }, file);
  await page
    .locator(".studio-modebar")
    .getByRole("button", { name: "Niveaux", exact: true })
    .click();
  await page.evaluate(() => {
    const Original = window.Audio;
    (window as any).__sounds = [];
    (window as any).__voices = [];
    (window as any).Audio = function (src: string) {
      const audio = new Original(src);
      (window as any).__voices.push(audio);
      audio.addEventListener("playing", () => {
        (window as any).__sounds.push({ src, decoded: audio.readyState >= 2 });
      });
      return audio;
    };
  });
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
async function select(name = "Radis") {
  await page
    .locator(".studio-sections")
    .getByRole("button", { name: /^Plantes/ })
    .click();
  await page
    .locator(".gd-catalog")
    .getByRole("button", { name: new RegExp("^" + name) })
    .click();
  await page
    .getByRole("button", { name: "Animations et sons de " + name, exact: true })
    .click();
  return page.getByRole("article", { name: "Action : Attaque", exact: true });
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

test("actions expose effective channels, isolate shared overrides, undo, save and reopen", async () => {
  const action = await select();
  await expect(action).toBeVisible();
  await action.getByLabel("Capacité pour Attaque").selectOption("test_action");
  await expect(action).toContainText("Départ après 0.050 s");
  await action.locator("summary").click();
  await expect(action).toContainText("Son release");
  await action
    .getByLabel("Son de Départ de l’attaque")
    .selectOption("sound_personal");
  await expect(action).toContainText("Son personal");
  await page.getByRole("button", { name: "Annuler", exact: true }).click();
  await expect(action.getByLabel("Son de Départ de l’attaque")).toHaveValue("");
  await page.getByRole("button", { name: "Rétablir", exact: true }).click();
  await expect(action.getByLabel("Son de Départ de l’attaque")).toHaveValue(
    "sound_personal",
  );
  const data = await save(),
    radish = data.balance.plants.find((s: any) => s.id === "radish"),
    rose = data.balance.plants.find((s: any) => s.id === "rose");
  expect(radish.animationProfileId).not.toBe(rose.animationProfileId);
  expect(rose.animationProfileId).toBe(original.presentation!.defaultProfileId);
  expect(
    data.presentation.profiles.find(
      (p: any) => p.id === rose.animationProfileId,
    ).events,
  ).toEqual([]);
  await page.getByRole("button", { name: "Actions du fichier projet", exact: true }).click();
  await page.getByRole("button", { name: "Ouvrir un projet…", exact: true }).click();
  await expect(page.locator(".gd-message")).toContainText("Projet ouvert.");
  await page.locator(".gd-message button").click();
  const reopened = await select();
  await reopened.locator("summary").click();
  await expect(reopened.getByLabel("Son de Départ de l’attaque")).toHaveValue(
    "sound_personal",
  );
  await reopened
    .getByRole("button", {
      name: "Rétablir l’héritage des sons et effets",
      exact: true,
    })
    .nth(1)
    .click();
  await expect(reopened.getByLabel("Son de Départ de l’attaque")).toHaveValue(
    "",
  );
  const restored = await save();
  expect(
    restored.presentation.profiles
      .find((p: any) => p.id === radish.animationProfileId)
      .events.some((e: any) => e.event === "release"),
  ).toBe(false);
});
test("forward preview decodes start, release and terminal marker once; seek is silent and navigation stops audio", async () => {
  const action = await select();
  await action.getByLabel("Capacité pour Attaque").selectOption("test_action");
  await action
    .getByRole("button", { name: "Lire ou mettre en pause l’animation" })
    .click();
  await expect
    .poll(() => page.evaluate(() => (window as any).__sounds.length))
    .toBe(3);
  const sounds = await page.evaluate(() => (window as any).__sounds);
  expect(sounds.every((s: any) => s.decoded)).toBe(true);
  expect(sounds.map((s: any) => new URL(s.src).pathname)).toEqual(
    expect.arrayContaining([
      expect.stringContaining("start.wav"),
      expect.stringContaining("release.wav"),
      expect.stringContaining("marker.wav"),
    ]),
  );
  await action
    .getByRole("button", { name: "Créer une version pour Radis" })
    .click();
  await page.getByLabel("Curseur temporel de l’animation").fill("0.4");
  await expect
    .poll(() => page.evaluate(() => (window as any).__sounds.length))
    .toBe(3);
  await page
    .getByRole("button", { name: "Actions du personnage", exact: true })
    .click();
  const card = page.getByRole("article", {
    name: "Action : Attaque",
    exact: true,
  });
  await card.locator("summary").click();
  await card
    .getByRole("button", { name: "Écouter : Départ de l’attaque", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => (window as any).__sounds.length))
    .toBe(4);
  await card.locator("summary").click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as any).__voices.every((a: HTMLAudioElement) => a.paused),
      ),
    )
    .toBe(true);
  await card.locator("summary").click();
  await card
    .getByRole("button", { name: "Écouter : Départ de l’attaque", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => (window as any).__sounds.length))
    .toBe(5);
  await page
    .getByRole("button", { name: "Caractéristiques", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as any).__voices.every((a: HTMLAudioElement) => a.paused),
      ),
    )
    .toBe(true);
});
test("optional actions distinguish inheritance from disabled and keep controls reachable at 1024px", async () => {
  await select();
  const victory = page.getByRole("article", {
    name: "Action : Victoire",
    exact: true,
  });
  await victory.getByLabel("Animation pour Victoire").selectOption("");
  await expect(victory).toContainText("Désactivée");
  const data = await save(),
    id = data.balance.plants.find(
      (s: any) => s.id === "radish",
    ).animationProfileId;
  expect(
    data.presentation.profiles
      .find((p: any) => p.id === id)
      .slots.find((s: any) => s.slot === "victory").animationId,
  ).toBe("");
  await victory.getByLabel("Animation pour Victoire").selectOption("@inherit");
  await expect(victory).toContainText("Profil par défaut");
  await page.setViewportSize({ width: 1024, height: 900 });
  await expect(victory.getByLabel("Animation pour Victoire")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const action = page.getByRole("article", {
    name: "Action : Attaque",
    exact: true,
  });
  await action.getByRole("button", { name: "Régler dans Capacités" }).click();
  await expect(
    page
      .getByRole("navigation", { name: "Fiche de Radis" })
      .getByRole("button", { name: "Capacités", exact: true }),
  ).toHaveClass("active");
  await expect(page.locator(".lp-species-actions")).toHaveCount(0);
});
