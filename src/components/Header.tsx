import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "./Navbar";
import { DarkModeToggle } from "./DarkModeToggle";
import { MenuIcon, CloseIcon } from "./Icons";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/images/Logo1.png";
import "./Header.css";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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
        <div className="header-left">
          <Link to="/" onClick={closeMenu}>
            <img src={logo} alt="ReLab logo" className="app-logo" />
          </Link>
        </div>

        <div className={`header-center ${isMenuOpen ? 'open' : ''}`}>
          <Navbar onLinkClick={closeMenu} onLogout={handleLogout} />
        </div>

        <div className="header-right user-actions">
          {isAuthenticated ? (
            <div className="header-session-actions hide-on-mobile">
              <Link
                to="/profile"
                className="header-action-link"
              >
                Perfil
              </Link>

              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>

              <div className="action-divider"></div>
            </div>
          ) : (
            <div className="header-session-actions hide-on-mobile">
              <Link to="/login" className="header-auth-link">
                Iniciar sesión
              </Link>

              <Link to="/register" className="header-auth-link">
                Registrarse
              </Link>

              <div className="action-divider"></div>
            </div>
          )}

          <DarkModeToggle />

          <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Menú">
            {isMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}