// index.js - Servidor principal con ruta pública de contacto
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const materialesRoutes = require('./routes/materiales');
const clientesRoutes = require('./routes/clientes');
const empleadosRoutes = require('./routes/empleados');
const herramientasRoutes = require('./routes/herramientas'); 
const proyectosRoutes = require('./routes/proyectos');
const dashboardRoutes = require('./routes/dashboard');
const bitacoraRoutes = require('./routes/bitacora');
const contactoRoutes = require('./routes/contacto'); // 🆕 RUTA PÚBLICA

const app = express();
app.use(cors());
app.use(express.json());

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// CRUD de materiales y clientes (requieren auth)
app.use('/api/materiales', materialesRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/empleados', empleadosRoutes);
app.use('/api/herramientas', herramientasRoutes);
app.use('/api/proyectos', proyectosRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/bitacora', bitacoraRoutes);

// 🤫 RUTA PÚBLICA DE CONTACTO (SIN AUTENTICACIÓN)
app.use('/api/contacto', contactoRoutes);

// ruta protegida de prueba
const { verifyToken } = require('./middleware/authMiddleware');
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: `Hola ${req.user.usuario_usuario}, estás autenticado`, user: req.user });
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
    rutas: {
      auth: '/api/auth',
      materiales: '/api/materiales',
      clientes: '/api/clientes',
      contacto: '/api/contacto/registro-contacto' // ← NUEVA RUTA PÚBLICA
    }
  });
});

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  console.error('❌ Error no manejado:', error);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
  console.log('📋 Rutas disponibles:');
  console.log('  🔐 /api/auth         - Autenticación');
  console.log('  📦 /api/materiales   - CRUD de materiales');
  console.log('  👥 /api/clientes     - CRUD de clientes');
  console.log('  🤫 /api/contacto/registro-contacto - PÚBLICO (sin auth)');
});