import React from 'react';
import './contentArchive.css';

export type ArchiveFilter = 'all' | 'active' | 'archived';

export function matchesArchiveFilter(filter: ArchiveFilter, archived: boolean): boolean {
  return filter === 'all' || archived === (filter === 'archived');
}

interface FilterProps {
  value: ArchiveFilter;
  onChange(value: ArchiveFilter): void;
  controlRef?: React.Ref<HTMLSelectElement>;
}

export function ContentArchiveFilter({ value, onChange, controlRef }: FilterProps) {
  return (
    <select
      ref={controlRef}
      aria-label="Filtrer par statut d’archivage"
      value={value}
      onChange={event => onChange(event.target.value as ArchiveFilter)}
    >
      <option value="all">Tous</option>
      <option value="active">Actifs</option>
      <option value="archived">Archivés</option>
    </select>
  );
}

export function ArchiveStamp() {
  return <span className="archive-stamp">Archivé</span>;
}
