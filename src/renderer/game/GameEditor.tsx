import {
  afterLevel,
  createProjectLevel,
  duplicateProjectLevel,
  deleteProjectLevel,
  patchProjectLevel,
  type LevelPlacement,
} from "../../shared/game/levelManagement.js";
import { useProjectSession } from "../project/ProjectSessionContext.js";
import type { Asset, AssetRef } from "../../shared/model.js";
import { animationOwnerId } from "../../shared/presentation/ownership.js";
import type { PresentationSection } from "../../shared/presentation/types.js";
import {
  AnimationFields,
  PresentationEditor,
} from "../presentation/PresentationEditor.js";
import { BehaviorEditor } from "./BehaviorEditor.js";
import { VariableEditor } from "./VariableEditor.js";
import { BalanceAuditView } from "./BalanceAuditView.js";
import { LunaEconomyEditor } from "./LunaEconomyEditor.js";
import { CombatEditor } from "./CombatEditor.js";
import {
  LevelsWorkspace,
  type LevelDetailTab,
} from "./LevelsWorkspace.js";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { type HistoryAction } from "../../shared/history.js";
import {
  activeEnemies,
  type CampaignFilm,
  type GameProject,
  type LevelDefinition,
} from "../../shared/game/types.js";
import type { GameIssue } from "../../shared/game/validation.js";
import { api } from "../browserBridge.js";
import { BalanceEditor } from "./BalanceEditor.js";
import { TerrainGenerationDialog } from "./TerrainGenerationDialog.js";
import { CampaignEditor } from "./CampaignEditor.js";
import { StudioDialog } from "../components/StudioDialog.js";
import {
  ADVANCED_SECTIONS,
  isAdvancedSection,
  type GameSection,
} from "../components/StudioNavigation.js";
import "./game.css";
import "./levelsCampaign.css";

export type { GameSection };

export interface GameEditorHandle {
  navigate(section: GameSection, targetId?: string, detailTab?: LevelDetailTab): void;
  createLevel(): void;
  showChecks(): void;
}

interface Props {
  assets: Asset[];
  active: boolean;
  section: GameSection;
  onSelectSection: (section: GameSection) => void;
  issues: GameIssue[];
  showIssues: boolean;
  onShowIssuesChange: (open: boolean) => void;
  onPlayLevel: (levelId: string) => void;
  onOpenFilm: (film: CampaignFilm) => Promise<void>;
  onBackupCampaign: () => void;
}

export const GameEditor = forwardRef<GameEditorHandle, Props>(
  function GameEditor(
    {
      assets,
      active,
      section,
      onSelectSection,
      issues,
      showIssues,
      onShowIssuesChange,
      onPlayLevel,
      onOpenFilm,
      onBackupCampaign,
    },
    ref,
  ) {
    const {
      session,
      project,
      path,
      busy,
      message,
      epoch,
      navigation,
    } = useProjectSession();
    const setMessage = (value: string) => session.message(value);
    const setSection = onSelectSection;
    const [levelId, setLevelId] = useState(project.levels[0]?.id ?? "");
    const [combatId, setCombatId] = useState("");
    const [terrainTarget, setTerrainTarget] = useState<{
      levelId: string;
      projectId: string;
      token: string;
      terrainRef?: AssetRef;
      restoredTerrainRef?: AssetRef;
    } | null>(null);

    const [species, setSpecies] = useState("radish"),
      [detail, setDetail] = useState<LevelDetailTab>("waves");
    const [speciesTab, setSpeciesTab] = useState<
        "details" | "capabilities" | "behavior" | "rules" | "animations"
      >("details"),
      [focusAnimationId, setFocusAnimationId] = useState("");
    const [campaignStepId, setCampaignStepId] = useState("");
    const [levelScope, setLevelScope] = useState("all");
    const [compareRewards, setCompareRewards] = useState(false);
    useEffect(() => {
      if (section !== "levels") setCompareRewards(false);
    }, [section]);
    const [duplicateOpen, setDuplicateOpen] = useState(false);
    const [query, setQuery] = useState(""),
      [continent, setContinent] = useState(-1);

    const errors = issues.filter((x) => x.severity === "error");

    const level =
      project.levels.find((l) => l.id === levelId) ?? project.levels[0];
    const location = {
      mode: "levels" as const,
      section,
      levelId,
      species,
      detail,
      speciesTab,
      campaignStepId,
    };
    useEffect(() => {
      if (active) session.setLocation(location);
    }, [
      active,
      session,
      section,
      levelId,
      species,
      detail,
      speciesTab,
      campaignStepId,
    ]);

    function action(a: HistoryAction<GameProject>) {
      session.action(a, location, true);
    }
    function change(
      edit: (p: GameProject) => void,
      key = "",
      label = "",
      allowBusy = false,
    ) {
      const context =
        section === "levels"
          ? "le niveau « " + (level?.title ?? "Nouveau niveau") + " »"
          : section === "plants" || section === "enemies"
            ? "le personnage « " + species + " »"
            : ((
                {
                  campaign: "la campagne",
                  lunas: "l’économie Luna",
                  abilities: "les capacités",
                  behaviors: "les comportements",
                  variables: "les variables",
                } as Record<string, string>
              )[section] ?? "les animations et sons");
      session.change(
        edit,
        key,
        label || "Modifier " + context,
        location,
        allowBusy,
      );
    }
    function updateLevel(patch: Partial<LevelDefinition>, key = "") {
      const id = level.id;
      change(
        (p) => {
          patchProjectLevel(p, id, patch);
        },
        key ? `${id}:${key}` : "",
      );
    }
    async function run(fn: () => Promise<void>) {
      await session.run(fn);
    }
    useImperativeHandle(ref, () => ({
      navigate: (next, targetId, detailTab) => {
        selectSection(next);
        if (next === "levels" && targetId) {
          setQuery("");
          setContinent(-1);
          setLevelScope("all");
          setLevelId(targetId);
          setCompareRewards(false);
          if (detailTab) setDetail(detailTab);
        } else if (next === "campaign" && targetId) {
          setCampaignStepId(targetId);
        }
      },
      createLevel: () => {
        if (!busy) {
          addLevel();
          setSection("levels");
        }
      },
      showChecks: () => {
        if (!busy) onShowIssuesChange(true);
      },
    }));

    useEffect(() => {
      setTerrainTarget(null);
      setCompareRewards(false);
      setLevelId(session.project.levels[0]?.id ?? "");
      setSpecies(session.project.balance.plants[0].id);
      setSection("campaign");
      setQuery("");
      setContinent(-1);
    }, [epoch]);

    useEffect(() => {
      const loc = navigation?.location;
      if (loc?.mode !== "levels") return;
      setCompareRewards(false);
      if (loc.section) setSection(loc.section as GameSection);
      if (loc.levelId) setLevelId(loc.levelId);
      if (loc.species) setSpecies(loc.species);
      if (loc.detail) setDetail(loc.detail as LevelDetailTab);
      if (loc.speciesTab) setSpeciesTab(loc.speciesTab as typeof speciesTab);
      if (loc.campaignStepId !== undefined)
        setCampaignStepId(loc.campaignStepId);
      setLevelScope("all");
      setQuery("");
      setContinent(-1);
    }, [navigation]);

    function levelChange(
      edit: (draft: GameProject) => void,
      label: string,
    ): boolean {
      try {
        change(edit, "", label);
        return true;
      } catch (e) {
        setMessage(e instanceof Error ? e.message : String(e));
        return false;
      }
    }
    const addLevel = (placement?: LevelPlacement) => {
      const near = afterLevel(project, levelId),
        destination =
          placement ??
          (near.kind === "campaign"
            ? near
            : { kind: "campaign" as const, beforeId: null });
      let id = "";
      if (
        !levelChange((p) => {
          id = createProjectLevel(p, destination, levelId);
        }, "Créer et placer un niveau")
      )
        return;
      setQuery("");
      setContinent(-1);
      setLevelScope("all");
      setLevelId(id);
      setDetail("settings");
      setCompareRewards(false);
    };
    const duplicate = (placement: LevelPlacement, title: string) => {
      let id = "";
      if (
        !levelChange((p) => {
          id = duplicateProjectLevel(p, level.id, placement, title);
        }, "Dupliquer et placer le niveau")
      )
        return;
      setQuery("");
      setContinent(-1);
      setLevelScope("all");
      setLevelId(id);
      setDuplicateOpen(false);
    };
    const remove = () =>
      run(async () => {
        if (!level || !(await api.confirmDelete(level.title))) return;
        const next = structuredClone(session.project),
          i = next.levels.findIndex((l) => l.id === level.id);
        if (i < 0) return;
        deleteProjectLevel(next, level.id);
        action({ type: "commit", value: next, label: "Supprimer le niveau" });
        setLevelId(next.levels[Math.min(i, next.levels.length - 1)]?.id ?? "");
      });
    const playLevel = () => {
      if (level) onPlayLevel(level.id);
    };
    useEffect(() => {
      if (!project.levels.some((l) => l.id === levelId))
        setLevelId(project.levels[0]?.id ?? "");
    }, [project, levelId]);

    const selectSection = (next: GameSection) => {
      if (session.getSnapshot().busy) return;
      setSection(next);
      setCompareRewards(false);
      setSpecies(
        next === "enemies"
          ? (activeEnemies(project.balance.enemies)[0]?.id ?? "")
          : project.balance.plants[0].id,
      );
      if (next === "plants" || next === "enemies") {
        setSpeciesTab("details");
        setFocusAnimationId("");
      }
      if (isAdvancedSection(next)) {
        setCombatId("");
      }
    };
    const openAnimationDefinition = (animationId: string) => {
      const animation = project.presentation?.animations.find(
          (value) => value.id === animationId,
        ),
        owner = animation && animationOwnerId(project, animation);
      if (owner) {
        setSpecies(owner);
        setSpeciesTab("animations");
        setFocusAnimationId(animationId);
        setSection(
          project.balance.plants.some((value) => value.id === owner)
            ? "plants"
            : "enemies",
        );
      } else {
        setSection("animations");
        setCombatId(animationId);
      }
    };
    const openCombatIssue = (path: string) => {
      const [, kind, id = ""] = path.split(".");
      let attackId = id;
      if (kind === "effects")
        attackId =
          project.combat!.abilities.find((a) => a.effects.includes(id))?.id ??
          "";
      else if (kind === "projectiles")
        attackId =
          project.combat!.abilities.find((a) => a.projectileId === id)?.id ??
          "";
      setSection("abilities");
      setCombatId(attackId);
    };
    function issueLevel(issue: GameIssue) {
      const match = issue.path.match(/^projet\.levels\[(\d+)\]/);
      return (
        project.levels.find((l) => l.id === issue.levelId) ??
        (match ? project.levels[Number(match[1])] : undefined)
      );
    }
    function issueLocation(issue: GameIssue) {
      const target = issueLevel(issue);
      if (target) return "Niveau · " + target.title;
      const labels: Record<string, string> = {
        homeScreen: "Données d’accueil",
        lunas: "Économie Luna",
        rewards: "Récompenses",
        presentation: "Animations et sons",
        logic: "Comportements et variables",
        combat: "Attaques",
        balance: "Personnages",
        campaign: "Campagne",
        cinematics: "Cinématiques",
      };
      return (
        labels[issue.path.replace(/^projet\./, "").split(/[.[]/)[0]] ?? "Projet"
      );
    }
    function openIssue(issue: GameIssue) {
      const target = issueLevel(issue),
        issuePath = issue.path.replace(/^projet\./, "");
      if (target) {
        setCompareRewards(false);
        setLevelId(target.id);
        setSection("levels");
        setQuery("");
        setContinent(-1);
        setDetail(
          issuePath.includes(".lunaRewards")
            ? "lunas"
            : issuePath.includes(".events")
              ? "events"
              : issuePath.includes(".waves")
                ? "waves"
                : issuePath.includes(".allowedPlants")
                  ? "plants"
                  : "settings",
        );
      } else if (issuePath.startsWith("lunas.")) {
        setSection("lunas");
      } else if (issuePath.startsWith("presentation.")) {
        const parts = issuePath.split(".");
        setSection(
          (["animations", "profiles", "audio", "vfx"].includes(parts[1])
            ? parts[1]
            : "animations") as PresentationSection,
        );
        setCombatId(parts[2] ?? "");
      } else if (issuePath.startsWith("logic.")) {
        const parts = issuePath.split(".");
        setSection(parts[1] === "variables" ? "variables" : "behaviors");
        setCombatId(parts[2] ?? "");
      } else if (issuePath.startsWith("combat.")) openCombatIssue(issuePath);
      else if (issuePath.startsWith("balance.")) {
        const match = issuePath.match(
          /^balance\.(plants|enemies)(?:\[(\d+)\]|\.([^.[\]]+))/,
        );
        if (match) {
          const role = match[1] as "plants" | "enemies";
          setSection(role);
          setSpecies(
            match[2]
              ? (project.balance[role][Number(match[2])]?.id ?? "")
              : match[3],
          );
          setSpeciesTab("details");
        }
      } else setSection("campaign");
      onShowIssuesChange(false);
      requestAnimationFrame(() => {
        const root = document.querySelector(".studio-game-host");
        const label =
          target && issuePath.endsWith(".title")
            ? "Nom du niveau"
            : issuePath === "title"
              ? "Titre du projet"
              : undefined;
        const field = label
          ? root?.querySelector<HTMLElement>('[aria-label="' + label + '"]')
          : root?.querySelector<HTMLElement>(
              ".gd-body input,.gd-body select,.gd-body button",
            );
        field?.focus();
      });
    }

    return (
      <div className="gd-shell" aria-label="Éditeur de niveaux">
        {isAdvancedSection(section) && (
          <div
            className="gd-advanced-context"
            role="navigation"
            aria-label="Outils partagés avancés"
          >
            <span className="gd-advanced-context-label">Options avancées</span>
            <div className="gd-advanced-context-tabs">
              {ADVANCED_SECTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={section === item.id ? "active" : ""}
                  onClick={() => selectSection(item.id)}
                >
                  <span aria-hidden="true">{item.icon} </span>
                  {item.label}
                </button>
              ))}
            </div>
            <span className="gd-advanced-context-hint">
              Réglages courants sur la fiche de chaque personnage
            </span>
          </div>
        )}
        <fieldset className="gd-body" disabled={busy}>
          {section === "lunas" ? (
            <LunaEconomyEditor
              project={project}
              change={(edit, key, label) => change(edit, key, label, true)}
              openLevelLunas={(id) => {
                setQuery("");
                setContinent(-1);
                setLevelScope("all");
                setLevelId(id);
                setDetail("lunas");
                setCompareRewards(false);
                setSection("levels");
              }}
            />
          ) : section === "animations" ||
            section === "profiles" ||
            section === "audio" ||
            section === "vfx" ? (
            <PresentationEditor
              project={project}
              section={section}
              id={combatId}
              select={setCombatId}
              assets={assets}
              change={(edit, key, label) => change(edit, key, label, true)}
              report={setMessage}
              run={run}
              openAnimation={openAnimationDefinition}
            />
          ) : section === "behaviors" ? (
            <BehaviorEditor
              openSpecies={(id) => {
                setSection(
                  project.balance.plants.some((s) => s.id === id)
                    ? "plants"
                    : "enemies",
                );
                setSpecies(id);
                setSpeciesTab("behavior");
              }}
              project={project}
              id={combatId}
              select={setCombatId}
              change={(edit, key, label) => change(edit, key, label, true)}
              report={setMessage}
            />
          ) : section === "variables" ? (
            <VariableEditor
              project={project}
              change={(edit, key, label) => change(edit, key, label, true)}
              report={setMessage}
            />
          ) : section === "campaign" ? (
            <CampaignEditor
              showUnplaced={() => {
                setLevelScope("outside");
                setQuery("");
                setContinent(-1);
                setSection("levels");
              }}
              selectedStepId={campaignStepId}
              onSelectStep={setCampaignStepId}
              backup={onBackupCampaign}
              busy={busy}
              path={path}
              project={project}
              change={(edit, key, label) => change(edit, key, label, true)}
              run={run}
              report={setMessage}
              createLevel={(beforeId) => {
                addLevel({ kind: "campaign", beforeId });
                setSection("levels");
              }}
              selectLevel={(id) => {
                setQuery("");
                setContinent(-1);
                setLevelScope("all");
                setLevelId(id);
                setSection("levels");
              }}
              openFilm={(film) => run(() => onOpenFilm(film))}
            />
          ) : section === "audit" ? (
            <BalanceAuditView
              project={project}
              openPlant={(plantId) => {
                setSpecies(plantId);
                setSpeciesTab("details");
                setSection("plants");
              }}
              openLevel={(id, tab) => {
                setQuery("");
                setContinent(-1);
                setLevelScope("all");
                setLevelId(id);
                setDetail(tab);
                setCompareRewards(false);
                setSection("levels");
              }}
            />
          ) : section === "abilities" ? (
            <CombatEditor
              assets={assets}
              project={project}
              id={combatId}
              select={setCombatId}
              change={(edit, key, label) => change(edit, key, label, true)}
              report={setMessage}
              run={run}
            />
          ) : section !== "levels" ? (
            <BalanceEditor
              assets={assets}
              change={(edit, key, label) => change(edit, key, label, true)}
              openProfile={(id) => {
                setSection("profiles");
                setCombatId(id);
              }}
              editBehavior={(id) => {
                setSection(
                  project.balance.plants.some((s) => s.id === id)
                    ? "plants"
                    : "enemies",
                );
                setSpecies(id);
                setSpeciesTab("behavior");
              }}
              project={project}
              role={section}
              id={species}
              select={setSpecies}
              tab={speciesTab}
              setTab={setSpeciesTab}
              focusAnimationId={focusAnimationId}
              renderAnimationEditor={(animation, patch, speciesId) => (
                <AnimationFields
                  value={animation}
                  project={project}
                  assets={assets}
                  patch={patch}
                  previewSpeciesId={speciesId}
                />
              )}
              update={(id, patch, key) =>
                change(
                  (p) => {
                    const list =
                      section === "plants"
                        ? p.balance.plants
                        : p.balance.enemies;
                    Object.assign(list.find((x) => x.id === id)!, patch);
                  },
                  key,
                  "Calibrer le catalogue global",
                )
              }
            />
          ) : (
            <LevelsWorkspace
              project={project}
              level={level}
              assets={assets}
              active={active}
              hasErrors={errors.length > 0}
              levelScope={levelScope}
              setLevelScope={setLevelScope}
              query={query}
              setQuery={setQuery}
              continent={continent}
              setContinent={setContinent}
              compareRewards={compareRewards}
              setCompareRewards={setCompareRewards}
              detail={detail}
              setDetail={setDetail}
              duplicateOpen={duplicateOpen}
              setDuplicateOpen={setDuplicateOpen}
              selectLevelId={setLevelId}
              addLevel={addLevel}
              duplicateLevel={duplicate}
              removeLevel={remove}
              playLevel={playLevel}
              updateLevel={updateLevel}
              levelChange={levelChange}
              change={change}
              onViewCampaignStep={(stepId) => {
                setCampaignStepId(stepId);
                setSection("campaign");
              }}
              onOpenFilm={(film) => void run(() => onOpenFilm(film))}
              onOpenLunaEconomy={() => setSection("lunas")}
              onOpenTerrainGenerator={({
                levelId: targetLevelId,
                terrainRef,
                restoredTerrainRef,
              }) =>
                setTerrainTarget({
                  levelId: targetLevelId,
                  projectId: project.id,
                  token: session.getSnapshot().token,
                  terrainRef,
                  restoredTerrainRef,
                })
              }
            />
          )}
        </fieldset>
        {message && (
          <div className="gd-message" role="status">
            <span>{message}</span>
            <button
              aria-label="Fermer le message des niveaux"
              onClick={() => setMessage("")}
            >
              ×
            </button>
          </div>
        )}
        <footer className="gd-footer">
          <span title={path || project.title}>
            {busy
              ? "Opération en cours…"
              : path
                ? path.split(/[\\/]/).pop()
                : "Projet sans fichier"}
          </span>
          <button
            className={errors.length ? "gd-error" : ""}
            onClick={() => onShowIssuesChange(!showIssues)}
          >
            {issues.length
              ? `${errors.length} erreur(s) · ${issues.length - errors.length} avertissement(s)`
              : "✓ Projet valide"}
          </button>
        </footer>
        {terrainTarget && (
          <TerrainGenerationDialog
            project={project}
            levelId={terrainTarget.levelId}
            assets={assets}
            onClose={() => setTerrainTarget(null)}
            onApply={(ref, restoredRef) => {
              if (
                session.getSnapshot().busy ||
                session.project.id !== terrainTarget.projectId ||
                session.getSnapshot().token !== terrainTarget.token ||
                session.project.levels.find(
                  (item) => item.id === terrainTarget.levelId,
                )?.terrainImage !== terrainTarget.terrainRef ||
                session.project.levels.find(
                  (item) => item.id === terrainTarget.levelId,
                )?.restoredTerrainImage !== terrainTarget.restoredTerrainRef ||
                !session.project.levels.some(
                  (item) => item.id === terrainTarget.levelId,
                )
              )
                throw new Error(
                  "Le projet ou le niveau a changé. Rouvre la génération du terrain.",
                );
              change(
                (p) => {
                  p.levels.find(
                    (item) => item.id === terrainTarget.levelId,
                  )!.terrainImage = ref;
                  p.levels.find(
                    (item) => item.id === terrainTarget.levelId,
                  )!.restoredTerrainImage = restoredRef;
                },
                "",
                "Utiliser les deux terrains générés",
              );
              setMessage(
                "Terrains pollué et nettoyé affectés au niveau. Enregistre le projet pour conserver ces choix.",
              );
            }}
          />
        )}
        {showIssues && (
          <StudioDialog
            title="Vérifier le projet"
            onClose={() => onShowIssuesChange(false)}
          >
            <div className="gd-issues-list">
              <p>
                Choisis un point pour ouvrir la partie à corriger. Les
                avertissements ne bloquent pas la publication.
              </p>
              {issues.length ? (
                issues.map((issue, index) => {
                  const path = issue.path.replace(/^projet\./, "");
                  const details = (
                    <>
                      <b>{issue.severity === "error" ? "À corriger" : "À vérifier"}</b>{" "}
                      {issue.message}
                      <small>{issueLocation(issue)}</small>
                    </>
                  );
                  if (path === "homeScreen" || path.startsWith("homeScreen.")) {
                    return <div className="gd-issue-details" key={index}>{details}</div>;
                  }
                  return (
                    <button key={index} onClick={() => openIssue(issue)}>
                      {details}
                      <span aria-hidden="true"> Ouvrir →</span>
                    </button>
                  );
                })
              ) : (
                <p>
                  Aucune erreur détectée. Ce contrôle n’évalue pas la difficulté
                  réelle d’une partie.
                </p>
              )}
            </div>
          </StudioDialog>
        )}
      </div>
    );
  },
);
