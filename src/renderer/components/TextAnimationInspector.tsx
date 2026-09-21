import React from 'react';
import type {Bubble, TextAnimation, TextEffect, TextReveal} from '../../shared/model.js';
import {newTextAnimation, revealLabels, textEffectLabels, textIntroDuration} from '../../shared/textAnimation.js';
import {NumberInput} from './NumberInput.js';
import {Icon} from './Icon.js';
export function TextAnimationInspector({bubble, change, preview}: {bubble: Bubble; change: (p: Partial<Bubble>, key?: string) => void; preview: () => void}) {
  const a = bubble.textAnimation ?? newTextAnimation('instant');
  const patch = (values: Partial<TextAnimation>, key='') => change({textAnimation: {...a, ...values}}, key);
  return <section className="text-animation-inspector" aria-label="Animations du texte">
    <div className="section-label"><Icon name="wand" size={15}/> ANIMATION DU TEXTE</div>
    <div className="animation-presets" role="group" aria-label="Préréglages du texte">
      <button onClick={() => change({textAnimation: newTextAnimation('typewriter')})}>Écriture</button>
      <button onClick={() => change({textAnimation: newTextAnimation('words')})}>Mot par mot</button>
      <button className="shout-preset" onClick={() => change({textAnimation: newTextAnimation('instant', 'shout')})}>Cri !</button>
      <button onClick={() => change({textAnimation: newTextAnimation('instant')})}>Sans animation</button>
    </div>
    <label className="field"><span>Apparition du texte</span><select aria-label="Apparition du texte" value={a.reveal}
      onChange={e => { const reveal = e.target.value as TextReveal; patch({reveal, speed: reveal === 'words' ? 3 : 32}); }}>
      {Object.entries(revealLabels).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></label>
    {(a.reveal === 'typewriter' || a.reveal === 'words') && <label className="field">
      <span>{a.reveal === 'words' ? 'Mots par seconde' : 'Caractères par seconde'}</span>
      <NumberInput label="Vitesse d’écriture" min={0.5} max={120} value={a.speed} onCommit={speed => patch({speed}, 'text-speed')}/>
    </label>}
    <label className="field"><span>Expression des lettres</span><select aria-label="Effet du texte" value={a.effect}
      onChange={e => {const effect=e.target.value as TextEffect; const d=newTextAnimation(a.reveal,effect); patch({effect,duration:d.duration,loop:d.loop});}}>
      {Object.entries(textEffectLabels).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></label>
    {a.effect !== 'none' && <label className="field"><span>Intensité</span><input aria-label="Intensité de l’effet du texte" type="range" min={0} max={1} step={0.05} value={a.intensity} onChange={e => patch({intensity:+e.target.value}, 'text-intensity')}/>
      <div className="range-labels"><span>Discret</span><span>Expressif</span></div></label>}
    <div className="field-row">
      {(a.reveal === 'fade' || a.effect !== 'none') && <label className="field"><span>{a.effect === 'shout' ? 'Durée du cri (s)' : 'Durée / cycle (s)'}</span><NumberInput label="Durée de l’effet du texte" min={0.1} max={10} value={a.duration} onCommit={duration => patch({duration}, 'text-duration')}/></label>}
      <label className="field"><span>Délai de départ (s)</span><NumberInput label="Délai du texte" min={0} max={30} value={a.delay} onCommit={delay => patch({delay}, 'text-delay')}/></label>
    </div>
    {a.effect !== 'none' && a.effect !== 'shout' && <label className="check-field"><input aria-label="Répéter l’effet du texte" type="checkbox" checked={a.loop} onChange={e => patch({loop:e.target.checked})}/> Répéter l’expression en boucle</label>}
    {a.effect === 'shout' && <p className="field-hint">Les lettres jaillissent, s’écartent puis reprennent leur place. Le texte reste lisible ; la bulle ne bouge pas.</p>}
    <p className="field-hint">Départ à l’apparition de cette réplique. Un clic termine l’apparition, le suivant passe à la suite. En automatique, le temps de lecture commence ensuite.</p>
    <button className="button primary full" onClick={preview}><Icon name="play" size={14}/> Tester ce texte</button>
    <small className="animation-duration">Apparition complète : {textIntroDuration(bubble).toLocaleString('fr-FR', {maximumFractionDigits:1})} s</small>
  </section>;
}
