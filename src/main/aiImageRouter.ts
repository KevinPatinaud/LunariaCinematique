import type { AiImageProvider } from '../shared/aiProviders.js';
import type { CodexReasoningEffort } from '../shared/backgroundCorrection.js';
import { runCodexImage } from './codexImageCorrection.js';
import { runGeminiImage } from './geminiImageGeneration.js';
import { runAgyImage } from './agyImageGeneration.js';
import { findAgyExecutable } from './agyExecutable.js';

export interface ProviderImageTask {
  provider?: AiImageProvider;
  model?: string;
  codexReasoningEffort?: CodexReasoningEffort;
  folder: string;
  inputPath: string | string[];
  codexPrompt: string;
  geminiPrompt?: string;
  aspectRatio?: string;
  signal: AbortSignal;
  getGeminiApiKey?: () => Promise<string | undefined>;
}

export async function runProviderImage(task: ProviderImageTask): Promise<string> {
  if ((task.provider ?? 'openai') === 'gemini') {
    const agy = await findAgyExecutable().catch(() => undefined);
    if (agy) {
      return runAgyImage({
        folder: task.folder,
        inputPath: task.inputPath,
        model: task.model,
        prompt: task.geminiPrompt ?? task.codexPrompt,
        aspectRatio: task.aspectRatio,
        signal: task.signal,
        executable: agy,
      });
    }
    const apiKey = await task.getGeminiApiKey?.();
    return runGeminiImage({
      folder: task.folder,
      inputPath: task.inputPath,
      model: task.model,
      prompt: task.geminiPrompt ?? task.codexPrompt,
      aspectRatio: task.aspectRatio,
      apiKey,
      signal: task.signal,
    });
  }
  return runCodexImage({
    folder: task.folder,
    inputPath: task.inputPath,
    codexModel: task.model,
    codexReasoningEffort: task.codexReasoningEffort,
    signal: task.signal,
    prompt: task.codexPrompt,
  });
}
