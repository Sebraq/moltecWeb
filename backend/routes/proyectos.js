// routes/proyectos.js
const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const {
  obtenerProyectos,
  crearProyecto,
  actualizarProyecto,
  eliminarProyecto,
  obtenerEstadisticas
} = require('../controllers/proyectosController');

// 🔒 TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// Para aplicar autenticación a todas las rutas de este módulo
router.use(verifyToken);

// 📋 RUTAS PARA CONSULTAS (todos los usuarios autenticados)
// GET /api/proyectos - Listar todos los proyectos activos
router.get('/', obtenerProyectos);

// GET /api/proyectos/estadisticas - Obtener estadísticas
router.get('/estadisticas', obtenerEstadisticas);

// 🔧 RUTAS PARA MODIFICACIONES (requieren permisos especiales)
// Puedes cambiar 'isAdmin' por otro middleware según tu lógica de permisos

// POST /api/proyectos - Crear nuevo proyecto
router.post('/', isAdmin, crearProyecto);

// PUT /api/proyectos/:id - Actualizar datos del proyecto
router.put('/:id', isAdmin, actualizarProyecto);

// DELETE /api/proyectos/:id - Eliminar proyecto (solo admin)
router.delete('/:id', isAdmin, eliminarProyecto);

// 🔍 MIDDLEWARE DE VALIDACIÓN DE PARÁMETROS (opcional pero recomendado)
// Validar que el ID sea un número válido
router.param('id', (req, res, next, id) => {
  const proyectoId = parseInt(id);
  
  if (isNaN(proyectoId) || proyectoId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'ID de proyecto inválido'
    });
  }
  
  // Agregar el ID parseado al request para uso posterior
  req.proyectoId = proyectoId;
  next();
});

// 📖 DOCUMENTACIÓN DE RUTAS (comentarios para referencia)
/*
RUTAS DISPONIBLES:

📋 CONSULTAS:
GET    /api/proyectos              → Listar proyectos activos
GET    /api/proyectos/estadisticas → Estadísticas generales

📋 CRUD BÁSICO:
POST   /api/proyectos              → Crear nuevo proyecto
PUT    /api/proyectos/:id          → Actualizar proyecto existente
DELETE /api/proyectos/:id          → Eliminar proyecto (soft delete)

🔒 PERMISOS:
- Consultas: Cualquier usuario autenticado
- Modificaciones: Solo administradores (isAdmin middleware)

💡 NOTAS:
- Todos los endpoints requieren token de autenticación válido
- DELETE es soft delete (cambia proyecto_status_registro a 0)
- Los proyectos eliminados no aparecen en las consultas normales
- Las validaciones se realizan tanto en frontend como backend
*/

module.exports = router;