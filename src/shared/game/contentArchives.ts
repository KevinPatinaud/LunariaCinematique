import type { ContentArchives, GameProject } from './types.js';

export function isContentArchived(project: GameProject, kind: keyof ContentArchives, id: string): boolean {
  return project.contentArchives?.[kind].includes(id) ?? false;
}

export function setContentArchived(project: GameProject, kind: keyof ContentArchives, id: string, archived: boolean): void {
  if (archived) {
    if (!project[kind]?.some(item => item.id === id)) return;
    const archives = project.contentArchives ??= { cinematics: [], levels: [] };
    if (!archives[kind].includes(id)) archives[kind].push(id);
  } else if (project.contentArchives) {
    const archives = project.contentArchives;
    archives[kind] = archives[kind].filter(archivedId => archivedId !== id);
    if (!archives.cinematics.length && !archives.levels.length) delete project.contentArchives;
  }
}
