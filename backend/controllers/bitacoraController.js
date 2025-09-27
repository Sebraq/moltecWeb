// controllers/bitacoraController.js
const { obtenerRegistrosBitacora } = require("../helpers/bitacoraHelper");
const { getUserId } = require("../middleware/authMiddleware");

/**
 * 📋 OBTENER REGISTROS DE BITÁCORA CON FILTROS
 */
const obtenerBitacora = async (req, res) => {
  try {
    const {
      fechaInicio,
      fechaFin,
      usuarioId,
      tipoEvento,
      limite = 100,
    } = req.query;

    console.log("📋 Obteniendo registros de bitácora...");

    // 🔍 Construir filtros
    const filtros = {
      fechaInicio: fechaInicio || null,
      fechaFin: fechaFin || null,
      usuarioId: usuarioId || null,
      tipoEvento: tipoEvento || null,
      limite: parseInt(limite) || 100,
    };

    // 🔒 Verificar permisos (solo admins pueden ver toda la bitácora)
    const currentUserId = getUserId(req);
    const isAdmin = req.user?.fk_role_id === 1 || req.user?.roleId === 1;

    if (!isAdmin) {
      // Si no es admin, solo puede ver sus propios registros
      filtros.usuarioId = currentUserId;
    }

    const registros = await obtenerRegistrosBitacora(filtros);

    console.log(`✅ Se encontraron ${registros.length} registros de bitácora`);

    res.json({
      success: true,
      data: registros,
      total: registros.length,
      filtros: filtros,
    });
  } catch (error) {
    console.error("❌ Error al obtener bitácora:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
};

/**
 * 📊 OBTENER ESTADÍSTICAS DE LA BITÁCORA
 */
const obtenerEstadisticasBitacora = async (req, res) => {
  try {
    console.log("📊 Obteniendo estadísticas de bitácora...");

    const db = require("../db");

    // 📈 Estadísticas generales
    const statsQuery = `
      SELECT 
        COUNT(*) as totalRegistros,
        COUNT(DISTINCT fk_usuario_id) as usuariosActivos,
        DATE(MIN(bitacora_fecha)) as primerRegistro,
        DATE(MAX(bitacora_fecha)) as ultimoRegistro
      FROM tbl_bitacora
    `;

    // 🎯 Registros por tipo de evento (últimos 30 días)
    const tiposEventoQuery = `
  SELECT 
    CASE 
      WHEN bitacora_descripcion LIKE '%CREADO%' THEN 'CREADO'
      WHEN bitacora_descripcion LIKE '%ACTUALIZADO%' THEN 'ACTUALIZADO'
      WHEN bitacora_descripcion LIKE '%ELIMINADO%' THEN 'ELIMINADO'
      WHEN bitacora_descripcion LIKE '%INGRESO%' THEN 'INGRESO'
      WHEN bitacora_descripcion LIKE '%SALIDA%' THEN 'SALIDA'
      WHEN bitacora_descripcion LIKE '%LOGIN%' THEN 'LOGIN'
      WHEN bitacora_descripcion LIKE '%LOGOUT%' THEN 'LOGOUT'
      ELSE 'OTRO'
    END as tipoEvento,
    COUNT(*) as cantidad
  FROM tbl_bitacora 
  WHERE bitacora_fecha >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  GROUP BY tipoEvento
  HAVING tipoEvento != 'OTRO'
  ORDER BY cantidad DESC
  LIMIT 10
`;

    // 👥 Usuarios más activos (últimos 30 días)
    const usuariosActivosQuery = `
      SELECT 
        u.usuario_nombre_completo as usuario,
        COUNT(*) as registros
      FROM tbl_bitacora b
      INNER JOIN tbl_usuario u ON b.fk_usuario_id = u.pk_usuario_id
      WHERE b.bitacora_fecha >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY b.fk_usuario_id, u.usuario_nombre_completo
      ORDER BY registros DESC
      LIMIT 5
    `;

    // 📅 Actividad por día (últimos 7 días)
    const actividadDiariaQuery = `
      SELECT 
        DATE(bitacora_fecha) as fecha,
        COUNT(*) as registros
      FROM tbl_bitacora 
      WHERE bitacora_fecha >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(bitacora_fecha)
      ORDER BY fecha DESC
    `;

    const [stats] = await db.query(statsQuery);
    const [tiposEvento] = await db.query(tiposEventoQuery);
    const [usuariosActivos] = await db.query(usuariosActivosQuery);
    const [actividadDiaria] = await db.query(actividadDiariaQuery);

    const resultado = {
      general: stats[0],
      tiposEventoRecientes: tiposEvento,
      usuariosActivos: usuariosActivos,
      actividadDiaria: actividadDiaria,
      fechaGeneracion: new Date().toISOString(),
    };

    console.log("✅ Estadísticas de bitácora generadas exitosamente");

    res.json({
      success: true,
      data: resultado,
    });
  } catch (error) {
    console.error("❌ Error al obtener estadísticas de bitácora:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
};

module.exports = {
  obtenerBitacora,
  obtenerEstadisticasBitacora,
};
