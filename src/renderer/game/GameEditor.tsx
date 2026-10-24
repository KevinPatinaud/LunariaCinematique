import { linkCinematic } from '../../shared/game/cinematicManagement.js';
import {
  LevelCampaignPosition,
  DuplicateLevelDialog,
} from "./LevelPlacement.js";
import {
  afterLevel,
  createProjectLevel,
  duplicateProjectLevel,
  deleteProjectLevel,
  placeLevel,
  patchProjectLevel,
  levelPosition,
  orderedLevels,
  type LevelPlacement,
} from "../../shared/game/levelManagement.js";
import { LevelObjectiveEditor } from "./LevelObjectiveEditor.js";
import { useProjectSession } from "../project/ProjectSessionContext.js";
import type { Asset, AssetRef } from "../../shared/model.js";
import { animationOwnerId } from "../../shared/presentation/ownership.js";
import type { PresentationSection } from "../../shared/presentation/types.js";
import {
  AnimationFields,
  PresentationEditor,
} from "../presentation/PresentationEditor.js";
import { BehaviorEditor } from "./BehaviorEditor.js";
import { EventEditor } from "./EventEditor.js";
import { VariableEditor } from "./VariableEditor.js";
import { LevelRewardsOverview } from "./LevelRewardsOverview.js";
import { HomeScreenEditor } from "./HomeScreenEditor.js";
import { CombatEditor } from "./CombatEditor.js";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { type HistoryAction } from "../../shared/history.js";
import {
  activeEnemies,
  CONTINENTS,
  totalEnemies,
  isConquest,
  type GameProject,
  type LevelDefinition,
  type GameBuildTarget,
} from "../../shared/game/types.js";
import { gameIssues } from "../../shared/game/validation.js";
import { api } from "../browserBridge.js";
import { gameAPI } from "./bridge.js";
import { BalanceEditor, Num } from "./BalanceEditor.js";
import { ImagePicker } from "../presentation/ImagePicker.js";
import { TerrainGenerationDialog } from "./TerrainGenerationDialog.js";
import { AndroidDeploymentStatus, type AndroidDeploymentStatusState } from "./AndroidDeploymentStatus.js";
import { WaveEditor } from "./WaveEditor.js";
import { CampaignEditor } from "./CampaignEditor.js";
import { ensureCampaign } from "../../shared/game/campaign.js";
import type { CampaignFilm } from "../../shared/game/types.js";
import { StudioDialog } from "../components/StudioDialog.js";
import type { GameIssue } from "../../shared/game/validation.js";
import "./game.css";
import "./levelsCampaign.css";
export type GameSection =
  | "home"
  | "campaign"
  | "levels"
  | "plants"
  | "enemies"
  | "abilities"
  | "behaviors"
  | "variables"
  | PresentationSection;
export interface GameEditorHandle {
  navigate(section: GameSection): void;
  createLevel(): void;
  showChecks(): void;
}
interface Props {
  assets: Asset[];
  externalUsages: Record<string, string[]>;
  active: boolean;
  onOpenFilm: (film: CampaignFilm) => Promise<void>;
  onBeforePublish: () => Promise<boolean>;
  onBackupCampaign: () => void;
}
export const GameEditor = forwardRef<GameEditorHandle, Props>(
  function GameEditor(
    {
      assets,
      externalUsages,
      active,
      onOpenFilm,
      onBeforePublish,
      onBackupCampaign,
    },
    ref,
  ) {
    const {
      session,
      project,
      path,
      busy,
      ready: booted,
      dirty,
      message,
      recoveryStatus,
      epoch,
      navigation,
    } = useProjectSession();
    const setMessage = (value: string) => session.message(value);
    const [section, setSection] = useState<GameSection>("campaign"),
      [levelId, setLevelId] = useState(project.levels[0]?.id ?? "");
    const [combatId, setCombatId] = useState("");
    const [toolsOpen, setToolsOpen] = useState(false);
    const [terrainTarget, setTerrainTarget] = useState<{
      levelId: string;
      projectId: string;
      token: string;
      terrainRef?: AssetRef;
      restoredTerrainRef?: AssetRef;
    } | null>(null);
    const deliveryRef = useRef<HTMLDetailsElement>(null);
    const [androidDeployment,setAndroidDeployment]=useState<AndroidDeploymentStatusState|null>(null);
    useEffect(() => {
      if (["abilities", "behaviors", "variables", "animations", "profiles", "audio", "vfx"].includes(section))
        setToolsOpen(true);
    }, [section]);
    useEffect(() => {
      const close = (event: PointerEvent) => {
        if (
          deliveryRef.current &&
          !deliveryRef.current.contains(event.target as Node)
        )
          deliveryRef.current.open = false;
      };
      document.addEventListener("pointerdown", close);
      return () => document.removeEventListener("pointerdown", close);
    }, []);
    const [species, setSpecies] = useState("radish"),
      [detail, setDetail] = useState<
        "settings" | "waves" | "plants" | "events"
      >("waves");
    const [speciesTab, setSpeciesTab] = useState<
        "details" | "capabilities" | "behavior" | "rules" | "animations"
      >("details"),
      [focusAnimationId, setFocusAnimationId] = useState("");
    const [campaignStepId, setCampaignStepId] = useState("");
    const [levelScope, setLevelScope] = useState("all");
    const [compareRewards, setCompareRewards] = useState(false);
    useEffect(() => { if (section !== "levels") setCompareRewards(false); }, [section]);
    const [duplicateOpen, setDuplicateOpen] = useState(false);
    const [query, setQuery] = useState(""),
      [continent, setContinent] = useState(-1);
    const [showIssues, setShowIssues] = useState(false);
    const issues = useMemo(() => gameIssues(project), [project]),
      errors = issues.filter((x) => x.severity === "error");
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
    if (active) session.setLocation(location);
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
                  home: "l’écran d’accueil",
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
    const save = (as = false) => session.saveCurrent(as);
    useImperativeHandle(ref, () => ({
      navigate: (next) => selectSection(next),
      createLevel: () => {
        if (!busy) {
          addLevel();
          setSection("levels");
        }
      },
      showChecks: () => {
        if (!busy) setShowIssues(true);
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
      if (loc.detail) setDetail(loc.detail as typeof detail);
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
        // The asynchronous confirmation may finish after a render; edit from the current state.
        const next = structuredClone(session.project),
          i = next.levels.findIndex((l) => l.id === level.id);
        if (i < 0) return;
        deleteProjectLevel(next, level.id);
        action({ type: "commit", value: next, label: "Supprimer le niveau" });
        setLevelId(next.levels[Math.min(i, next.levels.length - 1)]?.id ?? "");
      });
    const playLevel = () =>
      void run(async () => {
        if (!level || !(await onBeforePublish()) || !(await save())) return;
        const id = level.id;
        const result = await gameAPI.playLevel(session.project, id);
        if (result)
          setMessage(
            `Lunaria lancé sur « ${result.title} » dans une copie temporaire du jeu. La campagne publiée et la progression du joueur sont conservées.`,
          );
      });
    const buildGame = (target: GameBuildTarget) =>
      void run(async () => {
        if (!(await onBeforePublish()) || !(await save())) return;
        const label = target === "windows" ? "PC" : "Android";
        setMessage(
          `Export ${label} en cours… La campagne est synchronisée avant l’export.`,
        );
        const result = await gameAPI.build(session.project, target);
        setMessage(
          result
            ? `Export ${label} terminé : ${result.artifact}\n${(result.bytes / 1048576).toFixed(1)} Mo · SHA-256 ${result.sha256}`
            : `Export ${label} annulé.`,
        );
      });
    const deployAndroid = () =>
      void run(async () => {
        const startedAt=Date.now();
        setAndroidDeployment({phase:'save',message:'Enregistrement du projet…',startedAt,status:'running'});
        try {
          if (!(await onBeforePublish()) || !(await save())) {
            const message=session.getSnapshot().conflict?'Le fichier a changé sur le disque. Compare les versions avant de relancer le déploiement.':'Déploiement annulé : le projet doit être enregistré avant son envoi au téléphone.';
            setAndroidDeployment(current=>current&&({...current,status:'canceled',message}));
            return;
          }
          setMessage("Préparation du déploiement Android…");
          const result = await gameAPI.deployAndroid(session.project);
          const message=result
            ? `Lunaria installé et lancé sur ${result.device.name} (${result.device.serial}).\nAPK : ${result.artifact}\n${(result.bytes / 1048576).toFixed(1)} Mo · SHA-256 ${result.sha256}`
            : "Déploiement Android annulé.";
          setMessage(message);
          setAndroidDeployment(current=>current&&({...current,status:result?'success':'canceled',message}));
        } catch(error) {
          setAndroidDeployment(current=>current&&({...current,status:'error',message:error instanceof Error?error.message:String(error)}));
          throw error;
        }
      });
    useEffect(
      () =>
        gameAPI.onAndroidDeploymentProgress((progress) => {
          setMessage(progress.message);
          setAndroidDeployment(current=>current?.status==='running'?{...current,...progress}:current);
        }),
      [],
    );
    useEffect(() => {
      if (!project.levels.some((l) => l.id === levelId))
        setLevelId(project.levels[0]?.id ?? "");
    }, [project, levelId]);
    const norm = (s: string) =>
      s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    const visible = orderedLevels(project).filter(
      (l) =>
        (continent < 0 || l.act === continent) &&
        (levelScope === "all" ||
          levelPosition(project, l.id).index >= 0 ===
            (levelScope === "placed")) &&
        norm(l.title + " " + l.id + " " + l.location).includes(norm(query)),
    );
    const selectSection = (next: typeof section) => {
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
        homeScreen: "Écran d’accueil",
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
        path = issue.path.replace(/^projet\./, "");
      if (target) {
        setCompareRewards(false);
        setLevelId(target.id);
        setSection("levels");
        setQuery("");
        setContinent(-1);
        setDetail(
          path.includes(".events")
            ? "events"
            : path.includes(".waves")
              ? "waves"
              : path.includes(".allowedPlants")
                ? "plants"
                : "settings",
        );
      } else if (path.startsWith("presentation.")) {
        const parts = path.split(".");
        setSection(
          (["animations", "profiles", "audio", "vfx"].includes(parts[1])
            ? parts[1]
            : "animations") as PresentationSection,
        );
        setCombatId(parts[2] ?? "");
      } else if (path.startsWith("logic.")) {
        const parts = path.split(".");
        setSection(parts[1] === "variables" ? "variables" : "behaviors");
        setCombatId(parts[2] ?? "");
      }
      else if (path.startsWith("homeScreen.")) setSection("home");
      else if (path.startsWith("combat.")) openCombatIssue(path);
      else if (path.startsWith("balance.")) {
        const match = path.match(
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
      setShowIssues(false);
      requestAnimationFrame(() => {
        const root = document.querySelector(".studio-game-host");
        const label =
          target && path.endsWith(".title")
            ? "Nom du niveau"
            : path === "title"
              ? "Titre du projet de niveaux"
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
        <header className="gd-toolbar">
          <div className="gd-project-name">
            <span className="gd-kicker">PROJET DE JEU</span>
            <input
              aria-label="Titre du projet de niveaux"
              maxLength={160}
              value={project.title}
              disabled={busy}
              onChange={(e) =>
                change(
                  (p) => {
                    p.title = e.target.value;
                  },
                  "title",
                  "Renommer le projet",
                )
              }
            />
            <small title={path}>
              {path || "Non enregistré · un seul catalogue pour tout le jeu"}
              {dirty ? " · Modifié" : ""}
            </small>
          </div>
          <div className="gd-inline">
            <details
              ref={deliveryRef}
              className="gd-delivery"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  e.currentTarget.open = false;
                  e.currentTarget.querySelector("summary")?.focus();
                }
              }}
            >
              <summary>Publier et exporter</summary>
              <div
                className="gd-delivery-menu"
                onClick={(event) => {
                  if (
                    (event.target as Element).closest("button") &&
                    deliveryRef.current
                  )
                    deliveryRef.current.open = false;
                }}
              >
                <p>
                  <strong>Le projet reste ton fichier de travail.</strong> Ces
                  actions préparent sa version jouable.
                </p>
                {errors.length > 0 && (
                  <button
                    className="gd-delivery-errors"
                    onClick={() => {
                      if (deliveryRef.current) deliveryRef.current.open = false;
                      setShowIssues(true);
                    }}
                  >
                    {errors.length} point{errors.length > 1 ? "s" : ""} à
                    corriger avant de continuer →
                  </button>
                )}
                <button
                  className="gd-publish"
                  disabled={busy || errors.length > 0}
                  onClick={() =>
                    void run(async () => {
                      if (!(await onBeforePublish()) || !(await save())) return;
                      const result = await gameAPI.publish(session.project);
                      if (result)
                        setMessage(
                          "Publié : " +
                            result.path +
                            "\nRelance le jeu pour utiliser ces données.",
                        );
                    })
                  }
                >
                  Publier la campagne
                </button>
                <button
                  className="gd-build gd-build-pc"
                  disabled={busy || errors.length > 0}
                  title="Synchroniser la campagne puis générer build/windows/Lunaria.exe"
                  onClick={() => buildGame("windows")}
                >
                  Exporter pour PC
                </button>
                <button
                  className="gd-build gd-build-android"
                  disabled={busy || errors.length > 0}
                  title="Synchroniser la campagne puis générer build/android/Lunaria.apk"
                  onClick={() => buildGame("android")}
                >
                  Exporter pour Android
                </button>
                <button
                  className="gd-build gd-deploy-android"
                  disabled={busy || errors.length > 0}
                  title="Compiler l’APK Android, l’installer sur le téléphone autorisé puis lancer Lunaria"
                  onClick={deployAndroid}
                >
                  Builder et Déployer sur le téléphone connecté
                </button>
                <small>
                  La publication met à jour le jeu sélectionné. Un export crée
                  ensuite son application PC ou Android.
                </small>
              </div>
            </details>
          </div>
        </header>
        {androidDeployment&&<AndroidDeploymentStatus state={androidDeployment} onClose={()=>setAndroidDeployment(null)}/>}
        <nav className="gd-sections" aria-label="Sections du mode Niveaux">
          <button
            className={section === "home" ? "active" : ""}
            onClick={() => selectSection("home")}
          >
            Écran d’accueil
          </button>
          <button
            className={section === "campaign" ? "active" : ""}
            onClick={() => selectSection("campaign")}
          >
            Campagne <small>Ordre de lecture</small>
          </button>
          <button
            className={section === "levels" ? "active" : ""}
            onClick={() => selectSection("levels")}
          >
            Niveaux <small>{project.levels.length}</small>
          </button>
          <button
            className={section === "plants" ? "active" : ""}
            onClick={() => selectSection("plants")}
          >
            Plantes alliées <small>Équilibrage global</small>
          </button>
          <button
            className={section === "enemies" ? "active" : ""}
            onClick={() => selectSection("enemies")}
          >
            Ennemis <small>Équilibrage global</small>
          </button>
          <span>Équilibrage global · sans progression</span>
        </nav>
        <details
          className="gd-tools"
          open={toolsOpen}
          onToggle={(e) => setToolsOpen(e.currentTarget.open)}
        >
          <summary>
            Options avancées{" "}
            <span>Modèles partagés, variables et ressources communes</span>
          </summary>
          <nav
            className="lp-navigation"
            aria-label="Outils partagés avancés"
          >
            <div className="lp-navigation-heading">
              <span aria-hidden="true">✦</span>
              <div>
                <b>Modèles et ressources partagés</b>
                <small>
                  Les capacités, comportements, animations et sons se règlent depuis la fiche de chaque personnage.
                </small>
              </div>
            </div>
            <div className="lp-navigation-actions">
              {(
                [
                  ["abilities", "✧", "Modèles de capacités", "Capacités réutilisables"],
                  ["behaviors", "◇", "Modèles de comportements", "Comportements réutilisables"],
                  ["variables", "⚑", "Variables", "État scénarisé"],
                  [
                    "animations",
                    "▶",
                    "Animations communes",
                    "Pour tous les personnages",
                  ],
                  ["profiles", "♟", "Profils avancés", "Liaisons et sons"],
                  ["audio", "♪", "Sons", "Ambiances et attaques"],
                  ["vfx", "✦", "Effets visuels", "Impacts et particules"],
                ] as const
              ).map(([key, icon, label, hint]) => (
                <button
                  key={key}
                  className={section === key ? "active" : ""}
                  onClick={() => {
                    selectSection(key);
                    setCombatId("");
                  }}
                >
                  <span aria-hidden="true">{icon}</span>
                  <span>
                    <b>{label}</b>
                    <small>{hint}</small>
                  </span>
                </button>
              ))}
            </div>
          </nav>
        </details>
        <fieldset className="gd-body" disabled={busy}>
          {section === "home" ? (
            <HomeScreenEditor
              project={project}
              assets={assets}
              change={(edit, key, label) => change(edit, key, label, true)}
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
              externalUsages={externalUsages}
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
            <>
              <aside className="gd-level-list">
                <div className="gd-list-controls">
                  <button aria-pressed={compareRewards} onClick={() => setCompareRewards(!compareRewards)}>
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
                    onClick={() => addLevel()}
                  >
                    + Créer un niveau
                  </button>
                </div>
                <div className="gd-level-items">
                  {visible.map((l) => (
                    <button
                      key={l.id}
                      className={level?.id === l.id ? "selected" : ""}
                      onClick={() => { setLevelId(l.id); setCompareRewards(false); }}
                    >
                      <span className="gd-level-index">
                        {levelPosition(project, l.id).number
                          ? String(
                              levelPosition(project, l.id).number,
                            ).padStart(2, "0")
                          : "–"}
                      </span>
                      <span>
                        <b>{l.title}</b>
                        <small className="level-path-badge">
                          {levelPosition(project, l.id).index < 0
                            ? "Hors parcours"
                            : "Étape " +
                              (levelPosition(project, l.id).index + 1) +
                              " du parcours"}
                        </small>
                        <small>
                          {CONTINENTS[l.act]} · {l.waves.length} vague
                          {l.waves.length > 1 ? "s" : ""} · {totalEnemies(l)}{" "}
                          ennemis
                        </small>
                      </span>
                    </button>
                  ))}
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
                <LevelRewardsOverview project={project} openLevel={(id, tab) => {
                  setQuery(""); setContinent(-1); setLevelScope("all");
                  setLevelId(id); setDetail(tab); setCompareRewards(false);
                }} />
              ) : level ? (
                <main className="gd-level-main gd-scroll" key={level.id}>
                  <div className="gd-section-heading">
                    <div>
                      <div className="gd-kicker">
                        FICHE DU NIVEAU · {CONTINENTS[level.act]}
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
                        disabled={errors.length > 0}
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
                      <button onClick={() => void remove()}>Supprimer</button>
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
                    onView={(stepId) => {
                      setCampaignStepId(stepId);
                      setSection("campaign");
                    }}
                  />
                  {duplicateOpen && (
                    <DuplicateLevelDialog
                      project={project}
                      level={level}
                      onClose={() => setDuplicateOpen(false)}
                      onDuplicate={duplicate}
                    />
                  )}
                  <nav
                    className="gd-detail-tabs"
                    aria-label="Édition du niveau"
                  >
                    {(
                      [
                        ["settings", "Paramètres"],
                        ["waves", "Vagues & ennemis"],
                        ["plants", "Plantes disponibles"],
                        ["events", "Événements"],
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
                              updateLevel(
                                { location: e.target.value },
                                "location",
                              )
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
                          Cette image remplit le fond du combat pour ce niveau.
                          Choisis de préférence une image au format 16:9 ; la
                          grille et les personnages restent affichés par-dessus.
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
                            setTerrainTarget({
                              levelId: level.id,
                              projectId: project.id,
                              token: session.getSnapshot().token,
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
                            onClick={() =>
                              updateLevel({ terrainImage: undefined })
                            }
                          >
                            Retirer l’image du terrain
                          </button>
                        )}
                        <ImagePicker
                          label="Décor restauré"
                          value={level.restoredTerrainImage ? [level.restoredTerrainImage] : []}
                          assets={assets}
                          category="environment"
                          change={(refs) => updateLevel({ restoredTerrainImage: refs[0] as `library://${string}` | undefined })}
                          buttonLabel="Choisir ou importer le décor restauré"
                        />
                        <p>
                          Le décor initial est remplacé progressivement par cette image au fil du combat.
                          Utilise le même cadrage pour conserver les bâtiments et le terrain en place.
                        </p>
                        {level.restoredTerrainImage && (
                          <button type="button" onClick={() => updateLevel({ restoredTerrainImage: undefined })}>
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
                          onChange={(e) =>
                            updateLevel({ tip: e.target.value }, "tip")
                          }
                        />
                      </label>
                      {!isConquest(level.objective.type) && (
                        <p className="gd-callout">
                          Le plateau comporte 5 allées × 8 cases. Les dégâts
                          contre la cible utilisent son armure et ses
                          résistances configurées ici.
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
                            Toutes les espèces autorisées ici sont disponibles
                            dès le début du niveau. Le joueur ne compose pas
                            d’équipe ; l’histoire détermine les compagnons
                            présents. Plusieurs exemplaires d’une même espèce
                            peuvent être plantés.
                          </p>
                        </div>
                        <div className="gd-inline">
                          <button
                            onClick={() =>
                              updateLevel({
                                allowedPlants: project.balance.plants.map(
                                  (p) => p.id,
                                ),
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
                              level.allowedPlants.includes(p.id)
                                ? "selected"
                                : ""
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
                                    : level.allowedPlants.filter(
                                        (x) => x !== p.id,
                                      ),
                                })
                              }
                            />
                            <span>
                              <b>{p.name}</b>
                              <small>{p.role}</small>
                              <small>
                                {p.cost} graines · {p.max_hp} PV · {p.damage}{" "}
                                dégâts
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
                    <>
                      <EventEditor
                        project={project}
                        level={level}
                        update={(events) => updateLevel({ events })}
                        linkFilm={(documentId) => change(p => { linkCinematic(p, documentId); }, "", "Lier une cinématique du projet", true)}
                      />

                    </>
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
          <span>
            {busy
              ? "Opération en cours…"
              : dirty
                ? "Modifications non enregistrées" +
                  (recoveryStatus === "Brouillon local à jour"
                    ? " · récupération locale à jour"
                    : "")
                : path
                  ? "Projet enregistré"
                  : "Projet non enregistré"}
          </span>
          <button
            className={errors.length ? "gd-error" : ""}
            onClick={() => setShowIssues(!showIssues)}
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
                  p.levels.find((item) => item.id === terrainTarget.levelId)!.restoredTerrainImage = restoredRef;
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
            onClose={() => setShowIssues(false)}
          >
            <div className="gd-issues-list">
              <p>
                Choisis un point pour ouvrir la partie à corriger. Les
                avertissements ne bloquent pas la publication.
              </p>
              {issues.length ? (
                issues.map((i, n) => (
                  <button key={n} onClick={() => openIssue(i)}>
                    <b>
                      {i.severity === "error" ? "À corriger" : "À vérifier"}
                    </b>{" "}
                    {i.message}
                    <small>{issueLocation(i)}</small>
                    <span aria-hidden="true"> Ouvrir →</span>
                  </button>
                ))
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
