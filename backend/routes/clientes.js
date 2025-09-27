// routes/clientes.js
const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  obtenerEstadisticas,
  buscarClientes
} = require('../controllers/clientesController');

// 🔒 TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
router.use(verifyToken);

// 📋 RUTAS PARA CONSULTAS (todos los usuarios autenticados)
// GET /api/clientes - Listar todos los clientes
router.get('/', obtenerClientes);

// GET /api/clientes/estadisticas - Obtener estadísticas de clientes
router.get('/estadisticas', obtenerEstadisticas);

// GET /api/clientes/buscar - Búsqueda avanzada de clientes
// Ejemplo: /api/clientes/buscar?q=juan&tipo=nombre
router.get('/buscar', buscarClientes);

// 🔧 RUTAS PARA MODIFICACIONES (requieren permisos especiales)
// Puedes cambiar 'isAdmin' por otro middleware según tu lógica de permisos

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

📋 CONSULTAS:
GET    /api/clientes                → Listar clientes
GET    /api/clientes/estadisticas   → Estadísticas generales
GET    /api/clientes/buscar         → Búsqueda avanzada

📋 CRUD BÁSICO:
POST   /api/clientes                → Crear cliente
PUT    /api/clientes/:id            → Actualizar cliente
DELETE /api/clientes/:id            → Eliminar cliente

EJEMPLO DE USO:
- Crear: POST /api/clientes 
  {
    "nombre": "Juan Carlos", 
    "apellido": "Pérez López",
    "correo": "juan@email.com",
    "telefono": "12345678",
    "nit": "1234567-8"
  }

- Buscar: GET /api/clientes/buscar?q=juan&tipo=nombre
- Buscar todos los campos: GET /api/clientes/buscar?q=juan

🔒 PERMISOS:
- Consultas y búsquedas: Usuario autenticado
- CRUD: Administrador
- Estadísticas: Usuario autenticado (configurable)

📊 RESPUESTAS:
- Éxito: { success: true, data: [...], total: number }
- Error: { success: false, error: "mensaje" }
*/

module.exports = router;