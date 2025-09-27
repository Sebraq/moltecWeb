// services/empleadosApi.js - CORREGIDO
// 🔧 CONFIGURACIÓN REUTILIZABLE - Cambia estos valores para otros CRUDs
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL,
  endpoint: "empleados", // 👈 Cambiar por 'herramientas', 'proyectos', etc.
  timeout: 10000,
};

class EmpleadosAPI {
  constructor() {
    this.baseURL = `${API_CONFIG.baseURL}/${API_CONFIG.endpoint}`;
  }

  // 🔑 Obtener token de autenticación
  getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  }

  // 🛠️ Método base para hacer requests
  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
        ...options,
        timeout: API_CONFIG.timeout,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP Error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("❌ API Error:", error);
      throw error;
    }
  }

  // 📋 OBTENER TODOS LOS EMPLEADOS
  async obtenerEmpleados() {
    console.log("👥 Obteniendo empleados...");

    try {
      const data = await this.makeRequest(this.baseURL);
      console.log(`✅ ${data.data.length} empleados obtenidos`);
      return data;
    } catch (error) {
      console.error("❌ Error al obtener empleados:", error);
      throw new Error("No se pudieron cargar los empleados");
    }
  }

  // ➕ CREAR NUEVO EMPLEADO
  async crearEmpleado(empleadoData) {
    console.log("➕ Creando empleado:", empleadoData);

    try {
      // Validaciones básicas en frontend
      if (
        !empleadoData.nombre ||
        !empleadoData.apellido ||
        !empleadoData.puestoId
      ) {
        throw new Error("Nombre, apellido y puesto son obligatorios");
      }

      const data = await this.makeRequest(this.baseURL, {
        method: "POST",
        body: JSON.stringify(empleadoData),
      });

      console.log("✅ Empleado creado exitosamente");
      return data;
    } catch (error) {
      console.error("❌ Error al crear empleado:", error);
      throw error;
    }
  }

  // ✏️ ACTUALIZAR EMPLEADO
  async actualizarEmpleado(id, empleadoData) {
    console.log(`✏️ Actualizando empleado ID: ${id}`, empleadoData);

    try {
      if (
        !empleadoData.nombre ||
        !empleadoData.apellido ||
        !empleadoData.puestoId
      ) {
        throw new Error("Nombre, apellido y puesto son obligatorios");
      }

      const data = await this.makeRequest(`${this.baseURL}/${id}`, {
        method: "PUT",
        body: JSON.stringify(empleadoData),
      });

      console.log("✅ Empleado actualizado exitosamente");
      return data;
    } catch (error) {
      console.error("❌ Error al actualizar empleado:", error);
      throw error;
    }
  }

  // 🗑️ ELIMINAR EMPLEADO
  async eliminarEmpleado(id) {
    console.log(`🗑️ Eliminando empleado ID: ${id}`);

    try {
      const data = await this.makeRequest(`${this.baseURL}/${id}`, {
        method: "DELETE",
      });

      console.log("✅ Empleado eliminado exitosamente");
      return data;
    } catch (error) {
      console.error("❌ Error al eliminar empleado:", error);
      throw error;
    }
  }

  // 📊 OBTENER ESTADÍSTICAS
  async obtenerEstadisticas() {
    console.log("📊 Obteniendo estadísticas...");

    try {
      const data = await this.makeRequest(`${this.baseURL}/estadisticas`);
      console.log("✅ Estadísticas obtenidas");
      return data;
    } catch (error) {
      console.error("❌ Error al obtener estadísticas:", error);
      throw new Error("No se pudieron cargar las estadísticas");
    }
  }

  // 📋 OBTENER PUESTOS DISPONIBLES
  async obtenerPuestos() {
    console.log("📋 Obteniendo puestos...");

    try {
      const data = await this.makeRequest(`${this.baseURL}/puestos`);
      console.log("✅ Puestos obtenidos");
      return data;
    } catch (error) {
      console.error("❌ Error al obtener puestos:", error);
      throw new Error("No se pudieron cargar los puestos");
    }
  }

  // 🔍 BUSCAR EMPLEADOS (método helper para filtrado local)
  buscarEmpleados(empleados, termino) {
    if (!termino) return empleados;

    const terminoLower = termino.toLowerCase();
    return empleados.filter(
      (empleado) =>
        empleado.nombre.toLowerCase().includes(terminoLower) ||
        empleado.apellido.toLowerCase().includes(terminoLower) ||
        (empleado.identificacion &&
          empleado.identificacion.includes(terminoLower)) ||
        (empleado.puestoNombre &&
          empleado.puestoNombre.toLowerCase().includes(terminoLower)) ||
        (empleado.telefono && empleado.telefono.includes(terminoLower)) ||
        `${empleado.nombre} ${empleado.apellido}`
          .toLowerCase()
          .includes(terminoLower)
    );
  }

  // 🎯 DETERMINAR ESTADO DEL EMPLEADO (método helper)
  getEstadoEmpleado(status) {
    if (status === "activo") {
      return {
        texto: "Activo",
        color: "#38a169",
        bg: "#c6f6d5",
        //icon: "🟢",
      };
    } else {
      return {
        texto: "Inactivo",
        color: "#e53e3e",
        bg: "#fed7d7",
        //icon: "🔴",
      };
    }
  }

  // 📅 FORMATEAR FECHA PARA MOSTRAR
  formatearFecha(fecha) {
    if (!fecha) return "N/A";

    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleDateString("es-GT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return "Fecha inválida";
    }
  }

  // 📢 FORMATEAR TELÉFONO
  formatearTelefono(telefono) {
    if (!telefono) return "";

    // Formatear como XXXX-XXXX
    const clean = telefono.replace(/\D/g, "");
    if (clean.length === 8) {
      return `${clean.slice(0, 4)}-${clean.slice(4)}`;
    }
    return telefono;
  }

  // ⏳ CALCULAR ANTIGÜEDAD
  // ⏳ CALCULAR ANTIGÜEDAD (MEJORADA CON RANGO)
  calcularAntiguedad(fechaContratacion, fechaFinalizacion = null) {
    if (!fechaContratacion) return "N/A";

    try {
      const fechaInicio = new Date(fechaContratacion);

      // Si hay fecha de finalización, usarla; si no, usar fecha actual
      const fechaFinal = fechaFinalizacion
        ? new Date(fechaFinalizacion)
        : new Date();

      // Validar que la fecha final sea posterior a la inicial
      if (fechaFinal <= fechaInicio) {
        return "Fechas inválidas";
      }

      const diffTime = Math.abs(fechaFinal - fechaInicio);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Formatear el resultado
      if (diffDays < 30) {
        return `${diffDays} día${diffDays === 1 ? "" : "s"}`;
      } else if (diffDays < 365) {
        const meses = Math.floor(diffDays / 30);
        return `${meses} ${meses === 1 ? "mes" : "meses"}`;
      } else {
        const años = Math.floor(diffDays / 365);
        const mesesRestantes = Math.floor((diffDays % 365) / 30);

        let resultado = `${años} ${años === 1 ? "año" : "años"}`;

        if (mesesRestantes > 0) {
          resultado += ` y ${mesesRestantes} ${
            mesesRestantes === 1 ? "mes" : "meses"
          }`;
        }

        // Agregar indicador si el empleado ya no está activo
        if (fechaFinalizacion) {
          const hoy = new Date();
          const fechaFin = new Date(fechaFinalizacion);

          // Solo mostrar "(finalizado)" si la fecha ya se cumplió
          if (fechaFin <= hoy) {
            resultado += " (finalizado)";
          }
        }

        return resultado;
      }
    } catch (error) {
      return "Error en cálculo";
    }
  }

  // 🔄 VALIDAR CONEXIÓN CON API
  async validarConexion() {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}`, {
        headers: this.getAuthHeaders(),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // 📊 VALIDAR DATOS DE EMPLEADO
  validarEmpleado(empleadoData) {
    const errores = [];

    // Validaciones requeridas
    if (!empleadoData.nombre?.trim()) {
      errores.push("El nombre es obligatorio");
    } else if (empleadoData.nombre.trim().length > 20) {
      errores.push("El nombre no puede exceder 20 caracteres");
    }

    if (!empleadoData.apellido?.trim()) {
      errores.push("El apellido es obligatorio");
    } else if (empleadoData.apellido.trim().length > 20) {
      errores.push("El apellido no puede exceder 20 caracteres");
    }

    if (!empleadoData.puestoId) {
      errores.push("El puesto es obligatorio");
    }

    // Validar identificación
    if (
      empleadoData.identificacion &&
      empleadoData.identificacion.length > 14
    ) {
      errores.push("La identificación no puede exceder 14 caracteres");
    }

    // Validar teléfonos (8 dígitos exactos)
    const validarTelefono = (tel, nombre) => {
      if (tel) {
        const cleanTel = tel.replace(/\D/g, "");
        if (cleanTel.length !== 8) {
          errores.push(`${nombre} debe tener exactamente 8 dígitos`);
        }
      }
    };

    validarTelefono(empleadoData.telefono, "El teléfono");
    validarTelefono(empleadoData.telefono2, "El teléfono 2");
    validarTelefono(empleadoData.numeroEmergencia, "El número de emergencia");

    // Validar fechas
    if (empleadoData.fechaNacimiento) {
      const fechaNac = new Date(empleadoData.fechaNacimiento);
      const hoy = new Date();
      const edad = (hoy - fechaNac) / (1000 * 60 * 60 * 24 * 365);

      if (edad < 18) {
        errores.push("El empleado debe ser mayor de 18 años");
      }
      if (edad > 100) {
        errores.push("La fecha de nacimiento no es válida");
      }
    }

    if (empleadoData.fechaContratacion) {
      const fechaCont = new Date(empleadoData.fechaContratacion);
      const hoy = new Date();

      if (fechaCont > hoy) {
        errores.push("La fecha de contratación no puede ser futura");
      }
    }

    if (empleadoData.fechaFinalizacion && empleadoData.fechaContratacion) {
      const fechaFin = new Date(empleadoData.fechaFinalizacion);
      const fechaCont = new Date(empleadoData.fechaContratacion);

      if (fechaFin <= fechaCont) {
        errores.push(
          "La fecha de finalización debe ser posterior a la de contratación"
        );
      }
    }
    if (empleadoData.status === "inactivo" && !empleadoData.fechaFinalizacion) {
      errores.push("Un empleado inactivo debe tener fecha de finalización");
    }

    if (empleadoData.fechaFinalizacion) {
      const fechaFin = new Date(empleadoData.fechaFinalizacion);
      const hoy = new Date();

      if (fechaFin < hoy && empleadoData.status === "activo") {
        errores.push(
          "Un empleado con fecha de finalización pasada debe estar inactivo"
        );
      }
    }

    return errores;
  }
}

export default new EmpleadosAPI();
