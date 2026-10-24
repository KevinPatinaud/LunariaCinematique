import React, { useState } from "react";
import type { Asset } from "../../shared/model.js";
import {
  activeEnemies,
  enemyChoices,
  newId,
  type EnemyDefinition,
  type SpawnGroup,
  type SpawnArea,
} from "../../shared/game/types.js";
import {
  atCell,
  ENEMY_FIRST_COLUMN,
  MAX_WAVE_ENEMIES,
  paintEnemy,
} from "../../shared/game/boardPlacement.js";
import { ImagePreview } from "../presentation/ImagePicker.js";
import { Num } from "./BalanceEditor.js";

function Portrait({
  enemy,
  assets,
}: {
  enemy?: EnemyDefinition;
  assets: Asset[];
}) {
  const sprite = enemy?.visual?.sprite,
    asset = assets.find((a) => a.ref === sprite?.asset);
  return (
    <span className="gd-enemy-portrait" aria-hidden="true">
      {asset ? (
        <ImagePreview asset={asset} region={sprite?.region} />
      ) : (
        <span>{enemy?.name.slice(0, 2) ?? "?"}</span>
      )}
    </span>
  );
}

export function EnemyBoardEditor({
  groups,
  enemies,
  assets,
  terrainImage,
  change,
}: {
  groups: SpawnGroup[];
  enemies: EnemyDefinition[];
  assets: Asset[];
  terrainImage?: string;
  change: (groups: SpawnGroup[]) => void;
}) {
  const [chosen, setChosen] = useState(activeEnemies(enemies)[0]?.id ?? ""),
    [tool, setTool] = useState<"add" | "erase" | "inspect" | "copy">("add"),
    [cell, setCell] = useState({ row: 2, col: 6 });
  const selected = enemies.find((e) => e.id === chosen),
    choices = enemyChoices(enemies, chosen),
    total = groups.reduce((sum, g) => sum + g.count, 0),
    here = groups.filter((g) => atCell(g, cell.row, cell.col));
  const terrain = assets.find((a) => a.ref === terrainImage);
  const click = (row: number, col: number) => {
    if (tool === "copy") {
      const copied = here.map((g) => ({
          ...g,
          id: newId("group"),
          lane: row,
          placement: { rowMin: row, rowMax: row, colMin: col, colMax: col },
        })),
        others = groups.filter((g) => !atCell(g, row, col));
      if (
        others.reduce((n, g) => n + g.count, 0) +
          copied.reduce((n, g) => n + g.count, 0) <=
        MAX_WAVE_ENEMIES
      ) {
        change([...others, ...copied]);
        setCell({ row, col });
        setTool("inspect");
      }
      return;
    }
    setCell({ row, col });
    if (tool !== "inspect" && selected)
      change(paintEnemy(groups, chosen, row, col, tool === "erase"));
  };
  return (
    <section className="gd-enemy-board" aria-label="Placement des ennemis">
      <p>
        Choisis un ennemi, puis clique sur les cases de droite. Chaque clic en
        ajoute un ; plusieurs espèces peuvent partager la même case.
      </p>
      <div
        className="gd-enemy-palette"
        role="group"
        aria-label="Ennemi à placer"
      >
        {choices.map((enemy) => (
          <button
            type="button"
            key={enemy.id}
            aria-pressed={chosen === enemy.id}
            className={chosen === enemy.id ? "selected" : ""}
            onClick={() => {
              setChosen(enemy.id);
              setTool("add");
            }}
          >
            <Portrait enemy={enemy} assets={assets} />
            <span>
              {enemy.name}
              {enemy.archived ? " (archivé)" : ""}
            </span>
          </button>
        ))}
      </div>
      <div
        className="gd-inline gd-paint-tools"
        role="group"
        aria-label="Outil de placement"
      >
        <button
          type="button"
          aria-pressed={tool === "add"}
          onClick={() => setTool("add")}
        >
          Ajouter
        </button>
        <button
          type="button"
          aria-pressed={tool === "erase"}
          onClick={() => setTool("erase")}
        >
          Gomme −1
        </button>
        <button
          type="button"
          aria-pressed={tool === "inspect"}
          onClick={() => setTool("inspect")}
        >
          Sélectionner une case
        </button>
        <span role="status">
          {tool === "copy"
            ? "Clique sur la case où copier la sélection."
            : tool === "erase"
              ? `Retirer une unité : ${selected?.name ?? ""}`
              : tool === "add"
                ? `Ajouter : ${selected?.name ?? ""}`
                : "Clique sur une case pour ajuster son contenu."}
        </span>
      </div>
      {total >= MAX_WAVE_ENEMIES && (
        <p className="gd-callout">
          La vague contient 256 ennemis, le maximum autorisé. Retire des unités
          avant d’en ajouter.
        </p>
      )}
      <div className="gd-board-scroll">
        <div
          className="gd-paint-board"
          role="group"
          aria-label="Plateau de la vague"
          style={
            terrain
              ? {
                  backgroundImage: `linear-gradient(#12201755,#12201755),url("${terrain.url}")`,
                }
              : undefined
          }
        >
          <div className="gd-territory ally">Alliés · colonnes 1 à 4</div>
          <div className="gd-territory enemy">Ennemis · colonnes 5 à 8</div>
          {Array.from({ length: 5 }, (_, row) =>
            Array.from({ length: 8 }, (_, col) => {
              const contents = groups.filter((g) => atCell(g, row, col)),
                count = contents.reduce((n, g) => n + g.count, 0),
                isSelected = cell.row === row && cell.col === col;
              return (
                <button
                  type="button"
                  key={`${row}:${col}`}
                  disabled={col < ENEMY_FIRST_COLUMN}
                  className={`gd-paint-cell ${isSelected ? "selected" : ""}`}
                  aria-label={`Allée ${row + 1}, colonne ${col + 1}`}
                  aria-pressed={isSelected}
                  title={
                    contents
                      .map(
                        (g) =>
                          `${enemies.find((e) => e.id === g.enemyId)?.name} × ${g.count}`,
                      )
                      .join("\n") || "Case vide"
                  }
                  onClick={() => click(row, col)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (col >= ENEMY_FIRST_COLUMN) {
                      setCell({ row, col });
                      change(paintEnemy(groups, chosen, row, col, true));
                    }
                  }}
                >
                  <small className="gd-cell-coordinate">
                    {row + 1}·{col + 1}
                  </small>
                  {contents.slice(0, 2).map((g) => (
                    <span className="gd-cell-group" key={g.id}>
                      <Portrait
                        enemy={enemies.find((e) => e.id === g.enemyId)}
                        assets={assets}
                      />
                      <b>×{g.count}</b>
                    </span>
                  ))}
                  {contents.length > 2 && (
                    <small>+{contents.length - 2} espèces</small>
                  )}
                  {count > 0 && <span className="gd-cell-total">{count}</span>}
                </button>
              );
            }),
          )}
        </div>
      </div>
      <div className="gd-cell-detail" aria-label="Contenu de la case">
        <div className="gd-section-heading">
          <h3>
            Allée {cell.row + 1} · colonne {cell.col + 1}
          </h3>
          <div className="gd-inline">
            <button
              type="button"
              disabled={!here.length}
              onClick={() => setTool(tool === "copy" ? "inspect" : "copy")}
            >
              {tool === "copy" ? "Annuler la copie" : "Copier vers une case…"}
            </button>
            <button
              type="button"
              disabled={!here.length}
              onClick={() =>
                change(groups.filter((g) => !atCell(g, cell.row, cell.col)))
              }
            >
              Vider la case
            </button>
          </div>
        </div>
        {!here.length && (
          <p>Case vide. Choisis un ennemi et utilise Ajouter.</p>
        )}
        {here.map((g) => (
          <div key={g.id} className="gd-cell-detail-row">
            <Portrait
              enemy={enemies.find((e) => e.id === g.enemyId)}
              assets={assets}
            />
            <span>{enemies.find((e) => e.id === g.enemyId)?.name}</span>
            <Num
              label={`Quantité de ${enemies.find((e) => e.id === g.enemyId)?.name}`}
              value={g.count}
              min={1}
              max={MAX_WAVE_ENEMIES - total + g.count}
              integer
              change={(count) =>
                change(
                  groups.map((item) =>
                    item.id === g.id ? { ...item, count } : item,
                  ),
                )
              }
            />
            <button
              type="button"
              aria-label={`Retirer ${enemies.find((e) => e.id === g.enemyId)?.name} de la case`}
              onClick={() => change(groups.filter((item) => item.id !== g.id))}
            >
              Retirer
            </button>
          </div>
        ))}
      </div>
      <p className="gd-note">
        Tous les ennemis placés commencent ensemble. Les générateurs continuent
        de produire leurs renforts selon leur fiche. La vague se termine quand
        tous les ennemis sont KO, renforts compris.
      </p>
    </section>
  );
}

/** Click a cell, or two opposite corners for an random placement area. */
export function SpawnPlacementGrid({
  value,
  change,
  label,
  enemyName = "l’ennemi",
}: {
  value: SpawnArea;
  change: (area: SpawnArea) => void;
  label: string;
  enemyName?: string;
}) {
  const [zone, setZone] = useState(
      value.rowMin !== value.rowMax || value.colMin !== value.colMax,
    ),
    [corner, setCorner] = useState<{ row: number; col: number } | null>(null);
  const click = (row: number, col: number) => {
    if (!zone) {
      change({ rowMin: row, rowMax: row, colMin: col, colMax: col });
      return;
    }
    if (!corner) {
      setCorner({ row, col });
      return;
    }
    change({
      rowMin: Math.min(corner.row, row),
      rowMax: Math.max(corner.row, row),
      colMin: Math.min(corner.col, col),
      colMax: Math.max(corner.col, col),
    });
    setCorner(null);
  };
  return (
    <div className="gd-plaque-grid-editor">
      <label>
        Apparition{" "}
        <select
          aria-label={label}
          value={zone ? "zone" : "cell"}
          onChange={(e) => {
            setZone(e.target.value === "zone");
            setCorner(null);
            if (e.target.value === "cell")
              change({ ...value, rowMax: value.rowMin, colMax: value.colMin });
          }}
        >
          <option value="cell">Case précise</option>
          <option value="zone">Case aléatoire dans une zone</option>
        </select>
      </label>
      <p>
        {zone
          ? corner
            ? "Clique sur le coin opposé pour terminer la zone."
            : "Clique sur les deux coins opposés de la zone."
          : `Clique directement sur la case de ${enemyName}.`}
      </p>
      {zone && value.rowMin !== value.rowMax && (
        <p>
          Les apparitions privilégient les allées qui comptent le moins
          d’ennemis de cette espèce, avec un tirage aléatoire en cas d’égalité.
        </p>
      )}
      <div
        className="gd-protected-grid"
        role="group"
        aria-label={`Position de ${enemyName}`}
      >
        {Array.from({ length: 5 }, (_, row) =>
          Array.from({ length: 8 }, (_, col) => {
            const selected =
              row >= value.rowMin &&
              row <= value.rowMax &&
              col >= value.colMin &&
              col <= value.colMax;
            return (
              <button
                type="button"
                key={`${row}:${col}`}
                aria-label={`Allée ${row + 1}, colonne ${col + 1}`}
                aria-pressed={selected}
                className={
                  corner?.row === row && corner.col === col
                    ? "gd-corner"
                    : selected
                      ? "selected"
                      : ""
                }
                onClick={() => click(row, col)}
              >
                {selected ? "●" : ""}
              </button>
            );
          }),
        )}
      </div>
      <small>
        Allées {value.rowMin + 1}–{value.rowMax + 1} · colonnes{" "}
        {value.colMin + 1}–{value.colMax + 1}
      </small>
    </div>
  );
}
