import {
  newId,
  type SpawnGroup,
  type WaveDefinition,
  type EnemyDefinition,
} from "./types.js";
import { usesPlacement } from "./enemyRules.js";

export const ENEMY_FIRST_COLUMN = 4;
export const MAX_WAVE_ENEMIES = 256;
export const atCell = (group: SpawnGroup, row: number, col: number) =>
  group.placement?.rowMin === row &&
  group.placement.rowMax === row &&
  group.placement.colMin === col &&
  group.placement.colMax === col;
export const placedGroup = (
  enemyId: string,
  row: number,
  col: number,
  count = 1,
): SpawnGroup => ({
  id: newId("group"),
  enemyId,
  count,
  lane: row,
  start: 0,
  interval: 0,
  placement: { rowMin: row, rowMax: row, colMin: col, colMax: col },
});

/** Keep species and quantities when switching modes; spatial/timing rules are mode-specific. */
export function convertWavePlacement(
  wave: WaveDefinition,
  occupied: boolean,
  enemies: EnemyDefinition[],
): WaveDefinition {
  return {
    ...wave,
    groups: wave.groups.map((group, index) => {
      if (occupied) {
        const row =
            group.placement?.rowMin ??
            (group.lane >= 0 ? group.lane : index % 5),
          col = Math.max(ENEMY_FIRST_COLUMN, group.placement?.colMin ?? 6);
        return {
          ...group,
          lane: row,
          start: 0,
          interval: 0,
          placement: { rowMin: row, rowMax: row, colMin: col, colMax: col },
        };
      }
      const next = { ...group, interval: Math.max(0.1, group.interval) };
      if (!usesPlacement(enemies.find((e) => e.id === next.enemyId)))
        delete next.placement;
      return next;
    }),
  };
}

/** One paint click adds/removes one individual, preserving mixed species and the wave limit. */
export function paintEnemy(
  groups: SpawnGroup[],
  enemyId: string,
  row: number,
  col: number,
  remove = false,
): SpawnGroup[] {
  if (row < 0 || row > 4 || col < ENEMY_FIRST_COLUMN || col > 7) return groups;
  const index = groups.findIndex(
    (group) => group.enemyId === enemyId && atCell(group, row, col),
  );
  if (remove)
    return index < 0
      ? groups
      : groups.flatMap((group, i) =>
          i !== index
            ? [group]
            : group.count > 1
              ? [{ ...group, count: group.count - 1 }]
              : [],
        );
  if (groups.reduce((sum, g) => sum + g.count, 0) >= MAX_WAVE_ENEMIES)
    return groups;
  return index < 0
    ? [...groups, placedGroup(enemyId, row, col)]
    : groups.map((group, i) =>
        i === index ? { ...group, count: group.count + 1 } : group,
      );
}
