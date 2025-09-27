// services/authService.js
const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

class AuthService {
  // FUNCIÓN HELPER para normalizar datos del usuario
  normalizeUserData(userData) {
    // Aseguramos que siempre tengamos la estructura correcta
    return {
      pk_usuario_id: userData.pk_usuario_id || userData.id,
      usuario_usuario: userData.usuario_usuario || userData.usuario,
      usuario_nombre_completo: userData.usuario_nombre_completo || userData.nombre,
      fk_role_id: userData.fk_role_id || userData.roleId,
      role_nombre: userData.role_nombre || userData.role,
      
      // Campos alias para compatibilidad
      id: userData.pk_usuario_id || userData.id,
      usuario: userData.usuario_usuario || userData.usuario,
      nombre: userData.usuario_nombre_completo || userData.nombre,
      roleId: userData.fk_role_id || userData.roleId,
      role: userData.role_nombre || userData.role
    };
  }

  // Login de usuario - MEJORADO
  async login(usuario, password) {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_usuario: usuario,
          usuario_password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Normalizar los datos del usuario usando nuestra función helper
        const normalizedUser = this.normalizeUserData(data.user);
        
        // Validar que tengamos los datos esenciales
        if (!normalizedUser.pk_usuario_id || !normalizedUser.usuario_usuario) {
          console.error("Datos de usuario inválidos recibidos:", data.user);
          return { success: false, error: "Datos de usuario inválidos" };
        }

        // Guardar en localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(normalizedUser));

        console.log("Login exitoso, usuario guardado:", normalizedUser);

        return {
          success: true,
          data: {
            token: data.token,
            user: normalizedUser,
          },
        };
      } else {
        return {
          success: false,
          error: data.error || data.message || "Error al iniciar sesión",
        };
      }
    } catch (error) {
      console.error("Error en login:", error);
      return { success: false, error: "Error de conexión" };
    }
  }

  // Verificar token - COMPLETAMENTE REDISEÑADO
  async verifyToken() {
    const token = this.getToken();

    if (!token) {
      console.log("No hay token disponible");
      return { success: false, error: "No hay token" };
    }

    try {
      const response = await fetch(`${API_URL}/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        // Normalizar los datos del usuario
        const normalizedUser = this.normalizeUserData(data.user);
        
        // Actualizar localStorage con datos frescos del servidor
        localStorage.setItem("user", JSON.stringify(normalizedUser));
        
        console.log("Token verificado exitosamente, usuario:", normalizedUser);
        
        return { success: true, user: normalizedUser };
      } else {
        console.log("Token inválido, limpiando sesión");
        this.logout();
        return { success: false, error: "Token inválido" };
      }
    } catch (error) {
      console.error("Error verificando token:", error);
      // En caso de error de red, usar datos de localStorage si existen
      const storedUser = this.getCurrentUser();
      if (storedUser) {
        console.log("Error de red, usando datos almacenados");
        return { success: true, user: storedUser };
      }
      return { success: false, error: "Error de conexión" };
    }
  }

  // Cerrar sesión
  logout() {
    console.log("Cerrando sesión");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  // Obtener token
  getToken() {
    return localStorage.getItem("token");
  }

  // Obtener usuario actual - MEJORADO con validación
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;
      
      const user = JSON.parse(userStr);
      
      // Validar que el usuario tenga los campos esenciales
      if (!user.pk_usuario_id || !user.usuario_usuario) {
        console.warn("Usuario en localStorage incompleto, limpiando");
        this.logout();
        return null;
      }
      
      return user;
    } catch (error) {
      console.error("Error parsing user data:", error);
      this.logout();
      return null;
    }
  }

  // Verificar si está logueado
  isLoggedIn() {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  // Verificar si es administrador - MEJORADO
  isAdmin() {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Verificar por ID de rol (1 = Administrador) o por nombre
    const isAdminById = user.fk_role_id === 1 || user.roleId === 1;
    const isAdminByName = user.role_nombre === "Administrador" || user.role === "Administrador";
    
    return isAdminById || isAdminByName;
  }
}

export default new AuthService();