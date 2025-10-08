// services/dashboardApi.js - Servicio API para Dashboard MOLTEC S.A.

// 🔧 CONFIGURACIÓN DE LA API
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL,
  endpoint: 'dashboard'
};

class DashboardAPI {
  
  // 🔐 OBTENER HEADERS DE AUTENTICACIÓN
  // Obtiene el token JWT del localStorage para autenticar las peticiones
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // 🌐 MÉTODO GENÉRICO PARA HACER REQUESTS
  // Maneja todas las peticiones HTTP con manejo de errores centralizado
  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
        ...options
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('🚨 Error en API Dashboard:', error.message);
      throw error;
    }
  }

  // 📊 OBTENER TODOS LOS DATOS DEL DASHBOARD
  // Hace una petición GET al endpoint /dashboard para obtener todas las estadísticas
  async obtenerDatosDashboard() {
    console.log('📊 Obteniendo datos del dashboard...');
    
    try {
      const data = await this.makeRequest(`${API_CONFIG.baseURL}/${API_CONFIG.endpoint}`);
      
      console.log('✅ Datos del dashboard obtenidos exitosamente');
      return data;
    } catch (error) {
      console.error('❌ Error al obtener datos del dashboard:', error);
      throw new Error('No se pudieron cargar los datos del dashboard');
    }
  }

  // 🔄 VALIDAR CONEXIÓN CON API
  // Verifica si el servidor está respondiendo correctamente
  async validarConexion() {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/${API_CONFIG.endpoint}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // 🎨 OBTENER COLOR SEGÚN EL ESTADO DE STOCK
  // Mapea los estados de stock a sus colores correspondientes:
  // - 'Stock Normal' → Verde (stock suficiente)
  // - 'Stock Bajo' → Naranja (advertencia de stock bajo)
  // - 'Stock Crítico' → Rojo (stock crítico, requiere atención)
  getColorPorEstadoStock(estado) {
    // Normalizar el estado: convertir a minúsculas y eliminar espacios extras
    const estadoNormalizado = estado?.toString().toLowerCase().trim();
    
    const coloresStock = {
      'stock normal': '#48bb78',      // Verde
      'normal': '#48bb78',            // Verde
      'stock bajo': '#ed8936',        // Naranja
      'bajo': '#ed8936',              // Naranja
      'stock crítico': '#e53e3e',     // Rojo
      'stock critico': '#e53e3e',     // Rojo (sin acento)
      'crítico': '#e53e3e',           // Rojo
      'critico': '#e53e3e'            // Rojo (sin acento)
    };
    
    const color = coloresStock[estadoNormalizado];
    
    // Debug: mostrar en consola si no encuentra el color
    if (!color) {
      console.warn(`⚠️ Color no encontrado para estado de stock: "${estado}" (normalizado: "${estadoNormalizado}")`);
    }
    
    return color || '#718096'; // Gris por defecto
  }

  // 🎨 OBTENER COLOR SEGÚN EL ESTADO DE HERRAMIENTA
  // Mapea los estados de herramientas a sus colores correspondientes:
  // - 'Nuevo' → Verde (herramienta nueva)
  // - 'En buen estado' → Azul (herramienta en buenas condiciones)
  // - 'Desgastado' → Naranja (herramienta con desgaste)
  // - 'En reparación' → Amarillo (herramienta en reparación)
  // - 'Baja' → Rojo (herramienta dada de baja)
  getColorPorEstadoHerramienta(estado) {
    // Normalizar el estado: convertir a minúsculas y eliminar espacios extras
    const estadoNormalizado = estado?.toString().toLowerCase().trim();
    
    const coloresHerramienta = {
      'nuevo': '#48bb78',               // Verde
      'en buen estado': '#4299e1',      // Azul
      'buen estado': '#4299e1',         // Azul
      'buenestado': '#4299e1',          // Azul (sin espacio)
      'desgastado': '#ed8936',          // Naranja
      'en reparación': '#ecc94b',       // Amarillo
      'reparación': '#ecc94b',          // Amarillo
      'en reparacion': '#ecc94b',       // Amarillo (sin acento)
      'reparacion': '#ecc94b',          // Amarillo (sin acento)
      'baja': '#e53e3e'                 // Rojo
    };
    
    const color = coloresHerramienta[estadoNormalizado];
    
    // Debug: mostrar en consola si no encuentra el color
    if (!color) {
      console.warn(`⚠️ Color no encontrado para estado de herramienta: "${estado}" (normalizado: "${estadoNormalizado}")`);
    }
    
    return color || '#718096'; // Gris por defecto
  }

  // 🎯 FORMATEAR DATOS PARA GRÁFICAS PIE
  // Transforma los datos del backend al formato requerido por Chart.js
  // y asigna automáticamente los colores correctos según el tipo de gráfica
  formatearDatosPie(datos, tipoGrafica = null) {
    // Validar que existan datos
    if (!datos || !datos.labels || !datos.data) {
      console.warn('⚠️ No hay datos para la gráfica PIE:', tipoGrafica);
      return {
        labels: ['Sin datos'],
        datasets: [{
          data: [1],
          backgroundColor: ['#e2e8f0'],
          borderWidth: 0
        }]
      };
    }

    // Debug: mostrar datos recibidos
    console.log(`📊 Formateando gráfica PIE tipo: "${tipoGrafica}"`);
    console.log('Labels recibidos:', datos.labels);
    console.log('Data recibida:', datos.data);

    let colores = [];

    // Asignar colores según el tipo de gráfica y las etiquetas
    if (tipoGrafica === 'estadoHerramientas') {
      // Asignar colores según estado de herramienta
      console.log('🔧 Aplicando colores para estado de herramientas...');
      colores = datos.labels.map(label => {
        const color = this.getColorPorEstadoHerramienta(label);
        console.log(`  - "${label}" → ${color}`);
        return color;
      });
    } 
    else if (tipoGrafica === 'stockHerramientas' || tipoGrafica === 'stockMateriales') {
      // Asignar colores según estado de stock
      console.log('📦 Aplicando colores para stock...');
      colores = datos.labels.map(label => {
        const color = this.getColorPorEstadoStock(label);
        console.log(`  - "${label}" → ${color}`);
        return color;
      });
    } 
    else {
      // Colores por defecto si no se especifica tipo
      console.warn('⚠️ Tipo de gráfica no reconocido, usando colores por defecto');
      colores = datos.backgroundColor || [
        '#48bb78', '#ed8936', '#e53e3e', '#38b2ac', '#9f7aea'
      ];
    }

    console.log('Colores finales:', colores);

    return {
      labels: datos.labels,
      datasets: [{
        data: datos.data,
        backgroundColor: colores,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }

  // 📊 FORMATEAR DATOS PARA GRÁFICAS DE BARRAS
  // Transforma los datos del backend al formato requerido por Chart.js para barras
  formatearDatosBarras(datos) {
    if (!datos || !datos.labels || !datos.data) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Sin datos',
          data: [0],
          backgroundColor: '#e2e8f0',
          borderColor: '#a0aec0',
          borderWidth: 1
        }]
      };
    }

    return {
      labels: datos.labels,
      datasets: [{
        label: 'Cantidad',
        data: datos.data,
        backgroundColor: datos.backgroundColor || '#667eea',
        borderColor: '#4c51bf',
        borderWidth: 1,
        borderRadius: 4
      }]
    };
  }

  // 📈 OPCIONES PARA GRÁFICAS PIE
  // Configuración de visualización para gráficas circulares
  getOpcionesPie() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            // Muestra el valor y porcentaje en el tooltip
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const porcentaje = ((context.parsed * 100) / total).toFixed(1);
              return `${context.label}: ${context.parsed} (${porcentaje}%)`;
            }
          }
        }
      }
    };
  }

  // 📊 OPCIONES PARA GRÁFICAS DE BARRAS
  // Configuración de visualización para gráficas de barras
  getOpcionesBarras(titulo = 'Datos') {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: titulo,
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        },
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 0
          }
        }
      }
    };
  }

  // 🎨 COLORES PARA GRÁFICAS (Paleta de colores MOLTEC)
  // Define la paleta de colores corporativa para uso en gráficas
  getColoresMoltec() {
    return {
      primary: '#667eea',
      success: '#48bb78',
      warning: '#ed8936',
      danger: '#e53e3e',
      info: '#38b2ac',
      purple: '#9f7aea',
      blue: '#4299e1',
      pink: '#f56565',
      indigo: '#805ad5',
      green: '#68d391',
      yellow: '#ecc94b'
    };
  }
}

// 📋 GUÍA DE USO:
/*
🔧 IMPORTAR EN COMPONENTE:
import dashboardAPI from '../services/dashboardApi';

🔧 USAR EN COMPONENTE:
const datos = await dashboardAPI.obtenerDatosDashboard();

🔧 FORMATEAR PARA GRÁFICAS PIE CON COLORES CORRECTOS:
// Estado de Herramientas (nuevo, buen estado, desgastado, reparacion, baja)
const datosPieEstadoHerramientas = dashboardAPI.formatearDatosPie(
  datos.data.graficasPie.estadoHerramientas, 
  'estadoHerramientas'
);

// Stock de Herramientas (normal, bajo, critico)
const datosPieStockHerramientas = dashboardAPI.formatearDatosPie(
  datos.data.graficasPie.stockHerramientas, 
  'stockHerramientas'
);

// Stock de Materiales (normal, bajo, critico)
const datosPieStockMateriales = dashboardAPI.formatearDatosPie(
  datos.data.graficasPie.stockMateriales, 
  'stockMateriales'
);

🔧 FORMATEAR PARA GRÁFICAS DE BARRAS:
const datosBarras = dashboardAPI.formatearDatosBarras(
  datos.data.graficasBarras.topMaterialesHerramientas
);

🔧 OPCIONES DE GRÁFICAS:
const opcionesPie = dashboardAPI.getOpcionesPie();
const opcionesBarras = dashboardAPI.getOpcionesBarras('Top 10 Materiales/Herramientas');

🔧 VALIDAR CONEXIÓN:
const isConnected = await dashboardAPI.validarConexion();
*/

// Exportar una instancia única de la clase (Patrón Singleton)
export default new DashboardAPI();