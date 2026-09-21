import { stateCommand, type Command } from './commands.js';
export interface History<T> {
  present: T; past: T[]; future: T[]; lastKey: string; lastAt: number;
  undoCommands: Command<T>[]; redoCommands: Command<T>[];
}
export type HistoryAction<T> = { type: 'commit'; value: T; key?: string; now?: number; label?: string }
  | { type: 'execute'; command: Command<T>; key?: string; now?: number }
  | { type: 'undo' } | { type: 'redo' } | { type: 'reset'; value: T } | { type: 'boundary' };
function history<T>(present: T, undoCommands: Command<T>[] = [], redoCommands: Command<T>[] = [], lastKey = '', lastAt = 0): History<T> {
  return { present, past: undoCommands.map(c => c.before), future: redoCommands.map(c => c.after), undoCommands, redoCommands, lastKey, lastAt };
}
export const createHistory = <T>(present: T): History<T> => history(present);
export function historyReducer<T>(state: History<T>, action: HistoryAction<T>): History<T> {
  if (action.type === 'boundary') return { ...state, lastKey: '', lastAt: 0 };
  if (action.type === 'reset') return createHistory(action.value);
  if (action.type === 'undo') {
    const command = state.undoCommands.at(-1); if (!command) return state;
    return history(command.undo(), state.undoCommands.slice(0, -1), [command, ...state.redoCommands]);
  }
  if (action.type === 'redo') {
    const command = state.redoCommands[0]; if (!command) return state;
    return history(command.redo(), [...state.undoCommands, command].slice(-80), state.redoCommands.slice(1));
  }
  const value = action.type === 'execute' ? action.command.after : action.value;
  if (JSON.stringify(state.present) === JSON.stringify(value)) return state;
  // A stale async command must never overwrite an unrelated, more recent document.
  if (action.type === 'execute' && action.command.before !== state.present) throw new Error('Commande périmée : recrée cette action depuis le document courant.');
  const now = action.now ?? Date.now(), merge = !!action.key && action.key === state.lastKey && now - state.lastAt < 800;
  const label = action.type === 'execute' ? action.command.label : action.label ?? 'Modifier la cinématique';
  const before = merge ? state.undoCommands.at(-1)?.before ?? state.present : state.present;
  const command = stateCommand(before, value, label);
  return history(command.execute(), [...(merge ? state.undoCommands.slice(0, -1) : state.undoCommands), command].slice(-80), [], action.key ?? '', now);
}
