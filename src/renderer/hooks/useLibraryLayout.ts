import { useEffect, useState } from 'react';
import { clampLibraryWidth, DEFAULT_LIBRARY_PREFERENCES, LIBRARY_PREFERENCES_KEY, maxLibraryWidth,
  parseLibraryPreferences, type LibraryPreferences } from '../../shared/libraryBrowser.js';
export function useLibraryLayout() {
  const [preferences, setPreferences] = useState<LibraryPreferences>(() => {
    try { return parseLibraryPreferences(localStorage.getItem(LIBRARY_PREFERENCES_KEY)); }
    catch { return { ...DEFAULT_LIBRARY_PREFERENCES }; }
  });
  const [viewport, setViewport] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setViewport(window.innerWidth);
    window.addEventListener('resize', onResize); return () => window.removeEventListener('resize', onResize);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      try { localStorage.setItem(LIBRARY_PREFERENCES_KEY, JSON.stringify(preferences)); }
      catch { /* Storage may be read-only; browsing should remain usable. */ }
    }, 180);
    return () => clearTimeout(timer);
  }, [preferences]);
  return { preferences, width: clampLibraryWidth(preferences.width, viewport), maxWidth: maxLibraryWidth(viewport),
    update: (patch: Partial<LibraryPreferences>) => setPreferences(previous => ({ ...previous, ...patch })) };
}
