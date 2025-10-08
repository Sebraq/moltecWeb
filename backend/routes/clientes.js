// routes/clientes.js - VERSIÓN CORREGIDA
const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// ✅ IMPORTAR TODAS LAS FUNCIONES (incluido registroSilencioso)
const {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  obtenerEstadisticas,
  buscarClientes,
  registroSilencioso  // ← AGREGAR ESTA LÍNEA
} = require('../controllers/clientesController');

// 🔓 RUTA PÚBLICA - Registro silencioso (SIN autenticación)
// Esta ruta DEBE ir ANTES de router.use(verifyToken)
router.post('/registro-silencioso', registroSilencioso);

// 🔒 TODAS LAS DEMÁS RUTAS REQUIEREN AUTENTICACIÓN
router.use(verifyToken);

// 📋 RUTAS PARA CONSULTAS (todos los usuarios autenticados)
// GET /api/clientes - Listar todos los clientes
router.get('/', obtenerClientes);

// GET /api/clientes/estadisticas - Obtener estadísticas de clientes
router.get('/estadisticas', obtenerEstadisticas);

// GET /api/clientes/buscar - Búsqueda avanzada de clientes
// Ejemplo: /api/clientes/buscar?q=juan&tipo=nombre
router.get('/buscar', buscarClientes);

// 🔧 RUTAS PARA MODIFICACIONES (requieren permisos de admin)
// POST /api/clientes - Crear nuevo cliente
router.post('/', isAdmin, crearCliente);

// PUT /api/clientes/:id - Actualizar cliente
router.put('/:id', isAdmin, actualizarCliente);

// DELETE /api/clientes/:id - Eliminar cliente (solo admin)
router.delete('/:id', isAdmin, eliminarCliente);

// 🔍 MIDDLEWARE DE VALIDACIÓN DE PARÁMETROS
// Validar que el ID sea un número válido
router.param('id', (req, res, next, id) => {
  const clienteId = parseInt(id);
  
  if (isNaN(clienteId) || clienteId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'ID de cliente inválido'
    });
  }
  
  // Agregar el ID parseado al request para uso posterior
  req.clienteId = clienteId;
  next();
});

// 📋 DOCUMENTACIÓN DE RUTAS (comentarios para referencia)
/*
RUTAS DISPONIBLES:

🔓 PÚBLICAS (sin autenticación):
POST   /api/clientes/registro-silencioso  → Registro desde formulario web

📋 CONSULTAS (requieren autenticación):
GET    /api/clientes                      → Listar clientes
GET    /api/clientes/estadisticas         → Estadísticas generales
GET    /api/clientes/buscar               → Búsqueda avanzada

📋 CRUD (requieren autenticación + admin):
POST   /api/clientes                      → Crear cliente
PUT    /api/clientes/:id                  → Actualizar cliente
DELETE /api/clientes/:id                  → Eliminar cliente

EJEMPLO DE USO:
- Crear: POST /api/clientes 
  {
    "nombre": "Juan Carlos", 
    "apellido": "Pérez López",
    "correo": "juan@email.com",
    "telefono": "12345678",
    "nit": "1234567-8"
  }

- Registro silencioso: POST /api/clientes/registro-silencioso
  {
    "nombre": "María",
    "apellido": "González",
    "email": "maria@email.com",
    "telefono": "87654321"
  }

- Buscar: GET /api/clientes/buscar?q=juan&tipo=nombre
- Buscar todos los campos: GET /api/clientes/buscar?q=juan

🔒 PERMISOS:
- Consultas y búsquedas: Usuario autenticado
- CRUD: Administrador
- Registro silencioso: Público (sin autenticación)

📊 RESPUESTAS:
- Éxito: { success: true, data: [...], total: number }
- Error: { success: false, error: "mensaje" }
*/

module.exports = router;