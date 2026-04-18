import React from 'react';
import './SearchBar.css';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  placeholder: string;

  sortKey: string;
  setSortKey: (key: string) => void;

  sortDirection: 'asc' | 'desc';
  setSortDirection: (dir: 'asc' | 'desc') => void;

  filterKey: string;
  setFilterKey: (key: string) => void;

  sortOptions: { key: string; label: string }[];
  filterOptions: { key: string; label: string }[];

  showFilter?: boolean;
  filterLabel?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  placeholder,
  sortKey,
  setSortKey,
  sortDirection,
  setSortDirection,
  filterKey,
  setFilterKey,
  sortOptions,
  filterOptions,
  showFilter = true, // Valor para que el filtro se muestre por defecto --> a no ser que venga como prop del padre y se sobreescriba ese valor
  filterLabel = 'Filtrar:',
}) => {
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="search-bar-container">
      <div className="control-group search-input-group">
        <label htmlFor="search-term" className="control-label">Buscar</label>
        <input
          id="search-term"
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {showFilter && (
        <div className="control-group filter-select-group">
          <label htmlFor="filter-select" className="control-label">{filterLabel}</label>
          <select
            id="filter-select"
            value={filterKey}
            onChange={(e) => setFilterKey(e.target.value)}
            className="select-control"
          >
            {filterOptions.map(option => (
              <option key={option.key} value={option.key}>{option.label}</option>
            ))}
          </select>
        </div>
      )}

      <div className="control-group sort-select-group">
        <label htmlFor="sort-select" className="control-label">Ordenar por:</label>
        <select
          id="sort-select"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          className="select-control"
        >
          {sortOptions.map(option => (
            <option key={option.key} value={option.key}>{option.label}</option>
          ))}
        </select>
      </div>

      <button
        onClick={toggleSortDirection}
        className="sort-toggle-button"
        title={`Cambiar a orden ${sortDirection === 'asc' ? 'Descendente' : 'Ascendente'}`}
      >
        {sortDirection === 'asc' ? '▲ Ascendente' : '▼ Descendente'}
      </button>
    </div>
  );
};