// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const isLoggedIn = authService.isLoggedIn();
    const isAdmin = authService.isAdmin();

    // Si no está logueado, redirigir al login
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // Si requiere admin y no lo es, mostrar mensaje
    if (requireAdmin && !isAdmin) {
        return (
            <div className="access-denied">
                <h2>Acceso Denegado</h2>
                <p>No tienes permisos para acceder a esta sección.</p>
                <p>Se requieren permisos de administrador.</p>
            </div>
        );
    }

    // Si todo está bien, mostrar el componente
    return children;
};

export default ProtectedRoute;