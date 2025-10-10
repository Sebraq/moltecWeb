/* ============================================
   COMPONENTE FOOTER - MOLTEC S.A.
   Pie de página con información de contacto y redes sociales
   ============================================ */

import React from 'react';
import './footer3.css';

const Footer = () => {
  return (
    <footer className="moltec-footer">
      <div className="moltec-footer-container">
        
        {/* ============================================
            SECCIÓN DE INFORMACIÓN DE CONTACTO
            Ahora SIN WhatsApp (se movió a redes sociales)
            ============================================ */}
        <div className="moltec-contact-info">
          
          {/* EMAIL */}
          <div className="moltec-contact-item">
            <span className="moltec-contact-label">Email:</span>
            <span className="moltec-contact-text">
              admin@grupomolet.info<br />
              ingenieriamoltec@grupomolet.info
            </span>
          </div>

          {/* DIRECCIÓN */}
          <div className="moltec-contact-item">
            <span className="moltec-contact-label">Dirección:</span>
            <span className="moltec-contact-text">
              Zona 11, Ciudad de Guatemala, Guatemala
            </span>
          </div>

          {/* TELÉFONO */}
          <div className="moltec-contact-item">
            <span className="moltec-contact-label">Teléfono:</span>
            <span className="moltec-contact-text">
              +502 2212-4880
            </span>
          </div>

        </div>

        {/* LÍNEA DIVISORIA */}
        <div className="moltec-footer-divider"></div>

        {/* ============================================
            SECCIÓN DE REDES SOCIALES
            AHORA con Instagram, Facebook Y WhatsApp
            ============================================ */}
        <div className="moltec-social-media">
          <span className="moltec-social-label">Síguenos en:</span>
          
          <div className="moltec-social-icons">
            
            {/* ============================================
                INSTAGRAM
                ============================================ */}
            <a 
              href="https://www.instagram.com/constructora.moltec/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="moltec-social-link"
              aria-label="Síguenos en Instagram"
            >
              <div className="moltec-social-icon instagram">
                <img 
                  src="/Instagram_icon.png" 
                  alt="Instagram" 
                  className="moltec-social-image"
                />
              </div>
              <span>Instagram</span>
            </a>

            {/* ============================================
                FACEBOOK
                ============================================ */}
            <a 
              href="https://www.facebook.com/profile.php?id=100064695862060" 
              target="_blank" 
              rel="noopener noreferrer"
              className="moltec-social-link"
              aria-label="Síguenos en Facebook"
            >
              <div className="moltec-social-icon facebook">
                <img 
                  src="/Facebook_logo.png" 
                  alt="Facebook" 
                  className="moltec-social-image"
                />
              </div>
              <span>Facebook</span>
            </a>

            {/* ============================================
                WHATSAPP - NUEVO ✨
                Abre chat directo con mensaje predefinido
                ============================================ */}
            <a 
              href="https://wa.me/50242164631?text=Hola%20Moltec,%20me%20gustaría%20obtener%20más%20información%20sobre%20sus%20servicios" 
              target="_blank" 
              rel="noopener noreferrer"
              className="moltec-social-link"
              aria-label="Contáctanos por WhatsApp"
            >
              <div className="moltec-social-icon whatsapp">
                <img 
                  src="/WhatsApp_icon.png" 
                  alt="WhatsApp" 
                  className="moltec-social-image"
                />
              </div>
              <span>WhatsApp</span>
            </a>

          </div>
        </div>

        {/* LÍNEA DIVISORIA */}
        <div className="moltec-footer-divider"></div>

        {/* COPYRIGHT */}
        <div className="moltec-footer-copyright">
          <p>
            &copy; {new Date().getFullYear()} Moltec S.A. Todos los derechos reservados.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;