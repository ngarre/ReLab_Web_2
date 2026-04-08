import { useEffect, useState, useMemo } from 'react';
import { getCategories, deleteCategory } from '../services/categoryService';
import { CategoryCard } from '../components/CategoryCard';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/Pagination';
import { SearchBar } from '../components/SearchBar';
import type { Category } from '../types/Category';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Categories.css';

export default function Categories() {
  const { role, token } = useAuth();
  const canManageCategories = role === 'ADMIN' || role === 'GESTOR';

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);

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

      const aValue = a[sortKey as keyof Category];
      const bValue = b[sortKey as keyof Category];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const valA = typeof aValue === 'string' ? aValue.toLowerCase().trim() : aValue;
      const valB = typeof bValue === 'string' ? bValue.toLowerCase().trim() : bValue;

      if (valA > valB) comparison = 1;
      else comparison = -1;

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

  const handleDelete = async (categoryId: number) => {
    if (!token) {
      setError('No hay sesión activa para eliminar categorías.');
      return;
    }

    const confirmed = window.confirm('¿Seguro que quieres eliminar esta categoría?');

    if (!confirmed) {
      return;
    }

    setDeletingCategoryId(categoryId);
    setError('');
    setActionMessage('');

    try {
      await deleteCategory(categoryId, token);
      setCategories((currentCategories) =>
        currentCategories.filter((category) => category.id !== categoryId)
      );
    } catch {
      setActionMessage('No se pudo eliminar la categoría.  Comprueba que no esté en uso por algún producto.');
    } finally {
      setDeletingCategoryId(null);
    }
  };

  return (
    <main className="main-content-area">
      <h1 className="page-title">Categorías Disponibles</h1>
      <div className="page-title-separator"></div>

      {canManageCategories && (
        <div className="my-products-hero-actions">
          <p className="my-products-hero-text">
            ¿Quieres añadir una nueva categoría a la plataforma?
          </p>

          <Link to="/categories/new" className="create-product-btn">
            Crear categoría
          </Link>
        </div>
      )}

      <p className="my-products-section-intro">
        Explora las distintas categorías de productos, sus características y la tasa de comisión asociada a cada una:
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

      {loading && <Loading />}
      {error && <ErrorMessage message={error} />}

      {actionMessage && (
        <div className="category-action-alert">
          <span>{actionMessage}</span>
          <button
            type="button"
            className="category-action-alert-close"
            onClick={() => setActionMessage('')}
            aria-label="Cerrar aviso"
          >
            ×
          </button>
        </div>
      )}

      {!loading && (
        <>
          <p className="results-count">
            Mostrando {filteredCategories.length} de {categories.length} categorías.
          </p>

          <div className="cards-grid">
            {filteredCategories.length === 0 ? (
              <p className="empty-message">No se encontraron categorías.</p>
            ) : (
              currentData.map(category => (
                <div key={category.id} className="category-card-item">
                  <CategoryCard category={category} />

                  {canManageCategories && (
                    <div className="category-card-actions">
                      <Link
                        to={`/categories/${category.id}/edit`}
                        className="category-manage-btn"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        className="category-delete-btn"
                        onClick={() => handleDelete(category.id)}
                        disabled={deletingCategoryId === category.id}
                      >
                        {deletingCategoryId === category.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  )}
                </div>
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