import type { GameProject } from './types.js';

/** Describe links that must be removed in the campaign editor before deleting a film. */
export function cinematicReferences(project: GameProject, documentId: string): string[] {
  const campaign = project.campaign;
  if (!campaign) return [];
  const filmIds = new Set(campaign.cinematics.filter(film => film.documentId === documentId).map(film => film.id));
  if (!filmIds.size) return [];
  const references: string[] = [];
  for (const step of campaign.steps) {
    if (step.kind === 'cinematic' && filmIds.has(step.cinematicId)) references.push('parcours de campagne');
  }
  for (const level of project.levels) for (const event of level.events ?? []) {
    if (event.actions.some(action => action.type === 'cinematic' && filmIds.has(action.cinematicId ?? '')))
      references.push(`${level.title} / ${event.name}`);
  }
  for (const behavior of project.logic?.behaviors ?? []) for (const phase of behavior.phases) {
    if (phase.onEnter.some(action => action.type === 'cinematic' && filmIds.has(action.cinematicId ?? '')))
      references.push(`comportement ${behavior.name}`);
  }
  return [...new Set(references)];
}
