/** Editor-only metadata. Never embedded in cinematic.json or sent to the game. */
export interface RecentProjectEntry {
  id: string;
  path: string;
  title: string;
  cinematicId: string;
  shots: number;
  lastUsedAt: string;
  lastAction: 'opened' | 'saved';
  pinned: boolean;
  libraryRoot: string;
}
export type ProjectAvailability = 'available' | 'missing' | 'unavailable' | 'unchecked';
export interface RecentProject extends RecentProjectEntry { availability: ProjectAvailability }
export interface RecentProjectsSnapshot { projects: RecentProject[]; warning?: string }
export const MAX_RECENT_PROJECTS = 20;
export const MAX_PINNED_PROJECTS = 10;

/** Windows paths ignore case; POSIX paths do not. No filesystem access in React. */
export function projectPathKey(value: string): string {
  const windows = /^[a-z]:[/\\]/i.test(value) || /^[/\\]{2}[^/\\]/.test(value);
  const normalized = value.replace(/\\/g, '/').replace(/\/$/, '');
  return windows ? normalized.toLowerCase() : normalized;
}
export function sameProjectPath(a: string, b: string): boolean {
  return !!a && !!b && projectPathKey(a) === projectPathKey(b);
}
export function sortRecentProjects<T extends RecentProjectEntry>(projects: readonly T[]): T[] {
  return [...projects].sort((a, b) => Number(b.pinned) - Number(a.pinned)
    || Date.parse(b.lastUsedAt) - Date.parse(a.lastUsedAt) || a.id.localeCompare(b.id));
}
const searchable = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function filterRecentProjects<T extends RecentProjectEntry>(projects: readonly T[], query: string): T[] {
  const words = searchable(query.trim()).split(/\s+/).filter(Boolean);
  return sortRecentProjects(projects).filter(project => {
    const text = searchable(`${project.title} ${project.cinematicId} ${project.path} ${project.libraryRoot}`);
    return words.every(word => text.includes(word));
  });
}
export function formatProjectActivity(iso: string, now = new Date()): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return 'Date inconnue';
  const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (date.toDateString() === now.toDateString()) return `Aujourd’hui à ${time}`;
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `Hier à ${time}`;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined }) + ` à ${time}`;
}
