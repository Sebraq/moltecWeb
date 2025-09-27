// routes/bitacoraRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { obtenerBitacora, obtenerEstadisticasBitacora } = require('../controllers/bitacoraController');

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// 📋 Obtener registros de bitácora
// GET /api/bitacora?fechaInicio=2024-01-01&fechaFin=2024-12-31&usuarioId=1&tipoEvento=CLIENTE_CREADO&limite=50
router.get('/', obtenerBitacora);

// 📊 Obtener estadísticas de bitácora (solo administradores)
router.get('/estadisticas', isAdmin, obtenerEstadisticasBitacora);

module.exports = router;

// ==================================================
// TAMBIÉN NECESITAS AGREGAR EN TU ARCHIVO PRINCIPAL DE RUTAS (routes/index.js o app.js):

/*
// Agregar esta línea donde tienes las otras rutas
const bitacoraRoutes = require('./routes/bitacoraRoutes');

// Registrar la ruta
app.use('/api/bitacora', bitacoraRoutes);
*/