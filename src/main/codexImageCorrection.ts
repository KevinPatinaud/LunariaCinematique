import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import type { BackgroundCorrectionRequest } from '../shared/backgroundCorrection.js';
import { normalizeCodexModel, normalizeCodexReasoningEffort, type CodexReasoningEffort } from '../shared/backgroundCorrection.js';
import { findCodexExecutable } from './codexExecutable.js';

export interface ImageGenerationTask {
  folder: string;
  sourcePath: string;
  canvasPath: string;
  request: BackgroundCorrectionRequest;
  sourceSize: { width: number; height: number };
  signal: AbortSignal;
  progress: (message: string) => void;
}
export type ImageGenerator = (task: ImageGenerationTask) => Promise<string>;
export const codexImagesRoot = () => path.join(process.env.CODEX_HOME || path.join(os.homedir(), '.codex'), 'generated_images');

const outputSchema = {
  type: 'object', additionalProperties: false,
  properties: { status: { type: 'string', enum: ['completed', 'unavailable'] }, imagePath: { type: 'string' }, message: { type: 'string' } },
  required: ['status', 'imagePath', 'message'],
};

export function codexImageArguments(folder: string, canvasPath: string, model?: string, reasoningEffort?: CodexReasoningEffort): string[] {
  const selectedModel = normalizeCodexModel(model);
  const effort = normalizeCodexReasoningEffort(reasoningEffort);
  return ['-a', 'never', 'exec', '--ignore-user-config', '--skip-git-repo-check', '--ephemeral', '--sandbox', 'read-only', '--enable', 'image_generation', '--disable', 'multi_agent', '--disable', 'apps', '--disable', 'plugins', '--disable', 'memories', '--json', '-C', folder, '-i', canvasPath, '--output-schema', path.join(folder, 'response.schema.json'), '-o', path.join(folder, 'response.json'), ...(selectedModel ? ['--model', selectedModel] : []), ...(effort ? ['-c', `model_reasoning_effort="${effort}"`] : []), '-'];
}

export const generateWithCodex: ImageGenerator = async task => {
  const prompt = [
    '$imagegen Élargis ce décor 16:9 en 20:9 par outpainting pour une cinématique du jeu Lunaria.',
    'Utilise exclusivement l’outil natif image_gen / imagegen pour produire une vraie retouche IA de cette image.',
    'IMAGE 1 — CIBLE À ÉDITER : le canevas 20:9 joint contient le décor de référence 16:9 dans sa partie centrale et deux bandes transparentes à compléter. Les anciennes extensions défectueuses ont été retirées. Produis une image complète, entièrement opaque, harmonieuse et détaillée, utilisable directement comme décor de jeu.',
    'OPÉRATION : prolonge naturellement le lieu à gauche et à droite. Tu peux aussi retoucher raisonnablement le centre pour unifier la perspective, les structures, les textures et la lumière. Préserve l’identité du lieu, son ambiance, son point de vue et sa composition générale. Les ajustements locaux qui améliorent l’image sont souhaités ; évite les changements majeurs de disposition, d’échelle ou de sujet.',
    'QUALITÉ : vise une scène continue sur toute la largeur, avec des lignes architecturales et des surfaces cohérentes. Garde les détails fins et une netteté naturelle adaptée à la source. Aucune symétrie miroir, aucun motif cloné, aucun étirement, aucune couture verticale ni dédoublement. Ne masque pas les défauts par du flou, un assombrissement artificiel ou une accumulation de feuillage.',
    'FIDÉLITÉ : conserve les éléments importants du décor et leurs relations spatiales. Aucun nouveau texte, panneau ni personnage. Les personnages, bulles et accessoires du plan sont des calques séparés. Le Studio utilisera ton image complète, y compris les améliorations du centre : aucune partie de la source ne sera recollée par-dessus.',
    `FORMAT : paysage 20:9 comme le canevas joint. Génère à la meilleure résolution native disponible avec un niveau de détail au moins comparable à la référence de ${task.sourceSize.width} × ${task.sourceSize.height}. ${task.request.outputWidth === 'native' ? 'Le Studio conservera la résolution native et les pixels de ton résultat, avec la tolérance habituelle des dimensions entières pour le rapport 20:9.' : `Le Studio produira ensuite la version ${task.request.outputWidth} × ${task.request.outputWidth * 9 / 20} choisie par l’auteur ; ne réduis pas volontairement la qualité pour cette exportation.`} Préserve la composition générale et le champ vertical ; évite un zoom ou un recadrage important.`,
    `DEMANDE DE L’AUTEUR :\n${task.request.instructions}`,
    'CONTRÔLE VISUEL OBLIGATOIRE : après la génération, ouvre le vrai fichier avec view_image et vérifie la qualité de la scène entière : continuité des structures, perspective, détails, lumière, fidélité générale au lieu et remplissage des bords. Des modifications raisonnables du centre sont acceptées et ne constituent pas un défaut. Si une couture, une déformation gênante ou une perte importante de fidélité subsiste, fais une seconde retouche imagegen ciblée du résultat, puis inspecte-la. Au maximum deux appels imagegen. Si un défaut important subsiste, réponds status=unavailable avec une explication précise.',
    'Si l’outil natif de génération d’images est indisponible, indique status=unavailable ; ne simule pas une correction avec Python, SVG, recadrage ou remplissage répétitif.',
    'Ne lance aucune commande et ne modifie aucun fichier de la bibliothèque. Ne copie pas l’image générée : le Studio se charge de la copie et de la validation.',
    'Après la génération, réponds selon le schéma JSON avec status=completed et imagePath égal au chemin absolu du vrai fichier produit par l’outil natif. Ne renvoie pas un chemin supposé.',
  ].join('\n\n');
  task.progress(`Codex${task.request.codexModel ? ` (${task.request.codexModel})` : ''} génère les côtés du panorama 20:9…`);
  return runCodexImage({ folder: task.folder, inputPath: task.canvasPath, codexModel: task.request.codexModel, signal: task.signal, prompt });
};

/** Shared native Codex transport. Authentication stays with the installed CLI. */
export async function runCodexImage(task: { folder: string; inputPath: string; codexModel?: string; codexReasoningEffort?: CodexReasoningEffort; signal: AbortSignal; prompt: string }): Promise<string> {
  if (task.signal.aborted) throw new Error('Génération annulée.');
  const executable = await findCodexExecutable();
  const schemaPath = path.join(task.folder, 'response.schema.json'), responsePath = path.join(task.folder, 'response.json');
  await fs.writeFile(schemaPath, JSON.stringify(outputSchema));
  const prompt = task.prompt;
  await fs.writeFile(path.join(task.folder, 'request.txt'), prompt);
  // Explicit choices are per invocation; automatic retains CLI-native defaults.
  // Authentication is still reused. Codex only reads the staged source; the
  // host application handles candidate copying and the explicit replacement.
  const args = codexImageArguments(task.folder, task.inputPath, task.codexModel, task.codexReasoningEffort);
  await fs.writeFile(path.join(task.folder,'execution.json'),JSON.stringify({executable,args,model:task.codexModel,reasoningEffort:task.codexReasoningEffort},null,2));
  const env = { ...process.env };
  delete env.CODEX_API_KEY; delete env.OPENAI_API_KEY;
  await new Promise<void>((resolve, reject) => {
    const child = spawn(executable, args, { cwd: task.folder, env, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let diagnostics = '', events = '', pending = '';
    const stop = () => {
      if (process.platform === 'win32' && child.pid) spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' }).unref();
      else child.kill();
    };
    let stopped: Error | undefined;
    // Release the common queue only once the child has exited, including after
    // taskkill on Windows; otherwise cancelling could overlap two providers.
    const timer = setTimeout(() => { stopped = new Error('La génération a dépassé 15 minutes. Tu peux réessayer.'); stop(); }, 15 * 60_000);
    const abort = () => { stopped = new Error('Génération annulée.'); stop(); };
    task.signal.addEventListener('abort', abort, { once: true });
    if (task.signal.aborted) abort();
    child.stdout.on('data', (chunk: Buffer) => {
      const text = chunk.toString(); events = (events + text).slice(-1_000_000); pending += text;
      const lines = pending.split('\n'); pending = lines.pop() ?? '';
      for (const line of lines) {
        try { const event = JSON.parse(line); if (event.type === 'turn.failed' || event.type === 'error') diagnostics += '\n' + (event.error?.message ?? event.message ?? 'Erreur Codex.'); } catch { /* Incomplete or non-JSON diagnostic. */ }
      }
    });
    child.stderr.on('data', (chunk: Buffer) => { diagnostics = (diagnostics + chunk.toString()).slice(-16_000); });
    child.on('error', error => { clearTimeout(timer); task.signal.removeEventListener('abort', abort); reject(error); });
    child.on('close', code => {
      clearTimeout(timer); task.signal.removeEventListener('abort', abort);
      void fs.writeFile(path.join(task.folder, 'events.jsonl'), events).catch(() => undefined);
      if (stopped || task.signal.aborted) reject(stopped ?? new Error('Génération annulée.'));
      else if (code === 0) resolve();
      else {
        const detail = diagnostics.replace(/(?:sk-[a-zA-Z0-9_-]+|Bearer\s+\S+)/g, '[masqué]').trim().split('\n').at(-1)?.slice(0, 700);
        reject(new Error(`Codex n’a pas pu générer l’image. ${detail || 'Vérifie sa connexion avec « codex login status ».'}`));
      }
    });
    child.stdin.end(prompt);
  });
  const response = JSON.parse((await fs.readFile(responsePath, 'utf8')).replace(/^\uFEFF/, ''));
  if (response.status !== 'completed' || typeof response.imagePath !== 'string' || !response.imagePath) throw new Error(typeof response.message === 'string' ? response.message.slice(0, 1000) : 'La génération d’images native de Codex est indisponible.');
  return response.imagePath;
}
