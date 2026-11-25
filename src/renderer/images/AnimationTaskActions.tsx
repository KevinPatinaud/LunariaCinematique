import React, { useEffect, useRef, useState } from 'react';
import { animationFramesFromSheet } from '../../shared/animationGeneration.js';
import type { ImageTask } from '../../shared/imageTasks.js';
import type { LibrarySnapshot } from '../../shared/model.js';
import { registerSpeciesAnimation } from '../../shared/presentation/ownership.js';
import { SLOT_LABELS, type AnimationScope } from '../../shared/presentation/types.js';
import { enemyChoices } from '../../shared/game/types.js';
import { api } from '../browserBridge.js';
import { useProjectSession } from '../project/ProjectSessionContext.js';
import { useImageTasks } from './ImageTasksContext.js';

export interface AnimationActorTarget {
  documentId: string;
  shotId: string;
  actorId: string;
  actorName: string;
}

export function AnimationTaskActions({
  task,
  library,
  updateLibrary,
  actorTarget,
  playbackSpeed = 1,
  onPendingChange,
  notify = () => undefined,
  onApplied,
}: {
  task: Extract<ImageTask, { kind: 'animation' }>;
  library: LibrarySnapshot | null;
  updateLibrary: (library: LibrarySnapshot) => void;
  actorTarget?: AnimationActorTarget;
  playbackSpeed?: number;
  onPendingChange?: (pending: boolean) => void;
  notify?: (message: string) => void;
  onApplied?: (animationId: string, speciesId: string) => void;
}) {
  const { session, project, dirty } = useProjectSession();
  const { refresh } = useImageTasks();
  const effectiveScope: AnimationScope =
    task.job.scope ?? (task.context?.documentId || task.context?.actorId || actorTarget ? 'cinematic' : 'game');
  const isCinematic = effectiveScope === 'cinematic';
  const useFrameCadence = isCinematic && task.job.preset === 'walk';
  const allSpecies = [...project.balance.plants, ...enemyChoices(project.balance.enemies, task.job.speciesId)];
  const [speciesId, setSpeciesId] = useState(
    task.job.speciesId && allSpecies.some(item => item.id === task.job.speciesId)
      ? task.job.speciesId
      : isCinematic
        ? ''
        : allSpecies[0]?.id ?? '',
  );
  const [slot, setSlot] = useState(task.job.slot || 'move');
  const [animationName, setAnimationName] = useState(task.job.animationName || `${task.job.characterName} — Marche`);
  const [assignSlot, setAssignSlot] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const locked = useRef(false);
  const live = useRef(true);
  const rootRef = useRef(library?.rootPath);
  rootRef.current = library?.rootPath;

  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);

  useEffect(() => {
    setSlot(task.job.slot || 'move');
    setAnimationName(task.job.animationName || `${task.job.characterName} — Marche`);
    if (task.job.speciesId && allSpecies.some(item => item.id === task.job.speciesId)) {
      setSpeciesId(task.job.speciesId);
    } else if (isCinematic) {
      setSpeciesId('');
    }
  }, [task.job.id]);

  if (!['ready', 'applied'].includes(task.job.status)) return null;
  const inLibrary = library?.rootPath === task.libraryRoot;
  const existingUsage = task.job.sheetRef
    ? (project.presentation?.animations ?? []).filter(a => a.frames.some(f => f.asset === task.job.sheetRef))
    : [];
  const reusingClip = useFrameCadence && !!actorTarget && existingUsage.some(a => a.scope === 'cinematic');

  async function importAndRegister(applyToActor: boolean) {
    if (locked.current) return;
    locked.current = true;
    setPending(true);
    onPendingChange?.(true);
    setError('');
    const capturedRoot = rootRef.current;
    const openedProject = session.getSnapshot();
    try {
      if (!inLibrary) throw Error('Reconnecte la bibliothèque de cette animation.');
      if (!isCinematic && !speciesId) throw Error('Choisis le personnage propriétaire dans le projet.');
      const result = await api.applyAnimationGeneration(task.job.id);
      if (live.current && result.library && rootRef.current === result.library.rootPath) {
        updateLibrary(result.library);
      }
      const sheet = result.job.sheetRef;
      if (!sheet || !result.job.width || !result.job.height) {
        throw Error('La planche d’animation importée est incomplète.');
      }
      if (rootRef.current !== capturedRoot) {
        throw Error('La bibliothèque a changé pendant l’import.');
      }
      const currentProject = session.getSnapshot();
      if (currentProject.epoch !== openedProject.epoch || currentProject.path !== openedProject.path || currentProject.busy) {
        throw Error('Le projet a changé pendant l’import. Tu peux retrouver cette planche dans les tâches IA.');
      }
      const frames = animationFramesFromSheet(
        sheet,
        { width: result.job.width, height: result.job.height },
        result.job.columns,
        result.job.rows,
        result.job.fps,
      );
      let createdId = '';
      let clipName = animationName;
      const isWalkLike = ['move', 'walk', 'run'].includes(slot) || ['walk', 'run'].includes(result.job.preset);
      session.change(
        draft => {
          const film = applyToActor && actorTarget
            ? draft.cinematics?.find(f => f.id === actorTarget.documentId)
            : undefined;
          const shot = film?.shots.find(s => s.id === actorTarget?.shotId);
          const actor = shot?.actors.find(a => a.id === actorTarget?.actorId);
          if (applyToActor && (!film || !actor)) throw Error('Le personnage de ce plan est introuvable.');

          const registered = useFrameCadence && applyToActor
            ? draft.presentation?.animations.find(clip => clip.scope === 'cinematic' &&
                clip.frames.length > 0 && clip.frames.every(frame => frame.asset === sheet))
            : undefined;
          if (registered) clipName = registered.name;
          createdId = registered?.id ?? registerSpeciesAnimation(draft, {
            speciesId: speciesId || undefined,
            slot,
            name: animationName,
            frames,
            loop: result.job.loop,
            stridePx: isWalkLike && !useFrameCadence ? (result.job.recommendedStridePx ?? 110) : undefined,
            scope: effectiveScope,
            sourceAssetRef: result.job.sourceRef,
            assignSlot: isCinematic ? false : assignSlot,
          });
          if (film && actor) {
            film.schemaVersion = 4;
            film.presentationCatalog = {
              projectId: draft.id,
              file: film.presentationCatalog?.projectId === draft.id ? film.presentationCatalog.file : '',
            };
            actor.animation = !isCinematic && assignSlot
              ? {
                  mode: 'species',
                  speciesId,
                  slot,
                  animationId: '',
                  speed: 1,
                  ...(isWalkLike ? { syncWithMovement: true, autoFlip: true } : {}),
                }
              : {
                  mode: 'animation',
                  speciesId: speciesId || '',
                  slot,
                  animationId: createdId,
                  speed: isCinematic ? playbackSpeed : 1,
                  ...(isWalkLike ? { syncWithMovement: true, autoFlip: true } : {}),
                };
          }
        },
        '',
        applyToActor
          ? `Utiliser la marche « ${clipName} » dans le plan`
          : isCinematic
            ? `Ajouter l’animation de cinématique « ${animationName} »`
            : `Ajouter l’animation de niveau « ${animationName} »`,
      );
      notify(
        applyToActor
          ? `Marche « ${clipName} » appliquée au plan.`
          : isCinematic
            ? `Animation de cinématique « ${animationName} » ajoutée et réutilisable partout où cette image est utilisée.`
            : `Animation de niveau « ${animationName} » ajoutée au personnage.`,
      );
      if (createdId) onApplied?.(createdId, speciesId);
      await refresh();
    } catch (reason) {
      if (live.current) setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      locked.current = false;
      onPendingChange?.(false);
      if (live.current) setPending(false);
    }
  }

  return (
    <div className="anim-task-actions">
      {existingUsage.length > 0 && inLibrary && (
        <p role="status">
          Déjà enregistrée : <strong>{existingUsage.map(item => item.name).join(', ')}</strong>.{' '}
          {dirty ? 'Enregistre le projet pour conserver ce choix.' : 'Projet enregistré.'}
        </p>
      )}
      {!reusingClip && <details className="motion-precision">
        <summary>
          Enregistrement ({isCinematic ? 'Cinématiques uniquement' : 'Niveaux du jeu'}) : {allSpecies.find(s => s.id === speciesId)?.name ?? (isCinematic ? task.job.characterName : speciesId)}
          {!isCinematic ? ` · ${SLOT_LABELS[slot] ?? slot}` : ''}
        </summary>
        <div className="anim-task-form">
          <label className="field">
            <span>Personnage propriétaire</span>
            <select
              aria-label="Personnage propriétaire de l’animation"
              value={speciesId}
              disabled={pending}
              onChange={event => setSpeciesId(event.target.value)}
            >
              {isCinematic && (
                <option value="">Aucun (lié à l’image statique)</option>
              )}
              {allSpecies.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          {!isCinematic && (
            <label className="field">
              <span>Action / Slot de niveau</span>
              <select
                aria-label="Action réutilisable de l’animation"
                value={slot}
                disabled={pending}
                onChange={event => setSlot(event.target.value)}
              >
                {['move', 'idle', 'talk', 'run', 'jump', 'happy', 'surprised', 'scared', 'attack', 'victory'].map(id => (
                  <option key={id} value={id}>
                    {SLOT_LABELS[id] ?? id}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="field">
            <span>Nom du clip</span>
            <input
              aria-label="Nom du clip d’animation"
              value={animationName}
              maxLength={160}
              disabled={pending}
              onChange={event => setAnimationName(event.target.value)}
            />
          </label>
        </div>
        {!isCinematic && (
          <label className="check-field">
            <input
              type="checkbox"
              checked={assignSlot}
              disabled={pending}
              onChange={event => setAssignSlot(event.target.checked)}
            />
            Définir comme animation par défaut de l’action « {SLOT_LABELS[slot] ?? slot} » pour ce personnage
          </label>
        )}
      </details>}
      {error && (
        <p role="alert" className="image-task-error">
          {error}
        </p>
      )}
      <div className="image-task-actions">
        {actorTarget ? (
          <button
            type="button"
            className="button primary"
            disabled={pending || !inLibrary || (!isCinematic && !speciesId) || session.getSnapshot().busy}
            onClick={() => void importAndRegister(true)}
          >
            {pending ? 'Application…' : 'Utiliser cette marche dans le plan'}
          </button>
        ) : (
          <button
            type="button"
            className="button primary"
            disabled={pending || !inLibrary || (!isCinematic && !speciesId) || session.getSnapshot().busy}
            onClick={() => void importAndRegister(false)}
          >
            {pending
              ? 'Importation…'
              : isCinematic
                ? 'Ajouter aux animations de cinématiques'
                : 'Ajouter aux animations de niveaux'}
          </button>
        )}
      </div>
      <p className="pose-help">
        {isCinematic
          ? 'Cette animation est réservée aux cinématiques (séparée des animations des niveaux), liée à son image statique de référence et réutilisable partout où cette image est utilisée (annulable avec Ctrl+Z).'
          : 'Cette animation est réservée aux niveaux du jeu (séparée des cinématiques) et utilisable dans le profil du personnage (annulable avec Ctrl+Z).'}
      </p>
    </div>
  );
}
