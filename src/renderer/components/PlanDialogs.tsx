import React, { useState } from 'react';
import type { Shot } from '../../shared/model.js';
import type { DuplicateOptions, ShotTemplate } from '../../shared/studio.js';
import { StudioDialog } from './StudioDialog.js';
import { Icon } from './Icon.js';
export function TemplateDialog({shot,onCreate,onClose,disabled}:{shot:Shot;onCreate:(template:ShotTemplate,speakers:string[])=>void;onClose:()=>void;disabled:boolean}) {
  const [template,setTemplate]=useState<ShotTemplate>('continue');
  const speakers=shot.actors.filter(a=>a.role!=='prop');
  const [first,setFirst]=useState(speakers[0]?.id??''),[second,setSecond]=useState(speakers[1]?.id??'');
  const cards:readonly [ShotTemplate,string,string,string][]=[
    ['continue','layers','Continuer ce plan','Même décor, mêmes positions. Sans répliques ni nouvelle entrée.'],
    ['blank','plus','Plan vide','Le décor est conservé ; aucun personnage ni dialogue.'],
    ['establishing','camera','Vue d’ensemble','Décor seul et zoom lent pour installer le lieu.'],
    ['dialogue','bubble','Dialogue à deux','Deux bulles liées à des personnages ou ennemis déjà placés.'],
    ['entrance','actor','Entrée de personnage','Le personnage ou ennemi choisi arrive depuis la gauche.'],
    ['narration','file','Narration','Même scène, avec un cartouche de narration.']
  ];
  const invalid=template==='dialogue'?(!first||!second||first===second):template==='entrance'?!first:false;
  return <StudioDialog title="Créer un plan" onClose={onClose} disabled={disabled} wide>
    <p className="dialog-intro">Choisis un point de départ. Le nouveau plan sera ajouté après « {shot.name} ».</p>
    <div className="template-grid">{cards.map(([id,icon,title,description])=><button key={id} className={`template-card ${template===id?'selected':''}`} aria-pressed={template===id} onClick={()=>setTemplate(id)} disabled={disabled}><Icon name={icon} size={24}/><strong>{title}</strong><span>{description}</span></button>)}</div>
    {(template==='dialogue'||template==='entrance')&&<div className="template-speakers"><label>Personnage {template==='dialogue'?'1':''}<select aria-label="Premier personnage du modèle" value={first} onChange={e=>setFirst(e.target.value)}><option value="">Choisir un personnage</option>{shot.actors.map(a=><option key={a.id} value={a.id}>{a.name}{a.role==='enemy'?' (ennemi)':''}</option>)}</select></label>{template==='dialogue'&&<label>Personnage 2<select aria-label="Second personnage du modèle" value={second} onChange={e=>setSecond(e.target.value)}><option value="">Choisir un personnage</option>{shot.actors.map(a=><option key={a.id} value={a.id}>{a.name}{a.role==='enemy'?' (ennemi)':''}</option>)}</select></label>}</div>}
    {invalid&&<p className="inline-warning">{template==='dialogue'?'Ajoute deux personnages différents au plan source, puis choisis-les ici.':'Ajoute d’abord un personnage au plan source.'}</p>}
    <div className="modal-actions"><button className="button subtle" onClick={onClose} disabled={disabled}>Annuler</button><button className="button primary" disabled={disabled||invalid} onClick={()=>onCreate(template,[first,second].filter(Boolean))}><Icon name="plus" size={16}/> Créer le plan</button></div>
  </StudioDialog>;
}
export function DuplicateDialog({onDuplicate,onClose,disabled}:{onDuplicate:(options:DuplicateOptions)=>void;onClose:()=>void;disabled:boolean}) {
  const [options,setOptions]=useState<DuplicateOptions>({dialogues:true,entrances:true,audio:true});
  return <StudioDialog title="Dupliquer le plan" onClose={onClose} disabled={disabled}>
    <p>Le décor, les objets et leurs positions sont toujours conservés. Que veux-tu reprendre en plus ?</p>
    {([['dialogues','Conserver les dialogues'],['entrances','Rejouer les entrées des personnages'],['audio','Conserver l’audio']] as const).map(([key,label])=><label className="check-field duplicate-option" key={key}><input type="checkbox" checked={options[key]} onChange={e=>setOptions({...options,[key]:e.target.checked})}/>{label}</label>)}
    <p className="field-hint">Chaque objet reçoit un nouvel identifiant. Les bulles restent reliées à la copie de leur personnage.</p>
    <div className="modal-actions"><button className="button subtle" disabled={disabled} onClick={onClose}>Annuler</button><button className="button primary" disabled={disabled} onClick={()=>onDuplicate(options)}>Dupliquer le plan</button></div>
  </StudioDialog>;
}
