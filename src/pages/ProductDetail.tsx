import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAPI } from '../utils/api';
import type { Product } from '../types/Product';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import PlaceholderImage from '../assets/images/placeholder-default.jpg';
import './ProductDetail.css';

export default function ProductDetail() {

  const { id } = useParams<{ id: string }>(); // Obtener el ID del producto de la URL

  const [product, setProduct] = useState<Product | null>(null); // Para guardar los datos cuando lleguen (nombre, precio, etc.).
  const [loading, setLoading] = useState(true); // Empieza en true, mostrando texto de carga
  const [error, setError] = useState(''); // error por si el servidor cae o producto no existe (por defecto: no se muestra)

  // Lógica para obtener los datos
  useEffect(() => {
    setLoading(true);
    fetchAPI<Product>(`productos/${id!}`) // 1. Llama a la API (Pongo ! porque seguro que le paso el id)
      .then((data) => {
        setProduct(data); // 2. Si todo va bien, guarda los datos
      })
      .catch(() => {
        setError(`No se pudo cargar el detalle del producto con ID: ${id}.`); // 3. Si algo falla, guarda el error
      })
      .finally(() => setLoading(false)); // 4. Pase lo que pase, apaga el "Cargando..."
  }, [id]); // Si el id de la URL cambia, se vuelve a ejecutar toda la llamada para traer de nuevo el producto

  
  // Control de errores de la imagen
  const [imageError, setImageError] = useState(false);
  const handleImageError = () => {
    setImageError(true);
  };
  const imageUrl = product?.imagenUrl && !imageError
    ? `http://localhost:8080${product.imagenUrl}` //Si tengo ruta de imagen y no hay errores cargo la imagen de la URL
    : PlaceholderImage; // De lo contrario la que tengo sustituta

 

  if (loading) {
    return <Loading />;
  }
  if (error || !product) {
    return <ErrorMessage message={error || "Producto no encontrado."} />;
  }

  // Formateos precio y fecha:
  const formattedPrice = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(product.precio); // precio
  
  const lastUpdated = new Date(product.fechaActualizacion).toLocaleDateString('es-ES'); // fecha



  //  Renderizado de la vista de detalle
  return (
    <main className="main-content-area product-detail-container">

      <section className="detail-layout">

        {/* Columna de Imagen */}
        <div className="detail-image-wrapper">
          <img
            src={imageUrl}
            alt={product.nombre}
            className="detail-product-image"
            onError={handleImageError}
          />
          {!product.activo && <div className="detail-inactive-badge">PRODUCTO NO ACTIVO</div>}
        </div>

        {/* Columna de Detalles */}
        <div className="detail-info-wrapper">
          <h1 className="detail-title">{product.nombre}</h1>

          {/* Precio y Metadatos Clave */}
          <div className="detail-header-metadata">
            <p className="detail-price">
              <strong>{formattedPrice}</strong>
            </p>
            <span className="detail-category-tag">{product.categoria?.nombre || "General"}</span>
          </div>

          <p className="detail-description">{product.descripcion || "Descripción no disponible."}</p>

          <hr className="detail-separator" />

          {/* Información del Vendedor y Fecha */}
          <div className="detail-secondary-info">
            <p><strong>Vendido por:</strong> {product.usuario?.nickname || 'Usuario desconocido'}</p>
            <p><strong>Estado:</strong> {product.activo ? 'Disponible' : 'No disponible (Inactivo)'}</p>
            <p><strong>Última actualización:</strong> {lastUpdated}</p>
          </div>

          {/* GRUPO DE BOTONES DE ACCIÓN */}
          <div className="detail-actions-group">
            <button className="detail-action-button primary-action">Contactar Vendedor</button>
            <button className="detail-action-button secondary-action">Añadir a Favoritos</button>
          </div>
        </div>
      </section>
    </main>
  );
}