import type { GameProject } from './types.js';
import type { GameIssue } from './validation.js';

export function lunaIssues(project: GameProject): GameIssue[] {
  const issues: GameIssue[] = [];
  if (project.lunas) {
    const drop = project.lunas.enemyDrop;
    if (drop.smallAmount > drop.largeAmount) {
      issues.push({
        path: 'projet.lunas.enemyDrop',
        message: 'Le petit gain de Luna doit être inférieur ou égal au grand gain.',
        severity: 'error',
      });
    }
  }
  for (const [index, level] of project.levels.entries()) {
    const rewards = level.lunaRewards;
    if (!rewards) continue;
    if (rewards.mastery.biodiversity > 0 && level.allowedPlants.length < 2) {
      issues.push({
        path: `levels[${index}].lunaRewards.mastery`,
        levelId: level.id,
        message: 'La prime Biodiversité nécessite au moins 2 plantes autorisées dans le niveau pour être active.',
        severity: 'warning',
      });
    }
  }
  return issues;
}
