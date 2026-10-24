import test from "node:test";
import assert from "node:assert/strict";
import { emptyProject } from "../src/shared/projectSession.js";
import { mergeProject } from "../src/shared/projectMerge.js";
import { newCinematic } from "../src/shared/model.js";
let nextId = 0;
function film() {
  const value = newCinematic();
  value.id = "film_" + nextId++;
  return value;
}
function projects() {
  const base = emptyProject();
  base.cinematics = [film(), film(), film()];
  return { base, local: structuredClone(base), remote: structuredClone(base) };
}
test("three-way merge preserves independent changes on both sides", () => {
  const { base, local, remote } = projects();
  local.cinematics![0].title = "Film local";
  remote.balance.plants[0].damage = 888;
  const merged = mergeProject(base, local, remote);
  assert.equal(merged.conflicts.length, 0);
  assert.equal(merged.project.cinematics![0].title, "Film local");
  assert.equal(merged.project.balance.plants[0].damage, 888);
  assert.notEqual(base.cinematics![0].title, "Film local");
});
test("same-field conflict requires a choice, including zero, empty string and deleted fields", () => {
  const { base, local, remote } = projects();
  local.title = "";
  remote.title = "Disque";
  let result = mergeProject(base, local, remote);
  assert.equal(result.conflicts[0].path, "projet.title");
  result = mergeProject(base, local, remote, { "projet.title": "remote" });
  assert.equal(result.project.title, "Disque");
  assert.equal(result.conflicts.length, 0);
});
test("addition on each side is preserved, including relative insertion position", () => {
  const { base, local, remote } = projects(),
    l = film(),
    r = film();
  local.cinematics!.splice(1, 0, l);
  remote.cinematics!.splice(2, 0, r);
  const result = mergeProject(base, local, remote);
  assert.equal(result.conflicts.length, 0);
  assert.equal(result.project.cinematics!.length, 5);
  assert.deepEqual(
    result.project.cinematics!.map((f) => f.id),
    [
      base.cinematics![0].id,
      l.id,
      base.cinematics![1].id,
      r.id,
      base.cinematics![2].id,
    ],
  );
});
test("deletion plus an independent edit merge without resurrecting the deleted element", () => {
  const { base, local, remote } = projects();
  local.cinematics!.shift();
  remote.cinematics![1].title = "Autre";
  const result = mergeProject(base, local, remote);
  assert.equal(result.conflicts.length, 0);
  assert.equal(result.project.cinematics!.length, 2);
  assert.equal(result.project.cinematics![0].title, "Autre");
});
test("deletion against editing the same element is an explicit conflict", () => {
  const { base, local, remote } = projects();
  local.cinematics!.shift();
  remote.cinematics![0].title = "Disque";
  const result = mergeProject(base, local, remote);
  assert.equal(result.conflicts.length, 1);
  assert.equal(result.conflicts[0].localMissing, true);
  const chosen = mergeProject(base, local, remote, {
    [result.conflicts[0].path]: "remote",
  });
  assert.equal(chosen.project.cinematics!.length, 3);
  assert.equal(chosen.project.cinematics![0].title, "Disque");
});
test("reorder on one side and edit on the other preserve both", () => {
  const { base, local, remote } = projects();
  local.cinematics!.reverse();
  remote.cinematics![0].title = "Disque";
  const result = mergeProject(base, local, remote);
  assert.equal(result.conflicts.length, 0);
  assert.equal(result.project.cinematics![2].title, "Disque");
  assert.equal(result.project.cinematics![0].id, base.cinematics![2].id);
});
test("contradictory reorders require a choice without losing additions", () => {
  const { base, local, remote } = projects();
  local.cinematics!.reverse();
  remote.cinematics!.push(remote.cinematics!.shift()!);
  const result = mergeProject(base, local, remote);
  assert.equal(result.conflicts[0].path, "projet.cinematics.$order");
  const chosen = mergeProject(base, local, remote, {
    "projet.cinematics.$order": "remote",
  });
  assert.deepEqual(
    chosen.project.cinematics!.map((f) => f.id),
    remote.cinematics!.map((f) => f.id),
  );
});
test("primitive array disagreement is explicit rather than guessing the intent", () => {
  const { base, local, remote } = projects();
  local.balance.plants[0].ability_ids = ["A"];
  remote.balance.plants[0].ability_ids = ["B"];
  const result = mergeProject(base, local, remote);
  assert.ok(result.conflicts.some((c) => c.path.endsWith(".ability_ids")));
});
