// App2.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authContext';
import Login from './pages/login2';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/dashboard';
import Principal from './pages/principal';
import { ToastContainer, Bounce } from "react-toastify";
import Admin from './pages/admin';
import "react-toastify/dist/ReactToastify.css";

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Routes>
                        {/* Página principal (landing) */}
                        <Route path="/" element={<Principal />} />
                        
                        {/* Login - redirige a admin si ya está autenticado */}
                        <Route path="/login" element={<LoginRoute />} />
                        
                        {/* Panel de administración protegido */}
                        <Route 
                            path="/admin" 
                            element={
                                <ProtectedRoute>
                                    <Admin />
                                </ProtectedRoute>
                            } 
                        />
                        
                        {/* Dashboard legacy - redirigir a admin */}
                        <Route 
                            path="/dashboard" 
                            element={<Navigate to="/admin" replace />}
                        />
                        
                        {/* Ruta 404 - redirigir al inicio */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
                
                {/* 🔥 TOASTCONTAINER AQUÍ - FUERA de las Routes */}
                <ToastContainer
                    position="top-center"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick={true}
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                    transition={Bounce}
                />
            </Router>
        </AuthProvider>
    );
}

// Componente para manejar la ruta de login
function LoginRoute() {
    const { isAuthenticated } = useAuth();
    
    if (isAuthenticated) {
        // Si es admin, ir a admin, si no, ir a dashboard
        //return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;

        //return <Navigate to="/dashboard" replace />;
        return <Navigate to="/admin" replace />;
    }
    
    return <Login />;
}

export default App;