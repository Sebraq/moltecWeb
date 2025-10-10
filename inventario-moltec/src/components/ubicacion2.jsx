/* ============================================
   COMPONENTE UBICACIÓN - MOLTEC S.A.
   Mapa interactivo con Leaflet
   ============================================ */

import React from "react";
import "./ubicacion2.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

/* ============================================
   CONFIGURACIÓN DE ICONOS DE LEAFLET
   Solución para que los iconos se muestren correctamente
   ============================================ */
// Elimina la URL predeterminada del ícono para evitar errores de ruta
delete L.Icon.Default.prototype._getIconUrl;

// Configura URLs de CDN para los iconos del marcador
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/* ============================================
   CONFIGURACIÓN DE UBICACIÓN
   Constantes para la ubicación de MOLTEC S.A.
   ============================================ */
// Coordenadas geográficas de MOLTEC S.A. en Ciudad de Guatemala
// [latitud, longitud]
const MOLTEC_POSITION = [14.601367, -90.563338];

// Dirección completa de la empresa
const MOLTEC_ADDRESS = "Zona 11, Ciudad de Guatemala, Guatemala";

// Nivel de zoom inicial del mapa (16 = nivel de calle)
const MAP_ZOOM = 16;

/**
 * Componente Ubicacion
 * 
 * Muestra la ubicación de MOLTEC S.A. en un mapa interactivo responsive.
 * Usa React Leaflet para renderizar el mapa con marcador y popup.
 * 
 * Características:
 * - Mapa interactivo con controles de zoom
 * - Marcador personalizado en la ubicación de la empresa
 * - Popup informativo con detalles de la empresa
 * - Totalmente responsive para todos los dispositivos
 * - Accesible con atributos ARIA
 * 
 * @component
 * @returns {JSX.Element} Sección de ubicación con mapa interactivo
 */
const Ubicacion = () => {
  return (
    <section id="ubi" className="ubicacion-section">
      {/* ============================================
          TÍTULO DE LA SECCIÓN
          ============================================ */}
      <h1 className="ubicacion-title">UBICACIÓN</h1>

      {/* ============================================
          DIRECCIÓN DE LA EMPRESA
          <br> ayuda a centrar correctamente el texto
          ============================================ */}
      <br />
      <p className="ubicacion-direccion">{MOLTEC_ADDRESS}</p>

      {/* ============================================
          CONTENEDOR DEL MAPA
          Wrapper que centra el mapa en la página
          ============================================ */}
      <div className="ubicacion-mapa-wrapper">
        {/* ============================================
            COMPONENTE MAPCONTAINER DE LEAFLET
            Renderiza el mapa interactivo
            ============================================ */}
        <MapContainer
          center={MOLTEC_POSITION} // Centro del mapa (coordenadas de MOLTEC)
          zoom={MAP_ZOOM} // Nivel de zoom inicial
          className="ubicacion-mapa-container" // Clase CSS personalizada
          attributionControl={true} // Muestra atribución de OpenStreetMap
          zoomControl={true} // Muestra controles de zoom (+/-)
          doubleClickZoom={true} // Habilita zoom con doble clic
          scrollWheelZoom={true} // Habilita zoom con scroll del mouse
          dragging={true} // Habilita arrastrar el mapa
          touchZoom={true} // Habilita zoom táctil en móviles
          animate={true} // Habilita animaciones suaves
          easeLinearity={0.35} // Suavidad de las animaciones (0-1)
          aria-label="Mapa de ubicación de MOLTEC S.A." // Accesibilidad
        >
          {/* ============================================
              CAPA BASE DEL MAPA (OPENSTREETMAP)
              Proporciona las imágenes del mapa
              ============================================ */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19} // Zoom máximo permitido
            minZoom={3} // Zoom mínimo permitido
            detectRetina={true} // Detecta pantallas Retina para mejor calidad
          />

          {/* ============================================
              MARCADOR DE LA UBICACIÓN DE MOLTEC
              Pin que señala la ubicación exacta
              ============================================ */}
          <Marker
            position={MOLTEC_POSITION} // Coordenadas del marcador
            title="Constructora MOLTEC S.A." // Tooltip al pasar el mouse
            alt="Marcador de ubicación de MOLTEC" // Texto alternativo
          >
            {/* ============================================
                POPUP INFORMATIVO
                Ventana emergente con información de la empresa
                ============================================ */}
            <Popup
              closeButton={true} // Muestra botón para cerrar (X)
              autoClose={false} // No se cierra automáticamente al hacer clic en el mapa
              closeOnEscapeKey={true} // Se cierra al presionar ESC
              maxWidth={300} // Ancho máximo del popup
            >
              {/* Contenido del popup con estilos inline */}
              <div
                style={{
                  textAlign: "center", // Centra el texto
                  padding: "8px 4px", // Espaciado interno
                  lineHeight: "1.6", // Altura de línea para legibilidad
                }}
              >
                {/* Nombre de la empresa en negrita */}
                <strong style={{ fontSize: "1.1rem" }}>
                  Constructora MOLTEC S.A.
                </strong>
                <br />
                {/* Zona de la ubicación */}
                <small style={{ fontSize: "0.9rem" }}>Zona 11</small>
                <br />
                {/* Ciudad y país */}
                <small style={{ fontSize: "0.9rem" }}>
                  Ciudad de Guatemala
                </small>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </section>
  );
};

export default Ubicacion;