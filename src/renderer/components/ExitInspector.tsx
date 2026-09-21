import React from 'react';
import type {Actor, ExitPreset} from '../../shared/model.js';
import {NumberInput} from './NumberInput.js';
import {Icon} from './Icon.js';
const labels: Record<ExitPreset, string> = {none: 'Reste dans la scène', fade: 'Fondu', left: 'Vers la gauche',
  right: 'Vers la droite', top: 'Vers le haut', bottom: 'Vers le bas', shrink: 'Rétrécissement'};
export function ExitInspector({actor, change, duration, preview}: {actor: Actor; change: (p: Partial<Actor>, key?: string) => void; duration: number; preview: () => void}) {
  const exit = actor.exit ?? {preset: 'none' as const, start: Math.max(0, duration - 1), duration: 0.8};
  return <section aria-label="Sortie de l’élément">
    <div className="section-label"><Icon name="motion" size={15}/> DISPARITION</div>
    <label className="field"><span>Sortie</span><select aria-label="Animation de sortie" value={exit.preset}
      onChange={e => change({exit: {...exit, preset: e.target.value as ExitPreset}})}>
      {Object.entries(labels).map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></label>
    {exit.preset !== 'none' && <><div className="field-row">
      <label className="field"><span>Début dans le plan (s)</span><NumberInput label="Début de la sortie" min={0} max={300} value={exit.start} onCommit={start => change({exit: {...exit, start}}, 'exit-start')}/></label>
      <label className="field"><span>Durée (s)</span><NumberInput label="Durée de la sortie" min={0.1} max={10} value={exit.duration} onCommit={duration => change({exit: {...exit, duration}}, 'exit-duration')}/></label>
    </div><p className="field-hint">Comptée depuis le début du plan. Une fois sorti, l’élément reste invisible.</p>
      {exit.start + exit.duration > duration && <p className="inline-warning">La sortie dépasse la durée minimale du plan. Allonge le plan pour la voir entièrement sans attente de dialogue.</p>}
    </>}
    <button className="button subtle full" onClick={preview}><Icon name="play" size={14}/> Tester les animations de l’élément</button>
  </section>;
}
