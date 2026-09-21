import { useEffect, useState } from 'react';
import { parseCollections, recordRecent, toggleFavorite, type Collections } from '../../shared/collections.js';
import type { AssetRef } from '../../shared/model.js';
function load(key:string):Collections { try {return parseCollections(JSON.parse(localStorage.getItem(key)??'null'));} catch {return parseCollections(null);} }
export function useCollections(root:string, warn:(message:string)=>void) {
  const key='lunaria-collections-v13:'+root;
  const [state,setState]=useState(()=>({key,value:load(key)}));
  useEffect(()=>{setState({key,value:load(key)});},[key]);
  const collections=state.key===key?state.value:load(key);
  function update(edit:(value:Collections)=>Collections) {
    // Read persisted state so a library switch cannot write into another library's favorites.
    const value=edit(load(key));
    try {localStorage.setItem(key,JSON.stringify(value));} catch {warn('Préférences locales indisponibles : les favoris ne seront pas conservés.');}
    setState({key,value});
  }
  return {...collections,toggle:(ref:AssetRef)=>update(c=>toggleFavorite(c,ref)),use:(ref:AssetRef)=>update(c=>recordRecent(c,ref)),clearRecent:()=>update(c=>({...c,recent:[]}))};
}
