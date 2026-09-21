import React, { useEffect, useRef } from 'react';
import { Icon } from './Icon.js';
export function StudioDialog({title,onClose,disabled=false,children,wide=false,restoreFocus=true}:{title:string;onClose:()=>void;disabled?:boolean;children:React.ReactNode;wide?:boolean;restoreFocus?:boolean}) {
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const previous=document.activeElement as HTMLElement|null;const dialog=ref.current;dialog?.showModal();return()=>{dialog?.close();if(restoreFocus)previous?.focus();};},[restoreFocus]);
  return <dialog ref={ref} aria-label={title} className={`studio-dialog ${wide?'wide':''}`} onKeyDown={e=>{e.stopPropagation();if(e.key==='Escape'&&!disabled){e.preventDefault();onClose();}}} onCancel={e=>{e.preventDefault();if(!disabled)onClose();}} onClick={e=>{if(e.target===e.currentTarget&&!disabled)onClose();}}>
    <header><div><span className="overline">LUNARIA · CINEMATIC STUDIO</span><h2>{title}</h2></div><button className="icon-button" aria-label="Fermer" disabled={disabled} onClick={onClose}><Icon name="close"/></button></header>{children}
  </dialog>;
}
