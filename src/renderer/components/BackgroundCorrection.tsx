import React, { useEffect, useRef, useState } from 'react';
import { useBackgroundCorrection } from './useBackgroundCorrection.js';
export { useBackgroundCorrection } from './useBackgroundCorrection.js';
import type { PanoramaMode, PanoramaWidth } from '../../shared/backgroundCorrection.js';
import { PANORAMA_WIDTHS, coreRect, isSixteenNine } from '../../shared/backgroundCorrection.js';
import { Icon } from './Icon.js';
import './backgroundCorrection.css';

type Controller = ReturnType<typeof useBackgroundCorrection>;

export function BackgroundCorrectionDialog({ correction }: { correction: Controller }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const node = dialog.current; node?.showModal(); return () => { node?.close(); }; }, []);
  const job = correction.job;
  const ready = job?.status === 'ready', applied = job?.status === 'applied';
  const prepared = correction.preparation;
  const usesOriginal = correction.mode === 'rebuild' && correction.useOriginal && !!prepared?.original;
  const base = usesOriginal ? prepared!.original! : prepared?.current;
  const rect = base && coreRect(base, usesOriginal ? .5 : correction.cropPosition);
  const canShift = !!base && !!rect && !usesOriginal && base.width > rect.width;
  return <dialog ref={dialog} className="background-correction-dialog" aria-labelledby="background-correction-title" onCancel={event => { event.preventDefault(); correction.close(); }}>
    <div className="background-correction-heading"><div><span className="overline">DÉCOR DU PLAN</span><h2 id="background-correction-title">Adapter le décor en 20:9</h2></div><button type="button" className="button subtle" onClick={correction.close} title="Continuer à travailler et retrouver ce décor dans le suivi des traitements"><span aria-hidden="true">−</span> Réduire</button></div>
    <p>Choisis le cadre 16:9 de référence. Codex crée un panorama cohérent et peut améliorer le centre en respectant le lieu et sa composition. Compare ensuite la proposition et teste-la dans le plan.</p>
    <p className="background-correction-asset">Décor : {correction.target?.asset.name}</p>
    {correction.busy && <p className="background-running-note" role="status">Tu peux réduire cette fenêtre et lancer le traitement d’un autre décor. Chaque génération continue en arrière-plan.</p>}
    <div className="background-model-options">
      <label className="field"><span>Modèle Codex</span><select aria-label="Modèle Codex" aria-describedby="background-model-help" value={correction.codexModel} disabled={correction.busy || applied || correction.models.loading} onChange={event => correction.setCodexModel(event.target.value)}>
        <option value="">Automatique · choix de Codex</option>
        {correction.modelUnavailable && <option value={correction.codexModel} disabled>{correction.codexModel} · {correction.models.loading ? 'détection en cours…' : 'non détecté'}</option>}
        {correction.models.items.map(model => <option key={model.id} value={model.id}>{model.label}{model.isDefault ? ' · par défaut' : ''}</option>)}
      </select></label>
      <button className="button subtle" aria-label="Actualiser les modèles Codex" disabled={correction.models.loading} onClick={() => void correction.refreshModels()}>{correction.models.loading ? <><span className="spinner"/> Détection…</> : 'Actualiser'}</button>
    </div>
    <p id="background-model-help" className="panorama-help">Liste détectée auprès du Codex de cet ordinateur. Ton choix est mémorisé pour les prochains décors. Le modèle pilote la retouche ; le moteur d’image natif reste géré par Codex.</p>
    <p className="background-model-status" role="status">{correction.models.loading ? 'Recherche des modèles…' : correction.models.loaded ? correction.models.items.length ? `${correction.models.items.length} modèle${correction.models.items.length > 1 ? 's' : ''} détecté${correction.models.items.length > 1 ? 's' : ''}.` : 'Aucun modèle acceptant les images n’a été détecté. Tu peux actualiser la liste ou conserver Automatique.' : ''}</p>
    {correction.models.error && <p className="background-correction-error" role="alert">{correction.models.error}{correction.models.items.length > 0 && ' La dernière liste détectée reste affichée.'}</p>}
    {correction.modelUnavailable && !correction.models.loading && <p className="background-correction-error" role="alert">Le modèle mémorisé n’est pas dans la liste détectée. Choisis un modèle de la liste ou Automatique avant de générer.</p>}
    {job && <p className="background-model-used">Modèle demandé pour cette proposition : <strong>{job.codexModel ?? 'Automatique'}</strong>.{ready && ' Un autre choix s’appliquera à la prochaine génération.'}</p>}
    {prepared && <>
      <div className="background-correction-options">
        <label className="field"><span>Traitement</span><select aria-label="Traitement du décor" value={correction.mode} disabled={correction.busy || !!job} onChange={event => { correction.setMode(event.target.value as PanoramaMode); correction.setCropPosition(.5); }}>
          <option value="extend" disabled={!isSixteenNine(prepared.current)}>Élargir un original 16:9</option><option value="rebuild">Refaire les côtés d’une image élargie</option>
        </select></label>
        <label className="field"><span>Résolution finale · 20:9</span><select aria-label="Résolution du panorama" value={correction.outputWidth} disabled={correction.busy || !!job} onChange={event => correction.setOutputWidth(event.target.value === 'native' ? 'native' : Number(event.target.value) as PanoramaWidth)}><option value="native">Native · conserver la qualité générée</option>{PANORAMA_WIDTHS.map(width => <option key={width} value={width}>{width} × {width * 9 / 20}{width === 1600 ? ' · compacte' : ''}</option>)}</select></label>
      </div>
      {correction.mode === 'rebuild' && prepared.original && <label className="check-field"><input type="checkbox" checked={correction.useOriginal} disabled={correction.busy || !!job} onChange={event => { correction.setUseOriginal(event.target.checked); correction.setCropPosition(.5); }}/> Repartir de l’original 16:9 retrouvé : {prepared.original.name}</label>}
      {!job && base && rect && <div className="background-comparison background-preparation">
        <figure><figcaption>{usesOriginal ? 'Original 16:9 retrouvé' : 'Cadre de référence · les zones rouges seront supprimées'}</figcaption><div>
          <svg data-testid="panorama-crop" viewBox={`0 0 ${base.width} ${base.height}`} aria-label="Cadre 16:9 de référence"><image href={base.url} width={base.width} height={base.height}/>
            <path d={`M0 0H${base.width}V${base.height}H0Z M${rect.x} ${rect.y}v${rect.height}h${rect.width}V${rect.y}Z`} fill="#b9343866" fillRule="evenodd"/>
            <rect data-testid="panorama-core" {...rect} fill="none" stroke="#d4ed9e" strokeWidth={Math.max(2, base.width / 400)}/>
          </svg>
        </div></figure>
        <figure><figcaption>20:9 · extensions et retouches harmonisées</figcaption><div className="panorama-guide"><span>IA</span><svg viewBox={`${rect.x} ${rect.y} ${rect.width} ${rect.height}`} aria-label="Référence au centre du panorama"><image href={base.url} width={base.width} height={base.height}/></svg><span>IA</span></div></figure>
      </div>}
      {!job && canShift && <label className="field panorama-position"><span>Position du centre 16:9 · {Math.round(correction.cropPosition * 100)} %</span><input aria-label="Position du centre 16:9" type="range" min="0" max="1" step="0.01" value={correction.cropPosition} disabled={correction.busy || applied} onChange={event => correction.setCropPosition(Number(event.target.value))}/><button className="button text" disabled={correction.busy} onClick={() => correction.setCropPosition(.5)}>Recentrer</button></label>}
      {!job && <p className="panorama-help">{usesOriginal ? 'Les anciens côtés sont exclus : seul l’original retrouvé sert de référence à Codex.' : 'Seul le cadre 16:9 sert de référence à Codex. Les zones supprimées ne participent pas à la génération.'} Le panorama généré est utilisé intégralement, avec ses retouches du centre.</p>}
    </>}
    <p className="panorama-help">{correction.outputWidth === 'native' ? 'Résolution native : le Studio conserve les dimensions et les détails du panorama généré.' : 'Résolution personnalisée : le panorama complet sera redimensionné uniformément. Agrandir une image ne crée pas de détails supplémentaires.'}</p>
    {job && <div className="background-comparison">
      <figure><figcaption>Version originale</figcaption><div><img src={job?.originalUrl ?? correction.target?.asset.url} alt="Décor original"/></div></figure>
      <figure><figcaption>Panorama généré{job?.width && ` · ${job.width} × ${job.height}`}{job.outputWidth === 'native' && job.width ? ' · natif' : ''}</figcaption><div>{job?.candidateUrl ? <img src={job.candidateUrl} alt="Décor corrigé proposé par Codex"/> : <span role="status">{correction.busy ? <><span className="spinner"/> {job?.message ?? 'Préparation…'}</> : 'La proposition apparaîtra ici.'}</span>}</div></figure>
    </div>}
    {(ready || job?.status === 'failed') && <button className="button text" disabled={correction.busy} onClick={() => void correction.edit()}>Modifier le cadrage</button>}
    <label className="field"><span>Ce que tu veux corriger</span><textarea aria-label="Instructions de correction du décor" maxLength={5000} value={correction.instructions} disabled={correction.busy || applied} onChange={event => correction.setInstructions(event.target.value)}/></label>
    {(correction.error || job?.status === 'failed') && <p className="background-correction-error" role="alert">{correction.error || job?.message}</p>}
    {ready && <p className="background-replacement-note">Le remplacement actualise le fichier dans la bibliothèque et tous les plans qui l’utilisent. Une copie de l’original est conservée avant tout remplacement.</p>}
    {applied && <p>Décor remplacé. <button className="link-button" onClick={correction.revealBackup}>Voir l’original sauvegardé</button></p>}
    <div className="background-correction-actions">
      {!applied && <button className="button subtle" disabled={correction.busy || !prepared || correction.modelUnavailable || (!!correction.codexModel && correction.models.loading)} onClick={() => void correction.generate()}><Icon name="wand" size={15}/>{ready ? 'Générer une autre proposition' : 'Générer le panorama 20:9'}</button>}
      {ready && <><button className="button subtle" disabled={correction.busy} onClick={correction.test}><Icon name="play" size={15}/> Tester dans ce plan</button><button className="button primary" disabled={correction.busy} onClick={() => void correction.apply()}>Remplacer le fichier d’origine</button></>}
      {!applied && <button className="button text" disabled={correction.busy && !['queued', 'generating'].includes(job?.status ?? '')} onClick={() => void correction.discard()}>{['queued', 'generating'].includes(job?.status ?? '') ? 'Annuler la génération' : 'Abandonner'}</button>}
      {applied && <><button className="button text" onClick={() => void correction.discard()}>Retirer de la liste</button><button className="button primary" onClick={correction.close}>Fermer</button></>}
    </div>
  </dialog>;
}

export function BackgroundCorrectionStatus({ correction }: { correction: Controller }) {
  const [expanded, setExpanded] = useState(true);
  if (!correction.entries.length) return null;
  const running = correction.entries.filter(entry => entry.pending || ['queued', 'generating', 'applying'].includes(entry.job?.status ?? '')).length;
  const ready = correction.entries.filter(entry => !entry.pending && entry.job?.status === 'ready').length;
  const failed = correction.entries.filter(entry => entry.job?.status === 'failed' || !!entry.error).length;
  return <section className="background-correction-status" aria-label="Traitements des décors">
    <div className="background-jobs-heading">
      <span role="status" aria-live="polite" aria-atomic="true"><strong>Décors IA · {correction.entries.length}</strong>{running > 0 && ` · ${running} en cours`}{ready > 0 && ` · ${ready} proposition${ready > 1 ? 's' : ''} prête${ready > 1 ? 's' : ''}`}{failed > 0 && ` · ${failed} à vérifier`}</span>
      <button className="button text" aria-expanded={expanded} aria-controls="background-jobs-list" onClick={() => setExpanded(value => !value)}><Icon name={expanded ? 'down' : 'up'} size={13}/>{expanded ? 'Replier le suivi' : 'Afficher les traitements'}</button>
    </div>
    <ul id="background-jobs-list" className="background-jobs-list" hidden={!expanded}>
      {correction.entries.map(entry => {
        const status = entry.job?.status;
        const running = entry.pending || status === 'queued' || status === 'generating' || status === 'applying';
        const label = entry.error ? 'À vérifier' : status === 'failed' ? 'La correction a échoué.' : status === 'applied' ? 'Décor corrigé · original sauvegardé' : running ? (status === 'queued' ? 'En attente dans la file…' : status === 'generating' ? 'Correction Codex en cours…' : status === 'ready' || status === 'applying' ? 'Validation du décor…' : 'Préparation du décor…') : entry.testing ? 'Version corrigée en test' : status === 'ready' ? 'Proposition corrigée disponible' : 'Cadrage à préparer';
        return <li key={entry.id} className="background-job" data-ref={entry.target.asset.ref} aria-label={`Traitement de ${entry.target.asset.name}`}>
          <img src={entry.job?.candidateUrl ?? entry.job?.originalUrl ?? entry.target.asset.thumbnail} alt=""/>
          <div className="background-job-description"><strong title={entry.target.asset.path}>{entry.target.asset.name}</strong><span title={entry.error || entry.job?.message}>{running && <span className="spinner"/>}{label}</span><span className="background-job-model">Modèle Codex : {entry.job ? entry.job.codexModel ?? 'Automatique' : entry.codexModel || 'Automatique'}</span></div>
          <div className="background-job-actions">
            {entry.testing && <button className="button text" onClick={() => correction.original(entry.id)}>Revenir à l’original</button>}
            <button className="button subtle" onClick={() => correction.inspect(entry.id)}>{status === 'applied' ? 'Voir la sauvegarde' : status === 'ready' ? 'Voir la proposition' : 'Rouvrir'}</button>
          </div>
        </li>;
      })}
    </ul>
  </section>;
}
