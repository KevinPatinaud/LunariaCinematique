import type { AssetRef } from './model.js';
import type { ImageTaskContext, ImageTaskMetadata, ImageTaskStatus } from './imageTasks.js';
import type { AiImageProvider } from './aiProviders.js';

export const BACKGROUND_FORMATS = {
  '20:9': 20 / 9, '19.5:9': 19.5 / 9, '18:9': 2, '16:9': 16 / 9,
} as const;
export type BackgroundFormat = keyof typeof BACKGROUND_FORMATS;
export const PANORAMA_WIDTHS = [1600, 2000, 2400] as const;
export type PanoramaWidth = typeof PANORAMA_WIDTHS[number];
export type PanoramaResolution = 'native' | PanoramaWidth;
export type PanoramaMode = 'extend' | 'rebuild';
export interface CodexModelOption { id: string; label: string; description: string; isDefault: boolean }
export type CodexReasoningEffort = 'low' | 'medium' | 'high' | 'xhigh' | 'max' | 'ultra';
export function normalizeCodexReasoningEffort(value: unknown): CodexReasoningEffort | undefined {
  if (value === undefined || value === '') return undefined;
  if (typeof value !== 'string' || !['low','medium','high','xhigh','max','ultra'].includes(value))
    throw new Error('Effort de raisonnement Codex invalide.');
  return value as CodexReasoningEffort;
}
/** Empty means the installed Codex CLI default, without changing its config. */
export function normalizeCodexModel(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw new Error('Identifiant du modèle Codex invalide.');
  const model = value.trim();
  if (!model) return undefined;
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,127}$/.test(model)) throw new Error('Saisis un identifiant de modèle Codex de 128 caractères maximum, sans espaces ni options de commande.');
  return model;
}
export interface ImageSize { width: number; height: number }
export interface CoreRect extends ImageSize { x: number; y: number }
export interface BackgroundPreparation {
  current: ImageSize & { url: string };
  original?: ImageSize & { ref: AssetRef; url: string; name: string };
  suggestedMode: PanoramaMode;
}
export function coreRect(size: ImageSize, position = .5): CoreRect {
  const width = Math.min(size.width, Math.round(size.height * 16 / 9));
  const height = Math.min(size.height, Math.round(size.width * 9 / 16));
  return { x: Math.round((size.width - width) * position), y: Math.round((size.height - height) / 2), width, height };
}
export function isSixteenNine(size: ImageSize): boolean { return Math.abs(size.width / size.height / (16 / 9) - 1) < .01; }
// New 20:9 images are recognized independently of their filename. Legacy
// wider assets retain their established support in the desktop/game readers.
export function isPanoramicBackground(ref: string, size: ImageSize): boolean {
  const ratio = size.width / size.height;
  return ratio > 2 && (ref.includes('_wide_v01.') || Math.abs(ratio / (20 / 9) - 1) < .01);
}
export interface BackgroundCorrectionRequest {
  context?: ImageTaskContext;
  ref: AssetRef;
  instructions: string;
  mode: PanoramaMode;
  useOriginal: boolean;
  cropPosition: number;
  outputWidth: PanoramaResolution;
  aiProvider?: AiImageProvider;
  codexModel?: string;
}
export interface BackgroundCorrectionJob extends ImageTaskMetadata {
  id: string;
  ref: AssetRef;
  status: ImageTaskStatus;
  message: string;
  originalUrl: string;
  coreUrl: string;
  core: CoreRect;
  usedOriginal: boolean;
  outputWidth: PanoramaResolution;
  aiProvider?: AiImageProvider;
  codexModel?: string;
  candidateUrl?: string;
  width?: number;
  height?: number;
  backupPath?: string;
}
