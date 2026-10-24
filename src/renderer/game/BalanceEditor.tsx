import { EnemyRulesEditor } from "./EnemyRulesEditor.js";
import { duplicateEnemy } from "../../shared/game/enemyRules.js";
import React, { useEffect, useState } from "react";
import { SpeciesAnimations } from "../presentation/SpeciesAnimations.js";
import type { Change } from "../presentation/PresentationEditor.js";
import type { Asset } from "../../shared/model.js";
import {
  activeEnemies,
  DAMAGE_LABELS,
  DAMAGE_TYPES,
  type PlantDefinition,
  type EnemyDefinition,
  type GameProject,
} from "../../shared/game/types.js";
import type { AnimationDefinition } from "../../shared/presentation/types.js";
import { ImagePicker } from "../presentation/ImagePicker.js";
import { Num } from "./CombatFields.js";
export { Num } from "./CombatFields.js";
import { SpeciesCapabilities } from "./capabilities/SpeciesCapabilities.js";
import { SpeciesBehavior } from "./behaviors/SpeciesBehavior.js";
export function BalanceEditor({
  project,
  role,
  id,
  select,
  update,
  editBehavior,
  assets,
  change,
  openProfile,
  tab,
  setTab,
  focusAnimationId,
  renderAnimationEditor,
}: {
  assets: Asset[];
  change: Change;
  openProfile: (id: string) => void;
  editBehavior: (id: string) => void;
  project: GameProject;
  role: "plants" | "enemies";
  id: string;
  select: (id: string) => void;
  update: (
    id: string,
    patch: Partial<PlantDefinition & EnemyDefinition>,
    key: string,
  ) => void;
  tab: "details" | "capabilities" | "behavior" | "rules" | "animations";
  setTab: (
    tab: "details" | "capabilities" | "behavior" | "rules" | "animations",
  ) => void;
  focusAnimationId?: string;
  renderAnimationEditor: (
    animation: AnimationDefinition,
    patch: (data: Record<string, unknown>, key?: string) => void,
    speciesId: string,
  ) => React.ReactNode;
}) {
  const list = project.balance[role],
    plant = role === "plants";
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setQuery("");
    setShowArchived(false);
  }, [role]);
  useEffect(() => {
    if (plant && tab === "rules") setTab("details");
  }, [plant, tab, setTab]);
  useEffect(() => {
    if (
      role === "enemies" &&
      project.balance.enemies.find((x) => x.id === id)?.archived
    )
      setShowArchived(true);
  }, [id, role]);
  const archived = (species: PlantDefinition | EnemyDefinition) =>
    "archived" in species && species.archived === true;
  const entries = plant
    ? list
    : list.filter((x) => archived(x) === showArchived);
  const item = entries.find((x) => x.id === id) ?? entries[0];
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("fr");
  const visible = entries.filter((x) =>
    normalize(x.name + " " + x.id + " " + ("role" in x ? x.role : "")).includes(
      normalize(query.trim()),
    ),
  );
  const uses = project.levels.filter((l) =>
    plant
      ? l.allowedPlants.includes(item?.id)
      : l.waves.some((w) => w.groups.some((g) => g.enemyId === item?.id)),
  ).length;
  const set = (key: string, value: unknown) => {
    if (item) update(item.id, { [key]: value }, `${item.id}:${key}`);
  };
  const n = (
    key: string,
    label: string,
    max: number,
    min = 0,
    integer = false,
  ) => (
    <Num
      key={key}
      label={label}
      value={Number((item as unknown as Record<string, unknown>)[key])}
      min={min}
      max={max}
      integer={integer}
      change={(v) => set(key, v)}
    />
  );
  const archive = () => {
    if (!item || plant) return;
    const id = item.id;
    change(
      (p) => {
        p.balance.enemies.find((x) => x.id === id)!.archived = true;
      },
      "",
      "Archiver l’ennemi",
    );
    select(
      activeEnemies(project.balance.enemies).find((x) => x.id !== id)?.id ?? "",
    );
  };
  const restore = () => {
    if (!item || plant) return;
    const id = item.id;
    change(
      (p) => {
        delete p.balance.enemies.find((x) => x.id === id)!.archived;
      },
      "",
      "Restaurer l’ennemi",
    );
    setShowArchived(false);
    select(id);
  };
  return (
    <div className="gd-balance">
      <aside
        className="gd-catalog"
        aria-label={plant ? "Catalogue des plantes" : "Catalogue des ennemis"}
      >
        <div className="gd-catalog-search">
          <label>
            <span>{plant ? "Trouver une plante" : "Trouver un ennemi"}</span>
            <input
              type="search"
              aria-label="Rechercher un personnage"
              placeholder="Nom ou rôle…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <small role="status">
            {visible.length} / {entries.length} personnages
          </small>
          {!plant && (
            <button
              type="button"
              className="gd-archive-toggle"
              aria-pressed={showArchived}
              onClick={() => {
                setShowArchived(!showArchived);
                setQuery("");
              }}
            >
              {showArchived
                ? "← Ennemis actifs"
                : `Archives (${list.filter(archived).length})`}
            </button>
          )}
        </div>
        {!visible.length && (
          <div className="gd-empty-search">
            <p>
              {entries.length
                ? "Aucun personnage trouvé."
                : showArchived
                  ? "Aucun ennemi archivé."
                  : "Aucun ennemi actif."}
            </p>
            {!!query && (
              <button onClick={() => setQuery("")}>Effacer la recherche</button>
            )}
          </div>
        )}
        {visible.map((x) => (
          <button
            key={x.id}
            className={x.id === item?.id ? "selected" : ""}
            onClick={() => select(x.id)}
          >
            <b>{x.name}</b>
            <small>{x.id}</small>
          </button>
        ))}
      </aside>
      {item ? (
        <section className="gd-scroll gd-balance-form" key={item.id}>
          {error && <p role="alert">{error}</p>}
          <div className="gd-kicker">
            CATALOGUE GLOBAL · {plant ? "PLANTE ALLIÉE" : "ENNEMI"}
            {!plant && archived(item) ? " · ARCHIVÉ" : ""}
          </div>
          <div className="gd-section-heading">
            <h1>{item.name}</h1>
            {!plant && (
              <button
                type="button"
                className="gd-archive-action"
                onClick={archived(item) ? restore : archive}
              >
                {archived(item) ? "Restaurer l’ennemi" : "Archiver l’ennemi"}
              </button>
            )}
          </div>
          {!plant && (
            <p className="gd-note">
              {archived(item)
                ? "Espèce masquée dans les choix futurs. Ses données et ses utilisations existantes sont conservées."
                : "L’archivage masque cet ennemi du catalogue actif et des nouveaux choix, sans modifier les niveaux existants."}
            </p>
          )}
          {tab !== "capabilities" && tab !== "behavior" && tab !== "rules" && (
            <section
              className="lp-character-image lp-character-image-compact"
              aria-label={"Image principale de " + item.name}
            >
              <div>
                <h2>Image du personnage</h2>
                <p>Image de repos partagée entre tous les niveaux.</p>
                <ImagePicker
                  label={"Image principale de " + item.name}
                  value={
                    item.visual?.sprite.asset ? [item.visual.sprite.asset] : []
                  }
                  region={item.visual?.sprite.region}
                  assets={assets}
                  category={plant ? "character" : "enemy"}
                  change={(refs) => {
                    if (!refs[0]) return;
                    update(
                      item.id,
                      {
                        visual: {
                          ...(item.visual ?? {
                            width: 100,
                            height: 100,
                            baseline: 0,
                            mirror: false,
                            tint: "#ffffff",
                            note: "",
                          }),
                          sprite: { asset: refs[0] as `library://${string}` },
                        },
                      },
                      `${item.id}:visual:image`,
                    );
                  }}
                  buttonLabel="Choisir ou importer une image"
                />
              </div>
            </section>
          )}
          {tab === "details" && (
            <p className="gd-callout">
              Ce réglage est partagé par <strong>tous les niveaux</strong>.
              Cette espèce est utilisée dans {uses} niveau{uses > 1 ? "x" : ""}.
              Aucun niveau ne peut remplacer ces valeurs.
            </p>
          )}
          <nav
            className="gd-detail-tabs lp-species-tabs"
            aria-label={"Fiche de " + item.name}
          >
            <button
              className={tab === "details" ? "active" : ""}
              onClick={() => setTab("details")}
            >
              Caractéristiques
            </button>
            <button
              className={tab === "capabilities" ? "active" : ""}
              onClick={() => setTab("capabilities")}
            >
              Capacités
            </button>
            <button
              className={tab === "behavior" ? "active" : ""}
              onClick={() => setTab("behavior")}
            >
              Comportement
            </button>
            <button
              className={tab === "animations" ? "active" : ""}
              onClick={() => setTab("animations")}
            >
              Animations et sons de {item.name}
            </button>
            {!plant && (
              <button
                className={tab === "rules" ? "active" : ""}
                onClick={() => setTab("rules")}
              >
                Règles du plateau
              </button>
            )}
          </nav>
          {tab === "capabilities" ? (
            <SpeciesCapabilities
              key={item.id}
              project={project}
              ownerId={item.id}
              assets={assets}
              change={change}
              editBehavior={editBehavior}
            />
          ) : tab === "behavior" ? (
            <SpeciesBehavior
              key={item.id}
              project={project}
              ownerId={item.id}
              change={change}
            />
          ) : tab === "rules" && !plant ? (
            <EnemyRulesEditor
              project={project}
              enemy={item as EnemyDefinition}
              change={change}
            />
          ) : tab === "animations" ? (
            <SpeciesAnimations
              project={project}
              id={item.id}
              assets={assets}
              change={change}
              openProfile={openProfile}
              focusAnimationId={focusAnimationId}
              renderAnimationEditor={renderAnimationEditor}
              editCapabilities={() => setTab("capabilities")}
            />
          ) : (
            <>
              <div className="gd-form-grid">
                <label className="gd-field">
                  <span>Nom affiché</span>
                  <input
                    aria-label="Nom de l’espèce"
                    maxLength={80}
                    value={item.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </label>
                <label className="gd-field">
                  <span>Type de dégâts</span>
                  <select
                    aria-label="Type de dégâts"
                    value={item.damage_type}
                    onChange={(e) => set("damage_type", e.target.value)}
                  >
                    {DAMAGE_TYPES.map((x) => (
                      <option key={x} value={x}>
                        {DAMAGE_LABELS[x]}
                      </option>
                    ))}
                  </select>
                </label>
                {plant ? (
                  <>
                    {n("max_hp", "Points de vie", 6000, 1, true)}
                    {n("cost", "Coût en graines", 10000, 0, true)}
                    {n("cooldown", "Recharge de plantation (s)", 120)}
                  </>
                ) : (
                  <>
                    {n("hp", "Points de vie", 20000, 1, true)}
                    {n("speed", "Vitesse (cases/s)", 2, 0)}
                    {n("reach", "Portée de contact (cases)", 9)}
                    {n("reward", "Graines au recyclage", 400, 0, true)}
                  </>
                )}
              </div>
              {!plant && (
                <button
                  onClick={() => {
                    try {
                      let created = "";
                      change(
                        (p) => {
                          created = duplicateEnemy(p, item.id).id;
                        },
                        "",
                        "Dupliquer un ennemi",
                      );
                      if (created) {
                        select(created);
                        setShowArchived(false);
                        setError("");
                      }
                    } catch (error) {
                      setError(
                        error instanceof Error ? error.message : String(error),
                      );
                    }
                  }}
                  disabled={project.balance.enemies.length >= 128}
                >
                  Dupliquer l’ennemi
                </button>
              )}
              <h2>Protections</h2>
              <p>
                Le perforant et le toxique ignorent l’armure, mais pas leur
                résistance. Le type pur ignore les deux.
              </p>
              <div className="gd-form-grid">
                <Num
                  label="Armure physique (%)"
                  value={item.armor * 100}
                  max={95}
                  change={(v) => set("armor", v / 100)}
                />
                {(["physical", "piercing", "toxic"] as const).map((x) => (
                  <Num
                    key={x}
                    label={`Résistance ${DAMAGE_LABELS[x].toLowerCase()} (%)`}
                    value={item.resistances[x] * 100}
                    max={95}
                    change={(v) =>
                      set("resistances", { ...item.resistances, [x]: v / 100 })
                    }
                  />
                ))}
              </div>
              {plant && (
                <label className="gd-field">
                  <span>Description</span>
                  <textarea
                    maxLength={1000}
                    rows={3}
                    value={(item as PlantDefinition).description}
                    onChange={(e) => set("description", e.target.value)}
                  />
                </label>
              )}
            </>
          )}
        </section>
      ) : (
        <section className="gd-scroll gd-balance-form">
          <h1>
            {showArchived ? "Aucun ennemi archivé" : "Aucun ennemi actif"}
          </h1>
          <p>Utilise « Archives » pour retrouver et restaurer une espèce.</p>
        </section>
      )}
    </div>
  );
}
