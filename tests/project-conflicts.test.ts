import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { GameDocuments } from "../src/main/gameDocuments.js";
import { emptyProject } from "../src/shared/projectSession.js";
import { mergeProject } from "../src/shared/projectMerge.js";
async function fixture(t: test.TestContext) {
  const root = await mkdtemp(path.join(os.tmpdir(), "lunaria-conflicts-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const documents = new GameDocuments(path.join(root, "profile")),
    project = emptyProject(),
    file = await documents.save(project, "", path.join(root, "p.game.json"));
  return { documents, project, file, root };
}
test("disk comparison uses the exact opened base and preserves every version before reconciling", async (t) => {
  const { documents: d, project, file } = await fixture(t),
    local = structuredClone(project),
    remote = structuredClone(project);
  local.title = "Local";
  remote.balance.plants[0].damage = 222;
  await writeFile(file.path, JSON.stringify(remote));
  await assert.rejects(d.save(local, file.token), /modifié hors/);
  const conflict = await d.inspectConflict(file.token);
  assert.ok(conflict?.remote);
  assert.equal(conflict.base.title, project.title);
  const result = mergeProject(conflict.base, local, conflict.remote);
  const saved = await d.reconcile(
    result.project,
    file.token,
    conflict.revision,
    local,
  );
  assert.equal(saved.project.title, "Local");
  assert.equal(saved.project.balance.plants[0].damage, 222);
  assert.ok(saved.preserved);
  assert.deepEqual((await readdir(saved.preserved)).sort(), [
    "base.game.json",
    "brouillon.game.json",
    "disque.game.json",
    "origine.json",
    "reuni.game.json",
  ]);
  assert.equal(
    JSON.parse(
      await readFile(path.join(saved.preserved, "brouillon.game.json"), "utf8"),
    ).title,
    "Local",
  );
  assert.equal(
    JSON.parse(
      await readFile(path.join(saved.preserved, "disque.game.json"), "utf8"),
    ).title,
    remote.title,
  );
  await d.save(saved.project, saved.token);
});
test("a second disk change invalidates the comparison and cannot be overwritten", async (t) => {
  const { documents: d, project, file } = await fixture(t),
    remote = structuredClone(project);
  remote.title = "Premier changement";
  await writeFile(file.path, JSON.stringify(remote));
  const conflict = await d.inspectConflict(file.token);
  remote.title = "Deuxième changement";
  await writeFile(file.path, JSON.stringify(remote));
  await assert.rejects(
    d.reconcile(project, file.token, conflict!.revision, project),
    /encore changé/,
  );
  assert.equal(
    JSON.parse(await readFile(file.path, "utf8")).title,
    "Deuxième changement",
  );
});
test("invalid or missing disk files still allow retaining the complete local draft", async (t) => {
  const { documents: d, project, file, root } = await fixture(t);
  await writeFile(file.path, "{ broken");
  const conflict = await d.inspectConflict(file.token);
  assert.ok(conflict);
  assert.equal(conflict.remote, null);
  const copy = await d.save(
    project,
    file.token,
    path.join(root, "copy.game.json"),
  );
  assert.ok(copy);
  assert.equal(await readFile(file.path, "utf8"), "{ broken");
});
test("recovery metadata is bound to its exact draft and cleared together", async (t) => {
  const { documents: d, project, file, root } = await fixture(t),
    draft = structuredClone(project);
  draft.title = "Brouillon";
  await d.recover(draft, { base: project, path: file.path });
  let boot = await d.bootstrap();
  assert.equal(boot.recoveryContext?.path, file.path);
  assert.equal(boot.recoveryContext?.base.title, project.title);
  draft.title = "Remplacement sans méta";
  await writeFile(
    path.join(root, "profile", "game-recovery.json"),
    JSON.stringify(draft),
  );
  boot = await d.bootstrap();
  assert.equal(boot.recoveryContext, undefined);
  assert.equal(boot.recovery?.title, draft.title);
  await d.clearRecovery();
  assert.equal((await d.bootstrap()).recovery, null);
  await assert.rejects(
    readFile(path.join(root, "profile", "game-recovery.meta.json")),
  );
});
test("forged ownership cannot inspect or reconcile another document", async (t) => {
  const { documents: d, project, file } = await fixture(t);
  assert.equal(await d.inspectConflict("forged"), null);
  await assert.rejects(
    d.reconcile(project, "forged", "hash", project),
    /remplacé/,
  );
  assert.equal((await d.open(file.path)).project.title, project.title);
});
test("an unreadable recovery is preserved verbatim before any cleanup or new autosave", async (t) => {
  const { documents: d, root } = await fixture(t),
    profile = path.join(root, "profile");
  await writeFile(path.join(profile, "game-recovery.json"), "{broken draft");
  const boot = await d.bootstrap();
  assert.equal(boot.recovery, null);
  assert.match(boot.recoveryWarning ?? "", /conservé/);
  const folders = await readdir(path.join(profile, "project-conflicts"));
  const retained = path.join(
    profile,
    "project-conflicts",
    folders[0],
    "brouillon-original.json",
  );
  await d.clearRecovery();
  assert.equal(await readFile(retained, "utf8"), "{broken draft");
});
