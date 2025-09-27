import React from 'react';
import './footer.css'; // Importamos los estilos CSS

const Footer = () => {
  return (
    <footer className="footer">
      {/* Contenedor principal que centrará todo el contenido */}
      <div className="footer-container">
        
        {/* Sección de información de contacto */}
        <div className="contact-info">
          
          {/* Email */}
          <div className="contact-item">
            <span className="contact-label">Email:</span>
            <span className="contact-text">
              contacto@tuempresa.com<br>
              </br>
              contacto2@gmail.com
            </span>
          </div>

          {/* Dirección */}
          <div className="contact-item">
            <span className="contact-label">Dirección:</span>
            <span className="contact-text">
              Calle Principal 123, Ciudad de Guatemala, Guatemala
            </span>
          </div>

          {/* Teléfono */}
          <div className="contact-item">
            <span className="contact-label">Teléfono:</span>
            <span className="contact-text">
              +502 1234-5678<br>
              </br>
              +502 1234-7765
            </span>
          </div>

        </div>

        {/* Línea divisoria opcional */}
        <div className="footer-divider"></div>

        {/* Copyright */}
        <div className="footer-copyright">
          <p>&copy; {new Date().getFullYear()} Moltec S.A. Todos los derechos reservados.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
