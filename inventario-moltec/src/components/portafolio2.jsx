/* ============================================
   COMPONENTE PORTAFOLIO - MOLTEC S.A.
   Carrusel de proyectos con galería de imágenes
   ============================================ */

import React, { useState, useEffect, useCallback } from "react";
import "./portafolio3.css";

/* ============================================
   DATOS DE PROYECTOS
   Agregar o modificar proyectos aquí
   ============================================ */
const projects = [
  {
    id: 1,
    title: "REMODELACIÓN COOPERATIVA ELGA - Escuintla",
    location: "Escuintla, Guatemala",
    description: "Remodelación integral de instalaciones cooperativas",
    images: [
      "/image3.jpg",
      "/image3.jpg",
      "/image3.jpg",
      "/image3.jpg",
    ],
  },
  {
    id: 2,
    title: "CONSTRUCCIÓN APARTAMENTOS GENOVIA - Guatemala",
    location: "Zona 10, Guatemala",
    description: "Desarrollo residencial de alta gama",
    images: [
      "/imagesPort/port1.jpg",
      "/imagesPort/port1.jpg",
      "/imagesPort/port1.jpg",
      "/imagesPort/port1.jpg",
    ],
  },
];

/* ============================================
   COMPONENTE PRINCIPAL
   ============================================ */
const Portafolio = () => {
  // Estados del componente
  const [proyectoActual, setProyectoActual] = useState(0);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [imagenModal, setImagenModal] = useState("");
  const [imagenCargando, setImagenCargando] = useState(true);

  // Proyecto actual
  const proyecto = projects[proyectoActual];

  /* ============================================
     FUNCIÓN: Navegar al proyecto anterior
     ============================================ */
  const proyectoAnterior = useCallback(() => {
    setProyectoActual((prev) => (prev === 0 ? projects.length - 1 : prev - 1));
  }, []);

  /* ============================================
     FUNCIÓN: Navegar al proyecto siguiente
     ============================================ */
  const proyectoSiguiente = useCallback(() => {
    setProyectoActual((prev) => (prev + 1) % projects.length);
  }, []);

  /* ============================================
     FUNCIÓN: Abrir imagen en modal
     ============================================ */
  const abrirModal = useCallback((imagen) => {
    setImagenModal(imagen);
    setModalAbierto(true);
    setImagenCargando(true);
    document.body.style.overflow = "hidden";
  }, []);

  /* ============================================
     FUNCIÓN: Cerrar modal
     ============================================ */
  const cerrarModal = useCallback(() => {
    setModalAbierto(false);
    setImagenModal("");
    setImagenCargando(false);
    document.body.style.overflow = "unset";
  }, []);

  /* ============================================
     EFECTO: Cerrar modal con tecla ESC
     ============================================ */
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && modalAbierto) {
        cerrarModal();
      }
    };

    if (modalAbierto) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [modalAbierto, cerrarModal]);

  /* ============================================
     EFECTO: Navegación con teclado (flechas)
     ============================================ */
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!modalAbierto) {
        if (e.key === "ArrowLeft") {
          proyectoAnterior();
        } else if (e.key === "ArrowRight") {
          proyectoSiguiente();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [modalAbierto, proyectoAnterior, proyectoSiguiente]);

  /* ============================================
     EFECTO: Cleanup al desmontar
     Asegurar que el scroll vuelva a la normalidad
     ============================================ */
  useEffect(() => {
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <section id="proyectos" className="portafolio-section">
      <div className="portafolio-container">
        {/* ============================================
            ENCABEZADO DE LA SECCIÓN
            ============================================ */}
        <div className="portafolio-header">
          <h2 className="portafolio-title">NUESTROS PROYECTOS</h2>
          <br></br><p className="portafolio-subtitle">
            Descubre la calidad y excelencia en cada uno de nuestros desarrollos
            constructivos
          </p>
        </div>

        {/* ============================================
            CARRUSEL DE PROYECTOS
            ============================================ */}
        <div className="portafolio-carousel">
          {/* Botón: Proyecto anterior */}
          <button
            className="portafolio-nav-btn portafolio-nav-prev"
            onClick={proyectoAnterior}
            aria-label="Proyecto anterior"
            disabled={projects.length <= 1}
          >
            &#8249;
          </button>

          {/* ============================================
              CONTENIDO DEL PROYECTO
              ============================================ */}
          <div className="portafolio-content">
            {/* Información del proyecto */}
            <div className="portafolio-info">
              <h3 className="portafolio-project-title">{proyecto.title}</h3>
              <p className="portafolio-location">
                <span className="portafolio-location-icon">📍</span>
                {proyecto.location}
              </p>
            </div>

            {/* Galería de imágenes del proyecto */}
            <div className="portafolio-gallery">
              {proyecto.images.map((imagen, index) => (
                <div
                  key={`${proyecto.id}-${index}`}
                  className="portafolio-image-wrapper"
                  onClick={() => abrirModal(imagen)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver imagen ${index + 1} de ${proyecto.title}`}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      abrirModal(imagen);
                    }
                  }}
                >
                  <img
                    src={imagen}
                    alt={`${proyecto.title} - Imagen ${index + 1}`}
                    className="portafolio-image"
                    loading="lazy"
                  />
                  <div className="portafolio-overlay" aria-hidden="true">
                    <span className="portafolio-zoom-icon">🔍</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botón: Proyecto siguiente */}
          <button
            className="portafolio-nav-btn portafolio-nav-next"
            onClick={proyectoSiguiente}
            aria-label="Proyecto siguiente"
            disabled={projects.length <= 1}
          >
            &#8250;
          </button>
        </div>

        {/* ============================================
            INDICADOR DE PROYECTOS (opcional)
            Muestra en qué proyecto estás
            ============================================ */}
        {projects.length > 1 && (
          <div
            style={{
              textAlign: "center",
              marginTop: "1rem",
              color: "#6c757d",
              fontSize: "0.9rem",
            }}
          >
            Proyecto {proyectoActual + 1} de {projects.length}
          </div>
        )}
      </div>

      {/* ============================================
          MODAL DE IMAGEN AMPLIADA
          ============================================ */}
      {modalAbierto && (
        <div
          className="portafolio-modal"
          onClick={cerrarModal}
          role="dialog"
          aria-modal="true"
          aria-label="Imagen ampliada del proyecto"
        >
          <div
            className="portafolio-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              className="portafolio-modal-close"
              onClick={cerrarModal}
              aria-label="Cerrar imagen ampliada"
            >
              ✕
            </button>

            {/* Indicador de carga */}
            {imagenCargando && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "#6c757d",
                }}
              >
                Cargando...
              </div>
            )}

            {/* Imagen ampliada */}
            <img
              src={imagenModal}
              alt="Imagen ampliada del proyecto"
              className="portafolio-modal-image"
              onLoad={() => setImagenCargando(false)}
              onError={() => {
                setImagenCargando(false);
                console.error("Error al cargar la imagen");
              }}
            />

            {/* Información del proyecto en el modal */}
            <div className="portafolio-modal-info">
              <h4>{proyecto.title}</h4>
              <p>{proyecto.location}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Portafolio;