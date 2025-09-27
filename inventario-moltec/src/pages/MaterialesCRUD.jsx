// pages/MaterialesCRUD.jsx - CRUD completo de materiales
import React, { useState, useEffect } from "react";
import {
  Package,
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
import materialesApi from "../services/materialesApi";
import reportesService from "../services/reportesService";

const MaterialesCRUD = () => {
  // 🎯 ESTADOS PRINCIPALES
  const [materiales, setMateriales] = useState([]);
  const [materialesFiltrados, setMaterialesFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    totalMateriales: 0,
    stockCritico: 0,
    stockBajo: 0,
    stockNormal: 0,
  });

  // 🔍 ESTADOS DE BÚSQUEDA Y FILTROS
  const [busqueda, setBusqueda] = useState("");

  // 📝 ESTADOS DE FORMULARIOS
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [mostrarModalStock, setMostrarModalStock] = useState(false);
  const [materialSeleccionado, setMaterialSeleccionado] = useState(null);
  const [tipoMovimiento, setTipoMovimiento] = useState("ingreso"); // 'ingreso' o 'salida'

  const [filtros, setFiltros] = useState({
    estadoStock: "todos", // "todos", "critico", "bajo", "normal"
    fechaIngreso: "", // fecha desde cuando filtrar ingresos
    fechaActualizacion: "", // fecha desde cuando filtrar actualizaciones
  });

  const [mostrarModalReportes, setMostrarModalReportes] = useState(false);
  const [configuracionReporte, setConfiguracionReporte] = useState({
    tipoReporte: "completo",
    nivelStockSeleccionado: "todos",
    incluirFechas: true,
    incluirDetalles: true,
  });

  // 📋 FORMULARIO CREAR/EDITAR
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    medida: "",
    cantidadActual: 0,
    cantidadMinima: 0,
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

  useEffect(() => {
    const handleResize = () => {
      // Forzar re-render cuando cambie el tamaño
      setLoading((prev) => prev);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔍 FILTRAR MATERIALES CUANDO CAMBIE LA BÚSQUEDA
  useEffect(() => {
    try {
      // Primero aplicar búsqueda por texto
      const tieneFiltroApi =
        typeof materialesApi?.buscarMateriales === "function";
      let materialesFiltradosPorTexto = tieneFiltroApi
        ? materialesApi.buscarMateriales(materiales, busqueda)
        : materiales.filter(
            (material) =>
              material.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
              material.descripcion
                ?.toLowerCase()
                .includes(busqueda.toLowerCase()) ||
              material.medida?.toLowerCase().includes(busqueda.toLowerCase())
          );

      // Luego aplicar filtros específicos
      let materialesFiltradosCompleto = materialesFiltradosPorTexto;

      // Filtro por estado de stock
      if (filtros.estadoStock !== "todos") {
        materialesFiltradosCompleto = materialesFiltradosCompleto.filter(
          (material) => {
            const estado = determinarEstadoStock(
              material.cantidadActual,
              material.cantidadMinima
            );
            return estado === filtros.estadoStock;
          }
        );
      }

      // Filtro por fecha de ingreso (desde la fecha seleccionada)
      if (filtros.fechaIngreso) {
        const fechaFiltro = new Date(filtros.fechaIngreso + "T00:00:00");
        materialesFiltradosCompleto = materialesFiltradosCompleto.filter(
          (material) => {
            if (!material.fechaIngreso) return false;
            const fechaMaterial = new Date(material.fechaIngreso);
            return fechaMaterial >= fechaFiltro;
          }
        );
      }

      // Filtro por fecha de actualización (desde la fecha seleccionada)
      if (filtros.fechaActualizacion) {
        const fechaFiltro = new Date(filtros.fechaActualizacion + "T00:00:00");
        materialesFiltradosCompleto = materialesFiltradosCompleto.filter(
          (material) => {
            if (!material.fechaActualizacion) return false;
            const fechaMaterial = new Date(material.fechaActualizacion);
            return fechaMaterial >= fechaFiltro;
          }
        );
      }

      setMaterialesFiltrados(materialesFiltradosCompleto || []);
    } catch (error) {
      console.error("Error al filtrar materiales:", error);
      setMaterialesFiltrados(materiales);
    }
  }, [materiales, busqueda, filtros]);
  // 📊 CARGAR DATOS PRINCIPALES
  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar materiales y estadísticas en paralelo
      const [materialesResponse, statsResponse] = await Promise.all([
        materialesApi.obtenerMateriales(),
        materialesApi.obtenerEstadisticas(),
      ]);

      if (materialesResponse.success) {
        setMateriales(materialesResponse.data);
        setMaterialesFiltrados(materialesResponse.data);
      }

      if (statsResponse.success) {
        setEstadisticas(statsResponse.data);
      }

      console.log("✅ Datos cargados exitosamente");
    } catch (error) {
      console.error("❌ Error al cargar datos:", error);
      toast.error("Error al cargar los materiales");
    } finally {
      setLoading(false);
    }
  };
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

  // 📄 RECARGAR DATOS CON NOTIFICACIONES
  const recargarDatos = async () => {
    try {
      toast.info("Recargando datos...");

      // Resetear filtros y búsqueda
      setFiltros({
        estadoStock: "todos",
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

  // ➕ CREAR NUEVO MATERIAL
  const crearMaterial = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await materialesApi.crearMaterial(formData);

      if (response.success) {
        toast.success("Material creado exitosamente");
        await cargarDatos(); // Recargar lista
        cerrarModalCrear();
      }
    } catch (error) {
      toast.error(error.message || "Error al crear el material");
    } finally {
      setLoading(false);
    }
  };

  // ✏️ ACTUALIZAR MATERIAL
  const actualizarMaterial = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await materialesApi.actualizarMaterial(
        materialSeleccionado.id,
        formData
      );

      if (response.success) {
        toast.success("Material actualizado exitosamente");
        await cargarDatos();
        cerrarModalEditar();
      }
    } catch (error) {
      toast.error(error.message || "Error al actualizar el material");
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
        response = await materialesApi.ingresoStock(
          materialSeleccionado.id,
          cantidad,
          motivo
        );
      } else {
        response = await materialesApi.salidaStock(
          materialSeleccionado.id,
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

  // 🗑️ ELIMINAR MATERIAL
  const eliminarMaterial = async (material) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${material.nombre}"?`)) {
      return;
    }

    try {
      setLoading(true);

      const response = await materialesApi.eliminarMaterial(material.id);

      if (response.success) {
        toast.success("Material eliminado exitosamente");
        await cargarDatos();
      }
    } catch (error) {
      toast.error(error.message || "Error al eliminar el material");
    } finally {
      setLoading(false);
    }
  };
  const formatearFechaLocal = (fechaString) => {
    if (!fechaString) return "N/A";

    try {
      // Crear fecha local sin afectar por timezone
      const [year, month, day] = fechaString.split("-");
      const fecha = new Date(year, month - 1, day); // month - 1 porque los meses son base 0

      return fecha.toLocaleDateString("es-GT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // 📊 ABRIR MODAL DE REPORTES
  const abrirModalReportes = () => {
    setConfiguracionReporte({
      tipoReporte: "completo",
      nivelStockSeleccionado: "todos",
      incluirFechas: true,
      incluirDetalles: true,
    });
    setMostrarModalReportes(true);
  };

  const cerrarModalReportes = () => {
    setMostrarModalReportes(false);
  };

  const validarConfiguracionReporte = () => {
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

      // Filtrar materiales según configuración
      let materialesFiltrados = [...materiales];

      // Filtrar por nivel de stock
      if (configuracionReporte.nivelStockSeleccionado !== "todos") {
        materialesFiltrados = materialesFiltrados.filter((m) => {
          const estadoStock = materialesApi.getEstadoStock(
            m.cantidadActual,
            m.cantidadMinima
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

      if (materialesFiltrados.length === 0) {
        toast.warning(
          "No hay materiales que coincidan con los filtros seleccionados"
        );
        return;
      }

      toast.info(
        `Generando reporte personalizado (${materialesFiltrados.length} materiales)...`,
        {
          autoClose: 2000,
        }
      );

      // Generar reporte usando el servicio CON LA CONFIGURACIÓN
      await reportesService.generarReporteCompletoMateriales(
        materialesFiltrados,
        estadisticas,
        configuracionReporte
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
  // 🔄 FUNCIONES DE MODAL
  const abrirModalCrear = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      medida: "",
      cantidadActual: 1,
      cantidadMinima: 0,
    });
    setMostrarModalCrear(true);
  };

  const cerrarModalCrear = () => {
    setMostrarModalCrear(false);
    setFormData({
      nombre: "",
      descripcion: "",
      medida: "",
      cantidadActual: 1,
      cantidadMinima: 0,
    });
  };

  const abrirModalEditar = (material) => {
    setMaterialSeleccionado(material);
    setFormData({
      nombre: material.nombre,
      descripcion: material.descripcion || "",
      medida: material.medida,
      cantidadActual: material.cantidadActual,
      cantidadMinima: Number(material.cantidadMinima),
    });
    setMostrarModalEditar(true);
  };

  // 3️⃣ FUNCIÓN PARA MANEJAR CAMBIOS EN FILTROS
  const manejarCambioFiltro = (tipoFiltro, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [tipoFiltro]: valor,
    }));
  };

  // 4️⃣ FUNCIÓN PARA RESETEAR FILTROS
  const resetearFiltros = () => {
    setFiltros({
      estadoStock: "todos",
      fechaIngreso: "",
      fechaActualizacion: "",
    });
  };

  // 📎 FUNCIÓN AUXILIAR PARA DETERMINAR ESTADO DEL STOCK
  const determinarEstadoStock = (cantidadActual, cantidadMinima) => {
    if (cantidadActual <= cantidadMinima) return "critico";
    if (cantidadActual <= cantidadMinima * 2) return "bajo";
    return "normal";
  };

  const cerrarModalEditar = () => {
    setMostrarModalEditar(false);
    setMaterialSeleccionado(null);
  };

  const abrirModalStock = (material, tipo) => {
    setMaterialSeleccionado(material);
    setTipoMovimiento(tipo);
    setMovimientoData({ cantidad: "", motivo: "" });
    setMostrarModalStock(true);
  };

  const cerrarModalStock = () => {
    setMostrarModalStock(false);
    setMaterialSeleccionado(null);
    setMovimientoData({ cantidad: "", motivo: "" });
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

  // 🎨 RENDERIZADO DEL COMPONENTE
  if (loading && materiales.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <RefreshCw size={40} className="spinning" />
        <h2>Cargando materiales...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}>
            <Package size={32} style={{ marginRight: "12px" }} />
            Inventario de Materiales
          </h1>
          <p style={styles.subtitle}>
            Gestión completa del inventario de materiales de construcción
          </p>
        </div>

        {/* ✅ TODOS LOS BOTONES EN UN SOLO CONTENEDOR */}
        <div style={styles.headerActions}>
          {/* 📊 BOTÓN DE REPORTES */}
          {/* 📊 BOTÓN DE REPORTES */}
          <button
            style={styles.reportButton}
            onClick={abrirModalReportes}
            disabled={loading || materiales.length === 0}
            title="Generar reportes personalizados en PDF"
          >
            <FileText size={16} />
            Reporte PDF
          </button>

          <button
            style={styles.refreshButton}
            onClick={recargarDatos}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
          <button style={styles.addButton} onClick={abrirModalCrear}>
            <Plus size={16} />
            Nuevo Material
          </button>
        </div>
      </div>

      {/* ESTADÍSTICAS */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Total Materiales</h3>
          <p style={styles.statNumber}>
            {estadisticas.totalMateriales || materiales.length}
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
      </div>

      {/* BÚSQUEDA */}
      <div style={styles.searchContainer}>
        <div style={styles.searchBox}>
          <Search size={20} color="#6c757d" />
          <input
            type="text"
            placeholder="Buscar materiales por nombre, descripción o medida..."
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

          {/* Filtro por Fecha de Ingreso */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Ingresados desde:</label>
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
            <label style={styles.filterLabel}>Actualizados desde:</label>
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
              {filtros.fechaIngreso && (
                <span style={styles.filterTag}>
                  Desde: {formatearFechaLocal(filtros.fechaIngreso)}
                </span>
              )}
              {filtros.fechaActualizacion && (
                <span style={styles.filterTag}>
                  Actualizados:{" "}
                  {new Date(filtros.fechaActualizacion).toLocaleDateString(
                    "es-GT"
                  )}
                </span>
              )}
            </span>
            <span style={styles.resultsCount}>
              ({materialesFiltrados.length} materiales encontrados)
            </span>
          </div>
        )}
      </div>

      {/* TABLA DE MATERIALES */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Material</th>
              <th style={styles.th}>Descripción</th>
              <th style={styles.th}>Medida</th>
              <th style={styles.th}>Stock Actual</th>
              <th style={styles.th}>Stock Mínimo</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Fecha Ingreso</th>
              <th style={styles.th}>Última Actualización</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materialesFiltrados.length > 0 ? (
              materialesFiltrados.map((material) => {
                const estado = materialesApi.getEstadoStock(
                  material.cantidadActual,
                  material.cantidadMinima
                );
                return (
                  <tr key={material.id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <strong>{material.nombre}</strong>
                    </td>
                    <td style={styles.td}>
                      {material.descripcion || "Sin descripción"}
                    </td>
                    <td style={styles.td}>{material.medida}</td>
                    <td style={{ ...styles.td, fontWeight: "bold" }}>
                      {material.cantidadActual}
                    </td>
                    <td style={styles.td}>{material.cantidadMinima}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.estadoBadge,
                          color: estado.color,
                          backgroundColor: estado.bg,
                        }}
                      >
                        {estado.icon} {estado.texto}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {formatearFecha(material.fechaIngreso)}
                    </td>
                    <td style={styles.td}>
                      {formatearFecha(material.fechaActualizacion)}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button
                          style={styles.ingresoButton}
                          title="Ingreso de Stock"
                          onClick={() => abrirModalStock(material, "ingreso")}
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          style={styles.salidaButton}
                          title="Salida de Stock"
                          onClick={() => abrirModalStock(material, "salida")}
                        >
                          <ArrowDown size={16} />
                        </button>
                        <button
                          style={styles.editButton}
                          title="Editar"
                          onClick={() => abrirModalEditar(material)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          style={styles.deleteButton}
                          title="Eliminar"
                          onClick={() => eliminarMaterial(material)}
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
                <td colSpan="9" style={styles.noResults}>
                  {busqueda
                    ? `No se encontraron materiales que coincidan con "${busqueda}"`
                    : "No hay materiales registrados"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CREAR MATERIAL */}
      {mostrarModalCrear && (
        <div style={styles.modalOverlay} onClick={cerrarModalCrear}>
          <div
            style={getResponsiveModalStyles().modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={styles.modalTitle}> Crear Nuevo Material</h3>

            <form onSubmit={crearMaterial}>
              <div style={getResponsiveModalStyles().modalFormContainer}>
                {/* COLUMNA IZQUIERDA */}
                <div style={styles.modalColumn}>
                  {/* NOMBRE DEL MATERIAL */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nombre del Material *</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) =>
                          setFormData({ ...formData, nombre: e.target.value })
                        }
                        style={styles.input}
                        required
                        placeholder="Arena, PVC ..."
                        maxLength={30}
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

                  {/* UNIDAD DE MEDIDA */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Unidad de Medida *</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        value={formData.medida}
                        onChange={(e) =>
                          setFormData({ ...formData, medida: e.target.value })
                        }
                        style={styles.input}
                        placeholder="ej: Sacos, m³, Unidades"
                        required
                        maxLength={30}
                      />
                      <span
                        style={{
                          ...styles.charCounter,
                          ...(formData.medida.length > 25
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.medida.length >= 30
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.medida.length}/30
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
                        placeholder="Descripcion material"
                        maxLength={50}
                      />
                      <span
                        style={{
                          ...styles.charCounter,
                          ...(formData.descripcion.length > 40
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.descripcion.length >= 50
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.descripcion.length}/50
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
                  {loading ? "Creando..." : "Crear Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR MATERIAL */}
      {mostrarModalEditar && (
        <div style={styles.modalOverlay} onClick={cerrarModalEditar}>
          <div
            style={getResponsiveModalStyles().modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={styles.modalTitle}> Editar Material</h3>

            <form onSubmit={actualizarMaterial}>
              <div style={getResponsiveModalStyles().modalFormContainer}>
                {/* COLUMNA IZQUIERDA */}
                <div style={styles.modalColumn}>
                  {/* NOMBRE DEL MATERIAL */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nombre del Material *</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) =>
                          setFormData({ ...formData, nombre: e.target.value })
                        }
                        style={styles.input}
                        required
                        placeholder="Arena, PVC..."
                        maxLength={30}
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

                  {/* UNIDAD DE MEDIDA */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Unidad de Medida *</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        value={formData.medida}
                        onChange={(e) =>
                          setFormData({ ...formData, medida: e.target.value })
                        }
                        style={styles.input}
                        required
                        placeholder="ej: Sacos, m³, Unidades"
                        maxLength={30}
                      />
                      <span
                        style={{
                          ...styles.charCounter,
                          ...(formData.medida.length > 25
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.medida.length >= 30
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.medida.length}/30
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
                        placeholder="Descripcion material"
                        maxLength={50}
                      />
                      <span
                        style={{
                          ...styles.charCounter,
                          ...(formData.descripcion.length > 40
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.descripcion.length >= 50
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.descripcion.length}/50
                      </span>
                    </div>
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
                      {materialSeleccionado?.cantidadActual}{" "}
                      {materialSeleccionado?.medida}
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
                    <strong>Material seleccionado:</strong>{" "}
                    {materialSeleccionado?.nombre}
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
                  {loading ? "Actualizando..." : "Actualizar Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MOVIMIENTO DE STOCK - FORMATO HERRAMIENTASCRUD */}
      {mostrarModalStock && (
        <div style={styles.modalOverlay} onClick={cerrarModalStock}>
          <div
            style={{
              ...getResponsiveModalStyles().modalContent,
              maxWidth: "450px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={styles.modalTitle}>
              {tipoMovimiento === "ingreso"
                ? "Ingreso de Stock"
                : "Salida de Stock"}
            </h3>

            {/* INFORMACIÓN DEL MATERIAL - SIMPLIFICADA */}
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
                {materialSeleccionado?.nombre}
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
                <strong>
                  {materialSeleccionado?.cantidadActual}{" "}
                  {materialSeleccionado?.medida}
                </strong>
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
                  materialSeleccionado?.cantidadActual && (
                  <div style={styles.warningMessage}>
                    <span>⚠️</span>
                    <span>
                      No hay suficiente stock. Disponible:{" "}
                      {materialSeleccionado?.cantidadActual}
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
                        materialSeleccionado?.cantidadActual)
                  }
                >
                  {loading ? "Procesando..." : "Confirmar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE REPORTES PERSONALIZADOS */}
      {mostrarModalReportes && (
        <div style={styles.modalOverlay} onClick={cerrarModalReportes}>
          <div
            style={{
              ...getResponsiveModalStyles().modalContent,
              maxWidth: "700px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={styles.modalTitle}>Generar Reporte de Materiales</h3>

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
                      nivelStockSeleccionado:
                        e.target.value === "por-stock" ? "critico" : "todos",
                    });
                  }}
                  style={styles.select}
                >
                  <option value="completo">📊 Reporte Completo</option>
                  <option value="por-stock">📦 Por Nivel de Stock</option>
                </select>
              </div>

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
                    Incluir fechas de ingreso y actualización
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
                    Incluir descripción completa
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
                          return "Reporte completo de inventario";
                        case "por-stock":
                          return `Filtrado por stock: ${configuracionReporte.nivelStockSeleccionado}`;
                        default:
                          return "Sin definir";
                      }
                    })()}
                  </p>

                  <p style={{ margin: "8px 0" }}>
                    <strong>Materiales estimados:</strong>{" "}
                    {(() => {
                      let filtrados = materiales;
                      if (
                        configuracionReporte.nivelStockSeleccionado !== "todos"
                      ) {
                        filtrados = filtrados.filter((m) => {
                          const estadoStock = materialesApi.getEstadoStock(
                            m.cantidadActual,
                            m.cantidadMinima
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
                      return filtrados.length;
                    })()}{" "}
                    materiales
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
    </div>
  );
};

// 🎨 ESTILOS DEL COMPONENTE
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
    flexWrap: "wrap", // Permitir wrap en pantallas pequeñas
    gap: "20px",
  },

  titleSection: {
    flex: 1,
  },

  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#2d3748",
    display: "flex",
    alignItems: "center",
    margin: "0 0 8px 0",
  },

  subtitle: {
    fontSize: "16px",
    color: "#718096",
    margin: "0",
  },

  headerActions: {
    display: "flex",
    gap: "8px",
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
  },

  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },

  statCard: {
    backgroundColor: "#f7fafc",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    textAlign: "center",
  },

  statTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#718096",
    margin: "0 0 8px 0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  statNumber: {
    fontSize: "28px",
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
    overflowX: "auto", // Scroll horizontal
    overflowY: "auto", // Scroll vertical si es necesario
    maxHeight: "70vh",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "800px",
  },

  tableHeader: {
    backgroundColor: "#f7fafc",
  },

  th: {
    padding: "12px 8px",
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
    gap: "6px", // Reducir gap
    flexWrap: "nowrap",
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

  // ESTILOS DE MODALES
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
    maxWidth: "600px", // Más ancho para 2 columnas
    height: "auto",
    maxHeight: "85vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    position: "relative",
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

  // NUEVO: Contenedor para organizar en 2 columnas
  modalFormContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    marginBottom: "24px",
  },

  // NUEVO: Columna individual
  modalColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  // NUEVO: Para elementos que ocupen toda la fila
  modalFullWidth: {
    gridColumn: "1 / -1",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontSize: "14px",
    fontWeight: "600",
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
    minHeight: "80px",
  },

  mmaterialInfo: {
    backgroundColor: "#f7fafc",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "24px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
  },

  infoBox: {
    backgroundColor: "#e6f3ff",
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #bee3f8",
    gridColumn: "1 / -1", // Ocupa toda la fila
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #e2e8f0",
  },

  // RESPONSIVE DESIGN
  "@media (max-width: 768px)": {
    modalContent: {
      margin: "10px",
      padding: "24px",
      maxWidth: "calc(100vw - 20px)",
    },

    modalFormContainer: {
      gridTemplateColumns: "1fr",
      gap: "16px",
    },

    modalActions: {
      flexDirection: "column",
    },
  },

  "@media (max-width: 480px)": {
    modalContent: {
      padding: "20px",
    },

    modalTitle: {
      fontSize: "20px",
    },
  },

  cancelButton: {
    padding: "12px 24px",
    backgroundColor: "#e2e8f0",
    color: "#4a5568",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  saveButton: {
    padding: "12px 24px",
    backgroundColor: "#48bb78",
    color: "white",
    border: "none",
    borderRadius: "8px",
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

  // Estilos para los filtros (agregar al final del objeto styles)
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
};

export default MaterialesCRUD;
