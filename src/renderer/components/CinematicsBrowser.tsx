import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Cinematic } from '../../shared/model.js';
import type { CinematicPlacement } from '../../shared/game/cinematicManagement.js';
import { ArchiveStamp, ContentArchiveFilter, matchesArchiveFilter, type ArchiveFilter } from './ContentArchive.js';
import { Icon } from './Icon.js';
import { StudioDialog } from './StudioDialog.js';
import './cinematicsBrowser.css';

interface Props {
  films: Cinematic[]; activeId: string; disabled: boolean; references: Record<string, string[]>;
  archivedIds?: string[];
  onBackupCampaign(): void;
  onClose(): void; onSelect(id: string): void; onCreate(): void; onDuplicate(id: string): void;
  onRename(id: string, title: string): void; onCategory(id: string, category: string): void;
  onMove(id: string, targetId: string, placement: CinematicPlacement): void; onDelete(id: string): void; onBackupProject(): void;
  onArchive(id: string, archived: boolean): void;
}
const searchText = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
const filmDragType = 'application/x-lunaria-cinematic';
type DropTarget = { id: string; placement: CinematicPlacement };

export function CinematicsBrowser({ films, activeId, disabled, references, archivedIds, onClose, onSelect, onCreate, onDuplicate, onRename, onCategory, onMove, onDelete, onArchive, onBackupProject, onBackupCampaign }: Props) {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('*');
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>('all');
  const [editingId, setEditingId] = useState('');
  const [titleDraft, setTitleDraft] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [categoryDraft, setCategoryDraft] = useState('');
  const [formError, setFormError] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const archiveFilterRef = useRef<HTMLSelectElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const editorTrigger = useRef<HTMLElement | null>(null);
  const dragId = useRef('');
  const [draggedId, setDraggedId] = useState('');
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const scrollFrame = useRef<number | undefined>(undefined);
  const pointerY = useRef(0);
  const isSearching = !!query.trim();
  const categories = useMemo(() => [...new Set(films.map(film => film.category?.trim()).filter((value): value is string => !!value))].sort((a, b) => a.localeCompare(b, 'fr')), [films]);
  const archivedFilms = useMemo(() => new Set(archivedIds), [archivedIds]);
  const visible = useMemo(() => {
    const term = searchText(query.trim());
    return films.filter(film => (categoryFilter === '*' || (film.category ?? '') === categoryFilter)
      && matchesArchiveFilter(archiveFilter, archivedFilms.has(film.id))
      && (!term || searchText(`${film.title} ${film.id} ${film.category ?? ''}`).includes(term)));
  }, [films, query, categoryFilter, archiveFilter, archivedFilms]);
  const canReorder = !disabled && !isSearching && visible.length > 1;
  useEffect(() => { searchRef.current?.focus(); }, []);
  useEffect(() => () => stopScroll(), []);
  useEffect(() => { if (!canReorder) clearDrag(); }, [canReorder]);
  function stopScroll() {
    if (scrollFrame.current !== undefined) cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = undefined;
  }
  function clearDrag() {
    stopScroll(); dragId.current = ''; setDraggedId(''); setDropTarget(null);
  }
  function targetAt(y: number): DropTarget | null {
    const rows = Array.from(listRef.current?.querySelectorAll<HTMLElement>('.cinematics-browser-row') ?? []);
    const row = rows.find(row => y <= row.getBoundingClientRect().bottom) ?? rows.at(-1);
    if (!row || row.dataset.filmId === dragId.current) return null;
    const rect = row.getBoundingClientRect();
    return { id: row.dataset.filmId!, placement: y < rect.top + rect.height / 2 ? 'before' : 'after' };
  }
  function showTarget(target: DropTarget | null) {
    setDropTarget(previous => previous?.id === target?.id && previous?.placement === target?.placement ? previous : target);
  }
  function autoScroll() {
    const list = listRef.current;
    if (!list || !dragId.current) { stopScroll(); return; }
    const rect = list.getBoundingClientRect(), y = pointerY.current;
    const edge = 48;
    const speed = y < rect.top + edge ? -Math.min(12, (rect.top + edge - y) / 4)
      : y > rect.bottom - edge ? Math.min(12, (y - rect.bottom + edge) / 4) : 0;
    if (!speed) { stopScroll(); return; }
    list.scrollTop += speed;
    showTarget(targetAt(y));
    scrollFrame.current = requestAnimationFrame(autoScroll);
  }
  function startDrag(event: React.DragEvent, id: string) {
    if (!canReorder) { event.preventDefault(); return; }
    dragId.current = id; setDraggedId(id);
    event.dataTransfer.setData(filmDragType, id);
    event.dataTransfer.effectAllowed = 'move';
  }
  function dragOver(event: React.DragEvent) {
    if (!canReorder || !dragId.current || !event.dataTransfer.types.includes(filmDragType)) return;
    event.preventDefault(); event.stopPropagation(); event.dataTransfer.dropEffect = 'move';
    pointerY.current = event.clientY;
    showTarget(targetAt(event.clientY));
    if (scrollFrame.current === undefined) autoScroll();
  }
  function drop(event: React.DragEvent) {
    if (!canReorder || !dragId.current || event.dataTransfer.getData(filmDragType) !== dragId.current) return;
    event.preventDefault(); event.stopPropagation();
    const source = dragId.current, target = targetAt(event.clientY);
    clearDrag();
    if (target) onMove(source, target.id, target.placement);
  }
  function closeEditor() {
    setEditingId('');
    setNewCategoryId('');
    setFormError('');
    editorTrigger.current?.focus();
  }
  function saveTitle(id: string) {
    const title = titleDraft.trim();
    if (!title) { setFormError('Saisis un titre.'); return; }
    onRename(id, title);
    closeEditor();
  }
  function saveCategory(id: string) {
    const category = categoryDraft.trim();
    if (!category) { setFormError('Saisis un nom de catégorie.'); return; }
    onCategory(id, category);
    closeEditor();
  }
  const count = visible.length === films.length
    ? `${films.length} cinématique${films.length === 1 ? '' : 's'} dans ce projet`
    : `${visible.length} sur ${films.length} cinématiques`;

  return (
    <StudioDialog title="Toutes les cinématiques" onClose={onClose} disabled={disabled} wide>
      <div className="cinematics-browser">
        <div className="cinematics-browser-filters">
          <div className="cinematics-browser-search">
            <Icon name="search" size={17} />
            <input
              ref={searchRef}
              type="search"
              aria-label="Rechercher une cinématique"
              placeholder="Titre, identifiant ou catégorie"
              value={query}
              onChange={event => {
                setQuery(event.target.value);
                if (listRef.current) listRef.current.scrollTop = 0;
              }}
            />
          </div>
          <select aria-label="Filtrer par catégorie" value={categoryFilter} onChange={event => {
            setCategoryFilter(event.target.value);
            if (listRef.current) listRef.current.scrollTop = 0;
          }}>
            <option value="*">Toutes les catégories</option>
            <option value="">Sans catégorie</option>
            {categories.map(category => <option key={category} value={category}>{category}</option>)}
          </select>
          <ContentArchiveFilter
            controlRef={archiveFilterRef}
            value={archiveFilter}
            onChange={filter => {
              setArchiveFilter(filter);
              if (listRef.current) listRef.current.scrollTop = 0;
            }}
          />
          <button className="button primary" disabled={disabled || films.length >= 500} onClick={onCreate}>
            <Icon name="plus" size={16} /> Nouvelle cinématique
          </button>
        </div>

        <div className="cinematics-browser-summary">
          <span role="status">{count}</span>
          {films.length > 1 && (
            <span className="cinematics-browser-reorder-hint">
              {isSearching ? 'Efface la recherche pour réordonner.' : 'Réordonner avec la poignée ou les flèches ↑ ↓'}
            </span>
          )}
        </div>

        <div className="cinematics-browser-table">
          <div className="cinematics-browser-columns" aria-hidden="true">
            <span>Cinématique</span>
            <span>Catégorie</span>
            <span>Plans</span>
            <span>Durée</span>
            <span>Actions</span>
          </div>
          <div
            ref={listRef}
            className="cinematics-browser-list"
            role="list"
            aria-label="Cinématiques du projet"
            onDragOver={dragOver}
            onDrop={drop}
            onDragLeave={event => {
              const rect = event.currentTarget.getBoundingClientRect();
              if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
                stopScroll();
                setDropTarget(null);
              }
            }}
          >
            {visible.map((film, index) => {
              const active = film.id === activeId;
              const archived = archivedFilms.has(film.id);
              const archiveAction = archived ? 'Désarchiver' : 'Archiver';
              const links = references[film.id] ?? [];
              const linkedText = links.length ? 'Références · ' + links.join(', ') : '';
              const duration = film.shots.reduce((total, shot) => total + shot.duration, 0);
              const isRenaming = editingId === film.id;
              const isCreatingCategory = newCategoryId === film.id;
              const moveHint = isSearching ? 'Efface la recherche pour changer l’ordre' : '';
              return (
                <div
                  key={film.id}
                  data-film-id={film.id}
                  data-archived={archived ? '' : undefined}
                  role="listitem"
                  className={'cinematics-browser-row' + (active ? ' active' : '') + (draggedId === film.id ? ' dragging' : '')
                    + (dropTarget?.id === film.id ? ' drop-' + dropTarget.placement : '')}
                >
                  <button
                    className="cinematics-browser-film"
                    disabled={disabled}
                    aria-current={active ? 'true' : undefined}
                    aria-label={'Ouvrir ' + film.title + (archived ? ' · Archivé' : '') + (linkedText ? ' · ' + linkedText : '')}
                    draggable={canReorder}
                    onDragStart={event => startDrag(event, film.id)}
                    onDragEnd={clearDrag}
                    onClick={() => { if (!dragId.current) onSelect(film.id); }}
                  >
                    <span className="cinematics-browser-grip" aria-hidden="true">⋮⋮</span>
                    <span className="cinematics-browser-number" aria-hidden="true">
                      {String(films.indexOf(film) + 1).padStart(2, '0')}
                    </span>
                    <span className="cinematics-browser-description" title={film.title + ' · ' + film.id}>
                      <span className="cinematics-browser-title">
                        <strong>{film.title}</strong>
                        {archived && <ArchiveStamp />}
                      </span>
                      {linkedText && <small className="cinematics-browser-linked" title={linkedText}>{linkedText}</small>}
                    </span>
                    <span className="cinematics-browser-open" aria-hidden="true">
                      {active ? <>Ouverte <Icon name="check" size={14} /></> : <>Ouvrir <Icon name="chevron" size={14} /></>}
                    </span>
                  </button>

                  <select
                    className="cinematics-browser-category"
                    aria-label={'Catégorie de ' + film.title}
                    title={film.category || 'Sans catégorie'}
                    disabled={disabled}
                    value={isCreatingCategory ? '__new__' : film.category ?? ''}
                    onChange={event => {
                      const category = event.target.value;
                      setFormError('');
                      if (category === '__new__') {
                        editorTrigger.current = event.currentTarget;
                        setEditingId('');
                        setNewCategoryId(film.id);
                        setCategoryDraft('');
                      } else {
                        setNewCategoryId('');
                        onCategory(film.id, category);
                      }
                    }}
                  >
                    <option value="">Sans catégorie</option>
                    {categories.map(category => <option key={category} value={category}>{category}</option>)}
                    <option value="__new__">+ Nouvelle catégorie…</option>
                  </select>

                  <span className="cinematics-browser-plans">
                    {film.shots.length} <span>plan{film.shots.length === 1 ? '' : 's'}</span>
                  </span>
                  <span className="cinematics-browser-duration">
                    {duration.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} s
                  </span>

                  <div className="cinematics-browser-tools">
                    <div className="cinematics-browser-order">
                      <button
                        className="icon-button"
                        disabled={disabled || isSearching || index === 0}
                        aria-label={'Monter ' + film.title}
                        title={moveHint || 'Monter'}
                        onClick={() => onMove(film.id, visible[index - 1].id, 'before')}
                      >
                        <Icon name="up" size={16} />
                      </button>
                      <button
                        className="icon-button"
                        disabled={disabled || isSearching || index === visible.length - 1}
                        aria-label={'Descendre ' + film.title}
                        title={moveHint || 'Descendre'}
                        onClick={() => onMove(film.id, visible[index + 1].id, 'after')}
                      >
                        <Icon name="down" size={16} />
                      </button>
                    </div>
                    <button
                      className="button text"
                      disabled={disabled}
                      aria-label={'Renommer ' + film.title}
                      title="Renommer"
                      onClick={event => {
                        editorTrigger.current = event.currentTarget;
                        setNewCategoryId('');
                        setEditingId(film.id);
                        setTitleDraft(film.title);
                        setFormError('');
                      }}
                    >
                      <Icon name="pencil" size={15} /> <span>Renommer</span>
                    </button>
                    <button
                      className="button text"
                      disabled={disabled || films.length >= 500}
                      aria-label={'Dupliquer la cinématique ' + film.title}
                      title="Dupliquer"
                      onClick={() => onDuplicate(film.id)}
                    >
                      <Icon name="duplicate" size={15} /> <span>Dupliquer</span>
                    </button>
                    <button
                      className="icon-button"
                      disabled={disabled}
                      aria-label={archiveAction + ' ' + film.title}
                      title={archiveAction}
                      onClick={() => {
                        if (archiveFilter !== 'all') archiveFilterRef.current?.focus();
                        onArchive(film.id, !archived);
                      }}
                    >
                      <Icon name={archived ? 'unarchive' : 'archive'} size={16} />
                    </button>
                    <button
                      className="icon-button danger"
                      disabled={disabled}
                      aria-label={'Supprimer ' + film.title}
                      title={linkedText ? 'Supprimer · ' + linkedText : 'Supprimer'}
                      onClick={() => onDelete(film.id)}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>

                  {(isRenaming || isCreatingCategory) && (
                    <form
                      className="cinematics-browser-edit"
                      onSubmit={event => {
                        event.preventDefault();
                        if (isRenaming) saveTitle(film.id);
                        else saveCategory(film.id);
                      }}
                      onKeyDown={event => {
                        if (event.key !== 'Escape') return;
                        event.preventDefault();
                        closeEditor();
                      }}
                    >
                      <input
                        key={isRenaming ? 'title' : 'category'}
                        autoFocus
                        disabled={disabled}
                        aria-label={(isRenaming ? 'Nouveau titre de ' : 'Nouvelle catégorie de ') + film.title}
                        placeholder={isRenaming ? 'Nouveau titre' : 'Nom de la catégorie'}
                        maxLength={isRenaming ? 200 : 100}
                        value={isRenaming ? titleDraft : categoryDraft}
                        onChange={event => {
                          if (isRenaming) setTitleDraft(event.target.value);
                          else setCategoryDraft(event.target.value);
                          setFormError('');
                        }}
                      />
                      <button className="button primary" disabled={disabled}>
                        {isRenaming ? 'Enregistrer le titre' : 'Créer et classer'}
                      </button>
                      <button className="button subtle" type="button" onClick={closeEditor}>Annuler</button>
                      {formError && <p className="cinematics-browser-error" role="alert">{formError}</p>}
                    </form>
                  )}
                </div>
              );
            })}
            {!visible.length && (
              <div className="cinematics-browser-empty" role="listitem">
                <Icon name={films.length ? 'search' : 'list'} size={20} />
                {films.length ? 'Aucune cinématique ne correspond à ces filtres.' : 'Ce projet ne contient encore aucune cinématique.'}
              </div>
            )}
          </div>
        </div>

        <footer className="cinematics-browser-footer">
          <span><Icon name="help" size={15} /> L’ordre de lecture se règle dans Campagne.</span>
          <div className="cinematics-browser-backup">
            <button className="button subtle" disabled={disabled} onClick={onBackupCampaign}
              title="Conserver la campagne, ses images et ses sons dans un dossier daté">
              <Icon name="save" size={15} /> Sauvegarder la campagne…
            </button>
            <button className="button subtle" disabled={disabled} onClick={onBackupProject}
              title="Travailler dans un autre fichier avec la bibliothèque actuelle">
              <Icon name="duplicate" size={15} /> Créer une copie du projet…
            </button>
          </div>
        </footer>
      </div>
    </StudioDialog>
  );
}
