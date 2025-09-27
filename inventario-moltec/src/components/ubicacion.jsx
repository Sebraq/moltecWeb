import React from "react";
import "./ubicacion.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

/**
 * Componente Ubicacion - Muestra la ubicación de MOLTEC S.A.
 * 
 * Mapa responsive con Leaflet que se adapta a diferentes dispositivos.
 * Incluye marcador y popup con información de la empresa.
 * 
 * @component
 * @returns {JSX.Element} Sección de ubicación con mapa interactivo
 */
const Ubicacion = () => {
  // Coordenadas de MOLTEC S.A. en Ciudad de Guatemala
  const posicion = [14.601367, -90.563338];
  
  return (
    <div>
      <section id="ubi" className="ubicacion">
        
        {/* Título de la sección */}
        <h1 className="section-title">UBICACIÓN</h1>
        
        {/* Dirección de la empresa */}
        <p className="ubicacionMoltec">
          Zona 11, Ciudad de Guatemala, Guatemala
        </p>
        
        {/* Contenedor del mapa responsive */}
        <div className="mapita">
          <MapContainer
            center={posicion}
            zoom={16}
            className="map-container"
            style={{ 
              height: "450px", 
              width: "65%",
              // Media queries CSS se encargan del responsive
            }}
            attributionControl={true}
            zoomControl={true}
            doubleClickZoom={true}
            scrollWheelZoom={true}
            dragging={true}
            animate={true}
            easeLinearity={0.35}
          >
            {/* Capa base del mapa */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              detectRetina={true}
            />
            
            {/* Marcador de la ubicación de MOLTEC */}
            <Marker 
              position={posicion}
              title="Constructora MOLTEC S.A."
            >
              <Popup
                closeButton={true}
                autoClose={false}
                closeOnEscapeKey={true}
              >
                <div style={{ textAlign: 'center', padding: '4px' }}>
                  <strong>Constructora MOLTEC S.A.</strong>
                  <br />
                  <small>Zona 11</small>
                  <br />
                  <small>Ciudad de Guatemala</small>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        
      </section>
    </div>
  );
};

export default Ubicacion;