import { createContext } from 'react';
import type { LibraryProps } from './Library.js';

export type LibraryPickerServices = Pick<LibraryProps, 'library' | 'choose' | 'refresh' | 'collections' | 'layout'>;
export const LibraryPickerContext = createContext<LibraryPickerServices | null>(null);
