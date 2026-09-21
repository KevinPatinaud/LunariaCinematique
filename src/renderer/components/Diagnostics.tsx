import React, { useState } from 'react';
import type { Diagnostic } from '../../shared/diagnostics.js';
import { Icon } from './Icon.js';
export function Diagnostics({issues,onFocus,onFix,disabled}:{issues:Diagnostic[];onFocus:(issue:Diagnostic)=>void;onFix:(issue:Diagnostic)=>void;disabled:boolean}) {
  const [infos,setInfos]=useState(false);
  const actionable=issues.filter(i=>i.severity!=='info'), items=infos?issues:actionable;
  return <div className="diagnostic-panel"><span className="overline">AVANT LA LECTURE DANS GODOT</span><h2>Diagnostics de la cinématique</h2>
    <p>Les erreurs empêchent la lecture. Les avertissements demandent une vérification visuelle, sans empêcher de conserver un brouillon.</p>
    <div className="diagnostic-counts"><span className="error">{issues.filter(i=>i.severity==='error').length} erreur(s)</span><span>{issues.filter(i=>i.severity==='warning').length} avertissement(s)</span></div>
    <label className="check-field"><input type="checkbox" checked={infos} onChange={e=>setInfos(e.target.checked)}/> Afficher aussi les {issues.filter(i=>i.severity==='info').length} informations</label>
    {!actionable.length&&<div className="check-success"><Icon name="check" size={23}/><p>Aucune erreur ni alerte détectée par les contrôles disponibles.</p></div>}
    <div className="diagnostic-list">{items.map(issue=><article key={issue.id} className={`diagnostic-item ${issue.severity}`}><Icon name={issue.severity==='info'?'help':'warning'} size={17}/><div><small>{issue.shotIndex!==undefined?`PLAN ${String(issue.shotIndex+1).padStart(2,'0')}`:'PROJET'} · {issue.severity==='error'?'ERREUR':issue.severity==='warning'?'À VÉRIFIER':'INFORMATION'}</small><strong>{issue.message}</strong>{issue.detail&&<p>{issue.detail}</p>}<div className="diagnostic-actions">{issue.shotId&&<button className="link-button" disabled={disabled} onClick={()=>onFocus(issue)}>Voir dans la scène</button>}{issue.fix&&<button className="button subtle" disabled={disabled} onClick={()=>onFix(issue)}>{issue.fix==='center'?'Recentrer':issue.fix==='fit-bubble'?'Adapter la bulle':'Proposer un placement'}</button>}</div></div></article>)}</div>
  </div>;
}
