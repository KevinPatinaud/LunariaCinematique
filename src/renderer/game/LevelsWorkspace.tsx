import React, { useMemo, useState } from "react";
import type { Asset, AssetRef } from "../../shared/model.js";
import {
  activeEnemies,
  CONTINENTS,
  isConquest,
  totalEnemies,
  type CampaignFilm,
  type GameProject,
  type LevelDefinition,
} from "../../shared/game/types.js";
import {
  levelPosition,
  orderedLevels,
  placeLevel,
  type LevelPlacement,
} from "../../shared/game/levelManagement.js";
import { linkCinematic } from "../../shared/game/cinematicManagement.js";
import { isContentArchived, setContentArchived } from "../../shared/game/contentArchives.js";
import { ArchiveStamp, ContentArchiveFilter, matchesArchiveFilter, type ArchiveFilter } from "../components/ContentArchive.js";
import {
  DuplicateLevelDialog,
  LevelCampaignPosition,
} from "./LevelPlacement.js";
import { LevelRewardsOverview } from "./LevelRewardsOverview.js";
import { LevelLunaEditor } from "./LevelLunaEditor.js";
import { LevelObjectiveEditor } from "./LevelObjectiveEditor.js";
import { WaveEditor } from "./WaveEditor.js";
import { EventEditor } from "./EventEditor.js";
import { ImagePicker } from "../presentation/ImagePicker.js";
import { Num } from "./BalanceEditor.js";
import { api } from "../browserBridge.js";

export type LevelDetailTab = "settings" | "waves" | "plants" | "events" | "lunas";

interface LevelsWorkspaceProps {
  project: GameProject;
  level: LevelDefinition | undefined;
  assets: Asset[];
  active: boolean;
  hasErrors: boolean;
  levelScope: string;
  setLevelScope: (scope: string) => void;
  query: string;
  setQuery: (q: string) => void;
  continent: number;
  setContinent: (c: number) => void;
  compareRewards: boolean;
  setCompareRewards: (v: boolean) => void;
  detail: LevelDetailTab;
  setDetail: (tab: LevelDetailTab) => void;
  duplicateOpen: boolean;
  setDuplicateOpen: (open: boolean) => void;
  selectLevelId: (id: string) => void;
  addLevel: (placement?: LevelPlacement) => void;
  duplicateLevel: (placement: LevelPlacement, title: string) => void;
  removeLevel: () => Promise<void>;
  playLevel: () => void;
  updateLevel: (patch: Partial<LevelDefinition>, key?: string) => void;
  levelChange: (edit: (draft: GameProject) => void, label: string) => boolean;
  change: (
    edit: (p: GameProject) => void,
    key?: string,
    label?: string,
    allowBusy?: boolean,
  ) => void;
  onViewCampaignStep: (stepId: string) => void;
  onOpenFilm: (film: CampaignFilm) => void;
  onOpenLunaEconomy: () => void;
  onOpenTerrainGenerator: (target: {
    levelId: string;
    terrainRef?: AssetRef;
    restoredTerrainRef?: AssetRef;
  }) => void;
}

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function LevelsWorkspace({
  project,
  level,
  assets,
  active,
  hasErrors,
  levelScope,
  setLevelScope,
  query,
  setQuery,
  continent,
  setContinent,
  compareRewards,
  setCompareRewards,
  detail,
  setDetail,
  duplicateOpen,
  setDuplicateOpen,
  selectLevelId,
  addLevel,
  duplicateLevel,
  removeLevel,
  playLevel,
  updateLevel,
  levelChange,
  change,
  onViewCampaignStep,
  onOpenFilm,
  onOpenLunaEconomy,
  onOpenTerrainGenerator,
}: LevelsWorkspaceProps) {
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>("all");
  const archived = !!level && isContentArchived(project, "levels", level.id);
  const positions = useMemo(
    () =>
      new Map(
        project.levels.map((item) => [item.id, levelPosition(project, item.id)]),
      ),
    [project],
  );
  const visible = useMemo(() => {
    const normalizedQuery = norm(query);
    return orderedLevels(project).filter((item) => {
      const pos = positions.get(item.id) ?? levelPosition(project, item.id);
      return (
        (continent < 0 || item.act === continent) &&
        matchesArchiveFilter(archiveFilter, isContentArchived(project, "levels", item.id)) &&
        (levelScope === "all" ||
          pos.index >= 0 === (levelScope === "placed")) &&
        norm(item.title + " " + item.id + " " + item.location).includes(
          normalizedQuery,
        )
      );
    });
  }, [project, positions, continent, levelScope, query, archiveFilter]);

  return (
    <>
      <aside className="gd-level-list">
        <div className="gd-list-controls">
          <button
            aria-pressed={compareRewards}
            onClick={() => setCompareRewards(!compareRewards)}
          >
            {compareRewards ? "← Fiches des niveaux" : "Comparer les graines"}
          </button>
          <p className="level-library-note">
            Niveaux dans l’ordre du parcours, puis hors parcours. Les
            cinématiques se placent dans Campagne.
          </p>
          <label className="gd-field">
            <span>Afficher</span>
            <select
              aria-label="Filtrer par place dans la campagne"
              value={levelScope}
              onChange={(e) => setLevelScope(e.target.value)}
            >
              <option value="all">Tous les niveaux</option>
              <option value="placed">Dans le parcours</option>
              <option value="outside">Hors parcours</option>
            </select>
          </label>
          <ContentArchiveFilter value={archiveFilter} onChange={setArchiveFilter} />
          <input
            aria-label="Rechercher un niveau"
            placeholder="Rechercher un niveau…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            aria-label="Filtrer les niveaux par continent"
            value={continent}
            onChange={(e) => setContinent(Number(e.target.value))}
          >
            <option value={-1}>Tous les continents</option>
            {CONTINENTS.map((c, i) => (
              <option key={c} value={i}>
                {c}
              </option>
            ))}
          </select>
          <button
            className="gd-primary"
            disabled={
              project.levels.length >= 200 ||
              !activeEnemies(project.balance.enemies).length
            }
            onClick={() => {
              addLevel();
              if (archiveFilter === "archived") setArchiveFilter("all");
            }}
          >
            + Créer un niveau
          </button>
        </div>
        <div className="gd-level-items">
          {visible.map((l) => {
            const pos = positions.get(l.id) ?? levelPosition(project, l.id);
            const rowArchived = isContentArchived(project, "levels", l.id);
            return (
              <button
                key={l.id}
                className={level?.id === l.id ? "selected" : ""}
                data-archived={rowArchived ? "" : undefined}
                onClick={() => {
                  selectLevelId(l.id);
                  setCompareRewards(false);
                }}
              >
                <span className="gd-level-index">
                  {pos.number ? String(pos.number).padStart(2, "0") : "–"}
                </span>
                <span>
                  <span className="gd-level-title">
                    <b>{l.title}</b>
                    {rowArchived && <ArchiveStamp />}
                  </span>
                  <small className="level-path-badge">
                    {pos.index < 0
                      ? "Hors parcours"
                      : "Étape " + (pos.index + 1) + " du parcours"}
                  </small>
                  <small>
                    {CONTINENTS[l.act]} · {l.waves.length} vague
                    {l.waves.length > 1 ? "s" : ""} · {totalEnemies(l)} ennemis
                  </small>
                </span>
              </button>
            );
          })}
          {!visible.length && (
            <div className="gd-empty-search">
              <p>
                {project.levels.length
                  ? "Aucun niveau ne correspond à ces filtres."
                  : "Tes niveaux apparaîtront ici."}
              </p>
              {!!project.levels.length && (
                <button
                  onClick={() => {
                    setQuery("");
                    setContinent(-1);
                    setLevelScope("all");
                    setArchiveFilter("all");
                  }}
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
      {compareRewards ? (
        <LevelRewardsOverview
          project={project}
          openLevel={(id, tab) => {
            setQuery("");
            setContinent(-1);
            setLevelScope("all");
            setArchiveFilter("all");
            selectLevelId(id);
            setDetail(tab);
            setCompareRewards(false);
          }}
        />
      ) : level ? (
        <main className="gd-level-main gd-scroll" key={level.id}>
          <div className="gd-section-heading">
            <div>
              <div className="gd-kicker">
                FICHE DU NIVEAU · {CONTINENTS[level.act]} {archived && <ArchiveStamp />}
              </div>
              <h1>{level.title}</h1>
              <p>
                {level.location || "Lieu à définir"} ·{" "}
                <strong>{totalEnemies(level)} ennemis</strong> ·{" "}
                {level.allowedPlants.length} plantes autorisées
              </p>
            </div>
            <div className="gd-inline">
              <button
                className="gd-play-level"
                disabled={hasErrors}
                title="Ouvrir ce niveau dans une copie temporaire du jeu avec une progression de test séparée"
                onClick={playLevel}
              >
                ▶ Jouer ce niveau
              </button>
              <button
                disabled={project.levels.length >= 200}
                onClick={() => setDuplicateOpen(true)}
              >
                Dupliquer
              </button>
              <button
                onClick={() =>
                  levelChange(
                    (p) => setContentArchived(p, "levels", level.id, !archived),
                    archived ? "Désarchiver le niveau" : "Archiver le niveau",
                  )
                }
              >
                {archived ? "Désarchiver" : "Archiver"}
              </button>
              <button onClick={() => void removeLevel()}>Supprimer</button>
            </div>
          </div>
          <LevelCampaignPosition
            project={project}
            level={level}
            onPlace={(placement) =>
              levelChange(
                (p) => placeLevel(p, level.id, placement),
                "Placer le niveau dans la campagne",
              )
            }
            onView={onViewCampaignStep}
            onOpenFilm={onOpenFilm}
            onSelectLevel={(targetId) => {
              setQuery("");
              setContinent(-1);
              setLevelScope("all");
              setArchiveFilter("all");
              selectLevelId(targetId);
              setCompareRewards(false);
            }}
          />
          {duplicateOpen && (
            <DuplicateLevelDialog
              project={project}
              level={level}
              onClose={() => setDuplicateOpen(false)}
              onDuplicate={(placement, title) => {
                duplicateLevel(placement, title);
                if (archiveFilter === "archived") setArchiveFilter("all");
              }}
            />
          )}
          <nav className="gd-detail-tabs" aria-label="Édition du niveau">
            {(
              [
                ["settings", "Paramètres"],
                ["waves", "Vagues & ennemis"],
                ["plants", "Plantes disponibles"],
                ["events", "Événements"],
                ["lunas", "Lunas"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                className={detail === key ? "active" : ""}
                onClick={() => setDetail(key)}
              >
                {label}
              </button>
            ))}
          </nav>
          {detail === "settings" && (
            <>
              <div className="gd-form-grid">
                <label className="gd-field">
                  <span>Nom du niveau</span>
                  <input
                    aria-label="Nom du niveau"
                    maxLength={160}
                    value={level.title}
                    onChange={(e) =>
                      updateLevel({ title: e.target.value }, "title")
                    }
                  />
                </label>
                <label className="gd-field">
                  <span>Continent</span>
                  <select
                    aria-label="Continent du niveau"
                    value={level.act}
                    onChange={(e) =>
                      updateLevel({ act: Number(e.target.value) })
                    }
                  >
                    {CONTINENTS.map((c, i) => (
                      <option key={c} value={i}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="gd-field">
                  <span>Lieu</span>
                  <input
                    aria-label="Lieu du niveau"
                    maxLength={200}
                    value={level.location}
                    onChange={(e) =>
                      updateLevel({ location: e.target.value }, "location")
                    }
                  />
                </label>
                <Num
                  label="Graines initiales"
                  value={level.startingEnergy}
                  max={100000}
                  integer
                  change={(v) => updateLevel({ startingEnergy: v })}
                />
              </div>
              <section
                className="gd-terrain-image"
                aria-label="Terrain du niveau"
              >
                <h2>Image du terrain</h2>
                <p>
                  Cette image remplit le fond du combat pour ce niveau. Choisis
                  de préférence une image au format 16:9 ; la grille et les
                  personnages restent affichés par-dessus.
                </p>
                <ImagePicker
                  label="Image du terrain"
                  value={level.terrainImage ? [level.terrainImage] : []}
                  assets={assets}
                  category="environment"
                  change={(refs) =>
                    updateLevel({
                      terrainImage: refs[0] as
                        | `library://${string}`
                        | undefined,
                    })
                  }
                  buttonLabel="Choisir ou importer une image"
                />
                <button
                  type="button"
                  className="gd-primary terrain-generate-trigger"
                  disabled={
                    !window.lunaria ||
                    typeof api.startTerrainGeneration !== "function"
                  }
                  title="Créer les états pollué et nettoyé du terrain à partir du décor de la cinématique précédente ou d’une image de ton choix"
                  onClick={() =>
                    onOpenTerrainGenerator({
                      levelId: level.id,
                      terrainRef: level.terrainImage,
                      restoredTerrainRef: level.restoredTerrainImage,
                    })
                  }
                >
                  Générer les terrains pollué et nettoyé (IA)
                </button>
                {level.terrainImage && (
                  <button
                    type="button"
                    onClick={() => updateLevel({ terrainImage: undefined })}
                  >
                    Retirer l’image du terrain
                  </button>
                )}
                <ImagePicker
                  label="Décor restauré"
                  value={
                    level.restoredTerrainImage
                      ? [level.restoredTerrainImage]
                      : []
                  }
                  assets={assets}
                  category="environment"
                  change={(refs) =>
                    updateLevel({
                      restoredTerrainImage: refs[0] as
                        | `library://${string}`
                        | undefined,
                    })
                  }
                  buttonLabel="Choisir ou importer le décor restauré"
                />
                <p>
                  Le décor initial est remplacé progressivement par cette image
                  au fil du combat. Utilise le même cadrage pour conserver les
                  bâtiments et le terrain en place.
                </p>
                {level.restoredTerrainImage && (
                  <button
                    type="button"
                    onClick={() =>
                      updateLevel({ restoredTerrainImage: undefined })
                    }
                  >
                    Retirer le décor restauré
                  </button>
                )}
              </section>
              <LevelObjectiveEditor
                project={project}
                level={level}
                assets={assets}
                updateLevel={updateLevel}
              />
              <label className="gd-field">
                <span>Conseil</span>
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={level.tip}
                  onChange={(e) => updateLevel({ tip: e.target.value }, "tip")}
                />
              </label>
              {!isConquest(level.objective.type) && (
                <p className="gd-callout">
                  Le plateau comporte 5 allées × 8 cases. Les dégâts contre la
                  cible utilisent son armure et ses résistances configurées ici.
                </p>
              )}
            </>
          )}
          {detail === "waves" && active && (
            <WaveEditor
              key={level.id}
              level={level}
              enemies={project.balance.enemies}
              assets={assets}
              update={updateLevel}
            />
          )}
          {detail === "plants" && (
            <>
              <div className="gd-section-heading">
                <div>
                  <h2>Choisis les espèces utilisables</h2>
                  <p>
                    Toutes les espèces autorisées ici sont disponibles dès le
                    début du niveau. Le joueur ne compose pas d’équipe ;
                    l’histoire détermine les compagnons présents. Plusieurs
                    exemplaires d’une même espèce peuvent être plantés.
                  </p>
                </div>
                <div className="gd-inline">
                  <button
                    onClick={() =>
                      updateLevel({
                        allowedPlants: project.balance.plants.map((p) => p.id),
                      })
                    }
                  >
                    Toutes
                  </button>
                </div>
              </div>
              <div className="gd-plant-picker">
                {project.balance.plants.map((p) => (
                  <label
                    key={p.id}
                    className={
                      level.allowedPlants.includes(p.id) ? "selected" : ""
                    }
                  >
                    <input
                      type="checkbox"
                      aria-label={`Autoriser ${p.name}`}
                      checked={level.allowedPlants.includes(p.id)}
                      onChange={(e) =>
                        updateLevel({
                          allowedPlants: e.target.checked
                            ? [...level.allowedPlants, p.id]
                            : level.allowedPlants.filter((x) => x !== p.id),
                        })
                      }
                    />
                    <span>
                      <b>{p.name}</b>
                      <small>{p.role}</small>
                      <small>
                        {p.cost} graines · {p.max_hp} PV · {p.damage} dégâts
                      </small>
                    </span>
                  </label>
                ))}
              </div>
              <p className="gd-note">
                Les valeurs sont en lecture seule ici. Pour les modifier
                partout, ouvre « Plantes alliées — Équilibrage global ».
              </p>
            </>
          )}
          {detail === "events" && (
            <EventEditor
              project={project}
              level={level}
              update={(events) => updateLevel({ events })}
              linkFilm={(documentId) =>
                change(
                  (p) => {
                    linkCinematic(p, documentId);
                  },
                  "",
                  "Lier une cinématique du projet",
                  true,
                )
              }
            />
          )}
          {detail === "lunas" && (
            <LevelLunaEditor
              project={project}
              level={level}
              updateLevel={updateLevel}
              openGlobalEconomy={onOpenLunaEconomy}
            />
          )}
        </main>
      ) : (
        <main className="gd-level-main gd-scroll">
          <h1>Aucun niveau</h1>
          <p>Crée une première mission quand tu seras prêt.</p>
          <button className="gd-primary" onClick={() => addLevel()}>
            + Créer un niveau
          </button>
        </main>
      )}
    </>
  );
}
