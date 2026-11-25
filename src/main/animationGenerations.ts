import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { IMAGE_LIMIT, imageHash, readImage } from './imageFiles.js';
import { isWithin, resolveAsset } from './files.js';
import { ImageJobStore, type ImageTaskQueue } from './imageJobs.js';
import { MissingNativeAlphaError } from './animationSheets.js';
import { walkPoseGuide } from './walkPoseGuide.js';
import { runProviderImage } from './aiImageRouter.js';
import { normalizeAiModel, normalizeAiProvider } from '../shared/aiProviders.js';
import type { ImageSize } from '../shared/backgroundCorrection.js';
import { imageTaskContext, type ImageTask } from '../shared/imageTasks.js';
import { isSafeAssetRef } from '../shared/schema.js';
import {
  animationPresetSpec,
  animationGenerationPrompt,
  animationOutputRef,
  usesWalkPoseGuide,
  type AnimationFacing,
  type AnimationGenerationJob,
  type AnimationGenerationRequest,
  type AnimationPreset,
} from '../shared/animationGeneration.js';

export interface AnimationGenerationTask {
  folder: string;
  inputPath: string[];
  request: AnimationGenerationRequest;
  background: 'transparent' | 'magenta';
  signal: AbortSignal;
}
export type AnimationGenerator = (task: AnimationGenerationTask) => Promise<string>;

export function createAnimationGenerator(
  encodeGuide: (bitmap: ReturnType<typeof walkPoseGuide>) => Buffer,
  getGeminiApiKey?: () => Promise<string | undefined>,
): AnimationGenerator {
  return async task => {
    const inputPath = [...task.inputPath];
    if (usesWalkPoseGuide(task.request)) {
      const guidePath = path.join(task.folder, 'walk-pose-guide.png');
      const guide = encodeGuide(walkPoseGuide(task.request.columns, task.request.facing));
      if (!guide.length) throw Error('Impossible de préparer le guide de marche.');
      await fs.writeFile(guidePath, guide);
      inputPath.push(guidePath);
    }
    return runProviderImage({
      provider: task.request.aiProvider,
      model: task.request.codexModel,
      folder: task.folder,
      inputPath,
      codexPrompt: animationGenerationPrompt(task.request, 'codex', task.background),
      geminiPrompt: animationGenerationPrompt(task.request, 'gemini'),
      aspectRatio: task.request.columns === 3 && task.request.rows === 2
        ? '3:2'
        : task.request.columns > task.request.rows
          ? '16:9'
          : '1:1',
      signal: task.signal,
      getGeminiApiKey,
    });
  };
}

export interface StabilizedResult {
  png: Buffer;
  width: number;
  height: number;
  cellWidth: number;
  cellHeight: number;
  frameCount: number;
  recommendedStridePx: number;
}

interface Dependencies {
  jobsRoot: string;
  generatedRoot: string;
  queue?: ImageTaskQueue;
  generate: AnimationGenerator;
  inspect: (bytes: Buffer) => ImageSize;
  png: (bytes: Buffer) => Buffer;
  stabilize: (bytes: Buffer, columns: number, rows: number, requireNativeAlpha: boolean) => StabilizedResult;
}

interface AnimationRecord {
  request: AnimationGenerationRequest;
  job: AnimationGenerationJob;
  libraryRoot: string;
  folder: string;
  sourceHash: string;
  stagedHash: string;
  candidateHash?: string;
  abort: AbortController;
}

const VALID_PRESETS: AnimationPreset[] = ['walk', 'idle', 'talk', 'run', 'jump', 'custom'];

function normalizeRequest(input: unknown): AnimationGenerationRequest {
  if (!input || typeof input !== 'object') throw Error('Demande d’animation invalide.');
  const value = input as Partial<AnimationGenerationRequest>;
  const preset = (value.preset && VALID_PRESETS.includes(value.preset)) ? value.preset : 'walk';
  const normalizedContext = imageTaskContext(value.context);
  const scope = value.scope === 'cinematic' || value.scope === 'game'
    ? value.scope
    : normalizedContext?.documentId || normalizedContext?.actorId
      ? 'cinematic'
      : 'game';
  const defaults = animationPresetSpec(preset, scope);
  if (
    !isSafeAssetRef(value.ref) ||
    typeof value.characterName !== 'string' ||
    !value.characterName.trim() ||
    value.characterName.length > 180 ||
    typeof value.instructions !== 'string' ||
    !value.instructions.trim() ||
    value.instructions.length > 5000
  ) {
    throw Error('Choisis une référence et décris l’animation souhaitée (5 000 caractères maximum).');
  }
  const slot = typeof value.slot === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value.slot.trim())
    ? value.slot.trim()
    : defaults.slot;
  const columns = Number.isInteger(value.columns) && value.columns! >= 1 && value.columns! <= 8 ? value.columns! : defaults.columns;
  const rows = Number.isInteger(value.rows) && value.rows! >= 1 && value.rows! <= 8 ? value.rows! : defaults.rows;
  if (columns * rows < 2 || columns * rows > 32) throw Error('Une animation générée contient entre 2 et 32 frames.');
  const fps = typeof value.fps === 'number' && Number.isFinite(value.fps) && value.fps >= 1 && value.fps <= 30 ? value.fps : defaults.fps;
  const loop = typeof value.loop === 'boolean' ? value.loop : defaults.loop;
  const facing: AnimationFacing = value.facing === 'left' ? 'left' : 'right';
  const speciesId = typeof value.speciesId === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value.speciesId.trim()) ? value.speciesId.trim() : undefined;
  const animationName = typeof value.animationName === 'string' && value.animationName.trim()
    ? value.animationName.trim().slice(0, 160)
    : `${value.characterName.trim()} — ${defaults.label}`.slice(0, 160);
  const stridePx = typeof value.stridePx === 'number' && Number.isFinite(value.stridePx) && value.stridePx >= 1 && value.stridePx <= 4000
    ? value.stridePx
    : defaults.stridePx;

  return {
    speciesId,
    characterName: value.characterName.trim(),
    animationName,
    preset,
    slot,
    scope,
    ref: value.ref,
    columns,
    rows,
    fps,
    loop,
    facing,
    stridePx,
    instructions: value.instructions.trim(),
    aiProvider: normalizeAiProvider(value.aiProvider),
    codexModel: normalizeAiModel(value.codexModel),
    context: normalizedContext,
  };
}

export class AnimationGenerations {
  private store: ImageJobStore<AnimationRecord>;
  readonly ready: Promise<void>;

  constructor(private readonly deps: Dependencies) {
    this.store = new ImageJobStore(deps.jobsRoot, deps.queue);
    this.ready = this.store.load(async (data, folder) => {
      const request = normalizeRequest(data.request);
      if (
        ![data.sourceHash, data.stagedHash].every(value => /^[a-f0-9]{64}$/.test(value)) ||
        !['queued', 'generating', 'applying', 'ready', 'applied', 'failed', 'cancelled', 'interrupted'].includes(data.job.status)
      ) {
        throw Error('Historique d’animation invalide.');
      }
      await this.store.localFile(folder, 'reference.png');
      const record: AnimationRecord = {
        ...data,
        request,
        folder,
        abort: new AbortController(),
        job: {
          ...data.job,
          sourceRef: request.ref,
          speciesId: request.speciesId,
          characterName: request.characterName,
          animationName: request.animationName!,
          preset: request.preset,
          slot: request.slot,
          scope: request.scope,
          columns: request.columns,
          rows: request.rows,
          frameCount: request.columns * request.rows,
          fps: request.fps,
          loop: request.loop,
          facing: request.facing,
          aiProvider: request.aiProvider,
          codexModel: request.codexModel,
          sourceUrl: this.url(data.job.id, 'source'),
          candidateUrl: undefined,
          sheetRef: undefined,
        },
      };
      const wasApplying = record.job.status === 'applying';
      const wasApplied = record.job.status === 'applied';
      if (['queued', 'generating', 'applying'].includes(record.job.status)) {
        Object.assign(record.job, {
          status: 'interrupted',
          message: 'Génération interrompue. Relance cette tâche quand tu le souhaites.',
        });
      }
      if (['ready', 'applied', 'interrupted'].includes(record.job.status)) {
        try {
          const { size } = await this.candidate(record);
          Object.assign(record.job, size, {
            cellWidth: Math.floor(size.width / request.columns),
            cellHeight: Math.floor(size.height / request.rows),
            status: 'ready',
            candidateUrl: this.url(record.job.id, 'candidate'),
            message: 'Planche d’animation récupérée. Vérifie le cycle avant de l’ajouter à la bibliothèque.',
          });
          if (wasApplying || wasApplied) {
            const outputRef = animationOutputRef(request, record.job.id);
            const target = await resolveAsset(record.libraryRoot, outputRef);
            if (imageHash(await readImage(target)) === record.candidateHash) {
              await this.provenance(record, target);
              Object.assign(record.job, {
                status: 'applied',
                sheetRef: outputRef,
                message: 'Planche déjà ajoutée à la bibliothèque.',
              });
            }
          }
        } catch {
          if (record.job.status !== 'interrupted') {
            Object.assign(record.job, {
              status: 'failed',
              message: 'La planche proposée est absente ou modifiée. Tu peux relancer la tâche.',
              candidateUrl: undefined,
            });
          }
        }
      }
      return record;
    });
  }

  private url(id: string, kind: string) {
    return `lunaria-correction://animation/${id}/${kind}`;
  }

  private record(id: unknown) {
    if (typeof id !== 'string' || !this.store.records.has(id)) throw Error('Génération d’animation inconnue.');
    return this.store.records.get(id)!;
  }

  get(id: unknown): AnimationGenerationJob {
    return { ...this.record(id).job };
  }

  async list(): Promise<ImageTask[]> {
    await this.ready;
    return [...this.store.records.values()].map(record => ({
      kind: 'animation',
      libraryRoot: record.libraryRoot,
      request: { ...record.request },
      context: record.request.context,
      job: this.get(record.job.id),
    }));
  }

  private size(bytes: Buffer) {
    const size = this.deps.inspect(bytes);
    if (!Number.isInteger(size.width) || !Number.isInteger(size.height) || size.width < 1 || size.height < 1 || size.width * size.height > 64 * 1024 * 1024) {
      throw Error('Image d’animation illisible ou trop grande.');
    }
    return size;
  }

  private async source(root: string, ref: string) {
    const file = await resolveAsset(root, ref);
    if (!['.png', '.jpg', '.jpeg', '.webp'].includes(path.extname(file).toLowerCase())) {
      throw Error('Choisis une image PNG, JPG ou WebP.');
    }
    const bytes = await readImage(file);
    this.size(bytes);
    return bytes;
  }

  async start(libraryRoot: string, input: unknown): Promise<AnimationGenerationJob> {
    await this.ready;
    const request = normalizeRequest(input);
    const root = await fs.realpath(libraryRoot);
    const source = await this.source(root, request.ref);
    const staged = this.deps.png(source);
    if (!staged.length || staged.length > IMAGE_LIMIT) throw Error('Référence convertie invalide ou supérieure à 40 Mo.');
    const id = randomUUID();
    const folder = path.join(this.deps.jobsRoot, id);
    await fs.mkdir(folder, { recursive: true });
    await fs.writeFile(path.join(folder, 'reference.png'), staged, { flag: 'wx' });
    const record: AnimationRecord = {
      request,
      libraryRoot: root,
      folder,
      sourceHash: imageHash(source),
      stagedHash: imageHash(staged),
      abort: new AbortController(),
      job: {
        id,
        sourceRef: request.ref,
        speciesId: request.speciesId,
        characterName: request.characterName,
        animationName: request.animationName!,
        preset: request.preset,
        slot: request.slot,
        scope: request.scope,
        columns: request.columns,
        rows: request.rows,
        frameCount: request.columns * request.rows,
        fps: request.fps,
        loop: request.loop,
        facing: request.facing,
        recommendedStridePx: request.stridePx,
        aiProvider: request.aiProvider,
        codexModel: request.codexModel,
        status: 'queued',
        message: 'Préparation du cycle d’animation…',
        sourceUrl: this.url(id, 'source'),
      },
    };
    await this.store.register(record, () => this.run(record));
    return this.get(id);
  }

  private async candidate(record: AnimationRecord) {
    const file = await this.store.localFile(record.folder, 'spritesheet.png');
    const bytes = await readImage(file);
    if (!record.candidateHash || imageHash(bytes) !== record.candidateHash) {
      throw Error('La planche d’animation a changé sur disque.');
    }
    return { bytes, size: this.size(bytes) };
  }

  private async generateSheet(record: AnimationRecord, background: AnimationGenerationTask['background'], folder: string) {
    const inputPath = [path.join(record.folder, 'reference.png')];
    const output = await this.deps.generate({
      folder,
      inputPath,
      request: record.request,
      background,
      signal: record.abort.signal,
    });
    if (record.abort.signal.aborted) return;
    if (!path.isAbsolute(output)) throw Error('Le générateur IA n’a pas renvoyé un chemin absolu.');
    const real = await fs.realpath(output);
    const jobFolder = await fs.realpath(record.folder);
    const generated = await fs.realpath(this.deps.generatedRoot).catch(() => '');
    if (!isWithin(jobFolder, real) && (!generated || !isWithin(generated, real))) {
      throw Error('Le résultat est hors des dossiers de génération autorisés.');
    }
    const rawBytes = await readImage(real);
    this.size(rawBytes);
    if (imageHash(rawBytes) === record.stagedHash) {
      throw Error('Le modèle a recopié la référence au lieu de générer une planche d’animation.');
    }

    record.job.message = 'Contrôle de la transparence et stabilisation des poses…';
    await this.store.save(record);

    return this.deps.stabilize(rawBytes, record.request.columns, record.request.rows, background === 'transparent');
  }

  private async run(record: AnimationRecord) {
    const codex = record.request.aiProvider !== 'gemini';
    const providerName = codex ? 'OpenAI (Codex)' : 'Gemini';
    record.job.message = `${providerName} génère la planche ${record.request.columns}×${record.request.rows}…`;
    await this.store.save(record);

    let stabilized: StabilizedResult | undefined;
    try {
      stabilized = await this.generateSheet(record, codex ? 'transparent' : 'magenta', record.folder);
    } catch (error) {
      if (!codex || !(error instanceof MissingNativeAlphaError)) throw error;
      if (record.abort.signal.aborted) return;
      record.job.message = 'Codex a renvoyé un fond opaque. Nouvel essai avec un fond de détourage…';
      await this.store.save(record);
      const fallbackFolder = path.join(record.folder, 'magenta');
      await fs.mkdir(fallbackFolder);
      if (record.abort.signal.aborted) return;
      stabilized = await this.generateSheet(record, 'magenta', fallbackFolder);
    }
    if (!stabilized || record.abort.signal.aborted) return;
    if (!stabilized.png.length || stabilized.png.length > IMAGE_LIMIT) {
      throw Error('La planche d’animation dépasse 40 Mo.');
    }
    const fingerprint = imageHash(stabilized.png);
    if (record.abort.signal.aborted) return;

    record.candidateHash = fingerprint;
    await this.store.save(record);
    await fs.writeFile(path.join(record.folder, 'spritesheet.png'), stabilized.png);
    if (record.abort.signal.aborted) return;

    Object.assign(record.job, {
      width: stabilized.width,
      height: stabilized.height,
      cellWidth: stabilized.cellWidth,
      cellHeight: stabilized.cellHeight,
      frameCount: stabilized.frameCount,
      recommendedStridePx: record.request.stridePx ?? stabilized.recommendedStridePx,
      status: 'ready',
      candidateUrl: this.url(record.job.id, 'candidate'),
      message: 'Cycle d’animation prêt et stabilisé. Prévisualise la boucle avant de l’ajouter au personnage.',
    });
  }

  cancel(id: unknown): AnimationGenerationJob {
    const record = this.record(id);
    if (['applying', 'applied'].includes(record.job.status)) throw Error('Cette animation est déjà importée.');
    record.abort.abort();
    Object.assign(record.job, { status: 'cancelled', message: 'Génération annulée.' });
    void this.store.save(record);
    return this.get(id);
  }

  async image(id: unknown, kind: string) {
    const record = this.record(id);
    if (kind !== 'source' && (kind !== 'candidate' || !['ready', 'applying', 'applied'].includes(record.job.status))) {
      throw Error('Image d’animation indisponible.');
    }
    const file = await this.store.localFile(record.folder, kind === 'source' ? 'reference.png' : 'spritesheet.png');
    return { bytes: await readImage(file), mime: 'image/png' };
  }

  private async provenance(record: AnimationRecord, target: string) {
    const data = JSON.stringify({
      version: 1,
      taskId: record.job.id,
      createdAt: record.job.createdAt,
      characterName: record.request.characterName,
      speciesId: record.request.speciesId,
      preset: record.request.preset,
      slot: record.request.slot,
      columns: record.request.columns,
      rows: record.request.rows,
      fps: record.request.fps,
      loop: record.request.loop,
      facing: record.request.facing,
      scope: record.request.scope ?? 'game',
      reference: record.request.ref,
      instructions: record.request.instructions,
      aiProvider: record.request.aiProvider ?? 'openai',
      model: record.request.codexModel ?? 'automatic',
      referenceHash: record.sourceHash,
      imageHash: record.candidateHash,
    }, null, 2);
    try {
      await fs.writeFile(`${target}.json`, data, { flag: 'wx' });
    } catch (error) {
      if (
        (error as NodeJS.ErrnoException).code !== 'EEXIST' ||
        !isWithin(record.libraryRoot, await fs.realpath(`${target}.json`)) ||
        await fs.readFile(`${target}.json`, 'utf8') !== data
      ) {
        throw error;
      }
    }
  }

  async apply(libraryRoot: string, id: unknown): Promise<AnimationGenerationJob> {
    const record = this.record(id);
    const root = await fs.realpath(libraryRoot);
    if (root !== record.libraryRoot) throw Error('Reconnecte la bibliothèque de cette animation.');
    if (this.record(id) !== record) throw Error('La tâche a été retirée.');
    if (record.job.status === 'applied') {
      const target = await resolveAsset(root, animationOutputRef(record.request, record.job.id));
      if (imageHash(await readImage(target)) !== record.candidateHash) {
        throw Error('La planche d’animation importée a changé sur disque.');
      }
      return this.get(id);
    }
    if (record.job.status !== 'ready') throw Error('La planche d’animation n’est pas prête.');
    record.job.status = 'applying';
    try {
      await this.store.save(record);
      const { bytes } = await this.candidate(record);
      if (imageHash(await this.source(root, record.request.ref)) !== record.sourceHash) {
        throw Error('La référence a changé depuis la génération. Relance une proposition.');
      }
      const ref = animationOutputRef(record.request, record.job.id);
      const relative = ref.slice('library://'.length);
      let directory = root;
      for (const part of relative.split('/').slice(0, -1)) {
        directory = path.join(directory, part);
        await fs.mkdir(directory, { recursive: true });
        if (!isWithin(root, await fs.realpath(directory))) {
          throw Error('Le dossier des animations sort de la bibliothèque.');
        }
      }
      const target = path.join(root, relative);
      try {
        await fs.writeFile(target, bytes, { flag: 'wx' });
      } catch (error) {
        if (
          (error as NodeJS.ErrnoException).code !== 'EEXIST' ||
          !isWithin(root, await fs.realpath(target)) ||
          imageHash(await readImage(target)) !== record.candidateHash
        ) {
          throw error;
        }
      }
      await this.provenance(record, target);
      Object.assign(record.job, {
        status: 'applied',
        sheetRef: ref,
        message: 'Planche ajoutée à la bibliothèque. Tu peux l’associer au personnage.',
      });
      await this.store.save(record);
      return this.get(id);
    } catch (error) {
      if (!record.job.sheetRef) record.job.status = 'ready';
      await this.store.save(record);
      throw error;
    }
  }

  async retry(root: string, id: string) {
    await this.ready;
    const record = this.record(id);
    if (await fs.realpath(root) !== record.libraryRoot) throw Error('Reconnecte la bibliothèque de cette animation.');
    if (!['failed', 'cancelled', 'interrupted'].includes(record.job.status)) {
      throw Error('Cette tâche ne peut pas être relancée.');
    }
    return this.start(root, record.request);
  }

  async remove(id: string) {
    await this.ready;
    return this.store.remove(id);
  }

  flush() { return this.store.flush(); }
  close() { return this.store.close(); }
}
