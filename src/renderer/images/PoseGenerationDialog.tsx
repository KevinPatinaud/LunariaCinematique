import React, { useContext, useEffect, useRef, useState } from 'react';
import type { Actor, AssetRef } from '../../shared/model.js';
import { actorPoseSignature, poseReference, type PoseGenerationRequest } from '../../shared/poseGeneration.js';
import type { CodexModelOption } from '../../shared/backgroundCorrection.js';
import { api } from '../browserBridge.js';
import { StudioDialog } from '../components/StudioDialog.js';
import { LibraryPickerContext } from '../components/LibraryPickerContext.js';
import { ImagePicker } from '../presentation/ImagePicker.js';
import { useProjectSession } from '../project/ProjectSessionContext.js';
import { useImageTasks } from './ImageTasksContext.js';
import { PoseTaskActions } from './PoseTaskActions.js';
import './poseGeneration.css';

export interface PoseSelection { actor: Actor; documentId: string; shotId: string; projectId: string; projectPath: string }
const preference = 'lunaria.poseGeneration.model';
function rememberedModel() { try { return localStorage.getItem(preference) ?? ''; } catch { return ''; } }
export function PoseGenerationDialog({ target, onClose, notify }: { target: PoseSelection; onClose: () => void; notify: (message: string) => void }) {
  const services = useContext(LibraryPickerContext), { session } = useProjectSession(), { tasks, refresh } = useImageTasks();
  const library = services?.library ?? null, assets = library?.assets ?? [];
  const [suggestion] = useState(() => poseReference(target.actor, assets));
  const [ref, setRef] = useState<AssetRef | undefined>(suggestion.ref), [instructions, setInstructions] = useState('');
  const [model, setModel] = useState(rememberedModel), [models, setModels] = useState<CodexModelOption[]>([]), [modelError, setModelError] = useState(''), [loadingModels, setLoadingModels] = useState(false);
  const [jobId, setJobId] = useState(''), [pending, setPending] = useState(false), [error, setError] = useState('');
  const locked = useRef(false), live = useRef(true), loading = useRef(false), root = useRef(library?.rootPath);
  const jobTask = tasks.find(task => task.kind === 'pose' && task.job.id === jobId);
  const task = jobTask?.kind === 'pose' ? jobTask : undefined;
  const active = task && ['queued','generating','applying'].includes(task.job.status);
  const changedLibrary = root.current !== library?.rootPath;
  const unavailable = !!model && !models.some(item => item.id === model);
  useEffect(() => { live.current = true; return () => { live.current = false; }; }, []);
  async function refreshModels() {
    if (loading.current) return;
    loading.current = true; setLoadingModels(true); setModelError('');
    try { const next = await api.listBackgroundModels(); if (live.current) setModels(next); }
    catch (reason) { if (live.current) setModelError(String(reason)); }
    finally { loading.current = false; if (live.current) setLoadingModels(false); }
  }
  useEffect(() => { void refreshModels(); }, []);
  useEffect(() => {
    if (jobId || locked.current) return;
    const existing = tasks.find(item => item.kind === 'pose' && item.libraryRoot === library?.rootPath && item.context?.projectId === target.projectId && item.context.projectPath === target.projectPath && item.context.documentId === target.documentId && item.context.shotId === target.shotId && item.context.actorId === target.actor.id && item.context.actorSignature === actorPoseSignature(target.actor) && ['queued','generating','ready'].includes(item.job.status));
    if (existing?.kind === 'pose') { setJobId(existing.job.id); setRef(existing.request.ref); setInstructions(existing.request.instructions); setModel(existing.request.codexModel ?? ''); }
  }, [tasks, jobId, target, library?.rootPath]);
  async function perform(action: () => Promise<void>) {
    if (locked.current) return;
    locked.current = true; setPending(true); setError('');
    try { await action(); await refresh(); }
    catch (reason) { if (live.current) setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { locked.current = false; if (live.current) setPending(false); }
  }
  async function generate() {
    if (!ref || !library || changedLibrary || unavailable) throw Error('Choisis une référence et un modèle disponible dans la bibliothèque connectée.');
    const request: PoseGenerationRequest = { ref, currentRef: target.actor.asset, characterName: target.actor.name, instructions, codexModel: model, context: {
      projectId: target.projectId, projectPath: target.projectPath, documentId: target.documentId, shotId: target.shotId, actorId: target.actor.id, actorRef: target.actor.asset, actorSignature: actorPoseSignature(target.actor), title: `${target.actor.name} · ${instructions.slice(0, 90)}`,
    } };
    const next = await api.startPoseGeneration(request);
    if (live.current) setJobId(next.id);
  }
  const source = assets.find(asset => asset.ref === ref);
  return <StudioDialog title="Générer une pose avec Codex" onClose={() => { if (!locked.current) onClose(); }} disabled={pending} wide>
    <div className="pose-generation">
      <p>Nouvelle pose pour <strong>{target.actor.name}</strong>. Décris sa posture, son expression et la direction de son regard.</p>
      <fieldset disabled={pending || !!active || changedLibrary}>
        <ImagePicker label="Référence officielle du personnage" buttonLabel="Choisir une autre référence" assets={assets} category="character" value={ref ? [ref] : []} change={refs => setRef(refs[0] as AssetRef | undefined)} />
        <p className="pose-help">{ref === suggestion.ref ? suggestion.message : 'Référence choisie par l’auteur.'} L’image actuelle du plan sera également transmise si elle est différente.</p>
        <label>Décris la pose souhaitée<textarea aria-label="Décris la pose souhaitée" maxLength={5000} rows={3} value={instructions} onChange={event => setInstructions(event.target.value)} placeholder="Ex. Radis pleure, la tête baissée et les mains devant le visage." /></label>
        <div className="pose-model"><label>Modèle Codex<select aria-label="Modèle Codex" value={model} onChange={event => { setModel(event.target.value); try { localStorage.setItem(preference, event.target.value); } catch { /* Local preference optional. */ } }}>
          <option value="">Automatique · choix de Codex</option>
          {unavailable && <option value={model} disabled>{model} · non détecté</option>}
          {models.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select></label><button className="button subtle" disabled={loadingModels} onClick={() => void refreshModels()}>{loadingModels ? 'Détection…' : 'Actualiser les modèles'}</button></div>
        <p className="pose-help">Le choix est mémorisé pour les prochaines poses. Le modèle Codex pilote la demande ; son outil natif produit l’image.</p>
        {modelError && <p role="alert">{modelError} Le choix automatique reste disponible.</p>}
      </fieldset>
      <div className="pose-comparison">
        <figure><figcaption>Master de référence</figcaption><div className="pose-preview">{(task?.job.sourceUrl || source) ? <img src={task?.job.sourceUrl ?? source?.url} alt="Référence du personnage" /> : <span>Choisis une référence officielle.</span>}</div></figure>
        <figure><figcaption>Pose proposée{task?.job.width ? ` · ${task.job.width} × ${task.job.height}` : ''}</figcaption><div className="pose-preview">{task?.job.candidateUrl ? <img src={task.job.candidateUrl} alt="Pose proposée" /> : <span role="status">{task?.job.message ?? 'La proposition apparaîtra ici.'}</span>}</div></figure>
      </div>
      {task && <p role="status">{task.job.message} Modèle demandé : {task.job.codexModel ?? 'Automatique'}.</p>}
      {task && <details><summary>Consigne de cette proposition</summary><p>{task.request.instructions}</p><p className="pose-help">Les réglages modifiés s’appliquent à la prochaine génération.</p></details>}
      {(error || changedLibrary) && <p role="alert" className="image-task-error">{error || 'La bibliothèque a changé. Rouvre ce formulaire dans la bibliothèque voulue.'}</p>}
      <div className="image-task-actions">
        <button className="button primary" disabled={pending || !!active || !ref || !instructions.trim() || unavailable || changedLibrary || (!!model && loadingModels)} onClick={() => void perform(generate)}>{task ? 'Générer une autre proposition' : 'Générer la pose'}</button>
        {task && ['queued','generating'].includes(task.job.status) && <button className="button subtle" disabled={pending} onClick={() => void perform(async () => { await api.cancelPoseGeneration(task.job.id); })}>Annuler la génération</button>}
        <button className="button subtle" disabled={pending} onClick={onClose}>Réduire</button>
      </div>
      {task && <PoseTaskActions key={task.job.id} task={task} library={library} updateLibrary={() => { void services?.refresh(); }} notify={notify} />}
      <p className="pose-help">Les propositions restent dans « Tâches et résultats ». Vérifie la fidélité au personnage avant de valider.</p>
    </div>
  </StudioDialog>;
}
