import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Cinematic } from '../../shared/model.js';
import { StudioDialog } from './StudioDialog.js';
import './cinematicsBrowser.css';

interface Props {
  films: Cinematic[]; activeId: string; disabled: boolean; references: Record<string, string[]>;
  onClose(): void; onSelect(id: string): void; onCreate(): void; onDuplicate(id: string): void;
  onRename(id: string, title: string): void; onCategory(id: string, category: string): void;
  onMove(id: string, targetId: string): void; onDelete(id: string): void; onBackupProject(): void;
}
const searchText = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();

export function CinematicsBrowser({ films, activeId, disabled, references, onClose, onSelect, onCreate, onDuplicate, onRename, onCategory, onMove, onDelete, onBackupProject }: Props) {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('*');
  const [editingId, setEditingId] = useState('');
  const [titleDraft, setTitleDraft] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [categoryDraft, setCategoryDraft] = useState('');
  const [formError, setFormError] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => { searchRef.current?.focus(); }, []);
  const categories = useMemo(() => [...new Set(films.map(film => film.category?.trim()).filter((value): value is string => !!value))].sort((a, b) => a.localeCompare(b, 'fr')), [films]);
  const visible = useMemo(() => {
    const term = searchText(query.trim());
    return films.filter(film => (categoryFilter === '*' || (film.category ?? '') === categoryFilter)
      && (!term || searchText(`${film.title} ${film.id} ${film.category ?? ''}`).includes(term)));
  }, [films, query, categoryFilter]);
  function saveTitle(id: string) {
    const title = titleDraft.trim();
    if (!title) { setFormError('Saisis un titre.'); return; }
    onRename(id, title); setEditingId(''); setFormError('');
  }
  function saveCategory(id: string) {
    const category = categoryDraft.trim();
    if (!category) { setFormError('Saisis un nom de catégorie.'); return; }
    onCategory(id, category); setNewCategoryId(''); setCategoryDraft(''); setFormError('');
  }
  return <StudioDialog title="Toutes les cinématiques" onClose={onClose} disabled={disabled} wide>
    <div className="cinematics-browser">
      <div className="cinematics-browser-intro"><p>{films.length} cinématique{films.length > 1 ? 's' : ''} dans ce projet. L’ordre ici sert à les retrouver ; l’ordre de lecture se règle dans Campagne.</p><button className="button primary" disabled={disabled || films.length >= 500} onClick={onCreate}>+ Nouvelle cinématique</button></div>
      <div className="cinematics-browser-filters"><label className="cinematics-browser-search">Rechercher une cinématique<input ref={searchRef} value={query} onChange={event => setQuery(event.target.value)} placeholder="Titre, identifiant ou catégorie" /></label><label>Catégorie<select aria-label="Filtrer par catégorie" value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)}><option value="*">Toutes les catégories</option><option value="">Sans catégorie</option>{categories.map(category => <option key={category} value={category}>{category}</option>)}</select></label></div>
      {formError && <p className="cinematics-browser-error" role="alert">{formError}</p>}
      <div className="cinematics-browser-list" aria-label="Cinématiques du projet">
        {visible.map((film, index) => {
          const active = film.id === activeId, links = references[film.id] ?? [];
          const duration = film.shots.reduce((total, shot) => total + shot.duration, 0);
          return <div key={film.id} className="cinematics-browser-row">
            <button className={`cinematics-browser-film${active ? ' active' : ''}`} disabled={disabled} aria-current={active ? 'true' : undefined} onClick={() => onSelect(film.id)}><span className="cinematics-browser-number">{String(films.indexOf(film) + 1).padStart(2, '0')}</span><span className="cinematics-browser-description"><strong>{film.title}</strong><small>{film.category || 'Sans catégorie'} · {film.id}</small></span><span className="cinematics-browser-details">{film.shots.length} plan{film.shots.length > 1 ? 's' : ''} · {duration.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} s</span><span className="cinematics-browser-open">{active ? 'Ouvert' : 'Ouvrir →'}</span></button>
            <div className="cinematics-browser-tools">
              <button className="button subtle" disabled={disabled || !!query.trim() || index === 0} aria-label={`Monter ${film.title}`} title={query.trim() ? 'Efface la recherche pour changer l’ordre' : 'Monter'} onClick={() => onMove(film.id, visible[index - 1].id)}>↑</button>
              <button className="button subtle" disabled={disabled || !!query.trim() || index === visible.length - 1} aria-label={`Descendre ${film.title}`} title={query.trim() ? 'Efface la recherche pour changer l’ordre' : 'Descendre'} onClick={() => onMove(film.id, visible[index + 1].id)}>↓</button>
              <button className="button subtle" disabled={disabled} aria-label={`Renommer ${film.title}`} onClick={() => { setEditingId(film.id); setTitleDraft(film.title); setFormError(''); }}>Renommer</button>
              <button className="button subtle" disabled={disabled || films.length >= 500} aria-label={`Dupliquer la cinématique ${film.title}`} onClick={() => onDuplicate(film.id)}>Dupliquer</button>
              <button className="button subtle danger" disabled={disabled} aria-label={`Supprimer ${film.title}`} title={links.length ? `Liée à : ${links.join(', ')}` : 'Supprimer cette cinématique'} onClick={() => onDelete(film.id)}>Supprimer</button>
            </div>
            <div className="cinematics-browser-row-bottom"><label>Classer dans<select aria-label={`Catégorie de ${film.title}`} disabled={disabled} value={newCategoryId === film.id ? '__new__' : film.category ?? ''} onChange={event => { const category = event.target.value; if (category === '__new__') { setNewCategoryId(film.id); setCategoryDraft(''); setFormError(''); } else { setNewCategoryId(''); onCategory(film.id, category); } }}><option value="">Sans catégorie</option>{categories.map(category => <option key={category} value={category}>{category}</option>)}<option value="__new__">+ Nouvelle catégorie…</option></select></label>{links.length > 0 && <small className="cinematics-browser-linked">Liée à {links.join(', ')}</small>}
              {editingId === film.id && <div className="cinematics-browser-edit"><input autoFocus aria-label={`Nouveau titre de ${film.title}`} maxLength={200} value={titleDraft} onChange={event => setTitleDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') saveTitle(film.id); }} /><button className="button primary" onClick={() => saveTitle(film.id)}>Enregistrer le titre</button><button className="button subtle" onClick={() => { setEditingId(''); setFormError(''); }}>Annuler</button></div>}
              {newCategoryId === film.id && <div className="cinematics-browser-edit"><input autoFocus aria-label={`Nouvelle catégorie de ${film.title}`} maxLength={100} value={categoryDraft} onChange={event => setCategoryDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') saveCategory(film.id); }} /><button className="button primary" onClick={() => saveCategory(film.id)}>Créer et classer</button><button className="button subtle" onClick={() => { setNewCategoryId(''); setFormError(''); }}>Annuler</button></div>}
            </div>
          </div>;
        })}
        {!visible.length && <div className="cinematics-browser-empty">{films.length ? 'Aucune cinématique ne correspond à cette recherche.' : 'Ce projet ne contient encore aucune cinématique.'}</div>}
      </div>
      <div className="cinematics-browser-backup"><p>Pour garder une sauvegarde dans un autre fichier, copie le projet complet (niveaux et cinématiques).</p><button className="button subtle" disabled={disabled} onClick={onBackupProject}>Créer une copie du projet…</button></div>
    </div>
  </StudioDialog>;
}
