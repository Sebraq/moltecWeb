import React, { useState, useEffect } from "react";
import "./navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Cerrar menú cuando se hace clic en un enlace
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  // Cerrar menú con ESC y prevenir scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Cerrar menú al redimensionar ventana
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  return (
    <>
      <div className="navbar">
        <img className="logo" src="LogoMoltecV2.png" alt="logo moltec" />
        
        <nav>
          <ul className={`nav__links ${isMenuOpen ? 'nav__links--active' : ''}`}>
            <li>
              <a href="#quienes" onClick={handleLinkClick}>¿QUIÉNES SOMOS?</a>
            </li>
            <li>
              <a href="#servicios" onClick={handleLinkClick}>SERVICIOS</a>
            </li>
            <li>
              <a href="#proyectos" onClick={handleLinkClick}>PROYECTOS</a>
            </li>
            <li>
              <a href="#ubi" onClick={handleLinkClick}>UBICACIÓN</a>
            </li>
            <li>
              <a href="#contacto" onClick={handleLinkClick}>CONTÁCTENOS</a>
            </li>
          </ul>
        </nav>

        {/* Botón hamburguesa - solo visible en móvil */}
        <button
          className={`hamburger ${isMenuOpen ? 'hamburger--active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menú de navegación"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Overlay para cerrar menú en móvil */}
      {isMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;