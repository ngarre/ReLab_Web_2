import { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
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

      {loading && <Loading />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && (
        <>
          <p className="results-count">
            Mostrando {myProducts.length} productos tuyos.
          </p>

          {myProducts.length === 0 ? (
            <p className="empty-message">
              Todavía no tienes productos publicados.
            </p>
          ) : (
            <div className="my-products-grid">
              {myProducts.map((product) => (
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
          )}
        </>
      )}
    </main>
  );
}