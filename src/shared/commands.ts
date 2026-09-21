/** Reversible, immutable document commands. One gesture = one command. */
export interface Command<T> {
  readonly label: string;
  readonly before: T;
  readonly after: T;
  execute(): T;
  undo(): T;
  redo(): T;
}
export function stateCommand<T>(before: T, after: T, label = 'Modifier la cinématique'): Command<T> {
  return { label, before, after, execute: () => after, undo: () => before, redo: () => after };
}
export function editCommand<T>(before: T, edit: (draft: T) => void, label: string): Command<T> {
  const after = structuredClone(before);
  edit(after);
  return stateCommand(before, after, label);
}
