import React, { useEffect, useRef, useState } from "react";
import { useProjectSession } from "./ProjectSessionContext.js";
import { StudioDialog } from "../components/StudioDialog.js";
import { Icon } from "../components/Icon.js";
import "./projectSession.css";
const sections: Record<string, string> = {
  campaign: "Campagne",
  levels: "Niveaux",
  plants: "Plantes alliées",
  enemies: "Ennemis",
  abilities: "Capacités",
  behaviors: "Comportements",
  variables: "Variables",
  rewards: "Récompenses",
  animations: "Animations",
  profiles: "Profils d’animation",
  audio: "Sons",
  vfx: "Effets visuels",
};

function flush() {
  if (document.activeElement instanceof HTMLElement)
    document.activeElement.blur();
}
export function ProjectControls({
  disabled = false,
  onBackup,
}: {
  disabled?: boolean;
  onBackup: () => void;
}) {
  const {
    session,
    project,
    history,
    dirty,
    path,
    busy,
    ready,
    recoveryStatus,
  } = useProjectSession();
  const [historyOpen, setHistoryOpen] = useState(false),
    [filesOpen, setFilesOpen] = useState(false),
    [menuOpen, setMenuOpen] = useState(false);
  const locked = disabled || busy || !ready;
  const undo = history.undoCommands.at(-1),
    redo = history.redoCommands[0];
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        e.defaultPrevented ||
        e.isComposing ||
        !(e.ctrlKey || e.metaKey) ||
        document.querySelector("dialog[open]")
      )
        return;
      const key = e.key.toLowerCase();
      if (!["s", "o", "z", "y"].includes(key)) return;
      if (
        (key === "z" || key === "y") &&
        (e.target as Element)?.closest(
          'input,textarea,select,[contenteditable="true"]',
        )
      )
        return;
      e.preventDefault();
      if (locked) return;
      if (key === "o" && e.shiftKey) {
        setFilesOpen(true);
        void session.refreshRecent().catch((e) => session.report(e));
        return;
      }
      flush();
      if (key === "s") void session.save(e.shiftKey);
      else if (key === "o") void session.open();
      else
        session.action({ type: key === "y" || e.shiftKey ? "redo" : "undo" });
    };
    window.addEventListener("keydown", key, true);
    return () => window.removeEventListener("keydown", key, true);
  }, [session, locked]);
  return (
    <>
      <div
        className="project-history-actions"
        role="group"
        aria-label="Annulation du projet"
      >
        <button
          aria-label="Annuler"
          title={
            undo
              ? `Annuler : ${undo.label} (Ctrl+Z)`
              : "Aucune action à annuler"
          }
          disabled={locked || !undo}
          onClick={() => {
            flush();
            session.action({ type: "undo" });
          }}
        >
          ↶
        </button>
        <button
          aria-label="Rétablir"
          title={
            redo
              ? `Rétablir : ${redo.label} (Ctrl+Maj+Z / Ctrl+Y)`
              : "Aucune action à rétablir"
          }
          disabled={locked || !redo}
          onClick={() => {
            flush();
            session.action({ type: "redo" });
          }}
        >
          ↷
        </button>
        <button
          aria-label="Historique"
          title="Historique des actions du projet"
          disabled={locked}
          onClick={() => {
            flush();
            session.boundary();
            setHistoryOpen(true);
          }}
        >
          <Icon name="clock" size={14} />
          <span className="project-history-label">Historique</span>
        </button>
      </div>
      <span
        className="studio-project-state"
        role="status"
        title={path || project.title}
      >
        <span className={dirty ? "pending" : ""}>
          <i className={`studio-state-dot${dirty ? " pending" : busy ? " busy" : ""}`} aria-hidden="true" />
          {busy
            ? "Opération en cours…"
            : dirty
              ? "Modifications non enregistrées"
              : path
                ? "Projet enregistré"
                : "Projet non enregistré"}
        </span>
        <small>
          <span>{path.split(/[\\/]/).pop() || "Projet sans fichier"}</span>
          {dirty && (
            <span className="project-draft-status">{recoveryStatus}</span>
          )}
        </small>
      </span>
      <button
        className="studio-save"
        disabled={locked}
        aria-label="Enregistrer le projet"
        title="Enregistrer tout le projet (Ctrl+S)"
        onClick={() => {
          flush();
          void session.save();
        }}
      >
        <Icon name="save" size={14} /> <span>Enregistrer</span>
      </button>
      <div className="project-file-actions">
        <button
          aria-label="Actions du fichier projet"
          aria-expanded={menuOpen}
          disabled={locked}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          Fichier
        </button>
        {menuOpen && (
          <>
            <button
              className="project-menu-dismiss"
              aria-label="Fermer les actions du fichier"
              onClick={() => setMenuOpen(false)}
            />
            <div
              className="project-file-menu"
              onClick={() => setMenuOpen(false)}
            >
              <button onClick={() => void session.fresh()}>
                Nouveau projet
              </button>
              <button onClick={() => void session.open()}>
                Ouvrir un projet…
              </button>
              <button
                onClick={() => {
                  setFilesOpen(true);
                  void session.refreshRecent().catch((e) => session.report(e));
                }}
              >
                Projets récents…
              </button>
              <button onClick={() => void session.save(true)}>
                Enregistrer sous…
              </button>
              <button onClick={onBackup}>
                Sauvegarde complète avec images et sons…
              </button>
            </div>
          </>
        )}
      </div>
      {filesOpen && <ProjectFilesDialog onClose={() => setFilesOpen(false)} />}
      {historyOpen && (
        <StudioDialog
          title="Historique du projet"
          onClose={() => setHistoryOpen(false)}
        >
          <p>
            Les cinématiques et les niveaux partagent cet historique. Annuler
            ramène à l’écran concerné. Jusqu’à 80 actions sont conservées
            pendant cette session.
          </p>
          <div className="project-history-list">
            {!undo && !redo && <p>Aucune modification dans cette session.</p>}
            {[...history.undoCommands].reverse().map((command, i) => {
              const loc = session.locationOf(command);
              return (
                <div key={i} className={i === 0 ? "current" : ""}>
                  <span>
                    <strong>{command.label}</strong>
                    <small>
                      {loc?.mode === "cinematics"
                        ? "Cinématique · " +
                          ((command.after.cinematics ?? []).find(
                            (f) => f.id === loc.filmId,
                          )?.title ??
                            (command.before.cinematics ?? []).find(
                              (f) => f.id === loc.filmId,
                            )?.title ??
                            "Cinématique")
                        : "Jeu · " + (sections[loc?.section ?? ""] ?? "Projet")}
                    </small>
                  </span>
                  {i === 0 && <b>Dernière action</b>}
                </div>
              );
            })}
            {!!redo && (
              <p>
                {history.redoCommands.length} action(s) disponible(s) à
                rétablir.
              </p>
            )}
          </div>
          <footer>
            <button
              className="button subtle"
              disabled={!undo || busy}
              onClick={() => {
                setHistoryOpen(false);
                session.action({ type: "undo" });
              }}
            >
              Annuler la dernière action
            </button>
            <button
              className="button subtle"
              disabled={!redo || busy}
              onClick={() => {
                setHistoryOpen(false);
                session.action({ type: "redo" });
              }}
            >
              Rétablir l’action suivante
            </button>
          </footer>
          <p className="project-session-note">
            L’historique se vide à l’ouverture d’un autre projet. Enregistrer
            conserve l’historique ; une sauvegarde complète crée une copie
            indépendante avec les ressources.
          </p>
        </StudioDialog>
      )}
    </>
  );
}
export function ProjectRecovery() {
  const { session, recovery, busy } = useProjectSession();
  return (
    recovery && (
      <div className="gd-recovery project-recovery" role="status">
        <span>
          Un brouillon local non enregistré est disponible :{" "}
          <b>{recovery.title}</b>
        </span>
        <button disabled={busy} onClick={() => void session.resumeRecovery()}>
          Reprendre
        </button>
        <button disabled={busy} onClick={() => void session.discardRecovery()}>
          Ignorer
        </button>
      </div>
    )
  );
}
export function ProjectFilesDialog({ onClose }: { onClose: () => void }) {
  const { session, recent, path, busy } = useProjectSession();
  const searchField = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    searchField.current?.focus();
  }, []);

  async function open(file?: string) {
    setError("");
    const opened = await session.open(file);
    if (opened) onClose();
    else if (opened === undefined) setError(session.getSnapshot().message);
  }
  return (
    <StudioDialog
      title="Projets récents"
      disabled={busy}
      onClose={onClose}
      wide
    >
      <p>
        Chaque fichier contient les cinématiques, les niveaux et les réglages du
        jeu.
      </p>
      <input
        className="project-file-search"
        type="search"
        ref={searchField}
        aria-label="Rechercher un projet récent"
        placeholder="Titre ou emplacement…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="project-files-list">
        {recent
          .filter((p) =>
            (p.title + " " + p.path)
              .toLocaleLowerCase()
              .includes(query.toLocaleLowerCase()),
          )
          .map((p) => (
            <button
              disabled={busy}
              key={p.path}
              title={p.path}
              onClick={async () => {
                if (path === p.path) onClose();
                else await open(p.path);
              }}
            >
              <strong>
                {p.title}
                {p.path === path ? " · Projet ouvert" : ""}
              </strong>
              <small>{p.path}</small>
            </button>
          ))}
        {!recent.length && (
          <p>Les projets ouverts ou enregistrés apparaîtront ici.</p>
        )}
      </div>
      {error && <p role="alert">{error}</p>}
      <footer>
        <button className="button subtle" disabled={busy} onClick={onClose}>
          Fermer
        </button>
        <button
          className="button primary"
          disabled={busy}
          onClick={async () => {
            await open();
          }}
        >
          Ouvrir un autre fichier
        </button>
      </footer>
    </StudioDialog>
  );
}
