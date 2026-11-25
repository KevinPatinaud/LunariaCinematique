import { promises as fs, constants } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  IMAGE_LIMIT as LIMIT,
  imageHash as hash,
  readImage,
} from "./imageFiles.js";
import type {
  BackgroundCorrectionJob,
  BackgroundCorrectionRequest,
  BackgroundPreparation,
  CoreRect,
  PanoramaResolution,
} from "../shared/backgroundCorrection.js";
import {
  PANORAMA_WIDTHS,
  coreRect,
  isSixteenNine,
  normalizeCodexModel,
} from "../shared/backgroundCorrection.js";
import type { AssetRef } from "../shared/model.js";
import { assetUrl, libraryKey } from "./library.js";
import { isWithin, resolveAsset } from "./files.js";
import type { ImageGenerator } from "./codexImageCorrection.js";
import { ImageJobStore, type ImageTaskQueue } from "./imageJobs.js";
import { imageTaskContext, type ImageTask } from "../shared/imageTasks.js";
import { normalizeAiProvider } from "../shared/aiProviders.js";
import { isSafeAssetRef } from "../shared/schema.js";

type Size = { width: number; height: number };
interface Dependencies {
  queue?: ImageTaskQueue;
  jobsRoot: string;
  generatedRoot: string;
  generate: ImageGenerator;
  inspect: (bytes: Buffer) => Size;
  encode: (bytes: Buffer, extension: string) => Buffer;
  crop: (bytes: Buffer, rect: CoreRect) => Buffer;
  canvas: (core: Buffer) => Buffer;
  finalize: (generated: Buffer, resolution: PanoramaResolution) => Buffer;
}
interface Record {
  request: BackgroundCorrectionRequest;
  job: BackgroundCorrectionJob;
  libraryRoot: string;
  sourcePath: string;
  sourceHash: string;
  folder: string;
  originalPath: string;
  candidatePath: string;
  corePath: string;
  canvasPath: string;
  abort: AbortController;
}
export class BackgroundCorrections {
  private store: ImageJobStore<Record>;
  private get records() {
    return this.store.records;
  }
  readonly ready: Promise<void>;
  private starting = new Set<string>();
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
        aiProvider: normalizeAiProvider(data.request.aiProvider),
        codexModel: normalizeCodexModel(data.request.codexModel),
      };
      const extension = path.extname(request.ref).toLowerCase();
      if (![".png", ".jpg", ".jpeg"].includes(extension))
        throw Error("Source invalide.");
      const id = data.job.id;
      const record: Record = {
        request,
        libraryRoot: data.libraryRoot,
        sourcePath: path.resolve(data.libraryRoot, request.ref.slice(10)),
        sourceHash: data.sourceHash,
        folder,
        originalPath: await this.store.localFile(folder, "source" + extension),
        corePath: await this.store.localFile(folder, "core.png"),
        canvasPath: await this.store.localFile(folder, "canvas.png"),
        candidatePath: path.join(folder, "corrected.png"),
        abort: new AbortController(),
        job: {
          ...data.job,
          ref: request.ref,
          originalUrl: `lunaria-correction://image/${id}/source`,
          coreUrl: `lunaria-correction://image/${id}/core`,
          candidateUrl: undefined,
          backupPath:
            data.job.status === "applied"
              ? path.join(
                  data.libraryRoot,
                  ".lunaria-backups",
                  "backgrounds",
                  `${id}-${path.basename(request.ref)}`,
                )
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
          await this.store.localFile(folder, "corrected.png");
          const size = this.deps.inspect(await readImage(record.candidatePath));
          if (
            Math.abs(size.width / size.height / (20 / 9) - 1) > 0.01 ||
            !size.width ||
            !size.height
          )
            throw Error("Proposition invalide.");
          record.job.candidateUrl = `lunaria-correction://image/${id}/corrected`;
          Object.assign(record.job, size);
          if (record.job.status === "interrupted") {
            record.job.status = "ready";
            record.job.message =
              "Proposition récupérée après interruption. Vérifie-la avant de la valider.";
          }
        } catch {
          if (record.job.status !== "interrupted") {
            record.job.status = "failed";
            record.job.message =
              "Le fichier de la proposition est absent ou illisible. Tu peux relancer cette tâche.";
          }
        }
      }
      if (data.job.status === "applying" && record.job.status === "ready") {
        try {
          const target = await resolveAsset(record.libraryRoot, request.ref);
          const backup = path.join(
            record.libraryRoot,
            ".lunaria-backups",
            "backgrounds",
            `${id}-${path.basename(request.ref)}`,
          );
          const replacement = this.deps.encode(
            await readImage(record.candidatePath),
            extension,
          );
          if (
            hash(await readImage(target)) === hash(replacement) &&
            hash(await readImage(backup)) === record.sourceHash
          ) {
            Object.assign(record.job, {
              status: "applied",
              message:
                "Décor remplacé avant l’interruption. La version originale est sauvegardée.",
              backupPath: backup,
            });
          }
        } catch {
          /* Keep the validated proposal; applying still verifies the current source. */
        }
      }
      return record;
    });
  }
  async list(): Promise<ImageTask[]> {
    await this.ready;
    return [...this.records.values()].map((record) => ({
      kind: "background",
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
      throw new Error("Correction inconnue.");
    return this.records.get(id)!;
  }
  get(id: unknown): BackgroundCorrectionJob {
    return { ...this.record(id).job };
  }
  private async original(root: string, ref: AssetRef) {
    const clean = ref.replace(/_wide_v\d+(?=\.[^.]+$)/i, "");
    if (clean === ref) return;
    for (const extension of [".png", ".jpg", ".jpeg"]) {
      const candidate = clean.replace(/\.[^.]+$/, extension) as AssetRef;
      try {
        const file = await resolveAsset(root, candidate),
          bytes = await readImage(file),
          size = this.deps.inspect(bytes);
        if (isSixteenNine(size)) return { ref: candidate, file, bytes, size };
      } catch {
        /* An absent or unsafe sibling is never used as an original. */
      }
    }
  }
  async prepare(
    libraryRoot: string,
    ref: unknown,
  ): Promise<BackgroundPreparation> {
    if (typeof ref !== "string") throw new Error("Décor invalide.");
    const root = await fs.realpath(libraryRoot),
      file = await resolveAsset(root, ref);
    if (![".png", ".jpg", ".jpeg"].includes(path.extname(file).toLowerCase()))
      throw new Error("Choisis un décor PNG ou JPG.");
    const size = this.deps.inspect(await readImage(file));
    if (
      !size.width ||
      !size.height ||
      size.width * size.height > 64 * 1024 * 1024
    )
      throw new Error("Image illisible ou trop grande.");
    const original = await this.original(root, ref as AssetRef),
      key = libraryKey(root);
    return {
      current: {
        ...size,
        url: assetUrl(
          ref as AssetRef,
          (await fs.stat(file)).mtimeMs,
          false,
          key,
        ),
      },
      suggestedMode: isSixteenNine(size) ? "extend" : "rebuild",
      original: original && {
        ...original.size,
        ref: original.ref,
        name: path.basename(original.file),
        url: assetUrl(
          original.ref,
          (await fs.stat(original.file)).mtimeMs,
          false,
          key,
        ),
      },
    };
  }
  async start(
    libraryRoot: string,
    input: unknown,
  ): Promise<BackgroundCorrectionJob> {
    await this.ready;
    if (
      !input ||
      typeof input !== "object" ||
      typeof (input as BackgroundCorrectionRequest).ref !== "string"
    )
      throw new Error("Demande de correction invalide.");
    const canonicalRoot = await fs.realpath(libraryRoot);
    const sourcePath = await resolveAsset(
      canonicalRoot,
      (input as BackgroundCorrectionRequest).ref,
    );
    const key =
      process.platform === "win32" ? sourcePath.toLowerCase() : sourcePath;
    if (
      this.starting.has(key) ||
      [...this.records.values()].some(
        (record) =>
          (process.platform === "win32"
            ? record.sourcePath.toLowerCase()
            : record.sourcePath) === key &&
          ["queued", "generating", "ready", "applying"].includes(
            record.job.status,
          ),
      )
    ) {
      throw new Error(
        "Une adaptation existe déjà pour ce décor. Rouvre sa proposition ou abandonne-la avant de recommencer.",
      );
    }
    this.starting.add(key);
    try {
      return await this.create(canonicalRoot, input);
    } finally {
      this.starting.delete(key);
    }
  }
  private async create(
    libraryRoot: string,
    input: unknown,
  ): Promise<BackgroundCorrectionJob> {
    if (!input || typeof input !== "object")
      throw new Error("Demande de correction invalide.");
    const request = {
      ...(input as BackgroundCorrectionRequest),
      context: imageTaskContext((input as BackgroundCorrectionRequest).context),
      aiProvider: normalizeAiProvider((input as BackgroundCorrectionRequest).aiProvider),
      codexModel: normalizeCodexModel(
        (input as BackgroundCorrectionRequest).codexModel,
      ),
    };
    if (
      typeof request.ref !== "string" ||
      typeof request.instructions !== "string" ||
      request.instructions.length > 5000 ||
      !["extend", "rebuild"].includes(request.mode) ||
      typeof request.useOriginal !== "boolean" ||
      !Number.isFinite(request.cropPosition) ||
      request.cropPosition < 0 ||
      request.cropPosition > 1 ||
      (request.outputWidth !== "native" &&
        !PANORAMA_WIDTHS.includes(request.outputWidth))
    )
      throw new Error("Paramètres d’adaptation invalides.");
    const canonicalRoot = await fs.realpath(libraryRoot),
      sourcePath = await resolveAsset(canonicalRoot, request.ref);
    const extension = path.extname(sourcePath).toLowerCase();
    if (![".png", ".jpg", ".jpeg"].includes(extension))
      throw new Error(
        "La correction du décor prend en charge les images PNG et JPG.",
      );
    const source = await readImage(sourcePath),
      sourceSize = this.deps.inspect(source);
    if (
      !sourceSize.width ||
      !sourceSize.height ||
      sourceSize.width * sourceSize.height > 64 * 1024 * 1024
    )
      throw new Error("Le décor ne peut pas être décodé.");
    if (request.mode === "extend" && !isSixteenNine(sourceSize))
      throw new Error(
        "Ce décor est déjà large. Choisis « Refaire les côtés » pour sélectionner son centre 16:9.",
      );
    const original =
      request.mode === "rebuild" && request.useOriginal
        ? await this.original(canonicalRoot, request.ref)
        : undefined;
    if (request.useOriginal && !original)
      throw new Error(
        "L’original 16:9 est introuvable. Sélectionne le centre de l’image actuelle.",
      );
    const retainedSize = original?.size ?? sourceSize,
      retained = original?.bytes ?? source;
    const rect = coreRect(retainedSize, original ? 0.5 : request.cropPosition);
    const core = this.deps.crop(retained, rect);
    const id = randomUUID(),
      folder = path.join(this.deps.jobsRoot, id),
      originalPath = path.join(folder, "source" + extension),
      candidatePath = path.join(folder, "corrected.png");
    const corePath = path.join(folder, "core.png"),
      canvasPath = path.join(folder, "canvas.png");
    await fs.mkdir(folder, { recursive: true });
    await fs.writeFile(originalPath, source, { flag: "wx" });
    await fs.writeFile(corePath, core);
    await fs.writeFile(canvasPath, this.deps.canvas(core));
    const record: Record = {
      request,
      libraryRoot: canonicalRoot,
      sourcePath,
      sourceHash: hash(source),
      folder,
      originalPath,
      candidatePath,
      corePath,
      canvasPath,
      abort: new AbortController(),
      job: {
        id,
        ref: request.ref,
        status: "generating",
        message: "Génération des nouvelles extensions…",
        originalUrl: `lunaria-correction://image/${id}/source`,
        coreUrl: `lunaria-correction://image/${id}/core`,
        core: rect,
        usedOriginal: !!original,
        outputWidth: request.outputWidth,
        aiProvider: request.aiProvider,
        codexModel: request.codexModel,
      },
    };
    await this.store.register(record, () =>
      this.generate(
        record,
        { ...request },
        { width: rect.width, height: rect.height },
      ),
    );
    return this.get(id);
  }
  private async generate(
    record: Record,
    request: BackgroundCorrectionRequest,
    sourceSize: Size,
  ) {
    try {
      const generated = await this.deps.generate({
        folder: record.folder,
        sourcePath: record.corePath,
        canvasPath: record.canvasPath,
        request,
        sourceSize,
        signal: record.abort.signal,
        progress: (message) => {
          if (record.job.status === "generating")
            record.job.message = message.slice(0, 500);
        },
      });
      if (record.abort.signal.aborted) return;
      if (!path.isAbsolute(generated))
        throw new Error("Codex n’a pas renvoyé un chemin d’image absolu.");
      const real = await fs.realpath(generated),
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
      if (
        [record.originalPath, record.corePath, record.canvasPath].includes(real)
      )
        throw new Error("Codex a renvoyé une source au lieu des extensions.");
      const bytes = await readImage(real),
        size = this.deps.inspect(bytes);
      if (
        !size.width ||
        !size.height ||
        size.width * size.height > 64 * 1024 * 1024
      )
        throw new Error("Le résultat n’est pas une image valide.");
      if (Math.abs(size.width / size.height / (20 / 9) - 1) > 0.01)
        throw new Error(
          "Codex n’a pas respecté les proportions 20:9. Relance une proposition.",
        );
      record.job.message = "Préparation du panorama généré…";
      const png = this.deps.finalize(bytes, request.outputWidth);
      const outputSize = this.deps.inspect(png);
      const expected =
        request.outputWidth === "native"
          ? size
          : {
              width: request.outputWidth,
              height: (request.outputWidth * 9) / 20,
            };
      if (
        outputSize.width !== expected.width ||
        outputSize.height !== expected.height
      )
        throw new Error("Dimensions finales incorrectes.");
      if (png.length > LIMIT)
        throw new Error("La proposition corrigée dépasse 40 Mo.");
      await fs.writeFile(record.candidatePath, png);
      if (record.abort.signal.aborted) return;
      Object.assign(record.job, {
        status: "ready",
        message: "Proposition 20:9 prête. Teste les raccords dans le plan.",
        candidateUrl: `lunaria-correction://image/${record.job.id}/corrected`,
        ...outputSize,
      });
    } catch (error) {
      if (!record.abort.signal.aborted)
        Object.assign(record.job, {
          status: "failed",
          message:
            error instanceof Error ? error.message : "La correction a échoué.",
        });
    }
  }
  cancel(id: unknown): BackgroundCorrectionJob {
    const record = this.record(id);
    if (record.job.status === "applying" || record.job.status === "applied")
      throw new Error("Cette correction est déjà validée.");
    record.abort.abort();
    Object.assign(record.job, {
      status: "cancelled",
      message: "Proposition abandonnée. Le décor original est conservé.",
    });
    void this.store.save(record);
    return this.get(id);
  }
  async image(
    id: unknown,
    kind: string,
  ): Promise<{ bytes: Buffer; mime: string }> {
    const record = this.record(id);
    if (!["source", "core", "corrected"].includes(kind))
      throw new Error("Image de correction inconnue.");
    if (
      kind === "corrected" &&
      !["ready", "applying", "applied"].includes(record.job.status)
    )
      throw new Error("Proposition indisponible.");
    return {
      bytes: await readImage(
        kind === "source"
          ? record.originalPath
          : kind === "core"
            ? record.corePath
            : record.candidatePath,
      ),
      mime:
        kind === "source" && path.extname(record.originalPath) !== ".png"
          ? "image/jpeg"
          : "image/png",
    };
  }
  async apply(
    libraryRoot: string,
    id: unknown,
  ): Promise<BackgroundCorrectionJob> {
    const record = this.record(id);
    if ((await fs.realpath(libraryRoot)) !== record.libraryRoot)
      throw new Error(
        "La bibliothèque a changé. Rouvre la correction du décor.",
      );
    if (this.record(id) !== record) throw Error("La tâche a été retirée.");
    if (record.job.status === "applied") return this.get(id);
    if (record.job.status !== "ready")
      throw new Error("La proposition n’est pas prête à être validée.");
    record.job.status = "applying";
    let temporary = "";
    try {
      await this.store.save(record);
      const target = await resolveAsset(record.libraryRoot, record.job.ref);
      if (
        target !== record.sourcePath ||
        hash(await readImage(target)) !== record.sourceHash
      )
        throw new Error(
          "Le décor original a été modifié depuis la génération. Relance la correction pour préserver cette version.",
        );
      const backupRoot = path.join(record.libraryRoot, ".lunaria-backups");
      await fs.mkdir(backupRoot, { recursive: true });
      if (!isWithin(record.libraryRoot, await fs.realpath(backupRoot)))
        throw new Error("Le dossier de sauvegarde sort de la bibliothèque.");
      try {
        await fs.writeFile(path.join(backupRoot, ".gitignore"), "*\n", {
          flag: "wx",
        });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      }
      const backupFolder = path.join(backupRoot, "backgrounds");
      await fs.mkdir(backupFolder, { recursive: true });
      if (!isWithin(record.libraryRoot, await fs.realpath(backupFolder)))
        throw new Error("Le dossier de sauvegarde sort de la bibliothèque.");
      const backup = path.join(
        backupFolder,
        `${record.job.id}-${path.basename(target)}`,
      );
      try {
        await fs.copyFile(record.originalPath, backup, constants.COPYFILE_EXCL);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      }
      if (hash(await readImage(backup)) !== record.sourceHash)
        throw new Error("La sauvegarde de l’original a échoué.");
      const replacement = this.deps.encode(
        await readImage(record.candidatePath),
        path.extname(target).toLowerCase(),
      );
      if (replacement.length > LIMIT)
        throw new Error("Le décor corrigé dépasse 40 Mo.");
      temporary = path.join(
        path.dirname(target),
        `.lunaria-correction-${record.job.id}.tmp`,
      );
      const handle = await fs.open(temporary, "wx");
      try {
        await handle.writeFile(replacement);
        await handle.sync();
      } finally {
        await handle.close();
      }
      for (let attempt = 0; ; attempt++) {
        if (
          (await resolveAsset(record.libraryRoot, record.job.ref)) !== target ||
          hash(await readImage(target)) !== record.sourceHash
        )
          throw new Error(
            "Le décor a changé pendant la validation. L’original actuel est conservé.",
          );
        try {
          await fs.rename(temporary, target);
          break;
        } catch (error) {
          if (
            attempt >= 4 ||
            !["EBUSY", "EPERM", "EACCES"].includes(
              (error as NodeJS.ErrnoException).code ?? "",
            )
          )
            throw error;
          await new Promise((resolve) =>
            setTimeout(resolve, 50 * (attempt + 1)),
          );
        }
      }
      temporary = "";
      Object.assign(record.job, {
        status: "applied",
        message: "Décor remplacé. La version originale est sauvegardée.",
        backupPath: backup,
      });
      await this.store.save(record);
      return this.get(id);
    } catch (error) {
      if (!record.job.backupPath) record.job.status = "ready";
      await this.store.save(record);
      throw error;
    } finally {
      if (temporary) await fs.unlink(temporary).catch(() => undefined);
    }
  }
  close() {
    return this.store.close();
  }
}
