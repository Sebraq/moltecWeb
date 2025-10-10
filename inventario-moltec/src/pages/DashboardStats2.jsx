// pages/DashboardStats.jsx - Dashboard Optimizado con CSS Externo
import React, { useState, useEffect } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import dashboardAPI from "../services/dashboardApi";
import "./Dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DashboardStats = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [datosDashboard, setDatosDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const handleResize = () => { setWindowWidth(window.innerWidth); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    cargarDatos();
  }, []);

  const getOpcionesBarrasResponsive = (titulo = "Datos") => {
    const isMobile = windowWidth <= 768;
    const isSmallMobile = windowWidth <= 480;
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: titulo,
          font: { size: isSmallMobile ? 12 : isMobile ? 13 : 14, weight: "bold" }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, font: { size: isSmallMobile ? 10 : isMobile ? 11 : 12 } },
          grid: { display: !isSmallMobile }
        },
        x: {
          ticks: {
            maxRotation: isSmallMobile ? 90 : isMobile ? 45 : 45,
            minRotation: isSmallMobile ? 45 : 0,
            font: { size: isSmallMobile ? 9 : isMobile ? 10 : 11 },
            maxTicksLimit: isSmallMobile ? 5 : isMobile ? 8 : undefined
          },
          grid: { display: !isSmallMobile }
        }
      },
      layout: {
        padding: {
          top: isMobile ? 10 : 20,
          bottom: isMobile ? 10 : 20,
          left: isMobile ? 5 : 10,
          right: isMobile ? 5 : 10
        }
      }
    };
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📊 Cargando datos del dashboard...");
      const response = await dashboardAPI.obtenerDatosDashboard();
      if (response.success) {
        setDatosDashboard(response.data);
        setLastUpdate(new Date());
        console.log("✅ Datos del dashboard cargados exitosamente");
      } else {
        throw new Error(response.error || "Error al cargar datos");
      }
    } catch (error) {
      console.error("❌ Error al cargar dashboard:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecargar = () => { cargarDatos(); };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading-container">
          <div className="dashboard-loading-spinner"></div>
          <h2 className="dashboard-loading-title">📊 Cargando Dashboard...</h2>
          <p className="dashboard-loading-text">Obteniendo datos estadísticos de MOLTEC S.A.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error-container">
          <h2 className="dashboard-error-title">❌ Error al cargar Dashboard</h2>
          <p className="dashboard-error-message">{error}</p>
          <button onClick={handleRecargar} className="dashboard-btn-retry">🔄 Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-header-title">📊 Dashboard - MOLTEC S.A.</h1>
          <div className="dashboard-header-actions">
            <button onClick={handleRecargar} className="dashboard-btn-refresh">🔄 Actualizar</button>
            {lastUpdate && (<span className="dashboard-last-update">Última actualización: {lastUpdate.toLocaleTimeString()}</span>)}
          </div>
        </div>
      </div>

      {/* RESUMEN GENERAL */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">📋 Resumen General</h2>
        <div className="dashboard-totales-grid">
          <div className="dashboard-total-card materiales">
            <div className="dashboard-card-icon">📦</div>
            <div className="dashboard-card-content">
              <h3 className="dashboard-card-title">Total Materiales</h3>
              <span className="dashboard-card-number">{datosDashboard?.totales?.materiales || 0}</span>
            </div>
          </div>

          <div className="dashboard-total-card herramientas">
            <div className="dashboard-card-icon">🔧</div>
            <div className="dashboard-card-content">
              <h3 className="dashboard-card-title">Total Herramientas</h3>
              <span className="dashboard-card-number">{datosDashboard?.totales?.herramientas || 0}</span>
            </div>
          </div>

          <div className="dashboard-total-card empleados">
            <div className="dashboard-card-icon">👥</div>
            <div className="dashboard-card-content">
              <h3 className="dashboard-card-title">Total Empleados</h3>
              <span className="dashboard-card-number">{datosDashboard?.totales?.empleados || 0}</span>
            </div>
          </div>

          <div className="dashboard-total-card clientes">
            <div className="dashboard-card-icon">👤</div>
            <div className="dashboard-card-content">
              <h3 className="dashboard-card-title">Total Clientes</h3>
              <span className="dashboard-card-number">{datosDashboard?.totales?.clientes || 0}</span>
            </div>
          </div>

          <div className="dashboard-total-card proyectos">
            <div className="dashboard-card-icon">🗂️</div>
            <div className="dashboard-card-content">
              <h3 className="dashboard-card-title">Proyectos Activos</h3>
              <span className="dashboard-card-number">{datosDashboard?.totales?.proyectosActivos || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* GRÁFICAS PIE */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">📊 Gráficas de Estado</h2>
        <div className="dashboard-graficas-pie-grid">
          <div className="dashboard-grafica-card">
            <h3 className="dashboard-grafica-title">🔧 Estado de Herramientas</h3>
            <div className="dashboard-chart-container">
              <Pie data={dashboardAPI.formatearDatosPie(datosDashboard?.graficasPie?.estadoHerramientas, 'estadoHerramientas')} options={dashboardAPI.getOpcionesPie()} />
            </div>
          </div>

          <div className="dashboard-grafica-card">
            <h3 className="dashboard-grafica-title">📊 Stock de Herramientas</h3>
            <div className="dashboard-chart-container">
              <Pie data={dashboardAPI.formatearDatosPie(datosDashboard?.graficasPie?.stockHerramientas, 'stockHerramientas')} options={dashboardAPI.getOpcionesPie()} />
            </div>
          </div>

          <div className="dashboard-grafica-card">
            <h3 className="dashboard-grafica-title">📦 Stock de Materiales</h3>
            <div className="dashboard-chart-container">
              <Pie data={dashboardAPI.formatearDatosPie(datosDashboard?.graficasPie?.stockMateriales, 'stockMateriales')} options={dashboardAPI.getOpcionesPie()} />
            </div>
          </div>
        </div>
      </div>

      {/* GRÁFICAS DE BARRAS */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">📈 Análisis de Actividad</h2>
        <div className="dashboard-graficas-barras-grid">
          <div className="dashboard-grafica-card full-width">
            <h3 className="dashboard-grafica-title">🔝 Top 10 Materiales/Herramientas con más Salidas (Mes Actual)</h3>
            <div className="dashboard-chart-container-large">
              <Bar key={windowWidth} data={dashboardAPI.formatearDatosBarras(datosDashboard?.graficasBarras?.topMaterialesHerramientas)} options={getOpcionesBarrasResponsive("Salidas del mes")} />
            </div>
          </div>

          <div className="dashboard-grafica-card full-width">
            <h3 className="dashboard-grafica-title">👥 Clientes Registrados por Semana (Mes Actual)</h3>
            <div className="dashboard-chart-container-medium">
              <Bar key={`clientes-${windowWidth}`} data={dashboardAPI.formatearDatosBarras(datosDashboard?.graficasBarras?.clientesDelMes)} options={getOpcionesBarrasResponsive("Nuevos clientes")} />
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="dashboard-footer">
        <p className="dashboard-footer-text">© {new Date().getFullYear()} MOLTEC S.A. - Sistema de Gestión de Inventario</p>
        <p className="dashboard-footer-text">Dashboard generado automáticamente</p>
      </div>
    </div>
  );
};

export default DashboardStats;