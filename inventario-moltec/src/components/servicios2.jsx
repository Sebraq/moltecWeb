/* ============================================
   COMPONENTE SERVICIOS - MOLTEC S.A.
   Grid de servicios con iconos circulares
   ============================================ */

import React from "react";
import "./servicios2.css";

/* ============================================
   CONFIGURACIÓN DE SERVICIOS
   Cada servicio tiene: imagen del icono y título
   ============================================ */
const services = [
  {
    id: 1,
    img: "subcontratos.png",
    title: "CONSTRUCCIÓN",
    description: "Obras civiles y proyectos desde cero",
  },
  {
    id: 2,
    img: "remodelacion.png",
    title: "REMODELACIONES",
    description: "Renovación de espacios residenciales y comerciales",
  },
  {
    id: 3,
    img: "expandir.png",
    title: "AMPLIACIONES",
    description: "Expansión de estructuras existentes",
  },
  {
    id: 4,
    img: "diseno.png",
    title: "DISEÑO",
    description: "Diseño arquitectónico y de interiores",
  },
  {
    id: 5,
    img: "consulta.png",
    title: "ASESORÍA",
    description: "Consultoría y asesoría en ingeniería",
  },
];

/* ============================================
   COMPONENTE PRINCIPAL
   ============================================ */
const ServiceGrid = () => {
  return (
    <div className="servicios-section">
      {/* ============================================
          SECCIÓN SERVICIOS
          Usa el id "servicios" para el scroll desde navbar
          ============================================ */}
      <section id="servicios">
        {/* Título principal */}
        <h1 className="servicios-title-main">SERVICIOS</h1>

        {/* ============================================
            GRID DE SERVICIOS
            Grid responsive que se adapta automáticamente
            ============================================ */}
        <div className="servicios-grid">
          {services.map((service) => (
            <div
              className="servicios-item"
              key={service.id}
              role="article"
              aria-label={`Servicio: ${service.title}`}
              tabIndex={0} // Permite navegación con teclado
            >
              {/* Icono circular con imagen */}
              <div className="servicios-icon" aria-hidden="true">
                <img
                  src={service.img}
                  alt={`Icono de ${service.title}`}
                  loading="lazy" // Carga perezosa para mejor rendimiento
                />
              </div>

              {/* Título del servicio */}
              <p className="servicios-title">{service.title}</p>

              {/* Descripción oculta para lectores de pantalla (opcional) */}
              <span className="sr-only">{service.description}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ServiceGrid;