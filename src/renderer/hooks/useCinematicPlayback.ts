import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { Cinematic, LibrarySnapshot } from '../../shared/model.js';
import { referencedAssets } from '../../shared/model.js';
import { isImage } from '../../shared/assets.js';
import { CinematicAudioPlayer } from '../audio/CinematicAudioPlayer.js';
import type { ImageCache } from '../images.js';
import { CinematicPlaybackSession } from '../playback/CinematicPlaybackSession.js';
import type { GameProject } from '../../shared/game/types.js';

interface Options {
  document: Cinematic;
  project: GameProject;
  library: LibrarySnapshot | null;
  contextKey: string;
  active: boolean;
  cache: ImageCache;
  notify(message: string): void;
}

/** React binds the preview's lifetime; all playback transitions belong to the session. */
export function useCinematicPlayback({ document: cinematic, project, library, contextKey, active, cache, notify }: Options) {
  const projectRef = useRef(project);
  const [session] = useState(() => new CinematicPlaybackSession({
    preload: async (document, index, assets) => {
      const shots = document.shots.slice(index, index + 2);
      const refs = new Set(referencedAssets({ ...document, shots }));
      if (document.presentationCatalog?.projectId === projectRef.current.id) {
        const clips = projectRef.current.presentation?.animations ?? [];
        for (const shot of shots) for (const actor of shot.actors) {
          if (!actor.animation?.elementPlayback) continue;
          const clip = clips.find(item => item.id === actor.animation!.animationId);
          clip?.frames.forEach(frame => refs.add(frame.asset));
        }
      }
      await Promise.all(assets.filter(asset => refs.has(asset.ref) && isImage(asset.path))
        .map(asset => cache.load(asset.url, asset.name)));
    },
    createAudio: () => new CinematicAudioPlayer(notify),
    requestFrame: callback => requestAnimationFrame(callback),
    cancelFrame: frame => cancelAnimationFrame(frame),
    now: () => performance.now(),
    hidden: () => document.hidden,
    observeVisibility: callback => {
      document.addEventListener('visibilitychange', callback);
      return () => document.removeEventListener('visibilitychange', callback);
    },
    report: notify,
  }));
  useLayoutEffect(() => {
    projectRef.current = project;
    session.setContext({ key: contextKey, document: cinematic, assets: library?.assets ?? [], active });
  }, [session, contextKey, cinematic, project, library, active]);
  useEffect(() => () => session.stop(), [session]);
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot);
  return { ...state, start: session.start, restart: session.restart, stop: session.stop,
    togglePause: session.togglePause, advance: session.advance, isActive: session.isActive };
}
