import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Product } from '../types/Product';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import PlaceholderImage from '../assets/images/placeholder-default.jpg';
import { getProductById } from '../services/productService';
import { BASE_URL } from '../utils/api';
import { formatSpanishDate } from '../utils/date';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, role } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    getProductById(Number(id))
      .then((data) => {
        setProduct(data);
      })
      .catch(() => {
        setError(`No se pudo cargar el detalle del producto con ID: ${id}.`);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const imageUrl =
    product?.imagenUrl && !imageError
      ? `${BASE_URL}${product.imagenUrl}`
      : PlaceholderImage;

  if (loading) {
    return <Loading />;
  }

  if (error || !product) {
    return <ErrorMessage message={error || 'Producto no encontrado.'} />;
  }

  const isOwner = !!user && product.usuario?.id === user.id;
  const isAdminOrGestor = role === 'ADMIN' || role === 'GESTOR';
  const canViewInactiveProduct = product.activo || isOwner || isAdminOrGestor;

  if (!canViewInactiveProduct) {
    return <ErrorMessage message="No tienes permisos para ver este producto." />;
  }

  const formattedPrice = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(product.precio);

  const lastUpdated = formatSpanishDate(product.fechaActualizacion, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  
  return (
    <main className="main-content-area product-detail-container">
      <section className="detail-layout">
        <div className="detail-image-wrapper">
          <img
            src={imageUrl}
            alt={product.nombre}
            className="detail-product-image"
            onError={handleImageError}
          />
          {!product.activo && <div className="detail-inactive-badge">PRODUCTO NO ACTIVO</div>}
        </div>

        <div className="detail-info-wrapper">
          <h1 className="detail-title">{product.nombre}</h1>

          <div className="detail-header-metadata">
            <p className="detail-price">
              <strong>{formattedPrice}</strong>
            </p>
            <span className="detail-category-tag">{product.categoria?.nombre || "General"}</span>
          </div>

          <p className="detail-description">{product.descripcion || "Descripción no disponible."}</p>

          <hr className="detail-separator" />

          <div className="detail-secondary-info">
            <p><strong>Vendido por:</strong> {product.usuario?.nickname || 'Usuario desconocido'}</p>
            <p><strong>Estado:</strong> {product.activo ? 'Disponible' : 'No disponible (Inactivo)'}</p>
            <p><strong>Última actualización:</strong> {lastUpdated}</p>
          </div>

          <div className="detail-actions-group">
            <button className="detail-action-button primary-action">Contactar Vendedor</button>
            <button className="detail-action-button secondary-action">Añadir a Favoritos</button>
          </div>
        </div>
      </section>
    </main>
  );
}