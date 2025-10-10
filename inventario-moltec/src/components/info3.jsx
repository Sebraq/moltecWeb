/* ============================================
   COMPONENTE INFO2 - MOLTEC S.A.
   Muestra "Quiénes Somos", "Misión" y "Visión"
   ============================================ */

import React from "react";
import "./info3.css";

const Info2 = () => {
  return (
    <div className="info-container">
      {/* ============================================
          SECCIÓN: QUIÉNES SOMOS
          Descripción de la historia y servicios de MOLTEC
          ============================================ */}
      <section id="quienes" className="info-quienes-section">
        {/* Título principal */}
        <h1 className="info-quienes-title">¿QUIÉNES SOMOS?</h1>
        
        {/* Contenido de texto justificado */}
        <div className="info-quienes-content">
          <p>
            Nuestra historia comenzó en 2002 como "Constructora Motta", fundada
            por un ingeniero civil con la visión de atender un nicho poco
            explorado en el sector de la construcción. Iniciamos con obras civiles
            y trabajos especializados en geosintéticos, creciendo gracias al
            trabajo bien hecho y las recomendaciones de nuestros clientes.
          </p>
          <br />
          <p>
            A lo largo de los años hemos evolucionado constantemente, ampliando
            nuestros servicios y adoptando prácticas sostenibles con compromiso
            ambiental y social. En 2013 nos formalizamos como Constructora MOLTEC
            S.A., expandiendo a más de 8 líneas de servicio especializadas.
          </p>
          <br />
          <p>
            Hoy somos especialistas en remodelaciones High End para sectores
            comerciales, residenciales y corporativos. Construimos desde cero
            residencias desde 100m² y bodegas industriales de hasta 1,000m²,
            ofreciendo servicios de llave en mano, administración, Project
            Management y asesorías de ingeniería. Contamos con una red de aliados
            especialistas que nos permite ofrecer soluciones integrales de alta
            calidad con capacidad operativa para ejecutar proyectos desde 20m²
            hasta 1,500m².
          </p>
        </div>
      </section>

      {/* ============================================
          SECCIÓN: MISIÓN Y VISIÓN
          Tarjetas lado a lado (desktop) o apiladas (móvil)
          ============================================ */}
      <section id="mision-vision" className="info-mision-vision-section">
        <div className="info-mision-vision-container">
          
          {/* TARJETA: MISIÓN */}
          <div className="info-card" id="mision">
            <h2 className="info-card-title">MISIÓN</h2>
            <p>
              Brindamos soluciones integrales en construcción, remodelación y
              mantenimiento, superando expectativas mediante calidad, innovación
              y un equipo comprometido. Nos destacamos por cumplir plazos,
              resolver con eficiencia y generar valor sostenible, con
              comunicación, honestidad y respeto por el entorno como pilares
              fundamentales.
            </p>
          </div>

          {/* TARJETA: VISIÓN */}
          <div className="info-card" id="vision">
            <h2 className="info-card-title">VISIÓN</h2>
            <p>
              Ser la empresa referente en Guatemala y Centroamérica en proyectos
              de construcción y renovación, destacando por nuestra excelencia
              operativa, compromiso ambiental y enfoque humano y la innovación
              en sus procesos constructivos. Aspiramos a liderar el sector
              mediante prácticas sostenibles, fortaleciendo la seguridad, la
              responsabilidad social y los valores dentro y fuera de la
              organización.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Info2;