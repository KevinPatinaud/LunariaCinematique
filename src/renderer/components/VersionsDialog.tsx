import React, { useState } from 'react';
import type { VersionSummary } from '../../shared/model.js';
import { StudioDialog } from './StudioDialog.js';
import { Icon } from './Icon.js';
export function VersionsDialog({versions,onCreate,onRestore,onClose,busy,desktop}:{versions:VersionSummary[];onCreate:(label:string)=>void;onRestore:(id:string)=>void;onClose:()=>void;busy:boolean;desktop:boolean}) {
  const [selected,setSelected]=useState<string|null>(null),[label,setLabel]=useState('Point de repère');
  return <StudioDialog title="Versions locales" onClose={onClose} disabled={busy} wide>
    <p className="dialog-intro">Jusqu’à 20 versions par document. Une version automatique au plus toutes les 30 secondes quand tu modifies la scène, et aux enregistrements. Les images ne sont jamais copiées.</p>
    {!desktop&&<p className="inline-warning">Mode navigateur : historique dans le stockage du navigateur, pas dans des fichiers. L’application Electron conserve ces versions sur disque.</p>}
    <div className="version-create"><input aria-label="Nom du point de repère" maxLength={120} value={label} disabled={busy} onChange={e=>setLabel(e.target.value)}/><button className="button subtle" disabled={busy||!label.trim()} onClick={()=>onCreate(label.trim())}><Icon name="plus" size={15}/> Créer un repère</button></div>
    <div className="version-list" role="list" aria-label="Historique local">{versions.map(v=><button role="listitem" key={v.id} className={`version-row ${selected===v.id?'selected':''}`} disabled={busy} onClick={()=>setSelected(v.id)}>
      <Icon name="history" size={19}/><span><strong>{v.label}</strong><small>{new Date(v.createdAt).toLocaleString('fr-FR')} · {v.shots} plan{v.shots>1?'s':''} · {v.title}</small><code title={v.libraryRoot}>{v.libraryRoot||'Bibliothèque non connectée'}</code></span><span className="version-choice">{selected===v.id?'Sélectionnée':'Choisir'}</span>
    </button>)}{!versions.length&&<p className="empty-state">{busy?'Chargement des versions…':'Aucune version locale pour cette cinématique. Crée un premier repère.'}</p>}</div>
    <p className="field-hint">Restaurer conserve d’abord une copie de l’état actuel et remplace seulement le brouillon ouvert. Le fichier source n’est pas écrasé : utilise ensuite Enregistrer. Ctrl+Z annule la restauration.</p>
    <div className="modal-actions"><button className="button subtle" disabled={busy} onClick={onClose}>Fermer</button><button className="button primary" disabled={busy||!versions.some(v=>v.id===selected)} onClick={()=>selected&&onRestore(selected)}><Icon name="undo" size={16}/> Restaurer cette version</button></div>
  </StudioDialog>;
}
