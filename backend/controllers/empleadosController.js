// controllers/empleadosController.js - CORREGIDO
const db = require("../db");
const {
  registrarEnBitacora,
  TIPOS_EVENTO,
} = require("../helpers/bitacoraHelper");
const { getUserId } = require("../middleware/authMiddleware");

// 📋 CONFIGURACIÓN REUTILIZABLE - Cambia estos valores para adaptar a otras tablas
const TABLE_CONFIG = {
  tableName: "tbl_empleado",
  primaryKey: "pk_empleado_id",
  fields: {
    nombre: "empleado_nombre",
    apellido: "empleado_apellido",
    fechaNacimiento: "empleado_fecha_nacimiento",
    identificacion: "empleado_identificacion",
    puestoId: "fk_puesto_id",
    fechaContratacion: "empleado_fecha_contratacion",
    fechaFinalizacion: "empleado_fecha_finalizacion",
    telefono: "empleado_telefono",
    telefono2: "empleado_telefono2",
    numeroEmergencia: "empleado_numero_emergencia",
    status: "empleado_status",
  },
};

// 🔧 FUNCIÓN HELPER PARA FORMATEAR FECHAS
const formatearFecha = (fecha) => {
  if (!fecha) return null;

  // Si viene con hora, extraer solo la fecha
  if (fecha.includes && fecha.includes("T")) {
    return fecha.split("T")[0];
  }

  // Si ya está en formato YYYY-MM-DD, devolverlo
  if (typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return fecha;
  }

  // Si viene en otro formato, parsearlo
  try {
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
      return null;
    }
    return fechaObj.toISOString().split("T")[0];
  } catch (error) {
    return null;
  }
};

// 📄 OBTENER TODOS LOS EMPLEADOS CON INFORMACIÓN DEL PUESTO
const obtenerEmpleados = async (req, res) => {
  try {
    console.log("👥 Obteniendo lista de empleados activos...");

    // Query con JOIN para obtener información del puesto - SOLO EMPLEADOS ACTIVOS
    const query = `
      SELECT 
        e.${TABLE_CONFIG.primaryKey} as id,
        e.${TABLE_CONFIG.fields.nombre} as nombre,
        e.${TABLE_CONFIG.fields.apellido} as apellido,
        e.${TABLE_CONFIG.fields.fechaNacimiento} as fechaNacimiento,
        e.${TABLE_CONFIG.fields.identificacion} as identificacion,
        e.${TABLE_CONFIG.fields.puestoId} as puestoId,
        p.puesto_puesto as puestoNombre,
        e.${TABLE_CONFIG.fields.fechaContratacion} as fechaContratacion,
        e.${TABLE_CONFIG.fields.fechaFinalizacion} as fechaFinalizacion,
        e.${TABLE_CONFIG.fields.telefono} as telefono,
        e.${TABLE_CONFIG.fields.telefono2} as telefono2,
        e.${TABLE_CONFIG.fields.numeroEmergencia} as numeroEmergencia,
        e.${TABLE_CONFIG.fields.status} as status
      FROM ${TABLE_CONFIG.tableName} e
      INNER JOIN tbl_puesto p ON e.${TABLE_CONFIG.fields.puestoId} = p.pk_puesto_id
      WHERE e.empleado_status_registro = 1
      ORDER BY e.${TABLE_CONFIG.primaryKey} DESC
    `;

    const [empleados] = await db.query(query);

    console.log(`✅ Se encontraron ${empleados.length} empleados activos`);

    res.json({
      success: true,
      data: empleados,
      total: empleados.length,
    });
  } catch (error) {
    console.error("❌ Error al obtener empleados:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
};

// ➕ CREAR NUEVO EMPLEADO
const crearEmpleado = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      fechaNacimiento,
      identificacion,
      puestoId,
      fechaContratacion,
      telefono,
      telefono2,
      numeroEmergencia,
      status,
    } = req.body;

    console.log("➕ Creando nuevo empleado:", { nombre, apellido, puestoId });

    // Validaciones básicas
    if (!nombre || !apellido || !puestoId) {
      return res.status(400).json({
        success: false,
        error: "Nombre, apellido y puesto son campos obligatorios",
      });
    }

    // Validar longitudes
    if (nombre.length > 20) {
      return res.status(400).json({
        success: false,
        error: "El nombre no puede exceder 20 caracteres",
      });
    }

    if (apellido.length > 20) {
      return res.status(400).json({
        success: false,
        error: "El apellido no puede exceder 20 caracteres",
      });
    }

    if (identificacion && identificacion.length > 14) {
      return res.status(400).json({
        success: false,
        error: "La identificación no puede exceder 14 caracteres",
      });
    }

    // Validar teléfonos (8 dígitos)
    const validarTelefono = (tel) => {
      if (!tel) return true;
      const cleanTel = tel.replace(/\D/g, "");
      return cleanTel.length === 8;
    };

    if (
      !validarTelefono(telefono) ||
      !validarTelefono(telefono2) ||
      !validarTelefono(numeroEmergencia)
    ) {
      return res.status(400).json({
        success: false,
        error: "Los teléfonos deben tener exactamente 8 dígitos",
      });
    }

    // Verificar si ya existe un empleado con la misma identificación
    if (identificacion) {
      const checkQuery = `
    SELECT COUNT(*) as count 
    FROM ${TABLE_CONFIG.tableName} 
    WHERE ${TABLE_CONFIG.fields.identificacion} = ?
    AND empleado_status_registro = 1
  `;
      const [existing] = await db.query(checkQuery, [identificacion]);

      if (existing[0].count > 0) {
        return res.status(409).json({
          success: false,
          error: "Ya existe un empleado activo con esa identificación",
        });
      }
    }

    // Verificar que el puesto existe
    const puestoQuery = `
      SELECT COUNT(*) as count 
      FROM tbl_puesto 
      WHERE pk_puesto_id = ?
    `;
    const [puestoExists] = await db.query(puestoQuery, [puestoId]);

    if (puestoExists[0].count === 0) {
      return res.status(400).json({
        success: false,
        error: "El puesto seleccionado no existe",
      });
    }

    // Insertar nuevo empleado
    const insertQuery = `
      INSERT INTO ${TABLE_CONFIG.tableName} (
        ${TABLE_CONFIG.fields.nombre},
        ${TABLE_CONFIG.fields.apellido},
        ${TABLE_CONFIG.fields.fechaNacimiento},
        ${TABLE_CONFIG.fields.identificacion},
        ${TABLE_CONFIG.fields.puestoId},
        ${TABLE_CONFIG.fields.fechaContratacion},
        ${TABLE_CONFIG.fields.telefono},
        ${TABLE_CONFIG.fields.telefono2},
        ${TABLE_CONFIG.fields.numeroEmergencia},
        ${TABLE_CONFIG.fields.status}
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(insertQuery, [
      nombre,
      apellido,
      formatearFecha(fechaNacimiento),
      identificacion || null,
      puestoId,
      formatearFecha(fechaContratacion),
      telefono ? telefono.replace(/\D/g, "") : null,
      telefono2 ? telefono2.replace(/\D/g, "") : null,
      numeroEmergencia ? numeroEmergencia.replace(/\D/g, "") : null,
      status || "activo",
    ]);

    console.log(`✅ Empleado creado con ID: ${result.insertId}`);

    await registrarEnBitacora(
      TIPOS_EVENTO.EMPLEADO_CREADO,
      getUserId(req) || 1,
      {
        id: result.insertId,
        nombre: nombre,
        apellido: apellido,
        identificacion: identificacion || null,
      },
      req
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        message: "Empleado creado exitosamente",
      },
    });
  } catch (error) {
    console.error("❌ Error al crear empleado:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
};

// ✏️ ACTUALIZAR EMPLEADO
const actualizarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      apellido,
      fechaNacimiento,
      identificacion,
      puestoId,
      fechaContratacion,
      fechaFinalizacion,
      telefono,
      telefono2,
      numeroEmergencia,
      status,
    } = req.body;

    console.log(`✏️ Actualizando empleado ID: ${id}`);

    // Validaciones básicas
    if (!nombre || !apellido || !puestoId) {
      return res.status(400).json({
        success: false,
        error: "Nombre, apellido y puesto son campos obligatorios",
      });
    }

    // Validar longitudes
    if (nombre.length > 20 || apellido.length > 20) {
      return res.status(400).json({
        success: false,
        error: "Nombre y apellido no pueden exceder 20 caracteres",
      });
    }

    if (identificacion && identificacion.length > 14) {
      return res.status(400).json({
        success: false,
        error: "La identificación no puede exceder 14 caracteres",
      });
    }

    // Verificar que el empleado existe
    const checkQuery = `
      SELECT COUNT(*) as count 
      FROM ${TABLE_CONFIG.tableName} 
      WHERE ${TABLE_CONFIG.primaryKey} = ? AND empleado_status_registro = 1
    `;
    const [existing] = await db.query(checkQuery, [id]);

    if (existing[0].count === 0) {
      return res.status(404).json({
        success: false,
        error: "Empleado no encontrado o inactivo",
      });
    }

    // Verificar identificación duplicada (excluyendo el empleado actual)
    if (identificacion) {
      const checkIdQuery = `
        SELECT COUNT(*) as count 
        FROM ${TABLE_CONFIG.tableName} 
        WHERE ${TABLE_CONFIG.fields.identificacion} = ? 
        AND ${TABLE_CONFIG.primaryKey} != ?
        AND empleado_status_registro = 1
      `;
      const [existingId] = await db.query(checkIdQuery, [identificacion, id]);

      if (existingId[0].count > 0) {
        return res.status(409).json({
          success: false,
          error: "Ya existe otro empleado activo con esa identificación",
        });
      }
    }

    // Actualizar empleado
    const updateQuery = `
      UPDATE ${TABLE_CONFIG.tableName} 
      SET 
        ${TABLE_CONFIG.fields.nombre} = ?,
        ${TABLE_CONFIG.fields.apellido} = ?,
        ${TABLE_CONFIG.fields.fechaNacimiento} = ?,
        ${TABLE_CONFIG.fields.identificacion} = ?,
        ${TABLE_CONFIG.fields.puestoId} = ?,
        ${TABLE_CONFIG.fields.fechaContratacion} = ?,
        ${TABLE_CONFIG.fields.fechaFinalizacion} = ?,
        ${TABLE_CONFIG.fields.telefono} = ?,
        ${TABLE_CONFIG.fields.telefono2} = ?,
        ${TABLE_CONFIG.fields.numeroEmergencia} = ?,
        ${TABLE_CONFIG.fields.status} = ?
      WHERE ${TABLE_CONFIG.primaryKey} = ?
    `;

    await db.query(updateQuery, [
      nombre,
      apellido,
      formatearFecha(fechaNacimiento), // 🔧 FORMATEAR FECHA
      identificacion || null,
      puestoId,
      formatearFecha(fechaContratacion), // 🔧 FORMATEAR FECHA
      formatearFecha(fechaFinalizacion), // 🔧 FORMATEAR FECHA
      telefono ? telefono.replace(/\D/g, "") : null,
      telefono2 ? telefono2.replace(/\D/g, "") : null,
      numeroEmergencia ? numeroEmergencia.replace(/\D/g, "") : null,
      status || "activo",
      id,
    ]);

    console.log(`✅ Empleado ID ${id} actualizado exitosamente`);

    await registrarEnBitacora(
      TIPOS_EVENTO.EMPLEADO_ACTUALIZADO,
      getUserId(req) || 1,
      {
        id: id,
        nombre: nombre,
        apellido: apellido,
      },
      req
    );

    res.json({
      success: true,
      message: "Empleado actualizado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al actualizar empleado:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
};

// 🗑️ ELIMINAR EMPLEADO
const eliminarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Eliminando empleado ID: ${id} (borrado lógico)`);

    // Verificar que el empleado existe
    const checkQuery = `
      SELECT 
        ${TABLE_CONFIG.fields.nombre} as nombre,
        ${TABLE_CONFIG.fields.apellido} as apellido
      FROM ${TABLE_CONFIG.tableName} 
      WHERE ${TABLE_CONFIG.primaryKey} = ? AND empleado_status_registro = 1
    `;
    const [empleado] = await db.query(checkQuery, [id]);

    if (empleado.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Empleado no encontrado o ya inactivo",
      });
    }

    const deleteQuery = `
      UPDATE ${TABLE_CONFIG.tableName} 
      SET empleado_status_registro = 0
      WHERE ${TABLE_CONFIG.primaryKey} = ?
    `;

    await db.query(deleteQuery, [id]);

    console.log(
      `✅ Empleado "${empleado[0].nombre} ${empleado[0].apellido}" desactivado exitosamente`
    );

    await registrarEnBitacora(
      TIPOS_EVENTO.EMPLEADO_ELIMINADO,
      getUserId(req) || 1,
      {
        id: id,
        nombre: empleado[0].nombre,
        apellido: empleado[0].apellido,
      },
      req
    );

    res.json({
      success: true,
      message: `Empleado "${empleado[0].nombre} ${empleado[0].apellido}" eliminado exitosamente`,
    });
  } catch (error) {
    console.error("❌ Error al eliminar empleado:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
};

// 📊 OBTENER ESTADÍSTICAS
const obtenerEstadisticas = async (req, res) => {
  try {
    console.log("📊 Obteniendo estadísticas de empleados...");

    const statsQuery = `
      SELECT 
        COUNT(*) as totalEmpleados,
        SUM(CASE WHEN ${TABLE_CONFIG.fields.status} = 'activo' THEN 1 ELSE 0 END) as empleadosActivos,
        SUM(CASE WHEN ${TABLE_CONFIG.fields.status} = 'inactivo' THEN 1 ELSE 0 END) as empleadosInactivos,
        COUNT(DISTINCT ${TABLE_CONFIG.fields.puestoId}) as puestosOcupados,
        AVG(DATEDIFF(CURDATE(), ${TABLE_CONFIG.fields.fechaContratacion})) as promedioAntiguedad
      FROM ${TABLE_CONFIG.tableName}
      WHERE empleado_status_registro = 1
    `;

    // Estadísticas por puesto
    const puestoStatsQuery = `
      SELECT 
        p.puesto_puesto as puesto,
        COUNT(e.${TABLE_CONFIG.primaryKey}) as cantidad
      FROM tbl_puesto p
      LEFT JOIN ${TABLE_CONFIG.tableName} e ON p.pk_puesto_id = e.${TABLE_CONFIG.fields.puestoId} 
        AND e.empleado_status_registro = 1
      GROUP BY p.pk_puesto_id, p.puesto_puesto
      ORDER BY cantidad DESC
    `;

    const [stats] = await db.query(statsQuery);
    const [puestoStats] = await db.query(puestoStatsQuery);

    res.json({
      success: true,
      data: {
        ...stats[0],
        estadisticasPorPuesto: puestoStats,
      },
    });
  } catch (error) {
    console.error("❌ Error al obtener estadísticas:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
};

// 📋 OBTENER PUESTOS DISPONIBLES
const obtenerPuestos = async (req, res) => {
  try {
    console.log("📋 Obteniendo puestos disponibles...");

    const query = `
      SELECT 
        pk_puesto_id as id,
        puesto_puesto as nombre
      FROM tbl_puesto
      ORDER BY puesto_puesto ASC
    `;

    const [puestos] = await db.query(query);

    console.log(`✅ Se encontraron ${puestos.length} puestos`);

    res.json({
      success: true,
      data: puestos,
      total: puestos.length,
    });
  } catch (error) {
    console.error("❌ Error al obtener puestos:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
};

module.exports = {
  obtenerEmpleados,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
  obtenerEstadisticas,
  obtenerPuestos,
};
