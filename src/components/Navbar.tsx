import React from 'react'; 
import { NavLink } from "react-router-dom";
import "./Navbar.css";
import { PersonIcon, HeartIcon } from "./Icons"; 

// Definimos la "forma" de las piezas que este componente puede recibir (Props)
interface NavbarProps {
  // Una función opcional (Es lo que indica -->?) que se ejecutará al hacer clic (para cerrar menú de hamburguesa en móviles)
  onLinkClick?: () => void; // Acepto una función que no recibe nada ni devuelve nada del padre (Header)
}

export const Navbar: React.FC<NavbarProps> = ({ onLinkClick }) => {
  return (
    <nav className="nav-links" onClick={onLinkClick}> 
      
      <NavLink to="/" end>Inicio</NavLink>  {/* Pongo el atributo "end" porque sino el "Inicio" saldría marcado siempre, ya que todas las rutas empiezan por "/"" */}
      <NavLink to="/users">Usuarios</NavLink>
      <NavLink to="/categories">Categorías</NavLink>

      <NavLink to="/favorites" className="mobile-only-link">
        <HeartIcon size={18} className="link-icon" /> Favoritos
      </NavLink>
      <NavLink to="/profile" className="mobile-only-link">
        <PersonIcon size={20} className="link-icon" /> Perfil de Usuario
      </NavLink>
      
    </nav>
  );
};



