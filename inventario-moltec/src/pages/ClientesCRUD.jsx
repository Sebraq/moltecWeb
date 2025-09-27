// pages/ClientesCRUD.jsx - CRUD completo de clientes (CORREGIDO)
import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  Mail,
  Phone,
  CreditCard,
  FileText,
} from "lucide-react";
import { toast } from "react-toastify";
import clientesApi from "../services/clienteApi";
import reportesService from "../services/reportesService";

const ClientesCRUD = () => {
  // 🎯 ESTADOS PRINCIPALES
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    totalClientes: 0,
    clientesConCorreo: 0,
    clientesConTelefono: 0,
    clientesConNIT: 0,
  });

  // 🔍 ESTADOS DE BÚSQUEDA Y FILTROS
  const [busqueda, setBusqueda] = useState("");

  const [filtros, setFiltros] = useState({
    fechaDesde: "",
    fechaHasta: "",
  });

  // 📋 ESTADOS DE FORMULARIOS
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // 📋 FORMULARIO CREAR/EDITAR
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    nit: "",
  });

  // 🚀 CARGAR DATOS AL INICIALIZAR
  useEffect(() => {
    cargarDatos();
  }, []);

  // 🔍 FILTRAR CLIENTES CUANDO CAMBIE LA BÚSQUEDA
  // REEMPLAZAR el useEffect existente de filtrado por este:
 useEffect(() => {
  let filtrados = clientesApi.filtrarClientes(clientes, busqueda);

  // Aplicar filtro de fechas (CORREGIDO)
  if (filtros.fechaDesde || filtros.fechaHasta) {
    filtrados = filtrados.filter((cliente) => {
      const fechaRegistro = new Date(cliente.fechaRegistro);
      
      // ✅ FIX: Agregar T00:00:00 para fechaDesde también
      const fechaDesde = filtros.fechaDesde
        ? new Date(filtros.fechaDesde + "T00:00:00")  // ← CAMBIO AQUÍ
        : null;
      const fechaHasta = filtros.fechaHasta
        ? new Date(filtros.fechaHasta + "T23:59:59")
        : null;

      // Comparación más precisa con logging para debug
      if (fechaDesde && fechaRegistro < fechaDesde) {
        console.log(`❌ Cliente filtrado - Registro: ${fechaRegistro.toLocaleString()}, Desde: ${fechaDesde.toLocaleString()}`);
        return false;
      }
      if (fechaHasta && fechaRegistro > fechaHasta) {
        console.log(`❌ Cliente filtrado - Registro: ${fechaRegistro.toLocaleString()}, Hasta: ${fechaHasta.toLocaleString()}`);
        return false;
      }

      return true;
    });
  }

  setClientesFiltrados(filtrados);
}, [clientes, busqueda, filtros]);

  useEffect(() => {
    const handleResize = () => {
      // Forzar re-render cuando cambie el tamaño
      setLoading((prev) => prev);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // AGREGAR esta función antes del return:
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

      // Cargar clientes y estadísticas en paralelo
      const [clientesResponse, statsResponse] = await Promise.all([
        clientesApi.obtenerClientes(),
        clientesApi.obtenerEstadisticas(),
      ]);

      if (clientesResponse.success) {
        setClientes(clientesResponse.data);
        setClientesFiltrados(clientesResponse.data);
      }

      if (statsResponse.success) {
        setEstadisticas(statsResponse.data);
      }

      console.log("✅ Datos cargados exitosamente");
    } catch (error) {
      console.error("❌ Error al cargar datos:", error);
      toast.error("Error al cargar los clientes");
    } finally {
      setLoading(false);
    }
  };

  const recargarDatos = async () => {
    try {
      toast.info("Recargando datos...");

      // Resetear filtros y búsqueda
      setFiltros({
        fechaDesde: "",
        fechaHasta: "",
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

  // 📊 FUNCIÓN PARA GENERAR REPORTE PDF
  const generarReportePDF = async () => {
    try {
      setLoading(true);

      // Mostrar toast de que se está generando
      toast.info("📊 Generando reporte PDF...", {
        autoClose: 2000,
      });

      // Generar el reporte usando el servicio existente
      await reportesService.generarReporteClientesPDF(clientes, estadisticas);

      // Mostrar éxito
      toast.success("✅ Reporte PDF descargado exitosamente");
    } catch (error) {
      console.error("❌ Error al generar reporte:", error);
      toast.error("Error al generar el reporte PDF");
    } finally {
      setLoading(false);
    }
  };
  // ➕ CREAR NUEVO CLIENTE
  const crearCliente = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await clientesApi.crearCliente(formData);

      if (response.success) {
        toast.success("Cliente creado exitosamente");
        await cargarDatos(); // Recargar lista
        cerrarModalCrear();
      }
    } catch (error) {
      toast.error(error.message || "Error al crear el cliente");
    } finally {
      setLoading(false);
    }
  };

  // ✏️ ACTUALIZAR CLIENTE
  const actualizarCliente = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await clientesApi.actualizarCliente(
        clienteSeleccionado.id,
        formData
      );

      if (response.success) {
        toast.success("Cliente actualizado exitosamente");
        await cargarDatos();
        cerrarModalEditar();
      }
    } catch (error) {
      toast.error(error.message || "Error al actualizar el cliente");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ ELIMINAR CLIENTE
  const eliminarCliente = async (cliente) => {
    if (
      !window.confirm(
        `¿Estás seguro de eliminar a "${cliente.nombre} ${cliente.apellido}"?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      const response = await clientesApi.eliminarCliente(cliente.id);

      if (response.success) {
        toast.success("Cliente eliminado exitosamente");
        await cargarDatos();
      }
    } catch (error) {
      toast.error(error.message || "Error al eliminar el cliente");
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear fecha en filtros activos
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

  const formatearTelefono = (telefono) => {
    if (!telefono || telefono.length !== 8) return telefono;
    return `${telefono.slice(0, 4)}-${telefono.slice(4)}`;
  };

  // 📄 FUNCIONES DE MODAL
  const abrirModalCrear = () => {
    setFormData({
      nombre: "",
      apellido: "",
      correo: "",
      telefono: "",
      nit: "",
    });
    setMostrarModalCrear(true);
  };

  const cerrarModalCrear = () => {
    setMostrarModalCrear(false);
    setFormData({
      nombre: "",
      apellido: "",
      correo: "",
      telefono: "",
      nit: "",
    });
  };

  const abrirModalEditar = (cliente) => {
    setClienteSeleccionado(cliente);
    setFormData({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      correo: cliente.correo || "",
      telefono: cliente.telefono || "",
      nit: cliente.nit || "",
    });
    setMostrarModalEditar(true);
  };

  const cerrarModalEditar = () => {
    setMostrarModalEditar(false);
    setClienteSeleccionado(null);
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
        hour: "2-digit", // ← AGREGAR
        minute: "2-digit", // ← AGREGAR
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // 🎨 RENDERIZADO DEL COMPONENTE
  if (loading && clientes.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <RefreshCw size={40} className="spinning" />
        <h2>Cargando clientes...</h2>
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
            Gestión de Clientes
          </h1>
          <p style={styles.subtitle}>
            Administración completa de la base de datos de clientes
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            style={styles.reportButton}
            onClick={generarReportePDF}
            disabled={loading || clientes.length === 0}
            title="Descargar reporte completo en PDF"
          >
            <FileText size={16} />
            Reporte PDF
          </button>

          <button
            style={styles.refreshButton}
            onClick={recargarDatos} // ← Cambiar de cargarDatos a recargarDatos
            disabled={loading}
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
          <button style={styles.addButton} onClick={abrirModalCrear}>
            <Plus size={16} />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* ESTADÍSTICAS */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Total Clientes</h3>
          <p style={styles.statNumber}>
            {estadisticas.totalClientes || clientes.length}
          </p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Con Correo</h3>
          <p style={{ ...styles.statNumber, color: "#4299e1" }}>
            {estadisticas.clientesConCorreo || 0}
          </p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Con Teléfono</h3>
          <p style={{ ...styles.statNumber, color: "#48bb78" }}>
            {estadisticas.clientesConTelefono || 0}
          </p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Con NIT</h3>
          <p style={{ ...styles.statNumber, color: "#9f7aea" }}>
            {estadisticas.clientesConNIT || 0}
          </p>
        </div>
      </div>

      {/* BÚSQUEDA */}
      <div style={styles.searchContainer}>
        <div style={styles.searchBox}>
          <Search size={20} color="#6c757d" />
          <input
            type="text"
            placeholder="Buscar clientes por nombre, apellido, correo, teléfono o NIT..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* FILTROS */}
      <div style={styles.filtersContainer}>
        <div style={styles.filtersRow}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Fecha desde:</label>
            <input
              type="date"
              value={filtros.fechaDesde}
              onChange={(e) =>
                setFiltros({ ...filtros, fechaDesde: e.target.value })
              }
              style={styles.filterSelect}
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Fecha hasta:</label>
            <input
              type="date"
              value={filtros.fechaHasta}
              onChange={(e) =>
                setFiltros({ ...filtros, fechaHasta: e.target.value })
              }
              style={styles.filterSelect}
            />
          </div>

          <div style={styles.filterGroup}>
            <button
              onClick={() => setFiltros({ fechaDesde: "", fechaHasta: "" })}
              style={styles.resetButton}
              title="Resetear todos los filtros"
            >
              <RefreshCw size={16} />
              Resetear
            </button>
          </div>
        </div>

        {/* Indicador de filtros activos */}
        {(filtros.fechaDesde || filtros.fechaHasta) && (
          <div style={styles.activeFiltersInfo}>
            <span style={styles.activeFiltersText}>
              Filtros activos:
              {filtros.fechaDesde && (
                <span style={styles.filterTag}>
                  Desde: {formatearFechaLocal(filtros.fechaDesde)}
                </span>
              )}
              {filtros.fechaHasta && (
                <span style={styles.filterTag}>
                  Hasta: {formatearFechaLocal(filtros.fechaHasta)}
                </span>
              )}
            </span>
            <span style={styles.resultsCount}>
              ({clientesFiltrados.length} clientes encontrados)
            </span>
          </div>
        )}
      </div>

      {/* TABLA DE CLIENTES */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Nombre Completo</th>
              <th style={styles.th}>Correo Electrónico</th>
              <th style={styles.th}>Teléfono</th>
              <th style={styles.th}>NIT</th>
              <th style={styles.th}>Fecha Registro</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.length > 0 ? (
              clientesFiltrados.map((cliente) => (
                <tr key={cliente.id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <div style={styles.clienteInfo}>
                      <strong>
                        {cliente.nombre} {cliente.apellido}
                      </strong>
                    </div>
                  </td>
                  <td style={styles.td}>
                    {cliente.correo ? (
                      <div style={styles.contactInfo}>
                        <Mail size={16} color="#4299e1" />
                        <a
                          href={`mailto:${cliente.correo}`}
                          style={styles.emailLink}
                        >
                          {cliente.correo}
                        </a>
                      </div>
                    ) : (
                      <span style={styles.noData}>Sin correo</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {cliente.telefono ? (
                      <div style={styles.contactInfo}>
                        <Phone size={16} color="#48bb78" />
                        <a
                          href={`tel:${cliente.telefono}`}
                          style={styles.phoneLink}
                        >
                          {formatearTelefono(cliente.telefono)}
                        </a>
                      </div>
                    ) : (
                      <span style={styles.noData}>Sin teléfono</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {cliente.nit ? (
                      <div style={styles.contactInfo}>
                        <CreditCard size={16} color="#9f7aea" />
                        <span>{cliente.nit}</span>
                      </div>
                    ) : (
                      <span style={styles.noData}>Sin NIT</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {formatearFecha(cliente.fechaRegistro)}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button
                        style={styles.editButton}
                        title="Editar"
                        onClick={() => abrirModalEditar(cliente)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        style={styles.deleteButton}
                        title="Eliminar"
                        onClick={() => eliminarCliente(cliente)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={styles.noResults}>
                  {busqueda
                    ? `No se encontraron clientes que coincidan con "${busqueda}"`
                    : "No hay clientes registrados"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CREAR CLIENTE */}
      {mostrarModalCrear && (
        <div style={styles.modalOverlay} onClick={cerrarModalCrear}>
          <div
            style={getResponsiveModalStyles().modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={styles.modalTitle}>Crear Nuevo Cliente</h3>

            <form onSubmit={crearCliente}>
              <div style={getResponsiveModalStyles().modalFormContainer}>
                {/* COLUMNA IZQUIERDA */}
                <div style={styles.modalColumn}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nombre *</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 15) {
                            setFormData({ ...formData, nombre: value });
                          }
                        }}
                        style={styles.input}
                        required
                        placeholder="Juan Carlos"
                        maxLength="15"
                      />
                      <small style={styles.charCounter}>
                        {formData.nombre.length}/15
                      </small>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Apellido *</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        value={formData.apellido}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 25) {
                            setFormData({ ...formData, apellido: value });
                          }
                        }}
                        style={styles.input}
                        required
                        placeholder="Pérez López"
                        maxLength="25"
                      />
                      <small style={styles.charCounter}>
                        {formData.apellido.length}/25
                      </small>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Teléfono</label>
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
                      <small style={styles.charCounter}>
                        {formData.telefono.length}/8
                      </small>
                    </div>
                  </div>
                </div>

                {/* COLUMNA DERECHA */}
                <div style={styles.modalColumn}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Correo Electrónico</label>
                    <input
                      type="email"
                      value={formData.correo}
                      onChange={(e) =>
                        setFormData({ ...formData, correo: e.target.value })
                      }
                      style={styles.input}
                      placeholder="juan@email.com"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>NIT</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        value={formData.nit}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (
                            /^[\d-]*$/.test(value) &&
                            value.replace(/\D/g, "").length <= 9
                          ) {
                            setFormData({ ...formData, nit: value });
                          }
                        }}
                        style={styles.input}
                        placeholder="12345678-9"
                        maxLength="11"
                      />
                      <small style={styles.charCounter}>
                        {formData.nit.replace(/\D/g, "").length}/9
                      </small>
                    </div>
                  </div>
                </div>

                {/* INFORMACIÓN ADICIONAL - ANCHO COMPLETO */}
                <div style={styles.modalFullWidth}>
                  <div style={styles.infoBox}>
                    <p style={styles.helpText}>
                      💡 <strong>Límites:</strong> Nombre (15 chars), Apellido
                      (25 chars), Teléfono (8 dígitos), NIT (9 dígitos)
                    </p>
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
                  {loading ? "Creando..." : "Crear Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR CLIENTE */}
      {mostrarModalEditar && (
        <div style={styles.modalOverlay} onClick={cerrarModalEditar}>
          <div
            style={getResponsiveModalStyles().modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={styles.modalTitle}>Editar Cliente</h3>

            <form onSubmit={actualizarCliente}>
              <div style={getResponsiveModalStyles().modalFormContainer}>
                {/* COLUMNA IZQUIERDA */}
                <div style={styles.modalColumn}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nombre *</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 15) {
                            setFormData({ ...formData, nombre: value });
                          }
                        }}
                        style={styles.input}
                        required
                        maxLength="15"
                        placeholder="Juan Carlos"
                      />
                      <small style={styles.charCounter}>
                        {formData.nombre.length}/15
                      </small>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Apellido *</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        value={formData.apellido}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 25) {
                            setFormData({ ...formData, apellido: value });
                          }
                        }}
                        style={styles.input}
                        required
                        maxLength="25"
                        placeholder="Pérez López"
                      />
                      <small style={styles.charCounter}>
                        {formData.apellido.length}/25
                      </small>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Teléfono</label>
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
                      <small style={styles.charCounter}>
                        {formData.telefono.length}/8
                      </small>
                    </div>
                  </div>
                </div>

                {/* COLUMNA DERECHA */}
                <div style={styles.modalColumn}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Correo Electrónico</label>
                    <input
                      type="email"
                      value={formData.correo}
                      onChange={(e) =>
                        setFormData({ ...formData, correo: e.target.value })
                      }
                      style={styles.input}
                      placeholder="juan@email.com"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>NIT</label>
                    <div style={styles.inputWithCounter}>
                      <input
                        type="text"
                        value={formData.nit}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (
                            /^[\d-]*$/.test(value) &&
                            value.replace(/\D/g, "").length <= 9
                          ) {
                            setFormData({ ...formData, nit: value });
                          }
                        }}
                        style={styles.input}
                        maxLength="11"
                        placeholder="12345678-9"
                      />
                      <small style={styles.charCounter}>
                        {formData.nit.replace(/\D/g, "").length}/9
                      </small>
                    </div>
                  </div>
                </div>

                {/* INFORMACIÓN ADICIONAL - ANCHO COMPLETO */}
                <div style={styles.modalFullWidth}>
                  <div style={styles.infoBox}>
                    <p>
                      <strong>Fecha de Registro:</strong>{" "}
                      {formatearFecha(clienteSeleccionado?.fechaRegistro)}
                    </p>
                    <p style={styles.helpText}>
                      💡 <strong>Límites:</strong> Nombre (15 chars), Apellido
                      (25 chars), Teléfono (8 dígitos), NIT (9 dígitos)
                    </p>
                  </div>
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
                  {loading ? "Actualizando..." : "Actualizar Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 🎨 ESTILOS DEL COMPONENTE
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
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", // ← Cambiar de 200px a 180px
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
    overflowX: "auto", // ← AGREGAR
    overflowY: "auto", // ← AGREGAR
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
    padding: "16px 12px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "600",
    color: "#4a5568",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap", // ← AGREGAR para evitar corte de texto
  position: "sticky",
  },

  tableRow: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background-color 0.2s ease",
  },

  td: {
    padding: "16px 12px",
    fontSize: "14px",
    color: "#2d3748",
    whiteSpace: "nowrap"
  },

  clienteInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  contactInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  emailLink: {
    color: "#2d3748", // ← Cambiar de "#4299e1" a negro
    textDecoration: "none",
    fontSize: "14px",
  },

  phoneLink: {
    color: "#2d3748", // ← Cambiar de "#48bb78" a negro
    textDecoration: "none",
    fontSize: "13px", 
  },

  noData: {
    color: "#a0aec0",
    fontStyle: "italic",
    fontSize: "14px",
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
    padding: "32px", // ← Aumentar padding
    width: "100%",
    maxWidth: "700px", // ← Más ancho para 2 columnas
    maxHeight: "85vh", // ← Cambiar altura
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    position: "relative", // ← Agregar
  },

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

  modalTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: "24px", // ← Aumentar margen
    textAlign: "center",
    paddingBottom: "16px", // ← Agregar
    borderBottom: "2px solid #e2e8f0", // ← Agregar
  },

  formGroup: {
    marginBottom: "20px",
  },

  formRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
    padding: "12px 16px", // ← Aumentar padding
    border: "2px solid #e2e8f0", // ← Border más grueso
    borderRadius: "8px",
    fontSize: "16px",
    fontFamily: "Arial, sans-serif",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease", // ← Agregar box-shadow
    boxSizing: "border-box",
    backgroundColor: "#fff", // ← Agregar
  },

  inputWithCounter: {
    position: "relative",
  },

  charCounter: {
    position: "absolute",
    right: "8px",
    bottom: "-18px",
    fontSize: "11px",
    color: "#718096",
    fontWeight: "500",
  },

  infoBox: {
    backgroundColor: "#e6f3ff",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #bee3f8",
    marginBottom: "20px",
  },

  helpText: {
    fontSize: "12px",
    color: "#4a5568",
    marginTop: "5px",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "32px", // ← Aumentar margen
    paddingTop: "24px", // ← Agregar padding
    borderTop: "1px solid #e2e8f0", // ← Agregar border
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

  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
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
    backgroundColor: "#718096", // Este es el color gris correcto
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },

  filterInput: {
    padding: "10px 12px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "Arial, sans-serif",
    transition: "border-color 0.2s ease",
    backgroundColor: "white",
  },

  dateFilters: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  dateInput: {
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "Arial, sans-serif",
    transition: "border-color 0.2s ease",
    backgroundColor: "white",
    minWidth: "140px",
  },

  dateSpan: {
    color: "#718096",
    fontSize: "14px",
    fontWeight: "500",
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

  // AGREGAR al final del objeto styles, antes del cierre:
  "@media (max-width: 768px)": {
    modalFormContainer: {
      gridTemplateColumns: "1fr",
      gap: "16px",
    },
    modalContent: {
      padding: "24px",
      margin: "10px",
      maxWidth: "calc(100vw - 20px)",
    },
    modalActions: {
      flexDirection: "column",
    },
    headerActions: {
      justifyContent: "center",
    },
    statsContainer: {
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "15px",
    },
  },

  "@media (max-width: 480px)": {
    modalContent: {
      padding: "20px",
    },
    modalTitle: {
      fontSize: "20px",
    },
    title: {
      fontSize: "24px",
    },
    headerActions: {
      width: "100%",
      justifyContent: "stretch",
    },
    addButton: {
      flex: 1,
      justifyContent: "center",
    },
    refreshButton: {
      flex: 1,
      justifyContent: "center",
    },
    reportButton: {
      flex: 1,
      justifyContent: "center",
    },
  },
};

export default ClientesCRUD;
