import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "./Navbar";
import { DarkModeToggle } from "./DarkModeToggle";
import { PersonIcon, HeartIcon, MenuIcon, CloseIcon } from "./Icons";
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
          <Navbar onLinkClick={closeMenu} />
        </div>

        <div className="header-right user-actions">
          {isAuthenticated ? (
            <>
              <Link to="/my-products" className="icon-action hide-on-mobile" aria-label="Ir a Mis productos">
                <HeartIcon size={20} />
              </Link>

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

              <div className="action-divider hide-on-mobile"></div>
            </>
          ) : (
            <>
              <Link to="/login" className="header-auth-link hide-on-mobile">
                Iniciar sesión
              </Link>

              <Link to="/register" className="header-auth-link hide-on-mobile">
                Registrarse
              </Link>

              <div className="action-divider hide-on-mobile"></div>
            </>
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