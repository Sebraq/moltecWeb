// routes/dashboardRoutes.js - Rutas para Dashboard MOLTEC S.A.
const express = require('express');
const router = express.Router();
const { obtenerDatosDashboard } = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/authMiddleware');

// 🔒 TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
router.use(verifyToken);

// 📊 RUTA PRINCIPAL DEL DASHBOARD
// GET /api/dashboard - Obtener todos los datos del dashboard
router.get('/', verifyToken, obtenerDatosDashboard);

module.exports = router;