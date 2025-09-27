// components/DashboardStats.jsx - Dashboard con Gráficas para MOLTEC S.A.
import React, { useState, useEffect } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import dashboardAPI from "../services/dashboardApi";

// 📊 REGISTRAR COMPONENTES DE CHART.JS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// 🎨 ESTILOS DEL COMPONENTE (INTEGRADOS)
const styles = {
  container: {
    padding: "20px",
    background: "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "25px",
    borderRadius: "12px",
    marginBottom: "30px",
    boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
    color: "white",
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
  },
  headerTitle: {
    margin: 0,
    fontSize: "2.2rem",
    fontWeight: 700,
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
  btnRefresh: {
    background: "rgba(255, 255, 255, 0.2)",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    color: "white",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)",
    fontSize: "14px",
  },
  lastUpdate: {
    fontSize: "0.9rem",
    opacity: 0.9,
    fontStyle: "italic",
  },
  section: {
    marginBottom: "40px",
  },
  sectionTitle: {
    color: "#2d3748",
    fontSize: "1.8rem",
    fontWeight: 700,
    marginBottom: "20px",
    paddingLeft: "10px",
    borderLeft: "4px solid #667eea",
  },
  totalesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  totalCard: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    transition: "all 0.3s ease",
    borderLeft: "4px solid transparent",
    cursor: "pointer",
  },
  totalCardMateriales: {
    borderLeftColor: "#48bb78",
  },
  totalCardHerramientas: {
    borderLeftColor: "#ed8936",
  },
  totalCardProyectos: {
    borderLeftColor: "#667eea",
  },
  totalCardEmpleados: {
    borderLeftColor: "#9f7aea",
  },
  totalCardClientes: {
    borderLeftColor: "#38b2ac",
  },
  cardIcon: {
    fontSize: "3rem",
    opacity: 0.8,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    margin: "0 0 8px 0",
    color: "#4a5568",
    fontSize: "1.1rem",
    fontWeight: 600,
  },
  cardNumber: {
    fontSize: "2.5rem",
    fontWeight: 800,
    color: "#2d3748",
    display: "block",
    lineHeight: 1,
  },
  graficasPieGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "25px",
    marginBottom: "30px",
  },
  graficasBarrasGrid: {
    display: "grid",
    gap: "25px",
  },
  graficaCard: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  graficaCardFullWidth: {
    gridColumn: "1 / -1",
  },
  graficaTitle: {
    margin: "0 0 20px 0",
    color: "#2d3748",
    fontSize: "1.3rem",
    fontWeight: 600,
    textAlign: "center",
    paddingBottom: "15px",
    borderBottom: "2px solid #e2e8f0",
  },
  chartContainer: {
    height: "300px",
    position: "relative",
  },
  chartContainerMedium: {
    height: "350px",
    position: "relative",
  },
  chartContainerLarge: {
    height: "400px",
    position: "relative",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    textAlign: "center",
    background: "white",
    borderRadius: "12px",
    padding: "40px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  },
  loadingSpinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "20px",
  },
  loadingTitle: {
    color: "#2d3748",
    margin: "0 0 10px 0",
    fontSize: "1.5rem",
  },
  loadingText: {
    color: "#718096",
    margin: 0,
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    textAlign: "center",
    background: "white",
    borderRadius: "12px",
    padding: "40px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  },
  errorTitle: {
    color: "#2d3748",
    margin: "0 0 10px 0",
    fontSize: "1.5rem",
  },
  errorMessage: {
    color: "#e53e3e",
    fontWeight: 600,
    marginBottom: "20px",
  },
  btnRetry: {
    background: "#e53e3e",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: "14px",
  },
  footer: {
    textAlign: "center",
    padding: "30px 20px",
    marginTop: "40px",
    borderTop: "2px solid #e2e8f0",
    color: "#718096",
  },
  footerText: {
    margin: "5px 0",
    fontSize: "0.9rem",
  },
};

// 🎯 CSS PARA ANIMACIONES (se inyecta una sola vez)
const injectCSS = () => {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .dashboard-card-hover:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15) !important;
    }
    
    .dashboard-btn-hover:hover {
      background: rgba(255, 255, 255, 0.3) !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
    }
    
    .dashboard-retry-hover:hover {
      background: #c53030 !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3) !important;
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .dashboard-totales-grid {
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) !important;
        gap: 15px !important;
      }
      
      .dashboard-chart-container-large {
        height: 350px !important;
      }
    }

    @media (max-width: 968px) {
      .dashboard-totales-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      
      .dashboard-graficas-pie-grid {
        grid-template-columns: 1fr !important;
      }
      
      .dashboard-chart-container-large {
        height: 320px !important;
      }
      
      .dashboard-chart-container-medium {
        height: 280px !important;
      }
    }

    @media (max-width: 768px) {
      .dashboard-header-content {
        flex-direction: column !important;
        text-align: center !important;
        gap: 15px !important;
      }
      
      .dashboard-header-title {
        font-size: 1.8rem !important;
      }
      
      .dashboard-totales-grid {
        grid-template-columns: 1fr !important;
        gap: 15px !important;
      }
      
      .dashboard-total-card {
        flex-direction: row !important;
        text-align: left !important;
        gap: 15px !important;
        padding: 20px !important;
      }
      
      .dashboard-card-icon {
        font-size: 2.5rem !important;
      }
      
      .dashboard-card-number {
        font-size: 2rem !important;
      }
      
      .dashboard-chart-container {
        height: 220px !important;
      }
      
      .dashboard-chart-container-medium {
        height: 250px !important;
      }
      
      .dashboard-chart-container-large {
        height: 280px !important;
      }
      
      .dashboard-grafica-card {
        padding: 20px !important;
      }
      
      .dashboard-container {
        padding: 15px !important;
      }
      
      .dashboard-header {
        padding: 20px !important;
      }
      
      .dashboard-section-title {
        font-size: 1.6rem !important;
      }
      
      .dashboard-grafica-title {
        font-size: 1.2rem !important;
        padding-bottom: 10px !important;
      }
    }

    @media (max-width: 480px) {
      .dashboard-header-title {
        font-size: 1.5rem !important;
      }
      
      .dashboard-section-title {
        font-size: 1.4rem !important;
      }
      
      .dashboard-grafica-title {
        font-size: 1rem !important;
        line-height: 1.3 !important;
        padding-bottom: 8px !important;
      }
      
      .dashboard-chart-container {
        height: 180px !important;
      }
      
      .dashboard-chart-container-medium {
        height: 200px !important;
      }
      
      .dashboard-chart-container-large {
        height: 220px !important;
      }
      
      .dashboard-total-card {
        flex-direction: column !important;
        text-align: center !important;
        gap: 10px !important;
        padding: 15px !important;
      }
      
      .dashboard-card-icon {
        font-size: 2rem !important;
      }
      
      .dashboard-card-number {
        font-size: 1.8rem !important;
      }
      
      .dashboard-container {
        padding: 10px !important;
      }
      
      .dashboard-header {
        padding: 15px !important;
      }
      
      .dashboard-grafica-card {
        padding: 15px !important;
      }
    }

    @media (max-width: 360px) {
      .dashboard-chart-container {
        height: 160px !important;
      }
      
      .dashboard-chart-container-medium {
        height: 180px !important;
      }
      
      .dashboard-chart-container-large {
        height: 200px !important;
      }
      
      .dashboard-grafica-title {
        font-size: 0.9rem !important;
        line-height: 1.2 !important;
      }
      
      .dashboard-grafica-card {
        padding: 12px !important;
      }
    }
  `;
  if (!document.head.querySelector("#dashboard-animations")) {
    style.id = "dashboard-animations";
    document.head.appendChild(style);
  }
};

const DashboardStats = () => {
  // Estado para forzar re-render en cambio de ventana
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [datosDashboard, setDatosDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Efecto para manejar cambios de tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    injectCSS();
    cargarDatos();
  }, []);

  // Función para obtener opciones responsive para las gráficas
  const getOpcionesBarrasResponsive = (titulo = "Datos") => {
    const isMobile = windowWidth <= 768;
    const isSmallMobile = windowWidth <= 480;

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: titulo,
          font: {
            size: isSmallMobile ? 12 : isMobile ? 13 : 14,
            weight: "bold",
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            font: {
              size: isSmallMobile ? 10 : isMobile ? 11 : 12,
            },
          },
          grid: {
            display: !isSmallMobile,
          },
        },
        x: {
          ticks: {
            maxRotation: isSmallMobile ? 90 : isMobile ? 45 : 45,
            minRotation: isSmallMobile ? 45 : 0,
            font: {
              size: isSmallMobile ? 9 : isMobile ? 10 : 11,
            },
            maxTicksLimit: isSmallMobile ? 5 : isMobile ? 8 : undefined,
          },
          grid: {
            display: !isSmallMobile,
          },
        },
      },
      layout: {
        padding: {
          top: isMobile ? 10 : 20,
          bottom: isMobile ? 10 : 20,
          left: isMobile ? 5 : 10,
          right: isMobile ? 5 : 10,
        },
      },
    };
  };

  // 📊 CARGAR DATOS DEL DASHBOARD
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

  // 🔄 CARGAR DATOS AL MONTAR EL COMPONENTE
  useEffect(() => {
    injectCSS(); // Inyectar CSS para animaciones
    cargarDatos();
  }, []);

  // 🔄 FUNCIÓN DE RECARGAR
  const handleRecargar = () => {
    cargarDatos();
  };

  // 📊 RENDERIZAR LOADING
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <h2 style={styles.loadingTitle}>📊 Cargando Dashboard...</h2>
          <p style={styles.loadingText}>
            Obteniendo datos estadísticos de MOLTEC S.A.
          </p>
        </div>
      </div>
    );
  }

  // ❌ RENDERIZAR ERROR
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>❌ Error al cargar Dashboard</h2>
          <p style={styles.errorMessage}>{error}</p>
          <button
            onClick={handleRecargar}
            style={styles.btnRetry}
            className="dashboard-retry-hover"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  // 📊 RENDERIZAR DASHBOARD
  return (
    <div style={styles.container} className="dashboard-container">
      {/* HEADER DEL DASHBOARD */}
      <div style={styles.header} className="dashboard-header">
        <div style={styles.headerContent} className="dashboard-header-content">
          <h1 style={styles.headerTitle} className="dashboard-header-title">
            Dashboard - MOLTEC S.A.
          </h1>
          <div style={styles.headerActions}>
            <button
              onClick={handleRecargar}
              style={styles.btnRefresh}
              className="dashboard-btn-hover"
            >
              Actualizar
            </button>
            {lastUpdate && (
              <span style={styles.lastUpdate}>
                Última actualización: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* TARJETAS DE TOTALES */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle} className="dashboard-section-title">
          📋 Resumen General
        </h2>
        <div style={styles.totalesGrid} className="dashboard-totales-grid">
          <div
            style={{ ...styles.totalCard, ...styles.totalCardMateriales }}
            className="dashboard-card-hover dashboard-total-card"
          >
            <div style={styles.cardIcon} className="dashboard-card-icon">
              📦
            </div>
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>Total Materiales</h3>
              <span style={styles.cardNumber} className="dashboard-card-number">
                {datosDashboard?.totales?.materiales || 0}
              </span>
            </div>
          </div>

          <div
            style={{ ...styles.totalCard, ...styles.totalCardHerramientas }}
            className="dashboard-card-hover dashboard-total-card"
          >
            <div style={styles.cardIcon} className="dashboard-card-icon">
              🔧
            </div>
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>Total Herramientas</h3>
              <span style={styles.cardNumber} className="dashboard-card-number">
                {datosDashboard?.totales?.herramientas || 0}
              </span>
            </div>
          </div>

          <div
            style={{ ...styles.totalCard, ...styles.totalCardEmpleados }}
            className="dashboard-card-hover dashboard-total-card"
          >
            <div style={styles.cardIcon} className="dashboard-card-icon">
              👥
            </div>
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>Total Empleados</h3>
              <span style={styles.cardNumber} className="dashboard-card-number">
                {datosDashboard?.totales?.empleados || 0}
              </span>
            </div>
          </div>

          <div
            style={{ ...styles.totalCard, ...styles.totalCardClientes }}
            className="dashboard-card-hover dashboard-total-card"
          >
            <div style={styles.cardIcon} className="dashboard-card-icon">
              👤
            </div>
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>Total Clientes</h3>
              <span style={styles.cardNumber} className="dashboard-card-number">
                {datosDashboard?.totales?.clientes || 0}
              </span>
            </div>
          </div>

          <div
            style={{ ...styles.totalCard, ...styles.totalCardProyectos }}
            className="dashboard-card-hover dashboard-total-card"
          >
            <div style={styles.cardIcon} className="dashboard-card-icon">
              🏗️
            </div>
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>Proyectos Activos</h3>
              <span style={styles.cardNumber} className="dashboard-card-number">
                {datosDashboard?.totales?.proyectosActivos || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* GRÁFICAS PIE */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle} className="dashboard-section-title">
          📊 Gráficas de Estado
        </h2>
        <div
          style={styles.graficasPieGrid}
          className="dashboard-graficas-pie-grid"
        >
          {/* ESTADO DE HERRAMIENTAS */}
          <div
            style={styles.graficaCard}
            className="dashboard-card-hover dashboard-grafica-card"
          >
            <h3 style={styles.graficaTitle} className="dashboard-grafica-title">
              🔧 Estado de Herramientas
            </h3>
            <div
              style={styles.chartContainer}
              className="dashboard-chart-container"
            >
              <Pie
                data={dashboardAPI.formatearDatosPie(
                  datosDashboard?.graficasPie?.estadoHerramientas
                )}
                options={dashboardAPI.getOpcionesPie()}
              />
            </div>
          </div>

          {/* STOCK DE HERRAMIENTAS */}
          <div
            style={styles.graficaCard}
            className="dashboard-card-hover dashboard-grafica-card"
          >
            <h3 style={styles.graficaTitle} className="dashboard-grafica-title">
              📊 Stock de Herramientas
            </h3>
            <div
              style={styles.chartContainer}
              className="dashboard-chart-container"
            >
              <Pie
                data={dashboardAPI.formatearDatosPie(
                  datosDashboard?.graficasPie?.stockHerramientas
                )}
                options={dashboardAPI.getOpcionesPie()}
              />
            </div>
          </div>

          {/* STOCK DE MATERIALES */}
          <div
            style={styles.graficaCard}
            className="dashboard-card-hover dashboard-grafica-card"
          >
            <h3 style={styles.graficaTitle} className="dashboard-grafica-title">
              📦 Stock de Materiales
            </h3>
            <div
              style={styles.chartContainer}
              className="dashboard-chart-container"
            >
              <Pie
                data={dashboardAPI.formatearDatosPie(
                  datosDashboard?.graficasPie?.stockMateriales
                )}
                options={dashboardAPI.getOpcionesPie()}
              />
            </div>
          </div>
        </div>
      </div>

      {/* GRÁFICAS DE BARRAS */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle} className="dashboard-section-title">
          📈 Análisis de Actividad
        </h2>
        <div style={styles.graficasBarrasGrid}>
          {/* TOP MATERIALES/HERRAMIENTAS */}
          <div
            style={{ ...styles.graficaCard, ...styles.graficaCardFullWidth }}
            className="dashboard-card-hover dashboard-grafica-card"
          >
            <h3 style={styles.graficaTitle} className="dashboard-grafica-title">
              🔝 Top 10 Materiales/Herramientas con más Salidas (Mes Actual)
            </h3>
            <div
              style={styles.chartContainerLarge}
              className="dashboard-chart-container-large"
            >
              <Bar
                key={windowWidth} // Forzar re-render al cambiar tamaño
                data={dashboardAPI.formatearDatosBarras(
                  datosDashboard?.graficasBarras?.topMaterialesHerramientas
                )}
                options={getOpcionesBarrasResponsive("Salidas del mes")}
              />
            </div>
          </div>

          {/* CLIENTES REGISTRADOS */}
          <div
            style={{ ...styles.graficaCard, ...styles.graficaCardFullWidth }}
            className="dashboard-card-hover dashboard-grafica-card"
          >
            <h3 style={styles.graficaTitle} className="dashboard-grafica-title">
              👥 Clientes Registrados por Semana (Mes Actual)
            </h3>
            <div
              style={styles.chartContainerMedium}
              className="dashboard-chart-container-medium"
            >
              <Bar
                key={`clientes-${windowWidth}`} // Forzar re-render al cambiar tamaño
                data={dashboardAPI.formatearDatosBarras(
                  datosDashboard?.graficasBarras?.clientesDelMes
                )}
                options={getOpcionesBarrasResponsive("Nuevos clientes")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER DEL DASHBOARD */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          © {new Date().getFullYear()} MOLTEC S.A. - Sistema de Gestión de
          Inventario
        </p>
        <p style={styles.footerText}>Dashboard generado automáticamente</p>
      </div>
    </div>
  );
};

export default DashboardStats;
