// routes/herramientas.js
const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const {
  obtenerHerramientas,
  crearHerramienta,
  actualizarHerramienta,
  ingresoStock,
  salidaStock,
  eliminarHerramienta,
  obtenerEstadisticas,
  obtenerHistorialMovimientos,
  obtenerMovimientosHerramientas
} = require('../controllers/herramientasController');

// 🔒 TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
router.use(verifyToken);

// 📋 RUTAS PARA CONSULTAS (todos los usuarios autenticados)
// GET /api/herramientas - Listar todas las herramientas
router.get('/', obtenerHerramientas);

// GET /api/herramientas/estadisticas - Obtener estadísticas
router.get('/estadisticas', obtenerEstadisticas);

// 🔧 RUTAS PARA MODIFICACIONES (requieren permisos especiales)
// POST /api/herramientas - Crear nueva herramienta
router.post('/', isAdmin, crearHerramienta);

router.get('/movimientos',obtenerMovimientosHerramientas);

// PUT /api/herramientas/:id - Actualizar datos generales de la herramienta
router.put('/:id', isAdmin, actualizarHerramienta);

// PATCH /api/herramientas/:id/ingreso - Registrar ingreso de stock
router.patch('/:id/ingreso', ingresoStock); // Todos pueden hacer ingresos

// PATCH /api/herramientas/:id/salida - Registrar salida de stock  
router.patch('/:id/salida', salidaStock); // Todos pueden hacer salidas

// DELETE /api/herramientas/:id - Eliminar herramienta (solo admin)
router.delete('/:id', isAdmin, eliminarHerramienta);

// GET /api/herramientas/:id/historial - Obtener historial de movimientos
router.get('/:id/historial', obtenerHistorialMovimientos);



// 🔍 MIDDLEWARE DE VALIDACIÓN DE PARÁMETROS
// Validar que el ID sea un número válido
router.param('id', (req, res, next, id) => {
  const herramientaId = parseInt(id);
  
  if (isNaN(herramientaId) || herramientaId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'ID de herramienta inválido'
    });
  }
  
  // Agregar el ID parseado al request para uso posterior
  req.herramientaId = herramientaId;
  next();
});

// 📋 DOCUMENTACIÓN DE RUTAS (comentarios para referencia)
/*
RUTAS DISPONIBLES:

🔍 CONSULTAS:
GET    /api/herramientas              → Listar herramientas
GET    /api/herramientas/estadisticas → Estadísticas generales

🔧 CRUD BÁSICO:
POST   /api/herramientas              → Crear herramienta
PUT    /api/herramientas/:id          → Actualizar herramienta
DELETE /api/herramientas/:id          → Eliminar herramienta

🔧 GESTIÓN DE STOCK:
PATCH  /api/herramientas/:id/ingreso  → Ingreso de stock
PATCH  /api/herramientas/:id/salida   → Salida de stock

EJEMPLO DE USO:
- Crear: POST /api/herramientas 
  { 
    "nombre": "Martillo", 
    "marca": "Stanley", 
    "modelo": "ST-16",
    "descripcion": "Martillo de acero",
    "medida": "16 oz",
    "cantidadActual": 5,
    "cantidadMinima": 2,
    "estado": "Nuevo"
  }

- Ingreso: PATCH /api/herramientas/1/ingreso 
  { "cantidad": 10, "motivo": "Compra nueva" }

- Salida: PATCH /api/herramientas/1/salida 
  { "cantidad": 2, "motivo": "Proyecto ABC" }

🔒 PERMISOS:
- Consultas: Usuario autenticado
- CRUD: Administrador
- Stock: Usuario autenticado (configurable)

📊 RESPUESTAS:
- Éxito: { success: true, data: [...], total: number }
- Error: { success: false, error: "mensaje" }

📏 LÍMITES DE CARACTERES:
- Nombre: 30 caracteres
- Marca: 15 caracteres  
- Modelo: 15 caracteres
- Descripción: 40 caracteres
- Medida: 20 caracteres

🏷️ ESTADOS VÁLIDOS:
- 'Nuevo'
- 'En buen estado'
- 'Desgastado'
- 'En reparación'
- 'Baja'
*/

module.exports = router;