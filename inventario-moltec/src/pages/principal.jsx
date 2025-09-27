import React, { useState } from "react";
//import "../styles/global.css";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/navbar";
import Carrusel from "../components/carrusel";
import Footer from "../components/footer";
import Footer2 from "../components/footer2";
import Info2 from "../components/info2";
import Ubicacion from "../components/ubicacion";
import Service from "../components/servicios";
import Contacto from "../components/contacto"
import Portafolio from "../components/portafolio";
// Main App component
function Principal() {
  return (
    <div>
      <Navbar />
      <Carrusel />
      <Info2 />
      <Service />
      <Portafolio/>
      <Ubicacion />
      <Contacto/>
      {/* <Footer /> */}
      <Footer2 />
    </div>
  );
}

export default Principal;
