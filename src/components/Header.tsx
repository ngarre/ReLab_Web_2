import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "./Navbar";
import { DarkModeToggle } from "./DarkModeToggle";
import { PersonIcon, HeartIcon, MenuIcon, CloseIcon } from "./Icons";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/images/Logo1.png";
import "./Header.css";

export function Header() {
  // Estado para controlar el menú móvil: false es menú cerrado y true menú visible
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  // Abre y cierra el menú, se utiliza en el botón hamburguesa de movil
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Definición de la función closeMenu
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  return (
    <header className="app-header">
      <div className="app-header-inner">
        
        {/* IZQUIERDA: LOGO */}
        <div className="header-left">
          <Link to="/" onClick={closeMenu}>
            <img src={logo} alt="ReLab logo" className="app-logo" />
          </Link>
        </div>

        {/* CENTRO: NAVBAR (Menú desplegable en móvil) */}
        <div className={`header-center ${isMenuOpen ? 'open' : ''}`}>
          <Navbar onLinkClick={closeMenu} />
        </div>

        {/* DERECHA: ICONOS DE ACCIÓN */}
        <div className="header-right user-actions">
          
          {/* Icono Favoritos (Oculto en móvil) */}
          <Link to="/favorites" className="icon-action hide-on-mobile" aria-label="Ver Favoritos">
            <HeartIcon size={20} />
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/profile" className="icon-action hide-on-mobile" aria-label="Ir al Perfil">
                <PersonIcon size={22} />
              </Link>

              <button
                type="button"
                className="logout-btn hide-on-mobile"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link to="/login" className="icon-action hide-on-mobile" aria-label="Ir al Login">
              <PersonIcon size={22} />
            </Link>
          )}

          <div className="action-divider hide-on-mobile"></div>

          <DarkModeToggle />

          {/* Botón Hamburguesa (Visible solo en móvil) */}
          <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Menú">
            {isMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </button>
          
        </div>

      </div>
    </header>
  );
}