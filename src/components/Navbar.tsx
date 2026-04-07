import React from 'react';
import { NavLink } from "react-router-dom";
import "./Navbar.css";
import { PersonIcon, HeartIcon } from "./Icons";
import { useAuth } from '../hooks/useAuth';

interface NavbarProps {
  onLinkClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLinkClick }) => {
  const { isAuthenticated, role } = useAuth();

  const canSeeUsers = role === 'ADMIN' || role === 'GESTOR';

  return (
    <nav className="nav-links" onClick={onLinkClick}>
      <NavLink to="/" end>
        Inicio
      </NavLink>

      {isAuthenticated && (
        <NavLink to="/categories">Categorías</NavLink>
      )}

      {isAuthenticated && canSeeUsers && (
        <NavLink to="/users">Usuarios</NavLink>
      )}

      {isAuthenticated && (
        <>
          <NavLink to="/my-products" className="mobile-only-link">
            <HeartIcon size={18} className="link-icon" /> Mis productos
          </NavLink>

          <NavLink to="/profile" className="mobile-only-link">
            <PersonIcon size={20} className="link-icon" /> Perfil de Usuario
          </NavLink>
        </>
      )}
    </nav>
  );
};