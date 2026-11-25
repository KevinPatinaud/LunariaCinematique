import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DEFAULT_GEMINI_IMAGE_MODELS, normalizeAiModel, type AiModelOption } from '../shared/aiProviders.js';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export interface GeminiImageTask {
  folder: string;
  inputPath: string | string[];
  model?: string;
  prompt: string;
  aspectRatio?: string;
  apiKey?: string;
  signal: AbortSignal;
  fetchImpl?: typeof fetch;
}

function mimeFromPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  return 'image/png';
}

function extensionFromMime(mime: string): string {
  if (mime === 'image/jpeg') return '.jpg';
  if (mime === 'image/webp') return '.webp';
  return '.png';
}

function sanitizeErrorDetail(raw: string): string {
  return raw.replace(/(?:AIza[a-zA-Z0-9_-]{10,}|sk-[a-zA-Z0-9_-]+|Bearer\s+\S+)/g, '[masqué]').trim().slice(0, 500);
}

/** Remove Codex-only tool instructions when forwarding an existing prompt to Gemini. */
export function adaptPromptForGemini(prompt: string): string {
  return prompt
    .replace(/^\$imagegen\s+/i, '')
    .split(/\n{2,}/)
    .filter(block => !/(?:view_image|status=completed|status=unavailable|imagePath|outil natif image_gen|schéma JSON)/i.test(block))
    .join('\n\n')
    .trim();
}

export async function listGeminiImageModels(
  apiKey?: string,
  options: { fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): Promise<AiModelOption[]> {
  if (!apiKey) return DEFAULT_GEMINI_IMAGE_MODELS.map(item => ({ ...item }));
  const fetchFn = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 12000);
  try {
    const response = await fetchFn(`${GEMINI_API_BASE}/models?pageSize=200`, {
      method: 'GET',
      headers: { 'x-goog-api-key': apiKey },
      signal: controller.signal,
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Clé API Gemini refusée. Vérifie ta clé API dans les réglages du Studio.');
      }
      throw new Error(`Impossible de lister les modèles Gemini (HTTP ${response.status}).`);
    }
    const payload = await response.json() as {
      models?: Array<{
        name?: string;
        displayName?: string;
        description?: string;
        supportedGenerationMethods?: string[];
      }>;
    };
    const discovered = new Map<string, AiModelOption>();
    for (const item of payload.models ?? []) {
      const rawName = typeof item.name === 'string' ? item.name.replace(/^models\//, '') : '';
      if (!rawName || !/image/i.test(rawName)) continue;
      if (Array.isArray(item.supportedGenerationMethods) && !item.supportedGenerationMethods.includes('generateContent')) continue;
      let id: string | undefined;
      try { id = normalizeAiModel(rawName); } catch { continue; }
      if (!id) continue;
      discovered.set(id, {
        id,
        label: typeof item.displayName === 'string' && item.displayName.trim() ? item.displayName.trim().slice(0, 160) : id,
        description: typeof item.description === 'string' ? item.description.slice(0, 500) : '',
        isDefault: id === DEFAULT_GEMINI_IMAGE_MODELS[0].id,
        provider: 'gemini',
      });
    }
    if (!discovered.size) return DEFAULT_GEMINI_IMAGE_MODELS.map(item => ({ ...item }));
    const list = [...discovered.values()].sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.id.localeCompare(b.id));
    if (!list.some(item => item.isDefault)) list[0].isDefault = true;
    return list;
  } finally {
    clearTimeout(timer);
  }
}

export async function runGeminiImage(task: GeminiImageTask): Promise<string> {
  if (task.signal.aborted) throw new Error('Génération annulée.');
  const apiKey = task.apiKey?.trim();
  if (!apiKey) {
    throw new Error('Clé API Gemini manquante. Renseigne ta clé API Google Gemini dans le sélecteur de modèle ou définis GEMINI_API_KEY.');
  }
  const selectedModel = normalizeAiModel(task.model) ?? DEFAULT_GEMINI_IMAGE_MODELS[0].id;
  const inputs = Array.isArray(task.inputPath) ? task.inputPath : [task.inputPath];
  const parts: Array<{ inlineData: { mimeType: string; data: string } } | { text: string }> = [];
  for (const input of inputs) {
    const bytes = await fs.readFile(input);
    parts.push({ inlineData: { mimeType: mimeFromPath(input), data: bytes.toString('base64') } });
  }
  const prompt = adaptPromptForGemini(task.prompt);
  parts.push({ text: prompt });

  await fs.writeFile(path.join(task.folder, 'request.txt'), prompt);
  await fs.writeFile(
    path.join(task.folder, 'execution.json'),
    JSON.stringify({ provider: 'gemini', model: selectedModel, aspectRatio: task.aspectRatio }, null, 2),
  );

  const generationConfig: Record<string, unknown> = {
    responseModalities: ['TEXT', 'IMAGE'],
  };
  if (task.aspectRatio) {
    generationConfig.imageConfig = { aspectRatio: task.aspectRatio };
  }

  const fetchFn = task.fetchImpl ?? fetch;
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), 10 * 60_000);
  const onAbort = () => timeout.abort();
  task.signal.addEventListener('abort', onAbort, { once: true });

  let response: Response;
  try {
    response = await fetchFn(`${GEMINI_API_BASE}/models/${encodeURIComponent(selectedModel)}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig,
      }),
      signal: timeout.signal,
    });
  } catch (error) {
    if (task.signal.aborted) throw new Error('Génération annulée.');
    if ((error as Error)?.name === 'AbortError') throw new Error('La génération Gemini a dépassé le délai autorisé. Tu peux réessayer.');
    throw new Error(`Impossible de contacter l’API Gemini : ${sanitizeErrorDetail(error instanceof Error ? error.message : String(error))}`);
  } finally {
    clearTimeout(timer);
    task.signal.removeEventListener('abort', onAbort);
  }

  const bodyText = await response.text();
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Clé API Gemini refusée. Vérifie ta clé API dans le Studio.');
    }
    if (response.status === 429) {
      throw new Error('Quota Gemini atteint. Réessaie plus tard ou bascule sur OpenAI (Codex).');
    }
    let detail = bodyText;
    try {
      const parsed = JSON.parse(bodyText) as { error?: { message?: string } };
      if (parsed?.error?.message) detail = parsed.error.message;
    } catch { /* Keep raw snippet. */ }
    throw new Error(`Gemini n’a pas pu générer l’image (HTTP ${response.status}). ${sanitizeErrorDetail(detail)}`);
  }

  let parsed: {
    candidates?: Array<{
      finishReason?: string;
      content?: {
        parts?: Array<{
          text?: string;
          inlineData?: { mimeType?: string; data?: string };
          inline_data?: { mime_type?: string; data?: string };
        }>;
      };
    }>;
  };
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    throw new Error('Réponse Gemini illisible.');
  }

  const candidate = parsed.candidates?.[0];
  const responseParts = candidate?.content?.parts ?? [];
  const imagePart = responseParts.find(part => {
    const inline = part.inlineData ?? (part.inline_data ? { mimeType: part.inline_data.mime_type, data: part.inline_data.data } : undefined);
    return inline?.data && (!inline.mimeType || inline.mimeType.startsWith('image/'));
  });
  const inline = imagePart?.inlineData ?? (imagePart?.inline_data ? { mimeType: imagePart.inline_data.mime_type, data: imagePart.inline_data.data } : undefined);
  if (!inline?.data) {
    const textReply = responseParts.map(part => part.text).filter(Boolean).join(' ').trim();
    throw new Error(
      textReply
        ? `Gemini n’a pas renvoyé d’image : ${sanitizeErrorDetail(textReply)}`
        : `Gemini n’a pas renvoyé d’image (${candidate?.finishReason ?? 'réponse vide'}). Vérifie que le modèle sélectionné prend en charge la génération d’images.`,
    );
  }

  const bytes = Buffer.from(inline.data, 'base64');
  if (!bytes.length) throw new Error('L’image renvoyée par Gemini est vide.');
  const outputPath = path.join(task.folder, `gemini-output${extensionFromMime(inline.mimeType ?? 'image/png')}`);
  await fs.writeFile(outputPath, bytes);
  return outputPath;
}
