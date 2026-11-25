import React, { useContext, useEffect, useRef, useState } from "react";
import type { Asset, AssetRef } from "../../shared/model.js";
import type { GameProject } from "../../shared/game/types.js";
import type { AiImageProvider } from "../../shared/aiProviders.js";
import { AiModelSelector, rememberAiProvider, saveAiProvider } from "../images/AiModelSelector.js";
import { useAiModels } from "../images/useAiModels.js";
import {
  precedingTerrainReferences,
  type TerrainGenerationJob,
} from "../../shared/terrainGeneration.js";
import { api } from "../browserBridge.js";
import { StudioDialog } from "../components/StudioDialog.js";
import { LibraryPickerContext } from "../components/LibraryPickerContext.js";
import { ImagePicker } from "../presentation/ImagePicker.js";
import "./terrainGeneration.css";
import { useProjectSession } from "../project/ProjectSessionContext.js";
import { useImageTasks } from "../images/ImageTasksContext.js";
import type { TerrainGenerationRequest } from "../../shared/terrainGeneration.js";

const preferenceKey = "lunaria.terrainGeneration.model";
const providerPreferenceKey = "lunaria.terrainGeneration.provider";
const message = (error: unknown) =>
  error instanceof Error ? error.message : String(error);
function rememberedModel() {
  try {
    return localStorage.getItem(preferenceKey) ?? "";
  } catch {
    return "";
  }
}

export function TerrainGenerationDialog({
  project,
  levelId,
  assets,
  onApply,
  onClose,
}: {
  project: GameProject;
  levelId: string;
  assets: Asset[];
  onApply: (polluted: AssetRef, restored: AssetRef) => void;
  onClose: () => void;
}) {
  const services = useContext(LibraryPickerContext);
  const { session } = useProjectSession();
  const { tasks, refresh } = useImageTasks();
  const level = project.levels.find((item) => item.id === levelId)!;
  const [previous] = useState(() =>
    precedingTerrainReferences(project, levelId),
  );
  const [source, setSource] = useState<"film" | "custom">(
    previous.references.length ? "film" : "custom",
  );
  const [shotId, setShotId] = useState(
    previous.references.at(-1)?.shotId ?? "",
  );
  const [customRef, setCustomRef] = useState<AssetRef>();
  const [instructions, setInstructions] = useState("");
  const [aiProvider, setAiProvider] = useState<AiImageProvider>(() => rememberAiProvider(providerPreferenceKey));
  const [codexModel, setCodexModel] = useState(rememberedModel);
  const { models, loadingModels, modelError, refreshModels } = useAiModels(aiProvider);
  const [job, setJob] = useState<TerrainGenerationJob>(),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const [grid, setGrid] = useState(false);
  const live = useRef(true),
    locked = useRef(false),
    jobRef = useRef(job),
    jobRoot = useRef("");
  const libraryRoot = services?.library?.rootPath ?? "";
  const currentAssets = services?.library?.assets ?? assets;
  const ref =
    source === "film"
      ? previous.references.find((item) => item.shotId === shotId)?.ref
      : customRef;
  const asset = currentAssets.find((item) => item.ref === ref);
  const generating = job?.status === "generating" || job?.status === "queued";
  const ready = (job?.status === "ready" || job?.status === "applied") && !!job.restoredCandidateUrl;
  const libraryChanged = !!job && jobRoot.current !== libraryRoot;
  const modelUnavailable =
    !!codexModel && !models.some((model) => model.id === codexModel);
  function update(next: TerrainGenerationJob | undefined) {
    jobRef.current = next;
    if (live.current) setJob(next);
  }
  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);
  useEffect(() => {
    if (locked.current) return;
    if (jobRef.current) {
      const current = tasks.find(
        (item) => item.kind === "terrain" && item.job.id === jobRef.current?.id,
      );
      if (current?.kind === "terrain") update(current.job);
      return;
    }
    const found = tasks.find(
      (item) =>
        item.kind === "terrain" &&
        item.libraryRoot === libraryRoot &&
        item.context?.projectId === project.id &&
        item.context.projectPath === session.getSnapshot().path &&
        item.context.levelId === levelId &&
        ["queued", "generating", "ready"].includes(item.job.status),
    );
    if (found?.kind === "terrain") {
      const request = found.request as TerrainGenerationRequest;
      jobRoot.current = found.libraryRoot;
      setSource("custom");
      setCustomRef(request.ref);
      setInstructions(request.instructions);
      setAiProvider(request.aiProvider ?? "openai");
      setCodexModel(request.codexModel ?? "");
      update(found.job);
    }
  }, [tasks, libraryRoot, levelId, project.id, session]);
  async function perform(operation: () => Promise<void>) {
    if (locked.current) return;
    locked.current = true;
    setPending(true);
    setError("");
    try {
      await operation();
    } catch (reason) {
      if (live.current) setError(message(reason));
    } finally {
      locked.current = false;
      void refresh();
      if (live.current) setPending(false);
    }
  }
  async function discardJob() {
    const current = jobRef.current;
    if (current && current.status !== "applied")
      await api.cancelTerrainGeneration(current.id);
    update(undefined);
  }
  const close = () => {
    if (!locked.current) onClose();
  };
  const generate = () =>
    void perform(async () => {
      if (!ref || !asset || !libraryRoot || modelUnavailable)
        throw new Error(
          "Choisis une image de référence et un modèle disponible.",
        );
      await discardJob();
      jobRoot.current = libraryRoot;
      const next = await api.startTerrainGeneration({
        ref,
        levelTitle: level.title,
        instructions,
        aiProvider,
        codexModel,
        context: {
          projectId: project.id,
          projectPath: session.getSnapshot().path,
          levelId,
          title: level.title,
          terrainRef: level.terrainImage,
          restoredTerrainRef: level.restoredTerrainImage,
        },
      });
      update(next);
    });
  const apply = () =>
    void perform(async () => {
      if (!ready || !job || libraryChanged) return;
      const result = await api.applyTerrainGeneration(job.id);
      update(result.job);
      if (!result.job.terrainRef || !result.job.restoredTerrainRef)
        throw new Error("Les deux états du terrain sont introuvables.");
      onApply(result.job.terrainRef, result.job.restoredTerrainRef);
      onClose();
    });
  return (
    <StudioDialog
      title="Générer les deux états du terrain"
      onClose={close}
      disabled={pending}
      wide
    >
      <div className="terrain-generation">
        <div className="terrain-content">
          <p className="terrain-intro">
            Deux images 16:9 pour <strong>{level.title}</strong> : le terrain pollué
            et le même terrain nettoyé, dans deux fichiers distincts. Tu peux réduire cette fenêtre et retrouver le travail dans «
            Tâches et résultats ».
          </p>
          <fieldset
            className="terrain-reference-options"
            disabled={pending || !!job}
          >
            <legend>Image de référence</legend>
            <div className="terrain-source-options">
              <label>
                <input
                  type="radio"
                  name="terrain-source"
                  checked={source === "film"}
                  disabled={!previous.references.length}
                  onChange={() => setSource("film")}
                />{" "}
                Cinématique précédente
              </label>
              <label>
                <input
                  type="radio"
                  name="terrain-source"
                  checked={source === "custom"}
                  onChange={() => setSource("custom")}
                />{" "}
                Autre image
              </label>
            </div>
            {previous.references.length > 0 ? (
              <p className="terrain-help">
                {previous.filmTitle} · le dernier décor est sélectionné par
                défaut.
              </p>
            ) : (
              <p className="terrain-help">
                {previous.filmTitle
                  ? `Aucun décor disponible dans « ${previous.filmTitle} ».`
                  : "Aucune cinématique ne précède ce niveau dans la campagne."}{" "}
                Choisis une autre image pour commencer.
              </p>
            )}
            {source === "film" ? (
              <label className="field">
                <span>Décor de la cinématique précédente</span>
                <select
                  aria-label="Décor de la cinématique précédente"
                  value={shotId}
                  onChange={(event) => setShotId(event.target.value)}
                >
                  {previous.references.map((item, index) => (
                    <option key={item.shotId} value={item.shotId}>
                      {index + 1}. {item.shotName}
                      {index === previous.references.length - 1
                        ? " · dernier décor"
                        : ""}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <ImagePicker
                label="Image de référence du terrain"
                value={customRef ? [customRef] : []}
                assets={currentAssets}
                category="environment"
                buttonLabel="Choisir ou importer une référence"
                change={(refs) => setCustomRef(refs[0] as AssetRef | undefined)}
              />
            )}
          </fieldset>
          {!job && ref && !asset && (
            <p role="alert" className="terrain-error">
              L’image de référence est absente de la bibliothèque connectée.
              Choisis ou importe une autre image.
            </p>
          )}
          <div className="terrain-comparison">
            <figure>
              <figcaption>
                <strong>Image de référence</strong>
                <span title={asset?.name}>
                  {asset?.name ?? "Aucune image sélectionnée"}
                </span>
              </figcaption>
              <div className="terrain-preview">
                {job?.sourceUrl || asset?.url ? (
                  <img
                    src={job?.sourceUrl ?? asset?.url}
                    alt="Référence pour le terrain"
                  />
                ) : (
                  <div className="terrain-preview-status">
                    Choisis une image de référence.
                  </div>
                )}
              </div>
            </figure>
            {(["polluted", "restored"] as const).map((state) => <figure key={state}>
              <figcaption>
                <strong>{state === "polluted" ? "Terrain pollué" : "Terrain nettoyé"}</strong>
                <span>
                  {job?.width ? `${job.width} × ${job.height}` : "Format 16:9"}
                </span>
              </figcaption>
              <div className="terrain-preview" aria-busy={generating}>
                {(state === "polluted" ? job?.candidateUrl : job?.restoredCandidateUrl) ? (
                  <>
                    <img src={state === "polluted" ? job?.candidateUrl : job?.restoredCandidateUrl} alt={state === "polluted" ? "Terrain pollué proposé" : "Terrain nettoyé proposé"} />
                    {grid && (
                      <div
                        className="terrain-grid"
                        aria-label="Aperçu de la grille de 5 allées et 8 colonnes"
                      >
                        {Array.from({ length: 40 }, (_, i) => (
                          <span key={i} />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="terrain-preview-status" role="status">
                    {generating ? (
                      <>
                        <span className="spinner" aria-hidden="true" />
                        <strong>Génération en cours</strong>
                        <span>{job.message}</span>
                        <small>
                          La création de l’image peut prendre plusieurs minutes.
                        </small>
                      </>
                    ) : (
                      <>
                        <strong>Prêt à créer ton terrain</strong>
                        <span>
                          La proposition apparaîtra ici après la génération.
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </figure>)}
          </div>
          {ready && (
            <label className="terrain-grid-toggle">
              <input
                type="checkbox"
                checked={grid}
                onChange={(event) => setGrid(event.target.checked)}
              />{" "}
              Afficher une grille indicative de 5 × 8 pour vérifier la
              lisibilité
            </label>
          )}
          <fieldset
            className="terrain-settings"
            disabled={pending || generating || job?.status === "applied"}
          >
            <label className="field">
              <span>Précisions pour la génération (facultatif)</span>
              <textarea
                aria-label="Précisions pour le terrain"
                rows={2}
                maxLength={5000}
                placeholder="Par exemple : conserver les dalles de la serre et dégager le centre."
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
              />
            </label>
            <AiModelSelector
              provider={aiProvider}
              onProviderChange={(nextProvider) => {
                setAiProvider(nextProvider);
                setCodexModel("");
                saveAiProvider(providerPreferenceKey, nextProvider);
                try {
                  localStorage.setItem(preferenceKey, "");
                } catch {
                  /* Optional. */
                }
              }}
              model={codexModel}
              onModelChange={(nextModel) => {
                setCodexModel(nextModel);
                try {
                  localStorage.setItem(preferenceKey, nextModel);
                } catch {
                  /* The current selection still applies. */
                }
              }}
              models={models}
              loading={loadingModels}
              error=""
              onRefresh={refreshModels}
              disabled={pending || generating || job?.status === "applied"}
              selectAriaLabel={aiProvider === "gemini" ? "Modèle Gemini du terrain" : "Modèle Codex du terrain"}
            />
          </fieldset>
          {modelError && (
            <p className="terrain-error" role="alert">
              {modelError} Tu peux conserver le choix Automatique.
            </p>
          )}
          {modelUnavailable && !loadingModels && (
            <p className="terrain-error" role="alert">
              Choisis un modèle détecté ou Automatique avant de générer.
            </p>
          )}
          {libraryChanged && (
            <p className="terrain-error" role="alert">
              La bibliothèque a changé. Ferme cette fenêtre puis relance la
              génération.
            </p>
          )}
          {(error || job?.status === "failed") && (
            <p className="terrain-error" role="alert">
              {error || job?.message}
            </p>
          )}
        </div>
        <footer className="terrain-footer">
          <p className="terrain-help">
            {generating
              ? job?.status === "queued"
                ? "En attente : une autre image est en cours de génération."
                : "La génération continue si tu fermes cette fenêtre."
              : "Les deux états seront affectés ensemble à ce niveau après validation. Pense ensuite à enregistrer le projet."}
          </p>
          <div className="terrain-actions">
            <button
              type="button"
              className="button text"
              disabled={pending}
              onClick={close}
            >
              Réduire
            </button>
            {job && !generating && (
              <button
                type="button"
                className="button subtle"
                disabled={pending || job.status === "applied"}
                onClick={() => void perform(discardJob)}
              >
                Changer la référence
              </button>
            )}
            {generating ? (
              <button
                type="button"
                className="button subtle"
                disabled={pending}
                onClick={() => void perform(discardJob)}
              >
                Annuler la génération
              </button>
            ) : (
              <button
                type="button"
                className="button subtle"
                disabled={
                  pending ||
                  !asset ||
                  !libraryRoot ||
                  modelUnavailable ||
                  (!!codexModel && loadingModels) ||
                  libraryChanged ||
                  job?.status === "applied"
                }
                onClick={generate}
              >
                {ready ? "Générer une autre proposition" : "Générer les deux états"}
              </button>
            )}
            {ready && (
              <button
                type="button"
                className="button primary"
                disabled={pending || libraryChanged}
                onClick={apply}
              >
                Utiliser les deux terrains pour le niveau
              </button>
            )}
          </div>
        </footer>
      </div>
    </StudioDialog>
  );
}
