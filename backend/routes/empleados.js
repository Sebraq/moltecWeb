// routes/empleados.js
const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const {
  obtenerEmpleados,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
  obtenerEstadisticas,
  obtenerPuestos
} = require('../controllers/empleadosController');

// 🔒 TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// Para aplicar autenticación a todas las rutas de este módulo
router.use(verifyToken);

// 📋 RUTAS PARA CONSULTAS (todos los usuarios autenticados)
// GET /api/empleados - Listar todos los empleados
router.get('/', obtenerEmpleados);

// GET /api/empleados/estadisticas - Obtener estadísticas
router.get('/estadisticas', obtenerEstadisticas);

// GET /api/empleados/puestos - Obtener lista de puestos disponibles
router.get('/puestos', obtenerPuestos);

// 🔧 RUTAS PARA MODIFICACIONES (requieren permisos especiales)
// Puedes cambiar 'isAdmin' por otro middleware según tu lógica de permisos

// POST /api/empleados - Crear nuevo empleado
router.post('/', isAdmin, crearEmpleado);

// PUT /api/empleados/:id - Actualizar datos del empleado
router.put('/:id', isAdmin, actualizarEmpleado);

// DELETE /api/empleados/:id - Eliminar empleado (solo admin)
router.delete('/:id', isAdmin, eliminarEmpleado);

// 🔍 MIDDLEWARE DE VALIDACIÓN DE PARÁMETROS (opcional pero recomendado)
// Validar que el ID sea un número válido
router.param('id', (req, res, next, id) => {
  const empleadoId = parseInt(id);
  
  if (isNaN(empleadoId) || empleadoId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'ID de empleado inválido'
    });
  }
  
  // Agregar el ID parseado al request para uso posterior
  req.empleadoId = empleadoId;
  next();
});

// 📖 DOCUMENTACIÓN DE RUTAS (comentarios para referencia)
/*
RUTAS DISPONIBLES:

📋 CONSULTAS:
GET    /api/empleados              → Listar empleados
GET    /api/empleados/estadisticas → Estadísticas generales
GET    /api/empleados/puestos      → Lista de puestos disponibles

📋 CRUD BÁSICO:
POST   /api/empleados              → Crear empleado
PUT    /api/empleados/:id          → Actualizar empleado
DELETE /api/empleados/:id          → Eliminar empleado

EJEMPLO DE USO:
- Crear: POST /api/empleados 
  { 
    "nombre": "Juan Carlos", 
    "apellido": "Pérez López",
    "fechaNacimiento": "1990-05-15",
    "identificacion": "1234567890123",
    "puestoId": 1,
    "fechaContratacion": "2024-01-15",
    "telefono": "12345678",
    "telefono2": "87654321",
    "numeroEmergencia": "11111111",
    "status": "activo"
  }

🔑 PERMISOS:
- Consultas: Usuario autenticado
- CRUD: Administrador
- Puestos: Usuario autenticado (para llenar formularios)

📊 RESPUESTAS:
- Éxito: { success: true, data: [...], total: number }
- Error: { success: false, error: "mensaje" }

📝 VALIDACIONES:
- Nombre: máximo 20 caracteres
- Apellido: máximo 20 caracteres
- Identificación: máximo 14 caracteres
- Teléfonos: exactamente 8 dígitos
- Status: 'activo' o 'inactivo'
- Fechas: formato YYYY-MM-DD
*/

module.exports = router;