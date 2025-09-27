import React from "react";
import "./info2.css";

const Info = () => {
  return (
    <div>
      {/* Quienes Somos*/}
      <section id="quienes" className="seccion quienes">
        <h1 className="section-title">¿QUIÉNES SOMOS?</h1>
        <p>
          En Constructora Moltec S.A. somos una empresa dedicada a brindar
          soluciones integrales en construcción, remodelación y acabados.
          Contamos con un equipo de profesionales que nos permite desarrollar
          proyectos comerciales, residenciales, corporativos e industriales con
          altos estándares de calidad. Ofrecemos modalidades flexibles como
          llave en mano, administración y Project Management, siempre con un
          enfoque en la innovación, la eficiencia y la satisfacción de nuestros
          clientes.
        </p>
      </section>

      {/* Misión y Visión */}
      <section id="mision-vision" className="seccion mision-vision">
        <div className="mision-vision-container">
          <div className="card" id="mision">
            <h2 className="section-title2">MISIÓN</h2>
            <p>
              Ofrecer soluciones integrales en construcción, remodelación y
              mantenimiento, superando las expectativas de nuestros clientes a
              través de altos estándares de calidad, innovación continua y un
              equipo humano altamente comprometido. Nos diferenciamos por el
              cumplimiento puntual, la eficiencia en la resolución de desafíos y
              la creación de valor sostenible, guiados por una comunicación
              efectiva, honestidad y un profundo respeto por el entorno.
            </p>
          </div>
          <div className="card" id="vision">
            <h2 className="section-title2">VISIÓN</h2>
            <p>
              Ser la empresa referente en Guatemala y Centroamérica en proyectos
              de construcción y renovación, destacando por nuestra excelencia
              operativa, compromiso ambiental y enfoque humano, así como por la
              innovación en sus procesos constructivos. Aspiramos a liderar el
              sector mediante prácticas sostenibles, fortaleciendo la seguridad,
              la responsabilidad social y los valores dentro y fuera de la
              organización.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Info;
