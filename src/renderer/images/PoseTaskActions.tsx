import React, { useEffect, useRef, useState } from 'react';
import { actorPoseSignature, actorWithPose, poseTaskDestination, type PoseGenerationRequest } from '../../shared/poseGeneration.js';
import type { ImageTask } from '../../shared/imageTasks.js';
import type { LibrarySnapshot } from '../../shared/model.js';
import { api } from '../browserBridge.js';
import { useProjectSession } from '../project/ProjectSessionContext.js';
import { useImageTasks } from './ImageTasksContext.js';

export function PoseTaskActions({ task, library, updateLibrary, notify = () => undefined }: {
  task: Extract<ImageTask, { kind: 'pose' }>;
  library: LibrarySnapshot | null;
  updateLibrary: (library: LibrarySnapshot) => void;
  notify?: (message: string) => void;
}) {
  const { session, project, path, epoch, dirty } = useProjectSession();
  const { refresh } = useImageTasks();
  const [chosen, setChosen] = useState<{ key: string; signature: string; epoch: number }>();
  const [chooseOther, setChooseOther] = useState(false), [pending, setPending] = useState(false), [error, setError] = useState('');
  const locked = useRef(false), live = useRef(true), rootRef = useRef(library?.rootPath);
  rootRef.current = library?.rootPath;
  useEffect(() => { live.current = true; return () => { live.current = false; }; }, []);
  useEffect(() => { setChosen(undefined); setChooseOther(false); setError(''); }, [epoch, task.job.id]);
  const destination = poseTaskDestination(task.request as PoseGenerationRequest, task.job.poseRef, project, path);
  const automatic = !chooseOther && destination.target && !destination.assigned.length ? destination.target : undefined;
  const selection = automatic ? { key: automatic.key, signature: actorPoseSignature(automatic.actor), epoch } : chosen;
  const inLibrary = library?.rootPath === task.libraryRoot;
  async function usePose(assign: boolean) {
    if (locked.current) return;
    locked.current = true; setPending(true); setError('');
    const captured = session.getSnapshot(), capturedRoot = rootRef.current;
    const validTarget = () => {
      const current = session.getSnapshot();
      const target = poseTaskDestination(task.request, task.job.poseRef, session.project, current.path).targets.find(item => item.key === selection?.key);
      if (!live.current || current.busy || current.epoch !== captured.epoch || current.token !== captured.token || selection?.epoch !== current.epoch || !target || actorPoseSignature(target.actor) !== selection.signature || rootRef.current !== capturedRoot)
        throw Error('Le projet, la bibliothèque ou le personnage a changé. Choisis à nouveau la destination.');
      return target;
    };
    try {
      if (!inLibrary) throw Error('Reconnecte la bibliothèque de cette pose.');
      if (assign) validTarget();
      const result = await api.applyPoseGeneration(task.job.id);
      if (live.current && result.library && rootRef.current === result.library.rootPath) updateLibrary(result.library);
      if (assign) {
        const target = validTarget();
        if (!result.job.poseRef || !result.job.width || !result.job.height) throw Error('La pose importée est incomplète.');
        const next = actorWithPose(target.actor, result.job.poseRef, { width: result.job.width, height: result.job.height });
        session.change(p => {
          const shot = p.cinematics!.find(film => film.id === target.film.id)!.shots.find(shot => shot.id === target.shot.id)!;
          shot.actors[shot.actors.findIndex(actor => actor.id === target.actor.id)] = next;
        }, '', 'Utiliser la pose générée', { mode: 'cinematics', filmId: target.film.id, shotId: target.shot.id });
        setChosen(undefined); setChooseOther(false);
        notify('Pose affectée au personnage. Enregistre le projet pour conserver ce choix.');
      } else notify('Pose ajoutée à la bibliothèque.');
      await refresh();
    } catch (reason) { if (live.current) setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { locked.current = false; if (live.current) setPending(false); }
  }
  if (!['ready','applied'].includes(task.job.status)) return null;
  const picker = chooseOther || (!automatic && !destination.assigned.length);
  return <div className="pose-task-actions">
    {destination.assigned.length > 0 && inLibrary && <p role="status">Pose utilisée dans : <strong>{destination.assigned.map(item => item.label).join(', ')}</strong>. {dirty ? 'Enregistre le projet pour conserver ce choix.' : 'Projet enregistré.'}</p>}
    {automatic && <p>La pose sera appliquée à <strong>{automatic.label}</strong>.</p>}
    {!picker && <button className="button text" disabled={pending} onClick={() => setChooseOther(true)}>Choisir un autre personnage</button>}
    {picker && <label className="image-task-destination">Personnage de destination
      {!chooseOther && <small>{destination.reason}</small>}
      <select aria-label="Personnage de destination" disabled={pending} value={chosen?.key ?? ''} onChange={event => {
        const target = destination.targets.find(item => item.key === event.target.value);
        setChosen(target ? { key: target.key, signature: actorPoseSignature(target.actor), epoch } : undefined); setChooseOther(true);
      }}><option value="">Choisir dans le projet ouvert…</option>{destination.targets.map(item => <option key={item.key} value={item.key}>{item.label}</option>)}</select>
    </label>}
    {error && <p role="alert" className="image-task-error">{error}</p>}
    <div className="image-task-actions">
      {(!!selection || !destination.assigned.length || chooseOther) && <button className="button primary" disabled={pending || !inLibrary || !selection || session.getSnapshot().busy} onClick={() => void usePose(true)}>{pending ? 'Application…' : 'Utiliser cette pose dans le plan'}</button>}
      {task.job.status === 'ready' && <button className="button subtle" disabled={pending || !inLibrary} onClick={() => void usePose(false)}>Ajouter à la bibliothèque</button>}
    </div>
    <p className="pose-help">L’affectation est annulable avec Ctrl+Z. La pose devient une image fixe ; les dialogues et les effets de mise en scène sont conservés.</p>
  </div>;
}
