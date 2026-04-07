import { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';
import { useAuth } from '../hooks/useAuth';
import { deleteProduct, getProducts } from '../services/productService';
import type { Product } from '../types/Product';
import './MyProducts.css';

export default function MyProducts() {
  const { user, token } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('nombre');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterKey, setFilterKey] = useState('all');

  const sortOptions = [
    { key: 'nombre', label: 'Nombre (A-Z)' },
    { key: 'fechaActualizacion', label: 'Fecha' },
    { key: 'precio', label: 'Precio' },
  ];

  const filterOptions = [
    { key: 'all', label: 'Todos mis productos' },
    { key: 'active', label: 'Solo activos' },
    { key: 'inactive', label: 'Solo inactivos' },
  ];

  useEffect(() => {
    setLoading(true);
    setError('');

    getProducts()
      .then((data) => setProducts(data))
      .catch(() => setError('No se pudieron cargar tus productos.'))
      .finally(() => setLoading(false));
  }, []);

  const myProducts = useMemo(() => {
    if (!user) {
      return [];
    }

    return products.filter(
      (product) => product.usuario?.id === user.id
    );
  }, [products, user]);

  const filteredProducts = useMemo(() => {
    let result = [...myProducts];

    if (searchTerm) {
      const termLower = searchTerm.toLowerCase();
      result = result.filter((product) =>
        product.nombre.toLowerCase().includes(termLower) ||
        product.descripcion.toLowerCase().includes(termLower)
      );
    }

    if (filterKey === 'active') {
      result = result.filter((product) => product.activo);
    } else if (filterKey === 'inactive') {
      result = result.filter((product) => !product.activo);
    }

    result.sort((a, b) => {
      let comparison = 0;

      const aValue = a[sortKey as keyof Product];
      const bValue = b[sortKey as keyof Product];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const valA = typeof aValue === 'string' ? aValue.toLowerCase().trim() : aValue;
      const valB = typeof bValue === 'string' ? bValue.toLowerCase().trim() : bValue;

      if (valA > valB) comparison = 1;
      else if (valA < valB) comparison = -1;

      return sortDirection === 'asc' ? comparison : comparison * -1;
    });

    return result;
  }, [myProducts, searchTerm, sortKey, sortDirection, filterKey]);

  const {
    currentPage,
    totalPages,
    currentData,
    nextPage,
    prevPage
  } = usePagination(filteredProducts, 6);

  const handleDelete = async (productId: number) => {
    if (!token) {
      setError('No hay sesión activa para eliminar productos.');
      return;
    }

    const confirmed = window.confirm('¿Seguro que quieres eliminar este producto?');

    if (!confirmed) {
      return;
    }

    setDeletingProductId(productId);
    setError('');

    try {
      await deleteProduct(productId, token);
      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== productId)
      );
    } catch {
      setError('No se pudo eliminar el producto.');
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <main className="main-content-area">
      <h1 className="page-title">Mis Productos</h1>
      <div className="page-title-separator"></div>

      <p className="page-subtitle">
        Aquí podrás ver y gestionar los productos asociados a tu cuenta.
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

      {!loading && !error && (
        <>
          <p className="results-count">
            Mostrando {filteredProducts.length} de {myProducts.length} productos tuyos.
          </p>

          {filteredProducts.length === 0 ? (
            <p className="empty-message">
              No se encontraron productos con los filtros actuales.
            </p>
          ) : (
            <>
              <div className="cards-grid">
                {currentData.map((product) => (
                  <div key={product.id} className="my-product-card-item">
                    <ProductCard product={product} />

                    <div className="my-product-actions">
                      <button
                        type="button"
                        className="delete-product-btn"
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingProductId === product.id}
                      >
                        {deletingProductId === product.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onNext={nextPage}
                onPrev={prevPage}
              />
            </>
          )}
        </>
      )}
    </main>
  );
}