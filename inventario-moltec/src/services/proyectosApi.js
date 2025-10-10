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

  // 🔐 Obtener token de autenticación
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
    console.log('🔍 Obteniendo proyectos...');
    
    try {
      const data = await this.makeRequest(this.baseURL);
      console.log(`✅ ${data.data.length} proyectos obtenidos`);
      
      // ⭐ NOTA: El backend ahora devuelve 'numCotizacion' en cada proyecto
      // Ejemplo de estructura de datos recibida:
      // {
      //   id: 1,
      //   nombre: "Proyecto X",
      //   numCotizacion: 12345,  // ⭐ NUEVO CAMPO
      //   cotizacion: 50000.00,
      //   clienteNombre: "Juan Pérez",
      //   ...
      // }
      
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

      // ⭐ VALIDACIÓN: Si se proporciona numCotizacion, debe ser un número entero positivo
      if (proyectoData.numCotizacion !== undefined && proyectoData.numCotizacion !== null && proyectoData.numCotizacion !== '') {
        const numCot = parseInt(proyectoData.numCotizacion);
        
        if (isNaN(numCot)) {
          throw new Error('El número de cotización debe ser un número entero válido');
        }
        
        if (numCot < 0) {
          throw new Error('El número de cotización debe ser un número positivo');
        }

        // Convertir a entero para asegurar que se envíe correctamente
        proyectoData.numCotizacion = numCot;
      } else {
        // Si está vacío, enviarlo como null
        proyectoData.numCotizacion = null;
      }

      const data = await this.makeRequest(this.baseURL, {
        method: 'POST',
        body: JSON.stringify(proyectoData)
      });
      
      console.log('✅ Proyecto creado exitosamente');
      return data;
    } catch (error) {
      console.error('❌ Error al crear proyecto:', error);
      
      // ⭐ MANEJO ESPECIAL DE ERRORES PARA NÚMERO DE COTIZACIÓN DUPLICADO
      if (error.message && error.message.includes('número de cotización')) {
        // El error viene del backend, mantenerlo tal cual para mostrarlo al usuario
        throw error;
      }
      
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

      // ⭐ VALIDACIÓN: Si se proporciona numCotizacion, debe ser un número entero positivo
      if (proyectoData.numCotizacion !== undefined && proyectoData.numCotizacion !== null && proyectoData.numCotizacion !== '') {
        const numCot = parseInt(proyectoData.numCotizacion);
        
        if (isNaN(numCot)) {
          throw new Error('El número de cotización debe ser un número entero válido');
        }
        
        if (numCot < 0) {
          throw new Error('El número de cotización debe ser un número positivo');
        }

        // Convertir a entero para asegurar que se envíe correctamente
        proyectoData.numCotizacion = numCot;
      } else {
        // Si está vacío, enviarlo como null
        proyectoData.numCotizacion = null;
      }

      const data = await this.makeRequest(`${this.baseURL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(proyectoData)
      });
      
      console.log('✅ Proyecto actualizado exitosamente');
      return data;
    } catch (error) {
      console.error('❌ Error al actualizar proyecto:', error);
      
      // ⭐ MANEJO ESPECIAL DE ERRORES PARA NÚMERO DE COTIZACIÓN DUPLICADO
      if (error.message && error.message.includes('número de cotización')) {
        // El error viene del backend, mantenerlo tal cual para mostrarlo al usuario
        throw error;
      }
      
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
      (proyecto.ubicacion && proyecto.ubicacion.toLowerCase().includes(terminoLower)) ||
      // ⭐ NUEVO: Filtrar también por número de cotización
      (proyecto.numCotizacion && proyecto.numCotizacion.toString().includes(termino))
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

  // ⭐ NUEVO: VALIDAR SI UN NÚMERO DE COTIZACIÓN YA EXISTE
  // (Opcional - El backend ya lo valida, pero podemos usar esto para validación en tiempo real)
  async validarNumCotizacion(numCotizacion, proyectoIdActual = null) {
    try {
      // Esta sería una llamada opcional al backend para validar en tiempo real
      // Por ahora, dejaremos que el backend maneje la validación completamente
      
      console.log('🔍 Validando número de cotización:', numCotizacion);
      
      // Validación básica local
      if (!numCotizacion || numCotizacion === '') {
        return { valido: true, mensaje: '' }; // Vacío es válido (opcional)
      }

      const numCot = parseInt(numCotizacion);
      
      if (isNaN(numCot)) {
        return { valido: false, mensaje: 'El número de cotización debe ser un número entero' };
      }
      
      if (numCot < 0) {
        return { valido: false, mensaje: 'El número de cotización debe ser positivo' };
      }

      // La validación de unicidad la maneja el backend al guardar
      return { valido: true, mensaje: '' };
      
    } catch (error) {
      console.error('❌ Error al validar número de cotización:', error);
      return { valido: false, mensaje: 'Error al validar el número de cotización' };
    }
  }
}

export default new ProyectosAPI();

// 📋 GUÍA DE USO DEL NUEVO CAMPO numCotizacion:
/*
⭐ CAMBIOS REALIZADOS:

1. ✅ El backend ahora devuelve 'numCotizacion' en obtenerProyectos()
2. ✅ Validación en crearProyecto() - verifica que sea un número entero positivo
3. ✅ Validación en actualizarProyecto() - verifica que sea un número entero positivo
4. ✅ Conversión automática a entero antes de enviar al backend
5. ✅ Manejo de valores null/vacíos (el campo es opcional)
6. ✅ Manejo especial de errores de duplicación del backend
7. ✅ Incluido en filtrarProyectos() para búsqueda por número de cotización
8. ✅ Método helper validarNumCotizacion() para validación en tiempo real (opcional)

📝 EJEMPLO DE USO EN EL FRONTEND:

// CREAR PROYECTO CON NÚMERO DE COTIZACIÓN
const nuevoProyecto = {
  nombre: "Edificio Central",
  descripcion: "Construcción de edificio",
  responsableId: 1,
  clienteId: 5,
  ubicacion: "Guatemala",
  numCotizacion: 12345,  // ⭐ NUEVO CAMPO - Debe ser único
  cotizacion: 500000.00,
  aprobado: false,
  status: "planificado"
};

await proyectosApi.crearProyecto(nuevoProyecto);

// ACTUALIZAR PROYECTO
await proyectosApi.actualizarProyecto(proyectoId, {
  ...proyectoData,
  numCotizacion: 54321  // ⭐ Cambiar número de cotización
});

// BUSCAR POR NÚMERO DE COTIZACIÓN
const proyectosFiltrados = proyectosApi.filtrarProyectos(proyectos, "12345");

⚠️ NOTAS IMPORTANTES:

- El campo es OPCIONAL (puede ser null)
- Debe ser un número entero positivo
- ÚNICO en toda la base de datos
- El backend rechazará duplicados con mensaje claro
- Si está vacío en el formulario, se envía como null
*/