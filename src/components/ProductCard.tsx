import React, { useState } from 'react';
import type { Product } from '../types/Product';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';
import { getProductImageUrl } from '../utils/productImage';

// Definimos qué necesita este componente: un objeto de tipo Product
interface ProductCardProps {
  product: Product; // En la prop 'product', vendrá algo del tipo 'Product'
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {

  const navigate = useNavigate(); // Hook de navegación que viene de la libería externa "react-router-dom" (SPA)
  const [imageFailed, setImageFailed] = useState(false); // Estado local para saber si la imagen del servidor falló al cargar
  const handleClick = () => {
    navigate(`/products/${product.id}`); // Al hacer clic en la tarjeta, navegamos al detalle de ese producto usando su ID
  };

  // ----------- GESTIÓN DE IMÁGENES ---------------
  const imageUrl = getProductImageUrl(product.imagenUrl, imageFailed);

  // Esta función se dispara automáticamente si la etiqueta <img> no puede cargar la foto
  const handleImageError = () => {
    if (!imageFailed) {
      setImageFailed(true);
    }
  };
  // ---------------------------------------------------

  // Formateo el precio para que se vea bonito
  const formattedPrice = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(product.precio);


  return (
    <div
      // Siempre tiene 'product-card'. Si el producto NO está activo, le añade también la clase 'inactive'.
      className={`product-card ${!product.activo ? 'inactive' : ''}`}
      // Evento de clic: cuando el usuario pulsa en cualquier parte de la tarjeta, se ejecuta la navegación.
      onClick={handleClick}
    >
      <div className="card-image-container">
        <img
          src={imageUrl}
          alt={product.nombre} // Texto alternativo por accesibilidad (SEO y lectores de pantalla)
          className="product-image"
          onError={handleImageError}
        />
        {/* Renderizado condicional con el operador lógico &&:
        Si product.activo es falso, React dibuja el <span>. Si es verdadero, lo ignora. */}
        {!product.activo && <span className="inactive-badge">No Activo</span>}
      </div>

      <div className="card-details">
        <h3 className="card-title">{product.nombre}</h3>

        <div className="card-metadata">
          <p className="card-price">
            <strong>{formattedPrice}</strong>
          </p>
          <p>

            {/* Si product.categoria existe, busca .nombre. 
          Si algo de eso falla (es null/undefined), usa el texto "General" como respaldo. */}
            <span className="category-tag">{product.categoria?.nombre || "General"}</span>
          </p>
        </div>
        {/* Información del vendedor sacada del objeto usuario anidado en el producto */}
        <p className="card-seller">Vendido por: {product.usuario?.nickname}</p>
      </div>
    </div>
  );
};
