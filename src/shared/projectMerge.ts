import type { GameProject } from "./game/types.js";
export interface MergeConflict {
  path: string;
  local: unknown;
  remote: unknown;
  localMissing: boolean;
  remoteMissing: boolean;
}
export type MergeChoices = Record<string, "local" | "remote">;
const missing = Symbol("absent");
const equal = (a: unknown, b: unknown) =>
  a === b || JSON.stringify(a) === JSON.stringify(b);
const object = (a: unknown): a is Record<string, unknown> =>
  !!a && typeof a === "object" && !Array.isArray(a);
/** Three-way merge. Identity arrays merge by ID; simultaneous order changes require a choice. */
export function mergeProject(
  base: GameProject,
  local: GameProject,
  remote: GameProject,
  choices: MergeChoices = {},
) {
  const conflicts: MergeConflict[] = [];
  function conflict(path: string, a: unknown, b: unknown) {
    if (!choices[path])
      conflicts.push({
        path,
        local: a === missing ? undefined : a,
        remote: b === missing ? undefined : b,
        localMissing: a === missing,
        remoteMissing: b === missing,
      });
    return choices[path] === "remote" ? b : a;
  }
  function walk(b: unknown, l: unknown, r: unknown, path: string): unknown {
    if (equal(l, r)) return l;
    if (equal(l, b)) return r;
    if (equal(r, b)) return l;
    if (object(b) && object(l) && object(r)) {
      const result: Record<string, unknown> = {};
      for (const key of new Set([
        ...Object.keys(b),
        ...Object.keys(l),
        ...Object.keys(r),
      ])) {
        const value = walk(
          Object.hasOwn(b, key) ? b[key] : missing,
          Object.hasOwn(l, key) ? l[key] : missing,
          Object.hasOwn(r, key) ? r[key] : missing,
          `${path}.${key}`,
        );
        if (value !== missing) result[key] = value;
      }
      return result;
    }
    if (
      Array.isArray(b) &&
      Array.isArray(l) &&
      Array.isArray(r) &&
      [b, l, r].every(
        (values) =>
          values.every((v) => object(v) && typeof v.id === "string") &&
          new Set(values.map((v) => v.id)).size === values.length,
      )
    ) {
      const bm = new Map(b.map((v) => [v.id, v])),
        lm = new Map(l.map((v) => [v.id, v])),
        rm = new Map(r.map((v) => [v.id, v]));
      const values = new Map<string, unknown>();
      for (const id of new Set([...bm.keys(), ...lm.keys(), ...rm.keys()])) {
        const value = walk(
          bm.has(id) ? bm.get(id) : missing,
          lm.has(id) ? lm.get(id) : missing,
          rm.has(id) ? rm.get(id) : missing,
          `${path}[${id}]`,
        );
        if (value !== missing) values.set(id, value);
      }
      const common = b
        .map((v) => v.id)
        .filter((id) => lm.has(id) && rm.has(id) && values.has(id));
      const lo = l.map((v) => v.id).filter((id) => common.includes(id)),
        ro = r.map((v) => v.id).filter((id) => common.includes(id));
      let primary = l.map((v) => v.id),
        secondary = r.map((v) => v.id);
      if (equal(lo, common)) {
        primary = r.map((v) => v.id);
        secondary = l.map((v) => v.id);
      } else if (!equal(ro, common) && !equal(lo, ro)) {
        conflict(
          path + ".$order",
          l.map((v) => v.id),
          r.map((v) => v.id),
        );
        if (choices[path + ".$order"] === "remote") {
          primary = r.map((v) => v.id);
          secondary = l.map((v) => v.id);
        }
      }
      const order = primary.filter((id) => values.has(id));
      // Preserve insertions from both sides close to their authored neighbors.
      for (let i = 0; i < secondary.length; i++) {
        const id = secondary[i];
        if (!values.has(id) || order.includes(id)) continue;
        const previous = secondary
          .slice(0, i)
          .reverse()
          .find((v) => order.includes(v));
        const next = secondary.slice(i + 1).find((v) => order.includes(v));
        order.splice(
          previous
            ? order.indexOf(previous) + 1
            : next
              ? order.indexOf(next)
              : order.length,
          0,
          id,
        );
      }
      return order.map((id) => values.get(id));
    }
    return conflict(path, l, r);
  }
  return {
    project: structuredClone(
      walk(base, local, remote, "projet"),
    ) as GameProject,
    conflicts,
  };
}
