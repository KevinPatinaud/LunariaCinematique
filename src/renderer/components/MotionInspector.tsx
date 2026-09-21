import React from 'react';
import type { Actor, MotionPreset, ObjectMovement, Pivot } from '../../shared/model.js';
import { motionLabels, newMotion, newMovement, entryEnd } from '../../shared/motion.js';
import { NumberInput } from './NumberInput.js';
import { Icon } from './Icon.js';
function Field({label, children}: {label: string; children: React.ReactNode}) {
  return <label className="field"><span>{label}</span>{children}</label>;
}
export function MotionInspector({actor, change, preview}: {
  actor: Actor; change: (patch: Partial<Actor>, key?: string) => void; preview: () => void;
}) {
  const movement = actor.movement ?? newMovement(actor), effect = actor.motion ?? newMotion('none');
  const travel = (patch: Partial<ObjectMovement>, key = '') => change({movement: {...movement, ...patch}}, key);
  return <section className="motion-inspector" aria-label="Mouvements de l’élément">
    <div className="section-label"><Icon name="motion" size={15}/> MOUVEMENTS</div>
    <label className="check-field"><input type="checkbox" aria-label="Activer le déplacement A vers B" checked={!!actor.movement?.enabled}
      onChange={e => travel({enabled: e.target.checked})}/> Déplacement A → B</label>
    {actor.movement?.enabled && <div className="motion-group">
      <p className="field-hint">Place l’élément au départ, puis glisse la poignée <b>B</b> dans la scène pour choisir sa destination.</p>
      <div className="field-row"><Field label="Durée du trajet (s)"><NumberInput label="Durée du déplacement" min={0.1} max={300} value={movement.duration} onCommit={duration => travel({duration}, 'movement-duration')}/></Field>
        <Field label="Délai (s)"><NumberInput label="Délai du déplacement" min={0} max={300} value={movement.delay} onCommit={delay => travel({delay}, 'movement-delay')}/></Field></div>
      <Field label="Parcours"><select aria-label="Répétition du déplacement" value={movement.repeat} onChange={e => travel({repeat: e.target.value as ObjectMovement['repeat']})}>
        <option value="once">Aller simple · reste à l’arrivée</option><option value="pingpong">Aller-retour en boucle</option></select></Field>
      <Field label="Vitesse"><select aria-label="Progression du déplacement" value={movement.easing} onChange={e => travel({easing: e.target.value as ObjectMovement['easing']})}>
        <option value="smooth">Départ et arrêt en douceur</option><option value="linear">Vitesse constante</option></select></Field>
      <details className="motion-precision"><summary>Ajuster la destination</summary><div className="field-row">
        <Field label="Décalage X (%)"><NumberInput label="Décalage horizontal" min={-300} max={300} value={Math.round(movement.dx * 10000) / 100} onCommit={n => travel({dx: n / 100}, 'movement-x')}/></Field>
        <Field label="Décalage Y (%)"><NumberInput label="Décalage vertical" min={-300} max={300} value={Math.round(movement.dy * 10000) / 100} onCommit={n => travel({dy: n / 100}, 'movement-y')}/></Field></div>
        <button className="link-button" onClick={() => travel({dx: 0, dy: 0})}>Ramener B au point de départ</button></details>
    </div>}
    <Field label="Effet d’animation"><select aria-label="Effet de mouvement" value={effect.preset} onChange={e => {
      const preset = e.target.value as MotionPreset;
      change({motion: newMotion(preset), ...(preset === 'sway' && !actor.pivot ? {pivot: actor.role === 'prop' ? 'top' as const : 'bottom' as const} : {})});
    }}>{Object.entries(motionLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field>
    {effect.preset !== 'none' && <div className="motion-group">
      {effect.preset !== 'spin' && <Field label="Amplitude"><input type="range" aria-label="Amplitude du mouvement" min={0} max={1} step={0.05} value={effect.intensity}
        onChange={e => change({motion: {...effect, intensity: +e.target.value}}, 'motion-intensity')}/><div className="range-labels"><span>Discret</span><span>Marqué</span></div></Field>}
      <div className="field-row"><Field label="Un cycle (s)"><NumberInput label="Durée du cycle" min={0.2} max={60} value={effect.period} onCommit={period => change({motion: {...effect, period}}, 'motion-period')}/></Field>
        <Field label="Délai (s)"><NumberInput label="Délai de l’effet" min={0} max={300} value={effect.delay} onCommit={delay => change({motion: {...effect, delay}}, 'motion-delay')}/></Field></div>
      <label className="check-field"><input type="checkbox" aria-label="Répéter l’effet" checked={effect.loop} onChange={e => change({motion: {...effect, loop: e.target.checked}})}/> Répéter en boucle</label>
      {effect.preset !== 'bounce' && <label className="check-field"><input type="checkbox" aria-label="Inverser l’effet" checked={effect.reverse} onChange={e => change({motion: {...effect, reverse: e.target.checked}})}/> Inverser le sens</label>}
    </div>}
    {(effect.preset === 'sway' || effect.preset === 'spin' || effect.preset === 'pulse' || effect.preset === 'nod' || effect.preset === 'heartbeat' || effect.preset === 'recoil' || effect.preset === 'flutter' || !!actor.rotation) && <Field label="Point d’appui"><select aria-label="Point d’appui" value={actor.pivot ?? 'center'} onChange={e => change({pivot: e.target.value as Pivot})}>
      <option value="center">Centre</option><option value="top">Haut · suspendu</option><option value="bottom">Bas · posé au sol</option></select></Field>}
    {(actor.movement?.enabled || effect.preset !== 'none') && <>
      <p className="field-hint">{entryEnd(actor) > 0 ? `Démarre après l’entrée (${entryEnd(actor).toFixed(1)} s), puis le délai choisi.` : 'Les délais sont comptés depuis le début du plan.'} Le trajet et l’effet se combinent.</p>
      <button className="button primary full" onClick={preview}><Icon name="play" size={14}/> Tester les mouvements</button>
    </>}
  </section>;
}
