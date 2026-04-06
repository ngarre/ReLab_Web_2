import { useState } from "react"; 
import { Link } from "react-router-dom";
import { Navbar } from "./Navbar";
import { DarkModeToggle } from "./DarkModeToggle";
import { PersonIcon, HeartIcon, MenuIcon, CloseIcon } from "./Icons"; 
import logo from "../assets/images/Logo1.png";
import "./Header.css";

export function Header() {
  // Estado para controlar el menú móvil: false es menú cerrado y true menú visible
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Al cargar web por primera vez estará cerrado

  // Abre y cierra el menú, se utiliza en el botón hamburguesa de movil 
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Definición de la función closeMenu
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="app-header">
      <div className="app-header-inner">
        
        {/* IZQUIERDA: LOGO */}
        <div className="header-left">
          <Link to="/" onClick={closeMenu}> {/* Se llama a la función que cierra el menú al clicar en el Logo */}
            <img src={logo} alt="ReLab logo" className="app-logo" />
          </Link>
        </div>

        {/* CENTRO: NAVBAR (Menú desplegable en móvil) */}
        <div className={`header-center ${isMenuOpen ? 'open' : ''}`}>
          {/* Aquí se pasa la prop onLinkClick */}
          <Navbar onLinkClick={closeMenu} /> {/* Se llama a la función que cierra el menú al clicar en cualquier enlace del NavBar */}
        </div>

        {/* DERECHA: ICONOS DE ACCIÓN */}
        <div className="header-right user-actions">
          
          {/* Icono Favoritos (Oculto en móvil) */}
          <Link to="/favorites" className="icon-action hide-on-mobile" aria-label="Ver Favoritos">
            <HeartIcon size={20} />
          </Link>

          {/* Icono Perfil (Oculto en móvil) */}
          <Link to="/profile" className="icon-action hide-on-mobile" aria-label="Ir al Perfil">
            <PersonIcon size={22} />
          </Link>

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