// pages/HerramientasCRUD.jsx - CRUD completo de herramientas (ESTANDARIZADO)
import React, { useState, useEffect } from "react";
import {
  Wrench,
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  FileText,
} from "lucide-react";
import { toast } from "react-toastify";
import herramientasApi from "../services/herramientasApi";
import reportesService from "../services/reportesService";

const HerramientasCRUD = () => {
  // 🎯 ESTADOS PRINCIPALES
  const [herramientas, setHerramientas] = useState([]);
  const [herramientasFiltradas, setHerramientasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  // 1️⃣ ACTUALIZAR EL ESTADO DE ESTADÍSTICAS
  const [estadisticas, setEstadisticas] = useState({
    // Estadísticas de Stock
    totalHerramientas: 0,
    stockCritico: 0,
    stockBajo: 0,
    stockNormal: 0,
    // Estadísticas de Estado de Herramientas (NUEVO)
    herramientasNuevas: 0,
    herramientasBuenEstado: 0,
    herramientasDesgastadas: 0,
    herramientasEnReparacion: 0,
    herramientasBaja: 0,
  });

  // 🔍 ESTADOS DE BÚSQUEDA Y FILTROS
  const [busqueda, setBusqueda] = useState("");

  const [filtros, setFiltros] = useState({
    estadoStock: "todos", // "todos", "critico", "bajo", "normal"
    estadoHerramienta: "todos", // "todos", "Nuevo", "En buen estado", etc.
    fechaIngreso: "", // fecha desde cuando filtrar ingresos
    fechaActualizacion: "", // fecha desde cuando filtrar actualizaciones
  });

  // 📋 ESTADOS DE FORMULARIOS
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [mostrarModalStock, setMostrarModalStock] = useState(false);
  const [herramientaSeleccionada, setHerramientaSeleccionada] = useState(null);
  const [tipoMovimiento, setTipoMovimiento] = useState("ingreso"); // 'ingreso' o 'salida'

  // 📋 FORMULARIO CREAR/EDITAR
  const [formData, setFormData] = useState({
    nombre: "",
    marca: "",
    modelo: "",
    descripcion: "",
    medida: "",
    cantidadActual: 0,
    cantidadMinima: 0,
    estado: "Nuevo",
  });

  // 📊 ESTADOS PARA MODAL DE REPORTES
  const [mostrarModalReportes, setMostrarModalReportes] = useState(false);
  const [configuracionReporte, setConfiguracionReporte] = useState({
    tipoReporte: "completo",
    estadoSeleccionado: "todos",
    nivelStockSeleccionado: "todos",
    incluirFechas: true,
    incluirDetalles: true,
  });

  // 📦 FORMULARIO MOVIMIENTO DE STOCK
  const [movimientoData, setMovimientoData] = useState({
    cantidad: "",
    motivo: "",
  });

  // 🚀 CARGAR DATOS AL INICIALIZAR
  useEffect(() => {
    cargarDatos();
  }, []);

  // useEffect para responsive
  useEffect(() => {
    const handleResize = () => {
      // Forzar re-render cuando cambie el tamaño
      setLoading((prev) => prev);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔍 FILTRAR HERRAMIENTAS CUANDO CAMBIE LA BÚSQUEDA
  // FILTRAR HERRAMIENTAS CUANDO CAMBIE LA BÚSQUEDA O FILTROS
  useEffect(() => {
    try {
      // Primero aplicar búsqueda por texto
      const filtradas = herramientasApi.buscarHerramientas(
        herramientas,
        busqueda
      );
      let herramientasFiltradas = filtradas;

      // Filtro por estado de stock
      if (filtros.estadoStock !== "todos") {
        herramientasFiltradas = herramientasFiltradas.filter((herramienta) => {
          const estado = determinarEstadoStock(
            herramienta.cantidadActual,
            herramienta.cantidadMinima
          );
          return estado === filtros.estadoStock;
        });
      }

      // Filtro por estado de herramienta
      if (filtros.estadoHerramienta !== "todos") {
        herramientasFiltradas = herramientasFiltradas.filter(
          (herramienta) => herramienta.estado === filtros.estadoHerramienta
        );
      }

      // Filtro por fecha de ingreso
      if (filtros.fechaIngreso) {
        const fechaFiltro = new Date(filtros.fechaIngreso + "T00:00:00");
        herramientasFiltradas = herramientasFiltradas.filter((herramienta) => {
          if (!herramienta.fechaIngreso) return false;
          const fechaHerramienta = new Date(herramienta.fechaIngreso);
          return fechaHerramienta >= fechaFiltro;
        });
      }

      // Filtro por fecha de actualización
      if (filtros.fechaActualizacion) {
        const fechaFiltro = new Date(filtros.fechaActualizacion + "T00:00:00");
        herramientasFiltradas = herramientasFiltradas.filter((herramienta) => {
          if (!herramienta.fechaActualizacion) return false;
          const fechaHerramienta = new Date(herramienta.fechaActualizacion);
          return fechaHerramienta >= fechaFiltro;
        });
      }

      setHerramientasFiltradas(herramientasFiltradas);
    } catch (error) {
      console.error("Error al filtrar herramientas:", error);
      setHerramientasFiltradas(herramientas);
    }
  }, [herramientas, busqueda, filtros]);

  // 📝 FUNCIÓN HELPER PARA MANEJAR CAMBIOS EN FORMULARIOS
  const manejarCambioFormulario = (campo, valor) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  // 📦 FUNCIÓN HELPER PARA MANEJAR CAMBIOS EN STOCK
  const manejarCambioStock = (campo, valor) => {
    setMovimientoData((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const manejarCambioFiltro = (tipoFiltro, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [tipoFiltro]: valor,
    }));
  };

  const resetearFiltros = () => {
    setFiltros({
      estadoStock: "todos",
      estadoHerramienta: "todos",
      fechaIngreso: "",
      fechaActualizacion: "",
    });
  };

  const determinarEstadoStock = (cantidadActual, cantidadMinima) => {
    if (cantidadActual <= cantidadMinima) return "critico";
    if (cantidadActual <= cantidadMinima * 2) return "bajo";
    return "normal";
  };

  const formatearFechaLocal = (fechaString) => {
    if (!fechaString) return "N/A";
    try {
      const [year, month, day] = fechaString.split("-");
      const fecha = new Date(year, month - 1, day);
      return fecha.toLocaleDateString("es-GT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Función para estilos responsive de modales
  const getResponsiveModalStyles = () => {
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;

    return {
      modalContent: {
        ...styles.modalContent,
        ...(isMobile && {
          maxWidth: "calc(100vw - 40px)",
          padding: "24px",
        }),
        ...(isSmallMobile && {
          padding: "20px",
        }),
      },
      modalFormContainer: {
        ...styles.modalFormContainer,
        ...(isMobile && {
          gridTemplateColumns: "1fr",
          gap: "16px",
        }),
      },
      modalActions: {
        ...styles.modalActions,
        ...(isMobile && {
          flexDirection: "column",
        }),
      },
    };
  };

  // 📦 FUNCIÓN MEJORADA PARA MANEJAR MOVIMIENTO DE STOCK
  const manejarMovimientoStock = async () => {
    try {
      setLoading(true);

      const cantidad = parseFloat(movimientoData.cantidad);
      const { motivo } = movimientoData;

      let response;
      if (tipoMovimiento === "ingreso") {
        response = await herramientasApi.ingresoStock(
          herramientaSeleccionada.id,
          cantidad,
          motivo
        );
      } else {
        response = await herramientasApi.salidaStock(
          herramientaSeleccionada.id,
          cantidad,
          motivo
        );
      }

      if (response.success) {
        const tipoTexto = tipoMovimiento === "ingreso" ? "Ingreso" : "Salida";
        toast.success(`${tipoTexto} registrado exitosamente`);
        await cargarDatos();
        setMostrarModalStock(false);
        setMovimientoData({ cantidad: "", motivo: "" });
      }
    } catch (error) {
      toast.error(error.message || "Error al procesar el movimiento");
    } finally {
      setLoading(false);
    }
  };

  // 📊 CARGAR DATOS PRINCIPALES
  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar herramientas y estadísticas en paralelo
      const [herramientasResponse, statsResponse] = await Promise.all([
        herramientasApi.obtenerHerramientas(),
        herramientasApi.obtenerEstadisticas(),
      ]);

      if (herramientasResponse.success) {
        setHerramientas(herramientasResponse.data);
        setHerramientasFiltradas(herramientasResponse.data);
      }

      if (statsResponse.success) {
        setEstadisticas(statsResponse.data);
      }

      console.log("✅ Datos cargados exitosamente");
    } catch (error) {
      console.error("❌ Error al cargar datos:", error);
      toast.error("Error al cargar las herramientas");
    } finally {
      setLoading(false);
    }
  };

  const recargarDatos = async () => {
    try {
      toast.info("Recargando datos...");

      // Resetear filtros y búsqueda
      setFiltros({
        estadoStock: "todos",
        estadoHerramienta: "todos",
        fechaIngreso: "",
        fechaActualizacion: "",
      });
      setBusqueda("");

      // Llamar a la función de carga existente
      await cargarDatos();

      toast.success("Datos actualizados");
    } catch (error) {
      console.error("Error al recargar datos:", error);
      toast.error("Error al actualizar los datos");
    }
  };

  // ➕ CREAR NUEVA HERRAMIENTA
  const crearHerramienta = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await herramientasApi.crearHerramienta(formData);

      if (response.success) {
        toast.success("Herramienta creada exitosamente");
        await cargarDatos(); // Recargar lista
        cerrarModalCrear();
      }
    } catch (error) {
      toast.error(error.message || "Error al crear la herramienta");
    } finally {
      setLoading(false);
    }
  };

  // ✏️ ACTUALIZAR HERRAMIENTA
  const actualizarHerramienta = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await herramientasApi.actualizarHerramienta(
        herramientaSeleccionada.id,
        formData
      );

      if (response.success) {
        toast.success("Herramienta actualizada exitosamente");
        await cargarDatos();
        cerrarModalEditar();
      }
    } catch (error) {
      toast.error(error.message || "Error al actualizar la herramienta");
    } finally {
      setLoading(false);
    }
  };

  // 📦 MOVIMIENTO DE STOCK (ingreso/salida)
  const procesarMovimientoStock = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const cantidad = parseFloat(movimientoData.cantidad);
      const { motivo } = movimientoData;

      let response;
      if (tipoMovimiento === "ingreso") {
        response = await herramientasApi.ingresoStock(
          herramientaSeleccionada.id,
          cantidad,
          motivo
        );
      } else {
        response = await herramientasApi.salidaStock(
          herramientaSeleccionada.id,
          cantidad,
          motivo
        );
      }

      if (response.success) {
        const tipoTexto = tipoMovimiento === "ingreso" ? "Ingreso" : "Salida";
        toast.success(`${tipoTexto} registrado exitosamente`);
        await cargarDatos();
        cerrarModalStock();
      }
    } catch (error) {
      toast.error(error.message || "Error al procesar el movimiento");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ ELIMINAR HERRAMIENTA
  const eliminarHerramienta = async (herramienta) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${herramienta.nombre}"?`)) {
      return;
    }

    try {
      setLoading(true);

      const response = await herramientasApi.eliminarHerramienta(
        herramienta.id
      );

      if (response.success) {
        toast.success("Herramienta eliminada exitosamente");
        await cargarDatos();
      }
    } catch (error) {
      toast.error(error.message || "Error al eliminar la herramienta");
    } finally {
      setLoading(false);
    }
  };

  // 📄 FUNCIONES DE MODAL
  const abrirModalCrear = () => {
    setFormData({
      nombre: "",
      marca: "",
      modelo: "",
      descripcion: "",
      medida: "",
      cantidadActual: 1,
      cantidadMinima: 0,
      estado: "Nuevo",
    });
    setMostrarModalCrear(true);
  };

  const cerrarModalCrear = () => {
    setMostrarModalCrear(false);
    setFormData({
      nombre: "",
      marca: "",
      modelo: "",
      descripcion: "",
      medida: "",
      cantidadActual: 1,
      cantidadMinima: 0,
      estado: "Nuevo",
    });
  };

  const abrirModalEditar = (herramienta) => {
    setHerramientaSeleccionada(herramienta);
    setFormData({
      nombre: herramienta.nombre,
      marca: herramienta.marca || "",
      modelo: herramienta.modelo || "",
      descripcion: herramienta.descripcion || "",
      medida: herramienta.medida || "",
      cantidadActual: herramienta.cantidadActual,
      cantidadMinima: Number(herramienta.cantidadMinima),
      estado: herramienta.estado,
    });
    setMostrarModalEditar(true);
  };

  const cerrarModalEditar = () => {
    setMostrarModalEditar(false);
    setHerramientaSeleccionada(null);
  };

  const abrirModalStock = (herramienta, tipo) => {
    setHerramientaSeleccionada(herramienta);
    setTipoMovimiento(tipo);
    setMovimientoData({ cantidad: "", motivo: "" });
    setMostrarModalStock(true);
  };

  const cerrarModalStock = () => {
    setMostrarModalStock(false);
    setHerramientaSeleccionada(null);
    setMovimientoData({ cantidad: "", motivo: "" });
  };

  // 📊 ABRIR MODAL DE REPORTES
  const abrirModalReportes = () => {
    setConfiguracionReporte({
      tipoReporte: "completo",
      estadoSeleccionado: "todos",
      nivelStockSeleccionado: "todos",
      incluirFechas: true,
      incluirDetalles: true,
    });
    setMostrarModalReportes(true);
  };

  const cerrarModalReportes = () => {
    setMostrarModalReportes(false);
  };

  // 📅 FORMATEAR FECHA PARA MOSTRAR
  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";

    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleDateString("es-GT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const validarConfiguracionReporte = () => {
    if (
      configuracionReporte.tipoReporte === "por-estado" &&
      configuracionReporte.estadoSeleccionado === "todos"
    ) {
      toast.warning(
        "Selecciona un estado específico para este tipo de reporte"
      );
      return false;
    }

    if (
      configuracionReporte.tipoReporte === "por-stock" &&
      configuracionReporte.nivelStockSeleccionado === "todos"
    ) {
      toast.warning(
        "Selecciona un nivel de stock específico para este tipo de reporte"
      );
      return false;
    }

    return true;
  };

  const generarReportePersonalizado = async () => {
    try {
      // Validar configuración primero
      if (!validarConfiguracionReporte()) {
        return;
      }

      setLoading(true);

      // Filtrar herramientas según configuración
      let herramientasFiltradas = [...herramientas];

      // Filtrar por estado de herramienta
      if (configuracionReporte.estadoSeleccionado !== "todos") {
        herramientasFiltradas = herramientasFiltradas.filter(
          (h) => h.estado === configuracionReporte.estadoSeleccionado
        );
      }

      // Filtrar por nivel de stock
      if (configuracionReporte.nivelStockSeleccionado !== "todos") {
        herramientasFiltradas = herramientasFiltradas.filter((h) => {
          const estadoStock = herramientasApi.getEstadoStock(
            h.cantidadActual,
            h.cantidadMinima
          );
          switch (configuracionReporte.nivelStockSeleccionado) {
            case "critico":
              return estadoStock.texto === "Stock Crítico";
            case "bajo":
              return estadoStock.texto === "Stock Bajo";
            case "normal":
              return estadoStock.texto === "Stock Normal";
            default:
              return true;
          }
        });
      }

      if (herramientasFiltradas.length === 0) {
        toast.warning(
          "No hay herramientas que coincidan con los filtros seleccionados"
        );
        return;
      }

      toast.info(
        `Generando reporte personalizado (${herramientasFiltradas.length} herramientas)...`,
        {
          autoClose: 2000,
        }
      );

      // Generar reporte usando el servicio CON LA CONFIGURACIÓN
      await reportesService.generarReporteCompletoHerramientas(
        herramientasFiltradas,
        estadisticas,
        configuracionReporte // IMPORTANTE: pasar toda la configuración
      );

      toast.success("Reporte personalizado descargado exitosamente");
      cerrarModalReportes();
    } catch (error) {
      console.error("Error al generar reporte personalizado:", error);
      toast.error(error.message || "Error al generar el reporte personalizado");
    } finally {
      setLoading(false);
    }
  };

  // 📊 GENERAR REPORTE PDF
  const generarReportePDF = async () => {
    try {
      setLoading(true);

      toast.info("📊 Generando reporte PDF completo...", {
        autoClose: 2000,
      });

      // Generar el reporte completo usando el servicio
      await reportesService.generarReporteCompletoHerramientas(
        herramientas,
        estadisticas,
        { tipoReporte: "completo" }
      );

      toast.success("✅ Reporte PDF descargado exitosamente");
    } catch (error) {
      console.error("❌ Error al generar reporte:", error);
      toast.error("Error al generar el reporte PDF");
    } finally {
      setLoading(false);
    }
  };


  // 🎨 RENDERIZADO DEL COMPONENTE
  if (loading && herramientas.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <RefreshCw size={40} className="spinning" />
        <h2>Cargando herramientas...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}>
            <Wrench size={32} style={{ marginRight: "12px" }} />
            Inventario de Herramientas
          </h1>
          <p style={styles.subtitle}>
            Gestión completa del inventario de herramientas y equipos
          </p>
        </div>

        {/* ✅ TODOS LOS BOTONES EN UN SOLO CONTENEDOR */}
        <div style={styles.headerActions}>
          {/* 📊 BOTÓN DE REPORTES */}
          <button
            style={styles.reportButton}
            onClick={abrirModalReportes}
            disabled={loading || herramientas.length === 0}
            title="Descargar reporte completo en PDF"
          >
            <FileText size={16} />
            Reporte PDF
          </button>

          <button
            style={styles.refreshButton}
            onClick={recargarDatos} // Cambiar de cargarDatos a recargarDatos
            disabled={loading}
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
          <button style={styles.addButton} onClick={abrirModalCrear}>
            <Plus size={16} />
            Nueva Herramienta
          </button>
        </div>
      </div>

      {/* ESTADÍSTICAS */}
      <div style={styles.statsContainer}>
        {/* Estadísticas de Stock */}
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Total Herramientas</h3>
          <p style={styles.statNumber}>
            {estadisticas.totalHerramientas || herramientas.length}
          </p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Stock Crítico</h3>
          <p style={{ ...styles.statNumber, color: "#e53e3e" }}>
            {estadisticas.stockCritico || 0}
          </p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Stock Bajo</h3>
          <p style={{ ...styles.statNumber, color: "#dd6b20" }}>
            {estadisticas.stockBajo || 0}
          </p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Stock Normal</h3>
          <p style={{ ...styles.statNumber, color: "#38a169" }}>
            {estadisticas.stockNormal || 0}
          </p>
        </div>

        {/* NUEVAS ESTADÍSTICAS DE ESTADO DE HERRAMIENTAS */}
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Nuevas</h3>
          <p style={{ ...styles.statNumber, color: "#48bb78" }}>
            {estadisticas.herramientasNuevas || 0}
          </p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Buen Estado</h3>
          <p style={{ ...styles.statNumber, color: "#4299e1" }}>
            {estadisticas.herramientasBuenEstado || 0}
          </p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Desgastadas</h3>
          <p style={{ ...styles.statNumber, color: "#ed8936" }}>
            {estadisticas.herramientasDesgastadas || 0}
          </p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>En Reparación</h3>
          <p style={{ ...styles.statNumber, color: "#ecc94b" }}>
            {estadisticas.herramientasEnReparacion || 0}
          </p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Dadas de Baja</h3>
          <p style={{ ...styles.statNumber, color: "#f56565" }}>
            {estadisticas.herramientasBaja || 0}
          </p>
        </div>
      </div>

      {/* BÚSQUEDA */}
      <div style={styles.searchContainer}>
        <div style={styles.searchBox}>
          <Search size={20} color="#6c757d" />
          <input
            type="text"
            placeholder="Buscar herramientas por nombre, marca, modelo, descripción o estado..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* CONTROLES DE FILTROS */}
      <div style={styles.filtersContainer}>
        <div style={styles.filtersRow}>
          {/* Filtro por Estado de Stock */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Estado del Stock:</label>
            <select
              value={filtros.estadoStock}
              onChange={(e) =>
                manejarCambioFiltro("estadoStock", e.target.value)
              }
              style={styles.filterSelect}
            >
              <option value="todos">📦 Todos los estados</option>
              <option value="critico">🔴 Stock Crítico</option>
              <option value="bajo">🟡 Stock Bajo</option>
              <option value="normal">🟢 Stock Normal</option>
            </select>
          </div>

          {/* Filtro por Estado de Herramienta */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Estado Herramienta:</label>
            <select
              value={filtros.estadoHerramienta}
              onChange={(e) =>
                manejarCambioFiltro("estadoHerramienta", e.target.value)
              }
              style={styles.filterSelect}
            >
              <option value="todos">🔧 Todos los estados</option>
              <option value="Nuevo">✨ Nuevo</option>
              <option value="En buen estado">👍 En buen estado</option>
              <option value="Desgastado">⚠️ Desgastado</option>
              <option value="En reparación">🔨 En reparación</option>
              <option value="Baja">❌ Baja</option>
            </select>
          </div>

          {/* Filtro por Fecha de Ingreso */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Ingresadas desde:</label>
            <input
              type="date"
              value={filtros.fechaIngreso}
              onChange={(e) =>
                manejarCambioFiltro("fechaIngreso", e.target.value)
              }
              style={styles.filterSelect}
            />
          </div>

          {/* Filtro por Fecha de Actualización */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Actualizadas desde:</label>
            <input
              type="date"
              value={filtros.fechaActualizacion}
              onChange={(e) =>
                manejarCambioFiltro("fechaActualizacion", e.target.value)
              }
              style={styles.filterSelect}
            />
          </div>

          {/* Botón para resetear filtros */}
          <div style={styles.filterGroup}>
            <button
              onClick={resetearFiltros}
              style={styles.resetButton}
              title="Resetear todos los filtros"
            >
              <RefreshCw size={16} />
              Resetear
            </button>
          </div>
        </div>

        {/* Indicador de filtros activos */}
        {(filtros.estadoStock !== "todos" ||
          filtros.estadoHerramienta !== "todos" ||
          filtros.fechaIngreso ||
          filtros.fechaActualizacion) && (
          <div style={styles.activeFiltersInfo}>
            <span style={styles.activeFiltersText}>
              Filtros activos:
              {filtros.estadoStock !== "todos" && (
                <span style={styles.filterTag}>
                  Stock: {filtros.estadoStock}
                </span>
              )}
              {filtros.estadoHerramienta !== "todos" && (
                <span style={styles.filterTag}>
                  Estado: {filtros.estadoHerramienta}
                </span>
              )}
              {filtros.fechaIngreso && (
                <span style={styles.filterTag}>
                  Desde: {formatearFechaLocal(filtros.fechaIngreso)}
                </span>
              )}
              {filtros.fechaActualizacion && (
                <span style={styles.filterTag}>
                  Actualizadas:{" "}
                  {formatearFechaLocal(filtros.fechaActualizacion)}
                </span>
              )}
            </span>
            <span style={styles.resultsCount}>
              ({herramientasFiltradas.length} herramientas encontradas)
            </span>
          </div>
        )}
      </div>

      {/* TABLA DE HERRAMIENTAS */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Herramienta</th>
              <th style={styles.th}>Marca/Modelo</th>
              <th style={styles.th}>Descripción</th>
              <th style={styles.th}>Medida</th>
              <th style={styles.th}>Stock Actual</th>
              <th style={styles.th}>Stock Mínimo</th>
              <th style={styles.th}>Estado Stock</th> {/* NUEVA COLUMNA */}
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Fecha Ingreso</th>
              <th style={styles.th}>Última Actualización</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {herramientasFiltradas.length > 0 ? (
              herramientasFiltradas.map((herramienta) => {
                const estadoStock = herramientasApi.getEstadoStock(
                  herramienta.cantidadActual,
                  herramienta.cantidadMinima
                );
                const estadoHerramienta = herramientasApi.getEstadoColor(
                  herramienta.estado
                );
                return (
                  <tr key={herramienta.id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <strong>{herramienta.nombre}</strong>
                    </td>
                    <td style={styles.td}>
                      {herramienta.marca || herramienta.modelo ? (
                        <div>
                          {herramienta.marca && <div>{herramienta.marca}</div>}
                          {herramienta.modelo && (
                            <small style={{ color: "#718096" }}>
                              Modelo: {herramienta.modelo}
                            </small>
                          )}
                        </div>
                      ) : (
                        "Sin especificar"
                      )}
                    </td>
                    <td style={styles.td}>
                      {herramienta.descripcion || "Sin descripción"}
                    </td>
                    <td style={styles.td}>
                      {herramienta.medida || "No definida"}
                    </td>
                    <td style={{ ...styles.td, fontWeight: "bold" }}>
                      {herramienta.cantidadActual}
                    </td>
                    <td style={styles.td}>{herramienta.cantidadMinima}</td>
                    {/* NUEVA COLUMNA DE ESTADO DE STOCK */}
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.estadoBadge,
                          color: estadoStock.color,
                          backgroundColor: estadoStock.bg,
                        }}
                      >
                        {estadoStock.texto}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.estadoBadge,
                          color: estadoHerramienta.color,
                          backgroundColor: estadoHerramienta.bg,
                        }}
                      >
                        {herramienta.estado}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {formatearFecha(herramienta.fechaIngreso)}
                    </td>
                    <td style={styles.td}>
                      {formatearFecha(herramienta.fechaActualizacion)}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button
                          style={styles.ingresoButton}
                          title="Ingreso de Stock"
                          onClick={() =>
                            abrirModalStock(herramienta, "ingreso")
                          }
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          style={styles.salidaButton}
                          title="Salida de Stock"
                          onClick={() => abrirModalStock(herramienta, "salida")}
                        >
                          <ArrowDown size={16} />
                        </button>
                        <button
                          style={styles.editButton}
                          title="Editar"
                          onClick={() => abrirModalEditar(herramienta)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          style={styles.deleteButton}
                          title="Eliminar"
                          onClick={() => eliminarHerramienta(herramienta)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="11" style={styles.noResults}>
                  {" "}
                  {/* Cambiar de 10 a 11 columnas */}
                  {busqueda
                    ? `No se encontraron herramientas que coincidan con "${busqueda}"`
                    : "No hay herramientas registradas"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE REPORTES PERSONALIZADOS - FORMATO CORREGIDO */}
      {mostrarModalReportes && (
        <div style={styles.modalOverlay} onClick={cerrarModalReportes}>
          <div
            style={{
              ...getResponsiveModalStyles().modalContent,
              maxWidth: "700px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={styles.modalTitle}>Generar Reporte de Herramientas</h3>

            <div style={styles.reportConfigContainer}>
              {/* TIPO DE REPORTE */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Tipo de Reporte</label>
                <select
                  value={configuracionReporte.tipoReporte}
                  onChange={(e) => {
                    setConfiguracionReporte({
                      ...configuracionReporte,
                      tipoReporte: e.target.value,
                      estadoSeleccionado:
                        e.target.value === "por-estado" ? "Nuevo" : "todos",
                      nivelStockSeleccionado:
                        e.target.value === "por-stock" ? "critico" : "todos",
                    });
                  }}
                  style={styles.select}
                >
                  <option value="completo">📊 Reporte Completo</option>
                  <option value="por-estado">
                    🔧 Por Estado de Herramienta
                  </option>
                  <option value="por-stock">📦 Por Nivel de Stock</option>
                </select>
              </div>

              {/* FILTRO POR ESTADO DE HERRAMIENTA */}
              {configuracionReporte.tipoReporte === "por-estado" && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Estado de Herramienta</label>
                  <select
                    value={configuracionReporte.estadoSeleccionado}
                    onChange={(e) =>
                      setConfiguracionReporte({
                        ...configuracionReporte,
                        estadoSeleccionado: e.target.value,
                      })
                    }
                    style={styles.select}
                  >
                    <option value="Nuevo">✨ Nuevo</option>
                    <option value="En buen estado">👍 En buen estado</option>
                    <option value="Desgastado">⚠️ Desgastado</option>
                    <option value="En reparación">🔨 En reparación</option>
                    <option value="Baja">❌ Baja</option>
                  </select>
                </div>
              )}

              {/* FILTRO POR NIVEL DE STOCK */}
              {configuracionReporte.tipoReporte === "por-stock" && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nivel de Stock</label>
                  <select
                    value={configuracionReporte.nivelStockSeleccionado}
                    onChange={(e) =>
                      setConfiguracionReporte({
                        ...configuracionReporte,
                        nivelStockSeleccionado: e.target.value,
                      })
                    }
                    style={styles.select}
                  >
                    <option value="critico">🔴 Stock Crítico</option>
                    <option value="bajo">🟡 Stock Bajo</option>
                    <option value="normal">🟢 Stock Normal</option>
                  </select>
                </div>
              )}

              {/* OPCIONES ADICIONALES */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Opciones del Reporte</label>
                <div style={styles.checkboxGroup}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={configuracionReporte.incluirFechas}
                      onChange={(e) =>
                        setConfiguracionReporte({
                          ...configuracionReporte,
                          incluirFechas: e.target.checked,
                        })
                      }
                      style={styles.checkbox}
                    />
                    Incluir fechas de ingreso
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={configuracionReporte.incluirDetalles}
                      onChange={(e) =>
                        setConfiguracionReporte({
                          ...configuracionReporte,
                          incluirDetalles: e.target.checked,
                        })
                      }
                      style={styles.checkbox}
                    />
                    Incluir descripción y medida
                  </label>
                </div>
              </div>

              {/* VISTA PREVIA */}
              <div style={styles.previewSection}>
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#2d3748",
                  }}
                >
                  Vista Previa del Reporte
                </h4>
                <div style={styles.previewContent}>
                  <p style={{ margin: "8px 0" }}>
                    <strong>Tipo:</strong>{" "}
                    {(() => {
                      switch (configuracionReporte.tipoReporte) {
                        case "completo":
                          return "Reporte completo";
                        case "por-estado":
                          return `Filtrado por estado: ${configuracionReporte.estadoSeleccionado}`;
                        case "por-stock":
                          return `Filtrado por stock: ${configuracionReporte.nivelStockSeleccionado}`;
                        default:
                          return "Sin definir";
                      }
                    })()}
                  </p>

                  <p style={{ margin: "8px 0" }}>
                    <strong>Herramientas estimadas:</strong>{" "}
                    {(() => {
                      let filtradas = herramientas;
                      if (configuracionReporte.estadoSeleccionado !== "todos") {
                        filtradas = filtradas.filter(
                          (h) =>
                            h.estado === configuracionReporte.estadoSeleccionado
                        );
                      }
                      if (
                        configuracionReporte.nivelStockSeleccionado !== "todos"
                      ) {
                        filtradas = filtradas.filter((h) => {
                          const estadoStock = herramientasApi.getEstadoStock(
                            h.cantidadActual,
                            h.cantidadMinima
                          );
                          switch (configuracionReporte.nivelStockSeleccionado) {
                            case "critico":
                              return estadoStock.texto === "Stock Crítico";
                            case "bajo":
                              return estadoStock.texto === "Stock Bajo";
                            case "normal":
                              return estadoStock.texto === "Stock Normal";
                            default:
                              return true;
                          }
                        });
                      }
                      return filtradas.length;
                    })()}{" "}
                    herramientas
                  </p>
                </div>
              </div>
            </div>

            <div style={getResponsiveModalStyles().modalActions}>
              <button
                type="button"
                onClick={cerrarModalReportes}
                style={styles.cancelButton}
              >
                Cancelar
              </button>
              <button
                onClick={generarReportePersonalizado}
                style={styles.saveButton}
                disabled={loading}
              >
                {loading ? "Generando..." : "Generar Reporte"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR HERRAMIENTA */}
      {mostrarModalCrear && (
        <div style={styles.modalOverlay} onClick={cerrarModalCrear}>
          <div
            style={getResponsiveModalStyles().modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={styles.modalTitle}>Crear Nueva Herramienta</h3>

            <form onSubmit={crearHerramienta}>
              <div style={getResponsiveModalStyles().modalFormContainer}>
                {/* COLUMNA IZQUIERDA */}
                <div style={styles.modalColumn}>
                  {/* NOMBRE DE LA HERRAMIENTA */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Nombre de la Herramienta*
                    </label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) =>
                          setFormData({ ...formData, nombre: e.target.value })
                        }
                        style={styles.input}
                        required
                        maxLength={30}
                        placeholder="Ej: Martillo, Taladro, Llave inglesa..."
                      />
                      <span
                        style={{
                          ...styles.charCounter,
                          ...(formData.nombre.length > 25
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.nombre.length >= 30
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.nombre.length}/30
                      </span>
                    </div>
                  </div>

                  {/* MARCA */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Marca</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        value={formData.marca}
                        onChange={(e) =>
                          setFormData({ ...formData, marca: e.target.value })
                        }
                        style={styles.input}
                        maxLength={15}
                        placeholder="Ej: Stanley, DeWalt, Bosch..."
                      />
                      <span
                        style={{
                          ...styles.charCounter,
                          ...(formData.marca.length > 12
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.marca.length >= 15
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.marca.length}/15
                      </span>
                    </div>
                  </div>

                  {/* MODELO */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Modelo</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        value={formData.modelo}
                        onChange={(e) =>
                          setFormData({ ...formData, modelo: e.target.value })
                        }
                        style={styles.input}
                        maxLength={15}
                        placeholder="Ej: ST-16, DCD771C2..."
                      />
                      <span
                        style={{
                          ...styles.charCounter,
                          ...(formData.modelo.length > 12
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.modelo.length >= 15
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.modelo.length}/15
                      </span>
                    </div>
                  </div>

                  {/* CANTIDAD INICIAL */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Cantidad Inicial</label>
                    <input
                      type="number"
                      value={formData.cantidadActual}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cantidadActual: parseFloat(e.target.value) || 0,
                        })
                      }
                      style={styles.input}
                      min="0"
                      step="any"
                      max="99999999.99"
                    />
                  </div>
                </div>

                {/* COLUMNA DERECHA */}
                <div style={styles.modalColumn}>
                  {/* DESCRIPCIÓN */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Descripción</label>
                    <div style={styles.inputWithCounter}>
                      <textarea
                        value={formData.descripcion}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            descripcion: e.target.value,
                          })
                        }
                        style={styles.textarea}
                        maxLength={40}
                        placeholder="Descripción breve..."
                        rows={2}
                      />
                      <span
                        style={{
                          ...styles.charCounter,
                          ...(formData.descripcion.length > 35
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.descripcion.length >= 40
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.descripcion.length}/40
                      </span>
                    </div>
                  </div>

                  {/* MEDIDA/TAMAÑO */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Medida/Tamaño</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        value={formData.medida}
                        onChange={(e) =>
                          setFormData({ ...formData, medida: e.target.value })
                        }
                        style={styles.input}
                        maxLength={20}
                        placeholder="Ej: 16 oz, 18V, 10mm..."
                      />
                      <span
                        style={{
                          ...styles.charCounter,
                          ...(formData.medida.length > 17
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.medida.length >= 20
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.medida.length}/20
                      </span>
                    </div>
                  </div>

                  {/* ESTADO */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Estado</label>
                    <select
                      value={formData.estado}
                      onChange={(e) =>
                        setFormData({ ...formData, estado: e.target.value })
                      }
                      style={styles.select}
                    >
                      {herramientasApi.getEstadosValidos().map((estado) => (
                        <option key={estado.valor} value={estado.valor}>
                          {estado.texto}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* STOCK MÍNIMO */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Stock Mínimo</label>
                    <input
                      type="number"
                      value={formData.cantidadMinima}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cantidadMinima: parseFloat(e.target.value) || 0,
                        })
                      }
                      style={styles.input}
                      min="0"
                      step="any"
                      max="99999999.99"
                    />
                  </div>
                </div>
              </div>

              <div style={getResponsiveModalStyles().modalActions}>
                <button
                  type="button"
                  onClick={cerrarModalCrear}
                  style={styles.cancelButton}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={styles.saveButton}
                  disabled={loading}
                >
                  {loading ? "Creando..." : "Crear Herramienta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR HERRAMIENTA */}
      {mostrarModalEditar && (
        <div style={styles.modalOverlay} onClick={cerrarModalEditar}>
          <div
            style={getResponsiveModalStyles().modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={styles.modalTitle}>Editar Herramienta</h3>

            <form onSubmit={actualizarHerramienta}>
              <div style={getResponsiveModalStyles().modalFormContainer}>
                {/* COLUMNA IZQUIERDA */}
                <div style={styles.modalColumn}>
                  {/* NOMBRE DE LA HERRAMIENTA */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Nombre de la Herramienta*
                    </label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) =>
                          setFormData({ ...formData, nombre: e.target.value })
                        }
                        style={styles.input}
                        required
                        maxLength={30}
                        placeholder="Ej: Martillo, Taladro, Llave inglesa..."
                      />
                      <span
                        style={{
                          ...styles.charCounter,
                          ...(formData.nombre.length > 25
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.nombre.length >= 30
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.nombre.length}/30
                      </span>
                    </div>
                  </div>

                  {/* MARCA */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Marca</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        value={formData.marca}
                        onChange={(e) =>
                          setFormData({ ...formData, marca: e.target.value })
                        }
                        style={styles.input}
                        maxLength={15}
                        placeholder="Ej: Stanley, Dewalt..."
                      />
                      <span
                        style={{
                          ...styles.charCounter,
                          ...(formData.marca.length > 12
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.marca.length >= 15
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.marca.length}/15
                      </span>
                    </div>
                  </div>

                  {/* MODELO */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Modelo</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        value={formData.modelo}
                        onChange={(e) =>
                          setFormData({ ...formData, modelo: e.target.value })
                        }
                        style={styles.input}
                        maxLength={15}
                        placeholder="Ej: ST-16, DCD771C2..."
                      />
                      <span
                        style={{
                          ...styles.charCounter,
                          ...(formData.modelo.length > 12
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.modelo.length >= 15
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.modelo.length}/15
                      </span>
                    </div>
                  </div>

                  {/* STOCK MÍNIMO */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Stock Mínimo</label>
                    <input
                      type="number"
                      value={formData.cantidadMinima}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cantidadMinima: parseFloat(e.target.value) || 0,
                        })
                      }
                      style={styles.input}
                      min="0"
                      step="any"
                      max="99999999.99"
                    />
                  </div>
                </div>

                {/* COLUMNA DERECHA */}
                <div style={styles.modalColumn}>
                  {/* DESCRIPCIÓN */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Descripción</label>
                    <div style={styles.inputWithCounter}>
                      <textarea
                        value={formData.descripcion}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            descripcion: e.target.value,
                          })
                        }
                        style={styles.textarea}
                        maxLength={40}
                        placeholder="Descripcion breve..."
                      />
                      <span
                        style={{
                          ...styles.charCounter,
                          ...(formData.descripcion.length > 35
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.descripcion.length >= 40
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.descripcion.length}/40
                      </span>
                    </div>
                  </div>

                  {/* MEDIDA/TAMAÑO */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Medida/Tamaño</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        value={formData.medida}
                        onChange={(e) =>
                          setFormData({ ...formData, medida: e.target.value })
                        }
                        style={styles.input}
                        maxLength={20}
                        placeholder="Ej: 16 oz, 18V, 10mm..."
                      />
                      <span
                        style={{
                          ...styles.charCounter,
                          ...(formData.medida.length > 17
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.medida.length >= 20
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.medida.length}/20
                      </span>
                    </div>
                  </div>

                  {/* ESTADO */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Estado</label>
                    <select
                      value={formData.estado}
                      onChange={(e) =>
                        setFormData({ ...formData, estado: e.target.value })
                      }
                      style={styles.select}
                    >
                      {herramientasApi.getEstadosValidos().map((estado) => (
                        <option key={estado.valor} value={estado.valor}>
                          {estado.texto}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* INFORMACIÓN DEL STOCK ACTUAL */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Stock Actual</label>
                    <div
                      style={{
                        ...styles.input,
                        backgroundColor: "#f7fafc",
                        color: "#4a5568",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                      }}
                    >
                      {herramientaSeleccionada?.cantidadActual} unidades
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        margin: "4px 0 0 0",
                        fontStyle: "italic",
                      }}
                    >
                      💡 Para modificar el stock usa los botones de
                      Ingreso/Salida
                    </p>
                  </div>
                </div>

                {/* INFORMACIÓN ADICIONAL - OCUPA TODA LA FILA */}
                <div style={{ ...styles.infoBox, ...styles.modalFullWidth }}>
                  <p
                    style={{ margin: "0", fontSize: "14px", color: "#2d3748" }}
                  >
                    <strong>Herramienta seleccionada:</strong>{" "}
                    {herramientaSeleccionada?.nombre}
                  </p>
                </div>
              </div>

              <div style={getResponsiveModalStyles().modalActions}>
                <button
                  type="button"
                  onClick={cerrarModalEditar}
                  style={styles.cancelButton}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={styles.saveButton}
                  disabled={loading}
                >
                  {loading ? "Actualizando..." : "Actualizar Herramienta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MOVIMIENTO DE STOCK - VERSIÓN SIMPLIFICADA */}
      {mostrarModalStock && (
        <div style={styles.modalOverlay} onClick={cerrarModalStock}>
          <div
            style={{
              ...getResponsiveModalStyles().modalContent,
              maxWidth: "450px", // Más pequeño que los otros modales
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={styles.modalTitle}>
              {tipoMovimiento === "ingreso"
                ? "Ingreso de Stock"
                : "Salida de Stock"}
            </h3>

            {/* INFORMACIÓN DE LA HERRAMIENTA - SIMPLIFICADA */}
            <div style={styles.formGroup}>
              <p
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#2d3748",
                  textAlign: "center",
                }}
              >
                {herramientaSeleccionada?.nombre}
              </p>
              <p
                style={{
                  margin: "0 0 24px 0",
                  fontSize: "14px",
                  color: "#718096",
                  textAlign: "center",
                }}
              >
                Stock actual:{" "}
                <strong>{herramientaSeleccionada?.cantidadActual}</strong>{" "}
                unidades
              </p>
            </div>

            <form onSubmit={procesarMovimientoStock}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Cantidad a{" "}
                  {tipoMovimiento === "ingreso" ? "ingresar" : "sacar"} *
                </label>
                <input
                  type="number"
                  value={movimientoData.cantidad}
                  onChange={(e) =>
                    setMovimientoData({
                      ...movimientoData,
                      cantidad: e.target.value,
                    })
                  }
                  style={styles.input}
                  min="0"
                  step="any"
                  required
                  placeholder="0.00"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Motivo (opcional)</label>
                <input
                  type="text"
                  value={movimientoData.motivo}
                  onChange={(e) =>
                    setMovimientoData({
                      ...movimientoData,
                      motivo: e.target.value,
                    })
                  }
                  style={styles.input}
                  maxLength={40}
                  placeholder={
                    tipoMovimiento === "ingreso"
                      ? "ej: Compra, Devolución"
                      : "ej: Proyecto ABC, Venta"
                  }
                />
              </div>

              {/* MENSAJE DE ADVERTENCIA PARA SALIDAS */}
              {tipoMovimiento === "salida" &&
                parseFloat(movimientoData.cantidad) >
                  herramientaSeleccionada?.cantidadActual && (
                  <div style={styles.warningMessage}>
                    <span>⚠️</span>
                    <span>
                      No hay suficiente stock. Disponible:{" "}
                      {herramientaSeleccionada?.cantidadActual}
                    </span>
                  </div>
                )}

              <div style={getResponsiveModalStyles().modalActions}>
                <button
                  type="button"
                  onClick={cerrarModalStock}
                  style={styles.cancelButton}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    ...styles.saveButton,
                    backgroundColor:
                      tipoMovimiento === "ingreso" ? "#48bb78" : "#ed8936",
                  }}
                  disabled={
                    loading ||
                    !movimientoData.cantidad ||
                    parseFloat(movimientoData.cantidad) <= 0 ||
                    (tipoMovimiento === "salida" &&
                      parseFloat(movimientoData.cantidad) >
                        herramientaSeleccionada?.cantidadActual)
                  }
                >
                  {loading ? "Procesando..." : "Confirmar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 🎨 ESTILOS DEL COMPONENTE - ESTANDARIZADO CON MATERIALESCRUD
const styles = {
  // Y agregar estos estilos al objeto styles:
  reportButtons: {
    display: "flex",
    gap: "8px",
  },

  reportButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "12px 16px",
    backgroundColor: "#805ad5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },

  reportButtonCritical: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "12px 16px",
    backgroundColor: "#e53e3e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

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

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "2px solid #e2e8f0",
    flexWrap: "wrap", // Agregar esta línea
    gap: "20px",
  },

  titleSection: {
    flex: 1,
     minWidth: "300px"
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
  gap: "12px", // Cambiar de 8px a 12px
  flexWrap: "wrap", // AGREGAR
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

  addButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
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

  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", // Cambiar de 180px a 140px
    gap: "15px", // Reducir gap de 20px a 15px
    marginBottom: "30px",
  },

  statCard: {
    backgroundColor: "#f7fafc",
    padding: "15px", // Reducir padding de 20px a 15px
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    textAlign: "center",
  },

  statTitle: {
    fontSize: "12px", // Reducir de 14px a 12px
    fontWeight: "600",
    color: "#718096",
    margin: "0 0 6px 0", // Reducir margen
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  statNumber: {
    fontSize: "24px", // Reducir de 28px a 24px
    fontWeight: "700",
    color: "#2d3748",
    margin: "0",
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
    overflowX: "auto", // Agregar scroll horizontal
    overflowY: "auto", // Agregar scroll vertical si es necesario
    maxHeight: "70vh", // Agregar altura máxima
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1000px",
  },

  tableHeader: {
    backgroundColor: "#f7fafc",
  },

  th: {
    padding: "16px 8px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "600",
    color: "#4a5568",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap", // Evitar que el texto se corte
    position: "sticky", // Hacer el header sticky
    top: "0",
    backgroundColor: "#f7fafc",
    zIndex: "10",
  },

  tableRow: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background-color 0.2s ease",
  },

  td: {
    padding: "16px 8px",
    fontSize: "13px",
    color: "#2d3748",
    whiteSpace: "nowrap",
  },

  estadoBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  actionButtons: {
    display: "flex",
    gap: "6px",
  },

  ingresoButton: {
    padding: "6px",
    backgroundColor: "#48bb78",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },

  salidaButton: {
    padding: "6px",
    backgroundColor: "#ed8936",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },

  editButton: {
    padding: "6px",
    backgroundColor: "#4299e1",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },

  deleteButton: {
    padding: "6px",
    backgroundColor: "#f56565",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },

  noResults: {
    textAlign: "center",
    padding: "40px",
    color: "#718096",
    fontStyle: "italic",
  },
  // Botones específicos para modales de stock
  ingresoButtonModal: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    backgroundColor: "#48bb78", // Verde para ingreso
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  salidaButtonModal: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    backgroundColor: "#ed8936", // Naranja para salida
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  // ESTILOS DE MODALES
  // ESTILOS DE MODALES - Actualizados para responsive
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
  },

  modalContent: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "32px",
    width: "100%",
    maxWidth: "700px", // Más ancho para 2 columnas
    height: "auto",
    maxHeight: "85vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    position: "relative",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid #e2e8f0",
  },

  modalTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: "24px",
    textAlign: "center",
    paddingBottom: "16px",
    borderBottom: "2px solid #e2e8f0",
  },

  closeButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#718096",
    padding: "4px",
  },

  modalBody: {
    padding: "20px",
  },

  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    padding: "20px",
    borderTop: "1px solid #e2e8f0",
  },

  // FORMULARIOS - Actualizados
  modalFormContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    marginBottom: "24px",
  },

  modalColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  modalFullWidth: {
    gridColumn: "1 / -1",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  label: {
    fontSize: "14px",
    fontWeight: "600", // Esto hace que sea bold
    color: "#4a5568",
    marginBottom: "0",
  },

  input: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "16px",
    fontFamily: "Arial, sans-serif",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    boxSizing: "border-box",
    backgroundColor: "#fff",
  },

  select: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "16px",
    backgroundColor: "white",
    cursor: "pointer",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },

  charCount: {
    fontSize: "12px",
    color: "#718096",
  },

  helpText: {
    fontSize: "12px",
    color: "#718096",
    fontStyle: "italic",
  },

  stockInfo: {
    backgroundColor: "#f7fafc",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
  },

  stockInfoTitle: {
    margin: "0 0 8px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "#2d3748",
  },

  stockInfoText: {
    margin: "4px 0",
    fontSize: "14px",
    color: "#4a5568",
  },

  /// BOTONES - Actualizados
  cancelButton: {
    padding: "10px 16px",
    backgroundColor: "#e2e8f0",
    color: "#4a5568",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  saveButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 16px",
    backgroundColor: "#48bb78",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  inputWithCounter: {
    position: "relative",
    marginBottom: "20px",
  },

  charCounter: {
    position: "absolute",
    right: "8px",
    bottom: "-18px",
    fontSize: "12px",
    color: "#718096",
    fontWeight: "500",
  },

  textarea: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "16px",
    fontFamily: "Arial, sans-serif",
    resize: "vertical",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    boxSizing: "border-box",
    backgroundColor: "#fff",
    minHeight: "50px",
  },

  infoBox: {
    backgroundColor: "#e6f3ff",
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #bee3f8",
    gridColumn: "1 / -1",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #e2e8f0",
  },

  modalContentLarge: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "30px",
    width: "90%",
    maxWidth: "700px", // Más ancho para el modal de reportes
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  },

  reportConfigContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  checkboxGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#4a5568",
    cursor: "pointer",
  },

  checkbox: {
    width: "16px",
    height: "16px",
    cursor: "pointer",
  },

  previewSection: {
    backgroundColor: "#f7fafc",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },

  previewContent: {
    fontSize: "14px",
    color: "#4a5568",
    lineHeight: "1.5",
  },
  modalContentElegant: {
    backgroundColor: "white",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "650px",
    maxHeight: "85vh",
    overflow: "hidden",
    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
    border: "1px solid #e2e8f0",
  },

  modalHeaderElegant: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 28px 20px 28px",
    borderBottom: "1px solid #f1f5f9",
    backgroundColor: "#fafbfc",
  },

  modalTitleSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  iconContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    backgroundColor: "#e2f8ff",
    borderRadius: "8px",
    color: "#0369a1",
  },

  modalTitleElegant: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    letterSpacing: "-0.01em",
  },

  closeButtonElegant: {
    background: "none",
    border: "none",
    fontSize: "22px",
    cursor: "pointer",
    color: "#64748b",
    padding: "4px",
    borderRadius: "6px",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
  },

  modalBodyElegant: {
    padding: "28px",
    maxHeight: "60vh",
    overflowY: "auto",
  },

  formGroupElegant: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  labelElegant: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "2px",
  },

  inputElegant: {
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    backgroundColor: "#fff",
    outline: "none",
  },

  selectElegant: {
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
    outline: "none",
    transition: "all 0.2s ease",
  },

  charCountElegant: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "2px",
  },

  stockInfoElegant: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "16px",
    marginTop: "8px",
  },

  stockInfoHeader: {
    marginBottom: "8px",
  },

  helpTextElegant: {
    fontSize: "12px",
    color: "#6b7280",
    fontStyle: "italic",
    display: "block",
    marginTop: "6px",
  },

  modalFooterElegant: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "16px 24px 20px 24px",
    backgroundColor: "#fafbfc",
    borderTop: "1px solid #f1f5f9",
  },

  cancelButtonElegant: {
    padding: "10px 20px",
    backgroundColor: "#f8fafc",
    color: "#6b7280",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  primaryButtonElegant: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  // Estilos para los filtros
  filtersContainer: {
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "25px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },

  filtersRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    alignItems: "end",
  },

  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  filterLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#4a5568",
  },

  filterSelect: {
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "white",
    cursor: "pointer",
    fontFamily: "Arial, sans-serif",
    transition: "border-color 0.2s ease",
  },

  resetButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 16px",
    backgroundColor: "#718096",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },

  activeFiltersInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "16px",
    padding: "12px",
    backgroundColor: "#f0f9ff",
    border: "1px solid #bae6fd",
    borderRadius: "8px",
    flexWrap: "wrap",
    gap: "8px",
  },

  activeFiltersText: {
    fontSize: "14px",
    color: "#0c4a6e",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  filterTag: {
    backgroundColor: "#0ea5e9",
    color: "white",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },

  resultsCount: {
    fontSize: "13px",
    color: "#374151",
    fontWeight: "600",
  },

  warningMessage: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    color: "#dc2626",
    fontSize: "14px",
    fontWeight: "500",
    marginTop: "16px",
  },
};

export default HerramientasCRUD;
