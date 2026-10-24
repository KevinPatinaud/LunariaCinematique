import test from "node:test";
import assert from "node:assert/strict";
import { seedProject } from "./fixtures/seed40.js";
import { imageTaskProjectLabel, terrainTaskDestination, type ImageTask } from "../src/shared/imageTasks.js";

function fixture() {
  const project = seedProject(), level = project.levels[0];
  level.terrainImage = "library://old.png";
  level.restoredTerrainImage = "library://old-clean.png";
  const task: ImageTask = { kind: "terrain", libraryRoot: "C:/art", request: { ref: "library://source.png", levelTitle: level.title, instructions: "" },
    context: { projectId: project.id, projectPath: "C:/project.json", levelId: level.id, title: level.title, terrainRef: level.terrainImage, restoredTerrainRef: level.restoredTerrainImage },
    job: { id: "generated", sourceRef: "library://source.png", sourceUrl: "", status: "applied", message: "", terrainRef: "library://new.png", restoredTerrainRef: "library://new-clean.png" } };
  const destination = () => terrainTaskDestination(task, project, "C:/project.json", "C:/art")!;
  const label = () => imageTaskProjectLabel(task, project, "C:/project.json", "C:/art");
  return {project, level, task, destination, label};
}
test("terrain import is distinct from assignment and undo restores the known destination", () => {
  const {level, task, destination, label} = fixture();
  assert.equal(label(), "À affecter"); assert.equal(destination().target?.id, level.id);
  const before = structuredClone(level);
  level.terrainImage = task.job.terrainRef; level.restoredTerrainImage = task.job.restoredTerrainRef;
  assert.equal(label(), "Affectée"); assert.deepEqual(destination().assigned.map(l=>l.id), [level.id]);
  Object.assign(level, before);
  assert.equal(label(), "À affecter"); assert.equal(destination().target?.id, level.id);
});
test("both old references, project identity, path and library must match for automatic targeting", () => {
  for (const change of ["polluted", "clean", "project", "path", "library", "deleted"]) {
    const {project, level, task, destination} = fixture();
    if (change === "polluted") level.terrainImage = "library://other.png";
    if (change === "clean") level.restoredTerrainImage = "library://other-clean.png";
    if (change === "project") task.context!.projectId = "other-project";
    if (change === "path") task.context!.projectPath = "C:/other.json";
    if (change === "library") task.libraryRoot = "C:/other-art";
    if (change === "deleted") project.levels = [];
    assert.equal(destination().target, undefined, change); assert.deepEqual(destination().assigned, [], change);
  }
});
test("a partial pair is never labelled assigned; assignment can be recognised in a different project", () => {
  const {project, level, task, destination, label} = fixture();
  level.terrainImage = task.job.terrainRef;
  assert.equal(label(), "À affecter"); assert.equal(destination().target, undefined);
  level.restoredTerrainImage = task.job.restoredTerrainRef; project.id = "other-project";
  assert.equal(label(), "Affectée"); assert.equal(destination().assigned[0].id, level.id);
});
