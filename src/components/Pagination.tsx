import React from 'react';
import './Pagination.css';

interface PaginationProps { // Props que nos llegan del padre Home.tsx
  currentPage: number;
  totalPages: number;
  onNext: () => void;
  onPrev: () => void;
}

export const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onNext, 
  onPrev 
}) => {
  
  // Si no hay páginas o solo hay 1, no mostramos nada
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-container">
      <button 
        className="pagination-btn" 
        onClick={onPrev} 
        disabled={currentPage === 1}
      >
        Anterior
      </button>

      <span className="pagination-info">
        Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
      </span>

      <button 
        className="pagination-btn" 
        onClick={onNext} 
        disabled={currentPage === totalPages}
      >
        Siguiente
      </button>
    </div>
  );
};

