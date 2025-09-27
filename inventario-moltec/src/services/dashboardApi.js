// services/dashboardApi.js - Servicio API para Dashboard MOLTEC S.A.

// 🔧 CONFIGURACIÓN DE LA API
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL,
  endpoint: 'dashboard'
};

class DashboardAPI {
  
  // 🔐 OBTENER HEADERS DE AUTENTICACIÓN
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // 🌐 MÉTODO GENÉRICO PARA HACER REQUESTS
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

  // 🎯 FORMATEAR DATOS PARA GRÁFICAS (métodos helper)
  formatearDatosPie(datos) {
    if (!datos || !datos.labels || !datos.data) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          data: [1],
          backgroundColor: ['#e2e8f0'],
          borderWidth: 0
        }]
      };
    }

    return {
      labels: datos.labels,
      datasets: [{
        data: datos.data,
        backgroundColor: datos.backgroundColor || [
          '#48bb78', '#ed8936', '#e53e3e', '#38b2ac', '#9f7aea'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }

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

  // 📈 OPCIONES PARA GRÁFICAS
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

  // 🎨 COLORES PARA GRÁFICAS
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
      green: '#68d391'
    };
  }
}

// 📋 GUÍA DE USO:
/*
🔧 IMPORTAR EN COMPONENTE:
import dashboardAPI from '../services/dashboardApi';

🔧 USAR EN COMPONENTE:
const datos = await dashboardAPI.obtenerDatosDashboard();

🔧 FORMATEAR PARA GRÁFICAS:
const datosPie = dashboardAPI.formatearDatosPie(datos.data.graficasPie.estadoHerramientas);
const datosBarras = dashboardAPI.formatearDatosBarras(datos.data.graficasBarras.topMaterialesHerramientas);

🔧 OPCIONES DE GRÁFICAS:
const opcionesPie = dashboardAPI.getOpcionesPie();
const opcionesBarras = dashboardAPI.getOpcionesBarras('Top 10 Materiales/Herramientas');

🔧 VALIDAR CONEXIÓN:
const isConnected = await dashboardAPI.validarConexion();
*/

export default new DashboardAPI();