import { promises as fs, constants } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  IMAGE_LIMIT as LIMIT,
  imageHash as hash,
  readImage,
} from "./imageFiles.js";
import type { AssetRef } from "../shared/model.js";
import {
  normalizeCodexModel,
  normalizeCodexReasoningEffort,
  isSixteenNine,
  type ImageSize,
} from "../shared/backgroundCorrection.js";
import {
  terrainGenerationPrompt,
  type TerrainGenerationJob,
  type TerrainGenerationRequest,
  type TerrainState,
} from "../shared/terrainGeneration.js";
import { isWithin, resolveAsset } from "./files.js";
import { runCodexImage } from "./codexImageCorrection.js";
import { ImageJobStore, type ImageTaskQueue } from "./imageJobs.js";
import { imageTaskContext, type ImageTask } from "../shared/imageTasks.js";
import { isSafeAssetRef } from "../shared/schema.js";

export interface TerrainGenerationTask {
  folder: string;
  inputPath: string;
  request: TerrainGenerationRequest;
  signal: AbortSignal;
  state: TerrainState;
}
export type TerrainGenerator = (task: TerrainGenerationTask) => Promise<string>;
export const generateTerrainWithCodex: TerrainGenerator = (task) =>
  runCodexImage({
    ...task,
    codexModel: task.request.codexModel,
    codexReasoningEffort: task.request.codexReasoningEffort,
    prompt: terrainGenerationPrompt(task.request, task.state),
  });
interface Dependencies {
  queue?: ImageTaskQueue;
  jobsRoot: string;
  generatedRoot: string;
  generate: TerrainGenerator;
  inspect: (bytes: Buffer) => ImageSize;
  png: (bytes: Buffer) => Buffer;
  finalize: (bytes: Buffer, targetSize?: ImageSize) => Buffer;
}
interface Record {
  request: TerrainGenerationRequest;
  job: TerrainGenerationJob;
  libraryRoot: string;
  folder: string;
  inputPath: string;
  candidatePath: string;
  restoredCandidatePath: string;
  sourceHash: string;
  abort: AbortController;
}
export class TerrainGenerations {
  private store: ImageJobStore<Record>;
  private get records() {
    return this.store.records;
  }
  readonly ready: Promise<void>;
  constructor(private readonly deps: Dependencies) {
    this.store = new ImageJobStore(deps.jobsRoot, deps.queue);
    this.ready = this.store.load(async (data, folder) => {
      if (
        !isSafeAssetRef(data.request?.ref) ||
        !/^[a-f0-9]{64}$/.test(data.sourceHash) ||
        ![
          "queued",
          "generating",
          "applying",
          "ready",
          "applied",
          "failed",
          "cancelled",
          "interrupted",
        ].includes(data.job.status)
      )
        throw Error("Historique invalide.");
      const request = {
        ...data.request,
        context: imageTaskContext(data.request.context),
        codexModel: normalizeCodexModel(data.request.codexModel),
        codexReasoningEffort: normalizeCodexReasoningEffort(data.request.codexReasoningEffort),
      };
      const id = data.job.id;
      const record: Record = {
        request,
        libraryRoot: data.libraryRoot,
        folder,
        sourceHash: data.sourceHash,
        abort: new AbortController(),
        inputPath: await this.store.localFile(folder, "reference.png"),
        candidatePath: path.join(folder, "terrain.png"),
        restoredCandidatePath: path.join(folder, "terrain-restored.png"),
        job: {
          ...data.job,
          sourceRef: request.ref,
          sourceUrl: `lunaria-correction://terrain/${id}/source`,
          candidateUrl: undefined,
          restoredCandidateUrl: undefined,
          terrainRef:
            data.job.status === "applied"
              ? (`library://studio_generated/terrains/terrain-${id}-pollue.png` as AssetRef)
              : undefined,
          restoredTerrainRef: data.job.status === "applied"
            ? (`library://studio_generated/terrains/terrain-${id}-nettoye.png` as AssetRef)
            : undefined,
        },
      };
      if (["queued", "generating", "applying"].includes(record.job.status)) {
        record.job.status = "interrupted";
        record.job.message =
          "La génération a été interrompue. Tu peux la relancer.";
      }
      if (["ready", "applied", "interrupted"].includes(record.job.status)) {
        try {
          const { size } = await this.readPair(record);
          record.job.candidateUrl = `lunaria-correction://terrain/${id}/candidate`;
          record.job.restoredCandidateUrl = `lunaria-correction://terrain/${id}/restored`;
          Object.assign(record.job, size);
          if (record.job.status === "interrupted") {
            record.job.status = "ready";
            record.job.message =
              "Les deux états ont été récupérés. Vérifie-les avant de les valider.";
          }
        } catch {
          if (record.job.status !== "interrupted") {
            record.job.status = "failed";
            record.job.message =
              "Un des deux états est absent, illisible ou incompatible. Tu peux relancer cette tâche.";
          }
        }
      }
      if (data.job.status === "applying" && record.job.status === "ready") {
        try {
          const terrainRef = `library://studio_generated/terrains/terrain-${id}-pollue.png` as AssetRef;
          const restoredTerrainRef = `library://studio_generated/terrains/terrain-${id}-nettoye.png` as AssetRef;
          const target = await resolveAsset(record.libraryRoot, terrainRef);
          const restoredTarget = await resolveAsset(record.libraryRoot, restoredTerrainRef);
          if (
            hash(await readImage(target)) ===
            hash(await readImage(record.candidatePath)) &&
            hash(await readImage(restoredTarget)) === hash(await readImage(record.restoredCandidatePath))
          ) {
            Object.assign(record.job, {
              status: "applied",
              message: "Les deux états ont été ajoutés à la bibliothèque avant l’interruption.",
              terrainRef,
              restoredTerrainRef,
            });
          }
        } catch {
          /* No completed import to recover; explicit validation can still import it. */
        }
      }
      return record;
    });
  }
  async list(): Promise<ImageTask[]> {
    await this.ready;
    return [...this.records.values()].map((record) => ({
      kind: "terrain",
      libraryRoot: record.libraryRoot,
      context: record.request.context,
      request: { ...record.request },
      job: this.get(record.job.id),
    }));
  }
  async remove(id: string) {
    await this.ready;
    return this.store.remove(id);
  }
  async retry(root: string, id: string) {
    await this.ready;
    const record = this.record(id);
    if ((await fs.realpath(root)) !== record.libraryRoot)
      throw Error("Reconnecte la bibliothèque de cette tâche.");
    if (!["failed", "cancelled", "interrupted"].includes(record.job.status))
      throw Error("Cette tâche ne peut pas être relancée.");
    return this.start(root, record.request);
  }
  flush() {
    return this.store.flush();
  }
  private record(id: unknown): Record {
    if (typeof id !== "string" || !this.records.has(id))
      throw new Error("Génération de terrain inconnue.");
    return this.records.get(id)!;
  }
  get(id: unknown): TerrainGenerationJob {
    return { ...this.record(id).job };
  }
  private size(bytes: Buffer): ImageSize {
    const size = this.deps.inspect(bytes);
    if (
      !Number.isInteger(size.width) ||
      !Number.isInteger(size.height) ||
      size.width < 1 ||
      size.height < 1 ||
      size.width * size.height > 64 * 1024 * 1024
    )
      throw new Error("Image illisible ou trop grande.");
    return size;
  }
  private async readPair(record: Record) {
    await this.store.localFile(record.folder, "terrain.png");
    await this.store.localFile(record.folder, "terrain-restored.png");
    const polluted = await readImage(record.candidatePath), restored = await readImage(record.restoredCandidatePath);
    const size = this.size(polluted), cleanSize = this.size(restored);
    if (!isSixteenNine(size) || size.width !== cleanSize.width || size.height !== cleanSize.height)
      throw Error("Les deux états doivent avoir les mêmes dimensions au format 16:9.");
    if (hash(polluted) === record.sourceHash || hash(restored) === record.sourceHash || hash(polluted) === hash(restored))
      throw Error("Les terrains pollué et nettoyé doivent être deux images différentes.");
    this.deps.finalize(polluted); this.deps.finalize(restored);
    return { polluted, restored, size };
  }
  async start(
    libraryRoot: string,
    input: unknown,
  ): Promise<TerrainGenerationJob> {
    await this.ready;
    if (!input || typeof input !== "object")
      throw new Error("Demande de terrain invalide.");
    const request = {
      ...(input as TerrainGenerationRequest),
      context: imageTaskContext((input as TerrainGenerationRequest).context),
      codexModel: normalizeCodexModel(
        (input as TerrainGenerationRequest).codexModel,
      ),
      codexReasoningEffort: normalizeCodexReasoningEffort((input as TerrainGenerationRequest).codexReasoningEffort),
    };
    if (
      typeof request.ref !== "string" ||
      typeof request.levelTitle !== "string" ||
      request.levelTitle.length > 300 ||
      typeof request.instructions !== "string" ||
      request.instructions.length > 5000
    )
      throw new Error("Paramètres de terrain invalides.");
    const root = await fs.realpath(libraryRoot),
      source = await resolveAsset(root, request.ref);
    if (
      ![".png", ".jpg", ".jpeg", ".webp"].includes(
        path.extname(source).toLowerCase(),
      )
    )
      throw new Error("Choisis une image PNG, JPG ou WebP.");
    const bytes = await readImage(source);
    this.size(bytes);
    const staged = this.deps.png(bytes);
    if (staged.length > LIMIT)
      throw new Error("L’image de référence convertie dépasse 40 Mo.");
    const id = randomUUID(),
      folder = path.join(this.deps.jobsRoot, id),
      inputPath = path.join(folder, "reference.png");
    await fs.mkdir(folder, { recursive: true });
    await fs.writeFile(inputPath, staged, { flag: "wx" });
    const record: Record = {
      request,
      libraryRoot: root,
      folder,
      inputPath,
      candidatePath: path.join(folder, "terrain.png"),
      restoredCandidatePath: path.join(folder, "terrain-restored.png"),
      sourceHash: hash(staged),
      abort: new AbortController(),
      job: {
        id,
        sourceRef: request.ref,
        codexModel: request.codexModel,
        codexReasoningEffort: request.codexReasoningEffort,
        status: "generating",
        message: "Création des terrains pollué et nettoyé…",
        sourceUrl: `lunaria-correction://terrain/${id}/source`,
      },
    };
    await this.store.register(record, () => this.run(record, request));
    return this.get(id);
  }
  private async run(record: Record, request: TerrainGenerationRequest) {
    try {
      let targetSize: ImageSize | undefined;
      for (const state of ["polluted", "restored"] as const) {
        if (record.abort.signal.aborted) return;
        record.job.message = state === "polluted"
          ? "Étape 1/2 : création du terrain pollué…"
          : "Étape 2/2 : nettoyage du même terrain, cadrage conservé…";
        await this.store.save(record);
        const stageFolder = path.join(record.folder,state);
        await fs.mkdir(stageFolder,{recursive:true});
        const inputPath = state === "polluted" ? record.inputPath : record.candidatePath;
        const output = await this.deps.generate({
          folder: stageFolder,
          inputPath,
          request,
          state,
          signal: record.abort.signal,
        });
        if (record.abort.signal.aborted) return;
        if (!path.isAbsolute(output))
          throw new Error("Codex n’a pas renvoyé un chemin absolu.");
        const real = await fs.realpath(output),
          folder = await fs.realpath(record.folder);
        const generatedRoot = await fs
          .realpath(this.deps.generatedRoot)
          .catch(() => "");
        if (
          !isWithin(folder, real) &&
          (!generatedRoot || !isWithin(generatedRoot, real))
        )
          throw new Error(
            "Le résultat est hors des dossiers de génération autorisés.",
          );
        if (real === (await fs.realpath(inputPath)))
          throw new Error(
            "Codex a renvoyé la référence au lieu d’un terrain généré.",
          );
        const bytes = await readImage(real),
          size = this.size(bytes);
        if (!isSixteenNine(size))
          throw new Error(
            "Le terrain généré ne respecte pas le format 16:9. Relance une proposition.",
          );
        const png = this.deps.finalize(bytes,targetSize),
          finalSize = this.size(png);
        if (hash(png) === record.sourceHash)
          throw new Error(
            "Codex a recopié la référence au lieu de générer un terrain.",
          );
        if (
          png.length > LIMIT ||
          finalSize.width !== (targetSize ?? size).width ||
          finalSize.height !== (targetSize ?? size).height
        )
          throw new Error("Le terrain final est invalide ou dépasse 40 Mo.");
        await fs.writeFile(state === "polluted" ? record.candidatePath : record.restoredCandidatePath, png);
        targetSize=finalSize;
      }
      if (record.abort.signal.aborted) return;
      const {size} = await this.readPair(record);
      Object.assign(record.job, {
        status: "ready",
        message: "Les deux états sont prêts. Vérifie les terrains pollué et nettoyé avant de les utiliser.",
        candidateUrl: `lunaria-correction://terrain/${record.job.id}/candidate`,
        restoredCandidateUrl: `lunaria-correction://terrain/${record.job.id}/restored`,
        ...size,
      });
    } catch (error) {
      if (!record.abort.signal.aborted)
        Object.assign(record.job, {
          status: "failed",
          message:
            error instanceof Error ? error.message : "La génération a échoué.",
        });
    }
  }
  cancel(id: unknown): TerrainGenerationJob {
    const record = this.record(id);
    if (["applying", "applied"].includes(record.job.status))
      throw new Error("Ce terrain est déjà validé.");
    record.abort.abort();
    Object.assign(record.job, {
      status: "cancelled",
      message: "Génération annulée. Le terrain du niveau reste inchangé.",
    });
    void this.store.save(record);
    return this.get(id);
  }
  async image(id: unknown, kind: string) {
    const record = this.record(id);
    if (
      kind !== "source" &&
      (!["candidate", "restored"].includes(kind) ||
        !["ready", "applying", "applied"].includes(record.job.status))
    )
      throw new Error("Image de terrain indisponible.");
    return {
      bytes: await readImage(
        kind === "source" ? record.inputPath : kind === "restored" ? record.restoredCandidatePath : record.candidatePath,
      ),
      mime: "image/png",
    };
  }
  async apply(libraryRoot: string, id: unknown): Promise<TerrainGenerationJob> {
    const record = this.record(id);
    if ((await fs.realpath(libraryRoot)) !== record.libraryRoot)
      throw new Error(
        "La bibliothèque a changé. Rouvre la génération du terrain.",
      );
    if (this.record(id) !== record) throw Error("La tâche a été retirée.");
    if (record.job.status === "applied") return this.get(id);
    if (record.job.status !== "ready")
      throw new Error("Le terrain n’est pas prêt.");
    record.job.status = "applying";
    try {
      await this.store.save(record);
      await this.readPair(record);
      const folder = path.join(
        record.libraryRoot,
        "studio_generated",
        "terrains",
      );
      // Check each parent before creating a child, including existing symlinks.
      for (const directory of [path.dirname(folder), folder]) {
        await fs.mkdir(directory, { recursive: true });
        if (!isWithin(record.libraryRoot, await fs.realpath(directory)))
          throw new Error("Le dossier des terrains sort de la bibliothèque.");
      }
      const filename = `terrain-${record.job.id}-pollue.png`;
      const restoredFilename = `terrain-${record.job.id}-nettoye.png`;
      const created: {target:string; fingerprint:string}[]=[];
      try {
        for (const [source,name] of [[record.candidatePath,filename],[record.restoredCandidatePath,restoredFilename]]) {
          const target=path.join(folder,name),fingerprint=hash(await readImage(source));
          try {
            await fs.copyFile(source,target,constants.COPYFILE_EXCL);
            created.push({target,fingerprint});
          } catch (error) {
            if ((error as NodeJS.ErrnoException).code!=="EEXIST" || hash(await readImage(target))!==fingerprint) throw error;
          }
        }
      } catch (error) {
        for (const {target,fingerprint} of created) {
          if (isWithin(record.libraryRoot,await fs.realpath(target)) && hash(await readImage(target))===fingerprint)
            await fs.unlink(target);
        }
        throw error;
      }
      Object.assign(record.job, {
        status: "applied",
        message: "Terrains pollué et nettoyé ajoutés dans deux fichiers distincts.",
        terrainRef:
          `library://studio_generated/terrains/${filename}` as AssetRef,
        restoredTerrainRef: `library://studio_generated/terrains/${restoredFilename}` as AssetRef,
      });
      await this.store.save(record);
      return this.get(id);
    } catch (error) {
      if (!record.job.terrainRef) record.job.status = "ready";
      await this.store.save(record);
      throw error;
    }
  }
  close() {
    return this.store.close();
  }
}
