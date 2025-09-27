// pages/ProyectosCRUD.jsx - CRUD completo de proyectos (ESTÁNDAR MOLTEC)
import React, { useState, useEffect } from "react";
import {
  FolderOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  FileText,
  User,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  MapPin,
} from "lucide-react";
import { toast } from "react-toastify";
import proyectosApi from "../services/proyectosApi";
import empleadosApi from "../services/empleadosApi";
import clienteApi from "../services/clienteApi";
import reportesService from "../services/reportesService";

// 🚀 COMPONENTE PRINCIPAL
const ProyectosCRUD = () => {
  // 🎯 ESTADOS PRINCIPALES
  const [proyectos, setProyectos] = useState([]);
  const [proyectosFiltrados, setProyectosFiltrados] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    totalProyectos: 0,
    planificados: 0,
    enProgreso: 0,
    completados: 0,
  });

  // 🔍 ESTADOS DE BÚSQUEDA Y FILTROS
  const [busqueda, setBusqueda] = useState("");

  // 📋 ESTADOS DE FORMULARIOS
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

  // 📄 ESTADO PARA MODAL DE REPORTES
  const [mostrarModalReportes, setMostrarModalReportes] = useState(false);
  const [configuracionReporte, setConfiguracionReporte] = useState({
    statusSeleccionado: "todos", // Filtro por estado del proyecto
    clienteSeleccionado: "", // Filtro por cliente específico
    responsableSeleccionado: "", // Filtro por responsable específico
    aprobacionSeleccionada: "todos", // "todos", "aprobados", "pendientes"
    incluirFechas: true, // Incluir fechas en el reporte
    incluirFinanzas: true, // Incluir cotizaciones
    incluirAprobacion: true, // Incluir estado de aprobación
  });
  // Funciones para determinar tamaño de pantalla
  const isMobile = () => window.innerWidth <= 768;
  const isSmallMobile = () => window.innerWidth <= 640;

  // 📋 FORMULARIO CREAR/EDITAR
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    responsableId: "",
    clienteId: "",
    ubicacion: "",
    fechaInicio: "",
    fechaAproxFin: "",
    fechaFin: "",
    cotizacion: "",
    aprobado: false,
    status: "planificado",
  });

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

  // 🌀 Inserta la animación del spinner solo en cliente (evita errores SSR)
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

  // 🚀 CARGAR DATOS AL INICIALIZAR
  useEffect(() => {
    cargarDatos();
  }, []);

  // 🎛️ ESTADOS DE FILTROS
  const [filtros, setFiltros] = useState({
    status: "todos", // "todos", "planificado", "en progreso", "pausado", "completado", "cancelado"
    aprobacion: "todos", // "todos", "aprobados", "pendientes"
  });

  // 🔍 FILTRAR PROYECTOS CUANDO CAMBIE LA BÚSQUEDA O FILTROS
  useEffect(() => {
    try {
      // Primero aplicar búsqueda por texto
      const tieneFiltroApi =
        typeof proyectosApi?.filtrarProyectos === "function";
      let proyectosFiltradosPorTexto = tieneFiltroApi
        ? proyectosApi.filtrarProyectos(proyectos, busqueda)
        : filtrarLocal(proyectos, busqueda);

      // Luego aplicar filtros de status y aprobación
      let proyectosFiltradosCompleto = proyectosFiltradosPorTexto;

      // Filtro por status
      if (filtros.status !== "todos") {
        proyectosFiltradosCompleto = proyectosFiltradosCompleto.filter(
          (proyecto) => proyecto?.status === filtros.status
        );
      }

      // Filtro por aprobación
      if (filtros.aprobacion !== "todos") {
        if (filtros.aprobacion === "aprobados") {
          proyectosFiltradosCompleto = proyectosFiltradosCompleto.filter(
            (proyecto) =>
              proyecto?.aprobado === true || proyecto?.aprobado === 1
          );
        } else if (filtros.aprobacion === "pendientes") {
          proyectosFiltradosCompleto = proyectosFiltradosCompleto.filter(
            (proyecto) =>
              proyecto?.aprobado === false ||
              proyecto?.aprobado === 0 ||
              !proyecto?.aprobado
          );
        }
      }

      setProyectosFiltrados(proyectosFiltradosCompleto || []);
    } catch {
      setProyectosFiltrados(filtrarLocal(proyectos, busqueda));
    }
  }, [proyectos, busqueda, filtros]);

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
      status: "todos",
      aprobacion: "todos",
    });
  };

  // 🔎 Filtro local de respaldo si no existe proyectosApi.filtrarProyectos
  const filtrarLocal = (lista, termino) => {
    const t = (termino || "").trim().toLowerCase();
    if (!t) return lista;
    return (lista || []).filter((p) => {
      const campos = [
        p?.nombre,
        p?.clienteNombre,
        p?.responsableNombre,
        p?.descripcion,
        p?.ubicacion,
        p?.status,
      ]
        .filter(Boolean)
        .map((x) => String(x).toLowerCase());
      return campos.some((x) => x.includes(t));
    });
  };

  // 🔍 FILTRAR PROYECTOS CUANDO CAMBIE LA BÚSQUEDA
  useEffect(() => {
    try {
      const tieneFiltroApi =
        typeof proyectosApi?.filtrarProyectos === "function";
      const filtrados = tieneFiltroApi
        ? proyectosApi.filtrarProyectos(proyectos, busqueda)
        : filtrarLocal(proyectos, busqueda);
      setProyectosFiltrados(filtrados || []);
    } catch {
      setProyectosFiltrados(filtrarLocal(proyectos, busqueda));
    }
  }, [proyectos, busqueda]);

  // 📊 CARGAR DATOS PRINCIPALES
  // En ProyectosCRUD.jsx - Líneas 140-170 aproximadamente
  // CORREGIR EL FILTRADO DE EMPLEADOS Y CLIENTES ACTIVOS

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar proyectos, empleados, clientes y estadísticas en paralelo
      const [
        proyectosResponse,
        empleadosResponse,
        clientesResponse,
        statsResponse,
      ] = await Promise.all([
        proyectosApi.obtenerProyectos(),
        empleadosApi.obtenerEmpleados(),
        clienteApi.obtenerClientes(),
        proyectosApi.obtenerEstadisticas(),
      ]);

      if (proyectosResponse?.success) {
        setProyectos(proyectosResponse.data || []);
        setProyectosFiltrados(proyectosResponse.data || []);
      }

      if (empleadosResponse?.success) {
        // Filtrar empleados activos usando el campo correcto
        const empleadosActivos = (empleadosResponse.data || []).filter(
          (emp) => {
            return (
              emp?.status === 1 ||
              emp?.status === true ||
              emp?.empleado_status === 1 ||
              emp?.empleado_status === true ||
              emp?.status === "activo"
            );
          }
        );

        console.log(
          `✅ Empleados activos cargados: ${empleadosActivos.length}`
        );
        setEmpleados(empleadosActivos);
      }

      // SOLUCIÓN PARA CLIENTES - Probar sin filtro primero
      if (clientesResponse?.success) {
        console.log("📋 Respuesta completa de clientes:", clientesResponse);
        console.log("📋 Datos de clientes:", clientesResponse.data);
        console.log(
          "📋 Cantidad total de clientes:",
          clientesResponse.data?.length
        );

        // PRIMER INTENTO: Sin filtro para ver si hay datos
        const todosLosClientes = clientesResponse.data || [];

        if (todosLosClientes.length > 0) {
          console.log("📋 Primer cliente como ejemplo:", todosLosClientes[0]);

          // SEGUNDO INTENTO: Filtro mejorado que busca en todos los campos posibles
          const clientesActivos = todosLosClientes.filter((cli) => {
            // Verificar TODOS los posibles campos de status
            const statusPosibles = [
              cli?.status,
              cli?.cliente_status,
              cli?.statusRegistro,
              cli?.cliente_status_registro,
              cli?.estado,
              cli?.activo,
            ];

            // El cliente es activo si CUALQUIERA de estos valores es truthy
            const esActivo = statusPosibles.some(
              (status) =>
                status === 1 ||
                status === true ||
                status === "1" ||
                status === "activo" ||
                status === "true"
            );

            console.log(
              `Cliente ${cli?.nombre} ${
                cli?.apellido
              } - Status: ${JSON.stringify(
                statusPosibles
              )} - Es activo: ${esActivo}`
            );
            return esActivo;
          });

          console.log(
            `✅ Clientes activos después del filtro: ${clientesActivos.length}`
          );

          // Si no hay clientes activos después del filtro, usar todos
          if (clientesActivos.length === 0) {
            console.log(
              "⚠️ No se encontraron clientes activos, usando todos los clientes"
            );
            setClientes(todosLosClientes);
          } else {
            setClientes(clientesActivos);
          }
        } else {
          console.log("❌ No hay datos de clientes");
          setClientes([]);
        }
      } else {
        console.error("❌ Error en respuesta de clientes:", clientesResponse);
        setClientes([]);
      }

      if (statsResponse?.success && statsResponse.data) {
        setEstadisticas(statsResponse.data);
      } else {
        // Estimar estadísticas si el API no las trae
        const total = (proyectosResponse?.data || []).length;
        const enProgreso = (proyectosResponse?.data || []).filter(
          (p) => p?.status === "en progreso"
        ).length;
        const completados = (proyectosResponse?.data || []).filter(
          (p) => p?.status === "completado"
        ).length;
        const planificados = (proyectosResponse?.data || []).filter(
          (p) => p?.status === "planificado"
        ).length;
        setEstadisticas({
          totalProyectos: total,
          enProgreso,
          completados,
          planificados,
        });
      }

      console.log("✅ Datos cargados exitosamente");
    } catch (error) {
      console.error("❌ Error al cargar datos:", error);
      toast.error("Error al cargar los proyectos");
      setProyectos([]);
      setProyectosFiltrados([]);
      setEmpleados([]);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  // TAMBIÉN AGREGA ESTE useEffect TEMPORAL PARA MONITOREAR
  useEffect(() => {
    console.log("📊 Estado actual de clientes en React:", clientes);
    console.log("📊 Cantidad de clientes en estado:", clientes.length);
  }, [clientes]);

  // useEffect para responsive (agregarlo después de los useEffect existentes)
  useEffect(() => {
    const handleResize = () => {
      // Forzar re-render cuando cambie el tamaño
      setLoading((prev) => prev);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔄 RECARGAR DATOS
  const recargarDatos = async () => {
    toast.info("Recargando datos...");
    setFiltros({
      status: "todos",
      aprobacion: "todos",
    });

    // 🔍 RESETEAR BÚSQUEDA
    setBusqueda("");
    await cargarDatos();
    toast.success("Datos actualizados");
  };

  // 📝 MANEJAR CAMBIOS EN FORMULARIO
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ➕ ABRIR MODAL CREAR
  const abrirModalCrear = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      responsableId: "",
      clienteId: "",
      ubicacion: "",
      fechaInicio: "",
      fechaAproxFin: "",
      fechaFin: "",
      cotizacion: "",
      aprobado: false,
      status: "planificado",
    });
    setMostrarModalCrear(true);
  };

  // ✏️ ABRIR MODAL EDITAR
  const abrirModalEditar = (proyecto) => {
    setProyectoSeleccionado(proyecto);
    setFormData({
      nombre: proyecto?.nombre || "",
      descripcion: proyecto?.descripcion || "",
      responsableId: proyecto?.responsableId || "",
      clienteId: proyecto?.clienteId || "",
      ubicacion: proyecto?.ubicacion || "",
      fechaInicio: proyecto?.fechaInicio
        ? String(proyecto.fechaInicio).split("T")[0]
        : "",
      fechaAproxFin: proyecto?.fechaAproxFin
        ? String(proyecto.fechaAproxFin).split("T")[0]
        : "",
      fechaFin: proyecto?.fechaFin
        ? String(proyecto.fechaFin).split("T")[0]
        : "",
      cotizacion: proyecto?.cotizacion || "",
      aprobado: Boolean(proyecto?.aprobado),
      status: proyecto?.status || "planificado",
    });
    setMostrarModalEditar(true);
  };

  // ❌ CERRAR MODAL CREAR
  const cerrarModalCrear = () => {
    setMostrarModalCrear(false);
  };

  // ❌ CERRAR MODAL EDITAR
  const cerrarModalEditar = () => {
    setMostrarModalEditar(false);
    setProyectoSeleccionado(null);
  };

  // 💾 CREAR PROYECTO
  const crearProyecto = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = { ...formData };
      const response = await proyectosApi.crearProyecto(payload);
      if (response?.success) {
        toast.success("Proyecto creado exitosamente");
        cerrarModalCrear();
        await cargarDatos();
      } else {
        throw new Error(response?.message || "No se pudo crear el proyecto");
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("❌ Error al crear proyecto:", error);
      toast.error(error?.message || "Error al crear el proyecto");
    } finally {
      setLoading(false);
    }
  };

  // ✏️ ACTUALIZAR PROYECTO
  const actualizarProyecto = async (e) => {
    e.preventDefault();
    try {
      if (!proyectoSeleccionado?.id)
        throw new Error("Proyecto no seleccionado");
      setLoading(true);
      const payload = { ...formData };
      const response = await proyectosApi.actualizarProyecto(
        proyectoSeleccionado.id,
        payload
      );
      if (response?.success) {
        toast.success("Proyecto actualizado exitosamente");
        cerrarModalEditar();
        await cargarDatos();
      } else {
        throw new Error(
          response?.message || "No se pudo actualizar el proyecto"
        );
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("❌ Error al actualizar proyecto:", error);
      toast.error(error?.message || "Error al actualizar el proyecto");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ ELIMINAR PROYECTO
  const eliminarProyecto = async (proyecto) => {
    const confirmacion = window.confirm(
      `¿Estás seguro de eliminar el proyecto "${proyecto?.nombre}"?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmacion || !proyecto?.id) return;
    try {
      setLoading(true);
      const response = await proyectosApi.eliminarProyecto(proyecto.id);
      if (response?.success) {
        toast.success("Proyecto eliminado exitosamente");
        await cargarDatos();
      } else {
        throw new Error(response?.message || "No se pudo eliminar el proyecto");
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("❌ Error al eliminar proyecto:", error);
      toast.error(error?.message || "Error al eliminar el proyecto");
    } finally {
      setLoading(false);
    }
  };

  // 📈 GENERAR REPORTE
  // 📈 GENERAR REPORTE CON FILTROS APLICADOS
  const generarReporte = async () => {
    try {
      setLoading(true);
      console.log("🔄 Iniciando generación de reporte...");
      console.log("📊 Configuración del reporte:", configuracionReporte);

      // APLICAR FILTROS ADICIONALES A LOS PROYECTOS
      let proyectosParaReporte = [...proyectosFiltrados];

      // Filtro por estado del proyecto
      if (configuracionReporte.statusSeleccionado !== "todos") {
        proyectosParaReporte = proyectosParaReporte.filter(
          (proyecto) =>
            proyecto.status === configuracionReporte.statusSeleccionado
        );
        console.log(
          `📈 Filtro por estado "${configuracionReporte.statusSeleccionado}": ${proyectosParaReporte.length} proyectos`
        );
      }

      // Filtro por cliente específico
      if (configuracionReporte.clienteSeleccionado) {
        proyectosParaReporte = proyectosParaReporte.filter(
          (proyecto) =>
            proyecto.clienteId == configuracionReporte.clienteSeleccionado
        );
        const clienteNombre = clientes.find(
          (c) => c.id == configuracionReporte.clienteSeleccionado
        );
        console.log(
          `👥 Filtro por cliente "${clienteNombre?.nombre || "Desconocido"}": ${
            proyectosParaReporte.length
          } proyectos`
        );
      }

      // Filtro por responsable específico
      if (configuracionReporte.responsableSeleccionado) {
        proyectosParaReporte = proyectosParaReporte.filter(
          (proyecto) =>
            proyecto.responsableId ==
            configuracionReporte.responsableSeleccionado
        );
        const responsableNombre = empleados.find(
          (e) => e.id == configuracionReporte.responsableSeleccionado
        );
        console.log(
          `👨‍💼 Filtro por responsable "${
            responsableNombre?.nombre || "Desconocido"
          }": ${proyectosParaReporte.length} proyectos`
        );
      }

      // Filtro por estado de aprobación
      if (configuracionReporte.aprobacionSeleccionada !== "todos") {
        if (configuracionReporte.aprobacionSeleccionada === "aprobados") {
          proyectosParaReporte = proyectosParaReporte.filter(
            (proyecto) => proyecto.aprobado === true || proyecto.aprobado === 1
          );
        } else if (
          configuracionReporte.aprobacionSeleccionada === "pendientes"
        ) {
          proyectosParaReporte = proyectosParaReporte.filter(
            (proyecto) =>
              proyecto.aprobado === false ||
              proyecto.aprobado === 0 ||
              !proyecto.aprobado
          );
        }
        console.log(
          `✅ Filtro por aprobación "${configuracionReporte.aprobacionSeleccionada}": ${proyectosParaReporte.length} proyectos`
        );
      }

      // Validar que hay proyectos para el reporte
      if (proyectosParaReporte.length === 0) {
        toast.warning(
          "No hay proyectos que coincidan con los filtros seleccionados"
        );
        return;
      }

      console.log(
        `📋 Total de proyectos para el reporte: ${proyectosParaReporte.length}`
      );

      // GENERAR EL REPORTE PDF
      const response = await reportesService.generarReporteProyectos(
        proyectosParaReporte,
        configuracionReporte
      );

      if (response?.success) {
        toast.success(
          `Reporte generado exitosamente con ${proyectosParaReporte.length} proyectos`
        );
        setMostrarModalReportes(false);

        // Resetear configuración a valores por defecto
        setConfiguracionReporte({
          statusSeleccionado: "todos",
          clienteSeleccionado: "",
          responsableSeleccionado: "",
          aprobacionSeleccionada: "todos",
          incluirFechas: true,
          incluirFinanzas: true,
          incluirAprobacion: true,
        });
      } else {
        throw new Error(response?.message || "No se pudo generar el reporte");
      }
    } catch (error) {
      console.error("❌ Error al generar reporte:", error);
      toast.error(`Error al generar el reporte: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 💰 FORMATEAR VALOR MONETARIO
  const formatearMoneda = (valor) => {
    const num = Number(valor) || 0;
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // 📅 FORMATEAR FECHA
  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return "Sin fecha";
    return d.toLocaleDateString("es-GT", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // 🎨 OBTENER ESTILO DE STATUS
  const obtenerEstiloStatus = (status) => {
    const estilos = {
      planificado: { color: "#3182ce", bg: "#bee3f8" },
      "en progreso": { color: "#dd6b20", bg: "#fbb86f" },
      pausado: { color: "#718096", bg: "#e2e8f0" },
      completado: { color: "#38a169", bg: "#c6f6d5" },
      cancelado: { color: "#e53e3e", bg: "#fed7d7" },
    };
    return estilos[status] || estilos.planificado;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Cargando proyectos...</p>
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
              <FolderOpen size={32} style={{ marginRight: "12px" }} />
              Gestión de Proyectos
            </h1>
            <p style={styles.subtitle}>
              Administra todos los proyectos de MOLTEC S.A.
            </p>
          </div>
        </div>

        <div style={styles.headerActions}>
          <button
            style={styles.reportButton}
            onClick={() => setMostrarModalReportes(true)}
          >
            <FileText size={16} />
            Reporte PDF
          </button>
          <button style={styles.refreshButton} onClick={recargarDatos}>
            <RefreshCw size={16} />
            Actualizar
          </button>
          <button style={styles.createButton} onClick={abrirModalCrear}>
            <Plus size={16} />
            Nuevo Proyecto
          </button>
        </div>
      </div>

      {/* ESTADÍSTICAS - ORDEN PERSONALIZADO */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Completados</h3>
          <p style={{ ...styles.statNumber, color: "#38a169" }}>
            {estadisticas.completados || 0}
          </p>
        </div>

        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>En Progreso</h3>
          <p style={{ ...styles.statNumber, color: "#dd6b20" }}>
            {estadisticas.enProgreso || 0}
          </p>
        </div>

        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Pausados</h3>
          <p style={{ ...styles.statNumber, color: "#718096" }}>
            {estadisticas.pausados || 0}
          </p>
        </div>

        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Planificados</h3>
          <p style={{ ...styles.statNumber, color: "#3182ce" }}>
            {estadisticas.planificados || 0}
          </p>
        </div>

        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Cancelados</h3>
          <p style={{ ...styles.statNumber, color: "#e53e3e" }}>
            {estadisticas.cancelados || 0}
          </p>
        </div>

        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Aprobados</h3>
          <p style={{ ...styles.statNumber, color: "#48bb78" }}>
            {estadisticas.aprobados || 0}
          </p>
        </div>

        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Pendientes</h3>
          <p style={{ ...styles.statNumber, color: "#ecc94b" }}>
            {estadisticas.pendientesAprobacion || 0}
          </p>
        </div>
      </div>

      {/* BÚSQUEDA */}
      <div style={styles.searchContainer}>
        <div style={styles.searchBox}>
          <Search size={20} color="#6c757d" />
          <input
            type="text"
            placeholder="Buscar proyectos por nombre, cliente, responsable..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* CONTROLES DE FILTROS */}
      <div style={styles.filtersContainer}>
        <div style={styles.filtersRow}>
          {/* Filtro por Status */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Estado del Proyecto:</label>
            <select
              value={filtros.status}
              onChange={(e) => manejarCambioFiltro("status", e.target.value)}
              style={styles.filterSelect}
            >
              <option value="todos">📁 Todos los estados</option>
              <option value="planificado">📝 Planificado</option>
              <option value="en progreso">⚡ En Progreso</option>
              <option value="pausado">⏸️ Pausado</option>
              <option value="completado">✅ Completado</option>
              <option value="cancelado">❌ Cancelado</option>
            </select>
          </div>

          {/* Filtro por Aprobación */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Estado de Aprobación:</label>
            <select
              value={filtros.aprobacion}
              onChange={(e) =>
                manejarCambioFiltro("aprobacion", e.target.value)
              }
              style={styles.filterSelect}
            >
              <option value="todos">📋 Todos</option>
              <option value="aprobados">✅ Aprobados</option>
              <option value="pendientes">⏳ Pendientes</option>
            </select>
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
        {(filtros.status !== "todos" || filtros.aprobacion !== "todos") && (
          <div style={styles.activeFiltersInfo}>
            <span style={styles.activeFiltersText}>
              Filtros activos:
              {filtros.status !== "todos" && (
                <span style={styles.filterTag}>Estado: {filtros.status}</span>
              )}
              {filtros.aprobacion !== "todos" && (
                <span style={styles.filterTag}>
                  {filtros.aprobacion === "aprobados"
                    ? "Solo aprobados"
                    : "Solo pendientes"}
                </span>
              )}
            </span>
            <span style={styles.resultsCount}>
              ({proyectosFiltrados.length} proyectos encontrados)
            </span>
          </div>
        )}
      </div>

      {/* TABLA DE PROYECTOS - RESPONSIVE MEJORADA */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Proyecto</th>
              <th style={styles.th}>Cliente</th>
              <th style={styles.th}>Responsable</th>
              <th
                style={{
                  ...styles.th,
                  display: isMobile() ? "none" : "table-cell",
                }}
              >
                Ubicación
              </th>
              <th
                style={{
                  ...styles.th,
                  display: isSmallMobile() ? "none" : "table-cell",
                }}
              >
                Fechas
              </th>
              <th style={styles.th}>Cotización</th>
              <th style={styles.th}>Estado</th>
              <th
                style={{
                  ...styles.th,
                  display: isMobile() ? "none" : "table-cell",
                }}
              >
                Aprobado
              </th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proyectosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="9" style={styles.emptyMessage}>
                  {busqueda
                    ? "No se encontraron proyectos que coincidan con la búsqueda"
                    : "No hay proyectos registrados"}
                </td>
              </tr>
            ) : (
              proyectosFiltrados.map((proyecto) => {
                const estiloStatus = obtenerEstiloStatus(proyecto?.status);
                return (
                  <tr key={proyecto?.id} style={styles.tableRow}>
                    {/* COLUMNA 1: INFORMACIÓN DEL PROYECTO + INFO MÓVIL */}
                    <td style={styles.td}>
                      <div style={styles.projectInfo}>
                        <h4 style={styles.projectName}>{proyecto?.nombre}</h4>
                        {proyecto?.descripcion && (
                          <p style={styles.projectDescription}>
                            {String(proyecto.descripcion).length > 50
                              ? `${String(proyecto.descripcion).substring(
                                  0,
                                  50
                                )}...`
                              : proyecto.descripcion}
                          </p>
                        )}

                        {/* INFORMACIÓN EXTRA PARA MÓVILES */}
                        <div
                          style={{
                            display: isMobile() ? "flex" : "none",
                            flexWrap: "wrap",
                            gap: "4px",
                            marginTop: "8px",
                          }}
                        >
                          {proyecto?.ubicacion && (
                            <span style={styles.mobileTag}>
                              📍 {proyecto.ubicacion}
                            </span>
                          )}
                          <span style={styles.mobileTag}>
                            {proyecto?.aprobado
                              ? "✅ Aprobado"
                              : "⏳ Pendiente"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* COLUMNA 2: CLIENTE */}
                    <td style={styles.td}>
                      <div style={styles.clientInfo}>
                        <Users size={16} color="#718096" />
                        <span>{proyecto?.clienteNombre}</span>
                      </div>
                    </td>

                    {/* COLUMNA 3: RESPONSABLE */}
                    <td style={styles.td}>
                      <div style={styles.responsibleInfo}>
                        <User size={16} color="#718096" />
                        <span>{proyecto?.responsableNombre}</span>
                      </div>
                    </td>

                    {/* COLUMNA 4: UBICACIÓN - OCULTA EN MÓVILES */}
                    <td
                      style={{
                        ...styles.td,
                        display: isMobile() ? "none" : "table-cell",
                      }}
                    >
                      <div style={styles.locationInfo}>
                        <MapPin size={16} color="#718096" />
                        <span>{proyecto?.ubicacion || "No especificada"}</span>
                      </div>
                    </td>

                    {/* COLUMNA 5: FECHAS - OCULTA EN MÓVILES PEQUEÑOS */}
                    <td
                      style={{
                        ...styles.td,
                        display: isSmallMobile() ? "none" : "table-cell",
                      }}
                    >
                      <div style={styles.dateInfo}>
                        <small style={styles.dateLabel}>Inicio:</small>
                        <span style={styles.dateValue}>
                          {formatearFecha(proyecto?.fechaInicio)}
                        </span>
                        {proyecto?.fechaAproxFin && (
                          <>
                            <small style={styles.dateLabel}>Est. Fin:</small>
                            <span style={styles.dateValue}>
                              {formatearFecha(proyecto.fechaAproxFin)}
                            </span>
                          </>
                        )}
                        {proyecto?.fechaFin && (
                          <>
                            <small style={styles.dateLabel}>Fin Real:</small>
                            <span style={styles.dateValue}>
                              {formatearFecha(proyecto.fechaFin)}
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* COLUMNA 6: COTIZACIÓN */}
                    <td style={styles.td}>
                      <span style={styles.budgetAmount}>
                        {formatearMoneda(proyecto?.cotizacion)}
                      </span>
                    </td>

                    {/* COLUMNA 7: ESTADO */}
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          color: estiloStatus.color,
                          backgroundColor: estiloStatus.bg,
                        }}
                      >
                        {proyecto?.status}
                      </span>
                    </td>

                    {/* COLUMNA 8: APROBACIÓN - OCULTA EN MÓVILES */}
                    <td
                      style={{
                        ...styles.td,
                        display: isMobile() ? "none" : "table-cell",
                      }}
                    >
                      <div style={styles.approvalStatus}>
                        {proyecto?.aprobado ? (
                          <span style={styles.approvedBadge}>
                            <CheckCircle size={16} />
                            Aprobado
                          </span>
                        ) : (
                          <span style={styles.pendingBadge}>
                            <Clock size={16} />
                            Pendiente
                          </span>
                        )}
                      </div>
                    </td>

                    {/* COLUMNA 9: ACCIONES */}
                    <td style={styles.td}>
                      <div
                        style={{
                          ...styles.actionButtons,
                          ...(isSmallMobile() && {
                            flexDirection: "column",
                            gap: "4px",
                          }),
                        }}
                      >
                        <button
                          style={styles.editButton}
                          onClick={() => abrirModalEditar(proyecto)}
                          title="Editar proyecto"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          style={styles.deleteButton}
                          onClick={() => eliminarProyecto(proyecto)}
                          title="Eliminar proyecto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* =============================================== */}
      {/*         MODAL CREAR PROYECTO - MEJORADO         */}
      {/* =============================================== */}
      {mostrarModalCrear && (
        <div style={styles.modalOverlay} onClick={cerrarModalCrear}>
          <div
            style={getResponsiveModalStyles().modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            {/* TÍTULO DEL MODAL */}
            <h3 style={styles.modalTitle}>Crear Nuevo Proyecto</h3>

            <form onSubmit={crearProyecto}>
              <div style={getResponsiveModalStyles().modalFormContainer}>
                {/* ==================== COLUMNA IZQUIERDA ==================== */}
                <div style={styles.modalColumn}>
                  {/* Nombre del Proyecto */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nombre del Proyecto *</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        style={styles.input}
                        required
                        maxLength={20}
                        placeholder="Nombre del proyecto..."
                      />
                      <span
                        style={{
                          ...styles.charCounter,
                          ...(formData.nombre.length > 15
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.nombre.length >= 20
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.nombre.length}/20
                      </span>
                    </div>
                  </div>

                  {/* Cliente */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Cliente *</label>
                    <select
                      name="clienteId"
                      value={formData.clienteId}
                      onChange={handleInputChange}
                      style={styles.select}
                      required
                    >
                      <option value="">Seleccionar cliente...</option>
                      {clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nombre} {cliente.apellido}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Responsable */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Responsable *</label>
                    <select
                      name="responsableId"
                      value={formData.responsableId}
                      onChange={handleInputChange}
                      style={styles.select}
                      required
                    >
                      <option value="">Seleccionar responsable...</option>
                      {empleados.map((empleado) => (
                        <option key={empleado.id} value={empleado.id}>
                          {empleado.nombre} {empleado.apellido}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fecha de Inicio */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Fecha de Inicio</label>
                    <input
                      type="date"
                      name="fechaInicio"
                      value={formData.fechaInicio}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                </div>

                {/* ==================== COLUMNA DERECHA ==================== */}
                <div style={styles.modalColumn}>
                  {/* Ubicación */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Ubicación</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        name="ubicacion"
                        value={formData.ubicacion}
                        onChange={handleInputChange}
                        style={styles.input}
                        maxLength={50}
                        placeholder="Ubicación del proyecto..."
                      />
                      <span
                        style={{
                          ...styles.charCounter,
                          ...(formData.ubicacion.length > 40
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.ubicacion.length >= 50
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.ubicacion.length}/50
                      </span>
                    </div>
                  </div>

                  {/* Cotización */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Cotización (Q)</label>
                    <input
                      type="number"
                      name="cotizacion"
                      value={formData.cotizacion}
                      onChange={handleInputChange}
                      style={styles.input}
                      step="any"
                      min="0"
                      max="9999999999.99"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Fecha Estimada de Finalización */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Fecha Estimada de Finalización
                    </label>
                    <input
                      type="date"
                      name="fechaAproxFin"
                      value={formData.fechaAproxFin}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>

                  {/* Estado del Proyecto */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Estado del Proyecto</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      style={styles.select}
                    >
                      <option value="planificado">📋 Planificado</option>
                      <option value="en progreso">⚡ En Progreso</option>
                      <option value="pausado">⏸️ Pausado</option>
                      <option value="completado">✅ Completado</option>
                      <option value="cancelado">❌ Cancelado</option>
                    </select>
                  </div>
                </div>

                {/* ==================== FILA COMPLETA ==================== */}
                <div style={styles.modalFullWidth}>
                  {/* Descripción - Ocupa toda la fila */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Descripción</label>
                    <div style={styles.inputWithCounter}>
                      <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleInputChange}
                        style={styles.textarea}
                        rows="3"
                        maxLength={50}
                        placeholder="Descripción detallada del proyecto..."
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

                  {/* Checkbox de Aprobación - Centrado */}
                  <div
                    style={{
                      ...styles.formGroup,
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "10px",
                    }}
                  >
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="aprobado"
                        checked={formData.aprobado}
                        onChange={handleInputChange}
                        style={styles.checkbox}
                      />
                      Proyecto Aprobado
                    </label>
                  </div>
                </div>
              </div>

              {/* ==================== BOTONES DEL MODAL ==================== */}
              <div style={getResponsiveModalStyles().modalActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={cerrarModalCrear}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={styles.saveButton}
                  disabled={loading}
                >
                  {loading ? "Creando..." : "Crear Proyecto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =============================================== */}
      {/*         MODAL EDITAR PROYECTO - MEJORADO         */}
      {/* =============================================== */}
      {mostrarModalEditar && (
        <div style={styles.modalOverlay} onClick={cerrarModalEditar}>
          <div
            style={getResponsiveModalStyles().modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            {/* TÍTULO DEL MODAL */}
            <h3 style={styles.modalTitle}>Editar Proyecto</h3>

            <form onSubmit={actualizarProyecto}>
              <div style={getResponsiveModalStyles().modalFormContainer}>
                {/* ==================== COLUMNA IZQUIERDA ==================== */}
                <div style={styles.modalColumn}>
                  {/* Nombre del Proyecto */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nombre del Proyecto *</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        style={styles.input}
                        required
                        maxLength={20}
                        placeholder="Nombre del proyecto..."
                      />
                      <span
                        style={{
                          ...styles.charCounter,
                          ...(formData.nombre.length > 15
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.nombre.length >= 20
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.nombre.length}/20
                      </span>
                    </div>
                  </div>

                  {/* Cliente */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Cliente *</label>
                    <select
                      name="clienteId"
                      value={formData.clienteId}
                      onChange={handleInputChange}
                      style={styles.select}
                      required
                    >
                      <option value="">Seleccionar cliente...</option>
                      {clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nombre} {cliente.apellido}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Responsable */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Responsable *</label>
                    <select
                      name="responsableId"
                      value={formData.responsableId}
                      onChange={handleInputChange}
                      style={styles.select}
                      required
                    >
                      <option value="">Seleccionar responsable...</option>
                      {empleados.map((empleado) => (
                        <option key={empleado.id} value={empleado.id}>
                          {empleado.nombre} {empleado.apellido}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fecha de Inicio */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Fecha de Inicio</label>
                    <input
                      type="date"
                      name="fechaInicio"
                      value={formData.fechaInicio}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                </div>

                {/* ==================== COLUMNA DERECHA ==================== */}
                <div style={styles.modalColumn}>
                  {/* Ubicación */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Ubicación</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        name="ubicacion"
                        value={formData.ubicacion}
                        onChange={handleInputChange}
                        style={styles.input}
                        maxLength={50}
                        placeholder="Ubicación del proyecto..."
                      />
                      <span
                        style={{
                          ...styles.charCounter,
                          ...(formData.ubicacion.length > 40
                            ? styles.charCounterWarning
                            : {}),
                          ...(formData.ubicacion.length >= 50
                            ? styles.charCounterDanger
                            : {}),
                        }}
                      >
                        {formData.ubicacion.length}/50
                      </span>
                    </div>
                  </div>

                  {/* Cotización */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Cotización (Q)</label>
                    <input
                      type="number"
                      name="cotizacion"
                      value={formData.cotizacion}
                      onChange={handleInputChange}
                      style={styles.input}
                      step="any"
                      min="0"
                      max="9999999999.99"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Fecha Estimada de Finalización */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Fecha Estimada de Finalización
                    </label>
                    <input
                      type="date"
                      name="fechaAproxFin"
                      value={formData.fechaAproxFin}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>

                  {/* Fecha Real de Finalización */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Fecha Real de Finalización
                    </label>
                    <input
                      type="date"
                      name="fechaFin"
                      value={formData.fechaFin}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                </div>

                {/* ==================== FILA COMPLETA ==================== */}
                <div style={styles.modalFullWidth}>
                  {/* Descripción - Ocupa toda la fila */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Descripción</label>
                    <div style={styles.inputWithCounter}>
                      <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleInputChange}
                        style={styles.textarea}
                        rows="3"
                        maxLength={50}
                        placeholder="Descripción detallada del proyecto..."
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

                  {/* Fila con Estado y Checkbox */}
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Estado del Proyecto</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        style={styles.select}
                      >
                        <option value="planificado">📋 Planificado</option>
                        <option value="en progreso">⚡ En Progreso</option>
                        <option value="pausado">⏸️ Pausado</option>
                        <option value="completado">✅ Completado</option>
                        <option value="cancelado">❌ Cancelado</option>
                      </select>
                    </div>

                    <div
                      style={{
                        ...styles.formGroup,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <label style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          name="aprobado"
                          checked={formData.aprobado}
                          onChange={handleInputChange}
                          style={styles.checkbox}
                        />
                        Proyecto Aprobado
                      </label>
                    </div>
                  </div>

                  {/* Información del Proyecto */}
                  <div style={styles.infoBox}>
                    <p
                      style={{
                        margin: "0",
                        fontSize: "14px",
                        color: "#2d3748",
                      }}
                    >
                      <strong>Proyecto seleccionado:</strong>{" "}
                      {proyectoSeleccionado?.nombre}
                    </p>
                  </div>
                </div>
              </div>

              {/* ==================== BOTONES DEL MODAL ==================== */}
              <div style={getResponsiveModalStyles().modalActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={cerrarModalEditar}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={styles.saveButton}
                  disabled={loading}
                >
                  {loading ? "Actualizando..." : "Actualizar Proyecto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =============================================== */}
      {/*         MODAL REPORTES - ESTANDARIZADO         */}
      {/* =============================================== */}
      {mostrarModalReportes && (
        <div
          style={styles.modalOverlay}
          onClick={() => setMostrarModalReportes(false)}
        >
          <div
            style={{
              ...getResponsiveModalStyles().modalContent,
              maxWidth: "700px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* TÍTULO DEL MODAL */}
            <h3 style={styles.modalTitle}>Generar Reporte de Proyectos</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                generarReporte();
              }}
            >
              <div style={styles.reportConfigContainer}>
                {/* ==================== FILTROS PRINCIPALES ==================== */}
                <div style={styles.formRow}>
                  {/* Filtro por Estado */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Filtrar por Estado</label>
                    <select
                      style={styles.select}
                      value={configuracionReporte.statusSeleccionado}
                      onChange={(e) =>
                        setConfiguracionReporte((prev) => ({
                          ...prev,
                          statusSeleccionado: e.target.value,
                        }))
                      }
                    >
                      <option value="todos">📂 Todos los estados</option>
                      <option value="planificado">📋 Planificado</option>
                      <option value="en progreso">⚡ En Progreso</option>
                      <option value="pausado">⏸️ Pausado</option>
                      <option value="completado">✅ Completado</option>
                      <option value="cancelado">❌ Cancelado</option>
                    </select>
                  </div>

                  {/* Filtro por Cliente */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Filtrar por Cliente</label>
                    <select
                      style={styles.select}
                      value={configuracionReporte.clienteSeleccionado}
                      onChange={(e) =>
                        setConfiguracionReporte((prev) => ({
                          ...prev,
                          clienteSeleccionado: e.target.value,
                        }))
                      }
                    >
                      <option value="">Todos los clientes</option>
                      {clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nombre} {cliente.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ==================== FILTROS SECUNDARIOS ==================== */}
                <div style={styles.formRow}>
                  {/* Filtro por Responsable */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Filtrar por Responsable</label>
                    <select
                      style={styles.select}
                      value={configuracionReporte.responsableSeleccionado || ""}
                      onChange={(e) =>
                        setConfiguracionReporte((prev) => ({
                          ...prev,
                          responsableSeleccionado: e.target.value,
                        }))
                      }
                    >
                      <option value="">Todos los responsables</option>
                      {empleados.map((empleado) => (
                        <option key={empleado.id} value={empleado.id}>
                          {empleado.nombre} {empleado.apellido}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por Aprobación */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Filtrar por Aprobación</label>
                    <select
                      style={styles.select}
                      value={
                        configuracionReporte.aprobacionSeleccionada || "todos"
                      }
                      onChange={(e) =>
                        setConfiguracionReporte((prev) => ({
                          ...prev,
                          aprobacionSeleccionada: e.target.value,
                        }))
                      }
                    >
                      <option value="todos">📋 Todos</option>
                      <option value="aprobados">✅ Solo Aprobados</option>
                      <option value="pendientes">⏳ Solo Pendientes</option>
                    </select>
                  </div>
                </div>

                {/* ==================== OPCIONES DE CONTENIDO ==================== */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Contenido del Reporte</label>
                  <div style={styles.checkboxGroup}>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={configuracionReporte.incluirFechas}
                        onChange={(e) =>
                          setConfiguracionReporte((prev) => ({
                            ...prev,
                            incluirFechas: e.target.checked,
                          }))
                        }
                        style={styles.checkbox}
                      />
                      Incluir fechas del proyecto (inicio y fin estimado)
                    </label>

                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={configuracionReporte.incluirFinanzas}
                        onChange={(e) =>
                          setConfiguracionReporte((prev) => ({
                            ...prev,
                            incluirFinanzas: e.target.checked,
                          }))
                        }
                        style={styles.checkbox}
                      />
                      Incluir información financiera (cotizaciones)
                    </label>

                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={configuracionReporte.incluirAprobacion}
                        onChange={(e) =>
                          setConfiguracionReporte((prev) => ({
                            ...prev,
                            incluirAprobacion: e.target.checked,
                          }))
                        }
                        style={styles.checkbox}
                      />
                      Incluir estado de aprobación
                    </label>
                  </div>
                  {/* <small style={styles.helpText}>
                    Selecciona qué información adicional incluir en el reporte
                  </small> */}
                </div>

                {/* ==================== VISTA PREVIA ==================== */}
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
                      <strong>Proyectos estimados:</strong>{" "}
                      {(() => {
                        let filtrados = [...proyectosFiltrados];

                        if (
                          configuracionReporte.statusSeleccionado !== "todos"
                        ) {
                          filtrados = filtrados.filter(
                            (p) =>
                              p.status ===
                              configuracionReporte.statusSeleccionado
                          );
                        }

                        if (configuracionReporte.clienteSeleccionado) {
                          filtrados = filtrados.filter(
                            (p) =>
                              p.clienteId ==
                              configuracionReporte.clienteSeleccionado
                          );
                        }

                        if (configuracionReporte.responsableSeleccionado) {
                          filtrados = filtrados.filter(
                            (p) =>
                              p.responsableId ==
                              configuracionReporte.responsableSeleccionado
                          );
                        }

                        if (
                          configuracionReporte.aprobacionSeleccionada !==
                          "todos"
                        ) {
                          if (
                            configuracionReporte.aprobacionSeleccionada ===
                            "aprobados"
                          ) {
                            filtrados = filtrados.filter(
                              (p) => p.aprobado === true || p.aprobado === 1
                            );
                          } else if (
                            configuracionReporte.aprobacionSeleccionada ===
                            "pendientes"
                          ) {
                            filtrados = filtrados.filter(
                              (p) =>
                                p.aprobado === false ||
                                p.aprobado === 0 ||
                                !p.aprobado
                            );
                          }
                        }

                        return filtrados.length;
                      })()}{" "}
                      proyectos
                    </p>
                  </div>
                </div>
              </div>

              {/* ==================== BOTONES DEL MODAL ==================== */}
              <div style={getResponsiveModalStyles().modalActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => setMostrarModalReportes(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={styles.saveButton}
                  disabled={loading}
                >
                  {loading ? "Generando..." : "Generar Reporte PDF"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 🎨 ESTILOS ESTANDARIZADOS PARA PROYECTOSCRUD
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

  createButton: {
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
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", // Reducir tamaño mínimo
    gap: "20px",
    marginBottom: "30px",
  },
  //VIEJO:
  // statsContainer: {
  //   display: "grid",
  //   gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  //   gap: "20px",
  //   marginBottom: "30px",
  // },

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

  statLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#718096",
    margin: "0 0 8px 0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
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
  },

  projectInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    maxWidth: "200px",
  },
  mobileTag: {
    fontSize: "11px",
    color: "#718096",
    backgroundColor: "#f7fafc",
    padding: "2px 6px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  },
  projectName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2d3748",
    margin: "0 0 4px 0",
  },

  projectDescription: {
    fontSize: "12px",
    color: "#718096",
    margin: "0",
    lineHeight: "1.4",
  },

  clientInfo: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#4a5568",
  },

  responsibleInfo: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#4a5568",
  },

  dateInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  dateLabel: {
    fontSize: "11px",
    color: "#718096",
    fontWeight: "600",
  },

  dateValue: {
    fontSize: "13px",
    color: "#4a5568",
    marginBottom: "8px",
  },

  budgetInfo: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  budgetAmount: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#38a169", // MANTENER EL COLOR VERDE
  },

  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize",
  },

  approvalStatus: {
    display: "flex",
    alignItems: "center",
  },

  approvedBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 12px",
    backgroundColor: "#c6f6d5",
    color: "#38a169",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },

  pendingBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 12px",
    backgroundColor: "#fbb86f",
    color: "#dd6b20",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },

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

  emptyMessage: {
    textAlign: "center",
    padding: "48px 16px",
    color: "#718096",
    fontSize: "16px",
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
    maxWidth: "700px", // Cambiar de 600px a 700px para columnas
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

  formGroup: {
    marginBottom: "20px",
  },

  formRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "15px",
  },

  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#4a5568",
    marginBottom: "6px",
  },

  input: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e2e8f0", // Cambiar de 1px a 2px
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
    border: "2px solid #e2e8f0", // Cambiar de 1px a 2px
    borderRadius: "8px",
    fontSize: "16px",
    backgroundColor: "white",
    cursor: "pointer",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease",
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

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#4a5568",
    cursor: "pointer",
    fontWeight: "500",
  },

  checkbox: {
    width: "16px",
    height: "16px",
    cursor: "pointer",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "30px",
    flexWrap: "wrap",
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

  // ESTILOS ESPECÍFICOS PARA REPORTES
  checkboxGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "8px",
  },

  infoBox: {
    backgroundColor: "#f0f9ff",
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #bae6fd",
    marginBottom: "20px",
  },

  helpText: {
    fontSize: "12px",
    color: "#718096",
    marginTop: "4px",
    fontStyle: "italic",
  },

  // MEDIA QUERIES
  "@media (max-width: 768px)": {
    modalContent: {
      padding: "20px",
      margin: "10px",
      maxHeight: "95vh",
    },
    formRow: {
      gridTemplateColumns: "1fr",
    },
    headerActions: {
      flexDirection: "column",
      gap: "8px",
    },
    filtersRow: {
      gridTemplateColumns: "1fr",
    },
  },

  // Estilos para los filtros
  filtersContainer: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "25px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },

  filtersRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
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

  // Agregar estos estilos al objeto styles al final del archivo
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
  //   color: "#dd6b20",
  // },

  // charCounterDanger: {
  //   color: "#e53e3e",
  // },

  locationInfo: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#4a5568",
  },

  // NUEVOS ESTILOS PARA MODALES ESTANDARIZADOS
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

  reportConfigContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
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
};

// ✅ Exportar el componente
export default ProyectosCRUD;
