/** Common, platform-independent rules. Browser and Electron must classify identically. */
import type { Asset } from './model.js';
export const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
export const AUDIO_EXTENSIONS = new Set(['.ogg', '.wav', '.mp3']);
export const extension = (file: string) => /\.[^./]+$/.exec(file)?.[0].toLowerCase() ?? '';
export const isImage = (file: string) => IMAGE_EXTENSIONS.has(extension(file));
export const isAudio = (file: string) => AUDIO_EXTENSIONS.has(extension(file));
export function classifyAsset(relative: string): Asset['kind'] {
  const p = relative.replace(/\\/g, '/').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (isAudio(p)) return 'audio';
  // The explicit enemy namespace wins over generic stage/portrait/continent names.
  // Inspect directories only: a background called enemy_camp.png is not an enemy.
  const folders = p.split('/').slice(0, -1).join('/');
  if (/(^|\/)(\d+[_ -]+)?(enemies|enemy|ennemis?)([\/_ -]|$)/.test(folders)) return 'enemy';
  if (/(^|\/)(\d+[_ -])?(props?|objects?|objets?|decorations?|accessoires?|accessories|mobilier)([\/_ -]|$)/.test(p)) return 'prop';
  if (/(^|\/)(\d+_)?(ui|interface|dialogues|bulles|tooltips)(\/|_|$)/.test(p)) return 'ui';
  if (/(^|\/)(\d+_)?(characters?|personnages?|portraits?)(\/|_|$)/.test(p) || /(^|\/)(stage[_ -]?0?[123])([/_ -]|$)/.test(p)) return 'character';
  if (/(europe|africa|afrique|asia|asie|oceania|oceanie|americ|environment|decor)/.test(p)) return 'environment';
  return 'other';
}
export function prettyName(relative: string): string {
  return relative.split('/').pop()!.replace(/\.[^.]+$/, '').replace(/_/g, ' ').replace(/\b v0?(\d+)$/, ' · v$1').replace(/^./, c => c.toUpperCase());
}
export const ASSET_MIME = 'application/x-lunaria-asset';
export const ASSET_KIND_MIME = 'application/x-lunaria-kind';
