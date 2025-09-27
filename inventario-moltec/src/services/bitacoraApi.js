// services/bitacoraApi.js - SIMPLIFICADO PARA TU ESQUEMA SQL
// 📋 SERVICIO PARA API DE BITÁCORA - Sistema de Inventario MOLTEC S.A.
console.log('API URL:', import.meta.env.VITE_API_URL);
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL,
  endpoint: "bitacora",
  timeout: 10000,
};

class BitacoraAPI {
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
      console.log("🔍 Haciendo request a:", url);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        API_CONFIG.timeout
      );

      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(
        "📡 Respuesta recibida:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Datos recibidos:", data);
      return data;
    } catch (error) {
      console.error("❌ Bitácora API Error:", error.message);

      if (error.name === "AbortError") {
        throw new Error("La solicitud tardó demasiado en responder");
      }

      throw error;
    }
  }

  // 📋 OBTENER REGISTROS DE BITÁCORA CON FILTROS
  async obtenerBitacora(filtros = {}) {
    console.log("📋 Obteniendo registros de bitácora...", filtros);

    try {
      // Construir query parameters
      const params = new URLSearchParams();

      if (filtros.fechaInicio)
        params.append("fechaInicio", filtros.fechaInicio);
      if (filtros.fechaFin) params.append("fechaFin", filtros.fechaFin);
      if (filtros.usuarioId) params.append("usuarioId", filtros.usuarioId);
      if (filtros.tipoEvento) params.append("tipoEvento", filtros.tipoEvento);
      if (filtros.limite) params.append("limite", filtros.limite);

      const url = params.toString()
        ? `${this.baseURL}?${params}`
        : this.baseURL;
      const data = await this.makeRequest(url);

      console.log(
        `✅ ${data.data?.length || 0} registros de bitácora obtenidos`
      );
      return data;
    } catch (error) {
      console.error("❌ Error al obtener bitácora:", error);
      throw new Error(
        `No se pudieron cargar los registros de bitácora: ${error.message}`
      );
    }
  }

  // 📊 OBTENER ESTADÍSTICAS DE BITÁCORA
  async obtenerEstadisticas() {
    console.log("📊 Obteniendo estadísticas de bitácora...");

    try {
      const data = await this.makeRequest(`${this.baseURL}/estadisticas`);
      console.log("✅ Estadísticas de bitácora obtenidas");
      return data;
    } catch (error) {
      console.error("❌ Error al obtener estadísticas de bitácora:", error);
      throw new Error(
        `No se pudieron cargar las estadísticas de bitácora: ${error.message}`
      );
    }
  }

  // 📅 OBTENER REGISTROS POR FECHA (helper)
  async obtenerPorFecha(fechaInicio, fechaFin, limite = 100) {
    return this.obtenerBitacora({
      fechaInicio,
      fechaFin,
      limite,
    });
  }

  // 👤 OBTENER REGISTROS POR USUARIO (helper)
  async obtenerPorUsuario(usuarioId, limite = 100) {
    return this.obtenerBitacora({
      usuarioId,
      limite,
    });
  }

  // 🎯 OBTENER REGISTROS POR TIPO DE EVENTO (helper)
  async obtenerPorTipoEvento(tipoEvento, limite = 100) {
    return this.obtenerBitacora({
      tipoEvento,
      limite,
    });
  }

  // 📝 OBTENER REGISTROS RECIENTES (últimos 30 días)
  async obtenerRecientes(limite = 50) {
    const fechaFin = new Date().toISOString().split("T")[0];
    const fechaInicio = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // ← Cambiar de 7 a 30
      .toISOString()
      .split("T")[0];

    return this.obtenerBitacora({
      fechaInicio,
      fechaFin,
      limite,
    });
  }
  // 📈 FILTRAR REGISTROS LOCALMENTE (helper para el frontend)
  filtrarRegistros(registros, filtros = {}) {
    let resultado = [...registros];

    // Filtrar por búsqueda de texto
    if (filtros.busqueda) {
      const termino = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(
        (registro) =>
          registro.bitacora_descripcion?.toLowerCase().includes(termino) ||
          registro.usuario_nombre?.toLowerCase().includes(termino)
      );
    }

    // Filtrar por tipo de evento
    if (filtros.tipoEvento && filtros.tipoEvento !== "todos") {
      resultado = resultado.filter((registro) => {
        const descripcion = registro.bitacora_descripcion || "";
        return descripcion.includes(filtros.tipoEvento);
      });
    }

    // Filtrar por usuario
    if (filtros.usuario && filtros.usuario !== "todos") {
      resultado = resultado.filter(
        (registro) => registro.usuario_nombre === filtros.usuario
      );
    }

    return resultado;
  }

  // 🎨 OBTENER COLOR PARA TIPO DE EVENTO (helper para UI)
  getColorTipoEvento(descripcion) {
    if (!descripcion) return { color: "#718096", bg: "#e2e8f0" };

    const colores = {
      CREADO: { color: "#38a169", bg: "#c6f6d5" },
      ACTUALIZADO: { color: "#3182ce", bg: "#bee3f8" },
      ELIMINADO: { color: "#e53e3e", bg: "#fed7d7" },
      INGRESO: { color: "#38a169", bg: "#c6f6d5" },
      SALIDA: { color: "#dd6b20", bg: "#feebc8" },
      LOGIN: { color: "#805ad5", bg: "#e9d8fd" },
      LOGOUT: { color: "#718096", bg: "#e2e8f0" },
    };

    // Buscar coincidencias en la descripción
    for (const [tipo, color] of Object.entries(colores)) {
      if (descripcion.toUpperCase().includes(tipo)) {
        return color;
      }
    }

    return { color: "#718096", bg: "#e2e8f0" };
  }

  // 📄 EXPORTAR BITÁCORA A CSV - SIMPLIFICADO
  exportarBitacoraCSV(registros) {
    const headers = ["ID", "Fecha", "Usuario", "Descripción"];

    const rows = registros.map((registro) => [
      registro.pk_bitacora_id || "",
      registro.bitacora_fecha || "",
      registro.usuario_nombre || "",
      registro.bitacora_descripcion || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    return csvContent;
  }

  // 💾 DESCARGAR BITÁCORA COMO CSV
  async descargarBitacoraCSV(registros) {
    try {
      const csvContent = this.exportarBitacoraCSV(registros);
      const fechaActual = new Date().toISOString().split("T")[0];
      const nombreArchivo = `bitacora_${fechaActual}.csv`;

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("✅ Bitácora exportada a CSV exitosamente");
      return true;
    } catch (error) {
      console.error("❌ Error al exportar bitácora:", error);
      throw error;
    }
  }

  // 🔄 VALIDAR CONEXIÓN CON API
  async validarConexion() {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/test`, {
        headers: this.getAuthHeaders(),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // 🔍 OBTENER TIPOS DE EVENTOS ÚNICOS (helper para filtros)
  obtenerTiposEventosUnicos(registros) {
    const tipos = new Set();

    registros.forEach((registro) => {
      const descripcion = registro.bitacora_descripcion || "";

      if (descripcion.includes("CREADO")) tipos.add("CREADO");
      else if (descripcion.includes("ACTUALIZADO")) tipos.add("ACTUALIZADO");
      else if (descripcion.includes("ELIMINADO")) tipos.add("ELIMINADO");
      else if (descripcion.includes("INGRESO")) tipos.add("INGRESO");
      else if (descripcion.includes("SALIDA")) tipos.add("SALIDA");
      else if (descripcion.includes("LOGIN")) tipos.add("LOGIN");
      else if (descripcion.includes("LOGOUT")) tipos.add("LOGOUT");
    });

    return Array.from(tipos).sort();
  }

  // 👤 OBTENER USUARIOS ÚNICOS (helper para filtros)
  obtenerUsuariosUnicos(registros) {
    const usuarios = [...new Set(registros.map((r) => r.usuario_nombre))]
      .filter((usuario) => usuario && usuario.trim() !== "")
      .sort();

    return usuarios;
  }

  // 📈 CALCULAR ESTADÍSTICAS LOCALES
  calcularEstadisticasLocales(registros) {
    const hoy = new Date();
    const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
    const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);

    const registrosUltimos7Dias = registros.filter(
      (r) => new Date(r.bitacora_fecha) >= hace7Dias
    );

    const registrosUltimos30Dias = registros.filter(
      (r) => new Date(r.bitacora_fecha) >= hace30Dias
    );

    return {
      totalRegistros: registros.length,
      ultimos7Dias: registrosUltimos7Dias.length,
      ultimos30Dias: registrosUltimos30Dias.length,
      usuariosActivos: this.obtenerUsuariosUnicos(registrosUltimos7Dias).length,
      tiposEventos: this.obtenerTiposEventosUnicos(registros).length,
      promedioEventosPorDia: registrosUltimos7Dias.length / 7,
    };
  }
}

export default new BitacoraAPI();
