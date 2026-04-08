import React from 'react';
import type { Category } from '../types/Category';
import './CategoryCard.css';
import { TagIcon } from './Icons';

interface CategoryCardProps {
  category: Category;
  canManage?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, canManage = false }) => {
  const formattedDate = new Date(category.fechaCreacion).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

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

      <p className="card-description">{category.descripcion}</p>

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

      {canManage && (
        <div className="category-card-actions">
          <button type="button" className="category-manage-btn">
            Editar
          </button>
          <button type="button" className="category-delete-btn">
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
};