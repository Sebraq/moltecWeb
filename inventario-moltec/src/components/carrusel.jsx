import React, { useState, useEffect } from "react";
import "./carrusel.css";

const images = [
  "/image1.jpg",
  "/image2.jpg",
  "/Prueba.webp",
  "/pruebba.jpg",
  "/400px.jpg",
];

const ImageCarousel = () => {
  const [current, setCurrent] = useState(0);

  // Auto-cambio de imagen cada 5 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="carousel">
      {/* Imágenes */}
      {images.map((img, index) => (
        <img
          key={index}
          src={img}
          alt={`Slide ${index}`}
          className={index === current ? "active" : ""}
        />
      ))}
      
      {/* Dots/Indicadores */}
      <div className="dots">
        {images.map((_, index) => (
          <span
            key={index}
            className={index === current ? "dot active" : "dot"}
            onClick={() => setCurrent(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;