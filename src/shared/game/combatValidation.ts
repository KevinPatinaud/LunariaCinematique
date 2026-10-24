import { mechanicEffectIds } from "./combatMechanics.js";
import type { GameProject } from "./types.js";
import { BENEFICIAL, INSTANT, PERIODIC, FRACTION } from "./combat.js";
import type { GameIssue } from "./validation.js";
/** Invoked only after the structural schema. Same checks exist at the Godot boundary. */
export function combatIssues(p: GameProject): GameIssue[] {
  const out: GameIssue[] = [];
  const error = (
    path: string,
    message: string,
    severity: "error" | "warning" = "error",
  ) => out.push({ path, message, severity });
  if (!p.combat) {
    if (p.schemaVersion >= 2)
      error("combat", "Les catalogues de combat sont requis en format 2.");
    return out;
  }
  if (p.schemaVersion < 2)
    error("combat", "Les catalogues de combat nécessitent le format 2.");
  const c = p.combat,
    ids = new Set<string>([
      p.id,
      ...p.balance.plants.map((x) => x.id),
      ...p.balance.enemies.map((x) => x.id),
      ...p.levels.flatMap((l) => [
        l.id,
        ...l.waves.flatMap((w) => [w.id, ...w.groups.map((g) => g.id)]),
      ]),
      ...(p.campaign?.steps.map((s) => s.id) ?? []),
      ...(p.campaign?.cinematics.map((f) => f.id) ?? []),
    ]);
  for (const category of ["abilities", "effects", "projectiles"] as const)
    for (const x of c[category]) {
      if (ids.has(x.id))
        error(
          "combat." + category + "." + x.id,
          "Identifiant répété : " + x.id,
        );
      ids.add(x.id);
    }
  const effects = new Map(c.effects.map((e) => [e.id, e])),
    projectiles = new Set(c.projectiles.map((x) => x.id)),
    abilities = new Set(c.abilities.map((x) => x.id));
  for (const e of c.effects) {
    const path = "combat.effects." + e.id;
    if (
      e.binding &&
      (e.kind !== "slow" ||
        e.valueSource !== "fixed" ||
        e.tickInterval > e.duration * e.binding.minimumDurationRatio)
    )
      error(
        path,
        "La fronde utilise un ralentissement fixe et un intervalle au plus égal à la durée minimale avant libération.",
      );
    if (e.counterStacking && e.kind !== "poison")
      error(path, "Le cumul de riposte est réservé au poison.");
    if (
      FRACTION.includes(e.kind) &&
      (e.valueSource !== "fixed" ||
        e.amount >
          (["damage_boost", "attack_speed_boost"].includes(e.kind) ? 3 : 0.95))
    )
      error(
        path,
        "Un pourcentage est fixe : maximum 95 % (300 % pour les bonus de dégâts ou de cadence).",
      );
    if (
      ["root", "stun", "armor_break", "cleanse", "counter_cooldown"].includes(
        e.kind,
      ) &&
      (e.valueSource !== "fixed" || e.amount !== 0)
    )
      error(
        path,
        "Ce résultat utilise uniquement sa durée : valeur fixe égale à 0.",
      );
    if (
      e.kind === "reward_mark" &&
      (e.valueSource !== "fixed" ||
        !Number.isInteger(e.amount) ||
        e.amount > 400)
    )
      error(
        path,
        "Le bonus de recyclage est un entier fixe entre 0 et 400 graines.",
      );
    if (PERIODIC.includes(e.kind) && e.tickInterval > e.duration)
      error(
        path,
        "L’intervalle périodique dépasse la durée : aucun déclenchement possible.",
      );
    if (
      ["damage", "heal", "poison", "regeneration"].includes(e.kind) &&
      e.valueSource === "attack" &&
      e.amount > 10
    )
      error(path, "Le multiplicateur d’attaque est limité à 10.");
  }
  for (const a of c.abilities) {
    const path = "combat.abilities." + a.id;
    const m = a.mechanics ?? {};
    for (const id of mechanicEffectIds(m))
      if (!effects.has(id)) error(path, "Effet de réaction absent : " + id);
    if (
      (m.ricochet || m.trap || m.lockProjectileTarget) &&
      (a.delivery !== "projectile" || a.target !== "opponent")
    )
      error(path, "Cette mécanique exige un projectile adverse.");
    if (
      (m.chain || m.combo || m.guard || m.rainBloom) &&
      (a.delivery !== "instant" || a.target !== "opponent")
    )
      error(path, "Cette mécanique exige une capacité adverse immédiate.");
    if (m.chain && a.selection !== "one")
      error(path, "La propagation démarre sur une cible unique.");
    if (
      m.guard &&
      (!effects.get(m.guard.poisonEffectId)?.counterStacking ||
        effects.get(m.guard.poisonEffectId)?.kind !== "poison")
    )
      error(path, "La garde requiert un poison cumulable en riposte.");
    if (
      m.combo &&
      (effects.get(m.combo.recoveryEffectId)?.kind !== "counter_cooldown" ||
        effects.get(m.combo.staggerEffectId)?.kind !== "stun")
    )
      error(path, "La riposte requiert une récupération et un étourdissement.");
    if (
      m.trap &&
      c.projectiles.find((x) => x.id === a.projectileId)?.speed !== 0
    )
      error(path, "Un piège reste immobile.");
    if (new Set(a.effects).size !== a.effects.length)
      error(path, "Un résultat ne peut pas être répété dans la même attaque.");
    if (
      a.delivery === "projectile" &&
      (!projectiles.has(a.projectileId) ||
        a.target !== "opponent" ||
        a.selection !== "one")
    )
      error(
        path,
        "Un tir à distance requiert une trajectoire existante et une cible adverse unique. Utilise son rayon ou sa perforation pour toucher plusieurs cibles.",
      );
    if (a.delivery === "instant" && a.projectileId !== "")
      error(
        path,
        "Une attaque immédiate ne référence pas de trajectoire de tir.",
      );
    if (a.target === "self" && (a.selection !== "one" || a.rowRadius !== 0))
      error(path, "Une attaque sur soi cible uniquement son porteur.");
    if (a.excludeSelf && a.target !== "ally")
      error(
        path,
        "L’exclusion du porteur concerne uniquement une attaque sur allié.",
      );
    if (a.requiresActiveAttack && a.target !== "ally")
      error(
        path,
        "La cible en cours d’attaque concerne uniquement un soutien allié.",
      );
    if (
      a.allowBehind &&
      (a.target !== "opponent" || a.delivery !== "projectile")
    )
      error(
        path,
        "Le tir dans les deux sens exige un projectile visant un adversaire.",
      );
    if (
      a.forwardCells !== undefined &&
      (a.target !== "opponent" ||
        a.delivery !== "instant" ||
        a.selection !== "all" ||
        a.rowRadius !== 0 ||
        a.allowBehind)
    )
      error(
        path,
        "Un souffle par cases est immédiat et touche les adversaires devant le porteur, sur sa propre allée.",
      );
    if (
      a.attachToTarget &&
      (a.target !== "opponent" ||
        a.delivery !== "instant" ||
        a.selection !== "one" ||
        a.priority !== "nearest" ||
        a.rowRadius !== 0 ||
        a.allowBehind ||
        a.forwardCells !== undefined)
    )
      error(
        path,
        "Se poser sur la cible exige un adversaire unique sur la même allée, sans projectile ni souffle.",
      );
    if (a.blocksTargetAttack && !a.attachToTarget)
      error(path, "Le blocage des attaques exige de se poser sur la cible.");
    if (a.target === "opponent" && a.priority === "wounded")
      error(
        path,
        "La priorité « allié blessé » ne s’applique pas à un adversaire.",
      );
    for (const id of a.effects) {
      const e = effects.get(id);
      if (!e) {
        error(path, "Résultat absent : " + id);
        continue;
      }
      if (BENEFICIAL.includes(e.kind) === (a.target === "opponent"))
        error(
          path,
          `${e.name} : cible incompatible (soin/protection sur allié, dégâts/altérations sur adversaire).`,
        );
    }
  }
  for (const role of ["plants", "enemies"] as const)
    for (const x of p.balance[role]) {
      const path = "balance." + role + "." + x.id;
      if (!Array.isArray(x.ability_ids)) {
        error(path, "La liste des attaques est requise.");
        continue;
      }
      if (new Set(x.ability_ids).size !== x.ability_ids.length)
        error(path, "Attaque attribuée deux fois.");
      if (
        role === "plants" &&
        x.ability_ids.some(
          (id) => c.abilities.find((a) => a.id === id)?.attachToTarget,
        )
      )
        error(path, "Seuls les ennemis peuvent se poser sur une plante.");
      for (const id of x.ability_ids)
        if (!abilities.has(id)) error(path, "Attaque inconnue : " + id);
      if (!x.ability_ids.length && !("rules" in x && x.rules?.blocksEnemies))
        error(
          path,
          "Aucune attaque : cette espèce ne combat pas (ses PV restent actifs).",
          "warning",
        );
    }
  return out;
}
