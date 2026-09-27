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
  onOpen(): void;
  onSave(): void;
  onLibrary(): void;
  onCreateFilm(): void;
  onBrowseFilms(): void;
  onCreateLevel(): void;
  onCampaign(): void;
  onCharacters(): void;
  onChecks(): void;
}

export function ProjectOverview(props: Props) {
  const { project, path, modified, disabled } = props;
  const films = project.cinematics?.length ?? 0;
  const steps = project.campaign?.steps.length ?? 0;
  return <StudioDialog title="Vue du projet" onClose={props.onClose} disabled={disabled} wide onKeyDown={event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'&&!event.nativeEvent.isComposing&&!disabled){event.preventDefault();props.onSave();}}}>
    <div className="project-overview">
      <section className="project-overview-file">
        <div><h3>{project.title}</h3><p>{path ? path.split(/[\\/]/).pop() : 'Choisis un emplacement au premier enregistrement.'}</p>
          <span className={modified || !path ? 'project-unsaved' : 'project-saved'}>{modified ? 'Modifications non enregistrées' : path ? 'Toutes les modifications sont enregistrées' : 'Projet non enregistré'}</span>
        </div>
        <div className="project-overview-file-actions"><button className="button primary" disabled={disabled} onClick={props.onSave}>Enregistrer</button><button className="button subtle" disabled={disabled} onClick={props.onOpen}>Ouvrir un projet…</button></div>
      </section>
      <p className="project-overview-intro">Un seul projet pour raconter l’histoire, construire les niveaux et préparer le parcours du joueur.</p>
      <div className="project-overview-actions">
        <button disabled={disabled} onClick={props.onCreateFilm}><span className="project-action-icon" aria-hidden="true">▶</span><strong>Créer une cinématique</strong><span>Assembler des plans, personnages et dialogues.</span><small>{films} cinématique{films > 1 ? 's' : ''} dans le projet</small></button>
        <button disabled={disabled || project.levels.length >= 200} onClick={props.onCreateLevel}><span className="project-action-icon" aria-hidden="true">⚑</span><strong>Créer un niveau</strong><span>Choisir les plantes, les ennemis et les vagues.</span><small>{project.levels.length} niveau{project.levels.length > 1 ? 'x' : ''} dans le projet</small></button>
        <button disabled={disabled} onClick={props.onCampaign}><span className="project-action-icon" aria-hidden="true">⇢</span><strong>Organiser la campagne</strong><span>Choisir dans quel ordre les films et niveaux se jouent.</span><small>{steps} étape{steps > 1 ? 's' : ''} dans le parcours</small></button>
      </div>
      <section className="project-overview-films" aria-label="Cinématiques du projet">
        <div><h3>Les cinématiques du projet</h3><p>{films ? (project.cinematics ?? []).slice(0, 3).map(film => film.title).join(' · ') : 'Crée ta première cinématique pour commencer l’histoire.'}</p></div>
        <button className="button subtle" disabled={disabled} onClick={props.onBrowseFilms}>Voir toutes les cinématiques</button>
      </section>
      <section className="project-overview-prepare" aria-label="Préparer le projet">
        <h3>Pour travailler sereinement</h3>
        <div><span aria-hidden="true">{props.libraryName ? '✓' : '1'}</span><p><strong>Relier les images et les sons</strong><small>{props.libraryName ? `Bibliothèque connectée : ${props.libraryName}` : 'Connecte ta bibliothèque pour retrouver les décors, personnages et sons.'}</small></p><button className="button subtle" disabled={disabled} onClick={props.onLibrary}>{props.libraryName ? 'Changer' : 'Connecter'}</button></div>
        <div><span aria-hidden="true">2</span><p><strong>Régler les personnages</strong><small>Caractéristiques, attaques et animations sont partagées entre les niveaux.</small></p><button className="button subtle" disabled={disabled} onClick={props.onCharacters}>Voir les personnages</button></div>
        <div><span aria-hidden="true">3</span><p><strong>Vérifier avant de publier</strong><small>Repère les erreurs et les avertissements avant la publication.</small></p><button className="button subtle" disabled={disabled} onClick={props.onChecks}>Vérifier le projet</button></div>
      </section>
      <p className="project-overview-save-note"><strong>Enregistrer</strong> conserve ton travail dans le fichier du projet. <strong>Publier et exporter</strong>, dans Niveaux, prépare le jeu pour y jouer. La copie de récupération locale ne remplace pas l’enregistrement.</p>
      <div className="project-overview-shortcuts"><span><kbd>Ctrl + S</kbd> Enregistrer</span><span><kbd>Ctrl + Z</kbd> Annuler</span><span><kbd>Échap</kbd> Fermer cette vue</span></div>
    </div>
  </StudioDialog>;
}
