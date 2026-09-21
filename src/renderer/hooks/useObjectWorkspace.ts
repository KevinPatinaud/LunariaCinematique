import { useState } from 'react';
/** Editing aids only. They never change what the game plays or the cinematic format. */
export function useObjectWorkspace() {
  type Flags={locked:string[];hidden:string[]}; const key='lunaria-object-workspace-v13';
  const [flags,setFlags]=useState<Flags>(()=>{
    try { const v=JSON.parse(localStorage.getItem(key)??'null');
      const ids=(a:unknown):string[]=>Array.isArray(a)?a.filter((id:unknown)=>typeof id==='string' && id.length<=100).slice(-3000):[];
      return {locked:ids(v?.locked),hidden:ids(v?.hidden)};
    } catch {return {locked:[],hidden:[]};}
  });
  function change(kind:keyof Flags,id:string,value?:boolean) {
    setFlags(current=>{const enabled=value??!current[kind].includes(id); const list=current[kind].filter(v=>v!==id);
      const next={...current,[kind]:(enabled?[...list,id]:list).slice(-3000)};
      try {localStorage.setItem(key,JSON.stringify(next));} catch { /* Workspace aids may remain session-only; no document content is lost. */ }
      return next;
    });
  }
  return {locked:new Set(flags.locked),hidden:new Set(flags.hidden),change};
}
