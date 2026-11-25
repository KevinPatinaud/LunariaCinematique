import React, { useContext, useEffect, useId, useRef, useState } from 'react';
import type { Actor, AssetRef } from '../../shared/model.js';
import type { AiImageProvider } from '../../shared/aiProviders.js';
import { providerLabel } from '../../shared/aiProviders.js';
import {
  ANIMATION_PRESETS,
  animationPresetSpec,
  defaultAnimationName,
  defaultAnimationReference,
  type AnimationFacing,
  type AnimationGenerationRequest,
  type AnimationPreset,
} from '../../shared/animationGeneration.js';
import type { AnimationScope } from '../../shared/presentation/types.js';
import { imageTaskLabels, type ImageTask } from '../../shared/imageTasks.js';
import { inferActorSpecies } from '../../shared/presentation/cinematicMotion.js';
import { enemyChoices } from '../../shared/game/types.js';
import { api } from '../browserBridge.js';
import { StudioDialog } from '../components/StudioDialog.js';
import { NumberInput } from '../components/NumberInput.js';
import { LibraryPickerContext } from '../components/LibraryPickerContext.js';
import { ImagePicker } from '../presentation/ImagePicker.js';
import { useProjectSession } from '../project/ProjectSessionContext.js';
import { useImageTasks } from './ImageTasksContext.js';
import { AiModelSelector, rememberAiProvider, saveAiProvider } from './AiModelSelector.js';
import { useAiModels } from './useAiModels.js';
import { AnimationTaskActions, type AnimationActorTarget } from './AnimationTaskActions.js';
import './animationGeneration.css';

export interface AnimationGenerationTarget {
  speciesId?: string;
  actor?: Actor;
  documentId?: string;
  shotId?: string;
  defaultPreset?: AnimationPreset;
  scope?: AnimationScope;
  historyOnly?: boolean;
}

const modelPrefKey = 'lunaria.animationGeneration.model';
const providerPrefKey = 'lunaria.animationGeneration.provider';
const GRID_OPTIONS = [
  { label: '6 poses (3 × 2 · cycle court)', columns: 3, rows: 2 },
  { label: '8 poses (4 × 2 · marche ou course détaillée)', columns: 4, rows: 2 },
  { label: '4 frames (4 × 1 · léger repos/parole)', columns: 4, rows: 1 },
  { label: '4 frames (2 × 2 · carré)', columns: 2, rows: 2 },
] as const;

function rememberedModel() {
  try { return localStorage.getItem(modelPrefKey) ?? ''; } catch { return ''; }
}

export function SpritesheetCyclePlayer({
  url,
  columns,
  rows,
  fps,
  loop,
  width,
  height,
  facing = 'right',
  playbackSpeed,
  onPlaybackSpeedChange,
}: {
  url: string;
  columns: number;
  rows: number;
  fps: number;
  loop: boolean;
  width?: number;
  height?: number;
  facing?: AnimationFacing;
  playbackSpeed?: number;
  onPlaybackSpeedChange?: (speed: number) => void;
}) {
  const total = Math.max(1, columns * rows);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [treadmill, setTreadmill] = useState(true);
  const [showSheet, setShowSheet] = useState(false);
  const [previewSpeed, setPreviewSpeed] = useState(1);
  const speed = playbackSpeed ?? previewSpeed;
  const clipId = useId();
  const playhead = useRef(0);
  const track = useRef<SVGGElement>(null);
  const trackSpacing = 28;

  useEffect(() => {
    playhead.current = 0;
    setFrame(0);
    track.current?.removeAttribute('transform');
  }, [url, columns, rows]);

  useEffect(() => {
    if (!playing || showSheet || total <= 1) return;
    let previous: number | undefined;
    let request: number;
    const tick = (now: number) => {
      if (previous !== undefined) playhead.current += Math.min(100, now - previous) * fps * speed / 1000;
      previous = now;
      const position = playhead.current;
      const pose = Math.floor(position);
      setFrame(loop ? pose % total : Math.min(total - 1, pose));
      const shift = (position * 8) % trackSpacing * (facing === 'right' ? -1 : 1);
      track.current?.setAttribute('transform', `translate(${shift}, 0)`);
      if (!loop && pose >= total - 1) setPlaying(false);
      else request = requestAnimationFrame(tick);
    };
    request = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(request);
  }, [playing, showSheet, total, fps, speed, loop, facing]);

  function step(offset: number) {
    const next = loop ? (frame + total + offset) % total : Math.max(0, Math.min(total - 1, frame + offset));
    playhead.current = next;
    track.current?.removeAttribute('transform');
    setPlaying(false);
    setFrame(next);
  }

  const col = frame % columns;
  const row = Math.floor(frame / columns);
  const sheetW = width || columns * 256;
  const sheetH = height || rows * 256;
  const cellW = sheetW / columns;
  const cellH = sheetH / rows;

  return (
    <div className="anim-cycle-player">
      {showSheet ? (
        <div className="anim-sheet-full">
          <img src={url} alt="Planche complète d’animation" />
        </div>
      ) : (
        <div className="anim-stage">
          <svg viewBox={`0 0 ${cellW} ${cellH + 18}`} aria-label="Aperçu animé du cycle généré">
            <defs>
              <clipPath id={clipId}><rect width={cellW} height={cellH}/></clipPath>
            </defs>
            <image href={url} x={-col * cellW} y={-row * cellH} width={sheetW} height={sheetH} clipPath={`url(#${clipId})`}/>
            <line x1="0" y1={cellH + 2} x2={cellW} y2={cellH + 2} stroke="rgba(200,224,175,0.35)" strokeWidth="2" />
            {treadmill && (
              <g ref={track} opacity="0.5">
                {Array.from({ length: Math.ceil(cellW / trackSpacing) + 4 }, (_, idx) => {
                  const x = (idx - 1) * trackSpacing;
                  return <line key={idx} x1={x} y1={cellH + 2} x2={x - 10} y2={cellH + 14} stroke="#c7dda3" strokeWidth="2" />;
                })}
              </g>
            )}
          </svg>
          <span className="anim-frame-badge">Pose {frame + 1} / {total}</span>
        </div>
      )}
      <div className="anim-player-controls">
        <button type="button" className="button subtle" onClick={() => {
          if (!playing && !loop && frame === total - 1) {
            playhead.current = 0;
            setFrame(0);
          }
          setPlaying(!playing);
        }}>
          {playing ? 'Pause' : 'Lire'}
        </button>
        <button type="button" className="button subtle" aria-label="Pose précédente" onClick={() => step(-1)}>
          ←
        </button>
        <button type="button" className="button subtle" aria-label="Pose suivante" onClick={() => step(1)}>
          →
        </button>
        <label className="anim-mini-check">
          <input type="checkbox" checked={treadmill} onChange={e => setTreadmill(e.target.checked)} />
          Sol mobile
        </label>
        <label className="anim-mini-check">
          <input type="checkbox" checked={showSheet} onChange={e => setShowSheet(e.target.checked)} />
          Voir la planche
        </label>
        {onPlaybackSpeedChange ? (
          <label className="anim-mini-speed">
            <span>Cadence dans le plan (×)</span>
            <NumberInput label="Cadence dans le plan" min={0.05} max={10} value={speed} onCommit={onPlaybackSpeedChange}/>
          </label>
        ) : <label className="anim-mini-speed">
          <span>×{speed.toFixed(1)}</span>
          <input type="range" min="0.4" max="2" step="0.1" value={speed} onChange={e => setPreviewSpeed(Number(e.target.value))} />
        </label>}
      </div>
    </div>
  );
}

export function AnimationGenerationDialog({
  target,
  onClose,
  notify,
  onApplied,
}: {
  target?: AnimationGenerationTarget;
  onClose: () => void;
  notify: (message: string) => void;
  onApplied?: (animationId: string, speciesId: string) => void;
}) {
  const services = useContext(LibraryPickerContext);
  const { project, path: projectPath } = useProjectSession();
  const { tasks, refresh } = useImageTasks();
  const library = services?.library ?? null;
  const assets = library?.assets ?? [];
  const allSpecies = [...project.balance.plants, ...enemyChoices(project.balance.enemies, target?.speciesId)];

  const scope: AnimationScope = target?.scope ?? (target?.actor || target?.documentId ? 'cinematic' : 'game');
  const historyOnly = target?.historyOnly === true;
  const actorSpecies = target?.actor ? inferActorSpecies(target.actor, project) : undefined;
  const inferred = target?.speciesId
    ? allSpecies.find(item => item.id === target.speciesId)
    : target?.actor
      ? actorSpecies
      : allSpecies[0];

  const [speciesId, setSpeciesId] = useState(
    scope === 'cinematic'
      ? (inferred?.id ?? '')
      : (inferred?.id ?? allSpecies[0]?.id ?? ''),
  );
  const selectedSpecies = allSpecies.find(item => item.id === speciesId);
  const referenceResolution = defaultAnimationReference({
    scope,
    actor: target?.actor,
    actorSpeciesId: actorSpecies?.id,
    speciesId: target?.speciesId,
    speciesSpriteRef: selectedSpecies?.visual?.sprite.asset,
    assets,
  });
  const initialRef = referenceResolution.ref;
  const masterRef = referenceResolution.masterRef;

  const initialPreset = target?.defaultPreset ?? 'walk';
  const presetSpec = animationPresetSpec(initialPreset, scope);

  const [ref, setRef] = useState<AssetRef | undefined>(initialRef);
  const [preset, setPreset] = useState<AnimationPreset>(initialPreset);
  const [slot, setSlot] = useState(presetSpec.slot);
  const [columns, setColumns] = useState(presetSpec.columns);
  const [rows, setRows] = useState(presetSpec.rows);
  const [fps, setFps] = useState(presetSpec.fps);
  const [loop, setLoop] = useState(presetSpec.loop);
  const [facing, setFacing] = useState<AnimationFacing>('right');
  const [instructions, setInstructions] = useState(presetSpec.defaultInstructions);
  const [aiProvider, setAiProvider] = useState<AiImageProvider>(() => rememberAiProvider(providerPrefKey));
  const [model, setModel] = useState(rememberedModel);
  const { models, loadingModels, modelError, refreshModels } = useAiModels(aiProvider, !historyOnly);
  const [jobId, setJobId] = useState('');
  const [speedDrafts, setSpeedDrafts] = useState<Record<string, number>>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const locked = useRef(false);
  const live = useRef(true);
  const rootRef = useRef(library?.rootPath);

  const history = historyOnly ? tasks.filter((item): item is Extract<ImageTask, { kind: 'animation' }> =>
    item.kind === 'animation' &&
    item.job.preset === 'walk' &&
    item.libraryRoot === library?.rootPath &&
    !!target?.actor &&
    item.context?.projectId === project.id &&
    item.context.projectPath === projectPath &&
    item.context.documentId === target.documentId &&
    item.context.shotId === target.shotId &&
    item.context.actorId === target.actor.id
  ) : [];
  const binding = target?.actor?.animation;
  const activeClip = binding?.mode === 'animation'
    ? project.presentation?.animations.find(clip => clip.id === binding.animationId)
    : undefined;
  const currentTask = history.find(item => item.job.sheetRef && activeClip?.frames.some(frame => frame.asset === item.job.sheetRef));
  const jobTask = historyOnly
    ? history.find(item => item.job.id === jobId) ?? currentTask ?? history[0]
    : tasks.find(item => item.kind === 'animation' && item.job.id === jobId);
  const task = jobTask?.kind === 'animation' ? jobTask : undefined;
  const speed = task
    ? speedDrafts[task.job.id] ?? (task === currentTask ? binding?.speed ?? 1 : 1)
    : 1;
  const active = task && ['queued', 'generating', 'applying'].includes(task.job.status);
  const changedLibrary = rootRef.current !== library?.rootPath;
  const unavailable = !!model && !models.some(item => item.id === model);
  const actorName = target?.actor?.name.trim();
  const namedActor = actorName && !/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(actorName) ? actorName : undefined;
  const characterName = scope === 'cinematic'
    ? (namedActor ?? selectedSpecies?.name ?? 'Personnage')
    : (selectedSpecies?.name ?? namedActor ?? 'Personnage');

  useEffect(() => {
    live.current = true;
    return () => { live.current = false; };
  }, []);

  function choosePreset(nextPreset: AnimationPreset) {
    const spec = animationPresetSpec(nextPreset, scope);
    setPreset(nextPreset);
    setSlot(spec.slot);
    setColumns(spec.columns);
    setRows(spec.rows);
    setFps(spec.fps);
    setLoop(spec.loop);
    setInstructions(spec.defaultInstructions);
  }

  function changeSpecies(nextId: string) {
    setSpeciesId(nextId);
    if (scope === 'cinematic' && target?.actor?.asset) return;
    const sp = allSpecies.find(item => item.id === nextId);
    if (sp?.visual?.sprite.asset) {
      const nextRef = defaultAnimationReference({
        scope,
        speciesId: nextId,
        speciesSpriteRef: sp.visual.sprite.asset,
        assets,
      }).ref;
      if (nextRef) setRef(nextRef);
    }
  }

  async function perform(action: () => Promise<void>) {
    if (locked.current) return;
    locked.current = true;
    setPending(true);
    setError('');
    try {
      await action();
      await refresh();
    } catch (reason) {
      if (live.current) setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      locked.current = false;
      if (live.current) setPending(false);
    }
  }

  async function generate() {
    if (!ref || !library || changedLibrary || unavailable) {
      throw Error('Choisis une image de référence et un modèle disponible.');
    }
    const spec = animationPresetSpec(preset, scope);
    const selectedAsset = assets.find(asset => asset.ref === ref);
    const computedAnimationName = defaultAnimationName({
      characterName,
      preset,
      scope,
      ref,
      assetName: selectedAsset?.name,
    });
    const request: AnimationGenerationRequest = {
      speciesId: speciesId || undefined,
      characterName,
      animationName: computedAnimationName,
      preset,
      slot,
      scope,
      ref,
      columns,
      rows,
      fps,
      loop,
      facing,
      stridePx: spec.stridePx,
      instructions,
      aiProvider,
      codexModel: model,
      context: {
        projectId: project.id,
        projectPath,
        speciesId: speciesId || undefined,
        documentId: target?.documentId,
        shotId: target?.shotId,
        actorId: target?.actor?.id,
        title: `${characterName} · ${spec.label.replace(' (prioritaire)', '')}`,
      },
    };
    const next = await api.startAnimationGeneration(request);
    if (live.current) setJobId(next.id);
  }

  const source = assets.find(asset => asset.ref === ref);
  const actorAssetRef = target?.actor?.asset;
  const usingActorAsset = scope === 'cinematic' && !!actorAssetRef && ref === actorAssetRef;
  const canSwitchToMaster = scope === 'cinematic' && !!masterRef && masterRef !== ref;
  const canRestoreActorAsset = scope === 'cinematic' && !!actorAssetRef && ref !== actorAssetRef;
  const previewSourceUrl = historyOnly || (task && task.job.sourceRef === ref)
    ? task?.job.sourceUrl
    : source?.url ?? task?.job.sourceUrl;
  const actorTarget: AnimationActorTarget | undefined =
    target?.actor && target.documentId && target.shotId
      ? {
          documentId: target.documentId,
          shotId: target.shotId,
          actorId: target.actor.id,
          actorName: target.actor.name,
        }
      : undefined;
  const cinematicWalk = scope === 'cinematic' && preset === 'walk';
  const cadenceInput = (
    <label className="field">
      <span>Cadence (images/s)</span>
      <NumberInput label="Cadence en images par seconde" min={2} max={24} value={fps} onCommit={setFps}/>
    </label>
  );

  return (
    <StudioDialog
      title={historyOnly ? 'Historique des marches' : preset === 'walk' ? 'Produire une marche par l’IA' : 'Produire une animation par l’IA'}
      onClose={() => { if (!locked.current && !pending) onClose(); }}
      disabled={pending}
      wide
    >
      <div className="anim-generation">
        {historyOnly && (history.length > 0 ? (
          <label className="field">
            <span>Essais de {characterName} dans ce plan</span>
            <select aria-label="Essai de marche" value={task?.job.id ?? ''} disabled={pending} onChange={event => setJobId(event.target.value)}>
              {history.map((item, index) => (
                <option key={item.job.id} value={item.job.id}>
                  Essai {history.length - index} · {item === currentTask ? 'Dans ce plan' : imageTaskLabels[item.job.status]} · {item.job.animationName}
                </option>
              ))}
            </select>
          </label>
        ) : <p>Aucune génération de marche dans l’historique de ce personnage pour ce plan.</p>)}
        {!historyOnly && <p className="anim-gen-intro">
          {scope === 'cinematic' ? (
            <>
              Génère une marche dédiée aux <strong>cinématiques</strong> à partir de <strong>l’image statique sélectionnée</strong> pour <strong>{characterName}</strong> ({columns * rows} poses stabilisées, séparée des animations des niveaux).
              L’animation conserve son expression et sa forme, et sera réutilisable partout où cette image est utilisée.
            </>
          ) : (
            <>
              Génère une animation dédiée aux <strong>niveaux du jeu</strong> pour <strong>{characterName}</strong> ({columns * rows} poses stabilisées), séparée des animations de cinématiques.
            </>
          )}
        </p>}

        {!historyOnly && <fieldset className="anim-gen-form" disabled={pending || !!active || changedLibrary}>
          <label className="field">
            <span>Style de marche souhaité</span>
            <textarea
              aria-label="Consigne de mouvement"
              rows={2}
              maxLength={5000}
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
            />
          </label>
          {cinematicWalk && cadenceInput}

          <AiModelSelector
            provider={aiProvider}
            onProviderChange={nextProvider => {
              setAiProvider(nextProvider);
              setModel('');
              saveAiProvider(providerPrefKey, nextProvider);
              try { localStorage.setItem(modelPrefKey, ''); } catch { /* Optional. */ }
            }}
            model={model}
            onModelChange={nextModel => {
              setModel(nextModel);
              try { localStorage.setItem(modelPrefKey, nextModel); } catch { /* Optional. */ }
            }}
            models={models}
            loading={loadingModels}
            error={modelError}
            onRefresh={refreshModels}
            disabled={pending || !!active || changedLibrary}
          />

          <details className="motion-precision">
            <summary>Options avancées (référence, autre animation, grille {columns}×{rows})</summary>
            <div className="anim-gen-presets" role="group" aria-label="Type d’animation à générer">
              {(Object.keys(ANIMATION_PRESETS) as AnimationPreset[]).map(id => {
                const item = ANIMATION_PRESETS[id];
                return (
                  <button
                    key={id}
                    type="button"
                    className={`button subtle ${preset === id ? 'active' : ''}`}
                    aria-pressed={preset === id}
                    onClick={() => choosePreset(id)}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="anim-gen-row">
              <label className="field">
                <span>Personnage</span>
                <select aria-label="Personnage à animer" value={speciesId} onChange={e => changeSpecies(e.target.value)}>
                  {scope === 'cinematic' && (
                    <option value="">Aucun (image statique libre)</option>
                  )}
                  {allSpecies.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Format de la planche</span>
                <select
                  aria-label="Format de la planche"
                  value={`${columns}x${rows}`}
                  onChange={event => {
                    const [c, r] = event.target.value.split('x').map(Number);
                    if (c && r) { setColumns(c); setRows(r); }
                  }}
                >
                  {GRID_OPTIONS.map(opt => (
                    <option key={`${opt.columns}x${opt.rows}`} value={`${opt.columns}x${opt.rows}`}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              {!cinematicWalk && cadenceInput}
              <label className="field">
                <span>Direction</span>
                <select aria-label="Direction du personnage" value={facing} onChange={e => setFacing(e.target.value as AnimationFacing)}>
                  <option value="right">Vers la droite</option>
                  <option value="left">Vers la gauche</option>
                </select>
              </label>
            </div>
            <ImagePicker
              label={scope === 'cinematic' ? 'Image statique de référence' : 'Master de référence du personnage'}
              buttonLabel="Choisir une autre référence"
              assets={assets}
              category="character"
              value={ref ? [ref] : []}
              change={refs => setRef(refs[0] as AssetRef | undefined)}
            />
          </details>
        </fieldset>}

        {(!historyOnly || task) && <div className="anim-comparison">
          <figure>
            <figcaption>{scope === 'cinematic' ? 'Image statique de référence' : 'Référence du personnage'}</figcaption>
            <div className="pose-preview">
              {previewSourceUrl
                ? <img src={previewSourceUrl} alt={scope === 'cinematic' ? 'Image statique de référence du personnage' : 'Référence du personnage'} />
                : <span>{scope === 'cinematic' ? 'Choisis une image statique de référence.' : 'Choisis une référence officielle.'}</span>}
            </div>
            {historyOnly ? (
              <small className="anim-ref-file">{task?.job.sourceRef.split('/').at(-1)}</small>
            ) : scope === 'cinematic' && (
              <div className="anim-ref-meta">
                {ref && (
                  <small className="anim-ref-file" title={ref}>
                    {usingActorAsset ? 'Image sélectionnée dans le plan' : 'Autre image de référence'} · {ref.split('/').at(-1)}
                  </small>
                )}
                {(canSwitchToMaster || canRestoreActorAsset) && (
                  <div className="anim-ref-switch">
                    {canRestoreActorAsset && (
                      <button
                        type="button"
                        className="link-button"
                        disabled={pending || !!active || changedLibrary}
                        onClick={() => setRef(actorAssetRef)}
                      >
                        Revenir à l’image du plan
                      </button>
                    )}
                    {canSwitchToMaster && (
                      <button
                        type="button"
                        className="link-button"
                        disabled={pending || !!active || changedLibrary}
                        onClick={() => setRef(masterRef)}
                      >
                        Utiliser le Master à la place
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </figure>
          <figure>
            <figcaption>
              Aperçu du cycle généré{task?.job.width ? ` · ${task.job.frameCount} poses · ${task.job.fps} images/s` : ''}
            </figcaption>
            <div className="pose-preview anim-preview-box">
              {task?.job.candidateUrl ? (
                <SpritesheetCyclePlayer
                  key={task.job.id}
                  url={task.job.candidateUrl}
                  columns={task.job.columns}
                  rows={task.job.rows}
                  fps={task.job.fps}
                  loop={task.job.loop}
                  width={task.job.width}
                  height={task.job.height}
                  facing={task.job.facing}
                  playbackSpeed={actorTarget && task.job.preset === 'walk' ? speed : undefined}
                  onPlaybackSpeedChange={actorTarget && task.job.preset === 'walk'
                    ? value => setSpeedDrafts(previous => ({ ...previous, [task.job.id]: value }))
                    : undefined}
                />
              ) : (
                <span role="status">
                  {task?.job.message ?? 'Le cycle animé apparaîtra ici avec aperçu en boucle et test de marche.'}
                </span>
              )}
            </div>
            {task?.job.candidateUrl && actorTarget && task.job.preset === 'walk' && task.job.loop && (
              <small>Dans le plan, les pas suivent la vitesse du déplacement A → B.</small>
            )}
          </figure>
        </div>}

        {task && (
          <p role="status">
            {task.job.message} · Fournisseur : <strong>{providerLabel(task.job.aiProvider)}</strong> · Modèle : <strong>{task.job.codexModel ?? 'Automatique'}</strong>.
          </p>
        )}

        {(error || changedLibrary) && (
          <p role="alert" className="image-task-error">
            {error || 'La bibliothèque a changé. Rouvre cette fenêtre dans la bibliothèque voulue.'}
          </p>
        )}

        <div className="image-task-actions">
          {!historyOnly && <button
            type="button"
            className="button primary"
            disabled={pending || !!active || !ref || !instructions.trim() || unavailable || changedLibrary || (!!model && loadingModels)}
            onClick={() => void perform(generate)}
          >
            {task ? 'Générer une autre proposition' : preset === 'walk' ? 'Produire la marche' : `Produire l’animation (${columns * rows} frames)`}
          </button>}
          {task && ['queued', 'generating'].includes(task.job.status) && (
            <button
              type="button"
              className="button subtle"
              disabled={pending}
              onClick={() => void perform(async () => { await api.cancelAnimationGeneration(task.job.id); })}
            >
              Annuler la génération
            </button>
          )}
          <button type="button" className="button subtle" disabled={pending} onClick={onClose}>
            Fermer
          </button>
        </div>

        {task && (
          <AnimationTaskActions
            key={task.job.id}
            task={task}
            library={library}
            updateLibrary={() => { void services?.refresh(); }}
            actorTarget={actorTarget}
            playbackSpeed={speed}
            onPendingChange={setPending}
            notify={notify}
            onApplied={(animationId, spId) => {
              onApplied?.(animationId, spId);
              onClose();
            }}
          />
        )}
      </div>
    </StudioDialog>
  );
}
