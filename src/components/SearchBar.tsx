import React from 'react';
import './SearchBar.css';

/* INTERFAZ: El "contrato" que define qué datos necesita este componente para funcionar.
 * Se pasan desde el padre (Home.tsx) para mantener el estado sincronizado.
 */
interface SearchBarProps {
  searchTerm: string; // El texto actual de búsqueda.
  setSearchTerm: (term: string) => void; // Función para actualizar el texto. 'void' = no devuelve nada.
  placeholder: string; 
  
  sortKey: string; // Por qué campo ordenamos (nombre, precio, etc.).
  setSortKey: (key: string) => void; // Función para cambiar el campo de ordenación.
  
  sortDirection: 'asc' | 'desc'; // El tipo de orden: solo permite estos dos valores literales.
  setSortDirection: (dir: 'asc' | 'desc') => void; // Función para cambiar el filtro.
  
  filterKey: string; // El filtro actual (todos, activos, inactivos).
  setFilterKey: (key: string) => void; // Función para cambiar el filtro.
  
  // Lista de objetos para el selector de orden: cada uno debe tener una 'key' (ID) y un 'label' (texto visible)
  sortOptions: { key: string; label: string }[];
  // Lista de objetos para el selector de filtro: sigue la misma estructura de array de objetos
  filterOptions: { key: string; label: string }[];
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
}) => {

  // Función para cambiar la dirección de ordenación. Si es 'asc' lo pasa a 'desc' y viceversa usando un operador ternario.
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  return (
    // Contenedor principal para la barra de búsqueda (flexbox para orden)
    <div className="search-bar-container">
      
      {/* BÚSQUEDA POR TEXTO (Live Search) */}
      <div className="control-group search-input-group">
        <label htmlFor="search-term" className="control-label">Buscar</label>
        <input
          id="search-term"
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          // Llama a setSearchTerm en cada cambio de input,
          // lo que actualiza el estado en Home.tsx y dispara el filtrado dinámico.
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* FILTRADO POR PROPIEDAD (ej. Activo/Inactivo) */}
      <div className="control-group filter-select-group">
        <label htmlFor="filter-select" className="control-label">Filtrar:</label>
        <select
          id="filter-select"
          value={filterKey}
          onChange={(e) => setFilterKey(e.target.value)}
          className="select-control"
        >
          {/* Recorremos el array de opciones para crear cada etiqueta <option> dinámicamente */}
          {filterOptions.map(option => (
            <option key={option.key} value={option.key}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* ORDENACIÓN (ej. Nombre/precio)*/}
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

      {/* BOTÓN DE DIRECCIÓN (Asc/Desc) */}
      <button 
        onClick={toggleSortDirection} // Ejecuta la función de interruptor definida arriba.
        className="sort-toggle-button"
        // Atributo dinámico para mejorar la accesibilidad al pasar el ratón.
        title={`Cambiar a orden ${sortDirection === 'asc' ? 'Descendente' : 'Ascendente'}`}
      >
        {/* El texto del botón cambia dinámicamente según el estado actual */}
        {sortDirection === 'asc' ? '▲ Ascendente' : '▼ Descendente'}
      </button>

    </div>
  );
};