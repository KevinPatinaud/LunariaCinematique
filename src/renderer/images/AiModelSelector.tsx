import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AI_PROVIDER_LABELS,
  type AiImageProvider,
  type AiModelOption,
  type AiProviderStatus,
} from '../../shared/aiProviders.js';
import { api } from '../browserBridge.js';
import './aiModelSelector.css';

export interface AiModelSelectionState {
  provider: AiImageProvider;
  model: string;
  models: AiModelOption[];
  loading: boolean;
  loaded: boolean;
  error: string;
  status: AiProviderStatus | null;
}

export function rememberAiProvider(storageKey: string): AiImageProvider {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved === 'gemini' ? 'gemini' : 'openai';
  } catch {
    return 'openai';
  }
}

export function saveAiProvider(storageKey: string, provider: AiImageProvider): void {
  try {
    localStorage.setItem(storageKey, provider);
  } catch {
    /* Local preference optional. */
  }
}

export function AiModelSelector({
  provider,
  onProviderChange,
  model,
  onModelChange,
  models,
  loading,
  error,
  onRefresh,
  disabled = false,
  selectAriaLabel,
  refreshAriaLabel,
  onStatusChange,
}: {
  provider: AiImageProvider;
  onProviderChange: (provider: AiImageProvider) => void;
  model: string;
  onModelChange: (model: string) => void;
  models: AiModelOption[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
  disabled?: boolean;
  selectAriaLabel?: string;
  refreshAriaLabel?: string;
  onStatusChange?: (status: AiProviderStatus) => void;
}) {
  const [status, setStatus] = useState<AiProviderStatus | null>(null);
  const [editingKey, setEditingKey] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [keySaving, setKeySaving] = useState(false);
  const [keyMessage, setKeyMessage] = useState('');
  const live = useRef(true);

  const loadStatus = useCallback(async () => {
    if (typeof api.getAiProviderStatus !== 'function') return;
    try {
      const next = await api.getAiProviderStatus();
      if (live.current) {
        setStatus(next);
        onStatusChange?.(next);
      }
    } catch {
      /* Status is advisory; generation still reports exact errors. */
    }
  }, [onStatusChange]);

  useEffect(() => {
    live.current = true;
    void loadStatus();
    return () => {
      live.current = false;
    };
  }, [loadStatus]);

  const unavailable = !!model && !models.some(item => item.id === model);
  const label = provider === 'gemini' ? 'Modèle Gemini' : 'Modèle Codex';
  const ariaLabel = selectAriaLabel ?? label;

  async function saveKey(value: string) {
    if (keySaving || typeof api.setGeminiApiKey !== 'function') return;
    setKeySaving(true);
    setKeyMessage('');
    try {
      const next = await api.setGeminiApiKey(value);
      if (live.current) {
        setStatus(next);
        onStatusChange?.(next);
        setKeyInput('');
        setEditingKey(false);
        setKeyMessage(value.trim() ? 'Clé API Gemini enregistrée.' : 'Clé API Gemini effacée.');
        onRefresh();
      }
    } catch (reason) {
      if (live.current) setKeyMessage(reason instanceof Error ? reason.message : String(reason));
    } finally {
      if (live.current) setKeySaving(false);
    }
  }

  return (
    <div className="ai-provider-selector">
      <div className="ai-provider-row">
        <span className="ai-provider-caption">Fournisseur IA</span>
        <div className="ai-provider-tabs" role="group" aria-label="Fournisseur IA">
          {(['openai', 'gemini'] as const).map(item => (
            <button
              key={item}
              type="button"
              className={`button subtle ${provider === item ? 'active' : ''}`}
              aria-pressed={provider === item}
              disabled={disabled}
              onClick={() => onProviderChange(item)}
            >
              {AI_PROVIDER_LABELS[item]}
            </button>
          ))}
        </div>
      </div>

      <div className="ai-model-row">
        <label className="field">
          <span>{label}</span>
          <select
            aria-label={ariaLabel}
            disabled={disabled || loading}
            value={model}
            onChange={event => onModelChange(event.target.value)}
          >
            <option value="">
              {provider === 'gemini'
                ? (status?.gemini.hasCli ? 'Automatique · choix d’Antigravity CLI (Gemini)' : 'Automatique · Gemini 2.5 Flash Image')
                : 'Automatique · choix de Codex'}
            </option>
            {unavailable && (
              <option value={model} disabled>
                {model} · {loading ? 'détection en cours…' : 'non détecté'}
              </option>
            )}
            {models.map(item => (
              <option key={item.id} value={item.id}>
                {item.label}
                {item.isDefault ? ' · par défaut' : ''}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="button subtle"
          aria-label={refreshAriaLabel ?? `Actualiser les modèles ${provider === 'gemini' ? 'Gemini' : 'Codex'}`}
          disabled={loading}
          onClick={onRefresh}
        >
          {loading ? 'Détection…' : 'Actualiser'}
        </button>
      </div>

      {provider === 'gemini' && (
        <div className="ai-gemini-config">
          <div className="ai-gemini-status">
            <span className={`ai-key-badge ${status?.gemini.available ? 'ok' : 'missing'}`}>
              {status?.gemini.hasCli
                ? 'Antigravity CLI (agy) détecté · aucune clé API requise'
                : status?.gemini.available
                  ? `Clé Gemini prête${status.gemini.maskedHint ? ` (${status.gemini.maskedHint})` : ''}`
                  : 'Antigravity CLI introuvable · clé API Gemini requise'}
            </span>
            {!status?.gemini.hasCli && !status?.gemini.hasEnvKey && (
              <button
                type="button"
                className="button text"
                disabled={disabled || keySaving}
                onClick={() => {
                  setEditingKey(v => !v);
                  setKeyMessage('');
                }}
              >
                {editingKey ? 'Fermer' : status?.gemini.hasStoredKey ? 'Modifier la clé' : 'Configurer la clé API'}
              </button>
            )}
            {!status?.gemini.hasCli && status?.gemini.hasStoredKey && !status.gemini.hasEnvKey && (
              <button
                type="button"
                className="button text"
                disabled={disabled || keySaving}
                onClick={() => void saveKey('')}
              >
                Effacer
              </button>
            )}
          </div>
          {!status?.gemini.hasCli && editingKey && (
            <div className="ai-gemini-key-form">
              <input
                type="password"
                aria-label="Clé API Google Gemini"
                placeholder="Colle ta clé API Google AI Studio (AIza…)"
                value={keyInput}
                disabled={keySaving}
                onChange={event => setKeyInput(event.target.value)}
              />
              <button
                type="button"
                className="button primary"
                disabled={keySaving || !keyInput.trim()}
                onClick={() => void saveKey(keyInput)}
              >
                {keySaving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          )}
          <small className="ai-provider-hint">
            {status?.gemini.detail ?? 'Utilise Antigravity CLI (agy) si installé, sinon la clé API Google Gemini.'}
          </small>
          {keyMessage && <p role="status" className="ai-provider-hint">{keyMessage}</p>}
        </div>
      )}

      {error && (
        <p role="alert" className="image-task-error">
          {error} Le choix automatique reste disponible.
        </p>
      )}
    </div>
  );
}
