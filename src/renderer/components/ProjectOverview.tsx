import React from 'react';
import type { GameProject } from '../../shared/game/types.js';
import { StudioDialog } from './StudioDialog.js';
import './projectOverview.css';

interface Props {
  project: GameProject;
  path: string;
  modified: boolean;
  libraryName?: string;
  disabled: boolean;
  onClose(): void;
  onSave(): void;
  onBackup(): void;
  onLibrary(): void;
  onCreateFilm(): void;
  onBrowseFilms(): void;
  onCreateLevel(): void;
  onLevels(): void;
  onCampaign(): void;
  onCharacters(): void;
  onHome(): void;
  onChecks(): void;
}

export function ProjectOverview(props: Props) {
  const { project, path, modified, disabled } = props;
  const films = project.cinematics?.length ?? 0;
  const steps = project.campaign?.steps.length ?? 0;
  return <StudioDialog title="Vue du projet" onClose={props.onClose} disabled={disabled} wide onKeyDown={event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'&&!event.nativeEvent.isComposing&&!disabled){event.preventDefault();props.onSave();}}}>
    <div className="project-overview">
      <section className="project-overview-file">
        <div><h3>{project.title}</h3><p title={path || undefined}>{path ? path.split(/[\\/]/).pop() : 'Projet sans fichier'}</p>
          <span className={modified || !path ? 'project-unsaved' : 'project-saved'}>{modified || !path ? 'À enregistrer' : '✓ Enregistré'}</span>
        </div>
        <button className="button primary" disabled={disabled} onClick={props.onSave} title="Enregistrer le projet · Ctrl+S">Enregistrer</button>
      </section>
      <section className="project-overview-backup" aria-label="Sauvegarde de la campagne">
        <div><strong>Conserver une sauvegarde complète</strong><p>Niveaux, cinématiques, personnages, réglages, images et sons. Un nouveau dossier daté conserve aussi les modifications en cours.</p></div>
        <button className="button subtle" disabled={disabled} onClick={props.onBackup}>Sauvegarder la campagne…</button>
      </section>
      <section className="project-overview-workspaces" aria-label="Travailler sur le projet">
        <div className="project-overview-workspace">
          <button className="project-overview-destination" aria-label="Voir toutes les cinématiques" disabled={disabled} onClick={props.onBrowseFilms}>
            <span className="project-action-icon" aria-hidden="true">▶</span><strong>Cinématiques</strong><span>{films} cinématique{films > 1 ? 's' : ''}</span><span className="project-action-arrow" aria-hidden="true">→</span>
          </button>
          <button className="project-overview-create" disabled={disabled} onClick={props.onCreateFilm}><span aria-hidden="true">＋ </span>Créer une cinématique</button>
        </div>
        <div className="project-overview-workspace">
          <button className="project-overview-destination" aria-label="Voir les niveaux" disabled={disabled} onClick={props.onLevels}>
            <span className="project-action-icon" aria-hidden="true">⚑</span><strong>Niveaux</strong><span>{project.levels.length} niveau{project.levels.length > 1 ? 'x' : ''}</span><span className="project-action-arrow" aria-hidden="true">→</span>
          </button>
          <button className="project-overview-create" disabled={disabled || project.levels.length >= 200} onClick={props.onCreateLevel}><span aria-hidden="true">＋ </span>Créer un niveau</button>
        </div>
        <div className="project-overview-workspace">
          <button className="project-overview-destination project-overview-campaign" aria-label="Organiser la campagne" disabled={disabled} onClick={props.onCampaign}>
            <span className="project-action-icon" aria-hidden="true">⇢</span><strong>Campagne</strong><span>{steps} étape{steps > 1 ? 's' : ''}</span><small>Ordre des films et niveaux</small><span className="project-action-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </section>
      {!props.libraryName&&<div className="project-overview-library" role="status"><span>Images et sons : bibliothèque non connectée</span><button className="button subtle" disabled={disabled} onClick={props.onLibrary}>Connecter</button></div>}
      <details className="project-overview-settings">
        <summary>Réglages et outils<span>Accueil · personnages · bibliothèque</span></summary>
        <div className="project-overview-settings-actions">
          <button disabled={disabled} onClick={props.onHome}>Configurer l’accueil</button>
          <button disabled={disabled} onClick={props.onCharacters}>Voir les personnages</button>
          <button disabled={disabled} onClick={props.onLibrary}>Images et sons<small>{props.libraryName ?? 'Connecter la bibliothèque'}</small></button>
          <button disabled={disabled} onClick={props.onChecks}>Vérifier le projet</button>
        </div>
      </details>
      <footer className="project-overview-footer">{props.libraryName&&<span title={props.libraryName}>✓ Bibliothèque connectée</span>}</footer>
    </div>
  </StudioDialog>;
}
