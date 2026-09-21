import React, { useMemo, useState } from 'react';
import { filterRecentProjects, formatProjectActivity, sameProjectPath, MAX_RECENT_PROJECTS, MAX_PINNED_PROJECTS,
  type RecentProject, type RecentProjectsSnapshot } from '../../shared/recentProjects.js';
import { Icon } from './Icon.js';
import { StudioDialog } from './StudioDialog.js';

interface Props {
  snapshot: RecentProjectsSnapshot; currentPath: string; busy: boolean; error: string; desktop: boolean;
  onOpen: (id: string) => void; onLocate: (id: string) => void; onPin: (id: string, pinned: boolean) => void;
  onRemove: (id: string) => void; onReveal: (id: string) => void; onClear: () => void;
  onBrowse: () => void; onRefresh: () => void; onClose: () => void;
}
export function RecentProjectsDialog(props: Props) {
  const { snapshot, currentPath, busy, error, desktop } = props;
  const [query, setQuery] = useState(''), [confirmClear, setConfirmClear] = useState(false);
  const filtered = useMemo(() => filterRecentProjects(snapshot.projects, query), [snapshot.projects, query]);
  const pinned = filtered.filter(p => p.pinned), recent = filtered.filter(p => !p.pinned);
  const hasUnpinned = snapshot.projects.some(p => !p.pinned);
  function card(project: RecentProject) {
    const current = sameProjectPath(project.path, currentPath);
    const missing = project.availability === 'missing', unavailable = project.availability === 'unavailable';
    return <li className={`recent-project-card ${current ? 'current' : ''} ${missing ? 'missing' : ''}`} key={project.id} data-project-id={project.id}>
      <button className="recent-project-open" disabled={busy || (missing && !current)} onClick={() => props.onOpen(project.id)}
        aria-label={`${current ? 'Revenir à' : 'Ouvrir'} ${project.title}`} title={project.path}>
        <span className="recent-project-symbol"><Icon name="file" size={24}/></span>
        <span className="recent-project-description"><span className="recent-project-title"><strong>{project.title || project.cinematicId}</strong>{current && <em>Document ouvert</em>}</span>
          <span className="recent-project-meta"><Icon name="clock" size={12}/>{project.lastAction === 'saved' ? 'Enregistré' : 'Ouvert'} {formatProjectActivity(project.lastUsedAt).replace(/^Aujourd’hui/, 'aujourd’hui').replace(/^Hier/, 'hier')}<span>· {project.shots} plan{project.shots > 1 ? 's' : ''}</span></span>
          <code title={project.path}>{project.path}</code>
        </span>
        <span className="recent-project-resume">{current ? 'Revenir' : 'Reprendre'}<Icon name="chevron" size={16}/></span>
      </button>
      <div className="recent-project-bottom">
        <span className={`recent-project-status ${missing || unavailable ? 'warning' : ''}`}>
          <Icon name={missing || unavailable ? 'warning' : 'folder'} size={13}/>
          {missing ? 'Fichier déplacé ou supprimé' : unavailable ? 'Emplacement temporairement inaccessible' : project.libraryRoot ? <span title={project.libraryRoot}>Bibliothèque : {project.libraryRoot.split(/[\\/]/).filter(Boolean).at(-1)}</span> : 'Bibliothèque à sélectionner si nécessaire'}
        </span>
        <div className="recent-project-tools">
          {(missing || unavailable) && <button className="link-button" disabled={busy} onClick={() => props.onLocate(project.id)}>Retrouver le fichier</button>}
          <button className={`icon-button ${project.pinned ? 'pinned' : ''}`} aria-pressed={project.pinned} disabled={busy} title={project.pinned ? 'Détacher ce projet' : 'Épingler ce projet'} aria-label={`${project.pinned ? 'Détacher' : 'Épingler'} ${project.title}`} onClick={() => props.onPin(project.id, !project.pinned)}><Icon name="pin" size={16}/></button>
          <button className="icon-button" disabled={busy || missing} title="Afficher dans le dossier" aria-label={`Afficher ${project.title} dans le dossier`} onClick={() => props.onReveal(project.id)}><Icon name="folder" size={16}/></button>
          <button className="icon-button" disabled={busy} title="Retirer de la liste sans supprimer le fichier" aria-label={`Retirer ${project.title} des récents`} onClick={() => props.onRemove(project.id)}><Icon name="close" size={15}/></button>
        </div>
      </div>
    </li>;
  }
  return <StudioDialog title="Projets récents" onClose={props.onClose} disabled={busy} wide restoreFocus={false}>
    <p className="dialog-intro">Retrouve tes cinématiques sans parcourir tes dossiers. {MAX_RECENT_PROJECTS} projets récents et jusqu’à {MAX_PINNED_PROJECTS} projets épinglés, conservés sur cet ordinateur.</p>
    {snapshot.warning && <p className="inline-warning">{snapshot.warning}</p>}
    {error && <p className="recent-project-error" role="alert">{error}</p>}
    <div className="recent-project-toolbar">
      <label className="recent-project-search"><Icon name="search" size={16}/><input autoFocus type="search" aria-label="Rechercher un projet récent" placeholder="Rechercher un titre, un nom de fichier ou un dossier…" value={query} onChange={e => setQuery(e.target.value)}/></label>
      <button className="icon-button" title="Vérifier les emplacements" aria-label="Actualiser les projets récents" disabled={busy || !desktop} onClick={props.onRefresh}><Icon name="refresh" size={17}/></button>
    </div>
    <div className="recent-project-list" aria-busy={busy}>
      {pinned.length > 0 && <section aria-label="Projets épinglés"><h3><Icon name="pin" size={13}/> ÉPINGLÉS <span>{pinned.length}</span></h3><ul>{pinned.map(card)}</ul></section>}
      {recent.length > 0 && <section aria-label="Derniers projets"><h3><Icon name="clock" size={13}/> DERNIERS PROJETS <span>{recent.length}</span></h3><ul>{recent.map(card)}</ul></section>}
      {!filtered.length && <div className="recent-project-empty"><Icon name={query ? 'search' : 'folder'} size={32}/><h3>{query ? 'Aucun projet ne correspond.' : busy ? 'Chargement des projets…' : 'Ton prochain projet t’attend ici.'}</h3><p>{query ? 'Essaie un autre titre ou un nom de dossier.' : 'Ouvre ou enregistre une cinématique une première fois dans cette version. Elle apparaîtra ensuite automatiquement dans cette liste.'}</p></div>}
    </div>
    {confirmClear && <div className="recent-project-confirm" role="group" aria-label="Confirmer l’effacement de la liste"><p>Retirer les projets non épinglés de la liste ? <strong>Aucun fichier ne sera supprimé.</strong></p><button className="button subtle" disabled={busy} onClick={() => setConfirmClear(false)}>Annuler</button><button className="button subtle" disabled={busy} onClick={() => { setConfirmClear(false); props.onClear(); }}>Effacer les non-épinglés</button></div>}
    <footer className="recent-project-footer"><button className="link-button" disabled={busy || !hasUnpinned || !desktop} onClick={() => setConfirmClear(true)}>Effacer la liste non épinglée</button><span/><button className="button subtle" disabled={busy} onClick={props.onClose}>Fermer</button><button className="button primary" disabled={busy} onClick={props.onBrowse}><Icon name="folder" size={16}/> Ouvrir un autre fichier</button></footer>
    <p className="recent-project-note">Cette liste n’est pas une sauvegarde. Les brouillons restent dans la récupération automatique et les versions locales. Aucun asset n’est dupliqué.</p>
  </StudioDialog>;
}
