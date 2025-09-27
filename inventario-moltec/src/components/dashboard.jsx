import React, { useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import "./dashboard.css"

const Dashboard = () => {
    const { 
        user, 
        logout, 
        loading, 
        isAdmin,
        getUserName,
        getUserRole 
    } = useAuth();
    const navigate = useNavigate();

    // MANEJO DE ESTADOS DE CARGA
    if (loading) {
        return (
            <div className="dashboard">
                <div className="loading-container">
                    <h2>🔄 Cargando usuario...</h2>
                    <p>Por favor espera un momento...</p>
                </div>
            </div>
        );
    }

    // MANEJO DE SESIÓN INVÁLIDA
    if (!user) {
        return (
            <div className="dashboard">
                <div className="error-container">
                    <h2>❌ No hay sesión activa</h2>
                    <p>Por favor inicia sesión para continuar.</p>
                    <button 
                        onClick={() => navigate('/login')}
                        className="login-redirect-btn"
                    >
                        Ir al Login
                    </button>
                </div>
            </div>
        );
    }

    // LOGS para debugging (quitar en producción)
    // useEffect(() => {
    //     console.log('📊 Dashboard - Estado actual:', {
    //         user,
    //         isAdmin,
    //         token: !!localStorage.getItem('token'),
    //         userLocalStorage: localStorage.getItem('user')
    //     });
    // }, [user, isAdmin]);

    // FUNCIÓN de logout mejorada
    const handleLogout = () => {
        const userName = getUserName();
        console.log(`👋 ${userName} está cerrando sesión`);
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard">
            {/* HEADER DEL DASHBOARD */}
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>🏢 Dashboard - Moltec S.A.</h1>
                    <div className="user-actions">
                        <span className="welcome-text">
                            Hola, <strong>{getUserName()}</strong>
                        </span>
                        <button onClick={handleLogout} className="logout-btn">
                            🚪 Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
            
            {/* SECCIÓN DE BIENVENIDA */}
            <div className="welcome-section">
                <div className="welcome-card">
                    <h2>¡Bienvenido de vuelta! 👋</h2>
                    <div className="user-details">
                        <p className="user-info">
                            <span className="label">👤 Usuario:</span> 
                            <span className="value">{user.usuario_usuario}</span>
                        </p>
                        <p className="user-info">
                            <span className="label">📝 Nombre completo:</span> 
                            <span className="value">{getUserName()}</span>
                        </p>
                        <p className="user-info">
                            <span className="label">🎭 Rol:</span> 
                            <span className={`role-badge ${isAdmin ? 'admin' : 'user'}`}>
                                {getUserRole()}
                                {isAdmin && ' 👑'}
                            </span>
                        </p>
                        <p className="user-info">
                            <span className="label">🆔 ID de usuario:</span> 
                            <span className="value">{user.pk_usuario_id}</span>
                        </p>
                    </div>
                </div>
            </div>
            
            {/* CONTENIDO PRINCIPAL */}
            <div className="dashboard-content">
                <h3>📊 Panel de Control</h3>
                
                {/* SECCIÓN PARA TODOS LOS USUARIOS */}
                <div className="section-card user-section">
                    <h4>🔧 Opciones Generales</h4>
                    <div className="options-grid">
                        <div className="option-item">
                            <span className="option-icon">📋</span>
                            <span>Ver proyectos</span>
                        </div>
                        <div className="option-item">
                            <span className="option-icon">📦</span>
                            <span>Consultar inventario</span>
                        </div>
                        <div className="option-item">
                            <span className="option-icon">📅</span>
                            <span>Ver calendario</span>
                        </div>
                        <div className="option-item">
                            <span className="option-icon">📞</span>
                            <span>Contactos</span>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN SOLO PARA ADMINISTRADORES */}
                {isAdmin && (
                    <div className="section-card admin-section">
                        <h4>👑 Opciones de Administrador</h4>
                        <div className="admin-badge">
                            ⚡ Tienes permisos de administrador
                        </div>
                        <div className="options-grid">
                            <div className="option-item admin-option">
                                <span className="option-icon">👥</span>
                                <span>Gestionar usuarios</span>
                            </div>
                            <div className="option-item admin-option">
                                <span className="option-icon">👷</span>
                                <span>Gestionar empleados</span>
                            </div>
                            <div className="option-item admin-option">
                                <span className="option-icon">📝</span>
                                <span>Ver bitácora del sistema</span>
                            </div>
                            <div className="option-item admin-option">
                                <span className="option-icon">⚙️</span>
                                <span>Configuración general</span>
                            </div>
                            <div className="option-item admin-option">
                                <span className="option-icon">📊</span>
                                <span>Reportes y estadísticas</span>
                            </div>
                            <div className="option-item admin-option">
                                <span className="option-icon">🔒</span>
                                <span>Gestión de permisos</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* SECCIÓN DE ESTADO DEL SISTEMA */}
                <div className="section-card system-status">
                    <h4>🔍 Estado del Sistema</h4>
                    <div className="status-grid">
                        <div className="status-item">
                            <span className="status-label">🔐 Sesión:</span>
                            <span className="status-value active">Activa</span>
                        </div>
                        <div className="status-item">
                            <span className="status-label">🎫 Token:</span>
                            <span className="status-value active">Válido</span>
                        </div>
                        <div className="status-item">
                            <span className="status-label">📱 Dispositivo:</span>
                            <span className="status-value">Web Browser</span>
                        </div>
                        <div className="status-item">
                            <span className="status-label">🕒 Última actividad:</span>
                            <span className="status-value">Ahora</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* DEBUG INFO (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="debug-section">
                    <h4>🐛 Debug Info (Solo en desarrollo)</h4>
                    <details>
                        <summary>Ver datos del usuario</summary>
                        <pre className="debug-data">
                            {JSON.stringify(user, null, 2)}
                        </pre>
                    </details>
                </div>
            )}
        </div>
    );
};

export default Dashboard;