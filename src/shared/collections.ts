import type { AssetRef } from './model.js';
import { isSafeAssetRef } from './schema.js';
export interface Collections { favorites: AssetRef[]; recent: AssetRef[] }
export function parseCollections(raw: unknown): Collections {
  const value=raw && typeof raw==='object' ? raw as Record<string,unknown> : {};
  const list=(items:unknown,limit:number):AssetRef[]=>Array.isArray(items)?[...new Set(items.filter(isSafeAssetRef))].slice(0,limit):[];
  return {favorites:list(value.favorites,500),recent:list(value.recent,40)};
}
export function toggleFavorite(collections:Collections,ref:AssetRef):Collections {
  return {...collections,favorites:collections.favorites.includes(ref)?collections.favorites.filter(r=>r!==ref):[ref,...collections.favorites].slice(0,500)};
}
export function recordRecent(collections:Collections,ref:AssetRef):Collections {
  return {...collections,recent:[ref,...collections.recent.filter(r=>r!==ref)].slice(0,40)};
}
