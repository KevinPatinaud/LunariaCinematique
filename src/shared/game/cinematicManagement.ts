import { newId, type GameProject } from './types.js';

export type CinematicPlacement = 'before' | 'after';

/** Insert a film at a list boundary while preserving every other film's order. */
export function moveCinematic(project: GameProject, id: string, targetId: string, placement: CinematicPlacement): void {
  const films = project.cinematics ?? [];
  const from = films.findIndex(film => film.id === id);
  const target = films.findIndex(film => film.id === targetId);
  if (from < 0 || target < 0 || from === target) return;
  const insertion = target + (placement === 'after' ? 1 : 0);
  const to = insertion - (from < insertion ? 1 : 0);
  if (from === to) return;
  const [film] = films.splice(from, 1);
  films.splice(to, 0, film);
}

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

/** Register an existing project film for campaign steps or battle events. */
export function linkCinematic(project: GameProject, documentId: string) {
  const doc = project.cinematics?.find(film => film.id === documentId);
  if (!doc) throw Error('Cinématique absente du projet.');
  const campaign = project.campaign ??= { steps: [], cinematics: [] };
  let film = campaign.cinematics.find(film => film.documentId === documentId);
  if (!film) {
    const id = newId('film');
    film = { id, title: doc.title, documentId, file: id + '.cinematic.json' };
    campaign.cinematics.push(film);
  }
  return film;
}
