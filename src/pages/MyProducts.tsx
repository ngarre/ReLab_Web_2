import { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { getProducts } from '../services/productService';
import type { Product } from '../types/Product';

export default function MyProducts() {
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
            Mostrando {myProducts.length} de {products.length} productos.
          </p>

          {myProducts.length === 0 ? (
            <p className="empty-message">
              Todavía no tienes productos publicados.
            </p>
          ) : (
            <div className="cards-grid">
              {myProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}