// pages/BitacoraCRUD.jsx - Página completa de Bitácora del Sistema de Inventario MOLTEC S.A.
import React, { useState, useEffect } from "react";
import {
  FileText,
  Activity,
  Users,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  Eye,
  Clock,
  Package,
  Wrench,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "react-toastify";

// Importar servicios
import bitacoraApi from "../services/bitacoraApi";
import herramientasApi from "../services/herramientasApi";
import materialesApi from "../services/materialesApi";

const BitacoraCRUD = () => {
  // Estados principales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de datos
  const [estadisticasBitacora, setEstadisticasBitacora] = useState(null);
  const [registrosBitacora, setRegistrosBitacora] = useState([]);
  const [movimientosHerramientas, setMovimientosHerramientas] = useState([]);
  const [movimientosMateriales, setMovimientosMateriales] = useState([]);

  // Estados de filtros y búsqueda
  const [busqueda, setBusqueda] = useState("");
  const [filtros, setFiltros] = useState({
    tipoEvento: "todos",
    fechaInicio: "",
    fechaFin: "",
    usuario: "todos",
  });

  // Estados de UI
  const [tablaActiva, setTablaActiva] = useState("estadisticas");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Funciones para determinar tamaño de pantalla
  const isMobile = () => window.innerWidth <= 768;
  const isSmallMobile = () => window.innerWidth <= 640;

  // Insertar animación del spinner (igual que ProyectosCRUD)
  useEffect(() => {
    if (typeof document === "undefined") return;
    let styleEl = null;
    try {
      const css = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
      styleEl = document.createElement("style");
      styleEl.type = "text/css";
      styleEl.appendChild(document.createTextNode(css));
      document.head.appendChild(styleEl);
    } catch (_) {
      /* no-op */
    }
    return () => {
      if (styleEl && styleEl.parentNode)
        styleEl.parentNode.removeChild(styleEl);
    };
  }, []);

  // Cargar datos al inicializar
  useEffect(() => {
    cargarDatos();
  }, []);

  // useEffect para responsive
  useEffect(() => {
    const handleResize = () => {
      setLoading((prev) => prev);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cargar todos los datos
  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📊 Cargando datos de bitácora...");

      // Cargar datos en paralelo
      const [
        statsResponse,
        bitacoraResponse,
        herramientasResponse,
        materialesResponse,
      ] = await Promise.all([
        bitacoraApi.obtenerEstadisticas(),
        bitacoraApi.obtenerRecientes(100),
        herramientasApi.obtenerMovimientosHerramientas(),
        materialesApi.obtenerMovimientosMateriales(),
      ]);

      if (statsResponse?.success) {
        setEstadisticasBitacora(statsResponse.data);
      }

      if (bitacoraResponse?.success) {
        setRegistrosBitacora(bitacoraResponse.data || []);
      }

      if (herramientasResponse?.success) {
        setMovimientosHerramientas(herramientasResponse.data || []);
      }

      if (materialesResponse?.success) {
        setMovimientosMateriales(materialesResponse.data || []);
      }

      console.log("✅ Datos de bitácora cargados exitosamente");
    } catch (error) {
      console.error("❌ Error al cargar datos:", error);
      setError(`Error al cargar datos: ${error.message}`);
      toast.error("Error al cargar los datos de bitácora");
    } finally {
      setLoading(false);
    }
  };

  // Recargar datos
  const recargarDatos = async () => {
    toast.info("Recargando datos...");
    setBusqueda("");
    setFiltros({
      tipoEvento: "todos",
      fechaInicio: "",
      fechaFin: "",
      usuario: "todos",
    });
    await cargarDatos();
    toast.success("Datos actualizados");
  };

  // Cambiar tabla activa
  const cambiarTabla = (tabla) => {
    setTablaActiva(tabla);
    setBusqueda("");
  };

  // Función para filtrar registros
  const obtenerDatosFiltrados = () => {
    let datos = [];

    switch (tablaActiva) {
      case "bitacora":
        datos = registrosBitacora;
        break;
      case "ingresoHerramientas":
        datos = movimientosHerramientas.filter((m) => m.tipo === "ingreso");
        break;
      case "salidaHerramientas":
        datos = movimientosHerramientas.filter((m) => m.tipo === "salida");
        break;
      case "ingresoMateriales":
        datos = movimientosMateriales.filter((m) => m.tipo === "ingreso");
        break;
      case "salidaMateriales":
        datos = movimientosMateriales.filter((m) => m.tipo === "salida");
        break;
      default:
        return [];
    }

    // Aplicar búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      datos = datos.filter((item) => {
        if (tablaActiva === "bitacora") {
          return (
            item.bitacora_descripcion?.toLowerCase().includes(termino) ||
            item.usuario_nombre?.toLowerCase().includes(termino)
            // QUITAMOS: item.bitacora_ip?.includes(termino)
          );
        } else {
          return (
            item.herramienta?.toLowerCase().includes(termino) ||
            item.material?.toLowerCase().includes(termino) ||
            item.motivo?.toLowerCase().includes(termino)
          );
        }
      });
    }

    return datos;
  };

  // Exportar datos
  const exportarDatos = async () => {
    try {
      const datosFiltrados = obtenerDatosFiltrados();

      if (tablaActiva === "bitacora") {
        await bitacoraApi.descargarBitacoraCSV(datosFiltrados);
      } else {
        // Para movimientos, crear CSV simple
        const headers = ["Tipo", "Item", "Cantidad", "Motivo", "Fecha"];
        const rows = datosFiltrados.map((item) => [
          item.tipo,
          item.herramienta || item.material || "N/A",
          item.cantidad || "N/A",
          item.motivo || "Sin motivo",
          item.fecha || "Sin fecha",
        ]);

        const csvContent = [headers, ...rows]
          .map((row) => row.map((field) => `"${field}"`).join(","))
          .join("\n");

        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${tablaActiva}_${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      toast.success("Datos exportados exitosamente");
    } catch (error) {
      console.error("❌ Error al exportar:", error);
      toast.error("Error al exportar datos");
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return "Sin fecha";
    return d.toLocaleDateString("es-GT", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Obtener color para tipo de evento
  const obtenerColorTipoEvento = (descripcion) => {
    return bitacoraApi.getColorTipoEvento(descripcion);
  };

  // Componente de estadísticas
  const renderEstadisticas = () => {
    if (!estadisticasBitacora) return null;

    const { general, tiposEventoRecientes, usuariosActivos, actividadDiaria } =
      estadisticasBitacora;

    return (
      <div style={styles.estadisticasContainer}>
        {/* Cards principales */}
        <div style={styles.statsContainer}>
          <div
            style={{
              ...styles.statCard,
              background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
            }}
          >
            <div style={styles.statCardContent}>
              <FileText size={24} color="white" />
              <div>
                <h3 style={{ ...styles.statTitle, color: "white" }}>
                  Total Registros
                </h3>
                <p style={{ ...styles.statNumber, color: "white" }}>
                  {general.totalRegistros?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              ...styles.statCard,
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            }}
          >
            <div style={styles.statCardContent}>
              <Users size={24} color="white" />
              <div>
                <h3 style={{ ...styles.statTitle, color: "white" }}>
                  Usuarios Activos
                </h3>
                <p style={{ ...styles.statNumber, color: "white" }}>
                  {general.usuariosActivos || 0}
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              ...styles.statCard,
              background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
            }}
          >
            <div style={styles.statCardContent}>
              <Wrench size={24} color="white" />
              <div>
                <h3 style={{ ...styles.statTitle, color: "white" }}>
                  Mov. Herramientas
                </h3>
                <p style={{ ...styles.statNumber, color: "white" }}>
                  {movimientosHerramientas.length}
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              ...styles.statCard,
              background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
            }}
          >
            <div style={styles.statCardContent}>
              <Package size={24} color="white" />
              <div>
                <h3 style={{ ...styles.statTitle, color: "white" }}>
                  Mov. Materiales
                </h3>
                <p style={{ ...styles.statNumber, color: "white" }}>
                  {movimientosMateriales.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos y tablas adicionales */}
        <div style={styles.chartsContainer}>
          {/* Tipos de eventos recientes */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>
              Tipos de Eventos (Últimos 30 días)
            </h3>
            <div style={styles.chartContent}>
              {tiposEventoRecientes?.map((evento, index) => (
                <div key={index} style={styles.chartItem}>
                  <span style={styles.chartLabel}>{evento.tipoEvento}</span>
                  <span style={styles.chartValue}>{evento.cantidad}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Usuarios más activos */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Usuarios Más Activos</h3>
            <div style={styles.chartContent}>
              {usuariosActivos?.map((usuario, index) => (
                <div key={index} style={styles.chartItem}>
                  <span style={styles.chartLabel}>{usuario.usuario}</span>
                  <span style={styles.chartValue}>{usuario.registros}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente de tabla
  const renderTabla = () => {
    const datos = obtenerDatosFiltrados();

    if (tablaActiva === "bitacora") {
      return (
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Fecha</th>
              <th style={styles.th}>Usuario</th>
              <th style={styles.th}>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {datos.length === 0 ? (
              <tr>
                <td colSpan="3" style={styles.emptyMessage}>
                  {busqueda
                    ? "No se encontraron registros que coincidan con la búsqueda"
                    : "No hay registros de bitácora"}
                </td>
              </tr>
            ) : (
              datos.map((registro, index) => {
                const colorEvento = obtenerColorTipoEvento(
                  registro.bitacora_descripcion
                );
                return (
                  <tr key={index} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={styles.dateInfo}>
                        <Clock size={14} color="#718096" />
                        <span>{formatearFecha(registro.bitacora_fecha)}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.userInfo}>
                        <Users size={14} color="#718096" />
                        <span>
                          {registro.usuario_nombre || "Usuario desconocido"}
                        </span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.eventBadge,
                          color: colorEvento.color,
                          backgroundColor: colorEvento.bg,
                        }}
                      >
                        {registro.bitacora_descripcion}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      );
    } else {
      // Tabla para movimientos (se mantiene igual)
      return (
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>
                <div style={styles.movementHeader}>
                  {tablaActiva.includes("ingreso") ? (
                    <ArrowUp size={16} color="#38a169" />
                  ) : (
                    <ArrowDown size={16} color="#e53e3e" />
                  )}
                  Tipo
                </div>
              </th>
              <th style={styles.th}>Item</th>
              <th style={styles.th}>Cantidad</th>
              <th
                style={{
                  ...styles.th,
                  display: isMobile() ? "none" : "table-cell",
                }}
              >
                Motivo
              </th>
              <th style={styles.th}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {datos.length === 0 ? (
              <tr>
                <td colSpan="5" style={styles.emptyMessage}>
                  {busqueda
                    ? "No se encontraron movimientos que coincidan con la búsqueda"
                    : "No hay movimientos registrados"}
                </td>
              </tr>
            ) : (
              datos.map((movimiento, index) => (
                <tr key={index} style={styles.tableRow}>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.movementBadge,
                        backgroundColor:
                          movimiento.tipo === "ingreso" ? "#c6f6d5" : "#fed7d7",
                        color:
                          movimiento.tipo === "ingreso" ? "#38a169" : "#e53e3e",
                      }}
                    >
                      {movimiento.tipo === "ingreso" ? "Ingreso" : "Salida"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.itemInfo}>
                      {tablaActiva.includes("Herramientas") ? (
                        <Wrench size={14} color="#718096" />
                      ) : (
                        <Package size={14} color="#718096" />
                      )}
                      <span>
                        {movimiento.herramienta || movimiento.material || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.quantityText}>
                      {movimiento.cantidad || "N/A"}
                    </span>
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      display: isMobile() ? "none" : "table-cell",
                    }}
                  >
                    <span style={styles.reasonText}>
                      {movimiento.motivo || "Sin motivo especificado"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.dateInfo}>
                      <Calendar size={14} color="#718096" />
                      <span>{formatearFecha(movimiento.fecha)}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Cargando datos de bitácora...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <AlertTriangle size={48} color="#e53e3e" />
        <h2>Error al cargar datos</h2>
        <p>{error}</p>
        <button style={styles.retryButton} onClick={cargarDatos}>
          <RefreshCw size={16} />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <div>
            <h1 style={styles.title}>
              <FileText size={32} style={{ marginRight: "12px" }} />
              Bitácora del Sistema
            </h1>
            <p style={styles.subtitle}>
              Monitoreo completo de actividades y movimientos en MOLTEC S.A.
            </p>
          </div>
        </div>

        <div style={styles.headerActions}>
          <button style={styles.refreshButton} onClick={recargarDatos}>
            <RefreshCw size={16} />
            Actualizar
          </button>
          {tablaActiva !== "estadisticas" && (
            <button style={styles.exportButton} onClick={exportarDatos}>
              <Download size={16} />
              Exportar
            </button>
          )}
        </div>
      </div>

      {/* NAVEGACIÓN DE TABLAS */}
      <div style={styles.tabNavigation}>
        <button
          style={
            tablaActiva === "estadisticas"
              ? styles.tabButtonActive
              : styles.tabButton
          }
          onClick={() => cambiarTabla("estadisticas")}
        >
          <TrendingUp size={16} />
          Estadísticas
        </button>
        <button
          style={
            tablaActiva === "bitacora"
              ? styles.tabButtonActive
              : styles.tabButton
          }
          onClick={() => cambiarTabla("bitacora")}
        >
          <FileText size={16} />
          Bitácora
        </button>
        <button
          style={
            tablaActiva === "ingresoMateriales"
              ? styles.tabButtonActive
              : styles.tabButton
          }
          onClick={() => cambiarTabla("ingresoMateriales")}
        >
          <ArrowUp size={16} />
          Ingreso Materiales
        </button>
        <button
          style={
            tablaActiva === "salidaMateriales"
              ? styles.tabButtonActive
              : styles.tabButton
          }
          onClick={() => cambiarTabla("salidaMateriales")}
        >
          <ArrowDown size={16} />
          Salida Materiales
        </button>
        <button
          style={
            tablaActiva === "ingresoHerramientas"
              ? styles.tabButtonActive
              : styles.tabButton
          }
          onClick={() => cambiarTabla("ingresoHerramientas")}
        >
          <ArrowUp size={16} />
          Ingreso Herramientas
        </button>
        <button
          style={
            tablaActiva === "salidaHerramientas"
              ? styles.tabButtonActive
              : styles.tabButton
          }
          onClick={() => cambiarTabla("salidaHerramientas")}
        >
          <ArrowDown size={16} />
          Salida Herramientas
        </button>
      </div>

      {/* CONTENIDO SEGÚN TABLA ACTIVA */}
      {tablaActiva === "estadisticas" ? (
        renderEstadisticas()
      ) : (
        <>
          {/* BÚSQUEDA */}
          <div style={styles.searchContainer}>
            <div style={styles.searchBox}>
              <Search size={20} color="#6c757d" />
              <input
                type="text"
                placeholder={
                  tablaActiva === "bitacora"
                    ? "Buscar en bitácora por descripción, usuario..." // ← SIN MENCIONAR IP
                    : "Buscar movimientos por item, motivo..."
                }
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          {/* TABLA */}
          <div style={styles.tableContainer}>
            <div style={styles.tableHeader}>
              <h2 style={styles.tableTitle}>
                {tablaActiva === "bitacora" && "Registros de Bitácora"}
                {tablaActiva === "ingresoMateriales" &&
                  "Ingresos de Materiales"}
                {tablaActiva === "salidaMateriales" && "Salidas de Materiales"}
                {tablaActiva === "ingresoHerramientas" &&
                  "Ingresos de Herramientas"}
                {tablaActiva === "salidaHerramientas" &&
                  "Salidas de Herramientas"}
                ({obtenerDatosFiltrados().length})
              </h2>
            </div>
            <div style={styles.tableContent}>{renderTabla()}</div>
          </div>
        </>
      )}
    </div>
  );
};

// ESTILOS (siguiendo la estructura de ProyectosCRUD.jsx)
const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    color: "#2d3748",
    minHeight: "100vh",
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "50vh",
    gap: "20px",
  },

  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #4299e1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  errorContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "50vh",
    gap: "20px",
    textAlign: "center",
  },

  retryButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    backgroundColor: "#4299e1",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "2px solid #e2e8f0",
    flexWrap: "wrap",
    gap: "20px",
  },

  titleSection: {
    flex: 1,
    minWidth: "300px",
  },

  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#2d3748",
    display: "flex",
    alignItems: "center",
    margin: "0 0 8px 0",
    flexWrap: "wrap",
  },

  subtitle: {
    fontSize: "16px",
    color: "#718096",
    margin: "0",
  },

  headerActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  refreshButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    backgroundColor: "#4299e1",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },

  exportButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    backgroundColor: "#48bb78",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },

  tabNavigation: {
    display: "flex",
    gap: "8px",
    marginBottom: "30px",
    flexWrap: "wrap",
    backgroundColor: "#f7fafc",
    padding: "8px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },

  tabButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 16px",
    backgroundColor: "transparent",
    color: "#718096",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },

  tabButtonActive: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 16px",
    backgroundColor: "#4299e1",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },

  estadisticasContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },

  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },

  statCard: {
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },

  statCardContent: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  statTitle: {
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 4px 0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  statNumber: {
    fontSize: "28px",
    fontWeight: "700",
    margin: "0",
  },

  chartsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "20px",
  },

  chartCard: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
  },

  chartTitle: {
    margin: "0 0 15px 0",
    color: "#2d3748",
    fontSize: "18px",
    fontWeight: "600",
  },

  chartContent: {
    maxHeight: "300px",
    overflowY: "auto",
  },

  chartItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #e2e8f0",
  },

  chartLabel: {
    color: "#4a5568",
    fontSize: "14px",
  },

  chartValue: {
    background: "#edf2f7",
    color: "#2d3748",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "500",
  },

  searchContainer: {
    marginBottom: "25px",
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "12px 16px",
    gap: "12px",
    maxWidth: "600px",
  },

  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "16px",
    fontFamily: "Arial, sans-serif",
  },

  tableContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e2e8f0",
  },

  tableHeader: {
    backgroundColor: "#f7fafc",
    padding: "20px",
    borderBottom: "1px solid #e2e8f0",
  },

  tableTitle: {
    margin: 0,
    color: "#2d3748",
    fontSize: "20px",
    fontWeight: "600",
  },

  tableContent: {
    overflowX: "auto",
    overflowY: "auto",
    maxHeight: "70vh",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1000px",
  },

  th: {
    padding: "16px 8px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "600",
    color: "#4a5568",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
    position: "sticky",
    top: 0,
    backgroundColor: "#f7fafc",
    zIndex: 10,

    // AGREGAR ESTAS LÍNEAS:
    "&:nth-child(1)": { width: "200px" }, // Fecha
    "&:nth-child(2)": { width: "180px" }, // Usuario
    "&:nth-child(3)": { width: "auto" },
  },

  tableRow: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background-color 0.2s ease",
  },

  td: {
    padding: "16px 8px",
    fontSize: "14px",
    color: "#2d3748",
    verticalAlign: "top",
    wordWrap: "break-word",
  },

  emptyMessage: {
    textAlign: "center",
    padding: "48px 16px",
    color: "#718096",
    fontSize: "16px",
  },

  dateInfo: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#4a5568",
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#4a5568",
  },

  eventBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
    // maxWidth: "200px",
    // overflow: "hidden",
    // textOverflow: "ellipsis",
    // whiteSpace: "nowrap",
  },

  ipText: {
    fontSize: "12px",
    color: "#718096",
    fontFamily: "monospace",
  },

  userAgentText: {
    fontSize: "11px",
    color: "#718096",
    maxWidth: "200px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  movementHeader: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  movementBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize",
  },

  itemInfo: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#4a5568",
  },

  quantityText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2d3748",
  },

  reasonText: {
    fontSize: "13px",
    color: "#718096",
    maxWidth: "150px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  // Estilos responsive
  "@media (max-width: 768px)": {
    header: {
      flexDirection: "column",
      gap: "15px",
    },

    headerActions: {
      width: "100%",
      justifyContent: "stretch",
    },

    tabNavigation: {
      overflowX: "auto",
      flexWrap: "nowrap",
    },

    statsContainer: {
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    },

    chartsContainer: {
      gridTemplateColumns: "1fr",
    },

    tableContent: {
      maxHeight: "60vh",
    },
  },

  "@media (max-width: 480px)": {
    title: {
      fontSize: "24px",
    },

    tabButton: {
      padding: "8px 12px",
      fontSize: "12px",
    },

    tabButtonActive: {
      padding: "8px 12px",
      fontSize: "12px",
    },

    statsContainer: {
      gridTemplateColumns: "1fr",
    },

    statCard: {
      padding: "15px",
    },

    searchBox: {
      padding: "10px 12px",
    },

    tableHeader: {
      padding: "15px",
    },

    tableTitle: {
      fontSize: "18px",
    },
  },
};

// Exportar el componente
export default BitacoraCRUD;
