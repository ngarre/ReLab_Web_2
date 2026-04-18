import { useEffect, useState, useMemo } from 'react';
import { getCategories, deleteCategory } from '../services/categoryService';
import { getProducts } from '../services/productService';
import { CategoryCard } from '../components/CategoryCard';
import { CategoryUsageSummary } from '../components/CategoryUsageSummary';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/Pagination';
import { SearchBar } from '../components/SearchBar';
import type { Category } from '../types/Category';
import type { Product } from '../types/Product';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Categories.css';

export default function Categories() {
  const { role, token } = useAuth();
  const canManageCategories = role === 'ADMIN' || role === 'GESTOR';

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
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

  // Este efecto se ejecuta solo una vez al montar la página.
  // Su misión es cargar los datos iniciales.
  useEffect(() => {
    // Antes de cargar, activo loading y limpio errores previos.
    setLoading(true);
    setError('');

    // Hago ambas peticiones en paralelo para optimizar tiempo:
    // - categorías
    // - productos
    Promise.all([getCategories(), getProducts()])
      .then(([categoriesData, productsData]) => {
         // Si ambas salen bien, guardo resultados en estado.
        setCategories(categoriesData);
        setProducts(productsData);
      })
      .catch(() => setError('No se pudo cargar el dashboard de categorías.'))
      .finally(() => setLoading(false));
  }, []);

  // Resumen simple de categorías:
  // total, activas e inactivas.
  // Lo memoizo para no recalcularlo en cada render si categories no cambia.
  const summary = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((category) => category.activa).length;
    const inactive = total - active;

    return { total, active, inactive };
  }, [categories]);

  // Resumen "productos por categoría".
  // Para cada categoría cuento cuántos productos pertenecen a esa categoría.
  // Después ordeno el resumen de mayor a menor número de productos.
  const categoryUsageSummary = useMemo(() => {
    return categories
      .map((category) => ({
        name: category.nombre,
        count: products.filter(
          (product) => product.categoria?.id === category.id
        ).length,
      }))
      // Ordeno categorías de mayor a menor número de categorías (comparo categorias de dos en dos)
      // Si ambas categorías tienen mismo número de productos asociados --> odeno alfabéticamente (según reglas del español)
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'es'));
  }, [categories, products]);


  // Aquí aplico una regla de visibilidad por rol.
  // - Si puede gestionar, ve todas las categorías.
  // - Si no puede gestionar, solo ve las activas.
  const visibleCategories = useMemo(() => {
    if (canManageCategories) {
      return categories;
    }

    return categories.filter((category) => category.activa);
  }, [categories, canManageCategories]);

  // Aquí aplico el filtrado y la ordenación final sobre lo que realmente se va a mostrar.
  const filteredCategories = useMemo(() => {
    // Empiezo copiando visibleCategories para no mutar el array original.
    let result = [...visibleCategories];

    if (searchTerm) {
      // Si hay texto de búsqueda, filtro por nombre o descripción.
      const termLower = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.nombre.toLowerCase().includes(termLower) ||
        c.descripcion.toLowerCase().includes(termLower)
      );
    }

    // El filtro active/inactive solo se aplica si el usuario puede gestionar.
    // Para cliente no tiene sentido ese filtro porque ya solo ve activas.
    if (canManageCategories) {
      if (filterKey === 'active') {
        result = result.filter(c => c.activa === true);
      } else if (filterKey === 'inactive') {
        result = result.filter(c => c.activa === false);
      }
    }

    // Ordeno el resultado final.
    result.sort((a, b) => {
      let comparison = 0;

      // Accedo dinámicamente al campo por el que se quiere ordenar.
      const aValue = a[sortKey as keyof Category];
      const bValue = b[sortKey as keyof Category];

      // Si son iguales, no cambio el orden relativo.
      if (aValue === bValue) return 0;

      // Si uno es null/undefined, lo mando al final.
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Si son strings, normalizo a minúsculas y trim.
      // Si no, uso el valor tal cual.
      const valA = typeof aValue === 'string' ? aValue.toLowerCase().trim() : aValue;
      const valB = typeof bValue === 'string' ? bValue.toLowerCase().trim() : bValue;

      // Comparación base ascendente.
      if (valA > valB) comparison = 1;
      else comparison = -1;

      // Si la dirección es descendente, invierto el signo.
      return sortDirection === 'asc' ? comparison : comparison * -1;
    });

    return result;
  }, [visibleCategories, searchTerm, sortKey, sortDirection, filterKey, canManageCategories]);


  // Aplico paginación al array ya filtrado y ordenado.
  // El 8 indica cuántas categorías quiero por página.
  const {
    currentPage,
    totalPages,
    currentData,
    nextPage,
    prevPage
  } = usePagination(filteredCategories, 8);

  // Manejador para eliminar una categoría.
  const handleDelete = async (categoryId: number) => {
    // Si no hay token, no se puede hacer la acción protegida.
    if (!token) {
      setError('No hay sesión activa para eliminar categorías.');
      return;
    }

    // Pido confirmación al usuario antes de borrar.
    const confirmed = window.confirm('¿Seguro que quieres eliminar esta categoría?');

    // Si cancela, salgo sin hacer nada.
    if (!confirmed) {
      return;
    }

    // Marco la categoría como "en proceso de borrado".
    // También limpio mensajes anteriores.
    setDeletingCategoryId(categoryId);
    setError('');
    setActionMessage('');

    try {
      // Llamo al backend para eliminar.
      await deleteCategory(categoryId, token);
      // Si sale bien, actualizo el estado local quitando la categoría borrada.
      setCategories((currentCategories) =>
        currentCategories.filter((category) => category.id !== categoryId)
      );
    } catch {
      setActionMessage('No se puede eliminar una categoría que está en uso por algún producto.');
    } finally {
       // Pase lo que pase, dejo de marcarla como "Eliminando...".
      setDeletingCategoryId(null);
    }
  };

  // Empieza el render del componente.
  return (
    <main className="main-content-area">
      <h1 className="page-title">Gestión de Categorías</h1>
      <div className="page-title-separator"></div>

      {/* Bloque visible solo para ADMIN / GESTOR:
      CTA para crear categoría nueva */}
      {canManageCategories && (
        <div className="categories-hero-actions">
          <p className="categories-hero-text">
            ¿Quieres añadir una nueva categoría a la plataforma?
          </p>

          <Link to="/categories/new" className="categories-create-btn">
            Crear categoría
          </Link>
        </div>
      )}

      {/* Resumen del dashboard: solo para quien puede gestionar */}
      {canManageCategories && (
        <div className="dashboard-summary-grid">
          <article className="dashboard-summary-card dashboard-summary-card-total">
            <h2>Total</h2>
            <p>{summary.total}</p>
          </article>

          <article className="dashboard-summary-card dashboard-summary-card-active">
            <h2>Activas</h2>
            <p>{summary.active}</p>
          </article>

          <article className="dashboard-summary-card dashboard-summary-card-inactive">
            <h2>Inactivas</h2>
            <p>{summary.inactive}</p>
          </article>
        </div>
      )}

      {/* Resumen adicional de productos por categoría.
          También solo para ADMIN / GESTOR. */}
      {canManageCategories && (
        <CategoryUsageSummary
          title="Productos por categoría"
          items={categoryUsageSummary}
          emptyMessage="No hay categorías ni productos disponibles."
        />
      )}

      {/* Texto introductorio visible para todos los usuarios autenticados */}
      <p className="my-products-section-intro">
        Explora las distintas categorías de productos, sus características y la tasa de comisión asociada a cada una:
      </p>

      {/* Área de búsqueda/filtros/orden.
      El SearchBar es reutilizable y aquí recibe el estado y setters de esta página. */}
      <div className="search-filter-area categories-search-filter-area">
        {/* Renderizo SearchBar pasándole por props el estado y los setters que controla la página padre */}
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
          // Para clientes oculto el filtro por activas/inactivas
          showFilter={canManageCategories} // Si es true el hijo renderiza bloque de filtro y si es false no
        />
      </div>

      {/* Si está cargando, muestro componente de carga */}
      {loading && <Loading />}

      {/* Si hay error general, muestro componente de error */}
      {error && <ErrorMessage message={error} />}

      {/* Mensaje de acción puntual, por ejemplo si no se puede borrar */}  
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

      {/* Solo muestro el contenido principal cuando ya no está cargando */}
      {!loading && (
        <>
          {/* Contador de resultados visibles */}
          <p className="results-count">
            Mostrando {filteredCategories.length} de {visibleCategories.length} categorías.
          </p>

          {/* Grid de tarjetas */}
          <div className="cards-grid">
            {/* Si no hay resultados, muestro estado vacío */}
            {filteredCategories.length === 0 ? (
              <p className="empty-message">No se encontraron categorías.</p>
            ) : (
              // Si sí hay resultados, renderizo solo los de la página actual
              currentData.map(category => (
                <div key={category.id} className="category-card-item">
                  {/* Tarjeta de categoría.
                      El prop showStatus decide si enseña la pastilla ACTIVA/INACTIVA */}
                  <CategoryCard
                    category={category}
                    showStatus={canManageCategories}
                  />

                  {/* Acciones de gestión solo para ADMIN / GESTOR */}
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
                         {/* Si esta categoría es la que se está borrando, cambio el texto */}
                        {deletingCategoryId === category.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          {/* Paginación final */}
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