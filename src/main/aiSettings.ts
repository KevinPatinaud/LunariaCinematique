import { promises as fs } from 'node:fs';
import path from 'node:path';
import { atomicJson, readJson } from './files.js';
import type { AiProviderStatus } from '../shared/aiProviders.js';

export interface SecretCodec {
  available(): boolean;
  encrypt(plain: string): string;
  decrypt(encoded: string): string;
}

interface StoredAiSettings {
  version: 1;
  geminiKeyEncrypted?: string;
  geminiKeyPlain?: string;
}

function maskKey(key: string): string {
  if (key.length <= 8) return '••••';
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

export class AiSettingsStore {
  constructor(
    private readonly filePath: string,
    private readonly codec?: SecretCodec,
    private readonly env: NodeJS.ProcessEnv = process.env,
    private readonly checkOpenAi: () => Promise<boolean> = async () => false,
    private readonly checkGeminiCli: () => Promise<boolean> = async () => false,
  ) {}

  private envGeminiKey(): string | undefined {
    const raw = this.env.GEMINI_API_KEY?.trim() || this.env.GOOGLE_API_KEY?.trim();
    return raw || undefined;
  }

  private async readStored(): Promise<StoredAiSettings | null> {
    try {
      const data = await readJson(this.filePath, 32 * 1024) as StoredAiSettings;
      if (data && typeof data === 'object' && data.version === 1) return data;
    } catch {
      /* Missing or unreadable settings file falls back cleanly. */
    }
    return null;
  }

  async storedGeminiKey(): Promise<string | undefined> {
    const data = await this.readStored();
    if (!data) return undefined;
    if (typeof data.geminiKeyEncrypted === 'string' && data.geminiKeyEncrypted && this.codec?.available()) {
      try {
        const plain = this.codec.decrypt(data.geminiKeyEncrypted).trim();
        if (plain) return plain;
      } catch {
        return undefined;
      }
    }
    if (typeof data.geminiKeyPlain === 'string' && data.geminiKeyPlain.trim()) {
      return data.geminiKeyPlain.trim();
    }
    return undefined;
  }

  async getGeminiApiKey(): Promise<string | undefined> {
    return this.envGeminiKey() ?? await this.storedGeminiKey();
  }

  async setGeminiApiKey(input: unknown): Promise<AiProviderStatus> {
    if (typeof input !== 'string') throw new Error('Clé API Gemini invalide.');
    const key = input.trim();
    if (key.length > 256 || /[\s\u0000-\u001f]/.test(key)) {
      throw new Error('La clé API Gemini ne doit contenir ni espace ni retour à la ligne.');
    }
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    if (!key) {
      await atomicJson(this.filePath, { version: 1 } satisfies StoredAiSettings);
      return this.status();
    }
    const payload: StoredAiSettings = this.codec?.available()
      ? { version: 1, geminiKeyEncrypted: this.codec.encrypt(key) }
      : { version: 1, geminiKeyPlain: key };
    await atomicJson(this.filePath, payload);
    return this.status();
  }

  async status(): Promise<AiProviderStatus> {
    const [openaiAvailable, geminiCliAvailable, storedKey] = await Promise.all([
      this.checkOpenAi().catch(() => false),
      this.checkGeminiCli().catch(() => false),
      this.storedGeminiKey(),
    ]);
    const envKey = this.envGeminiKey();
    const activeGeminiKey = envKey ?? storedKey;
    return {
      openai: {
        available: openaiAvailable,
        detail: openaiAvailable
          ? 'Codex CLI détecté sur cet ordinateur.'
          : 'Codex CLI introuvable. Installe-le et connecte-toi avec « codex login ».',
      },
      gemini: {
        available: geminiCliAvailable || !!activeGeminiKey,
        hasCli: geminiCliAvailable,
        hasStoredKey: !!storedKey,
        hasEnvKey: !!envKey,
        ...(activeGeminiKey ? { maskedHint: maskKey(activeGeminiKey) } : {}),
        detail: geminiCliAvailable
          ? 'Antigravity CLI (agy) détecté sur cet ordinateur · aucune clé API requise.'
          : envKey
            ? 'Clé API Gemini détectée dans les variables d’environnement.'
            : storedKey
              ? 'Clé API Gemini enregistrée dans le Studio.'
              : 'Installe Antigravity CLI (agy) ou ajoute une clé API Google Gemini pour générer avec Gemini.',
      },
    };
  }
}
