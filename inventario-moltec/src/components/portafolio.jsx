import React, { useState } from "react";
import "./portafolio2.css";

// Tus datos exactos
const projects = [
  {
    id: 1,
    title: "REMODELACIÓN COOPERATIVA ELGA - Escuintla",
    location: "Escuintla, Guatemala",
    images: ["/image3.jpg", "/image3.jpg", "/image3.jpg", "/image3.jpg"]
  },
  {
    id: 2,
    title: "CONSTRUCCIÓN APARTAMENTOS GENOVIA - Guatemala",
    location: "Zona 10, Guatemala",
    images: ["/imagesPort/port1.jpg", "/imagesPort/port1.jpg", "/imagesPort/port1.jpg", "/imagesPort/port1.jpg"]
  }
];

const Portafolio = () => {
  const [proyectoActual, setProyectoActual] = useState(0);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [imagenModal, setImagenModal] = useState("");

  // Navegar entre proyectos
  const proyectoAnterior = () => {
    setProyectoActual(prev => 
      prev === 0 ? projects.length - 1 : prev - 1
    );
  };

  const proyectoSiguiente = () => {
    setProyectoActual(prev => 
      (prev + 1) % projects.length
    );
  };

  // Abrir imagen en modal
  const abrirModal = (imagen) => {
    setImagenModal(imagen);
    setModalAbierto(true);
    document.body.style.overflow = 'hidden';
  };

  // Cerrar modal
  const cerrarModal = () => {
    setModalAbierto(false);
    setImagenModal("");
    document.body.style.overflow = 'unset';
  };

  // Cerrar modal con ESC
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        cerrarModal();
      }
    };

    if (modalAbierto) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [modalAbierto]);

  const proyecto = projects[proyectoActual];

  return (
    <section id="proyectos" className="portfolioSection">
      <div className="container">
        
        {/* Encabezado de la sección */}
        <div className="sectionHeader">
          <h2 className="sectionTitle">NUESTROS PROYECTOS</h2>
          <p className="sectionSubtitle">
            Descubre la calidad y excelencia en cada uno de nuestros desarrollos constructivos
          </p>
        </div>

        {/* Contenedor del carrusel */}
        <div className="carouselContainer">
          
          {/* Botón anterior */}
          <button 
            className="carouselBtn prevBtn"
            onClick={proyectoAnterior}
            aria-label="Proyecto anterior"
          >
            &#8249;
          </button>

          {/* Contenido del proyecto */}
          <div className="projectContent">
            
            {/* Información del proyecto */}
            <div className="projectInfo">
              <h3 className="projectTitle">{proyecto.title}</h3>
              <p className="projectLocation">
                <span>📍</span> {proyecto.location}
              </p>
            </div>

            {/* Galería de imágenes */}
            <div className="projectGallery">
              {proyecto.images.map((imagen, index) => (
                <div 
                  key={index}
                  className="imageContainer"
                  onClick={() => abrirModal(imagen)}
                >
                  <img 
                    src={imagen} 
                    alt={`${proyecto.title} - Imagen ${index + 1}`}
                    className="projectImage"
                    loading="lazy"
                  />
                  <div className="imageOverlay">
                    <span className="viewIcon">🔍</span>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Botón siguiente */}
          <button 
            className="carouselBtn nextBtn"
            onClick={proyectoSiguiente}
            aria-label="Proyecto siguiente"
          >
            &#8250;
          </button>

        </div>

      </div>

      {/* Modal de imagen */}
      {modalAbierto && (
        <div className="imageModal" onClick={cerrarModal}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <button 
              className="closeModal"
              onClick={cerrarModal}
              aria-label="Cerrar imagen"
            >
              ✕
            </button>
            <img 
              src={imagenModal} 
              alt="Imagen ampliada del proyecto"
              className="modalImage"
            />
            <div className="modalInfo">
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