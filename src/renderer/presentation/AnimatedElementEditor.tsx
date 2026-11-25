import { useState } from 'react';
import type { Asset, AssetRef } from '../../shared/model.js';
import { ELEMENT_LABELS, ELEMENT_PRESETS, type ElementClip, type ElementPreset } from '../../shared/presentation/animatedElements.js';
import { newAnimation } from '../../shared/presentation/factories.js';
import { NumberInput } from '../components/NumberInput.js';
import { StudioDialog } from '../components/StudioDialog.js';
import { AnimatedElementPreview } from './AnimatedElementSprite.js';
import { ImagePicker } from './ImagePicker.js';
import './animatedElements.css';

const presetDefaults = {
  rotate: { duration: 2, loop: true, travel: 0, pivot: { x: 0.5, y: 0.5 } },
  float: { duration: 2.5, loop: true, travel: 1.5, pivot: { x: 0.5, y: 1 } },
  fall: { duration: 1, loop: false, travel: 2, pivot: { x: 0.5, y: 1 } },
  exhale: { duration: 2.4, loop: false, travel: 1.5, pivot: { x: 0.13, y: 0.39 } },
};

export function AnimatedElementEditor({ value, assets, close, save }: {
  value?: ElementClip; assets: Asset[]; close: () => void; save: (clip: ElementClip, editing: boolean) => void;
}) {
  const [clip, setClip] = useState<ElementClip>(() => value ?? {
    ...newAnimation('idle'), name: '', kind: 'combined', scope: 'cinematic', ownerSpeciesId: '',
    duration: presetDefaults.rotate.duration, frames: [],
    element: { preset: 'rotate', travel: 0, pivot: presetDefaults.rotate.pivot },
    motion: { preset: 'none', amplitude: 0, period: 1 },
  });
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [error, setError] = useState('');
  const { preset, pivot, travel, drift, sway, placementHeight } = clip.element;
  const primary = clip.frames[0]?.asset;
  const secondary = clip.frames[1]?.asset;
  const valid = clip.name.trim() && !!primary && assets.some(asset => asset.ref === primary)
    && (!secondary || assets.some(asset => asset.ref === secondary));

  function changePreset(preset: ElementPreset) {
    const { duration, loop, pivot, travel } = presetDefaults[preset];
    setClip({ ...clip, duration, loop, element: { ...clip.element, preset, pivot, travel },
      frames: preset === 'rotate' ? clip.frames.slice(0, 1) : clip.frames });
  }

  function changeImages(base: AssetRef, second?: AssetRef) {
    const refs = second ? [base, second] : [base];
    const asset = assets.find(item => item.ref === base);
    setClip({ ...clip, name: clip.name || asset?.name.slice(0, 160) || '',
      frames: refs.map(ref => ({ asset: ref, duration: clip.duration / refs.length })) });
  }

  return <StudioDialog title={value ? 'Modifier l’élément animé' : 'Créer un élément animé'} onClose={close} wide>
    <div className="animated-element-editor">
      <div className="animated-element-form">
        <label className="field"><span>Nom de l’élément</span><input maxLength={160} value={clip.name}
          onChange={event => setClip({ ...clip, name: event.target.value })}/></label>
        <label className="field"><span>Préréglage</span><select value={preset}
          onChange={event => changePreset(event.target.value as ElementPreset)}>
          {ELEMENT_PRESETS.map(key => <option key={key} value={key}>{ELEMENT_LABELS[key]}</option>)}
        </select></label>
        <ImagePicker label="Image de base" value={primary ? [primary] : []} assets={assets} category="prop"
          change={([ref]) => { if (ref) changeImages(ref as AssetRef, secondary); }}/>
        {preset !== 'rotate' && primary && <>
          <ImagePicker label={preset === 'fall' ? 'Image d’éclaboussure (facultative)' : 'Deuxième volute (facultative)'}
            value={secondary ? [secondary] : []} assets={assets} category="prop"
            change={([ref]) => changeImages(primary, ref as AssetRef | undefined)}/>
          {secondary && <button type="button" className="link-button" onClick={() => changeImages(primary)}>Retirer la deuxième image</button>}
        </>}
        <div className="field-row">
          <label className="field"><span>Durée du cycle (s)</span><NumberInput min={0.1} max={60} value={clip.duration}
            onCommit={duration => setClip({ ...clip, duration })}/></label>
          {preset !== 'rotate' && <label className="field"><span>{preset === 'exhale' ? 'Portée du souffle' : 'Distance verticale'} (% de la hauteur)</span>
            <NumberInput min={0} max={800} value={travel * 100}
              onCommit={value => setClip({ ...clip, element: { ...clip.element, travel: value / 100 } })}/></label>}
        </div>
        {preset === 'float' && <div className="field-row">
          <label className="field"><span>Dérive latérale (% de la hauteur)</span>
            <NumberInput min={-800} max={800} value={(drift ?? 0) * 100}
              onCommit={value => setClip({ ...clip, element: { ...clip.element, drift: value / 100 } })}/></label>
          <label className="field"><span>Balancement (°)</span>
            <NumberInput min={0} max={60} value={sway ?? 0}
              onCommit={value => setClip({ ...clip, element: { ...clip.element, sway: value } })}/></label>
        </div>}
        {(preset === 'rotate' || preset === 'exhale') && <div className="field-row">
          {(['x', 'y'] as const).map(axis => <label className="field" key={axis}>
            <span>{preset === 'exhale'
              ? axis === 'x' ? 'Origine horizontale (%)' : 'Origine verticale (%)'
              : axis === 'x' ? 'Pivot horizontal (%)' : 'Pivot vertical (%)'}</span>
            <NumberInput min={0} max={100} value={pivot[axis] * 100} onCommit={value => {
              setClip({ ...clip, element: { ...clip.element, pivot: { ...pivot, [axis]: value / 100 } } });
              setPlaying(false);
            }}/>
          </label>)}
        </div>}
        <label className="field"><span>Taille à l’insertion (% de la hauteur du plan)</span>
          <NumberInput min={3} max={100} value={(placementHeight ?? 0.43) * 100}
            onCommit={value => setClip({ ...clip, element: { ...clip.element, placementHeight: value / 100 } })}/></label>
        <label className="check-field"><input type="checkbox" checked={clip.loop}
          onChange={event => setClip({ ...clip, loop: event.target.checked })}/> Boucle par défaut</label>
      </div>
      <div className="animated-element-editor-preview">
        {primary ? <AnimatedElementPreview clip={clip} assets={assets} playing={playing} showPivot/>
          : <p className="field-hint">Choisis une image de base pour voir le mouvement.</p>}
        <button type="button" className="button subtle" disabled={!primary} onClick={() => setPlaying(!playing)}>
          {playing ? 'Arrêter l’aperçu' : 'Animer l’aperçu'}</button>
      </div>
    </div>
    <div className="modal-actions animated-element-actions">
      {error && <p role="alert">{error}</p>}
      <button type="button" className="button subtle" onClick={close}>Annuler</button>
      <button type="button" className="button primary" disabled={!valid} onClick={() => {
        try {
          save({ ...clip, name: clip.name.trim(), frames: clip.frames.map(frame => ({
            ...frame, duration: clip.duration / clip.frames.length,
          })) }, !!value);
        } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
      }}>Enregistrer l’élément</button>
    </div>
  </StudioDialog>;
}
