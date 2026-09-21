import React from 'react';
import type {GameProject} from '../../shared/game/types.js';
import type {CatalogLink} from '../../shared/presentation/types.js';
import {ActorBindingFields} from '../presentation/PresentationFields.js';
import type { Actor, Asset, Bubble, Cinematic, Shot } from '../../shared/model.js';
import { TextAnimationInspector } from './TextAnimationInspector.js';
import { ExitInspector } from './ExitInspector.js';
import { MotionInspector } from './MotionInspector.js';
import { NumberInput } from './NumberInput.js';
import { centeredObject, proportionalSize } from '../../shared/editing.js';
import { bubbleLayout } from '../../shared/geometry.js';
import type { Selection } from './Scene.js';
import { Icon } from './Icon.js';
export const cameraLabels = { fixed: 'Fixe', zoom_in: 'Zoom lent avant', zoom_out: 'Zoom lent arrière', pan_left: 'Travelling vers la gauche', pan_right: 'Travelling vers la droite', pan_up: 'Montée lente', pan_down: 'Descente lente' };
const entryLabels = { none: 'Déjà présent', fade: 'Fondu', left: 'Depuis la gauche', right: 'Depuis la droite', bottom: 'Depuis le bas', top: 'Depuis le haut', pop: 'Pop · apparition rebondie', zoom: 'Grandissement doux' };
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}
interface Props {
  presentationProject:GameProject;setCatalog:(value:CatalogLink)=>void;
  previewMotion: () => void; previewText: (id: string) => void;
  children?: React.ReactNode; multiCount?: number; objectLocked?: boolean; autoPlace?: () => void;
  doc: Cinematic; shot: Shot; selection: Selection; assets: Asset[]; disabled: boolean;
  updateShot: (patch: Partial<Shot>, key?: string) => void;
  updateObject: (kind: 'actor' | 'bubble', id: string, patch: Partial<Actor> | Partial<Bubble>, key?: string) => void;
  select: (s: Selection) => void; remove: () => void; duplicate: () => void;
  layer: (direction: number) => void; moveBubble: (id: string, direction: number) => void;
}
export function Inspector(p: Props) {
  const selectedId = p.selection.kind === 'shot' ? null : p.selection.id;
  const actor = (p.multiCount??0)<=1 && p.selection.kind === 'actor' ? p.shot.actors.find(a => a.id === selectedId) : undefined;
  const bubble = (p.multiCount??0)<=1 && p.selection.kind === 'bubble' ? p.shot.bubbles.find(b => b.id === selectedId) : undefined;
  const changeActor = (patch: Partial<Actor>, key = '') => actor && p.updateObject('actor', actor.id, patch, key);
  const changeBubble = (patch: Partial<Bubble>, key = '') => bubble && p.updateObject('bubble', bubble.id, patch, key);
  function setStyle(style: Bubble['style']) {
    if (style === 'simple' || style === 'ornate') {
      const name = style === 'simple' ? 'dialogue_panel_simple_v01.png' : 'tooltip_ornate_v01.png';
      const asset = p.assets.find(a => a.path.endsWith(name));
      if (asset) changeBubble({ style, frameAsset: asset.ref, autoHeight: true });
    } else changeBubble({ style, frameAsset: null });
  }
  const textureExists = (s: string) => p.assets.some(a => a.path.endsWith(s));
  return <aside className="inspector panel">
    <div className="panel-heading"><span>{actor ? actor.role === 'enemy' ? 'ENNEMI' : actor.role === 'prop' ? 'OBJET DE DÉCORATION' : 'PERSONNAGE' : bubble ? 'BULLE DE DIALOGUE' : 'MISE EN SCÈNE'}</span><Icon name={actor ? actor.role === 'enemy' ? 'enemy' : actor.role === 'prop' ? 'prop' : 'actor' : bubble ? 'bubble' : 'camera'} size={16}/></div>
    {p.children}
    {p.objectLocked && <p className="locked-note"><Icon name="lock" size={13}/> Calque verrouillé. Déverrouille-le dans la liste pour le modifier.</p>}
    <fieldset disabled={p.disabled || p.objectLocked} className="inspector-content">
      <div className="inspector-title"><span className="overline">{actor ? 'DANS CE PLAN' : bubble ? `RÉPLIQUE ${p.shot.bubbles.indexOf(bubble) + 1}` : `PLAN ${String(p.doc.shots.indexOf(p.shot) + 1).padStart(2, '0')}`}</span><h2>{actor ? actor.name : bubble ? bubble.kind === 'narration' ? 'Narration' : 'Une voix dans la scène' : p.shot.name}</h2></div>
      {(p.multiCount??0)>1 && <div className="multi-selection-note"><h3>{p.multiCount} éléments sélectionnés</h3><p>Déplace le groupe directement dans la scène. Les commandes d’alignement sont au-dessus ; Dupliquer et Supprimer agissent sur toute la sélection.</p><small>Les calques verrouillés ne sont pas modifiés.</small></div>}
      {!actor && !bubble && (p.multiCount??0)<=1 && <>
        <Field label="Nom du plan"><input maxLength={180} value={p.shot.name} onChange={e => p.updateShot({ name: e.target.value }, 'shot-name')}/></Field>
        <div className="field-row"><Field label="Durée minimale"><div className="unit-input"><NumberInput label="Durée du plan" min={1} max={300} value={p.shot.duration} onCommit={n => p.updateShot({ duration: n, dialogueStart: Math.min(p.shot.dialogueStart, n), transition: { ...p.shot.transition, duration: Math.min(p.shot.transition.duration, n) } }, 'duration')}/><span>s</span></div></Field><Field label="Format"><div className="readonly-value">16 : 9</div></Field></div>
        <p className="field-hint">Le plan attend la fin des répliques avant de continuer.</p><Field label="Début des dialogues (s)"><NumberInput label="Début des dialogues" min={0} max={p.shot.duration} value={p.shot.dialogueStart} onCommit={dialogueStart => p.updateShot({ dialogueStart }, 'dialogue-start')}/></Field>
        <div className="section-label"><Icon name="camera" size={15}/> CAMÉRA</div>
        <Field label="Mouvement"><select value={p.shot.camera.preset} onChange={e => p.updateShot({ camera: { ...p.shot.camera, preset: e.target.value as Shot['camera']['preset'] } })}>{Object.entries(cameraLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field>
        {p.shot.camera.preset !== 'fixed' && <Field label="Intensité"><input aria-label="Intensité caméra" type="range" min="0" max="1" step="0.05" value={p.shot.camera.intensity} onChange={e => p.updateShot({ camera: { ...p.shot.camera, intensity: +e.target.value } }, 'camera-intensity')}/><div className="range-labels"><span>Discret</span><span>Marqué</span></div></Field>}
        <div className="section-label"><Icon name="layers" size={15}/> TRANSITION D’ENTRÉE</div>
        <div className="segmented"><button className={p.shot.transition.type === 'cut' ? 'active' : ''} onClick={() => p.updateShot({ transition: { type: 'cut', duration: 0 } })}>Coupe</button><button className={p.shot.transition.type === 'fade' ? 'active' : ''} onClick={() => p.updateShot({ transition: { type: 'fade', duration: Math.min(0.6, p.shot.duration) } })}>Depuis le noir</button></div>
        {p.shot.transition.type === 'fade' && <Field label="Durée du fondu"><div className="unit-input"><NumberInput min={0.1} max={Math.min(3, p.shot.duration)} value={p.shot.transition.duration} onCommit={duration => p.updateShot({ transition: { type: 'fade', duration } }, 'fade-duration')}/><span>s</span></div></Field>}
        <div className="section-label"><Icon name="image" size={15}/> DÉCOR</div>
        <p className="asset-reference" title={p.shot.background.asset ?? ''}>{p.shot.background.asset?.split('/').pop() ?? 'Aucun décor sélectionné'}</p>
        <Field label="Cadrage"><select value={p.shot.background.fit} onChange={e => p.updateShot({ background: { ...p.shot.background, fit: e.target.value as 'cover' | 'contain' } })}><option value="cover">Remplir le cadre</option><option value="contain">Afficher l’image entière</option></select></Field>
        {!!p.shot.background.asset && <button className="link-button" onClick={() => p.updateShot({ background: { ...p.shot.background, asset: null } })}>Retirer le décor</button>}
        {p.shot.audio && <><div className="section-label"><Icon name="music" size={15}/> AUDIO DU PLAN</div><p className="asset-reference">{p.shot.audio.asset.split('/').pop()}</p><Field label="Volume"><input type="range" min="0" max="1" step="0.05" value={p.shot.audio.volume} onChange={e => p.updateShot({ audio: { ...p.shot.audio!, volume: +e.target.value } }, 'volume')}/></Field><label className="check-field"><input type="checkbox" checked={p.shot.audio.loop} onChange={e => p.updateShot({ audio: { ...p.shot.audio!, loop: e.target.checked } })}/> Lire en boucle</label><button className="link-button" onClick={() => p.updateShot({ audio: null })}>Retirer l’audio</button></>}
      </>}
      {actor && <>
        <Field label={actor.role === 'enemy' ? "Nom de l’ennemi" : actor.role === 'prop' ? "Nom de l’objet" : "Nom du personnage"}><input maxLength={180} value={actor.name} onChange={e => changeActor({ name: e.target.value }, 'actor-name')}/></Field>
        <Field label="Type d’élément"><select aria-label="Type d’élément" value={actor.role ?? 'character'} onChange={e => changeActor({role: e.target.value as Actor['role']})}><option value="character">Personnage</option><option value="enemy">Ennemi</option><option value="prop">Objet de décoration</option></select></Field>
        <button className="button subtle full" onClick={() => changeActor(centeredObject(actor))}>Recentrer dans le cadre</button><p className="field-hint">Déplace-le dans l’image. Les poignées conservent ses proportions.</p>
        <Field label="Taille"><input type="range" min="0.03" max="2" step="0.01" value={actor.height} onChange={e => { changeActor(proportionalSize(actor.width, actor.height, +e.target.value / actor.height), 'actor-size'); }}/></Field>
        <button className={`button subtle full ${actor.flipX ? 'toggled' : ''}`} onClick={() => changeActor({ flipX: !actor.flipX })}><Icon name="flip" size={16}/> Retourner horizontalement</button>
        <div className="field-row"><button className="button subtle" disabled={p.shot.actors.indexOf(actor) === 0} onClick={() => p.layer(-1)}>Derrière</button><button className="button subtle" disabled={p.shot.actors.indexOf(actor) === p.shot.actors.length - 1} onClick={() => p.layer(1)}>Devant</button></div>
        <details className="motion-precision"><summary>Orientation et transparence</summary>
          <Field label="Rotation (°)"><NumberInput label="Rotation de l’élément" min={-180} max={180} value={actor.rotation ?? 0} onCommit={rotation => changeActor({rotation}, 'actor-rotation')}/></Field>
          <Field label="Opacité"><input aria-label="Opacité de l’élément" type="range" min={0} max={1} step={0.05} value={actor.opacity} onChange={e => changeActor({opacity: +e.target.value}, 'actor-opacity')}/></Field>
        </details>
        <MotionInspector actor={actor} change={changeActor} preview={p.previewMotion}/>
        <div className="section-label"><Icon name="actor" size={15}/> APPARITION</div>
        <Field label="Entrée"><select value={actor.entry.preset} onChange={e => changeActor({ entry: { ...actor.entry, preset: e.target.value as Actor['entry']['preset'] } })}>{Object.entries(entryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
        {actor.entry.preset !== 'none' && <div className="field-row"><Field label="Durée (s)"><NumberInput min={0.1} max={10} value={actor.entry.duration} onCommit={duration => changeActor({ entry: { ...actor.entry, duration } }, 'entry-duration')}/></Field><Field label="Délai (s)"><NumberInput min={0} max={300} value={actor.entry.delay} onCommit={delay => changeActor({ entry: { ...actor.entry, delay } }, 'entry-delay')}/></Field></div>}
        <ExitInspector actor={actor} change={changeActor} duration={p.shot.duration} preview={p.previewMotion}/>
        <p className="field-hint">Les effets animent le PNG entier, pas une marche articulée. Ils fonctionnent aussi pour les ennemis et les objets.</p>
        <ActorBindingFields actor={actor} doc={p.doc} project={p.presentationProject} change={changeActor} setCatalog={p.setCatalog}/>
        <div className="section-label">SOURCE PARTAGÉE</div><p className="asset-reference">{actor.asset}</p>
      </>}
      {bubble && <>
        <div className="segmented"><button className={bubble.kind === 'speech' ? 'active' : ''} onClick={() => changeBubble({ kind: 'speech', tail: { ...bubble.tail, mode: bubble.speakerId ? 'auto' : 'manual' } })}>Dialogue</button><button className={bubble.kind === 'narration' ? 'active' : ''} onClick={() => changeBubble({ kind: 'narration', tail: { ...bubble.tail, mode: 'none' } })}>Narration</button></div>
        {bubble.kind === 'speech' && <Field label="Qui parle ?"><select aria-label="Personnage de la bulle" value={bubble.speakerId ?? ''} onChange={e => changeBubble({ speakerId: e.target.value || null, tail: { ...bubble.tail, mode: e.target.value ? 'auto' : 'manual' } })}><option value="">Bulle libre</option>{p.shot.actors.map(a => <option key={a.id} value={a.id}>{a.name}{a.role === 'enemy' ? ' (ennemi)' : ''}</option>)}</select></Field>}
        <button className="button subtle full" onClick={() => changeBubble(centeredObject({ ...bubble, height: bubbleLayout(bubble).height / 900 }))}>Recentrer la bulle</button><button className="button subtle full" onClick={p.autoPlace}><Icon name="wand" size={15}/> Placer automatiquement</button><Field label="Texte"><textarea aria-label="Texte de la bulle" value={bubble.text} maxLength={1500} rows={5} onChange={e => changeBubble({ text: e.target.value }, 'bubble-text')}/><small className="counter">{bubble.text.length} caractères</small></Field>
        <Field label="Apparence"><select aria-label="Style de la bulle" value={bubble.style} onChange={e => setStyle(e.target.value as Bubble['style'])}><option value="parchment">Lunaria · parchemin</option><option value="plain">BD · fond clair</option><option value="simple" disabled={!textureExists('dialogue_panel_simple_v01.png')}>Ton cadre · organique</option><option value="ornate" disabled={!textureExists('tooltip_ornate_v01.png')}>Ton cadre · orné</option></select></Field>
        <label className="check-field"><input type="checkbox" checked={bubble.autoHeight} onChange={e => changeBubble({ autoHeight: e.target.checked, height: bubbleLayout(bubble).height / 900 })}/> Adapter la hauteur au texte</label>
        {bubbleLayout(bubble).overflow && <p className="inline-warning"><Icon name="warning" size={15}/> Le texte dépasse : agrandis la bulle.</p>}
        {bubble.kind === 'speech' && <Field label="Queue de la bulle"><select value={bubble.tail.mode} onChange={e => changeBubble({ tail: { ...bubble.tail, mode: e.target.value as Bubble['tail']['mode'] } })}><option value="auto" disabled={!bubble.speakerId}>Reliée à celui qui parle</option><option value="manual">Point libre, à déplacer</option><option value="none">Sans queue</option></select><small>Déplace le point à l’extrémité de la queue pour l’orienter librement.</small></Field>}
        <TextAnimationInspector bubble={bubble} change={changeBubble} preview={() => p.previewText(bubble.id)}/>
        <div className="section-label"><Icon name="play" size={14}/> LECTURE</div>
        <label className="check-field"><input type="checkbox" checked={bubble.advance.mode === 'click'} onChange={e => changeBubble({ advance: { ...bubble.advance, mode: e.target.checked ? 'click' : 'auto' } })}/> Attendre le clic du joueur</label>
        {bubble.advance.mode === 'auto' && <Field label={bubble.textAnimation ? "Temps de lecture après l’animation (s)" : "Afficher pendant (secondes)"}><NumberInput min={0.5} max={120} value={bubble.advance.seconds} onCommit={seconds => changeBubble({ advance: { ...bubble.advance, seconds } }, 'dialogue-duration')}/></Field>}
        <details className="advanced"><summary>Réglages du texte</summary><Field label="Taille du texte"><input type="range" min="18" max="72" step="1" value={bubble.fontSize} onChange={e => changeBubble({ fontSize: +e.target.value }, 'font-size')}/><small>{bubble.fontSize} px dans la scène de référence</small></Field></details>
      </>}
    </fieldset>
    <div className="inspector-actions"><button className="button subtle" onClick={p.duplicate} disabled={p.disabled || p.objectLocked}><Icon name="duplicate" size={15}/> Dupliquer</button><button className="icon-button danger" onClick={p.remove} disabled={p.disabled || p.objectLocked || ((p.multiCount??0)<=1 && !actor && !bubble && p.doc.shots.length === 1)} title="Supprimer la sélection" aria-label="Supprimer la sélection"><Icon name="trash"/></button></div>
  </aside>;
}
