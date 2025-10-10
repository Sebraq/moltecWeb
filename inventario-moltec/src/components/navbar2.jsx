import React, { useState, useEffect } from "react";
import "./navbar2.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

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
      <div className="pi-navbar">
        <img className="pi-navbar-logo" src="LogoMoltecV2.png" alt="logo moltec" />

        <nav>
          <ul className={`pi-navbar-links ${isMenuOpen ? 'pi-navbar-links--active' : ''}`}>
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

        <button
          className={`pi-navbar-hamburger ${isMenuOpen ? 'pi-navbar-hamburger--active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menú de navegación"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {isMenuOpen && (
        <div 
          className="pi-navbar-overlay"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;