import "./Footer.css";
import logo from "../assets/images/Logo2.png"; 
import { AppleIcon, AndroidIcon } from "./Icons";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        
        {/* --- SECCIÓN SUPERIOR: LOGO Y COLUMNAS --- */}
        <div className="footer-top">
          
          {/* 1. LOGO Y MARCA */}
          <div className="footer-brand-col">
            <Link to="/">
            <img src={logo} alt="ReLab Logo" className="footer-logo" />
            </Link>
            <p className="footer-copyright-text">
              © 2025 ReLab. <br />
              Todos los derechos reservados.
            </p>
          </div>

          {/* 2. COLUMNAS DE ENLACES */}
          <div className="footer-links-grid">
            
            {/* Columna 1 */}
            <div className="footer-column">
              <h4>ReLab</h4>
              <a href="/about">Quiénes somos</a>
              <a href="/how-it-works">Cómo funciona</a>
              <a href="/brand">Brand Book</a>
              <a href="/press">Prensa</a>
              <a href="/jobs">Empleo</a>
            </div>

            {/* Columna 2 */}
            <div className="footer-column">
              <h4>Soporte</h4>
              <a href="/help">Centro de ayuda</a>
              <a href="/rules">Normas de la comunidad</a>
              <a href="/safety">Consejos de seguridad</a>
            </div>

            {/* Columna 3 */}
            <div className="footer-column">
              <h4>Legal</h4>
              <a href="/legal">Aviso legal</a>
              <a href="/terms">Condiciones de uso</a>
              <a href="/privacy">Política de privacidad</a>
              <a href="/cookies">Cookies</a>
            </div>

            {/* Columna 4 */}
            <div className="footer-column">
              <h4>ReLab PRO</h4>
              <a href="/pro">Vender como empresa</a>
              <a href="/partners">Partners</a>
            </div>

          </div>
        </div>

        <div className="footer-bottom">
            <small>
              ReLab España S.L. - Mercado de material científico de segunda mano. NIF: B12345678. Dirección: Calle Falsa 123, Madrid, España.
            </small>
            
            <div className="footer-social">
              <a href="#" aria-label="Apple Store">
                <AppleIcon className="footer-store-icon" />
                Apple Store
              </a>
            
              <a href="#" aria-label="Google Play">
                <AndroidIcon className="footer-store-icon" />
                Google Play
              </a>
            </div>
        </div>

      </div>
    </footer>
  );
}