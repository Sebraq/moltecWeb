// services/contactoApi.js - API para formulario de contacto CORREGIDA
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000
};

class ContactoAPI {
  // 🛠️ Método base para hacer requests (sin autenticación)
  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
        timeout: API_CONFIG.timeout
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP Error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('❌ Contacto API Error:', error);
      throw error;
    }
  }

  // 🤫 REGISTRO SILENCIOSO DE CLIENTE DESDE FORMULARIO DE CONTACTO
  async registrarClienteDesdeContacto(datosFormulario) {
    try {
      console.log('🤫 Registro silencioso de cliente desde contacto');
      
      // Mapear datos del formulario de contacto a formato de cliente
      const datosCliente = {
        nombre: datosFormulario.nombre,
        apellido: datosFormulario.apellido,
        email: datosFormulario.email,
        telefono: datosFormulario.telefono
      };

      // ✅ CORREGIDO: Usar el endpoint correcto de contacto
      const response = await this.makeRequest(
        `${API_CONFIG.baseURL}/contacto/registro-contacto`,
        {
          method: 'POST',
          body: JSON.stringify(datosCliente)
        }
      );

      // Log interno para seguimiento
      if (response.existed) {
        console.log('ℹ️ Cliente ya existía en la base de datos');
      } else {
        console.log('✅ Cliente registrado exitosamente en la base de datos');
      }

      return response;

    } catch (error) {
      // En caso de error, no afectar la experiencia del usuario
      console.error('❌ Error en registro silencioso:', error);
      
      // Lanzar el error para que se maneje en el componente
      throw error;
    }
  }

  // 📧 MÉTODO PRINCIPAL: REGISTRAR CLIENTE Y CONTINUAR CON EMAILJS
  async procesarFormularioContacto(datosFormulario) {
    try {
      console.log('📧 Procesando formulario de contacto...');
      
      // Primer paso: registrar cliente silenciosamente
      await this.registrarClienteDesdeContacto(datosFormulario);
      
      // Segundo paso: el componente continúa con EmailJS
      return { success: true };

    } catch (error) {
      console.error('❌ Error procesando formulario:', error);
      // No lanzar error para no interrumpir el envío de email
      return { success: true, warning: 'Cliente no se pudo registrar pero email continuará' };
    }
  }

  // 🔄 VALIDAR CONEXIÓN CON API
  async validarConexion() {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/contacto/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // 📋 FORMATEAR DATOS DEL FORMULARIO
  formatearDatosContacto(formData) {
    return {
      nombre: formData.nombre?.trim() || '',
      apellido: formData.apellido?.trim() || '',
      email: formData.email?.trim() || '',
      telefono: formData.telefono?.replace(/[-\s]/g, '') || '', // Limpiar formato
      mensaje: formData.mensaje?.trim() || ''
    };
  }

  // 🔍 VALIDAR DATOS ANTES DE ENVIAR
  validarDatosContacto(formData) {
    const errores = [];

    if (!formData.nombre?.trim()) {
      errores.push('El nombre es requerido');
    }

    if (!formData.apellido?.trim()) {
      errores.push('El apellido es requerido');
    }

    if (!formData.email?.trim()) {
      errores.push('El email es requerido');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errores.push('El formato del email no es válido');
    }

    if (formData.telefono && !/^\d{8}$/.test(formData.telefono.replace(/[-\s]/g, ''))) {
      errores.push('El teléfono debe tener 8 dígitos');
    }

    if (!formData.mensaje?.trim()) {
      errores.push('El mensaje es requerido');
    }

    return errores;
  }
}

export default new ContactoAPI();