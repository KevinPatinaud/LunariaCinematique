import type { CombatCatalog } from "./combat.js";

/** Explicit gameplay data. IDs identify records; they never select a combat algorithm. */
export interface BindingMechanic {
  minimumDurationRatio: number;
  tickPower: number;
  burstPower: number;
  splashPower: number;
  radius: number;
}
export interface AbilityMechanics {
  ricochet?: { chance: number; power: number };
  trap?: { offset: number; armDelay: number };
  chain?: { range: number };
  rainBloom?: { range: number; power: number };
  combo?: {
    counterPower: number;
    push: number;
    range: number;
    recoveryEffectId: string;
    staggerEffectId: string;
  };
  guard?: {
    power: number;
    maxStacks: number;
    rows: number;
    poisonEffectId: string;
  };
  contact?: boolean;
  lockProjectileTarget?: boolean;
  boostCue?: boolean;
}

export const BINDING_DEFAULT: BindingMechanic = {
  minimumDurationRatio: 0.5,
  tickPower: 0.25,
  burstPower: 1,
  splashPower: 0.65,
  radius: 1.25,
};
const IMPORTED_MECHANICS: Record<string, AbilityMechanics> = {
  ab_enemy_contact: { contact: true },
  ab_radish_ricochet: { ricochet: { chance: 0.2, power: 0.65 } },
  ab_ivy_trap: { trap: { offset: 0.7, armDelay: 0.25 } },
  ab_mushroom: { chain: { range: 2 } },
  ab_dandelion: { rainBloom: { range: 0.8, power: 0.45 } },
  ab_rose_combo: {
    combo: {
      counterPower: 1.4,
      push: 0.35,
      range: 0.8,
      recoveryEffectId: "fx_rose_recovery",
      staggerEffectId: "fx_rose_stagger",
    },
  },
  ab_nettle: {
    guard: {
      power: 0.5,
      maxStacks: 3,
      rows: 1,
      poisonEffectId: "fx_poison_light",
    },
  },
  ab_plaque_spit: { lockProjectileTarget: true },
  ab_ginger: { boostCue: true },
};

/** One-time import of existing authored records. An explicit empty object disables a mechanic. */
export function importCombatMechanics(catalog: CombatCatalog): void {
  const styles: Record<string, string> = {
    proj_germinating: "sprout",
    proj_ricochet: "radish",
    proj_piercing: "lance",
    proj_splash: "bud",
    proj_fern_frond: "frond",
    proj_plaque_slime: "slime",
  };
  for (const projectile of catalog.projectiles)
    projectile.visualStyle ??= styles[projectile.id] ?? "auto";
  for (const ability of catalog.abilities)
    if (ability.mechanics === undefined)
      ability.mechanics = structuredClone(
        ability.id === "ab_mushroom" && ability.selection !== "one"
          ? {}
          : (IMPORTED_MECHANICS[ability.id] ?? {}),
      );
  const binding = catalog.effects.find((e) => e.id === "fx_fern_bind");
  if (binding && binding.binding === undefined)
    binding.binding = { ...BINDING_DEFAULT };
  const poison = catalog.effects.find((e) => e.id === "fx_poison_light");
  if (poison && poison.counterStacking === undefined)
    poison.counterStacking = true;
}

export function mechanicEffectIds(
  mechanics: AbilityMechanics | undefined,
): string[] {
  return [
    ...new Set(
      [
        mechanics?.combo?.recoveryEffectId,
        mechanics?.combo?.staggerEffectId,
        mechanics?.guard?.poisonEffectId,
      ].filter((id): id is string => Boolean(id)),
    ),
  ];
}
