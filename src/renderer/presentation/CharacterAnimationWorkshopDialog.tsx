import React, { useMemo, useState } from 'react';
import type { Actor, Asset } from '../../shared/model.js';
import { enemyChoices, newId, type GameProject } from '../../shared/game/types.js';
import { type ActorAnimation } from '../../shared/presentation/types.js';
import { animationOwnerId, isCinematicAnimation } from '../../shared/presentation/ownership.js';
import { newAnimation } from '../../shared/presentation/factories.js';
import { species } from '../../shared/presentation/runtime.js';
import { inferActorSpecies } from '../../shared/presentation/cinematicMotion.js';
import { StudioDialog } from '../components/StudioDialog.js';
import { AnimationFields } from './AnimationFields.js';
import type { AnimationPreset } from '../../shared/animationGeneration.js';
import './characterWorkshop.css';

export function CharacterAnimationWorkshopDialog({
  project,
  assets,
  actor,
  initialSpeciesId,
  initialAnimationId,
  change,
  onApplyToActor,
  onGenerateAnimation,
  onClose,
}: {
  project: GameProject;
  assets: Asset[];
  actor?: Actor;
  initialSpeciesId?: string;
  initialAnimationId?: string;
  change: (edit: (draft: GameProject) => void, key?: string, label?: string) => void;
  onApplyToActor?: (binding: ActorAnimation) => void;
  onGenerateAnimation: (speciesId: string, preset?: AnimationPreset) => void;
  onClose: () => void;
}) {
  const catalog = project.presentation!;
  const allSpecies = useMemo(
    () => [...project.balance.plants, ...enemyChoices(project.balance.enemies, initialSpeciesId)],
    [project.balance.plants, project.balance.enemies, initialSpeciesId],
  );
  const initialClip = catalog.animations.find(clip => clip.id === initialAnimationId && isCinematicAnimation(clip));
  const requestedOwner = (initialClip && animationOwnerId(project, initialClip)) || initialSpeciesId;
  const inferred = requestedOwner
    ? allSpecies.find(item => item.id === requestedOwner)
    : actor
      ? inferActorSpecies(actor, project)
      : allSpecies[0];

  const [speciesId, setSpeciesId] = useState(inferred?.id ?? allSpecies[0]?.id ?? '');
  const owner = species(project, speciesId) ?? allSpecies[0];
  const owned = catalog.animations.filter(
    anim => isCinematicAnimation(anim) && (
      animationOwnerId(project, anim) === owner?.id ||
      (anim.id === initialClip?.id && owner?.id === (inferred?.id ?? allSpecies[0]?.id))
    ),
  );
  const [selectedId, setSelectedId] = useState(initialClip?.id ?? owned[0]?.id ?? '');
  const [error, setError] = useState('');

  const selected = owned.find(anim => anim.id === selectedId) ?? owned[0];

  function selectSpecies(nextId: string) {
    setSpeciesId(nextId);
    setError('');
    const spOwned = catalog.animations.filter(
      anim => isCinematicAnimation(anim) && animationOwnerId(project, anim) === nextId,
    );
    setSelectedId(spOwned[0]?.id ?? '');
  }

  function createCinematicClip(label: string) {
    if (!owner) return;
    setError('');
    try {
      let createdId = '';
      change(
        draft => {
          const presentation = draft.presentation;
          if (!presentation) return;
          if (presentation.animations.length >= 512) {
            throw Error('Le catalogue contient déjà 512 animations.');
          }
          const created = newAnimation('move');
          created.id = newId('anim');
          created.name = `${owner.name} — ${label}`.slice(0, 160);
          created.ownerSpeciesId = owner.id;
          created.scope = 'cinematic';
          presentation.animations.push(created);
          createdId = created.id;
        },
        '',
        `Créer une animation de cinématique (${label}) pour ${owner.name}`,
      );
      if (createdId) setSelectedId(createdId);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  }

  function patchSelected(data: Record<string, unknown>, key = '') {
    if (!selected || !owner) return;
    change(
      draft => {
        const target = draft.presentation?.animations.find(a => a.id === selected.id);
        if (target) Object.assign(target, data, { scope: 'cinematic' });
      },
      `${selected.id}:${key}`,
      `Modifier l’animation de cinématique de ${owner.name}`,
    );
  }

  function applyCurrentToPlan() {
    if (!owner || !selected || !onApplyToActor) return;
    const activeBinding = actor?.animation?.animationId === selected.id ? actor.animation : undefined;
    const isWalkLike =
      activeBinding?.syncWithMovement ||
      /marche|walk|course|run|déplacement/i.test(selected.name) ||
      selected.motion.preset === 'walk';
    onApplyToActor({
      mode: 'animation',
      speciesId: owner.id,
      slot: 'move',
      animationId: selected.id,
      speed: activeBinding?.speed ?? 1,
      ...(isWalkLike ? { syncWithMovement: true, autoFlip: true } : {}),
    });
    onClose();
  }

  return (
    <StudioDialog title="Animations de cinématiques par personnage" onClose={onClose} wide>
      <div className="char-workshop">
        <header className="char-workshop-top">
          <label className="field">
            <span>Personnage</span>
            <select aria-label="Personnage de l’atelier" value={owner?.id ?? ''} onChange={e => selectSpecies(e.target.value)}>
              {allSpecies.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <div className="char-workshop-top-actions">
            {owner && (
              <button
                type="button"
                className="button primary"
                onClick={() => onGenerateAnimation(owner.id, 'walk')}
              >
                Produire une marche par l’IA
              </button>
            )}
            {actor && owner && selected && onApplyToActor && (
              <button
                type="button"
                className="button subtle"
                onClick={applyCurrentToPlan}
              >
                Utiliser « {selected.name} » pour {actor.name}
              </button>
            )}
          </div>
        </header>

        {error && <p role="alert" className="image-task-error">{error}</p>}

        <div className="char-workshop-body">
          <aside className="char-workshop-sidebar" aria-label="Bibliothèque d’animations de cinématiques">
            <div className="char-workshop-group">
              <h4>Animations de cinématiques ({owned.length})</h4>
              <div className="char-owned-list">
                {owned.map(anim => (
                  <button
                    key={anim.id}
                    type="button"
                    className={`char-owned-item ${selected?.id === anim.id ? 'selected' : ''}`}
                    onClick={() => setSelectedId(anim.id)}
                  >
                    <strong>{anim.name}</strong>
                    <small>
                      {anim.kind === 'procedural'
                        ? 'Mouvement procédural'
                        : `${anim.frames.length} frame${anim.frames.length > 1 ? 's' : ''}${anim.stridePx ? ` · foulée ${anim.stridePx} px` : ''}`}
                    </small>
                  </button>
                ))}
                {!owned.length && (
                  <p className="pose-help">
                    Aucune animation de cinématique pour {owner?.name}. Les animations des niveaux restent séparées.
                  </p>
                )}
              </div>
              {owner && (
                <button
                  type="button"
                  className="button subtle full"
                  onClick={() => createCinematicClip('Marche cinématique')}
                >
                  + Créer un clip cinématique vide
                </button>
              )}
            </div>
          </aside>

          <main className="char-workshop-editor">
            {selected && owner ? (
              <>
                <div className="char-editor-bar">
                  <label className="field">
                    <span>Nom du clip de cinématique</span>
                    <input
                      aria-label="Nom du clip dans l’atelier"
                      value={selected.name}
                      maxLength={160}
                      onChange={e => patchSelected({ name: e.target.value }, 'name')}
                    />
                  </label>
                </div>
                <AnimationFields
                  key={selected.id}
                  value={selected}
                  project={project}
                  assets={assets}
                  patch={patchSelected}
                  previewSpeciesId={owner.id}
                />
              </>
            ) : (
              <div className="char-shared-preview">
                <p>Aucune animation de cinématique sélectionnée. Produis une marche par l’IA ou crée un clip dédié aux cinématiques.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </StudioDialog>
  );
}
