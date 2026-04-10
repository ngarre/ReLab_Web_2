import React, { useState } from 'react';
import type { Category } from '../types/Category';
import './CategoryCard.css';
import { TagIcon } from './Icons';

interface CategoryCardProps {
  category: Category;
}

const DESCRIPTION_TOGGLE_THRESHOLD = 160;

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const formattedDate = new Date(category.fechaCreacion).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const normalizedDescription = category.descripcion?.trim() || 'Sin descripción disponible.';
  const canToggleDescription =
    !!category.descripcion && category.descripcion.trim().length > DESCRIPTION_TOGGLE_THRESHOLD;

  return (
    <div className="category-card">
      <div className="card-header">
        <div className="title-with-icon">
          <TagIcon className="category-icon" />
          <h2 className="card-title">{category.nombre}</h2>
        </div>

        <span className={`status-pill ${category.activa ? 'active' : 'inactive'}`}>
          {category.activa ? 'ACTIVA' : 'INACTIVA'}
        </span>
      </div>

      <p
        className={`card-description ${isDescriptionExpanded ? 'expanded' : ''
          }`}
      >
        {normalizedDescription}
      </p>

      {canToggleDescription && (
        <button
          type="button"
          className="category-description-toggle"
          onClick={() => setIsDescriptionExpanded((current) => !current)}
        >
          {isDescriptionExpanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}

      <div className="card-details">
        <div className="detail-item">
          <span className="detail-label">Comisión por Venta:</span>
          <span className="detail-value commission-value">{category.tasaComision}%</span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Creada el:</span>
          <span className="detail-value">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};