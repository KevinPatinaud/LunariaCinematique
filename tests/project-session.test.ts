import test from "node:test";
import assert from "node:assert/strict";
import { ProjectSession, emptyProject } from "../src/shared/projectSession.js";
import { newCinematic } from "../src/shared/model.js";
import {
  newLevel,
  type GameAPI,
  type GameBootstrap,
  type GameFile,
  type GameProject,
  type ProjectDiskConflict,
  type ProjectRecoveryContext,
} from "../src/shared/game/types.js";
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: Error) => void;
  const promise = new Promise<T>((accept, fail) => {
    resolve = accept;
    reject = fail;
  });
  return { promise, resolve, reject };
}
function fixture(t: test.TestContext) {
  const initial = emptyProject();
  let snapshot: GameBootstrap = { recovery: null, recent: [] },
    writes: GameProject[] = [],
    draft: GameProject | null = null,
    context: ProjectRecoveryContext | undefined;
  let saveImpl: GameAPI["save"] = async (p): Promise<GameFile | null> => {
    writes.push(structuredClone(p));
    return { project: p, path: "project.json", token: "token" };
  };
  let file: GameFile | null = null,
    choice: "save" | "discard" | "cancel" = "cancel";
  const io: Pick<
    GameAPI,
    | "bootstrap"
    | "open"
    | "openRecent"
    | "save"
    | "recover"
    | "clearRecovery"
    | "backup"
    | "inspectConflict"
    | "reconcile"
  > = {
    async bootstrap() {
      return snapshot;
    },
    async open() {
      return file;
    },
    async openRecent() {
      return file!;
    },
    async save(p, token, as) {
      return saveImpl(p, token, as);
    },
    async recover(p, c) {
      draft = structuredClone(p);
      context = c;
    },
    async clearRecovery() {
      draft = null;
      context = undefined;
    },
    async backup() {
      return null;
    },
    async inspectConflict() {
      return null;
    },
    async reconcile() {
      throw Error("unexpected");
    },
  };
  const session = new ProjectSession(io, async () => choice, initial);
  t.after(() => session.dispose());
  return {
    session,
    initial,
    io,
    get writes() {
      return writes;
    },
    get draft() {
      return draft;
    },
    get context() {
      return context;
    },
    set snapshot(v: GameBootstrap) {
      snapshot = v;
    },
    set save(fn: typeof saveImpl) {
      saveImpl = fn;
    },
    set file(v: GameFile | null) {
      file = v;
    },
    set choice(v: typeof choice) {
      choice = v;
    },
  };
}
test("one history orders film and game edits; undo/redo returns to the affected view", async (t) => {
  const f = fixture(t),
    s = f.session;
  await s.boot();
  const film = newCinematic();
  s.upsertFilm(film);
  s.setLocation({ mode: "levels", section: "plants", species: "radish" });
  s.change(
    (p) => {
      p.balance.plants[0].damage = 999;
    },
    "damage",
    "Dégâts",
  );
  s.setLocation({
    mode: "cinematics",
    filmId: film.id,
    shotId: film.shots[0].id,
  });
  s.editFilm(
    film.id,
    (p) => {
      p.title = "Titre modifié";
    },
    "title",
    "Titre",
  );
  s.action({ type: "undo" });
  assert.equal(s.project.cinematics![0].title, film.title);
  assert.equal(s.getSnapshot().navigation?.location.filmId, film.id);
  s.action({ type: "undo" });
  assert.notEqual(s.project.balance.plants[0].damage, 999);
  assert.equal(s.getSnapshot().navigation?.location.species, "radish");
  s.action({ type: "redo" });
  assert.equal(s.project.balance.plants[0].damage, 999);
  s.action({ type: "redo" });
  assert.equal(s.project.cinematics![0].title, "Titre modifié");
});
test("selecting another film is a history boundary, never a history reset", async (t) => {
  const { session: s } = fixture(t);
  await s.boot();
  const a = newCinematic(),
    b = newCinematic();
  a.id = "film_A";
  b.id = "film_B";
  s.upsertFilm(a);
  s.upsertFilm(b);
  s.editFilm(
    a.id,
    (p) => {
      p.title = "A";
    },
    "title",
  );
  s.boundary();
  s.editFilm(
    b.id,
    (p) => {
      p.title = "B";
    },
    "title",
  );
  s.action({ type: "undo" });
  assert.equal(s.project.cinematics![0].title, "A");
  assert.equal(s.project.cinematics![1].title, b.title);
  s.action({ type: "undo" });
  assert.equal(s.project.cinematics![0].title, a.title);
});
test("save sets a baseline without clearing history; undo and redo update dirty accurately", async (t) => {
  const f = fixture(t),
    s = f.session;
  await s.boot();
  s.change((p) => {
    p.title = "Titre";
  }, "title");
  assert.equal(await s.save(), true);
  assert.equal(s.getSnapshot().dirty, false);
  assert.equal(s.getSnapshot().history.past.length, 1);
  s.action({ type: "undo" });
  assert.equal(s.getSnapshot().dirty, true);
  s.action({ type: "redo" });
  assert.equal(s.getSnapshot().dirty, false);
  s.change((p) => {
    p.title = "Après";
  }, "title");
  s.action({ type: "undo" });
  assert.equal(s.getSnapshot().dirty, false);
});
test("canceled save and failed save leave the baseline and project intact", async (t) => {
  const f = fixture(t),
    s = f.session;
  await s.boot();
  s.change((p) => {
    p.title = "Travail";
  });
  f.save = async () => null;
  assert.equal(await s.save(), false);
  assert.equal(s.getSnapshot().dirty, true);
  f.save = async () => {
    throw Error("disque plein");
  };
  assert.equal(await s.save(), false);
  assert.equal(s.project.title, "Travail");
  assert.match(s.getSnapshot().message, /disque plein/);
});
test("edits arriving during save remain unsaved", async (t) => {
  const f = fixture(t),
    s = f.session;
  await s.boot();
  s.change((p) => {
    p.title = "Avant";
  });
  let resolve!: (file: GameFile) => void;
  f.save = async () =>
    new Promise((r) => {
      resolve = r;
    });
  const pending = s.save();
  s.change(
    (p) => {
      p.title = "Pendant";
    },
    "",
    "Async",
    { mode: "levels" },
    true,
  );
  resolve({ project: f.initial, path: "a.json", token: "a" });
  await pending;
  assert.equal(s.project.title, "Pendant");
  assert.equal(s.getSnapshot().dirty, true);
  s.action({ type: "undo" });
  assert.equal(s.project.title, "Avant");
  assert.equal(s.getSnapshot().dirty, false);
});

test("a failed save of the previous project does not inspect or change the newly opened project", async (t) => {
  const f = fixture(t), s = f.session, saving = deferred<GameFile | null>();
  await s.boot();
  f.file = { project: f.initial, path: "original.json", token: "original" };
  assert.equal(await s.open(), true);
  const savedTokens: string[] = [], inspectedTokens: string[] = [];
  f.save = async (_project, token) => {
    savedTokens.push(token);
    return saving.promise;
  };
  f.io.inspectConflict = async (token) => {
    inspectedTokens.push(token);
    return null;
  };
  const pending = s.saveCurrent();
  const next = emptyProject();
  next.title = "Projet suivant";
  f.file = { project: next, path: "next.json", token: "next" };
  assert.equal(await s.open(), true);
  const opened = s.getSnapshot();
  saving.reject(Error("Échec de l’ancien fichier"));
  assert.equal(await pending, false);
  assert.deepEqual(savedTokens, ["original"]);
  assert.deepEqual(inspectedTokens, []);
  assert.deepEqual(s.getSnapshot(), opened);
  assert.equal(s.project.title, "Projet suivant");
});

test("a conflict inspection finishing after a real project opening leaves the new project untouched", async (t) => {
  const f = fixture(t), s = f.session;
  const inspecting = deferred<void>(), conflict = deferred<ProjectDiskConflict | null>();
  await s.boot();
  f.file = { project: f.initial, path: "original.json", token: "original" };
  assert.equal(await s.open(), true);
  f.save = async () => { throw Error("Fichier modifié"); };
  const inspectedTokens: string[] = [];
  f.io.inspectConflict = async (token) => {
    inspectedTokens.push(token);
    inspecting.resolve();
    return conflict.promise;
  };
  const pending = s.saveCurrent();
  await inspecting.promise;
  const next = emptyProject();
  next.title = "Projet suivant";
  f.file = { project: next, path: "next.json", token: "next" };
  assert.equal(await s.open(), true);
  const opened = s.getSnapshot();
  conflict.resolve({ path: "original.json", revision: "revision", base: f.initial, remote: f.initial });
  assert.equal(await pending, false);
  assert.deepEqual(inspectedTokens, ["original"]);
  assert.deepEqual(s.getSnapshot(), opened);
  assert.equal(s.getSnapshot().conflict, null);
});

test("a conflict on the current project still preserves its local draft for review", async (t) => {
  const f = fixture(t), s = f.session;
  await s.boot();
  f.file = { project: f.initial, path: "original.json", token: "original" };
  assert.equal(await s.open(), true);
  s.change(project => { project.title = "Brouillon local"; });
  f.save = async () => { throw Error("Fichier modifié"); };
  f.io.inspectConflict = async (token) => {
    assert.equal(token, "original");
    return { path: "original.json", revision: "revision", base: f.initial, remote: f.initial };
  };
  assert.equal(await s.saveCurrent(), false);
  assert.equal(s.getSnapshot().conflict?.local.title, "Brouillon local");
  assert.equal(s.project.title, "Brouillon local");
  assert.match(s.getSnapshot().message, /Compare les versions/);
  assert.equal(s.getSnapshot().dirty, true);
});

test("save as accepts its new file token without treating it as a project replacement", async (t) => {
  const f = fixture(t), s = f.session;
  await s.boot();
  f.file = { project: f.initial, path: "original.json", token: "original" };
  assert.equal(await s.open(), true);
  const epoch = s.getSnapshot().epoch;
  s.change(project => { project.title = "Copie enregistrée"; });
  f.save = async (project, token, as) => {
    assert.equal(token, "original");
    assert.equal(as, true);
    return { project, path: "copy.json", token: "copy" };
  };
  assert.equal(await s.saveCurrent(true), true);
  assert.equal(s.getSnapshot().epoch, epoch);
  assert.equal(s.getSnapshot().token, "copy");
  assert.equal(s.getSnapshot().path, "copy.json");
  assert.equal(s.getSnapshot().dirty, false);
  assert.equal(s.project.title, "Copie enregistrée");
});
test("replacement canceled by the user preserves history, path and draft", async (t) => {
  const f = fixture(t),
    s = f.session;
  await s.boot();
  s.change((p) => {
    p.title = "Courant";
  });
  f.file = { project: emptyProject(), path: "other.json", token: "other" };
  await s.open();
  assert.equal(s.project.title, "Courant");
  assert.equal(s.getSnapshot().history.past.length, 1);
  assert.equal(s.getSnapshot().path, "");
});
test("save required by replacement must succeed before opening", async (t) => {
  const f = fixture(t),
    s = f.session;
  await s.boot();
  s.change((p) => {
    p.title = "Courant";
  });
  f.choice = "save";
  f.save = async () => null;
  f.file = { project: emptyProject(), path: "other.json", token: "other" };
  await s.open();
  assert.equal(s.project.title, "Courant");
});
test("opening another project resets history only after successful IO", async (t) => {
  const f = fixture(t),
    s = f.session;
  await s.boot();
  s.change((p) => {
    p.title = "Courant";
  });
  f.choice = "discard";
  const next = emptyProject();
  next.title = "Autre";
  f.file = { project: next, path: "other.json", token: "other" };
  await s.open();
  assert.equal(s.project.title, "Autre");
  assert.equal(s.getSnapshot().history.past.length, 0);
  assert.equal(s.getSnapshot().dirty, false);
});
test("recovery resumes as an undoable project edit and keeps the opened file", async (t) => {
  const f = fixture(t),
    draft = structuredClone(f.initial);
  draft.title = "Brouillon";
  f.file = { project: f.initial, path: "project.json", token: "token" };
  f.snapshot = {
    recovery: draft,
    recent: [{ path: "project.json", title: "x", updatedAt: "" }],
  };
  const s = f.session;
  await s.boot();
  await s.resumeRecovery();
  assert.equal(s.project.title, "Brouillon");
  assert.equal(s.getSnapshot().path, "project.json");
  assert.equal(s.getSnapshot().dirty, true);
  s.action({ type: "undo" });
  assert.equal(s.project.title, f.initial.title);
  assert.equal(s.getSnapshot().dirty, false);
});
test("recovery merges new disk changes using its saved base", async (t) => {
  const f = fixture(t),
    draft = structuredClone(f.initial),
    disk = structuredClone(f.initial);
  draft.title = "Brouillon";
  disk.balance.plants[0].damage = 321;
  f.file = { project: disk, path: "project.json", token: "token" };
  f.snapshot = {
    recovery: draft,
    recoveryContext: { base: f.initial, path: "project.json" },
    recent: [{ path: "project.json", title: "x", updatedAt: "" }],
  };
  await f.session.boot();
  await f.session.resumeRecovery();
  assert.equal(f.session.project.title, "Brouillon");
  assert.equal(f.session.project.balance.plants[0].damage, 321);
});
test("conflicting recovery requires an explicit choice and does not overwrite the open project", async (t) => {
  const f = fixture(t),
    draft = structuredClone(f.initial),
    disk = structuredClone(f.initial);
  draft.title = "Brouillon";
  disk.title = "Disque";
  f.file = { project: disk, path: "project.json", token: "token" };
  f.snapshot = {
    recovery: draft,
    recoveryContext: { base: f.initial, path: "project.json" },
    recent: [{ path: "project.json", title: "x", updatedAt: "" }],
  };
  await f.session.boot();
  await f.session.resumeRecovery();
  assert.equal(f.session.project.title, "Disque");
  assert.equal(f.session.getSnapshot().conflict?.kind, "recovery");
  await f.session.resolveConflict(draft);
  assert.equal(f.writes.length, 0);
  assert.equal(f.session.project.title, "Brouillon");
  f.session.action({ type: "undo" });
  assert.equal(f.session.project.title, "Disque");
});
test("autosave persists a whole-project draft with its baseline, and undo to baseline clears it", async (t) => {
  const f = fixture(t),
    s = f.session;
  await s.boot();
  const film = newCinematic();
  s.upsertFilm(film);
  s.change((p) => {
    p.title = "Draft";
  });
  await new Promise((r) => setTimeout(r, 650));
  assert.equal(f.draft?.title, "Draft");
  assert.equal(f.draft?.cinematics?.[0].id, film.id);
  assert.equal(f.context?.base.title, f.initial.title);
  s.action({ type: "undo" });
  s.action({ type: "undo" });
  await new Promise((r) => setTimeout(r, 650));
  assert.equal(f.draft, null);
});
test("confirmed close discards the draft without recreating it after cleanup", async (t) => {
  const f = fixture(t),
    s = f.session;
  await s.boot();
  s.change((p) => {
    p.title = "Discard";
  });
  f.choice = "discard";
  assert.equal(await s.prepareClose(), true);
  await new Promise((r) => setTimeout(r, 650));
  assert.equal(f.draft, null);
});
test("boot runs once even when called repeatedly", async (t) => {
  const f = fixture(t);
  let count = 0;
  f.io.bootstrap = async () => {
    count++;
    return { recovery: null, recent: [] };
  };
  await Promise.all([f.session.boot(), f.session.boot()]);
  assert.equal(count, 1);
});
test("navigating away and back separates edits even inside the coalescing interval", async (t) => {
  const { session: s } = fixture(t);
  await s.boot();
  const location = {
    mode: "levels" as const,
    section: "plants",
    species: "radish",
  };
  s.setLocation(location);
  s.change((p) => {
    p.balance.plants[0].damage = 100;
  }, "damage");
  s.setLocation({ mode: "levels", section: "plants", species: "rose" });
  s.setLocation(location);
  s.change((p) => {
    p.balance.plants[0].damage = 200;
  }, "damage");
  assert.equal(s.getSnapshot().history.undoCommands.length, 2);
  s.action({ type: "undo" });
  assert.equal(s.project.balance.plants[0].damage, 100);
});
test("an unreviewed recovered draft survives saving, opening another project and closing", async (t) => {
  const f = fixture(t),
    draft = structuredClone(f.initial);
  draft.title = "Brouillon à revoir";
  f.snapshot = {
    recovery: draft,
    recoveryContext: { base: f.initial, path: "project.json" },
    recent: [{ path: "project.json", title: "x", updatedAt: "" }],
  };
  f.file = { project: f.initial, path: "project.json", token: "token" };
  let cleared = 0;
  f.io.clearRecovery = async () => {
    cleared++;
  };
  const s = f.session;
  await s.boot();
  s.change((p) => {
    p.title = "Projet actuel";
  });
  await s.save();
  assert.equal(s.getSnapshot().recovery?.title, draft.title);
  assert.equal(cleared, 0);
  f.file = { project: emptyProject(), path: "other.json", token: "other" };
  await s.open();
  assert.equal(s.getSnapshot().recovery?.title, draft.title);
  assert.equal(await s.prepareClose(), true);
  assert.equal(cleared, 0);
});
test("a recovered draft from another path becomes an unsaved project even when the project IDs match", async (t) => {
  const f = fixture(t),
    draft = structuredClone(f.initial);
  draft.title = "Autre fichier";
  f.snapshot = {
    recovery: draft,
    recoveryContext: { base: f.initial, path: "original.json" },
    recent: [{ path: "copy.json", title: "Copie", updatedAt: "" }],
  };
  f.file = { project: f.initial, path: "copy.json", token: "copy" };
  await f.session.boot();
  await f.session.resumeRecovery();
  assert.equal(f.session.project.title, "Autre fichier");
  assert.equal(f.session.getSnapshot().path, "");
  assert.equal(f.session.getSnapshot().token, "");
  assert.equal(f.session.getSnapshot().dirty, true);
});
test("a written save remains successful if optional recovery cleanup fails", async (t) => {
  const f = fixture(t),
    s = f.session;
  await s.boot();
  s.change((p) => {
    p.title = "Enregistré";
  });
  f.io.clearRecovery = async () => {
    throw Error("nettoyage indisponible");
  };
  assert.equal(await s.save(), true);
  assert.equal(s.getSnapshot().dirty, false);
  assert.match(s.getSnapshot().message, /Projet enregistré/);
});

test("save cleanup finishing after another project opens cannot announce the previous save", async (t) => {
  const f = fixture(t), s = f.session;
  await s.boot();
  f.file = { project: f.initial, path: "original.json", token: "original" };
  assert.equal(await s.open(), true);
  const originalEpoch = s.getSnapshot().epoch;
  const cleaning = deferred<void>(), cleanup = deferred<void>(), replaced = deferred<void>();
  let clears = 0;
  f.io.clearRecovery = async () => {
    if (clears++ === 0) {
      cleaning.resolve();
      await cleanup.promise;
    }
  };
  const pending = s.saveCurrent();
  await cleaning.promise;
  const messages: string[] = [];
  const unsubscribe = s.subscribe(() => {
    if (s.getSnapshot().epoch !== originalEpoch) {
      messages.push(s.getSnapshot().message);
      replaced.resolve();
    }
  });
  t.after(unsubscribe);
  const next = emptyProject();
  next.title = "Projet suivant";
  f.file = { project: next, path: "next.json", token: "next" };
  const opening = s.open();
  await replaced.promise;
  cleanup.resolve();
  assert.equal(await pending, false);
  assert.equal(await opening, true);
  assert.equal(s.project.title, "Projet suivant");
  assert.equal(s.getSnapshot().path, "next.json");
  assert.equal(s.getSnapshot().token, "next");
  assert.equal(s.getSnapshot().message, "Projet ouvert.");
  assert.ok(messages.every(message => !message.includes("cinématiques enregistrés")));
});
