// services/proyectosApi.js
// 🔧 CONFIGURACIÓN REUTILIZABLE - Cambia estos valores para otros CRUDs
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL,
  endpoint: 'proyectos', // 👈 Cambiar por 'herramientas', 'empleados', etc.
  timeout: 10000
};

class ProyectosAPI {
  constructor() {
    this.baseURL = `${API_CONFIG.baseURL}/${API_CONFIG.endpoint}`;
  }

  // 🔒 Obtener token de autenticación
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  // 🛠️ Método base para hacer requests
  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
        ...options,
        timeout: API_CONFIG.timeout
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP Error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('❌ API Error:', error);
      throw error;
    }
  }

  // 📋 OBTENER TODOS LOS PROYECTOS
  async obtenerProyectos() {
    console.log('📁 Obteniendo proyectos...');
    
    try {
      const data = await this.makeRequest(this.baseURL);
      console.log(`✅ ${data.data.length} proyectos obtenidos`);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener proyectos:', error);
      throw new Error('No se pudieron cargar los proyectos');
    }
  }

  // ➕ CREAR NUEVO PROYECTO
  async crearProyecto(proyectoData) {
    console.log('➕ Creando proyecto:', proyectoData);
    
    try {
      // Validaciones básicas en frontend
      if (!proyectoData.nombre || !proyectoData.responsableId || !proyectoData.clienteId) {
        throw new Error('Nombre, responsable y cliente son obligatorios');
      }

      const data = await this.makeRequest(this.baseURL, {
        method: 'POST',
        body: JSON.stringify(proyectoData)
      });
      
      console.log('✅ Proyecto creado exitosamente');
      return data;
    } catch (error) {
      console.error('❌ Error al crear proyecto:', error);
      throw error;
    }
  }

  // ✏️ ACTUALIZAR PROYECTO
  async actualizarProyecto(id, proyectoData) {
    console.log('✏️ Actualizando proyecto:', id);
    
    try {
      if (!proyectoData.nombre || !proyectoData.responsableId || !proyectoData.clienteId) {
        throw new Error('Nombre, responsable y cliente son obligatorios');
      }

      const data = await this.makeRequest(`${this.baseURL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(proyectoData)
      });
      
      console.log('✅ Proyecto actualizado exitosamente');
      return data;
    } catch (error) {
      console.error('❌ Error al actualizar proyecto:', error);
      throw error;
    }
  }

  // 🗑️ ELIMINAR PROYECTO (soft delete)
  async eliminarProyecto(id) {
    console.log('🗑️ Eliminando proyecto:', id);
    
    try {
      const data = await this.makeRequest(`${this.baseURL}/${id}`, {
        method: 'DELETE'
      });
      
      console.log('✅ Proyecto eliminado exitosamente');
      return data;
    } catch (error) {
      console.error('❌ Error al eliminar proyecto:', error);
      throw error;
    }
  }

  // 📊 OBTENER ESTADÍSTICAS
  async obtenerEstadisticas() {
    console.log('📊 Obteniendo estadísticas de proyectos...');
    
    try {
      const data = await this.makeRequest(`${this.baseURL}/estadisticas`);
      console.log('✅ Estadísticas obtenidas');
      return data;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      throw new Error('No se pudieron cargar las estadísticas');
    }
  }

  // 🔍 BUSCAR PROYECTOS (método helper para filtrado local)
  filtrarProyectos(proyectos, termino) {
    if (!termino) return proyectos;
    
    const terminoLower = termino.toLowerCase();
    return proyectos.filter(proyecto => 
      proyecto.nombre.toLowerCase().includes(terminoLower) ||
      (proyecto.descripcion && proyecto.descripcion.toLowerCase().includes(terminoLower)) ||
      (proyecto.clienteNombre && proyecto.clienteNombre.toLowerCase().includes(terminoLower)) ||
      (proyecto.responsableNombre && proyecto.responsableNombre.toLowerCase().includes(terminoLower)) ||
      (proyecto.ubicacion && proyecto.ubicacion.toLowerCase().includes(terminoLower))
    );
  }

  // 🔄 VALIDAR CONEXIÓN CON API
  async validarConexion() {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}`, {
        headers: this.getAuthHeaders()
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default new ProyectosAPI();