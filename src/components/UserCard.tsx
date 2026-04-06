import React from 'react';
import type { User } from '../types/User';
import { PersonIcon } from './Icons'; 
import './UserCard.css';

interface UserCardProps {
  user: User;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  // Formateo de fecha de alta
  const formattedDate = new Date(user.fechaAlta).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short', // Ej. ene, feb, mar ...
    day: 'numeric'
  });

  return (
    <div className="user-card">
      {/* CABECERA: Avatar y Nickname */}
      <div className="card-header">
        <div className="avatar-placeholder">
          <PersonIcon size={24} />
        </div>
        <div className="user-identity">
          <h2 className="user-nickname">@{user.nickname}</h2>
          {/* Insignia de Admin si corresponde */}
          {user.admin && <span className="admin-badge">ADMIN</span>}
        </div>
      </div>

      {/* CUERPO: Datos Personales */}
      <div className="card-body">
        <h3 className="user-fullname">{user.nombre} {user.apellido}</h3>
        <p className="user-email">{user.email}</p>
      </div>

      {/* DETALLES: Estado y Tipo */}
      <div className="card-details">
        <div className="detail-row">
            <span className={`status-pill ${user.cuentaActiva ? 'active' : 'inactive'}`}>
                {user.cuentaActiva ? 'ACTIVA' : 'INACTIVA'}
            </span>
            <span className="user-role">{user.tipoUsuario}</span>
        </div>
        
        <div className="detail-footer">
            <span className="detail-label">Registrado el:</span>
            <span className="detail-value">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};

