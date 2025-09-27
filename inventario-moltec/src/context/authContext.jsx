// context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // FUNCIÓN para inicializar la autenticación al cargar la app
  useEffect(() => {
    const initAuth = async () => {
      console.log("🔄 Inicializando autenticación...");
      
      try {
        // Primero verificar si hay datos en localStorage
        const storedUser = authService.getCurrentUser();
        const token = authService.getToken();

        console.log("📋 Datos almacenados:", { 
          hasToken: !!token, 
          hasUser: !!storedUser,
          storedUser 
        });

        if (storedUser && token) {
          // Cargar usuario temporalmente desde localStorage (para UX inmediata)
          setUser(storedUser);
          console.log("✅ Usuario cargado desde localStorage");

          // Luego verificar con el backend de forma asíncrona
          console.log("🔍 Verificando token con el servidor...");
          const result = await authService.verifyToken();

          if (result.success) {
            console.log("✅ Token válido, usuario actualizado:", result.user);
            setUser(result.user);
          } else {
            console.log("❌ Token inválido, limpiando sesión");
            setUser(null);
            authService.logout();
          }
        } else {
          console.log("ℹ️ No hay sesión previa");
          setUser(null);
        }
      } catch (error) {
        console.error("❌ Error inicializando auth:", error);
        setUser(null);
        authService.logout();
      } finally {
        setLoading(false);
        console.log("🏁 Inicialización de auth completada");
      }
    };

    initAuth();
  }, []);

  // FUNCIÓN de login mejorada
  const login = async (usuario, password) => {
    console.log("🔐 Intentando login para:", usuario);
    
    try {
      setLoading(true);
      const result = await authService.login(usuario, password);
      
      if (result.success) {
        console.log("✅ Login exitoso:", result.data.user);
        setUser(result.data.user);
      } else {
        console.log("❌ Login fallido:", result.error);
      }
      
      return result;
    } catch (error) {
      console.error("❌ Error en login:", error);
      return { success: false, error: "Error inesperado" };
    } finally {
      setLoading(false);
    }
  };

  // FUNCIÓN de logout mejorada
  const logout = () => {
    console.log("🚪 Cerrando sesión");
    authService.logout();
    setUser(null);
  };

  // FUNCIÓN helper para verificar si es admin
  const isAdmin = () => {
    if (!user) return false;
    
    // Verificar por múltiples campos para mayor compatibilidad
    const isAdminById = user.fk_role_id === 1 || user.roleId === 1;
    const isAdminByName = 
      user.role_nombre === "Administrador" || 
      user.role === "Administrador";
    
    return isAdminById || isAdminByName;
  };

  // VALORES del contexto
  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: isAdmin(),
    
    // FUNCIONES ADICIONALES útiles
    getUserName: () => user?.usuario_nombre_completo || user?.nombre || user?.usuario_usuario || "Usuario",
    getUserRole: () => user?.role_nombre || user?.role || "Sin rol",
    refresh: async () => {
      // Función para refrescar manualmente la sesión
      if (authService.getToken()) {
        const result = await authService.verifyToken();
        if (result.success) {
          setUser(result.user);
          return true;
        }
      }
      return false;
    }
  };

  // LOG para debugging (quitar en producción)
  useEffect(() => {
    console.log("🔄 AuthContext state updated:", {
      hasUser: !!user,
      isAuthenticated: !!user,
      isAdmin: isAdmin(),
      loading,
      userDetails: user
    });
  }, [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};