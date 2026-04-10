import React from 'react';
import { NavLink } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from '../hooks/useAuth';

interface NavbarProps {
  onLinkClick?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLinkClick, onLogout }) => {
  const { isAuthenticated, role } = useAuth();

  const isClient = role === 'CLIENTE';
  const canSeeManagement = role === 'ADMIN' || role === 'GESTOR';

  return (
    <nav className="nav-links">
      {isAuthenticated && isClient && (
        <>
          <NavLink to="/" end onClick={onLinkClick}>
            Inicio
          </NavLink>

          <NavLink to="/categories" onClick={onLinkClick}>
            Categorías
          </NavLink>

          <NavLink to="/my-products" onClick={onLinkClick}>
            Mis productos
          </NavLink>
        </>
      )}

      {isAuthenticated && canSeeManagement && (
        <>
          <NavLink to="/management/products" onClick={onLinkClick}>
            Productos
          </NavLink>

          <NavLink to="/categories" onClick={onLinkClick}>
            Categorías
          </NavLink>

          <NavLink to="/users" onClick={onLinkClick}>
            Usuarios
          </NavLink>
        </>
      )}

      {!isAuthenticated && (
        <>
          <NavLink to="/login" className="mobile-only-link" onClick={onLinkClick}>
            Iniciar sesión
          </NavLink>

          <NavLink to="/register" className="mobile-only-link" onClick={onLinkClick}>
            Registrarse
          </NavLink>
        </>
      )}

      {isAuthenticated && (
        <>
          <NavLink to="/profile" className="mobile-only-link" onClick={onLinkClick}>
            Perfil
          </NavLink>

          <button
            type="button"
            className="mobile-only-link mobile-only-link-button"
            onClick={onLogout}
          >
            Cerrar sesión
          </button>
        </>
      )}
    </nav>
  );
};