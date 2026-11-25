import { useCallback, useEffect, useState } from 'react';
import type { AiImageProvider, AiModelOption } from '../../shared/aiProviders.js';
import { api } from '../browserBridge.js';

interface ModelCatalog {
  provider: AiImageProvider;
  models: AiModelOption[];
  loadingModels: boolean;
  modelError: string;
}

export function useAiModels(provider: AiImageProvider, enabled = true) {
  const [catalog, setCatalog] = useState<ModelCatalog>({ provider, models: [], loadingModels: enabled, modelError: '' });
  const [refreshCount, setRefreshCount] = useState(0);
  const refreshModels = useCallback(() => setRefreshCount(count => count + 1), []);

  useEffect(() => {
    if (!enabled) return;
    let current = true;
    setCatalog(previous => ({
      provider,
      models: previous.provider === provider ? previous.models : [],
      loadingModels: true,
      modelError: '',
    }));
    async function loadModels() {
      try {
        if (provider === 'gemini' && typeof api.listAiModels !== 'function') {
          throw new Error('Relance le Studio pour activer la détection des modèles Gemini.');
        }
        const models = typeof api.listAiModels === 'function'
          ? await api.listAiModels(provider)
          : await api.listBackgroundModels();
        if (current) setCatalog({ provider, models, loadingModels: false, modelError: '' });
      } catch (reason) {
        if (!current) return;
        const detail = reason instanceof Error ? reason.message : String(reason);
        const modelError = detail.replace(/^Error invoking remote method '[^']+': (?:Error: )?/, '');
        setCatalog(previous => ({ ...previous, loadingModels: false, modelError }));
      }
    }
    void loadModels();
    return () => { current = false; };
  }, [enabled, provider, refreshCount]);

  if (!enabled || catalog.provider !== provider) {
    return { models: [], loadingModels: enabled, modelError: '', refreshModels };
  }
  return { models: catalog.models, loadingModels: catalog.loadingModels, modelError: catalog.modelError, refreshModels };
}
