import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFile, spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { promisify } from 'node:util';
import { normalizeAiModel, type AiModelOption } from '../shared/aiProviders.js';
import { isWithin } from './files.js';
import { findAgyExecutable } from './agyExecutable.js';
import { adaptPromptForGemini } from './geminiImageGeneration.js';

const execute = promisify(execFile);

const OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    status: { type: 'string', enum: ['completed', 'unavailable'] },
    imagePath: { type: 'string' },
    message: { type: 'string' },
  },
  required: ['status', 'imagePath', 'message'],
};

export interface AgyImageTask {
  folder: string;
  inputPath: string | string[];
  model?: string;
  prompt: string;
  aspectRatio?: string;
  signal: AbortSignal;
  executable?: string;
  launch?: (executable: string, args: string[], cwd: string) => ChildProcessWithoutNullStreams;
  brainRoots?: string[];
}

export function parseAgyModelsOutput(stdout: string): AiModelOption[] {
  const models = new Map<string, AiModelOption>();
  for (const rawLine of stdout.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || /^fetching\b/i.test(line)) continue;
    const parts = line.split('\t').map(p => p.trim()).filter(Boolean);
    if (!parts.length) continue;
    let id: string | undefined;
    try { id = normalizeAiModel(parts[0]); } catch { continue; }
    if (!id) continue;
    const label = (parts[1] || id).slice(0, 160);
    models.set(id, {
      id,
      label,
      description: '',
      isDefault: false,
      provider: 'gemini',
    });
  }
  const list = [...models.values()];
  // Prioritize Gemini models at the top while keeping all CLI models accessible.
  list.sort((a, b) => {
    const aGemini = a.id.startsWith('gemini-') ? 0 : 1;
    const bGemini = b.id.startsWith('gemini-') ? 0 : 1;
    if (aGemini !== bGemini) return aGemini - bGemini;
    return 0;
  });
  const preferred = list.find(item => item.id === 'gemini-4-neon-high')
    ?? list.find(item => item.id.startsWith('gemini-'))
    ?? list[0];
  if (preferred) preferred.isDefault = true;
  return list;
}

let modelsInFlight: Promise<AiModelOption[]> | undefined;
export function listAgyModels(options: {
  findExecutable?: () => Promise<string>;
  runModels?: (executable: string) => Promise<string>;
} = {}): Promise<AiModelOption[]> {
  const run = async () => {
    const executable = await (options.findExecutable ?? findAgyExecutable)();
    try {
      const stdout = options.runModels
        ? await options.runModels(executable)
        : (await execute(executable, ['models'], { windowsHide: true, timeout: 75000, maxBuffer: 1024 * 1024 })).stdout;
      return parseAgyModelsOutput(stdout);
    } catch (reason) {
      if ((reason as { killed?: boolean } | null)?.killed) {
        throw new Error('Antigravity met trop de temps à renvoyer les modèles Gemini.');
      }
      throw new Error('Antigravity n’a pas pu lister les modèles Gemini. Vérifie sa connexion puis actualise.');
    }
  };
  if (options.findExecutable || options.runModels) return run();
  if (!modelsInFlight) {
    modelsInFlight = run().finally(() => { modelsInFlight = undefined; });
  }
  return modelsInFlight;
}

export function agyImageArguments(schemaPath: string, prompt: string, model?: string): string[] {
  const selectedModel = normalizeAiModel(model);
  return [
    '-p', prompt,
    '--output-format', 'json',
    '--json-schema', schemaPath,
    '--disable-slash-commands',
    ...(selectedModel ? ['--model', selectedModel] : []),
  ];
}

export function buildAgyImagePrompt(rawPrompt: string, inputPaths: string[], aspectRatio?: string): string {
  const artPrompt = adaptPromptForGemini(rawPrompt);
  const refs = inputPaths
    .map((file, index) => `IMAGE ${index + 1} (fichier local à consulter) : ${file}`)
    .join('\n');
  return [
    'Utilise ton sous-agent natif `image-generator` pour produire cette image pour Lunaria Studio.',
    refs,
    aspectRatio ? `Format / ratio cible : ${aspectRatio}.` : '',
    artPrompt,
    'RÈGLES STRICTES :',
    '- Consulte les images de référence indiquées ci-dessus avec `read_file` puis transmets-les dans le brief au sous-agent `image-generator`.',
    '- CONTRÔLE QUALITÉ OBLIGATOIRE : après la première génération, ouvre l’image produite avec `read_file` et inspecte-la attentivement. S’il s’agit d’une planche de marche, vérifie : (1) fond parfaitement uni #FF00FF sans ombres ni lignes de grille, (2) même taille de tête et proportions fidèles à IMAGE 1 sans jambes anormalement allongées, (3) la ligne 2 alterne réellement l’autre jambe vers l’avant et n’est PAS une copie de la ligne 1. Si un défaut majeur apparaît, relance `image-generator` une seconde fois (maximum 2 appels au total) en corrigeant précisément ce défaut.',
    '- Ne lance aucune commande shell et ne modifie aucun fichier de la bibliothèque.',
    '- Dès que l’image finale est validée, renvoie la sortie JSON structurée avec `status: "completed"` et `imagePath` égal au chemin absolu exact renvoyé par `image-generator`.',
    '- Si la génération échoue ou est indisponible, renvoie `status: "unavailable"` avec une explication claire dans `message`.',
  ].filter(Boolean).join('\n\n');
}

function parseAgyJsonOutput(stdout: string): {
  conversation_id?: string;
  status?: string;
  structured_output?: { status?: string; imagePath?: string; message?: string };
  response?: string;
} {
  const trimmed = stdout.replace(/^\uFEFF/, '').trim();
  if (!trimmed) throw new Error('Antigravity CLI n’a renvoyé aucune réponse.');
  try {
    return JSON.parse(trimmed);
  } catch {
    const lines = trimmed.split(/\r?\n/).reverse();
    for (const line of lines) {
      const candidate = line.trim();
      if (!candidate.startsWith('{')) continue;
      try { return JSON.parse(candidate); } catch { /* Try previous line. */ }
    }
    throw new Error('Réponse JSON d’Antigravity CLI illisible.');
  }
}

function defaultBrainRoots(): string[] {
  const home = os.homedir();
  return [
    path.join(home, '.gemini', 'antigravity-cli', 'brain'),
    path.join(home, '.gemini', 'antigravity', 'brain'),
  ];
}

export async function runAgyImage(task: AgyImageTask): Promise<string> {
  if (task.signal.aborted) throw new Error('Génération annulée.');
  const executable = task.executable ?? await findAgyExecutable();
  const inputs = Array.isArray(task.inputPath) ? task.inputPath : [task.inputPath];
  const schemaPath = path.join(task.folder, 'response.schema.json');
  await fs.writeFile(schemaPath, JSON.stringify(OUTPUT_SCHEMA), 'utf8');

  const prompt = buildAgyImagePrompt(task.prompt, inputs, task.aspectRatio);
  await fs.writeFile(path.join(task.folder, 'request.txt'), prompt, 'utf8');
  const args = agyImageArguments(schemaPath, prompt, task.model);
  await fs.writeFile(
    path.join(task.folder, 'execution.json'),
    JSON.stringify({ provider: 'gemini-cli', executable, model: task.model, aspectRatio: task.aspectRatio }, null, 2),
    'utf8',
  );

  const launch = task.launch ?? ((bin: string, argv: string[], cwd: string) =>
    spawn(bin, argv, { cwd, env: { ...process.env }, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] })
  );

  const stdout = await new Promise<string>((resolve, reject) => {
    const child = launch(executable, args, task.folder);
    let out = '';
    let err = '';
    let stopped: Error | undefined;
    const stop = () => {
      if (process.platform === 'win32' && child.pid) {
        spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' }).unref();
      } else {
        child.kill();
      }
    };
    const timer = setTimeout(() => {
      stopped = new Error('La génération via Antigravity CLI a dépassé 15 minutes. Tu peux réessayer.');
      stop();
    }, 15 * 60_000);
    const abort = () => {
      stopped = new Error('Génération annulée.');
      stop();
    };
    task.signal.addEventListener('abort', abort, { once: true });
    if (task.signal.aborted) abort();

    child.stdout.on('data', (chunk: Buffer) => { out = (out + chunk.toString('utf8')).slice(-2_000_000); });
    child.stderr.on('data', (chunk: Buffer) => { err = (err + chunk.toString('utf8')).slice(-32_000); });
    child.on('error', error => {
      clearTimeout(timer);
      task.signal.removeEventListener('abort', abort);
      reject(error);
    });
    child.on('close', code => {
      clearTimeout(timer);
      task.signal.removeEventListener('abort', abort);
      void fs.writeFile(path.join(task.folder, 'agy-stdout.log'), out).catch(() => undefined);
      if (err) void fs.writeFile(path.join(task.folder, 'agy-stderr.log'), err).catch(() => undefined);
      if (stopped || task.signal.aborted) reject(stopped ?? new Error('Génération annulée.'));
      else if (code === 0) resolve(out);
      else {
        const detail = (err || out).replace(/(?:AIza[a-zA-Z0-9_-]{10,}|Bearer\s+\S+)/g, '[masqué]').trim().split(/\r?\n/).at(-1)?.slice(0, 700);
        reject(new Error(`Antigravity CLI (Gemini) n’a pas pu générer l’image. ${detail || 'Vérifie ta connexion avec « agy ».'}`));
      }
    });
    child.stdin.end();
  });

  const payload = parseAgyJsonOutput(stdout);
  const structured = payload.structured_output;
  if (!structured || structured.status !== 'completed' || typeof structured.imagePath !== 'string' || !structured.imagePath.trim()) {
    throw new Error(
      typeof structured?.message === 'string' && structured.message.trim()
        ? structured.message.slice(0, 1000)
        : 'Antigravity CLI n’a pas renvoyé d’image générée.',
    );
  }

  const rawImagePath = structured.imagePath.trim();
  const resolvedCandidate = path.isAbsolute(rawImagePath) ? rawImagePath : path.resolve(task.folder, rawImagePath);
  const realCandidate = await fs.realpath(resolvedCandidate).catch(() => {
    throw new Error('Le fichier image renvoyé par Antigravity CLI est introuvable.');
  });

  const realFolder = await fs.realpath(task.folder);
  const allowedRoots = [realFolder];
  const conversationId = typeof payload.conversation_id === 'string' && /^[a-zA-Z0-9_-]{4,120}$/.test(payload.conversation_id)
    ? payload.conversation_id
    : undefined;
  if (conversationId) {
    for (const root of task.brainRoots ?? defaultBrainRoots()) {
      const brainDir = await fs.realpath(path.join(root, conversationId)).catch(() => '');
      if (brainDir) allowedRoots.push(brainDir);
    }
  }

  if (!allowedRoots.some(root => isWithin(root, realCandidate))) {
    throw new Error('L’image renvoyée par Antigravity CLI est hors des dossiers autorisés.');
  }
  const realInputs = await Promise.all(inputs.map(item => fs.realpath(item).catch(() => '')));
  if (realInputs.includes(realCandidate)) {
    throw new Error('Antigravity CLI a renvoyé l’image de référence au lieu d’une image générée.');
  }

  const ext = ['.png', '.jpg', '.jpeg', '.webp'].includes(path.extname(realCandidate).toLowerCase())
    ? path.extname(realCandidate).toLowerCase()
    : '.png';
  const stagedOutput = path.join(task.folder, `agy-output${ext}`);
  if (realCandidate !== stagedOutput) {
    await fs.copyFile(realCandidate, stagedOutput);
  }
  return stagedOutput;
}
