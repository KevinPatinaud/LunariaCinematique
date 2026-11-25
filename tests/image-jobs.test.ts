import test from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { ImageJobStore, ImageTaskQueue } from "../src/main/imageJobs.js";
import { BackgroundCorrections } from "../src/main/backgroundCorrections.js";
import {
  TerrainGenerations,
  type TerrainGenerator,
} from "../src/main/terrainGenerations.js";
import type { ImageGenerator } from "../src/main/codexImageCorrection.js";

const context = {
  projectId: "project-a",
  projectPath: "C:/projects/a.game.json",
  levelId: "level-a",
  title: "Le jardin",
  terrainRef: "library://old.png" as const,
};
const terrainRequest = {
  ref: "library://source.png" as const,
  levelTitle: "Le jardin",
  instructions: "Dégager le centre.",
  context,
  codexModel: "model-a",
};
const backgroundRequest = {
  ref: "library://source.png" as const,
  instructions: "Étendre le lieu.",
  mode: "rebuild" as const,
  useOriginal: false,
  cropPosition: 0.5,
  outputWidth: "native" as const,
  codexModel: "model-b",
};
const delay = () => new Promise((resolve) => setTimeout(resolve, 5));

test("task files work through a directory alias without accepting a redirected job", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "lunaria-image-paths-"));
  try {
    const jobs = path.join(temp, "jobs");
    const alias = path.join(temp, "alias");
    const job = path.join(jobs, "job");
    const outside = path.join(temp, "outside");
    await fs.mkdir(job, { recursive: true });
    await fs.mkdir(outside);
    await fs.writeFile(path.join(job, "pose.png"), "pose");
    const linkType = process.platform === "win32" ? "junction" : "dir";
    await fs.symlink(jobs, alias, linkType);
    await fs.symlink(outside, path.join(jobs, "redirected"), linkType);

    const store = new ImageJobStore(alias);
    const pose = await store.localFile(path.join(alias, "job"), "pose.png");
    assert.equal(await fs.readFile(pose, "utf8"), "pose");
    await assert.rejects(store.localFile(path.join(alias, "redirected"), "pose.png"), /Dossier de tâche invalide/);
  } finally {
    await fs.rm(temp, { recursive: true, force: true });
  }
});

async function until(check: () => boolean | Promise<boolean>) {
  for (let i = 0; i < 400; i++) {
    if (await check()) return;
    await delay();
  }
  throw Error("Condition did not settle.");
}

async function fixture(
  run: (f: {
    base: string;
    library: string;
    create: (
      terrain?: TerrainGenerator,
      background?: ImageGenerator,
    ) => { terrain: TerrainGenerations; background: BackgroundCorrections };
  }) => Promise<void>,
) {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), "lunaria-image-jobs-")),
    library = path.join(base, "library");
  await fs.mkdir(library);
  await fs.writeFile(path.join(library, "source.png"), "source");
  const instances: {
    terrain: TerrainGenerations;
    background: BackgroundCorrections;
  }[] = [];
  const create = (
    terrain: TerrainGenerator = async (task) => {
      const file = path.join(task.folder, "result.png");
      await fs.writeFile(file, task.state === "polluted" ? "terrain" : "restored");
      return file;
    },
    background: ImageGenerator = async (task) => {
      const file = path.join(task.folder, "result.png");
      await fs.writeFile(file, "panorama");
      return file;
    },
  ) => {
    const queue = new ImageTaskQueue();
    const inspect = (bytes: Buffer) => ({
      width: bytes.toString() === "panorama" ? 2000 : 1600,
      height: 900,
    });
    const result = {
      terrain: new TerrainGenerations({
        queue,
        jobsRoot: path.join(base, "terrains"),
        generatedRoot: base,
        generate: terrain,
        inspect,
        png: (bytes) => bytes,
        finalize: (bytes) => bytes,
      }),
      background: new BackgroundCorrections({
        queue,
        jobsRoot: path.join(base, "backgrounds"),
        generatedRoot: base,
        generate: background,
        inspect,
        encode: (bytes) => bytes,
        crop: (bytes) => bytes,
        canvas: (bytes) => bytes,
        finalize: (bytes) => bytes,
      }),
    };
    instances.push(result);
    return result;
  };
  try {
    await run({ base, library, create });
  } finally {
    for (const instance of instances)
      await Promise.all([
        instance.terrain.close(),
        instance.background.close(),
      ]);
    await fs.rm(base, { recursive: true, force: true });
  }
}

test("a single queue coordinates both processors and queued cancellation never invokes a provider", () =>
  fixture(async ({ library, create }) => {
    let release!: () => void,
      backgroundCalls = 0,
      terrainCalls = 0;
    const { terrain, background } = create(
      async (task) => {
        terrainCalls++;
        if (task.state === "polluted") await new Promise<void>((resolve) => {
          release = resolve;
        });
        const file = path.join(task.folder, "result.png");
        await fs.writeFile(file, task.state === "polluted" ? "terrain" : "restored");
        return file;
      },
      async () => {
        backgroundCalls++;
        throw Error("Must not run");
      },
    );
    const first = await terrain.start(library, terrainRequest);
    await until(() => !!release);
    const second = await background.start(library, backgroundRequest);
    assert.equal(second.status, "queued");
    assert.equal(backgroundCalls, 0);
    background.cancel(second.id);
    release();
    await until(() => terrain.get(first.id).status === "ready");
    await terrain.flush();
    await background.flush();
    assert.equal(background.get(second.id).status, "cancelled");
    assert.equal(backgroundCalls, 0);
    assert.equal(terrainCalls, 2);
  }));

test("restart recovers both ready proposals, requests, models and destinations without provider calls", () =>
  fixture(async ({ library, create }) => {
    const original = create();
    const first = await original.terrain.start(library, terrainRequest),
      second = await original.background.start(library, backgroundRequest);
    await until(
      () =>
        original.terrain.get(first.id).status === "ready" &&
        original.background.get(second.id).status === "ready",
    );
    await Promise.all([original.terrain.close(), original.background.close()]);
    let calls = 0;
    const restored = create(
      async () => {
        calls++;
        throw Error("No automatic restart");
      },
      async () => {
        calls++;
        throw Error("No automatic restart");
      },
    );
    const tasks = [
      ...(await restored.terrain.list()),
      ...(await restored.background.list()),
    ];
    assert.equal(calls, 0);
    assert.deepEqual(
      tasks.map((task) => task.job.status),
      ["ready", "ready"],
    );
    assert.deepEqual(tasks[0].context, context);
    assert.equal(tasks[0].request.instructions, "Dégager le centre.");
    assert.equal(tasks[0].job.codexModel, "model-a");
    assert.equal(tasks[1].job.codexModel, "model-b");
    assert.equal(
      (await restored.terrain.image(first.id, "candidate")).bytes.toString(),
      "terrain",
    );
    assert.equal(
      (
        await restored.background.image(second.id, "corrected")
      ).bytes.toString(),
      "panorama",
    );
    assert.equal(
      await fs.readFile(path.join(library, "source.png"), "utf8"),
      "source",
    );
  }));

test("closing interrupts queued and running work; restart waits for explicit retry", () =>
  fixture(async ({ library, create }) => {
    let started = false;
    const original = create(async (task) => {
      started = true;
      await new Promise<void>((resolve) =>
        task.signal.addEventListener("abort", () => resolve(), { once: true }),
      );
      throw Error("stopped");
    });
    const running = await original.terrain.start(library, terrainRequest);
    await until(() => started);
    const waiting = await original.background.start(library, backgroundRequest);
    assert.equal(waiting.status, "queued");
    await Promise.all([original.terrain.close(), original.background.close()]);
    const restored = create();
    const tasks = [
      ...(await restored.terrain.list()),
      ...(await restored.background.list()),
    ];
    assert.deepEqual(
      tasks.map((task) => task.job.status),
      ["interrupted", "interrupted"],
    );
    assert.equal(restored.terrain.get(running.id).candidateUrl, undefined);
    const retried = await restored.terrain.retry(library, running.id);
    assert.notEqual(retried.id, running.id);
    await until(() => restored.terrain.get(retried.id).status === "ready");
    assert.equal(restored.background.get(waiting.id).status, "interrupted");
  }));

test("recover a fully written candidate after a crash between output and ready metadata", () =>
  fixture(async ({ base, library, create }) => {
    const original = create(),
      job = await original.terrain.start(library, terrainRequest);
    await until(() => original.terrain.get(job.id).status === "ready");
    await original.terrain.close();
    const file = path.join(base, "terrains", job.id, "job.json"),
      data = JSON.parse(await fs.readFile(file, "utf8"));
    data.job.status = "generating";
    delete data.job.candidateUrl;
    await fs.writeFile(file, JSON.stringify(data));
    const restored = create();
    await restored.terrain.ready;
    assert.equal(restored.terrain.get(job.id).status, "ready");
    assert.match(restored.terrain.get(job.id).message, /récupéré/);
  }));

test("purging applied history deletes only scratch files, preserving imported images and original backups", () =>
  fixture(async ({ base, library, create }) => {
    const original = create(),
      terrain = await original.terrain.start(library, terrainRequest),
      background = await original.background.start(library, backgroundRequest);
    await until(
      () =>
        original.terrain.get(terrain.id).status === "ready" &&
        original.background.get(background.id).status === "ready",
    );
    const imported = await original.terrain.apply(library, terrain.id),
      replaced = await original.background.apply(library, background.id);
    await Promise.all([original.terrain.close(), original.background.close()]);
    const restored = create();
    await Promise.all([restored.terrain.ready, restored.background.ready]);
    assert.equal(restored.terrain.get(terrain.id).status, "applied");
    assert.equal(restored.background.get(background.id).status, "applied");
    assert.equal(
      (await restored.terrain.apply(library, terrain.id)).terrainRef,
      imported.terrainRef,
    );
    await restored.terrain.remove(terrain.id);
    await restored.background.remove(background.id);
    await assert.rejects(
      fs.stat(path.join(base, "terrains", terrain.id)),
      /ENOENT/,
    );
    assert.equal(
      await fs.readFile(
        path.join(library, imported.terrainRef!.slice(10)),
        "utf8",
      ),
      "terrain",
    );
    assert.equal(await fs.readFile(replaced.backupPath!, "utf8"), "source");
    assert.equal(
      await fs.readFile(path.join(library, "source.png"), "utf8"),
      "panorama",
    );
    assert.deepEqual(await restored.terrain.list(), []);
    assert.deepEqual(await restored.background.list(), []);
  }));

test("malformed and out-of-folder manifests are ignored, and missing candidates remain actionable failures", () =>
  fixture(async ({ base, library, create }) => {
    const original = create(),
      job = await original.terrain.start(library, terrainRequest);
    await until(() => original.terrain.get(job.id).status === "ready");
    await original.terrain.close();
    await fs.unlink(path.join(base, "terrains", job.id, "terrain-restored.png"));
    const bad = path.join(base, "terrains", randomUUID());
    await fs.mkdir(bad);
    await fs.writeFile(path.join(bad, "job.json"), "{broken");
    const restored = create();
    const tasks = await restored.terrain.list();
    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].job.status, "failed");
    assert.match(tasks[0].job.message, /absent/);
    await assert.rejects(restored.terrain.retry(base, job.id), /bibliothèque/);
  }));

test("completed history does not impose the former 100-job limit", () =>
  fixture(async ({ library, create }) => {
    const { terrain } = create();
    for (let i = 0; i < 102; i++) {
      const job = await terrain.start(library, terrainRequest);
      await until(() => terrain.get(job.id).status === "ready");
      terrain.cancel(job.id);
    }
    await terrain.flush();
    assert.equal((await terrain.list()).length, 102);
  }));

test("restart reconciles a completed apply whose final metadata write was interrupted", () =>
  fixture(async ({ base, library, create }) => {
    const original = create(),
      terrain = await original.terrain.start(library, terrainRequest),
      background = await original.background.start(library, backgroundRequest);
    await until(
      () =>
        original.terrain.get(terrain.id).status === "ready" &&
        original.background.get(background.id).status === "ready",
    );
    const imported = await original.terrain.apply(library, terrain.id),
      replaced = await original.background.apply(library, background.id);
    await Promise.all([original.terrain.close(), original.background.close()]);
    for (const [kind, job] of [
      ["terrains", terrain],
      ["backgrounds", background],
    ] as const) {
      const file = path.join(base, kind, job.id, "job.json"),
        data = JSON.parse(await fs.readFile(file, "utf8"));
      data.job.status = "applying";
      delete data.job.terrainRef;
      delete data.job.backupPath;
      await fs.writeFile(file, JSON.stringify(data));
    }
    const restored = create();
    await Promise.all([restored.terrain.ready, restored.background.ready]);
    assert.equal(restored.terrain.get(terrain.id).status, "applied");
    assert.equal(restored.background.get(background.id).status, "applied");
    assert.equal(
      restored.terrain.get(terrain.id).terrainRef,
      imported.terrainRef,
    );
    assert.equal(
      restored.background.get(background.id).backupPath,
      replaced.backupPath,
    );
  }));

test("saved absolute image paths and URLs cannot redirect restored previews outside the job folder", () =>
  fixture(async ({ base, library, create }) => {
    const original = create(),
      job = await original.terrain.start(library, terrainRequest);
    await until(() => original.terrain.get(job.id).status === "ready");
    await original.terrain.close();
    const outside = path.join(base, "outside.png");
    await fs.writeFile(outside, "private");
    const file = path.join(base, "terrains", job.id, "job.json"),
      data = JSON.parse(await fs.readFile(file, "utf8"));
    data.inputPath = outside;
    data.candidatePath = outside;
    data.restoredCandidatePath = outside;
    data.folder = base;
    data.job.sourceUrl = "file://" + outside;
    data.job.candidateUrl = "file://" + outside;
    data.job.restoredCandidateUrl = "file://" + outside;
    await fs.writeFile(file, JSON.stringify(data));
    const restored = create();
    await restored.terrain.ready;
    assert.equal(
      (await restored.terrain.image(job.id, "source")).bytes.toString(),
      "source",
    );
    assert.equal(
      (await restored.terrain.image(job.id, "candidate")).bytes.toString(),
      "terrain",
    );
    assert.equal((await restored.terrain.image(job.id,"restored")).bytes.toString(),"restored");
    assert.match(
      restored.terrain.get(job.id).sourceUrl,
      /^lunaria-correction:\/\//,
    );
    await restored.terrain.remove(job.id);
    assert.equal(await fs.readFile(outside, "utf8"), "private");
  }));
