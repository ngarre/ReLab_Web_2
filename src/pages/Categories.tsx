import { useEffect, useState, useMemo } from 'react';
import { getCategories } from '../services/categoryService';
import { CategoryCard } from '../components/CategoryCard';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/Pagination';
import { SearchBar } from '../components/SearchBar';
import type { Category } from '../types/Category';
import { useAuth } from '../hooks/useAuth';

export default function Categories() {

  const { role } = useAuth();
  const canManageCategories = role === 'ADMIN' || role === 'GESTOR';

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('nombre');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterKey, setFilterKey] = useState('all');


  const sortOptions = [
    { key: 'nombre', label: 'Nombre (A-Z)' },
    { key: 'tasaComision', label: 'Comisión' },
  ];

  const filterOptions = [
    { key: 'all', label: 'Todas las Categorías' },
    { key: 'active', label: 'Solo Activas' },
    { key: 'inactive', label: 'Solo Inactivas' },
  ];


  useEffect(() => {
    setLoading(true);
    setError('');

    getCategories()
      .then(data => setCategories(data))
      .catch(() => setError('No se pudo cargar el listado de categorías.'))
      .finally(() => setLoading(false));
  }, []);


  const filteredCategories = useMemo(() => {
    let result = [...categories];

    if (searchTerm) {
      const termLower = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.nombre.toLowerCase().includes(termLower) ||
        c.descripcion.toLowerCase().includes(termLower)
      );
    }

    if (filterKey === 'active') {
      result = result.filter(c => c.activa === true);
    } else if (filterKey === 'inactive') {
      result = result.filter(c => c.activa === false);
    }

    result.sort((a, b) => {
      let comparison = 0;

      // Obtener valores originales
      const aValue = a[sortKey as keyof Category];
      const bValue = b[sortKey as keyof Category];

      // Control de nulos 
      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      //  Normalización para la comparación (Variables auxiliares)
      // Si es un texto (como el nombre), pasamos a minúsculas. 
      // Si es un número (como tasaComision), se queda igual.
      const valA = typeof aValue === 'string' ? aValue.toLowerCase().trim() : aValue;
      const valB = typeof bValue === 'string' ? bValue.toLowerCase().trim() : bValue;

      if (valA > valB) comparison = 1;
      else comparison = -1;

      // 4. Aplicar dirección
      return sortDirection === 'asc' ? comparison : comparison * -1;
    });

    return result;
  }, [categories, searchTerm, sortKey, sortDirection, filterKey]);

  const {
    currentPage,
    totalPages,
    currentData,
    nextPage,
    prevPage
  } = usePagination(filteredCategories, 8);


  return (
    <main className="main-content-area">
      <h1 className="page-title">Categorías Disponibles</h1>
      <div className="page-title-separator"></div>

      <p className="page-subtitle">
        Explora las distintas categorías de productos, sus características y la tasa de comisión asociada a cada una
      </p>

      <div className="search-filter-area">
        <SearchBar
          placeholder="Buscar por nombre o descripción..."
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortKey={sortKey}
          setSortKey={setSortKey}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          filterKey={filterKey}
          setFilterKey={setFilterKey}
          sortOptions={sortOptions}
          filterOptions={filterOptions}
        />
      </div>

      {loading && <Loading />} {/* Si loading es true, muestra el componente Loading */}
      {error && <ErrorMessage message={error} />} {/* Si error es true, muestra el componente error */}

      {!loading && !error && (
        <>
          <p className="results-count">
            Mostrando {filteredCategories.length} de {categories.length} categorías.
          </p>

          <div className="cards-grid">
            {filteredCategories.length === 0 ? (
              <p className="empty-message">No se encontraron categorías.</p>
            ) : (
              currentData.map(category => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  canManage={canManageCategories}
                />
              ))
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onNext={nextPage}
            onPrev={prevPage}
          />
        </>
      )}
    </main>
  );
}