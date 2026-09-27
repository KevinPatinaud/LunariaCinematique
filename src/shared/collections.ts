import type { AssetRef } from './model.js';
import { isSafeAssetRef } from './schema.js';
export interface Collections { favorites: AssetRef[]; recent: AssetRef[]; favoriteFolders: string[] }
export function parseCollections(raw: unknown): Collections {
  const value=raw && typeof raw==='object' ? raw as Record<string,unknown> : {};
  const list=(items:unknown,limit:number):AssetRef[]=>Array.isArray(items)?[...new Set(items.filter(isSafeAssetRef))].slice(0,limit):[];
  const folders=Array.isArray(value.favoriteFolders)?[...new Set(value.favoriteFolders.filter((path):path is string=>typeof path==='string'&&isSafeAssetRef(`library://${path}`)))].slice(0,100):[];
  return {favorites:list(value.favorites,500),recent:list(value.recent,40),favoriteFolders:folders};
}
export function toggleFavorite(collections:Collections,ref:AssetRef):Collections {
  return {...collections,favorites:collections.favorites.includes(ref)?collections.favorites.filter(r=>r!==ref):[ref,...collections.favorites].slice(0,500)};
}
export function recordRecent(collections:Collections,ref:AssetRef):Collections {
  return {...collections,recent:[ref,...collections.recent.filter(r=>r!==ref)].slice(0,40)};
}
export function toggleFavoriteFolder(collections:Collections,path:string):Collections {
  if(typeof path!=='string'||!isSafeAssetRef(`library://${path}`))return collections;
  return {...collections,favoriteFolders:collections.favoriteFolders.includes(path)?collections.favoriteFolders.filter(folder=>folder!==path):[path,...collections.favoriteFolders].slice(0,100)};
}
