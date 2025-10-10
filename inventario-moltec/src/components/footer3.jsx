/* ============================================
   COMPONENTE FOOTER - MOLTEC S.A.
   Pie de página con información de contacto y redes sociales
   ============================================ */

import React from 'react';
import './footer3.css';

/**
 * Componente Footer
 * 
 * Pie de página del sitio web que muestra:
 * - Información de contacto (Email, Dirección, Teléfono, WhatsApp)
 * - Enlaces a redes sociales (Instagram, Facebook)
 * - Copyright con año dinámico
 * 
 * Características:
 * - Totalmente responsive
 * - Iconos con efectos hover
 * - Enlaces externos con seguridad (rel="noopener noreferrer")
 * - Accesible con atributos aria-label
 * 
 * @component
 * @returns {JSX.Element} Footer del sitio web
 */
const Footer = () => {
  return (
    <footer className="moltec-footer">
      {/* ============================================
          CONTENEDOR PRINCIPAL
          Centra todo el contenido del footer
          ============================================ */}
      <div className="moltec-footer-container">
        
        {/* ============================================
            SECCIÓN DE INFORMACIÓN DE CONTACTO
            Muestra email, dirección, teléfono y WhatsApp
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
              +502 2212-4880<br />
              {/* +502 1234-7765 - Comentado por si se necesita en el futuro */}
            </span>
          </div>

          {/* WHATSAPP */}
          <div className="moltec-contact-item">
            <span className="moltec-contact-label">WhatsApp:</span>
            <span className="moltec-contact-text">
              +502 4216-4631
            </span>
          </div>

        </div>

        {/* ============================================
            LÍNEA DIVISORIA
            Separa la información de contacto de las redes sociales
            ============================================ */}
        <div className="moltec-footer-divider"></div>

        {/* ============================================
            SECCIÓN DE REDES SOCIALES
            Enlaces a Instagram y Facebook
            ============================================ */}
        <div className="moltec-social-media">
          {/* Etiqueta "Síguenos en:" */}
          <span className="moltec-social-label">Síguenos en:</span>
          
          {/* Contenedor de iconos */}
          <div className="moltec-social-icons">
            
            {/* ============================================
                INSTAGRAM
                Enlace a perfil de Instagram de MOLTEC
                ============================================ */}
            <a 
              href="https://www.instagram.com/constructora.moltec/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="moltec-social-link"
              aria-label="Síguenos en Instagram"
            >
              {/* Contenedor del icono de Instagram */}
              <div className="moltec-social-icon instagram">
                <img 
                  src="/Instagram_icon.png" 
                  alt="Instagram" 
                  className="moltec-social-image"
                />
              </div>
              {/* Texto "Instagram" */}
              <span>Instagram</span>
            </a>

            {/* ============================================
                FACEBOOK
                Enlace a perfil de Facebook de MOLTEC
                ============================================ */}
            <a 
              href="https://www.facebook.com/profile.php?id=100064695862060" 
              target="_blank" 
              rel="noopener noreferrer"
              className="moltec-social-link"
              aria-label="Síguenos en Facebook"
            >
              {/* Contenedor del icono de Facebook */}
              <div className="moltec-social-icon facebook">
                <img 
                  src="/Facebook_logo.png" 
                  alt="Facebook" 
                  className="moltec-social-image"
                />
              </div>
              {/* Texto "Facebook" */}
              <span>Facebook</span>
            </a>

          </div>
        </div>

        {/* ============================================
            LÍNEA DIVISORIA
            Separa las redes sociales del copyright
            ============================================ */}
        <div className="moltec-footer-divider"></div>

        {/* ============================================
            SECCIÓN DE COPYRIGHT
            Muestra el año actual dinámicamente
            ============================================ */}
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

/* ============================================
   NOTAS IMPORTANTES PARA EL DESARROLLADOR
   ============================================

   1. CLASES CSS ENCAPSULADAS:
      - Todas las clases comienzan con "moltec-" para evitar conflictos
      - No usa selectores genéricos como "footer", "span", "a"
      - Totalmente compatible con el sistema de gestión

   2. ESTRUCTURA:
      - Información de contacto en 4 columnas (email, dirección, teléfono, WhatsApp)
      - Responsive: se convierte en una columna en móviles
      - Redes sociales con iconos y texto

   3. ACCESIBILIDAD:
      - target="_blank" para abrir en nueva pestaña
      - rel="noopener noreferrer" para seguridad
      - aria-label en enlaces de redes sociales
      - alt text en imágenes

   4. RESPONSIVE:
      - 768px: Información de contacto en columna
      - 480px: Ajustes adicionales de tamaño
      - Totalmente adaptable a móviles

   5. ICONOS:
      - /Instagram_icon.png - Icono de Instagram
      - /Facebook_logo.png - Icono de Facebook
      - Ubicados en la carpeta public del proyecto

   6. COPYRIGHT DINÁMICO:
      - new Date().getFullYear() obtiene el año actual automáticamente
      - Se actualiza cada año sin necesidad de modificar código

   7. EFECTOS HOVER:
      - Los enlaces de redes sociales se levantan al pasar el mouse
      - Los iconos se agrandan ligeramente
      - El brillo aumenta en las imágenes

   ============================================ */