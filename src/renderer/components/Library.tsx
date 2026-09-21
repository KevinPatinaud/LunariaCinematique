import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Asset, LibrarySnapshot } from '../../shared/model.js';
import { assetMatchesTab, buildFolderTree, filterLibraryAssets, folderLabel, normalizeSearch, parentFolders,
  type FolderNode, type LibraryPreferences, type LibraryTab } from '../../shared/libraryBrowser.js';
import { ASSET_MIME, ASSET_KIND_MIME } from '../../shared/assets.js';
import { Icon } from './Icon.js';
import { LibraryResizeHandle } from './LibraryResizeHandle.js';
export type { LibraryTab } from '../../shared/libraryBrowser.js';
export { folderLabel } from '../../shared/libraryBrowser.js';

const tabs = [
  ['environment', 'image', 'Décors'], ['character', 'actor', 'Personnages'], ['enemy', 'enemy', 'Ennemis'], ['prop', 'prop', 'Objets'],
  ['ui', 'bubble', 'Bulles'], ['audio', 'music', 'Audio']
] as const;
const allLabels: Record<LibraryTab, string> = { environment: 'Tous les lieux', character: 'Tous les personnages', enemy: 'Tous les ennemis', prop: 'Tous les objets', ui: 'Tous les modèles', audio: 'Tous les sons' };
const actionLabels: Record<LibraryTab, string> = { environment: 'Utiliser comme décor', character: 'Ajouter le personnage', enemy: 'Ajouter l’ennemi', prop: 'Ajouter l’objet', ui: 'Appliquer à la bulle', audio: 'Ajouter au plan' };
interface Props {
  library: LibrarySnapshot | null; tab: LibraryTab; setTab: (tab: LibraryTab) => void;
  choose: () => void; refresh: () => void; useAsset: (asset: Asset, as: LibraryTab) => boolean | Promise<boolean>;
  disabled: boolean; busy: boolean;
  collections: {favorites: readonly string[]; recent: readonly string[]; toggle: (ref: Asset['ref']) => void; clearRecent: () => void};
  layout: { preferences: LibraryPreferences; width: number; maxWidth: number; update: (patch: Partial<LibraryPreferences>) => void };
}

function FolderTree({ nodes, folder, select, openPaths, toggle, total, allLabel }: {
  nodes: FolderNode[]; folder: string; select: (folder: string) => void; openPaths: Set<string>;
  toggle: (path: string) => void; total: number; allLabel: string;
}) {
  const [query, setQuery] = useState('');
  const needle = normalizeSearch(query);
  const matches = (node: FolderNode): boolean => normalizeSearch(node.path + ' ' + node.label).includes(needle) || node.children.some(matches);
  const render = (siblings: FolderNode[], depth: number): React.ReactNode => siblings.filter(n => !needle || matches(n)).map(node => {
    const hasChildren = node.children.length > 0, open = !!needle || openPaths.has(node.path);
    return <li key={node.path}>
      <div className={`folder-row ${folder === node.path ? 'selected' : ''}`} style={{ paddingLeft: 5 + depth * 13 }}>
        {hasChildren ? <button className={`tree-toggle ${open ? 'open' : ''}`} aria-label={`${open ? 'Replier' : 'Déplier'} ${node.label}`}
          aria-expanded={open} onClick={() => toggle(node.path)}><Icon name="chevron" size={12}/></button> : <span className="tree-spacer"/>}
        <button className="folder-name" aria-current={folder === node.path ? 'location' : undefined} onClick={() => select(node.path)} title={node.path}>
          <Icon name="folder" size={14}/><span>{node.label}</span><small>{node.count}</small>
        </button>
      </div>
      {hasChildren && open && <ul>{render(node.children, depth + 1)}</ul>}
    </li>;
  });
  return <div className="folder-browser">
    <div className="folder-filter"><Icon name="search" size={14}/><input aria-label="Filtrer les dossiers" placeholder="Trouver un dossier…" value={query} onChange={e => setQuery(e.target.value)}/></div>
    <nav className="folder-tree" aria-label="Continent et lieu">
      <button className={`all-folders ${!folder ? 'selected' : ''}`} aria-current={!folder ? 'location' : undefined} onClick={() => select('')}><Icon name="grid" size={14}/>{allLabel}<small>{total}</small></button>
      <ul>{render(nodes, 0)}</ul>
      {!!needle && !nodes.some(matches) && <p className="folder-no-match">Aucun dossier correspondant.</p>}
    </nav>
  </div>;
}

function AssetThumbnail({ asset }: { asset: Asset }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [asset]);
  return <div className={`asset-image ${asset.kind === 'ui' || asset.kind === 'character' || asset.kind === 'enemy' || asset.kind === 'prop' ? 'checker' : ''}`}>
    {asset.kind === 'audio' ? <Icon name="music" size={27}/> : failed ? <span title="Image illisible · Actualiser pour réessayer"><Icon name="warning" size={22}/></span> : <img onError={() => setFailed(true)} src={asset.thumbnail} loading="lazy" decoding="async" alt="" draggable={false}/>}
  </div>;
}

function AssetResults({ assets, selectedRef, onPick, onUse, disabled, view, size, resetKey, expanded, tab, empty, favorites, toggleFavorite }: {
  assets: Asset[]; selectedRef: string | null; onPick: (ref: string) => void; onUse: (asset: Asset) => void;
  disabled: boolean; view: LibraryPreferences['view']; size: LibraryPreferences['size']; resetKey: string;
  expanded: boolean; tab: LibraryTab; empty: React.ReactNode; favorites: readonly string[]; toggleFavorite: (ref: Asset['ref']) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null), sentinel = useRef<HTMLDivElement>(null);
  const [limit, setLimit] = useState(60);
  useEffect(() => { setLimit(60); if (scroller.current) scroller.current.scrollTop = 0; }, [resetKey]);
  useEffect(() => {
    const root = scroller.current, target = sentinel.current;
    if (!root || !target || limit >= assets.length) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) setLimit(n => Math.min(n + 60, assets.length));
    }, { root, rootMargin: '240px 0px' });
    observer.observe(target); return () => observer.disconnect();
  }, [limit, assets.length, resetKey]);
  // The sidebar stays mounted while the expanded browser is open, so its scroll is kept.
  return <div className={`library-results view-${view} size-${size}`} ref={scroller} aria-label="Résultats de la bibliothèque">
    <div className="asset-grid">{assets.slice(0, limit).map(asset => <div className={`asset-tile ${selectedRef === asset.ref ? 'picked' : ''}`} key={asset.ref}>
      <button className={`asset-card ${selectedRef === asset.ref ? 'picked' : ''}`} data-asset-ref={asset.ref}
        aria-label={asset.name} aria-pressed={selectedRef === asset.ref} disabled={disabled} draggable={!disabled && !expanded}
        title={`${asset.path}\n${expanded ? 'Double-cliquer pour ajouter au plan et revenir à la scène.' : 'Double-cliquer pour ajouter · Glisser vers la scène.'}`}
        onDragStart={e => { onPick(asset.ref); e.dataTransfer.setData(ASSET_MIME, asset.ref); e.dataTransfer.setData(ASSET_KIND_MIME, tab); e.dataTransfer.effectAllowed = 'copy'; }}
        onClick={() => onPick(asset.ref)} onDoubleClick={() => onUse(asset)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onUse(asset); } }}>
        <AssetThumbnail asset={asset}/>
        <span className="asset-copy"><span className="asset-name">{asset.name}</span><span className="asset-folder">{asset.folder.split('/').map(folderLabel).join(' / ') || 'Racine'}</span></span>
      </button>
      <button className={`asset-favorite ${favorites.includes(asset.ref) ? 'active' : ''}`} title={favorites.includes(asset.ref) ? 'Retirer des favoris' : 'Ajouter aux favoris'} aria-label={`${favorites.includes(asset.ref) ? 'Retirer des favoris' : 'Ajouter aux favoris'} : ${asset.name}`} aria-pressed={favorites.includes(asset.ref)} disabled={disabled} onClick={()=>toggleFavorite(asset.ref)}><Icon name="star" size={13}/></button>
      <button className="asset-quick-add" title={actionLabels[tab]} aria-label={`${actionLabels[tab]} : ${asset.name}`} disabled={disabled} onClick={() => onUse(asset)}><Icon name="plus" size={14}/></button>
    </div>)}</div>
    {!assets.length && empty}
    {!!assets.length && <div ref={sentinel} className="library-scroll-end">
      {limit < assets.length ? <button className="link-button" onClick={() => setLimit(n => Math.min(n + 60, assets.length))}>Charger la suite</button> : <span>{assets.length} élément{assets.length > 1 ? 's' : ''} · Fin de la sélection</span>}
    </div>}
  </div>;
}

export function Library(props: Props) {
  const { library, tab, setTab, layout } = props;
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<'all'|'favorites'|'recent'>('all');
  const [folders, setFolders] = useState<Record<LibraryTab, string>>({ environment: '', character: '', enemy: '', prop: '', ui: '', audio: '' });
  const folder = folders[tab];
  const [picked, setPicked] = useState<string | null>(null), [folderOpen, setFolderOpen] = useState(false);
  const [large, setLarge] = useState(false), [inserting, setInserting] = useState(false);
  const [openPaths, setOpenPaths] = useState(new Set<string>());
  const navRef = useRef<HTMLDivElement>(null), folderTrigger = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null), expandButton = useRef<HTMLButtonElement>(null);
  const disabled = props.disabled || props.busy || inserting;
  const insertLock = useRef(false);
  const [insertError, setInsertError] = useState('');
  useEffect(() => {
    setFolders({ environment: '', character: '', enemy: '', prop: '', ui: '', audio: '' }); setPicked(null); setQuery(''); setFolderOpen(false);
    setOpenPaths(new Set()); setScope('all');
  }, [library?.rootPath]);
  useEffect(() => { setPicked(null); setFolderOpen(false); setQuery(''); }, [tab]);
  useEffect(() => { if (props.disabled) { setLarge(false); setFolderOpen(false); } }, [props.disabled]);
  useEffect(() => {
    if (!folderOpen) return;
    const outside = (e: PointerEvent) => { if (!navRef.current?.contains(e.target as Node)) setFolderOpen(false); };
    document.addEventListener('pointerdown', outside); return () => document.removeEventListener('pointerdown', outside);
  }, [folderOpen]);
  useEffect(() => {
    if (!large) return;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => { if (dialog?.open) dialog.close(); expandButton.current?.focus(); };
  }, [large]);
  const tabAssets = useMemo(() => library?.assets.filter(asset => assetMatchesTab(asset, tab)) ?? [], [library, tab]);
  const nodes = useMemo(() => buildFolderTree(tabAssets), [tabAssets]);
  useEffect(() => {
    if (tab !== 'environment' && nodes.length === 1 && nodes[0].children.length) {
      setOpenPaths(previous => new Set([...previous, nodes[0].path]));
    }
  }, [tab, nodes]);
  const results = useMemo(() => {
    const base=filterLibraryAssets(tabAssets, scope==='all'?folder:'', query);
    if(scope==='favorites') return base.filter(a=>props.collections.favorites.includes(a.ref));
    if(scope==='recent') return props.collections.recent.flatMap(ref=>{const a=base.find(a=>a.ref===ref);return a?[a]:[];});
    return base;
  }, [tabAssets, folder, query, scope, props.collections.favorites, props.collections.recent]);
  useEffect(() => {
    if (folder && !tabAssets.some(a => a.folder === folder || a.folder.startsWith(folder + '/'))) setFolders(previous => ({ ...previous, [tab]: '' }));
  }, [tabAssets, folder, tab]);
  const selected = results.find(a => a.ref === picked);
  const counts = useMemo(() => Object.fromEntries(tabs.map(([key]) => [key, library?.assets.filter(a => assetMatchesTab(a, key)).length ?? 0])), [library]);
  const selectFolder = (path: string) => { setScope('all');
    setFolders(previous => ({ ...previous, [tab]: path })); setPicked(null); setFolderOpen(false);
    setOpenPaths(previous => new Set([...previous, ...parentFolders(path)]));
    if (!large) requestAnimationFrame(() => folderTrigger.current?.focus());
  };
  const toggleFolder = (path: string) => setOpenPaths(previous => { const next = new Set(previous); next.has(path) ? next.delete(path) : next.add(path); return next; });
  const changeTab = (value: LibraryTab) => { setTab(value); setQuery(''); setPicked(null); setFolderOpen(false); };
  async function useAsset(asset: Asset, as = tab) {
    if (disabled || insertLock.current) return;
    insertLock.current = true; setInserting(true); setInsertError('');
    try { const ok = await props.useAsset(asset, as); if (ok && large) setLarge(false); else if (!ok) setInsertError('La ressource n’a pas été ajoutée. Vérifie son type ou son intégrité.'); }
    catch (error) { setInsertError(error instanceof Error ? error.message : String(error)); }
    finally { insertLock.current = false; setInserting(false); }
  }
  const folderTree = () => <FolderTree nodes={nodes} folder={folder} select={selectFolder} openPaths={openPaths} toggle={toggleFolder} total={tabAssets.length} allLabel={allLabels[tab]}/>;
  const tabStrip = () => <div className="library-tabs" role="tablist" aria-label="Types de ressources">{tabs.map(([id, icon, label]) =>
    <button key={id} data-tab={id} role="tab" disabled={props.busy || inserting} aria-selected={tab === id} className={tab === id ? 'active' : ''} onClick={() => changeTab(id)} title={`${label} (${counts[id]})`}>
      <Icon name={icon} size={15}/><span>{label}</span><small>{counts[id]}</small>
    </button>)}</div>;
  const search = (autofocus = false) => <div className="search">
    <Icon name="search" size={16}/><input autoFocus={autofocus} aria-label="Rechercher un asset" value={query} onChange={e => { setQuery(e.target.value); setPicked(null); }} placeholder={folder ? `Rechercher dans ${folderLabel(folder.split('/').pop()!)}…` : 'Rechercher un nom, un lieu…'}/>
    {!!query && <button className="icon-button" aria-label="Effacer la recherche" onClick={() => setQuery('')}><Icon name="close" size={13}/></button>}
  </div>;
  const collectionControls = () => <div className="library-collections" role="group" aria-label="Collections de ressources">
    {([['all','grid','Tout'],['favorites','star','Favoris'],['recent','history','Récents']] as const).map(([value,icon,label])=><button key={value} className={scope===value?'active':''} aria-pressed={scope===value} onClick={()=>{setScope(value);setPicked(null);}}><Icon name={icon} size={12}/>{label}</button>)}
    {scope==='recent' && !!props.collections.recent.length && <button title="Vider les récents" aria-label="Vider les récents" onClick={props.collections.clearRecent}><Icon name="trash" size={12}/></button>}
  </div>;
  const viewControls = () => <div className="library-view-controls">
    <div className="library-view-toggle" role="group" aria-label="Affichage des ressources">
      <button className={`icon-button ${layout.preferences.view === 'grid' ? 'toggled' : ''}`} aria-label="Vue en grille" aria-pressed={layout.preferences.view === 'grid'} title="Vue en grille" onClick={() => layout.update({ view: 'grid' })}><Icon name="grid" size={14}/></button>
      <button className={`icon-button ${layout.preferences.view === 'list' ? 'toggled' : ''}`} aria-label="Vue en liste" aria-pressed={layout.preferences.view === 'list'} title="Vue en liste compacte" onClick={() => layout.update({ view: 'list' })}><Icon name="list" size={16}/></button>
    </div>
    <div className="library-size-controls" role="group" aria-label="Taille des vignettes">
      <span>Vignettes</span>{([['small', 'Petites', 'S'], ['medium', 'Moyennes', 'M'], ['large', 'Grandes', 'L']] as const).map(([size, label, letter]) =>
        <button key={size} aria-label={`Vignettes ${label.toLowerCase()}`} aria-pressed={layout.preferences.size === size} disabled={layout.preferences.view === 'list'} title={label} className={layout.preferences.size === size ? 'active' : ''} onClick={() => layout.update({ size })}>{letter}</button>)}
    </div>
  </div>;
  const breadcrumbs = () => <nav className="library-breadcrumbs" aria-label="Dossier sélectionné">
    <button onClick={() => selectFolder('')} title={allLabels[tab]}>{allLabels[tab]}</button>
    {parentFolders(folder).map(path => <React.Fragment key={path}><Icon name="chevron" size={10}/><button title={path} aria-current={path === folder ? 'location' : undefined} onClick={() => selectFolder(path)}>{folderLabel(path.split('/').pop()!)}</button></React.Fragment>)}
  </nav>;
  const empty = <div className="library-empty"><Icon name={tab === 'enemy' ? 'enemy' : tab === 'character' ? 'actor' : 'image'} size={28}/>
    <p>{!library ? 'Ta bibliothèque, sans la copier.' : scope==='favorites' ? 'Aucun favori dans cette catégorie.' : scope==='recent' ? 'Aucune ressource récente dans cette catégorie.' : query ? 'Aucun résultat pour cette recherche.' : 'Aucun élément dans ce dossier.'}</p>
    <small>{!library ? 'Connecte le dossier commun pour retrouver tes images.' : query ? 'Recherche par nom de fichier, personnage ou lieu, même sans accents.' : tab === 'prop' ? 'Place les images dans « 07_props », « objets » ou « decorations » de ta bibliothèque commune. Les PNG transparents sont adaptés aux éléments détachés du décor.' : tab === 'enemy' ? 'Les images du dossier « 03_enemies » (ou « ennemis ») apparaissent ici, y compris les sous-dossiers de stages, poses et expressions. Actualise après ajout ; aucune copie vers characters n’est nécessaire.' : tab === 'character' ? 'Les PNG sont à placer dans un dossier « characters » ou « personnages » de la bibliothèque commune.' : 'Essaie un autre dossier ou un autre type de ressource.'}</small>
    {(folder || query) && <button className="button subtle" onClick={() => { selectFolder(''); setQuery(''); }}>Tout afficher</button>}
    {!!folder && !!query && <button className="link-button" onClick={() => selectFolder('')}>Rechercher dans toute la catégorie</button>}
  </div>;
  const assetResults = (expanded: boolean) => <AssetResults assets={results} selectedRef={picked} onPick={setPicked} onUse={asset => void useAsset(asset)} disabled={disabled}
    view={layout.preferences.view} size={layout.preferences.size} resetKey={`${library?.rootPath}|${tab}|${folder}|${query}|${scope}`} expanded={expanded} tab={tab} empty={empty} favorites={props.collections.favorites} toggleFavorite={props.collections.toggle}/>;

  return <>
    <aside className="library panel" data-library-surface="sidebar" aria-label="Bibliothèque de ressources">
      <div className="panel-heading"><span>BIBLIOTHÈQUE</span><div className="library-heading-actions">
        <button className="icon-button" title="Actualiser la bibliothèque" aria-label="Actualiser la bibliothèque" onClick={props.refresh} disabled={props.busy || disabled}><Icon name="refresh" size={15}/></button>
        <button ref={expandButton} className="button library-expand" title="Parcourir en grand" aria-label="Agrandir la bibliothèque" onClick={() => { setFolderOpen(false); setLarge(true); }} disabled={disabled}><Icon name="expand" size={14}/><span>Agrandir</span></button>
      </div></div>
      <button className="library-root" onClick={props.choose} disabled={disabled || props.busy} title={library?.rootPath ?? 'Choisir le dossier commun'}><Icon name="folder" size={16}/><span>{props.busy ? 'Lecture de la bibliothèque…' : library?.rootName ?? 'Connecter ma bibliothèque'}</span><Icon name="chevron" size={12}/></button>
      {tabStrip()}{collectionControls()}{search()}
      <div className="folder-navigation" ref={navRef}>
        <button ref={folderTrigger} className={`folder-trigger ${folderOpen ? 'active' : ''}`} aria-expanded={folderOpen} aria-label="Choisir un dossier" disabled={!library || disabled || scope!=='all'} onClick={() => setFolderOpen(!folderOpen)}><Icon name="folder" size={15}/><span>{folder ? folderLabel(folder.split('/').pop()!) : allLabels[tab]}</span><small>{results.length}</small><Icon name="down" size={13}/></button>
        {!!folder && scope==='all' && breadcrumbs()}
        {folderOpen && <div className="folder-popover" onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); setFolderOpen(false); folderTrigger.current?.focus(); } }}>
          <div className="folder-popover-heading"><span>Parcourir les dossiers</span><button className="icon-button" aria-label="Fermer les dossiers" onClick={() => { setFolderOpen(false); folderTrigger.current?.focus(); }}><Icon name="close" size={14}/></button></div>
          {folderTree()}
        </div>}
      </div>
      {viewControls()}
      <div className="results-heading"><span>{query ? 'RÉSULTATS' : 'RESSOURCES DISPONIBLES'}</span><strong aria-live="polite">{results.length}</strong></div>
      {assetResults(false)}
      {selected && <div className="asset-selection">
        <div className="asset-selection-copy"><strong title={selected.path}>{selected.name}</strong><span>Référence partagée · aucun fichier copié</span></div>
        <button className="icon-button" title="Voir l’aperçu en grand" aria-label="Voir l’aperçu en grand" onClick={() => setLarge(true)}><Icon name="expand" size={15}/></button>
        <button className="button primary" disabled={disabled} title={actionLabels[tab]} aria-label={actionLabels[tab]} onClick={() => void useAsset(selected)}><Icon name="plus" size={16}/></button>
      </div>}
      {!!insertError && <p className="library-inline-error" role="alert">{insertError}</p>}
      {!!library?.warnings.length && <details className="library-warnings"><summary>{library.warnings.length} avertissement(s) bibliothèque</summary>{library.warnings.map((w,i) => <p key={i}>{w}</p>)}</details>}
      <div className="library-note"><span className="status-dot"/> Double-clic pour ajouter · Glisser vers la scène</div>
      <LibraryResizeHandle width={layout.width} maxWidth={layout.maxWidth} resize={width => layout.update({ width })}/>
    </aside>
    {large && createPortal(<dialog ref={dialogRef} className="asset-browser-dialog" aria-label="Bibliothèque agrandie" data-library-surface="expanded"
      onCancel={e => { e.preventDefault(); setLarge(false); }} onKeyDown={e => e.stopPropagation()} onClick={e => { if (e.target === e.currentTarget) setLarge(false); }}>
      <div className="asset-browser-shell">
        <header className="asset-browser-header"><div><span className="overline">LUNARIA · BIBLIOTHÈQUE COMMUNE</span><h2>Choisis les éléments de ton plan.</h2><p>Double-clique sur une ressource pour l’ajouter et revenir à la scène.</p></div>
          <button className="button subtle" onClick={() => setLarge(false)}><Icon name="close" size={16}/> Retour à la scène <kbd>ÉCHAP</kbd></button>
        </header>
        <div className="asset-browser-toolbar">{tabStrip()}{collectionControls()}{search(true)}{viewControls()}</div>
        <div className="asset-browser-body">
          <aside className="asset-browser-folders"><div className="browser-section-label"><Icon name="folder" size={14}/> DOSSIERS <button className="link-button" onClick={() => setOpenPaths(new Set())}>Replier</button></div>{folderTree()}</aside>
          <section className="asset-browser-gallery"><div className="asset-browser-location">{breadcrumbs()}<strong aria-live="polite">{results.length} élément{results.length > 1 ? 's' : ''}</strong></div>{assetResults(true)}</section>
          <aside className="asset-browser-preview"><div className="browser-section-label">APERÇU</div>
            {selected ? <><div className="asset-preview-image checker">{selected.kind === 'audio' ? <audio controls src={selected.url} preload="none" aria-label={`Écouter ${selected.name}`}/> : <img src={selected.url} alt={selected.name}/>}</div>
              <h3>{selected.name}</h3><p className="asset-preview-path">{selected.path}</p><small>{selected.bytes ? (selected.bytes / 1024 / 1024).toFixed(1) + ' Mo · ' : ''}Référence partagée</small>
              <button className="button primary full" disabled={disabled} onClick={() => void useAsset(selected)}><Icon name="plus" size={16}/>{actionLabels[tab]}</button>
              {tab !== 'audio' && tab !== 'enemy' && <button className="link-button" disabled={disabled} onClick={() => void useAsset(selected, 'enemy')}>Ajouter comme ennemi</button>}
              {tab !== 'audio' && tab !== 'prop' && <button className="link-button" disabled={disabled} onClick={() => void useAsset(selected, 'prop')}>Ajouter comme objet de décoration</button>}
            </> : <div className="asset-preview-empty"><Icon name="image" size={32}/><p>Sélectionne une ressource pour l’examiner ici.</p><small>Un clic pour choisir.<br/>Double-clic pour l’utiliser.</small></div>}
            {!!insertError && <p className="library-inline-error" role="alert">{insertError}</p>}<div className="asset-preview-note"><Icon name="leaf" size={16}/><span>Les images restent dans ta bibliothèque. Seul leur chemin est enregistré.</span></div>
          </aside>
        </div>
      </div>
    </dialog>, document.body)}
  </>;
}
