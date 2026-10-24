import React, { useMemo, useState } from "react";
import { useProjectSession } from "./ProjectSessionContext.js";
import { StudioDialog } from "../components/StudioDialog.js";
import { mergeProject, type MergeChoices } from "../../shared/projectMerge.js";
import { parseGameProject } from "../../shared/game/validation.js";

const labels: Record<string, string> = {
  projet: "Projet",
  cinematics: "Cinématiques",
  levels: "Niveaux",
  title: "Titre",
  shots: "Plans",
  name: "Nom",
  balance: "Personnages",
  combat: "Combat",
  logic: "Comportements",
  presentation: "Animations et sons",
  campaign: "Campagne",
  $order: "Ordre",
};
function label(path: string, names: Map<string, string>) {
  return path
    .split(".")
    .map((part) => {
      const [key, ...rest] = part.split("[");
      return (
        (labels[key] ?? key) +
        (rest.length
          ? " · " +
            rest
              .join("[")
              .replace(/\]$/, "")
              .split("][")
              .map((id) => names.get(id) ?? id)
              .join(" · ")
          : "")
      );
    })
    .join(" › ");
}
function value(v: unknown, absent: boolean) {
  return absent
    ? "Élément supprimé"
    : typeof v === "string"
      ? v
      : JSON.stringify(v, null, 2);
}
export function ProjectConflictDialog() {
  const { conflict } = useProjectSession();
  return conflict && <Conflict key={conflict.disk.revision} />;
}
function Conflict() {
  const { session, conflict, busy, message } = useProjectSession();
  const [choices, setChoices] = useState<MergeChoices>({});
  const { disk, local } = conflict!;
  const names = useMemo(() => {
    const names = new Map<string, string>();
    function visit(value: unknown) {
      if (!value || typeof value !== "object") return;
      const item = value as Record<string, unknown>;
      if (typeof item.id === "string") {
        const name = item.title ?? item.name ?? item.label;
        if (typeof name === "string") names.set(item.id, name);
      }
      for (const child of Object.values(item))
        if (child && typeof child === "object") visit(child);
    }
    visit(disk.base);
    visit(disk.remote);
    visit(local);
    return names;
  }, [disk, local]);
  const recovery = conflict?.kind === "recovery";
  const comparison = useMemo(
    () => (disk.remote ? mergeProject(disk.base, local, disk.remote) : null),
    [disk, local],
  );
  const result = useMemo(
    () =>
      disk.remote ? mergeProject(disk.base, local, disk.remote, choices) : null,
    [disk, local, choices],
  );
  let validation = "";
  if (result && !result.conflicts.length) {
    try {
      parseGameProject(result.project);
    } catch (e) {
      validation = e instanceof Error ? e.message : String(e);
    }
  }
  return (
    <StudioDialog
      title={
        recovery
          ? "Réunir le brouillon récupéré et le projet ouvert"
          : "Le fichier a changé sur le disque"
      }
      disabled={busy}
      onClose={() => session.closeConflict()}
      wide
    >
      <p>
        Ton brouillon et le fichier ont tous les deux changé depuis l’ouverture.
        Les modifications de champs différents sont réunies automatiquement.
      </p>
      <p className="project-conflict-path">{disk.path}</p>
      {disk.error && <p role="alert">{disk.error}</p>}
      {!!comparison?.conflicts.length && (
        <p>
          Choisis la version à conserver pour chaque désaccord (
          {comparison.conflicts.length}).
        </p>
      )}
      <div className="project-conflict-list">
        {comparison?.conflicts.map((c) => (
          <fieldset key={c.path}>
            <legend>{label(c.path, names)}</legend>
            <div>
              {(["local", "remote"] as const).map((side) => (
                <label key={side}>
                  <span>
                    <input
                      type="radio"
                      name={c.path}
                      checked={choices[c.path] === side}
                      onChange={() =>
                        setChoices({ ...choices, [c.path]: side })
                      }
                    />
                    {side === "local"
                      ? "Mon brouillon"
                      : "Fichier sur le disque"}
                  </span>
                  <pre>
                    {value(
                      c[side],
                      c[side === "local" ? "localMissing" : "remoteMissing"],
                    )}
                  </pre>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      {result && !comparison?.conflicts.length && (
        <p className="project-merge-ok">
          Les modifications peuvent être réunies sans choix supplémentaire.
        </p>
      )}
      {validation && (
        <p role="alert">
          La version réunie nécessite une correction : {validation}
        </p>
      )}
      {message &&
        message !==
          "Le fichier a changé sur le disque. Compare les versions avant d’enregistrer." && (
          <p role="status">{message}</p>
        )}
      <p className="project-session-note">
        {recovery
          ? "La reprise modifie le brouillon et peut être annulée. Enregistre ensuite pour mettre à jour le fichier."
          : "Avant d’enregistrer la réunion, le Studio conserve le fichier du disque, ton brouillon, la version d’origine et le résultat dans un dossier de récupération local."}
      </p>
      <footer>
        <button
          className="button subtle"
          disabled={busy}
          onClick={() => session.closeConflict()}
        >
          Revenir au brouillon
        </button>
        <button
          className="button subtle"
          disabled={busy}
          onClick={() => void session.saveConflictCopy()}
        >
          Enregistrer une copie…
        </button>
        <button
          className="button primary"
          disabled={
            busy || !result || !!result.conflicts.length || !!validation
          }
          onClick={() => void session.resolveConflict(result!.project)}
        >
          {recovery ? "Reprendre le brouillon réuni" : "Réunir et enregistrer"}
        </button>
      </footer>
    </StudioDialog>
  );
}
