
// ServiceGrid.jsx
import React from "react";
import "./servicios.css";

const services = [
  { img: "subcontratos.png", title: "CONSTRUCCIÓN" },
  { img: "remodelacion.png", title: "REMODELACIONES" },
  { img: "expandir.png", title: "AMPLIACIONES" },
  { img: "diseno.png", title: "DISEÑO" },
  { img: "consulta.png", title: "ASESORÍA" },
];

const ServiceGrid = () => {
  return (
    <div>
      <section id="servicios">
        <h1 className="section-title">SERVICIOS</h1>
        <div className="service-grid">
          {services.map((service, idx) => (
            <div className="service-item" key={idx}>
              <div className="service-icon">
                <img src={service.img} alt={service.title} />
              </div>
              <p className="service-title">{service.title}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ServiceGrid;

