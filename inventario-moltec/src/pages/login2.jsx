// components/Login.jsx
import React, { useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import "../components/login.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [formData, setFormData] = useState({
    usuario: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Usar el contexto de autenticación
  const { login, getUserName } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // VALIDACIÓN mejorada
    if (!formData.usuario?.trim() || !formData.password?.trim()) {
      const errorMsg = "Por favor completa todos los campos";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    if (formData.usuario.length < 3) {
      const errorMsg = "El usuario debe tener al menos 3 caracteres";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    if (formData.password.length < 4) {
      const errorMsg = "La contraseña debe tener al menos 4 caracteres";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    try {
      console.log("🔍 Intentando login con:", formData.usuario);

      // Usar el login del contexto
      const result = await login(formData.usuario.trim(), formData.password);

      if (result.success) {
        // OBTENER el nombre del usuario para el toast
        const userName =
          result.data.user.usuario_nombre_completo ||
          result.data.user.nombre ||
          result.data.user.usuario_usuario ||
          "Usuario";

        const userRole =
          result.data.user.role_nombre || result.data.user.role || "Usuario";

        // TOAST DE ÉXITO con información del usuario
        toast.success(
          `¡Bienvenido ${userName}! ${
            userRole === "Administrador" ? "👑" : "👤"
          }`
        );

        console.log("✅ Login exitoso para:", userName);

        // NAVEGAR al dashboard después de un breve delay
        // setTimeout(() => {
        //   navigate("/dashboard");
        // }, 1500);

         setTimeout(() => {
          navigate("/admin");
        }, 1500);
      } else {
        const errorMsg = result.error || "Error al iniciar sesión";
        setError(errorMsg);
        toast.error(errorMsg);
        console.log("❌ Login fallido:", errorMsg);
      }
    } catch (error) {
      console.error("❌ Error inesperado en login:", error);
      const errorMsg = "Error inesperado. Por favor intenta nuevamente.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* ENCABEZADO EMPRESARIAL */}
        <div className="login-header">
          <div className="company-logo">
            <img 
              src="/LogoMoltecV4.png" 
              alt="Moltec S.A. Logo" 
              className="logo-image"
            />
          </div>
          <h1 className="login-title">Iniciar Sesión</h1>
          <p className="login-subtitle">MOLTEC S.A.</p>
          <p className="system-subtitle">Sistema de Gestión de Inventario</p>
        </div>

        {/* MOSTRAR ERROR si existe */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠</span>
            <span className="error-text">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {/* CAMPO USUARIO */}
          <div className="form-group">
            <label htmlFor="usuario" className="form-label">
              Usuario
            </label>
            <div className="input-container">
              <span className="input-icon">👤</span>
              <input
                type="text"
                id="usuario"
                name="usuario"
                value={formData.usuario}
                onChange={handleChange}
                placeholder="Ingresa tu usuario"
                disabled={loading}
                className={`login-input ${error ? "error" : ""}`}
                autoComplete="username"
                required
                minLength={3}
              />
            </div>
          </div>

          {/* CAMPO CONTRASEÑA */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <div className="input-container">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ingresa tu contraseña"
                disabled={loading}
                className={`login-input ${error ? "error" : ""}`}
                autoComplete="current-password"
                required
                minLength={4}
              />
            </div>
          </div>

          {/* BOTÓN DE LOGIN */}
          <button
            type="submit"
            className={`login-button ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>

        {/* PIE DE PÁGINA */}
        <div className="login-footer">
          <div className="divider"></div>
          <p className="help-text">
            ¿Problemas para acceder? Contacta al administrador del sistema.
          </p>
          <div className="redirect-info">
            <p className="redirect-text">
              Después del login serás redirigido al panel de administración
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;