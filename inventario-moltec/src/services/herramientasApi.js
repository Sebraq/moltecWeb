// services/herramientasApi.js
// 🔧 CONFIGURACIÓN REUTILIZABLE - Específica para herramientas
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL,
  endpoint: "herramientas",
  timeout: 10000,
};

class HerramientasAPI {
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

  // 📋 OBTENER TODAS LAS HERRAMIENTAS
  async obtenerHerramientas() {
    console.log("🔧 Obteniendo herramientas...");

    try {
      const data = await this.makeRequest(this.baseURL);
      console.log(`✅ ${data.data.length} herramientas obtenidas`);
      return data;
    } catch (error) {
      console.error("❌ Error al obtener herramientas:", error);
      throw new Error("No se pudieron cargar las herramientas");
    }
  }

  // ➕ CREAR NUEVA HERRAMIENTA
  async crearHerramienta(herramientaData) {
    console.log("➕ Creando herramienta:", herramientaData);

    try {
      // Validaciones básicas en frontend
      const errores = this.validarHerramienta(herramientaData);
      if (errores.length > 0) {
        throw new Error(errores[0]);
      }

      const data = await this.makeRequest(this.baseURL, {
        method: "POST",
        body: JSON.stringify(herramientaData),
      });

      console.log("✅ Herramienta creada exitosamente");
      return data;
    } catch (error) {
      console.error("❌ Error al crear herramienta:", error);
      throw error;
    }
  }

  // ✏️ ACTUALIZAR HERRAMIENTA
  async actualizarHerramienta(id, herramientaData) {
    console.log(`✏️ Actualizando herramienta ID: ${id}`, herramientaData);

    try {
      const errores = this.validarHerramienta(herramientaData);
      if (errores.length > 0) {
        throw new Error(errores[0]);
      }

      const data = await this.makeRequest(`${this.baseURL}/${id}`, {
        method: "PUT",
        body: JSON.stringify(herramientaData),
      });

      console.log("✅ Herramienta actualizada exitosamente");
      return data;
    } catch (error) {
      console.error("❌ Error al actualizar herramienta:", error);
      throw error;
    }
  }

  // 🔥 INGRESO DE STOCK
  async ingresoStock(id, cantidad, motivo) {
    console.log(`🔥 Ingreso de stock - ID: ${id}, Cantidad: ${cantidad}`);

    try {
      if (!cantidad || cantidad <= 0) {
        throw new Error("La cantidad debe ser mayor a 0");
      }

      const data = await this.makeRequest(`${this.baseURL}/${id}/ingreso`, {
        method: "PATCH",
        body: JSON.stringify({ cantidad, motivo }),
      });

      console.log("✅ Ingreso de stock registrado");
      return data;
    } catch (error) {
      console.error("❌ Error en ingreso de stock:", error);
      throw error;
    }
  }

  // 📤 SALIDA DE STOCK
  async salidaStock(id, cantidad, motivo) {
    console.log(`📤 Salida de stock - ID: ${id}, Cantidad: ${cantidad}`);

    try {
      if (!cantidad || cantidad <= 0) {
        throw new Error("La cantidad debe ser mayor a 0");
      }

      const data = await this.makeRequest(`${this.baseURL}/${id}/salida`, {
        method: "PATCH",
        body: JSON.stringify({ cantidad, motivo }),
      });

      console.log("✅ Salida de stock registrada");
      return data;
    } catch (error) {
      console.error("❌ Error en salida de stock:", error);
      throw error;
    }
  }

  // 🗑️ ELIMINAR HERRAMIENTA
  async eliminarHerramienta(id) {
    console.log(`🗑️ Eliminando herramienta ID: ${id}`);

    try {
      const data = await this.makeRequest(`${this.baseURL}/${id}`, {
        method: "DELETE",
      });

      console.log("✅ Herramienta eliminada exitosamente");
      return data;
    } catch (error) {
      console.error("❌ Error al eliminar herramienta:", error);
      throw error;
    }
  }

  // 📊 OBTENER ESTADÍSTICAS
  async obtenerEstadisticas() {
    console.log("📊 Obteniendo estadísticas de herramientas...");

    try {
      const data = await this.makeRequest(`${this.baseURL}/estadisticas`);
      console.log("✅ Estadísticas obtenidas");
      return data;
    } catch (error) {
      console.error("❌ Error al obtener estadísticas:", error);
      throw new Error("No se pudieron cargar las estadísticas");
    }
  }

  // 🔍 VALIDAR HERRAMIENTA (método helper para validaciones)
  validarHerramienta(herramienta) {
    const errores = [];

    // Validar nombre (obligatorio)
    if (!herramienta.nombre || herramienta.nombre.trim() === "") {
      errores.push("El nombre es obligatorio");
    }

    // Validar límites de caracteres
    if (herramienta.nombre && herramienta.nombre.length > 30) {
      errores.push("El nombre no puede exceder 30 caracteres");
    }

    if (herramienta.marca && herramienta.marca.length > 15) {
      errores.push("La marca no puede exceder 15 caracteres");
    }

    if (herramienta.modelo && herramienta.modelo.length > 15) {
      errores.push("El modelo no puede exceder 15 caracteres");
    }

    if (herramienta.descripcion && herramienta.descripcion.length > 40) {
      errores.push("La descripción no puede exceder 40 caracteres");
    }

    if (herramienta.medida && herramienta.medida.length > 20) {
      errores.push("La medida no puede exceder 20 caracteres");
    }

    // Validar cantidades
    if (
      herramienta.cantidadActual !== undefined &&
      herramienta.cantidadActual < 0
    ) {
      errores.push("La cantidad actual no puede ser negativa");
    }

    if (
      herramienta.cantidadMinima !== undefined &&
      herramienta.cantidadMinima < 0
    ) {
      errores.push("La cantidad mínima no puede ser negativa");
    }

    // Validar estado
    const estadosValidos = [
      "Nuevo",
      "En buen estado",
      "Desgastado",
      "En reparación",
      "Baja",
    ];
    if (herramienta.estado && !estadosValidos.includes(herramienta.estado)) {
      errores.push("Estado inválido");
    }

    return errores;
  }

  // 🔍 BUSCAR HERRAMIENTAS (método helper para filtrado local)
  buscarHerramientas(herramientas, termino) {
    if (!termino) return herramientas;

    const terminoLower = termino.toLowerCase();
    return herramientas.filter(
      (herramienta) =>
        herramienta.nombre.toLowerCase().includes(terminoLower) ||
        (herramienta.marca &&
          herramienta.marca.toLowerCase().includes(terminoLower)) ||
        (herramienta.modelo &&
          herramienta.modelo.toLowerCase().includes(terminoLower)) ||
        (herramienta.descripcion &&
          herramienta.descripcion.toLowerCase().includes(terminoLower)) ||
        (herramienta.medida &&
          herramienta.medida.toLowerCase().includes(terminoLower)) ||
        herramienta.estado.toLowerCase().includes(terminoLower)
    );
  }

  // 🔍 FILTRAR HERRAMIENTAS (método mejorado con múltiples filtros)
  filtrarHerramientas(herramientas, filtros = {}) {
    let resultado = [...herramientas];

    // Filtrar por término de búsqueda
    if (filtros.busqueda) {
      resultado = this.buscarHerramientas(resultado, filtros.busqueda);
    }

    // Filtrar por estado
    if (filtros.estado && filtros.estado !== "todos") {
      resultado = resultado.filter((h) => h.estado === filtros.estado);
    }

    // Filtrar por estado de stock
    if (filtros.stockEstado && filtros.stockEstado !== "todos") {
      resultado = resultado.filter((h) => {
        const estadoStock = this.getEstadoStock(
          h.cantidadActual,
          h.cantidadMinima
        );
        switch (filtros.stockEstado) {
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

    // Filtrar por marca
    if (filtros.marca && filtros.marca !== "todas") {
      resultado = resultado.filter((h) => h.marca === filtros.marca);
    }

    return resultado;
  }

  // 🎯 DETERMINAR ESTADO DEL STOCK (método helper)
  getEstadoStock(cantidadActual, cantidadMinima) {
    if (cantidadActual <= cantidadMinima) {
      return {
        texto: "Stock Crítico",
        color: "#e53e3e",
        bg: "#fed7d7",
      };
    } else if (cantidadActual <= cantidadMinima * 2) {
      return {
        texto: "Stock Bajo",
        color: "#dd6b20",
        bg: "#feebc8",
      };
    } else {
      return {
        texto: "Stock Normal",
        color: "#38a169",
        bg: "#c6f6d5",
      };
    }
  }

  // 🎯 DETERMINAR COLOR DEL ESTADO
  getEstadoColor(estado) {
    const colores = {
      Nuevo: { color: "#38a169", bg: "#c6f6d5" },
      "En buen estado": { color: "#3182ce", bg: "#bee3f8" },
      Desgastado: { color: "#dd6b20", bg: "#feebc8" },
      "En reparación": { color: "#d69e2e", bg: "#faf089" },
      Baja: { color: "#e53e3e", bg: "#fed7d7" },
    };

    return colores[estado] || { color: "#718096", bg: "#e2e8f0" };
  }

  // 📊 OBTENER MARCAS ÚNICAS (helper para filtros)
  obtenerMarcasUnicas(herramientas) {
    const marcas = herramientas
      .map((h) => h.marca)
      .filter((marca) => marca && marca.trim() !== "")
      .filter((marca, index, array) => array.indexOf(marca) === index)
      .sort();

    return marcas;
  }

  // 📊 OBTENER ESTADOS ÚNICOS (helper para filtros)
  obtenerEstadosUnicos(herramientas) {
    const estados = herramientas
      .map((h) => h.estado)
      .filter((estado, index, array) => array.indexOf(estado) === index)
      .sort();

    return estados;
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

  // 📋 OBTENER LISTA DE ESTADOS VÁLIDOS
  getEstadosValidos() {
    return [
      { valor: "Nuevo", texto: "✨ Nuevo" },
      { valor: "En buen estado", texto: "👍 En buen estado" },
      { valor: "Desgastado", texto: "⚠️ Desgastado" },
      { valor: "En reparación", texto: "🔨 En reparación" },
      { valor: "Baja", texto: "❌ Baja" },
    ];
  }

  // 🔢 CALCULAR RESUMEN DE ESTADÍSTICAS (helper local)
  calcularEstadisticasLocales(herramientas) {
    const stats = {
      totalHerramientas: herramientas.length,
      stockCritico: 0,
      stockBajo: 0,
      stockNormal: 0,
      herramientasNuevas: 0,
      herramientasBuenEstado: 0,
      herramientasDesgastadas: 0,
      herramientasEnReparacion: 0,
      herramientasBaja: 0,
      valorTotalInventario: 0,
    };

    herramientas.forEach((herramienta) => {
      // Estadísticas de stock
      const estadoStock = this.getEstadoStock(
        herramienta.cantidadActual,
        herramienta.cantidadMinima
      );
      switch (estadoStock.texto) {
        case "Stock Crítico":
          stats.stockCritico++;
          break;
        case "Stock Bajo":
          stats.stockBajo++;
          break;
        case "Stock Normal":
          stats.stockNormal++;
          break;
      }

      // Estadísticas por estado
      switch (herramienta.estado) {
        case "Nuevo":
          stats.herramientasNuevas++;
          break;
        case "En buen estado":
          stats.herramientasBuenEstado++;
          break;
        case "Desgastado":
          stats.herramientasDesgastadas++;
          break;
        case "En reparación":
          stats.herramientasEnReparacion++;
          break;
        case "Baja":
          stats.herramientasBaja++;
          break;
      }
    });

    return stats;
  }

  // 🗂️ EXPORTAR DATOS (helper para generar CSV o JSON)
  exportarDatos(herramientas, formato = "csv") {
    if (formato === "csv") {
      const headers = [
        "ID",
        "Nombre",
        "Marca",
        "Modelo",
        "Descripción",
        "Medida",
        "Cantidad Actual",
        "Cantidad Mínima",
        "Estado",
        "Fecha Ingreso",
        "Fecha Actualización",
      ];

      const rows = herramientas.map((h) => [
        h.id,
        h.nombre,
        h.marca || "",
        h.modelo || "",
        h.descripcion || "",
        h.medida || "",
        h.cantidadActual,
        h.cantidadMinima,
        h.estado,
        h.fechaIngreso,
        h.fechaActualizacion,
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      return csvContent;
    } else if (formato === "json") {
      return JSON.stringify(herramientas, null, 2);
    }

    throw new Error('Formato no soportado. Use "csv" o "json"');
  }

  // 📥 DESCARGAR ARCHIVO
  descargarArchivo(contenido, nombreArchivo, tipoMime) {
    const blob = new Blob([contenido], { type: tipoMime });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // 📊 EXPORTAR HERRAMIENTAS A CSV
  async exportarHerramientasCSV(herramientas) {
    try {
      const csvContent = this.exportarDatos(herramientas, "csv");
      const fechaActual = new Date().toISOString().split("T")[0];
      const nombreArchivo = `herramientas_${fechaActual}.csv`;

      this.descargarArchivo(
        csvContent,
        nombreArchivo,
        "text/csv;charset=utf-8;"
      );

      console.log("✅ Archivo CSV descargado exitosamente");
      return true;
    } catch (error) {
      console.error("❌ Error al exportar CSV:", error);
      throw error;
    }
  }
  // 📊 OBTENER HISTORIAL DE MOVIMIENTOS
  async obtenerHistorialMovimientos(id) {
    console.log(
      `📊 Obteniendo historial de movimientos para herramienta ID: ${id}`
    );

    try {
      const data = await this.makeRequest(`${this.baseURL}/${id}/historial`);
      console.log(`✅ ${data.data.length} movimientos obtenidos`);
      return data;
    } catch (error) {
      console.error("❌ Error al obtener historial:", error);
      throw new Error("No se pudo cargar el historial de movimientos");
    }
  }
  // 📊 EXPORTAR HERRAMIENTAS A JSON
  async exportarHerramientasJSON(herramientas) {
    try {
      const jsonContent = this.exportarDatos(herramientas, "json");
      const fechaActual = new Date().toISOString().split("T")[0];
      const nombreArchivo = `herramientas_${fechaActual}.json`;

      this.descargarArchivo(
        jsonContent,
        nombreArchivo,
        "application/json;charset=utf-8;"
      );

      console.log("✅ Archivo JSON descargado exitosamente");
      return true;
    } catch (error) {
      console.error("❌ Error al exportar JSON:", error);
      throw error;
    }
  }

  // 📊 OBTENER MOVIMIENTOS DE HERRAMIENTAS
  async obtenerMovimientosHerramientas() {
    console.log("📊 Obteniendo movimientos de herramientas...");

    try {
      const data = await this.makeRequest(`${this.baseURL}/movimientos`);
      console.log(
        `✅ ${data.data.length} movimientos de herramientas obtenidos`
      );
      return data;
    } catch (error) {
      console.error("❌ Error al obtener movimientos de herramientas:", error);
      throw new Error("No se pudieron cargar los movimientos de herramientas");
    }
  }
}

// 📝 GUÍA DE ADAPTACIÓN PARA OTROS CRUDs:
/*
🔧 PARA ADAPTAR A OTRA TABLA (ej: equipos):

1. Cambiar API_CONFIG:
   endpoint: 'equipos'

2. Cambiar nombres de clase y métodos:
   HerramientasAPI → EquiposAPI
   crearHerramienta → crearEquipo
   etc.

3. Adaptar validaciones según los campos de la nueva tabla

4. Los métodos base (makeRequest, getAuthHeaders, etc.) son reutilizables

EJEMPLO PARA EQUIPOS:
- API_CONFIG.endpoint = 'equipos'
- Cambiar mensajes de console.log
- Adaptar validaciones específicas de equipos
- Todo lo demás queda igual

MÉTODOS DISPONIBLES:
✅ CRUD básico: obtener, crear, actualizar, eliminar
✅ Gestión de stock: ingreso, salida
✅ Validaciones: frontend y backend
✅ Búsqueda y filtrado: múltiples criterios
✅ Estadísticas: locales y del servidor
✅ Exportación: CSV y JSON
✅ Utilidades: colores, estados, conexión
*/

export default new HerramientasAPI();
