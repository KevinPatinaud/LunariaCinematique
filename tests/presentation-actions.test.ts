import test from "node:test";
import assert from "node:assert/strict";
import { seedProject } from "../src/shared/game/seed.js";
import { parseGameProject } from "../src/shared/game/validation.js";
import {
  DEFAULT_PRESENTATION,
  newAnimation,
  ensurePresentation,
} from "../src/shared/presentation/defaults.js";
import {
  actionPresentation,
  speciesActionSlots,
} from "../src/shared/presentation/actions.js";
import {
  personalizeAnimation,
  setSpeciesCue,
  setSpeciesAnimation,
} from "../src/shared/presentation/ownership.js";
import {
  eventCue,
  resolvedEventCue,
  resolveAnimation,
  species,
} from "../src/shared/presentation/runtime.js";
import { previewSignals } from "../src/shared/presentation/preview.js";
const project = () => parseGameProject(seedProject());

test("self support using the generic attack retains its real idle preview until a personal gesture is assigned", () => {
  const p = project(),
    s = species(p, "radish")!;
  s.animationProfileId = p.presentation!.defaultProfileId;
  const a = structuredClone(p.combat!.abilities[0]);
  a.id = "self_support";
  a.delivery = "instant";
  a.target = "self";
  a.presentation!.slot = "attack";
  p.combat!.abilities.push(a);
  s.ability_ids = [a.id];
  const action = actionPresentation(p, s, "attack", a.id);
  assert.equal(action.keepsBase, true);
  assert.equal(action.previewAnimation?.id, resolveAnimation(p, s, "idle")?.id);
  personalizeAnimation(p, s.id, "attack", false);
  assert.equal(actionPresentation(p, s, "attack", a.id).keepsBase, false);
});

test("new clips are independent, neutral and action-specific even when artistic defaults change order", () => {
  const art = structuredClone(DEFAULT_PRESENTATION.animations);
  try {
    DEFAULT_PRESENTATION.animations.reverse();
    const attack = newAnimation(),
      walk = newAnimation("move"),
      hit = newAnimation("hit");
    assert.equal(attack.kind, "procedural");
    assert.equal(attack.loop, false);
    assert.equal(attack.markers[0].type, "release");
    assert.equal(attack.markers[0].at, 0.2);
    assert.deepEqual(attack.frames, []);
    assert.equal(walk.loop, true);
    assert.deepEqual(walk.markers, []);
    assert.equal(hit.loop, false);
    assert.deepEqual(hit.markers, []);
    attack.transform.x = 99;
    assert.equal(newAnimation().transform.x, 0);
    assert.notEqual(newAnimation().id, attack.id);
  } finally {
    DEFAULT_PRESENTATION.animations.splice(
      0,
      DEFAULT_PRESENTATION.animations.length,
      ...art,
    );
  }
});
test("normalization preserves every authored presentation byte", () => {
  const p = project(),
    before = JSON.stringify(p.presentation);
  ensurePresentation(p);
  assert.equal(JSON.stringify(p.presentation), before);
});
test("cue edit isolates shared slots and events, resetting does not change another character", () => {
  const p = project(),
    s = species(p, "radish")!,
    rose = species(p, "rose")!;
  rose.animationProfileId = s.animationProfileId;
  const original = structuredClone(
    p.presentation!.profiles.find((pr) => pr.id === s.animationProfileId)!,
  );
  const sound = p.presentation!.audio[0].id;
  setSpeciesCue(p, s.id, "release", {
    soundId: sound,
    vfxId: "",
    attach: "head",
  });
  assert.notEqual(s.animationProfileId, rose.animationProfileId);
  assert.deepEqual(
    p.presentation!.profiles.find((pr) => pr.id === rose.animationProfileId),
    original,
  );
  assert.equal(eventCue(p, s, "release").soundId, sound);
  assert.equal(eventCue(p, s, "release").attach, "head");
  setSpeciesCue(p, s.id, "release", null);
  assert.equal(
    p
      .presentation!.profiles.find((pr) => pr.id === s.animationProfileId)!
      .events.some((e) => e.event === "release"),
    false,
  );
});
test("default inheritance is a no-op and optional disabled actions remain distinct", () => {
  const p = project(),
    s = species(p, "radish")!;
  s.animationProfileId = p.presentation!.defaultProfileId;
  const before = JSON.stringify(p);
  setSpeciesAnimation(p, s.id, "attack", null);
  setSpeciesCue(p, s.id, "spawn", null);
  assert.equal(JSON.stringify(p), before);
  setSpeciesAnimation(p, s.id, "victory", "");
  assert.equal(actionPresentation(p, s, "victory").source, "disabled");
  assert.equal(resolveAnimation(p, s, "victory"), undefined);
  setSpeciesAnimation(p, s.id, "victory", null);
  assert.equal(actionPresentation(p, s, "victory").source, "inherited");
  assert.ok(resolveAnimation(p, s, "victory"));
  const current = JSON.stringify(p);
  assert.throws(() => setSpeciesAnimation(p, s.id, "attack", ""), /base/);
  assert.equal(JSON.stringify(p), current);
});
test("personal copies retain frames, anchors, cues and release times but isolate identities", () => {
  const p = project(),
    s = species(p, "radish")!,
    old = structuredClone(resolveAnimation(p, s, "attack")!);
  const id = personalizeAnimation(p, s.id, "attack"),
    copy = resolveAnimation(p, s, "attack")!;
  assert.equal(copy.id, id);
  assert.notEqual(copy.id, old.id);
  assert.deepEqual(copy.frames, old.frames);
  assert.deepEqual(copy.attachments, old.attachments);
  assert.deepEqual(
    copy.markers.map(({ id, ...m }) => m),
    old.markers.map(({ id, ...m }) => m),
  );
  assert.notEqual(copy.markers[0].id, old.markers[0].id);
  copy.frames[0].duration = 0.5;
  assert.deepEqual(
    p.presentation!.animations.find((a) => a.id === old.id),
    old,
  );
});
test("full catalogues and bad references fail atomically", () => {
  const p = project(),
    s = species(p, "radish")!;
  s.animationProfileId = p.presentation!.defaultProfileId;
  while (p.presentation!.profiles.length < 128)
    p.presentation!.profiles.push({
      id: "extra_" + p.presentation!.profiles.length,
      name: "Extra",
      slots: [],
      events: [],
    });
  const before = JSON.stringify(p);
  assert.throws(() => personalizeAnimation(p, s.id, "attack"), /128/);
  assert.equal(JSON.stringify(p), before);
  assert.throws(
    () =>
      setSpeciesCue(p, s.id, "start", {
        soundId: "missing",
        vfxId: "",
        attach: "center",
      }),
    /introuvable/,
  );
  assert.equal(JSON.stringify(p), before);
  assert.throws(
    () => setSpeciesAnimation(p, s.id, "attack", "rose_punch_combo"),
    /autre personnage/,
  );
  assert.equal(JSON.stringify(p), before);
});
test("an action exposes phase-only abilities and their actual custom slots", () => {
  const p = project(),
    s = species(p, "radish")!,
    ability = structuredClone(p.combat!.abilities[0]);
  ability.id = "phase_only";
  ability.presentation!.slot = "phase_gesture";
  p.combat!.abilities.push(ability);
  p.logic!.behaviors.find(
    (b) => b.id === s.behaviorId,
  )!.phases[0].abilityIds.push(ability.id);
  assert.ok(speciesActionSlots(p, s).includes("phase_gesture"));
  assert.equal(
    actionPresentation(p, s, "phase_gesture").ability?.id,
    ability.id,
  );
});
test("resolved cues expose independent sources and the common attachment chosen by the first channel", () => {
  const p = project(),
    s = species(p, "radish")!,
    pr = p.presentation!.profiles.find((v) => v.id === s.animationProfileId)!,
    defaults = p.presentation!.profiles.find(
      (v) => v.id === p.presentation!.defaultProfileId,
    )!;
  pr.events = [
    { event: "impact", soundId: "personal_sound", vfxId: "", attach: "feet" },
  ];
  defaults.events = [
    {
      event: "impact",
      soundId: "fallback_sound",
      vfxId: "fallback_vfx",
      attach: "head",
    },
  ];
  const a = { soundId: "", vfxId: "ability_vfx", attach: "launch" as const },
    q = {
      soundId: "projectile_sound",
      vfxId: "projectile_vfx",
      attach: "center" as const,
    };
  assert.deepEqual(resolvedEventCue(p, s, "impact", a, q), {
    cue: { soundId: "personal_sound", vfxId: "ability_vfx", attach: "feet" },
    soundSource: "character",
    vfxSource: "ability",
    attachSource: "character",
  });
  pr.events = [];
  assert.deepEqual(resolvedEventCue(p, s, "impact", a, q), {
    cue: {
      soundId: "projectile_sound",
      vfxId: "ability_vfx",
      attach: "launch",
    },
    soundSource: "projectile",
    vfxSource: "ability",
    attachSource: "ability",
  });
});
test("action timing uses the game cadence, including the one-second enemy base and fallback delay", () => {
  const p = project(),
    s = species(p, "radish")!,
    a = p.combat!.abilities.find((v) => s.ability_ids!.includes(v.id))!;
  a.cooldownSource = "fixed";
  a.cooldown = 0.1;
  const resolved = actionPresentation(p, s, a.presentation!.slot, a.id);
  assert.ok(resolved.plan!.speed > 1);
  assert.ok(resolved.plan!.delay < 0.1);
  assert.equal(resolved.releaseSource, "marker");
  a.presentation!.slot = "missing";
  a.presentation!.delay = 0.8;
  assert.equal(
    actionPresentation(p, s, "missing", a.id).releaseSource,
    "fallback",
  );
  const enemy = species(p, "litterer")!,
    enemyAbility = p.combat!.abilities.find((a) =>
      enemy.ability_ids!.includes(a.id),
    )!;
  enemyAbility.cooldownSource = "species";
  assert.equal(
    actionPresentation(
      p,
      enemy,
      enemyAbility.presentation!.slot,
      enemyAbility.id,
    ).interval,
    1,
  );
});
test("preview combines markers with real start/release cues, includes the final boundary once, and permits delayed release after the clip", () => {
  const a = newAnimation();
  a.markers.push({
    id: "sound",
    at: 0.4,
    type: "sound",
    ref: "clip_sound",
    attach: "head",
  });
  const events = [
    { at: 0, cue: { soundId: "start", vfxId: "", attach: "center" as const } },
    {
      at: 0.8,
      cue: { soundId: "late_release", vfxId: "", attach: "launch" as const },
    },
  ];
  assert.deepEqual(
    previewSignals(a, events, -1e-7, 0).map((s) => s.cue.soundId),
    ["start"],
  );
  assert.deepEqual(
    previewSignals(a, events, 0.2, 0.4).map((s) => s.cue.soundId),
    ["clip_sound"],
  );
  assert.deepEqual(previewSignals(a, events, 0.4, 0.4), []);
  assert.deepEqual(
    previewSignals(a, events, 0.4, 0.8).map((s) => s.cue.soundId),
    ["late_release"],
  );
  assert.deepEqual(previewSignals(a, events, 0.8, 0), []);
});
