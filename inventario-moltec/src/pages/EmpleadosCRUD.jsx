// pages/EmpleadosCRUD.jsx - CRUD completo de empleados
import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  Calendar,
  Phone,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "react-toastify";
import empleadosApi from "../services/empleadosApi";
import { FileText } from "lucide-react";
import reportesService from "../services/reportesService";

const EmpleadosCRUD = () => {
  // 🎯 ESTADOS PRINCIPALES
  const [empleados, setEmpleados] = useState([]);
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    totalEmpleados: 0,
    empleadosActivos: 0,
    empleadosInactivos: 0,
    puestosOcupados: 0,
  });

  // ESTADOS PARA MODAL DE REPORTES
  const [mostrarModalReportes, setMostrarModalReportes] = useState(false);
  const [configuracionReporte, setConfiguracionReporte] = useState({
    tipoReporte: "general", // 'general', 'por-puesto', 'por-estado'
    puestoSeleccionado: "",
    estadoSeleccionado: "todos", // 'todos', 'activos', 'inactivos'
    incluirFechas: true,
    incluirContacto: true,
  });

  // 🔍 ESTADOS DE BÚSQUEDA Y FILTROS
  const [busqueda, setBusqueda] = useState("");
  const [filtros, setFiltros] = useState({
    estadoEmpleado: "todos", // "todos", "activo", "inactivo"
    fechaContratacionDesde: "", // fecha desde
    fechaContratacionHasta: "", // fecha hasta
  });

  // 📋 ESTADOS DE FORMULARIOS
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);

  const [mostrarModalPerfil, setMostrarModalPerfil] = useState(false);
  const [empleadoPerfil, setEmpleadoPerfil] = useState(null);

  // 📋 FORMULARIO CREAR/EDITAR
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    identificacion: "",
    puestoId: "",
    fechaContratacion: "",
    fechaFinalizacion: "",
    telefono: "",
    telefono2: "",
    numeroEmergencia: "",
    status: "activo",
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

  // 🔍 FILTRAR EMPLEADOS CUANDO CAMBIE LA BÚSQUEDA
  // 🔍 FILTRAR EMPLEADOS CUANDO CAMBIE LA BÚSQUEDA O FILTROS
  useEffect(() => {
    try {
      // Primero aplicar búsqueda por texto
      const filtrados = empleadosApi.buscarEmpleados(empleados, busqueda);
      let empleadosFiltrados = filtrados;

      // Filtro por estado del empleado
      if (filtros.estadoEmpleado !== "todos") {
        empleadosFiltrados = empleadosFiltrados.filter(
          (empleado) => empleado.status === filtros.estadoEmpleado
        );
      }

      // Filtro por rango de fechas de contratación
      if (filtros.fechaContratacionDesde || filtros.fechaContratacionHasta) {
        empleadosFiltrados = empleadosFiltrados.filter((empleado) => {
          if (!empleado.fechaContratacion) return false;

          const fechaEmpleado = new Date(empleado.fechaContratacion);

          // Filtro desde
          if (filtros.fechaContratacionDesde) {
            const fechaDesde = new Date(
              filtros.fechaContratacionDesde + "T00:00:00"
            );
            if (fechaEmpleado < fechaDesde) return false;
          }

          // Filtro hasta
          if (filtros.fechaContratacionHasta) {
            const fechaHasta = new Date(
              filtros.fechaContratacionHasta + "T23:59:59"
            );
            if (fechaEmpleado > fechaHasta) return false;
          }

          return true;
        });
      }

      setEmpleadosFiltrados(empleadosFiltrados);
    } catch (error) {
      console.error("Error al filtrar empleados:", error);
      setEmpleadosFiltrados(empleados);
    }
  }, [empleados, busqueda, filtros]);

  useEffect(() => {
    if (formData.fechaFinalizacion) {
      const fechaFin = new Date(formData.fechaFinalizacion);
      const hoy = new Date();

      // Si la fecha de finalización es anterior a hoy, cambiar a inactivo
      if (fechaFin < hoy) {
        setFormData((prev) => ({
          ...prev,
          status: "inactivo",
        }));
      }
    }

    // NUEVO: Si intenta poner inactivo sin fecha de finalización
    if (formData.status === "inactivo" && !formData.fechaFinalizacion) {
      setFormData((prev) => ({
        ...prev,
        status: "activo", // Forzar a activo
      }));
    }
  }, [formData.fechaFinalizacion, formData.status]);
  //   useEffect(() => {
  //     if (formData.fechaFinalizacion) {
  //       const fechaFin = new Date(formData.fechaFinalizacion);
  //       const hoy = new Date();

  //       // Si la fecha de finalización es anterior a hoy, cambiar a inactivo
  //       if (fechaFin < hoy) {
  //         setFormData((prev) => ({
  //           ...prev,
  //           status: "inactivo",
  //         }));
  //       }
  //     }
  //   }, [formData.fechaFinalizacion]);

  // 🔧 FUNCIÓN HELPER PARA MANEJAR CAMBIOS EN FILTROS
  const manejarCambioFiltro = (tipoFiltro, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [tipoFiltro]: valor,
    }));
  };

  // 🔄 FUNCIÓN PARA RESETEAR FILTROS
  const resetearFiltros = () => {
    setFiltros({
      estadoEmpleado: "todos",
      fechaContratacionDesde: "",
      fechaContratacionHasta: "",
    });
  };

  // 📅 FUNCIÓN HELPER PARA FORMATEAR FECHA LOCAL
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
  // 📊 CARGAR DATOS PRINCIPALES
  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar empleados, puestos y estadísticas en paralelo
      const [empleadosResponse, puestosResponse, statsResponse] =
        await Promise.all([
          empleadosApi.obtenerEmpleados(),
          empleadosApi.obtenerPuestos(),
          empleadosApi.obtenerEstadisticas(),
        ]);

      if (empleadosResponse.success) {
        setEmpleados(empleadosResponse.data);
        setEmpleadosFiltrados(empleadosResponse.data);
      }

      if (puestosResponse.success) {
        setPuestos(puestosResponse.data);
      }

      if (statsResponse.success) {
        setEstadisticas(statsResponse.data);
      }

      console.log("✅ Datos cargados exitosamente");
    } catch (error) {
      console.error("❌ Error al cargar datos:", error);
      toast.error("Error al cargar los empleados");
    } finally {
      setLoading(false);
    }
  };

  const recargarDatos = async () => {
    try {
      toast.info("Recargando datos...");

      // Resetear filtros y búsqueda
      setFiltros({
        estadoEmpleado: "todos",
        fechaContratacionDesde: "",
        fechaContratacionHasta: "",
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

  // FUNCIÓN HELPER PARA FILTRAR EMPLEADOS (evita duplicar código)
  const filtrarEmpleados = (empleadosBase, configuracion) => {
    let empleadosFiltrados = [...empleadosBase];

    // Filtro por estado
    if (configuracion.estadoSeleccionado !== "todos") {
      const estadoBuscado =
        configuracion.estadoSeleccionado === "activos" ? "activo" : "inactivo";
      empleadosFiltrados = empleadosFiltrados.filter(
        (emp) => emp.status === estadoBuscado
      );
    }

    // Filtro por puesto
    if (
      configuracion.tipoReporte === "por-puesto" &&
      configuracion.puestoSeleccionado
    ) {
      empleadosFiltrados = empleadosFiltrados.filter((emp) => {
        const empPuestoId = String(emp.puestoId);
        const puestoSeleccionado = String(configuracion.puestoSeleccionado);
        return empPuestoId === puestoSeleccionado;
      });
    }

    return empleadosFiltrados;
  };

  // ➕ CREAR NUEVO EMPLEADO
  const crearEmpleado = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Validar datos antes de enviar
      const errores = empleadosApi.validarEmpleado(formData);
      if (errores.length > 0) {
        toast.error(errores[0]);
        return;
      }

      // 🔧 PREPARAR DATOS CON FECHAS FORMATEADAS
      const response = await empleadosApi.crearEmpleado(formData);

      if (response.success) {
        toast.success("Empleado creado exitosamente");
        await cargarDatos(); // Recargar lista
        cerrarModalCrear();
      }
    } catch (error) {
      toast.error(error.message || "Error al crear el empleado");
    } finally {
      setLoading(false);
    }
  };

  // ✏️ ACTUALIZAR EMPLEADO
  const actualizarEmpleado = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Validar datos antes de enviar
      const errores = empleadosApi.validarEmpleado(formData);
      if (errores.length > 0) {
        toast.error(errores[0]);
        return;
      }

      // 🔧 PREPARAR DATOS CON FECHAS FORMATEADAS

      const response = await empleadosApi.actualizarEmpleado(
        empleadoSeleccionado.id,
        formData
      );

      if (response.success) {
        toast.success("Empleado actualizado exitosamente");
        await cargarDatos();
        cerrarModalEditar();
      }
    } catch (error) {
      toast.error(error.message || "Error al actualizar el empleado");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ ELIMINAR EMPLEADO
  const eliminarEmpleado = async (empleado) => {
    if (
      !window.confirm(
        `¿Estás seguro de eliminar a "${empleado.nombre} ${empleado.apellido}"?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      const response = await empleadosApi.eliminarEmpleado(empleado.id);

      if (response.success) {
        toast.success("Empleado eliminado exitosamente");
        await cargarDatos();
      }
    } catch (error) {
      toast.error(error.message || "Error al eliminar el empleado");
    } finally {
      setLoading(false);
    }
  };

  // FUNCIONES PARA REPORTES
  const abrirModalReportes = () => {
    setConfiguracionReporte({
      tipoReporte: "general",
      puestoSeleccionado: "",
      estadoSeleccionado: "todos",
      incluirFechas: true,
      incluirContacto: true,
    });
    setMostrarModalReportes(true);
  };

  const cerrarModalReportes = () => {
    setMostrarModalReportes(false);
  };
  const generarReporte = async () => {
    try {
      setLoading(true);

      // Usar la función helper
      const empleadosFiltrados = filtrarEmpleados(
        empleados,
        configuracionReporte
      );

      console.log(
        "📊 Empleados filtrados para reporte:",
        empleadosFiltrados.length
      );

      if (empleadosFiltrados.length === 0) {
        toast.warning(
          "No hay empleados que coincidan con los filtros seleccionados"
        );
        return;
      }

      // Generar reporte
      await reportesService.generarReporteEmpleados(
        empleadosFiltrados,
        configuracionReporte,
        puestos
      );
      toast.success("Reporte generado exitosamente");
      cerrarModalReportes();
    } catch (error) {
      console.error("Error al generar reporte:", error);
      toast.error("Error al generar el reporte");
    } finally {
      setLoading(false);
    }
  };
  //   const generarReporte = async () => {
  //     try {
  //       setLoading(true);

  //       // Filtrar empleados según configuración
  //       let empleadosFiltrados = [...empleados];

  //       console.log("📊 Configuración del reporte:", configuracionReporte);
  //       console.log(
  //         "👥 Total empleados antes de filtrar:",
  //         empleadosFiltrados.length
  //       );

  //       // Filtro por estado
  //       if (configuracionReporte.estadoSeleccionado !== "todos") {
  //         const estadoBuscado =
  //           configuracionReporte.estadoSeleccionado === "activos"
  //             ? "activo"
  //             : "inactivo";
  //         empleadosFiltrados = empleadosFiltrados.filter(
  //           (emp) => emp.status === estadoBuscado
  //         );
  //         console.log(
  //           `🔍 Después de filtrar por estado "${estadoBuscado}":`,
  //           empleadosFiltrados.length
  //         );
  //       }

  //       // Filtro por puesto - CORREGIDO
  //       if (
  //         configuracionReporte.tipoReporte === "por-puesto" &&
  //         configuracionReporte.puestoSeleccionado
  //       ) {
  //         console.log(
  //           "🎯 Filtrando por puesto ID:",
  //           configuracionReporte.puestoSeleccionado
  //         );
  //         console.log(
  //           "📋 Empleados antes del filtro por puesto:",
  //           empleadosFiltrados.map((emp) => ({
  //             nombre: emp.nombre,
  //             puestoId: emp.puestoId,
  //             tipoPuestoId: typeof emp.puestoId,
  //           }))
  //         );

  //         // Convertir ambos valores al mismo tipo para comparación
  //         empleadosFiltrados = empleadosFiltrados.filter((emp) => {
  //           const empPuestoId = String(emp.puestoId);
  //           const puestoSeleccionado = String(
  //             configuracionReporte.puestoSeleccionado
  //           );
  //           return empPuestoId === puestoSeleccionado;
  //         });

  //         console.log(
  //           "✅ Después de filtrar por puesto:",
  //           empleadosFiltrados.length
  //         );
  //       }

  //       if (empleadosFiltrados.length === 0) {
  //         toast.warning(
  //           "No hay empleados que coincidan con los filtros seleccionados"
  //         );
  //         return;
  //       }

  //       // Generar reporte según tipo
  //       await reportesService.generarReporteEmpleados(
  //         empleadosFiltrados,
  //         configuracionReporte,
  //         puestos
  //       );
  //       toast.success("Reporte generado exitosamente");
  //       cerrarModalReportes();
  //     } catch (error) {
  //       console.error("Error al generar reporte:", error);
  //       toast.error("Error al generar el reporte");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  // 📄 FUNCIONES DE MODAL
  const abrirModalCrear = () => {
    setFormData({
      nombre: "",
      apellido: "",
      fechaNacimiento: "",
      identificacion: "",
      puestoId: "",
      fechaContratacion: "",
      fechaFinalizacion: "",
      telefono: "",
      telefono2: "",
      numeroEmergencia: "",
      status: "activo",
    });
    setMostrarModalCrear(true);
  };

  const cerrarModalCrear = () => {
    setMostrarModalCrear(false);
    setFormData({
      nombre: "",
      apellido: "",
      fechaNacimiento: "",
      identificacion: "",
      puestoId: "",
      fechaContratacion: "",
      fechaFinalizacion: "",
      telefono: "",
      telefono2: "",
      numeroEmergencia: "",
      status: "activo",
    });
  };

  const abrirModalEditar = (empleado) => {
    setEmpleadoSeleccionado(empleado);
    setFormData({
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      fechaNacimiento: empleado.fechaNacimiento || "",
      identificacion: empleado.identificacion || "",
      puestoId: empleado.puestoId,
      fechaContratacion: empleado.fechaContratacion || "",
      fechaFinalizacion: empleado.fechaFinalizacion || "",
      telefono: empleado.telefono || "",
      telefono2: empleado.telefono2 || "",
      numeroEmergencia: empleado.numeroEmergencia || "",
      status: empleado.status,
    });
    setMostrarModalEditar(true);
  };

  const cerrarModalEditar = () => {
    setMostrarModalEditar(false);
    setEmpleadoSeleccionado(null);
  };

  // 📅 FORMATEAR FECHA PARA INPUT
  const formatearFechaParaInput = (fecha) => {
    if (!fecha) return "";
    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toISOString().split("T")[0];
    } catch (error) {
      return "";
    }
  };
  const abrirModalPerfil = (empleado) => {
    setEmpleadoPerfil(empleado);
    setMostrarModalPerfil(true);
  };

  const cerrarModalPerfil = () => {
    setMostrarModalPerfil(false);
    setEmpleadoPerfil(null);
  };
  // 🎨 RENDERIZADO DEL COMPONENTE
  if (loading && empleados.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <RefreshCw size={40} className="spinning" />
        <h2>Cargando empleados...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}>
            <Users size={32} style={{ marginRight: "12px" }} />
            Gestión de Empleados
          </h1>
          <p style={styles.subtitle}>
            Administración completa del personal de la empresa
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            style={styles.reportButton}
            onClick={abrirModalReportes}
            disabled={loading || empleados.length === 0}
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
            Nuevo Empleado
          </button>
        </div>
      </div>

      {/* ESTADÍSTICAS */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Total Empleados</h3>
          <p style={styles.statNumber}>
            {estadisticas.totalEmpleados || empleados.length}
          </p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Activos</h3>
          <p style={{ ...styles.statNumber, color: "#38a169" }}>
            {estadisticas.empleadosActivos || 0}
          </p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Inactivos</h3>
          <p style={{ ...styles.statNumber, color: "#e53e3e" }}>
            {estadisticas.empleadosInactivos || 0}
          </p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Puestos Ocupados</h3>
          <p style={{ ...styles.statNumber, color: "#4299e1" }}>
            {estadisticas.puestosOcupados || 0}
          </p>
        </div>
      </div>

      {/* BÚSQUEDA */}
      <div style={styles.searchContainer}>
        <div style={styles.searchBox}>
          <Search size={20} color="#6c757d" />
          <input
            type="text"
            placeholder="Buscar empleados por nombre, apellido, identificación o puesto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* CONTROLES DE FILTROS */}
      <div style={styles.filtersContainer}>
        <div style={styles.filtersRow}>
          {/* Filtro por Estado del Empleado */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Estado del Empleado:</label>
            <select
              value={filtros.estadoEmpleado}
              onChange={(e) =>
                manejarCambioFiltro("estadoEmpleado", e.target.value)
              }
              style={styles.filterSelect}
            >
              <option value="todos">👥 Todos los estados</option>
              <option value="activo">🟢 Empleados activos</option>
              <option value="inactivo">🔴 Empleados inactivos</option>
            </select>
          </div>

          {/* Filtro por Fecha de Contratación Desde */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Contratados desde:</label>
            <input
              type="date"
              value={filtros.fechaContratacionDesde}
              onChange={(e) =>
                manejarCambioFiltro("fechaContratacionDesde", e.target.value)
              }
              style={styles.filterSelect}
            />
          </div>

          {/* Filtro por Fecha de Contratación Hasta */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Contratados hasta:</label>
            <input
              type="date"
              value={filtros.fechaContratacionHasta}
              onChange={(e) =>
                manejarCambioFiltro("fechaContratacionHasta", e.target.value)
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
        {(filtros.estadoEmpleado !== "todos" ||
          filtros.fechaContratacionDesde ||
          filtros.fechaContratacionHasta) && (
          <div style={styles.activeFiltersInfo}>
            <span style={styles.activeFiltersText}>
              Filtros activos:
              {filtros.estadoEmpleado !== "todos" && (
                <span style={styles.filterTag}>
                  Estado: {filtros.estadoEmpleado}
                </span>
              )}
              {filtros.fechaContratacionDesde && (
                <span style={styles.filterTag}>
                  Desde: {formatearFechaLocal(filtros.fechaContratacionDesde)}
                </span>
              )}
              {filtros.fechaContratacionHasta && (
                <span style={styles.filterTag}>
                  Hasta: {formatearFechaLocal(filtros.fechaContratacionHasta)}
                </span>
              )}
            </span>
            <span style={styles.resultsCount}>
              ({empleadosFiltrados.length} empleados encontrados)
            </span>
          </div>
        )}
      </div>

      {/* TABLA DE EMPLEADOS */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Empleado</th>
              <th style={styles.th}>Identificación</th>
              <th style={styles.th}>Puesto</th>
              <th style={styles.th}>Teléfono</th>
              <th style={styles.th}>Fecha Contratación</th>
              <th style={styles.th}>Antigüedad</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleadosFiltrados.length > 0 ? (
              empleadosFiltrados.map((empleado) => {
                const estado = empleadosApi.getEstadoEmpleado(empleado.status);
                return (
                  <tr key={empleado.id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={styles.empleadoInfo}>
                        <strong
                          style={styles.nombreTextoClickeable}
                          onClick={() => abrirModalPerfil(empleado)}
                          title="Ver perfil completo"
                        >
                          {empleado.nombre} {empleado.apellido}
                        </strong>
                        {empleado.fechaNacimiento && (
                          <small style={styles.fechaNac}>
                            Nac:{" "}
                            {empleadosApi.formatearFecha(
                              empleado.fechaNacimiento
                            )}
                          </small>
                        )}
                      </div>
                    </td>
                    <td style={styles.td}>
                      {empleado.identificacion || (
                        <span style={styles.noData}>Sin identificación</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.puestoBadge}>
                        {empleado.puestoNombre}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {empleado.telefono ? (
                        <div style={styles.telefonoInfo}>
                          <Phone size={14} color="#4299e1" />
                          {empleadosApi.formatearTelefono(empleado.telefono)}
                        </div>
                      ) : (
                        <span style={styles.noData}>Sin teléfono</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {empleado.fechaContratacion ? (
                        <div style={styles.fechaInfo}>
                          <Calendar size={14} color="#9f7aea" />
                          {empleadosApi.formatearFecha(
                            empleado.fechaContratacion
                          )}
                        </div>
                      ) : (
                        <span style={styles.noData}>Sin fecha</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.antiguedad}>
                        {empleadosApi.calcularAntiguedad(
                          empleado.fechaContratacion,
                          empleado.fechaFinalizacion
                        )}
                      </span>
                    </td>
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
                      <div style={styles.actionButtons}>
                        <button
                          style={styles.editButton}
                          title="Editar"
                          onClick={() => abrirModalEditar(empleado)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          style={styles.deleteButton}
                          title="Eliminar"
                          onClick={() => eliminarEmpleado(empleado)}
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
                <td colSpan="8" style={styles.noResults}>
                  {busqueda
                    ? `No se encontraron empleados que coincidan con "${busqueda}"`
                    : "No hay empleados registrados"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CONFIGURACIÓN DE REPORTES - ESTANDARIZADO */}
      {mostrarModalReportes && (
        <div style={styles.modalOverlay} onClick={cerrarModalReportes}>
          <div
            style={{
              ...getResponsiveModalStyles().modalContent,
              maxWidth: "700px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={styles.modalTitle}>Generar Reporte de Empleados</h3>

            <div style={styles.reportConfigContainer}>
              {/* TIPO DE REPORTE */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Tipo de Reporte</label>
                <select
                  value={configuracionReporte.tipoReporte}
                  onChange={(e) =>
                    setConfiguracionReporte({
                      ...configuracionReporte,
                      tipoReporte: e.target.value,
                      puestoSeleccionado: "", // Reset puesto cuando cambie tipo
                    })
                  }
                  style={styles.select}
                >
                  <option value="general">📋 Reporte General</option>
                  <option value="por-puesto">👥 Reporte por Puesto</option>
                  <option value="por-estado">📊 Reporte por Estado</option>
                </select>
              </div>

              {/* SELECTOR DE PUESTO (solo si es por puesto) */}
              {configuracionReporte.tipoReporte === "por-puesto" && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Seleccionar Puesto</label>
                  <select
                    value={configuracionReporte.puestoSeleccionado}
                    onChange={(e) =>
                      setConfiguracionReporte({
                        ...configuracionReporte,
                        puestoSeleccionado: e.target.value,
                      })
                    }
                    style={styles.select}
                    required
                  >
                    <option value="">Seleccionar puesto...</option>
                    {puestos.map((puesto) => (
                      <option key={puesto.id} value={puesto.id}>
                        {puesto.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* FILTRO POR ESTADO */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Estado de Empleados</label>
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
                  <option value="todos">👥 Todos los empleados</option>
                  <option value="activos">🟢 Solo empleados activos</option>
                  <option value="inactivos">🔴 Solo empleados inactivos</option>
                </select>
              </div>

              {/* OPCIONES ADICIONALES */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Incluir en el reporte:</label>
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
                    Fecha de contratación
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={configuracionReporte.incluirContacto}
                      onChange={(e) =>
                        setConfiguracionReporte({
                          ...configuracionReporte,
                          incluirContacto: e.target.checked,
                        })
                      }
                      style={styles.checkbox}
                    />
                    Información de contacto
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
                        case "general":
                          return "Reporte completo de todos los empleados";
                        case "por-puesto":
                          return "Reporte filtrado por puesto específico";
                        case "por-estado":
                          return "Reporte agrupado por estado (activos/inactivos)";
                        default:
                          return "Sin definir";
                      }
                    })()}
                  </p>

                  {/* MOSTRAR DETALLES DEL FILTRO */}
                  {configuracionReporte.tipoReporte === "por-puesto" &&
                    configuracionReporte.puestoSeleccionado && (
                      <p style={{ margin: "8px 0" }}>
                        <strong>Puesto seleccionado:</strong>{" "}
                        {puestos.find(
                          (p) =>
                            String(p.id) ===
                            String(configuracionReporte.puestoSeleccionado)
                        )?.nombre || "No encontrado"}
                      </p>
                    )}

                  <p style={{ margin: "8px 0" }}>
                    <strong>Empleados que se incluirán:</strong>{" "}
                    {filtrarEmpleados(empleados, configuracionReporte).length}
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
                onClick={generarReporte}
                style={styles.saveButton}
                disabled={
                  loading ||
                  (configuracionReporte.tipoReporte === "por-puesto" &&
                    !configuracionReporte.puestoSeleccionado)
                }
              >
                {loading ? "Generando..." : "Generar Reporte"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR EMPLEADO - ESTANDARIZADO */}
      {mostrarModalCrear && (
        <div style={styles.modalOverlay} onClick={cerrarModalCrear}>
          <div
            style={getResponsiveModalStyles().modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={styles.modalTitle}>Crear Nuevo Empleado</h3>
            <form onSubmit={crearEmpleado}>
              <div style={getResponsiveModalStyles().modalFormContainer}>
                {/* COLUMNA IZQUIERDA */}
                <div style={styles.modalColumn}>
                  {/* NOMBRE */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nombre *</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 20) {
                            setFormData({ ...formData, nombre: value });
                          }
                        }}
                        style={styles.input}
                        required
                        placeholder="Juan Carlos"
                        maxLength="20"
                      />
                      <small
                        style={{
                          ...styles.charCounter,
                          ...(formData.nombre.length > 17
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.nombre.length >= 20
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.nombre.length}/20
                      </small>
                    </div>
                  </div>

                  {/* APELLIDO */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Apellido *</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        value={formData.apellido}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 20) {
                            setFormData({ ...formData, apellido: value });
                          }
                        }}
                        style={styles.input}
                        required
                        placeholder="Pérez López"
                        maxLength="20"
                      />
                      <small
                        style={{
                          ...styles.charCounter,
                          ...(formData.apellido.length > 17
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.apellido.length >= 20
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.apellido.length}/20
                      </small>
                    </div>
                  </div>

                  {/* FECHA DE NACIMIENTO */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Fecha de Nacimiento</label>
                    <input
                      type="date"
                      value={formData.fechaNacimiento}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fechaNacimiento: e.target.value,
                        })
                      }
                      style={styles.input}
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  {/* IDENTIFICACIÓN */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Identificación</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        value={formData.identificacion}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 14) {
                            setFormData({ ...formData, identificacion: value });
                          }
                        }}
                        style={styles.input}
                        placeholder="1234567890123"
                        maxLength="14"
                      />
                      <small
                        style={{
                          ...styles.charCounter,
                          ...(formData.identificacion.length > 12
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.identificacion.length >= 14
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.identificacion.length}/14
                      </small>
                    </div>
                  </div>

                  {/* PUESTO */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Puesto *</label>
                    <select
                      value={formData.puestoId}
                      onChange={(e) =>
                        setFormData({ ...formData, puestoId: e.target.value })
                      }
                      style={styles.select}
                      required
                    >
                      <option value="">Seleccionar puesto</option>
                      {puestos.map((puesto) => (
                        <option key={puesto.id} value={puesto.id}>
                          {puesto.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* COLUMNA DERECHA */}
                <div style={styles.modalColumn}>
                  {/* FECHA DE CONTRATACIÓN */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Fecha de Contratación</label>
                    <input
                      type="date"
                      value={formData.fechaContratacion}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fechaContratacion: e.target.value,
                        })
                      }
                      style={styles.input}
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  {/* TELÉFONO PRINCIPAL */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Teléfono Principal</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 8) {
                            setFormData({ ...formData, telefono: value });
                          }
                        }}
                        style={styles.input}
                        placeholder="12345678"
                        maxLength="8"
                      />
                      <small
                        style={{
                          ...styles.charCounter,
                          ...(formData.telefono.length > 6
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.telefono.length >= 8
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.telefono.length}/8
                      </small>
                    </div>
                  </div>

                  {/* TELÉFONO SECUNDARIO */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Teléfono Secundario</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="tel"
                        value={formData.telefono2}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 8) {
                            setFormData({ ...formData, telefono2: value });
                          }
                        }}
                        style={styles.input}
                        placeholder="87654321"
                        maxLength="8"
                      />
                      <small
                        style={{
                          ...styles.charCounter,
                          ...(formData.telefono2.length > 6
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.telefono2.length >= 8
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.telefono2.length}/8
                      </small>
                    </div>
                  </div>

                  {/* NÚMERO DE EMERGENCIA */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Número de Emergencia</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="tel"
                        value={formData.numeroEmergencia}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 8) {
                            setFormData({
                              ...formData,
                              numeroEmergencia: value,
                            });
                          }
                        }}
                        style={styles.input}
                        placeholder="11111111"
                        maxLength="8"
                      />
                      <small
                        style={{
                          ...styles.charCounter,
                          ...(formData.numeroEmergencia.length > 6
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.numeroEmergencia.length >= 8
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.numeroEmergencia.length}/8
                      </small>
                    </div>
                  </div>

                  {/* ESTADO */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Estado</label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      style={styles.select}
                    >
                      <option value="activo">🟢 Activo</option>
                      <option value="inactivo">🔴 Inactivo</option>
                    </select>
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
                  {loading ? "Creando..." : "Crear Empleado"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PERFIL DE EMPLEADO */}
      {mostrarModalPerfil && empleadoPerfil && (
        <div style={styles.modalOverlay} onClick={cerrarModalPerfil}>
          <div
            style={styles.modalPerfilContent}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del perfil */}
            <div style={styles.perfilHeader}>
              <div style={styles.perfilAvatar}>
                <Users size={40} color="#4299e1" />
              </div>
              <div style={styles.perfilTitulo}>
                <h2 style={styles.perfilNombre}>
                  {empleadoPerfil.nombre} {empleadoPerfil.apellido}
                </h2>
                <div style={{ marginLeft: "-4px" }}>
                  {" "}
                  {/* 👈 Wrapper con margin negativo */}
                  <span
                    style={{
                      ...styles.estadoBadge,
                      ...empleadosApi.getEstadoEmpleado(empleadoPerfil.status),
                    }}
                  >
                    {empleadosApi.getEstadoEmpleado(empleadoPerfil.status).icon}{" "}
                    {
                      empleadosApi.getEstadoEmpleado(empleadoPerfil.status)
                        .texto
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Información del empleado */}
            <div style={styles.perfilContenido}>
              {/* Información personal */}
              <div style={styles.perfilSeccion}>
                <h3 style={styles.perfilSeccionTitulo}>Información Personal</h3>
                <div style={styles.perfilGrid}>
                  <div style={styles.perfilCampo}>
                    <span style={styles.perfilLabel}>Nombre Completo:</span>
                    <span style={styles.perfilValor}>
                      {empleadoPerfil.nombre} {empleadoPerfil.apellido}
                    </span>
                  </div>

                  <div style={styles.perfilCampo}>
                    <span style={styles.perfilLabel}>Fecha de Nacimiento:</span>
                    <span style={styles.perfilValor}>
                      {empleadoPerfil.fechaNacimiento
                        ? empleadosApi.formatearFecha(
                            empleadoPerfil.fechaNacimiento
                          )
                        : "No registrada"}
                    </span>
                  </div>

                  <div style={styles.perfilCampo}>
                    <span style={styles.perfilLabel}>Identificación:</span>
                    <span style={styles.perfilValor}>
                      {empleadoPerfil.identificacion || "No registrada"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información laboral */}
              <div style={styles.perfilSeccion}>
                <h3 style={styles.perfilSeccionTitulo}>Información Laboral</h3>
                <div style={styles.perfilGrid}>
                  <div style={styles.perfilCampo}>
                    <span style={styles.perfilLabel}>Puesto:</span>
                    <span style={styles.perfilValor}>
                      {empleadoPerfil.puestoNombre}
                    </span>
                  </div>

                  <div style={styles.perfilCampo}>
                    <span style={styles.perfilLabel}>
                      Fecha de Contratación:
                    </span>
                    <span style={styles.perfilValor}>
                      {empleadoPerfil.fechaContratacion
                        ? empleadosApi.formatearFecha(
                            empleadoPerfil.fechaContratacion
                          )
                        : "No registrada"}
                    </span>
                  </div>

                  {empleadoPerfil.fechaFinalizacion && (
                    <div style={styles.perfilCampo}>
                      <span style={styles.perfilLabel}>
                        Fecha de Finalización:
                      </span>
                      <span style={{ ...styles.perfilValor, color: "#e53e3e" }}>
                        {empleadosApi.formatearFecha(
                          empleadoPerfil.fechaFinalizacion
                        )}
                      </span>
                    </div>
                  )}

                  <div style={styles.perfilCampo}>
                    <span style={styles.perfilLabel}>Antigüedad:</span>
                    <span style={styles.perfilValor}>
                      {empleadosApi.calcularAntiguedad(
                        empleadoPerfil.fechaContratacion,
                        empleadoPerfil.fechaFinalizacion
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información de contacto */}
              <div style={styles.perfilSeccion}>
                <h3 style={styles.perfilSeccionTitulo}>
                  Información de Contacto
                </h3>
                <div style={styles.perfilGrid}>
                  <div style={styles.perfilCampo}>
                    <span style={styles.perfilLabel}>Teléfono Principal:</span>
                    <span style={styles.perfilValor}>
                      {empleadoPerfil.telefono
                        ? empleadosApi.formatearTelefono(
                            empleadoPerfil.telefono
                          )
                        : "No registrado"}
                    </span>
                  </div>

                  <div style={styles.perfilCampo}>
                    <span style={styles.perfilLabel}>Teléfono Secundario:</span>
                    <span style={styles.perfilValor}>
                      {empleadoPerfil.telefono2
                        ? empleadosApi.formatearTelefono(
                            empleadoPerfil.telefono2
                          )
                        : "No registrado"}
                    </span>
                  </div>

                  <div style={styles.perfilCampo}>
                    <span style={styles.perfilLabel}>
                      Número de Emergencia:
                    </span>
                    <span style={styles.perfilValor}>
                      {empleadoPerfil.numeroEmergencia
                        ? empleadosApi.formatearTelefono(
                            empleadoPerfil.numeroEmergencia
                          )
                        : "No registrado"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón de cerrar */}
            <div style={styles.perfilFooter}>
              <button
                onClick={cerrarModalPerfil}
                style={styles.cerrarPerfilButton}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR EMPLEADO - ESTANDARIZADO */}
      {mostrarModalEditar && (
        <div style={styles.modalOverlay} onClick={cerrarModalEditar}>
          <div
            style={getResponsiveModalStyles().modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={styles.modalTitle}>Editar Empleado</h3>
            <form onSubmit={actualizarEmpleado}>
              <div style={getResponsiveModalStyles().modalFormContainer}>
                {/* COLUMNA IZQUIERDA */}
                <div style={styles.modalColumn}>
                  {/* NOMBRE */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nombre *</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 20) {
                            setFormData({ ...formData, nombre: value });
                          }
                        }}
                        style={styles.input}
                        required
                        maxLength="20"
                        placeholder="Juan Carlos"
                      />
                      <small
                        style={{
                          ...styles.charCounter,
                          ...(formData.nombre.length > 17
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.nombre.length >= 20
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.nombre.length}/20
                      </small>
                    </div>
                  </div>

                  {/* APELLIDO */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Apellido *</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        value={formData.apellido}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 20) {
                            setFormData({ ...formData, apellido: value });
                          }
                        }}
                        style={styles.input}
                        required
                        maxLength="20"
                        placeholder="Pérez López"
                      />
                      <small
                        style={{
                          ...styles.charCounter,
                          ...(formData.apellido.length > 17
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.apellido.length >= 20
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.apellido.length}/20
                      </small>
                    </div>
                  </div>

                  {/* FECHA DE NACIMIENTO */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Fecha de Nacimiento</label>
                    <input
                      type="date"
                      value={formatearFechaParaInput(formData.fechaNacimiento)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fechaNacimiento: e.target.value,
                        })
                      }
                      style={styles.input}
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  {/* FECHA DE CONTRATACIÓN */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Fecha de Contratación</label>
                    <input
                      type="date"
                      value={formatearFechaParaInput(
                        formData.fechaContratacion
                      )}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fechaContratacion: e.target.value,
                        })
                      }
                      style={styles.input}
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  {/* FECHA DE FINALIZACIÓN */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Fecha de Finalización</label>
                    <input
                      type="date"
                      value={formatearFechaParaInput(
                        formData.fechaFinalizacion
                      )}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fechaFinalizacion: e.target.value,
                        })
                      }
                      style={styles.input}
                    />
                  </div>
                </div>

                {/* COLUMNA DERECHA */}
                <div style={styles.modalColumn}>
                  {/* IDENTIFICACIÓN */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Identificación</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        value={formData.identificacion}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 14) {
                            setFormData({ ...formData, identificacion: value });
                          }
                        }}
                        style={styles.input}
                        maxLength="14"
                        placeholder="1234567890123"
                      />
                      <small
                        style={{
                          ...styles.charCounter,
                          ...(formData.identificacion.length > 12
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.identificacion.length >= 14
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.identificacion.length}/14
                      </small>
                    </div>
                  </div>

                  {/* PUESTO */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Puesto *</label>
                    <select
                      value={formData.puestoId}
                      onChange={(e) =>
                        setFormData({ ...formData, puestoId: e.target.value })
                      }
                      style={styles.select}
                      required
                    >
                      <option value="">Seleccionar puesto</option>
                      {puestos.map((puesto) => (
                        <option key={puesto.id} value={puesto.id}>
                          {puesto.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* TELÉFONO PRINCIPAL */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Teléfono Principal</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 8) {
                            setFormData({ ...formData, telefono: value });
                          }
                        }}
                        style={styles.input}
                        maxLength="8"
                        placeholder="12345678"
                      />
                      <small
                        style={{
                          ...styles.charCounter,
                          ...(formData.telefono.length > 6
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.telefono.length >= 8
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.telefono.length}/8
                      </small>
                    </div>
                  </div>

                  {/* TELÉFONO SECUNDARIO */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Teléfono Secundario</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="tel"
                        value={formData.telefono2}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 8) {
                            setFormData({ ...formData, telefono2: value });
                          }
                        }}
                        style={styles.input}
                        maxLength="8"
                        placeholder="87654321"
                      />
                      <small
                        style={{
                          ...styles.charCounter,
                          ...(formData.telefono2.length > 6
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.telefono2.length >= 8
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.telefono2.length}/8
                      </small>
                    </div>
                  </div>

                  {/* NÚMERO DE EMERGENCIA */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Número de Emergencia</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="tel"
                        value={formData.numeroEmergencia}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 8) {
                            setFormData({
                              ...formData,
                              numeroEmergencia: value,
                            });
                          }
                        }}
                        style={styles.input}
                        maxLength="8"
                        placeholder="11111111"
                      />
                      <small
                        style={{
                          ...styles.charCounter,
                          ...(formData.numeroEmergencia.length > 6
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.numeroEmergencia.length >= 8
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.numeroEmergencia.length}/8
                      </small>
                    </div>
                  </div>
                </div>

                {/* ESTADO - OCUPA TODA LA FILA */}
                <div style={styles.modalFullWidth}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Estado</label>
                    <select
                      value={formData.status}
                      onChange={(e) => {
                        const nuevoStatus = e.target.value;
                        // Si intenta poner inactivo sin fecha de finalización, no permitir
                        if (
                          nuevoStatus === "inactivo" &&
                          !formData.fechaFinalizacion
                        ) {
                          toast.warning(
                            "Debe establecer una fecha de finalización antes de marcar como inactivo"
                          );
                          return;
                        }
                        setFormData({ ...formData, status: nuevoStatus });
                      }}
                      style={styles.select}
                      disabled={
                        // Deshabilitar si fecha de finalización es anterior a hoy
                        formData.fechaFinalizacion &&
                        new Date(formData.fechaFinalizacion) < new Date() &&
                        formData.status === "inactivo"
                      }
                    >
                      <option value="activo">🟢 Activo</option>
                      <option value="inactivo">🔴 Inactivo</option>
                    </select>
                  </div>
                </div>

                {/* INFORMACIÓN ADICIONAL */}
                <div style={styles.infoBox}>
                  <p
                    style={{ margin: "0", fontSize: "14px", color: "#2d3748" }}
                  >
                    <strong>Empleado:</strong> {empleadoSeleccionado?.nombre}{" "}
                    {empleadoSeleccionado?.apellido}
                  </p>
                  <p style={styles.helpText}>
                    Límites: Nombre/Apellido (20 chars), Identificación (14
                    chars), Teléfonos (8 dígitos)
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
                  {loading ? "Actualizando..." : "Actualizar Empleado"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 🎨 ESTILOS DEL COMPONENTE (RESPONSIVE)
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
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
    overflowX: "auto",
    overflowY: "auto",
    maxHeight: "70vh",
    "@media (max-width: 1200px)": {
      maxHeight: "60vh",
    },
    "@media (max-width: 768px)": {
      borderRadius: "8px",
      margin: "0 -10px", // Permitir que se extienda un poco más en móviles
      maxHeight: "50vh",
      overflowX: "scroll", // Forzar scroll horizontal en móviles
    },
    "@media (max-width: 480px)": {
      margin: "0 -15px",
      borderRadius: "0",
      maxHeight: "45vh",
    },
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "800px",
    "@media (max-width: 768px)": {
      minWidth: "700px", // Reducir un poco en tablets
      fontSize: "13px",
    },
    "@media (max-width: 480px)": {
      minWidth: "600px", // Más compacto en móviles
      fontSize: "12px",
    },
  },

  tableHeader: {
    backgroundColor: "#f7fafc",
  },

  th: {
    padding: "16px 8px",
    textAlign: "left",
    fontSize: "14px", // ← Cambiar de "13px" a "14px"
    fontWeight: "600",
    color: "#4a5568",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  },
  //   th: {
  //     padding: "16px 8px",
  //     textAlign: "left",
  //     fontSize: "13px",
  //     fontWeight: "600",
  //     color: "#4a5568",
  //     borderBottom: "1px solid #e2e8f0",
  //     whiteSpace: "nowrap",
  //   },

  tableRow: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background-color 0.2s ease",
  },

  //   td: {
  //     padding: "16px 8px",
  //     fontSize: "13px",
  //     color: "#2d3748",
  //     verticalAlign: "top",
  //   },

  td: {
    padding: "16px 8px",
    fontSize: "14px", // ← Cambiar de "13px" a "14px"
    color: "#2d3748",
    verticalAlign: "top",
  },

  empleadoInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  // ESTOS SÍ cambiar:
  fechaNac: {
    color: "#718096",
    fontSize: "12px", // ← Cambiar de "11px" a "12px"
  },

  telefonoInfo: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px", // ← Cambiar de "12px" a "13px"
  },

  fechaInfo: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px", // ← Cambiar de "12px" a "13px"
  },

  antiguedad: {
    backgroundColor: "#f0fff4",
    color: "#2d5016",
    padding: "2px 6px",
    borderRadius: "8px",
    fontSize: "12px", // ← Cambiar de "11px" a "12px"
    fontWeight: "500",
  },

  noData: {
    color: "#a0aec0",
    fontStyle: "italic",
    fontSize: "13px", // ← Cambiar de "12px" a "13px"
  },

  // ESTE NO TOCAR - mantener igual:
  estadoBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px", // ← DEJAR como está
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  // ESTE TAMPOCO TOCAR:
  puestoBadge: {
    backgroundColor: "#e6f3ff",
    color: "#3182ce",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px", // ← DEJAR como está para mantener su diseño compacto
    fontWeight: "600",
    display: "inline-block",
  },

  //   fechaNac: {
  //     color: "#718096",
  //     fontSize: "11px",
  //   },

  //   puestoBadge: {
  //     backgroundColor: "#e6f3ff",
  //     color: "#3182ce",
  //     padding: "4px 8px",
  //     borderRadius: "12px",
  //     fontSize: "11px",
  //     fontWeight: "600",
  //     display: "inline-block",
  //   },

  //   telefonoInfo: {
  //     display: "flex",
  //     alignItems: "center",
  //     gap: "6px",
  //     fontSize: "12px",
  //   },

  //   fechaInfo: {
  //     display: "flex",
  //     alignItems: "center",
  //     gap: "6px",
  //     fontSize: "12px",
  //   },

  //   antiguedad: {
  //     backgroundColor: "#f0fff4",
  //     color: "#2d5016",
  //     padding: "2px 6px",
  //     borderRadius: "8px",
  //     fontSize: "11px",
  //     fontWeight: "500",
  //   },

  //   estadoBadge: {
  //     padding: "4px 12px",
  //     borderRadius: "20px",
  //     fontSize: "12px",
  //     fontWeight: "600",
  //     textTransform: "uppercase",
  //     letterSpacing: "0.5px",
  //   },

  //   noData: {
  //     color: "#a0aec0",
  //     fontStyle: "italic",
  //     fontSize: "12px",
  //   },

  actionButtons: {
    display: "flex",
    gap: "8px",
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
  // ESTILOS DE MODALES - ESTANDARIZADOS
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

  modalTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: "24px",
    textAlign: "center",
    paddingBottom: "16px",
    borderBottom: "2px solid #e2e8f0",
  },

  // FORMULARIOS - DISEÑO EN 2 COLUMNAS
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

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
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

  // charCounterWarning: {
  //   color: "#ed8936",
  // },

  // charCounterDanger: {
  //   color: "#e53e3e",
  // },

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

  modalPerfilContent: {
    backgroundColor: "white",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "600px",
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 15px 40px rgba(0, 0, 0, 0.2)",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },

  perfilHeader: {
    background: "linear-gradient(135deg, #131F2B, #1a365d)",
    color: "white",
    padding: "20px",
    borderRadius: "16px 16px 0 0",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  perfilAvatar: {
    width: "60px",
    height: "60px",
    backgroundColor: "rgba(255, 255, 255, 1)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid hsla(0, 0%, 100%, 0.30)",
  },
  // 1. Mantén perfilTitulo simple:
  perfilTitulo: {
    flex: 1,
  },

  // 2. Asegúrate que perfilNombre no tenga margin:
  perfilNombre: {
    margin: "0",
    fontSize: "20px",
    fontWeight: "700",
  },

  // perfilTitulo: {
  //   flex: 1,
  //   display: 'flex',
  //   flexDirection: 'column',
  //   justifyContent: 'center',
  //   alignItems: 'flex-start',  // 👈 Alinea todo hacia la izquierda
  //   gap: '8px',
  // },

  //   perfilNombre: {
  //     margin: "0",
  //     fontSize: "20px",
  //     fontWeight: "700",
  //   },

  perfilContenido: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  perfilSeccion: {
    backgroundColor: "#f9fafb",
    padding: "15px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },

  perfilSeccionTitulo: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: "12px",
  },

  perfilGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr", // 👈 2 columnas
    gap: "12px",
  },

  perfilCampo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    fontSize: "14px",
  },

  perfilLabel: {
    fontWeight: "600",
    color: "#4a5568",
  },

  perfilValor: {
    color: "#2d3748",
    fontWeight: "400",
  },

  perfilFooter: {
    padding: "20px",
    borderTop: "1px solid #e2e8f0",
    textAlign: "center",
  },

  cerrarPerfilButton: {
    padding: "12px 30px",
    backgroundColor: "#131F2B",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
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

  reportConfigContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  checkboxGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "8px",
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
    backgroundColor: "white",
    border: "2px solid #e2e8f0",
    borderRadius: "3px",
    // Forzar el color del check interno
    filter: "hue-rotate(0deg) brightness(1) contrast(1)",
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

  helpText: {
    fontSize: "12px",
    color: "#4a5568",
    marginTop: "5px",
  },

  "@media (max-width: 768px)": {
    formRow: {
      gridTemplateColumns: "1fr",
    },
    modalContent: {
      padding: "20px",
      margin: "10px",
    },
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
};

export default EmpleadosCRUD;
