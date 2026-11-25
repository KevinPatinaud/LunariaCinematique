import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { IMAGE_LIMIT, imageHash, readImage } from './imageFiles.js';
import { isWithin, resolveAsset } from './files.js';
import { ImageJobStore, type ImageTaskQueue } from './imageJobs.js';
import { runCodexImage } from './codexImageCorrection.js';
import { runProviderImage } from './aiImageRouter.js';
import { normalizeAiProvider } from '../shared/aiProviders.js';
import { normalizeCodexModel, type ImageSize } from '../shared/backgroundCorrection.js';
import { imageTaskContext, type ImageTask } from '../shared/imageTasks.js';
import { isSafeAssetRef } from '../shared/schema.js';
import { poseGenerationPrompt, poseOutputRef, type PoseGenerationJob, type PoseGenerationRequest } from '../shared/poseGeneration.js';

export interface PoseGenerationTask {
  folder: string;
  inputPath: string[];
  request: PoseGenerationRequest;
  signal: AbortSignal;
}
export type PoseGenerator = (task: PoseGenerationTask) => Promise<string>;
export const generatePoseWithCodex: PoseGenerator = task => runCodexImage({
  ...task, codexModel: task.request.codexModel, prompt: poseGenerationPrompt(task.request, task.inputPath.length > 1),
});
export function createPoseGenerator(getGeminiApiKey?: () => Promise<string | undefined>): PoseGenerator {
  return task => {
    const prompt = poseGenerationPrompt(task.request, task.inputPath.length > 1);
    return runProviderImage({
      provider: task.request.aiProvider,
      model: task.request.codexModel,
      folder: task.folder,
      inputPath: task.inputPath,
      codexPrompt: prompt,
      geminiPrompt: prompt,
      signal: task.signal,
      getGeminiApiKey,
    });
  };
}
interface Dependencies {
  jobsRoot: string;
  generatedRoot: string;
  queue?: ImageTaskQueue;
  generate: PoseGenerator;
  inspect: (bytes: Buffer) => ImageSize;
  png: (bytes: Buffer) => Buffer;
  finalize: (bytes: Buffer, provider?: import('../shared/aiProviders.js').AiImageProvider) => Buffer;
}
interface PoseRecord {
  request: PoseGenerationRequest;
  job: PoseGenerationJob;
  libraryRoot: string;
  folder: string;
  sourceHash: string;
  currentHash: string;
  stagedHashes: string[];
  candidateHash?: string;
  abort: AbortController;
}
function normalizeRequest(input: unknown): PoseGenerationRequest {
  if (!input || typeof input !== 'object') throw Error('Demande de pose invalide.');
  const value = input as PoseGenerationRequest;
  if (!isSafeAssetRef(value.ref) || !isSafeAssetRef(value.currentRef) || typeof value.characterName !== 'string' || !value.characterName.trim() || value.characterName.length > 180 || typeof value.instructions !== 'string' || !value.instructions.trim() || value.instructions.length > 5000)
    throw Error('Choisis une référence et décris la pose souhaitée (5 000 caractères maximum).');
  return { ref: value.ref, currentRef: value.currentRef, characterName: value.characterName.trim(), instructions: value.instructions.trim(), aiProvider: normalizeAiProvider(value.aiProvider), codexModel: normalizeCodexModel(value.codexModel), context: imageTaskContext(value.context) };
}
export class PoseGenerations {
  private store: ImageJobStore<PoseRecord>;
  readonly ready: Promise<void>;
  constructor(private readonly deps: Dependencies) {
    this.store = new ImageJobStore(deps.jobsRoot, deps.queue);
    this.ready = this.store.load(async (data, folder) => {
      const request = normalizeRequest(data.request);
      if (![data.sourceHash, data.currentHash, ...data.stagedHashes].every(value => /^[a-f0-9]{64}$/.test(value)) || !['queued','generating','applying','ready','applied','failed','cancelled','interrupted'].includes(data.job.status)) throw Error('Historique de pose invalide.');
      await this.store.localFile(folder, 'reference.png');
      if (request.ref !== request.currentRef) await this.store.localFile(folder, 'current.png');
      const record: PoseRecord = { ...data, request, folder, abort: new AbortController(), job: {
        ...data.job, sourceRef: request.ref, aiProvider: request.aiProvider, codexModel: request.codexModel, sourceUrl: this.url(data.job.id, 'source'), candidateUrl: undefined, poseRef: undefined,
      } };
      const wasApplying = record.job.status === 'applying', wasApplied = record.job.status === 'applied';
      if (['queued','generating','applying'].includes(record.job.status)) Object.assign(record.job, { status: 'interrupted', message: 'Génération interrompue. Relance cette tâche quand tu le souhaites.' });
      if (['ready','applied','interrupted'].includes(record.job.status)) {
        try {
          const { size } = await this.candidate(record);
          Object.assign(record.job, size, { status: 'ready', candidateUrl: this.url(record.job.id, 'candidate'), message: 'Pose récupérée. Vérifie-la avant de l’utiliser.' });
          if (wasApplying || wasApplied) {
            const target = await resolveAsset(record.libraryRoot, poseOutputRef(request, record.job.id));
            if (imageHash(await readImage(target)) === record.candidateHash) {
              await this.provenance(record, target);
              Object.assign(record.job, { status: 'applied', poseRef: poseOutputRef(request, record.job.id), message: 'Pose déjà ajoutée à la bibliothèque.' });
            }
          }
        } catch {
          if (record.job.status !== 'interrupted') Object.assign(record.job, { status: 'failed', message: 'La proposition ou le média importé est absent ou modifié. Tu peux relancer la tâche.', candidateUrl: undefined });
        }
      }
      return record;
    });
  }
  private url(id: string, kind: string) { return `lunaria-correction://pose/${id}/${kind}`; }
  private record(id: unknown) {
    if (typeof id !== 'string' || !this.store.records.has(id)) throw Error('Génération de pose inconnue.');
    return this.store.records.get(id)!;
  }
  get(id: unknown): PoseGenerationJob { return { ...this.record(id).job }; }
  async list(): Promise<ImageTask[]> {
    await this.ready;
    return [...this.store.records.values()].map(record => ({ kind: 'pose', libraryRoot: record.libraryRoot, request: { ...record.request }, context: record.request.context, job: this.get(record.job.id) }));
  }
  private size(bytes: Buffer) {
    const size = this.deps.inspect(bytes);
    if (!Number.isInteger(size.width) || !Number.isInteger(size.height) || size.width < 1 || size.height < 1 || size.width * size.height > 64 * 1024 * 1024) throw Error('Image de pose illisible ou trop grande.');
    return size;
  }
  private async source(root: string, ref: string) {
    const file = await resolveAsset(root, ref);
    if (!['.png','.jpg','.jpeg','.webp'].includes(path.extname(file).toLowerCase())) throw Error('Choisis une image PNG, JPG ou WebP.');
    const bytes = await readImage(file);
    this.size(bytes);
    return bytes;
  }
  async start(libraryRoot: string, input: unknown) {
    await this.ready;
    const request = normalizeRequest(input), root = await fs.realpath(libraryRoot);
    const source = await this.source(root, request.ref), current = request.ref === request.currentRef ? source : await this.source(root, request.currentRef);
    const staged = [source, ...(request.ref !== request.currentRef ? [current] : [])].map(bytes => this.deps.png(bytes));
    if (staged.some(bytes => !bytes.length || bytes.length > IMAGE_LIMIT)) throw Error('Référence convertie invalide ou supérieure à 40 Mo.');
    const id = randomUUID(), folder = path.join(this.deps.jobsRoot, id);
    await fs.mkdir(folder, { recursive: true });
    await fs.writeFile(path.join(folder, 'reference.png'), staged[0], { flag: 'wx' });
    if (staged[1]) await fs.writeFile(path.join(folder, 'current.png'), staged[1], { flag: 'wx' });
    const record: PoseRecord = { request, libraryRoot: root, folder, sourceHash: imageHash(source), currentHash: imageHash(current), stagedHashes: staged.map(imageHash), abort: new AbortController(), job: {
      id, sourceRef: request.ref, aiProvider: request.aiProvider, codexModel: request.codexModel, status: 'queued', message: 'Préparation de la pose…', sourceUrl: this.url(id, 'source'),
    } };
    await this.store.register(record, () => this.run(record));
    return this.get(id);
  }
  private async candidate(record: PoseRecord) {
    const file = await this.store.localFile(record.folder, 'pose.png'), bytes = await readImage(file);
    if (!record.candidateHash || imageHash(bytes) !== record.candidateHash) throw Error('La proposition a changé sur disque.');
    this.deps.finalize(bytes);
    return { bytes, size: this.size(bytes) };
  }
  private async run(record: PoseRecord) {
    const inputPath = [path.join(record.folder, 'reference.png'), ...(record.request.ref !== record.request.currentRef ? [path.join(record.folder, 'current.png')] : [])];
    const output = await this.deps.generate({ folder: record.folder, inputPath, request: record.request, signal: record.abort.signal });
    if (record.abort.signal.aborted) return;
    if (!path.isAbsolute(output)) throw Error('Codex n’a pas renvoyé un chemin absolu.');
    const real = await fs.realpath(output), folder = await fs.realpath(record.folder), generated = await fs.realpath(this.deps.generatedRoot).catch(() => '');
    if (!isWithin(folder, real) && (!generated || !isWithin(generated, real))) throw Error('Le résultat est hors des dossiers de génération autorisés.');
    const bytes = await readImage(real);
    this.size(bytes);
    const png = this.deps.finalize(bytes, record.request.aiProvider), size = this.size(png), fingerprint = imageHash(png);
    if (!png.length || png.length > IMAGE_LIMIT) throw Error('La pose dépasse 40 Mo.');
    if (record.stagedHashes.includes(fingerprint)) throw Error('Codex a recopié une référence au lieu de générer une pose.');
    if (record.abort.signal.aborted) return;
    // Save fingerprint before the complete file: interrupted writes cannot be recovered as ready.
    record.candidateHash = fingerprint;
    await this.store.save(record);
    await fs.writeFile(path.join(record.folder, 'pose.png'), png);
    if (record.abort.signal.aborted) return;
    Object.assign(record.job, size, { status: 'ready', candidateUrl: this.url(record.job.id, 'candidate'), message: 'Pose prête. Vérifie sa fidélité et son expression avant de l’utiliser.' });
  }
  cancel(id: unknown) {
    const record = this.record(id);
    if (['applying','applied'].includes(record.job.status)) throw Error('Cette pose est déjà importée.');
    record.abort.abort();
    Object.assign(record.job, { status: 'cancelled', message: 'Génération annulée.' });
    void this.store.save(record);
    return this.get(id);
  }
  async image(id: unknown, kind: string) {
    const record = this.record(id);
    if (kind !== 'source' && (kind !== 'candidate' || !['ready','applying','applied'].includes(record.job.status))) throw Error('Image de pose indisponible.');
    const file = await this.store.localFile(record.folder, kind === 'source' ? 'reference.png' : 'pose.png');
    return { bytes: await readImage(file), mime: 'image/png' };
  }
  private async provenance(record: PoseRecord, target: string) {
    const data = JSON.stringify({ version: 1, taskId: record.job.id, createdAt: record.job.createdAt, characterName: record.request.characterName, reference: record.request.ref, currentRef: record.request.currentRef, instructions: record.request.instructions, codexModel: record.request.codexModel ?? 'automatic', referenceHash: record.sourceHash, imageHash: record.candidateHash }, null, 2);
    try { await fs.writeFile(`${target}.json`, data, { flag: 'wx' }); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST' || !isWithin(record.libraryRoot, await fs.realpath(`${target}.json`)) || await fs.readFile(`${target}.json`, 'utf8') !== data) throw error; }
  }
  async apply(libraryRoot: string, id: unknown) {
    const record = this.record(id), root = await fs.realpath(libraryRoot);
    if (root !== record.libraryRoot) throw Error('Reconnecte la bibliothèque de cette pose.');
    if (this.record(id) !== record) throw Error('La tâche a été retirée.');
    if (record.job.status === 'applied') {
      const target = await resolveAsset(root, poseOutputRef(record.request, record.job.id));
      if (imageHash(await readImage(target)) !== record.candidateHash) throw Error('La pose importée a changé sur disque.');
      return this.get(id);
    }
    if (record.job.status !== 'ready') throw Error('La pose n’est pas prête.');
    record.job.status = 'applying';
    try {
      await this.store.save(record);
      const { bytes } = await this.candidate(record);
      if (imageHash(await this.source(root, record.request.ref)) !== record.sourceHash || imageHash(await this.source(root, record.request.currentRef)) !== record.currentHash) throw Error('Une référence a changé depuis la génération. Relance une proposition.');
      const ref = poseOutputRef(record.request, record.job.id), relative = ref.slice('library://'.length);
      let directory = root;
      for (const part of relative.split('/').slice(0, -1)) {
        directory = path.join(directory, part);
        await fs.mkdir(directory, { recursive: true });
        if (!isWithin(root, await fs.realpath(directory))) throw Error('Le dossier des poses sort de la bibliothèque.');
      }
      const target = path.join(root, relative);
      try { await fs.writeFile(target, bytes, { flag: 'wx' }); }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST' || !isWithin(root, await fs.realpath(target)) || imageHash(await readImage(target)) !== record.candidateHash) throw error; }
      await this.provenance(record, target);
      Object.assign(record.job, { status: 'applied', poseRef: ref, message: 'Pose ajoutée à la bibliothèque. Tu peux l’affecter à un personnage.' });
      await this.store.save(record);
      return this.get(id);
    } catch (error) {
      if (!record.job.poseRef) record.job.status = 'ready';
      await this.store.save(record);
      throw error;
    }
  }
  async retry(root: string, id: string) {
    await this.ready;
    const record = this.record(id);
    if (await fs.realpath(root) !== record.libraryRoot) throw Error('Reconnecte la bibliothèque de cette pose.');
    if (!['failed','cancelled','interrupted'].includes(record.job.status)) throw Error('Cette tâche ne peut pas être relancée.');
    return this.start(root, record.request);
  }
  async remove(id: string) { await this.ready; return this.store.remove(id); }
  flush() { return this.store.flush(); }
  close() { return this.store.close(); }
}
