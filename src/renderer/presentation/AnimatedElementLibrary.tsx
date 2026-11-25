import { useState } from 'react';
import type { Asset } from '../../shared/model.js';
import { ASSET_KIND_MIME, ASSET_MIME } from '../../shared/assets.js';
import { normalizeSearch } from '../../shared/libraryBrowser.js';
import { ELEMENT_LABELS, type ElementClip } from '../../shared/presentation/animatedElements.js';
import { Icon } from '../components/Icon.js';
import { AnimatedElementPreview } from './AnimatedElementSprite.js';
import './animatedElements.css';

export interface ElementLibraryActions {
  clips: ElementClip[];
  open: (id?: string) => void;
  insert: (id: string, position?: { x: number; y: number }) => Promise<boolean>;
}

export function AnimatedElementLibrary({ actions, assets, disabled, query, close }: {
  actions: ElementLibraryActions; assets: Asset[]; disabled: boolean; query: string; close?: () => void;
}) {
  const [selectedId, setSelectedId] = useState('');
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [inserting, setInserting] = useState(false);
  const results = actions.clips.filter(clip => normalizeSearch(`${clip.name} ${ELEMENT_LABELS[clip.element.preset]}`)
    .includes(normalizeSearch(query)));
  const selected = results.find(clip => clip.id === selectedId) ?? results[0];
  const add = async (id: string) => {
    if (disabled || inserting) return;
    setInserting(true);
    try { if (await actions.insert(id)) close?.(); }
    finally { setInserting(false); }
  };
  return <div className="animated-element-library">
    <button className="button primary full" disabled={disabled} onClick={() => { close?.(); actions.open(); }}>
      <Icon name="plus" size={14}/> Créer un élément animé
    </button>
    <div className="animated-element-list" aria-label="Éléments animés disponibles">
      {results.map(clip => {
        const poster = assets.find(asset => asset.ref === clip.frames[0]?.asset);
        return <button className="animated-element-tile" key={clip.id} aria-pressed={selected?.id === clip.id}
          disabled={disabled || inserting} draggable={!disabled && !inserting}
          onClick={() => setSelectedId(clip.id)} onDoubleClick={() => void add(clip.id)}
          onDragStart={event => {
            setSelectedId(clip.id);
            event.dataTransfer.setData(ASSET_MIME, clip.id);
            event.dataTransfer.setData(ASSET_KIND_MIME, 'animated');
            event.dataTransfer.effectAllowed = 'copy';
          }}>
          <span className="animated-element-thumb checker">{poster && <img src={poster.thumbnail} alt="" draggable={false}/>}</span>
          <span><strong>{clip.name}</strong><small>{ELEMENT_LABELS[clip.element.preset]}</small></span>
        </button>;
      })}
    </div>
    {selected ? <div className="animated-element-selection">
      <AnimatedElementPreview key={selected.id} clip={selected} assets={assets} playing={playing && !disabled}/>
      <div className="animated-element-toolbar">
        <button className="button subtle" disabled={disabled} onClick={() => setPlaying(!playing)}>
          {playing ? 'Arrêter l’aperçu' : 'Animer l’aperçu'}
        </button>
        <button className="button subtle" disabled={disabled} onClick={() => { close?.(); actions.open(selected.id); }}>Modifier</button>
        <button className="button primary" disabled={disabled || inserting} onClick={() => void add(selected.id)}>Ajouter au plan</button>
      </div>
    </div> : <p className="field-hint">{query ? 'Aucun élément ne correspond à cette recherche.' : 'Choisis une image fixe pour créer ton premier élément.'}</p>}
  </div>;
}
