// routes/materiales.js
const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const {
  obtenerMateriales,
  crearMaterial,
  actualizarMaterial,
  ingresoStock,
  salidaStock,
  eliminarMaterial,
  obtenerEstadisticas,
  obtenerMovimientosMateriales,
} = require("../controllers/materialesController");

// 🔒 TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// Para aplicar autenticación a todas las rutas de este módulo
router.use(verifyToken);

// 📋 RUTAS PARA CONSULTAS (todos los usuarios autenticados)
// GET /api/materiales - Listar todos los materiales
router.get("/", obtenerMateriales);

router.get("/movimientos", obtenerMovimientosMateriales);

// GET /api/materiales/estadisticas - Obtener estadísticas
router.get("/estadisticas", obtenerEstadisticas);

// 🔧 RUTAS PARA MODIFICACIONES (requieren permisos especiales)
// Puedes cambiar 'isAdmin' por otro middleware según tu lógica de permisos

// POST /api/materiales - Crear nuevo material
router.post("/", isAdmin, crearMaterial);

// PUT /api/materiales/:id - Actualizar datos generales del material
router.put("/:id", isAdmin, actualizarMaterial);

// PATCH /api/materiales/:id/ingreso - Registrar ingreso de stock
router.patch("/:id/ingreso", ingresoStock); // Todos pueden hacer ingresos

// PATCH /api/materiales/:id/salida - Registrar salida de stock
router.patch("/:id/salida", salidaStock); // Todos pueden hacer salidas

// DELETE /api/materiales/:id - Eliminar material (solo admin)
router.delete("/:id", isAdmin, eliminarMaterial);

// 🔍 MIDDLEWARE DE VALIDACIÓN DE PARÁMETROS (opcional pero recomendado)
// Validar que el ID sea un número válido
router.param("id", (req, res, next, id) => {
  const materialId = parseInt(id);

  if (isNaN(materialId) || materialId <= 0) {
    return res.status(400).json({
      success: false,
      error: "ID de material inválido",
    });
  }

  // Agregar el ID parseado al request para uso posterior
  req.materialId = materialId;
  next();
});

// 📝 DOCUMENTACIÓN DE RUTAS (comentarios para referencia)
/*
RUTAS DISPONIBLES:

🔍 CONSULTAS:
GET    /api/materiales              → Listar materiales
GET    /api/materiales/estadisticas → Estadísticas generales

📝 CRUD BÁSICO:
POST   /api/materiales              → Crear material
PUT    /api/materiales/:id          → Actualizar material
DELETE /api/materiales/:id          → Eliminar material

📦 GESTIÓN DE STOCK:
PATCH  /api/materiales/:id/ingreso  → Ingreso de stock
PATCH  /api/materiales/:id/salida   → Salida de stock

EJEMPLO DE USO:
- Crear: POST /api/materiales { "nombre": "Cemento", "medida": "Sacos" }
- Ingreso: PATCH /api/materiales/1/ingreso { "cantidad": 50, "motivo": "Compra" }
- Salida: PATCH /api/materiales/1/salida { "cantidad": 10, "motivo": "Proyecto X" }

🔒 PERMISOS:
- Consultas: Usuario autenticado
- CRUD: Administrador
- Stock: Usuario autenticado (configurable)
*/

module.exports = router;
