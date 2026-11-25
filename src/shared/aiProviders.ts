export type AiImageProvider = 'openai' | 'gemini';

export interface AiModelOption {
  id: string;
  label: string;
  description: string;
  isDefault: boolean;
  provider?: AiImageProvider;
}

export interface AiProviderStatus {
  openai: {
    available: boolean;
    detail: string;
  };
  gemini: {
    available: boolean;
    hasCli: boolean;
    hasStoredKey: boolean;
    hasEnvKey: boolean;
    maskedHint?: string;
    detail: string;
  };
}

export const AI_PROVIDER_LABELS: Record<AiImageProvider, string> = {
  openai: 'OpenAI (Codex)',
  gemini: 'Google Gemini',
};

export const DEFAULT_GEMINI_IMAGE_MODELS: AiModelOption[] = [
  {
    id: 'gemini-2.5-flash-image',
    label: 'Gemini 2.5 Flash Image',
    description: 'Rapide et fidèle pour les poses, planches d’animation et décors.',
    isDefault: true,
    provider: 'gemini',
  },
  {
    id: 'gemini-3-pro-image-preview',
    label: 'Gemini 3 Pro Image',
    description: 'Haute précision graphique pour les illustrations détaillées et spritesheets.',
    isDefault: false,
    provider: 'gemini',
  },
  {
    id: 'gemini-2.0-flash-preview-image-generation',
    label: 'Gemini 2.0 Flash Image',
    description: 'Modèle alternatif de génération et d’édition d’images.',
    isDefault: false,
    provider: 'gemini',
  },
];

export function normalizeAiProvider(value: unknown): AiImageProvider {
  if (value === undefined || value === '' || value === 'openai') return 'openai';
  if (value === 'gemini') return 'gemini';
  throw new Error('Fournisseur IA inconnu. Choisis OpenAI (Codex) ou Google Gemini.');
}

export function normalizeAiModel(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw new Error('Identifiant de modèle IA invalide.');
  const model = value.trim();
  if (!model) return undefined;
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,127}$/.test(model)) {
    throw new Error('Saisis un identifiant de modèle de 128 caractères maximum, sans espaces ni options de commande.');
  }
  return model;
}

export function providerLabel(provider?: AiImageProvider): string {
  return AI_PROVIDER_LABELS[provider ?? 'openai'];
}
