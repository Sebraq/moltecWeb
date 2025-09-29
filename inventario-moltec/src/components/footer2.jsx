import React from 'react';
import './footer2.css'; // Importamos los estilos CSS

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
              admin@grupomolet.info<br />
              ingenieriamoltec@grupomolet.info
            </span>
          </div>

          {/* Dirección */}
          <div className="contact-item">
            <span className="contact-label">Dirección:</span>
            <span className="contact-text">
              Zona 11, Ciudad de Guatemala, Guatemala
            </span>
          </div>

          {/* Teléfono */}
          <div className="contact-item">
            <span className="contact-label">Teléfono:</span>
            <span className="contact-text">
              +502 2212-4880<br />
              {/* +502 1234-7765 */}
            </span>
          </div>
           {/* WhatsApp */}
          <div className="contact-item">
            <span className="contact-label">WhatsApp:</span>
            <span className="contact-text">
              +502 4216-4631
            </span>
          </div>

        </div>

        {/* Línea divisoria */}
        <div className="footer-divider"></div>

        {/* Sección de redes sociales */}
        <div className="social-media">
          <span className="social-label">Síguenos en:</span>
          <div className="social-icons">
            
            {/* Instagram */}
            <a 
              href="https://www.instagram.com/constructora.moltec/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Síguenos en Instagram"
            >
              <div className="social-icon instagram">
                <img 
                  src="/Instagram_icon.png" 
                  alt="Instagram" 
                  className="social-image"
                />
              </div>
              <span>Instagram</span>
            </a>

            {/* Facebook */}
            <a 
              href="https://www.facebook.com/profile.php?id=100064695862060" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Síguenos en Facebook"
            >
              <div className="social-icon facebook">
                <img 
                  src="/Facebook_logo.png" 
                  alt="Facebook" 
                  className="social-image"
                />
              </div>
              <span>Facebook</span>
            </a>

          </div>
        </div>

        {/* Línea divisoria */}
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