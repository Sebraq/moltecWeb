// controllers/proyectosController.js
const db = require("../db");
const {
  registrarEnBitacora,
  TIPOS_EVENTO,
} = require("../helpers/bitacoraHelper");
const { getUserId } = require("../middleware/authMiddleware");

// 📋 CONFIGURACIÓN REUTILIZABLE - Cambia estos valores para adaptar a otras tablas
const TABLE_CONFIG = {
  tableName: "tbl_proyecto",
  primaryKey: "pk_proyecto_id",
  fields: {
    nombre: "proyecto_nombre",
    descripcion: "proyecto_descripcion",
    responsableId: "fk_responsable_id",
    clienteId: "fk_cliente_id",
    ubicacion: "proyecto_ubicacion",
    fechaInicio: "proyecto_fecha_inicio",
    fechaAproxFin: "proyecto_fecha_aprox_fin",
    fechaFin: "proyecto_fecha_fin",
    cotizacion: "proyecto_cotizacion",
    aprobado: "proyecto_aprobado",
    status: "proyecto_status",
    statusRegistro: "proyecto_status_registro",
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

// 📄 OBTENER TODOS LOS PROYECTOS CON INFORMACIÓN DE RESPONSABLE Y CLIENTE
const obtenerProyectos = async (req, res) => {
  try {
    console.log("📁 Obteniendo lista de proyectos...");

    // Query con JOINs para obtener información del responsable y cliente
    const query = `
      SELECT 
        p.${TABLE_CONFIG.primaryKey} as id,
        p.${TABLE_CONFIG.fields.nombre} as nombre,
        p.${TABLE_CONFIG.fields.descripcion} as descripcion,
        p.${TABLE_CONFIG.fields.responsableId} as responsableId,
        CONCAT(e.empleado_nombre, ' ', e.empleado_apellido) as responsableNombre,
        p.${TABLE_CONFIG.fields.clienteId} as clienteId,
        CONCAT(c.cliente_nombre, ' ', c.cliente_apellido) as clienteNombre,
        p.${TABLE_CONFIG.fields.ubicacion} as ubicacion,
        p.${TABLE_CONFIG.fields.fechaInicio} as fechaInicio,
        p.${TABLE_CONFIG.fields.fechaAproxFin} as fechaAproxFin,
        p.${TABLE_CONFIG.fields.fechaFin} as fechaFin,
        p.${TABLE_CONFIG.fields.cotizacion} as cotizacion,
        p.${TABLE_CONFIG.fields.aprobado} as aprobado,
        p.${TABLE_CONFIG.fields.status} as status,
        p.${TABLE_CONFIG.fields.statusRegistro} as statusRegistro
      FROM ${TABLE_CONFIG.tableName} p
LEFT JOIN tbl_empleado e ON p.${TABLE_CONFIG.fields.responsableId} = e.pk_empleado_id
LEFT JOIN tbl_cliente c ON p.${TABLE_CONFIG.fields.clienteId} = c.pk_cliente_id
WHERE p.${TABLE_CONFIG.fields.statusRegistro} = 1 
      ORDER BY p.${TABLE_CONFIG.primaryKey} DESC
    `;

    const [proyectos] = await db.query(query);

    console.log(`✅ Se encontraron ${proyectos.length} proyectos`);

    res.json({
      success: true,
      data: proyectos,
      total: proyectos.length,
    });
  } catch (error) {
    console.error("❌ Error al obtener proyectos:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
};

// ➕ CREAR NUEVO PROYECTO
const crearProyecto = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      responsableId,
      clienteId,
      ubicacion,
      fechaInicio,
      fechaAproxFin,
      fechaFin,
      cotizacion,
      aprobado,
      status,
    } = req.body;

    console.log("➕ Creando nuevo proyecto:", {
      nombre,
      responsableId,
      clienteId,
    });

    // Validaciones básicas
    if (!nombre || !responsableId || !clienteId) {
      return res.status(400).json({
        success: false,
        error: "Nombre, responsable y cliente son campos obligatorios",
      });
    }

    if (nombre.length > 150) {
      return res.status(400).json({
        success: false,
        error: "El nombre del proyecto no puede exceder 150 caracteres",
      });
    }

    // Validar que el responsable existe y está activo
    const checkResponsableQuery = `
      SELECT COUNT(*) as count 
      FROM tbl_empleado 
      WHERE pk_empleado_id = ? AND empleado_status = 1
    `;
    const [responsableExists] = await db.query(checkResponsableQuery, [
      responsableId,
    ]);

    if (responsableExists[0].count === 0) {
      return res.status(400).json({
        success: false,
        error: "El responsable seleccionado no existe o no está activo",
      });
    }

    // Validar que el cliente existe y está activo
    const checkClienteQuery = `
      SELECT COUNT(*) as count 
      FROM tbl_cliente 
      WHERE pk_cliente_id = ? AND cliente_status = 1
    `;
    const [clienteExists] = await db.query(checkClienteQuery, [clienteId]);

    if (clienteExists[0].count === 0) {
      return res.status(400).json({
        success: false,
        error: "El cliente seleccionado no existe o no está activo",
      });
    }

    // Validar cotización si se proporciona
    if (cotizacion && (isNaN(cotizacion) || parseFloat(cotizacion) < 0)) {
      return res.status(400).json({
        success: false,
        error: "La cotización debe ser un número válido mayor o igual a 0",
      });
    }

    // Validar fechas
    const fechaInicioFormatted = formatearFecha(fechaInicio);
    const fechaAproxFinFormatted = formatearFecha(fechaAproxFin);
    const fechaFinFormatted = formatearFecha(fechaFin);

    if (fechaInicioFormatted && fechaAproxFinFormatted) {
      if (new Date(fechaInicioFormatted) >= new Date(fechaAproxFinFormatted)) {
        return res.status(400).json({
          success: false,
          error:
            "La fecha de finalización estimada debe ser posterior a la fecha de inicio",
        });
      }
    }

    // Validar status
    const statusValidos = [
      "planificado",
      "en progreso",
      "pausado",
      "completado",
      "cancelado",
    ];
    const statusFinal =
      status && statusValidos.includes(status) ? status : "planificado";

    // Verificar si ya existe un proyecto con el mismo nombre para el mismo cliente
    const checkDuplicadoQuery = `
      SELECT COUNT(*) as count 
      FROM ${TABLE_CONFIG.tableName} 
      WHERE ${TABLE_CONFIG.fields.nombre} = ? 
        AND ${TABLE_CONFIG.fields.clienteId} = ? 
        AND ${TABLE_CONFIG.fields.statusRegistro} = 1
    `;
    const [existing] = await db.query(checkDuplicadoQuery, [nombre, clienteId]);

    if (existing[0].count > 0) {
      return res.status(409).json({
        success: false,
        error: "Ya existe un proyecto con ese nombre para este cliente",
      });
    }

    // Insertar nuevo proyecto
    const insertQuery = `
      INSERT INTO ${TABLE_CONFIG.tableName} (
        ${TABLE_CONFIG.fields.nombre},
        ${TABLE_CONFIG.fields.descripcion},
        ${TABLE_CONFIG.fields.responsableId},
        ${TABLE_CONFIG.fields.clienteId},
        ${TABLE_CONFIG.fields.ubicacion},
        ${TABLE_CONFIG.fields.fechaInicio},
        ${TABLE_CONFIG.fields.fechaAproxFin},
        ${TABLE_CONFIG.fields.fechaFin},
        ${TABLE_CONFIG.fields.cotizacion},
        ${TABLE_CONFIG.fields.aprobado},
        ${TABLE_CONFIG.fields.status},
        ${TABLE_CONFIG.fields.statusRegistro}
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;

    const [result] = await db.query(insertQuery, [
      nombre,
      descripcion || null,
      responsableId,
      clienteId,
      ubicacion || null,
      fechaInicioFormatted,
      fechaAproxFinFormatted,
      fechaFinFormatted,
      cotizacion ? parseFloat(cotizacion) : null,
      aprobado ? 1 : 0,
      statusFinal,
    ]);

    console.log(`✅ Proyecto creado con ID: ${result.insertId}`);

    await registrarEnBitacora(
      TIPOS_EVENTO.PROYECTO_CREADO,
      getUserId(req) || 1,
      {
        id: result.insertId,
        nombre: nombre,
      },
      req
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        message: "Proyecto creado exitosamente",
      },
    });
  } catch (error) {
    console.error("❌ Error al crear proyecto:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
};

// ✏️ ACTUALIZAR PROYECTO
const actualizarProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      responsableId,
      clienteId,
      ubicacion,
      fechaInicio,
      fechaAproxFin,
      fechaFin,
      cotizacion,
      aprobado,
      status,
    } = req.body;

    console.log(`✏️ Actualizando proyecto ID: ${id}`);

    // Validaciones básicas
    if (!nombre || !responsableId || !clienteId) {
      return res.status(400).json({
        success: false,
        error: "Nombre, responsable y cliente son campos obligatorios",
      });
    }

    // Verificar que el proyecto existe
    const checkQuery = `
      SELECT COUNT(*) as count 
      FROM ${TABLE_CONFIG.tableName} 
      WHERE ${TABLE_CONFIG.primaryKey} = ? AND ${TABLE_CONFIG.fields.statusRegistro} = 1
    `;
    const [existing] = await db.query(checkQuery, [id]);

    if (existing[0].count === 0) {
      return res.status(404).json({
        success: false,
        error: "Proyecto no encontrado",
      });
    }

    // Validar que el responsable existe y está activo
    const checkResponsableQuery = `
      SELECT COUNT(*) as count 
      FROM tbl_empleado 
      WHERE pk_empleado_id = ? AND empleado_status = 1
    `;
    const [responsableExists] = await db.query(checkResponsableQuery, [
      responsableId,
    ]);

    if (responsableExists[0].count === 0) {
      return res.status(400).json({
        success: false,
        error: "El responsable seleccionado no existe o no está activo",
      });
    }

    // Validar que el cliente existe y está activo
    const checkClienteQuery = `
      SELECT COUNT(*) as count 
      FROM tbl_cliente 
      WHERE pk_cliente_id = ? AND cliente_status = 1
    `;
    const [clienteExists] = await db.query(checkClienteQuery, [clienteId]);

    if (clienteExists[0].count === 0) {
      return res.status(400).json({
        success: false,
        error: "El cliente seleccionado no existe o no está activo",
      });
    }

    // Validar que no existe otro proyecto con el mismo nombre para el mismo cliente
    const checkDuplicadoQuery = `
      SELECT COUNT(*) as count 
      FROM ${TABLE_CONFIG.tableName} 
      WHERE ${TABLE_CONFIG.fields.nombre} = ? 
        AND ${TABLE_CONFIG.fields.clienteId} = ? 
        AND ${TABLE_CONFIG.primaryKey} != ? 
        AND ${TABLE_CONFIG.fields.statusRegistro} = 1
    `;
    const [duplicate] = await db.query(checkDuplicadoQuery, [
      nombre,
      clienteId,
      id,
    ]);

    if (duplicate[0].count > 0) {
      return res.status(409).json({
        success: false,
        error: "Ya existe otro proyecto con ese nombre para este cliente",
      });
    }

    // Validar cotización
    if (cotizacion && (isNaN(cotizacion) || parseFloat(cotizacion) < 0)) {
      return res.status(400).json({
        success: false,
        error: "La cotización debe ser un número válido mayor o igual a 0",
      });
    }

    // Formatear fechas
    const fechaInicioFormatted = formatearFecha(fechaInicio);
    const fechaAproxFinFormatted = formatearFecha(fechaAproxFin);
    const fechaFinFormatted = formatearFecha(fechaFin);

    // Validar fechas
    if (fechaInicioFormatted && fechaAproxFinFormatted) {
      if (new Date(fechaInicioFormatted) >= new Date(fechaAproxFinFormatted)) {
        return res.status(400).json({
          success: false,
          error:
            "La fecha de finalización estimada debe ser posterior a la fecha de inicio",
        });
      }
    }

    // Validar status
    const statusValidos = [
      "planificado",
      "en progreso",
      "pausado",
      "completado",
      "cancelado",
    ];
    const statusFinal =
      status && statusValidos.includes(status) ? status : "planificado";

    // Actualizar proyecto
    const updateQuery = `
      UPDATE ${TABLE_CONFIG.tableName} 
      SET 
        ${TABLE_CONFIG.fields.nombre} = ?,
        ${TABLE_CONFIG.fields.descripcion} = ?,
        ${TABLE_CONFIG.fields.responsableId} = ?,
        ${TABLE_CONFIG.fields.clienteId} = ?,
        ${TABLE_CONFIG.fields.ubicacion} = ?,
        ${TABLE_CONFIG.fields.fechaInicio} = ?,
        ${TABLE_CONFIG.fields.fechaAproxFin} = ?,
        ${TABLE_CONFIG.fields.fechaFin} = ?,
        ${TABLE_CONFIG.fields.cotizacion} = ?,
        ${TABLE_CONFIG.fields.aprobado} = ?,
        ${TABLE_CONFIG.fields.status} = ?
      WHERE ${TABLE_CONFIG.primaryKey} = ?
    `;

    await db.query(updateQuery, [
      nombre,
      descripcion || null,
      responsableId,
      clienteId,
      ubicacion || null,
      fechaInicioFormatted,
      fechaAproxFinFormatted,
      fechaFinFormatted,
      cotizacion ? parseFloat(cotizacion) : null,
      aprobado ? 1 : 0,
      statusFinal,
      id,
    ]);

    console.log(`✅ Proyecto ID ${id} actualizado exitosamente`);

    await registrarEnBitacora(
      TIPOS_EVENTO.PROYECTO_ACTUALIZADO,
      getUserId(req) || 1,
      {
        id: id,
        nombre: nombre,
      },
      req
    );

    res.json({
      success: true,
      message: "Proyecto actualizado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al actualizar proyecto:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
};

// 🗑️ ELIMINAR PROYECTO (soft delete)
const eliminarProyecto = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Eliminando proyecto ID: ${id}`);

    // Verificar que el proyecto existe
    const checkQuery = `
      SELECT 
        ${TABLE_CONFIG.fields.nombre} as nombre,
        COUNT(*) as count 
      FROM ${TABLE_CONFIG.tableName} 
      WHERE ${TABLE_CONFIG.primaryKey} = ? AND ${TABLE_CONFIG.fields.statusRegistro} = 1
    `;
    const [existing] = await db.query(checkQuery, [id]);

    if (existing[0].count === 0) {
      return res.status(404).json({
        success: false,
        error: "Proyecto no encontrado",
      });
    }

    const nombreProyecto = existing[0].nombre;

    // Soft delete - cambiar status_registro a 0
    const deleteQuery = `
      UPDATE ${TABLE_CONFIG.tableName} 
      SET ${TABLE_CONFIG.fields.statusRegistro} = 0 
      WHERE ${TABLE_CONFIG.primaryKey} = ?
    `;

    await db.query(deleteQuery, [id]);

    console.log(
      `✅ Proyecto "${nombreProyecto}" eliminado exitosamente (soft delete)`
    );

    await registrarEnBitacora(
      TIPOS_EVENTO.PROYECTO_ELIMINADO,
      getUserId(req) || 1,
      {
        id: id,
        nombre: nombreProyecto,
      },
      req
    );

    res.json({
      success: true,
      message: "Proyecto eliminado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al eliminar proyecto:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
};

// 📊 OBTENER ESTADÍSTICAS DE PROYECTOS
const obtenerEstadisticas = async (req, res) => {
  try {
    console.log("📊 Obteniendo estadísticas de proyectos...");

    // Query para obtener estadísticas generales
    const statsQuery = `
      SELECT 
        COUNT(*) as totalProyectos,
        SUM(CASE WHEN ${TABLE_CONFIG.fields.status} = 'planificado' THEN 1 ELSE 0 END) as planificados,
        SUM(CASE WHEN ${TABLE_CONFIG.fields.status} = 'en progreso' THEN 1 ELSE 0 END) as enProgreso,
        SUM(CASE WHEN ${TABLE_CONFIG.fields.status} = 'pausado' THEN 1 ELSE 0 END) as pausados,
        SUM(CASE WHEN ${TABLE_CONFIG.fields.status} = 'completado' THEN 1 ELSE 0 END) as completados,
        SUM(CASE WHEN ${TABLE_CONFIG.fields.status} = 'cancelado' THEN 1 ELSE 0 END) as cancelados,
        SUM(CASE WHEN ${TABLE_CONFIG.fields.aprobado} = 1 THEN 1 ELSE 0 END) as aprobados,
        SUM(CASE WHEN ${TABLE_CONFIG.fields.aprobado} = 0 THEN 1 ELSE 0 END) as pendientesAprobacion,
        SUM(CASE WHEN ${TABLE_CONFIG.fields.cotizacion} IS NOT NULL AND ${TABLE_CONFIG.fields.cotizacion} > 0 THEN 1 ELSE 0 END) as conCotizacion,
        SUM(CASE WHEN ${TABLE_CONFIG.fields.fechaInicio} IS NOT NULL THEN 1 ELSE 0 END) as conFechaInicio,
        SUM(CASE WHEN ${TABLE_CONFIG.fields.cotizacion} IS NOT NULL AND ${TABLE_CONFIG.fields.aprobado} = 1 THEN ${TABLE_CONFIG.fields.cotizacion} ELSE 0 END) as totalCotizacionAprobada,
        SUM(CASE WHEN ${TABLE_CONFIG.fields.cotizacion} IS NOT NULL THEN ${TABLE_CONFIG.fields.cotizacion} ELSE 0 END) as totalCotizacion,
        AVG(CASE WHEN ${TABLE_CONFIG.fields.cotizacion} IS NOT NULL AND ${TABLE_CONFIG.fields.cotizacion} > 0 THEN ${TABLE_CONFIG.fields.cotizacion} ELSE NULL END) as promedioCotizacion
      FROM ${TABLE_CONFIG.tableName} 
      WHERE ${TABLE_CONFIG.fields.statusRegistro} = 1
    `;

    const [stats] = await db.query(statsQuery);
    const estadisticas = stats[0];

    // Query para proyectos por responsable
    const responsablesQuery = `
      SELECT 
        CONCAT(e.empleado_nombre, ' ', e.empleado_apellido) as responsable,
        COUNT(*) as totalProyectos,
        SUM(CASE WHEN p.${TABLE_CONFIG.fields.status} = 'completado' THEN 1 ELSE 0 END) as completados
      FROM ${TABLE_CONFIG.tableName} p
      INNER JOIN tbl_empleado e ON p.${TABLE_CONFIG.fields.responsableId} = e.pk_empleado_id
      WHERE p.${TABLE_CONFIG.fields.statusRegistro} = 1 AND e.empleado_status = 1
      GROUP BY p.${TABLE_CONFIG.fields.responsableId}, e.empleado_nombre, e.empleado_apellido
      ORDER BY totalProyectos DESC
      LIMIT 5
    `;

    const [responsables] = await db.query(responsablesQuery);

    // Query para proyectos por cliente
    const clientesQuery = `
      SELECT 
        CONCAT(c.cliente_nombre, ' ', c.cliente_apellido) as cliente,
        COUNT(*) as totalProyectos,
        SUM(CASE WHEN p.${TABLE_CONFIG.fields.cotizacion} IS NOT NULL THEN p.${TABLE_CONFIG.fields.cotizacion} ELSE 0 END) as totalCotizacion
      FROM ${TABLE_CONFIG.tableName} p
      INNER JOIN tbl_cliente c ON p.${TABLE_CONFIG.fields.clienteId} = c.pk_cliente_id
      WHERE p.${TABLE_CONFIG.fields.statusRegistro} = 1 AND c.cliente_status = 1
      GROUP BY p.${TABLE_CONFIG.fields.clienteId}, c.cliente_nombre, c.cliente_apellido
      ORDER BY totalProyectos DESC
      LIMIT 5
    `;

    const [clientes] = await db.query(clientesQuery);

    // Query para proyectos próximos a vencer
    const proximosVencerQuery = `
      SELECT 
        COUNT(*) as proximosVencer
      FROM ${TABLE_CONFIG.tableName} 
      WHERE ${TABLE_CONFIG.fields.statusRegistro} = 1 
        AND ${TABLE_CONFIG.fields.status} IN ('planificado', 'en progreso')
        AND ${TABLE_CONFIG.fields.fechaAproxFin} IS NOT NULL
        AND ${TABLE_CONFIG.fields.fechaAproxFin} BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    `;

    const [proximosVencer] = await db.query(proximosVencerQuery);

    // Query para proyectos vencidos
    const vencidosQuery = `
      SELECT 
        COUNT(*) as vencidos
      FROM ${TABLE_CONFIG.tableName} 
      WHERE ${TABLE_CONFIG.fields.statusRegistro} = 1 
        AND ${TABLE_CONFIG.fields.status} IN ('planificado', 'en progreso')
        AND ${TABLE_CONFIG.fields.fechaAproxFin} IS NOT NULL
        AND ${TABLE_CONFIG.fields.fechaAproxFin} < CURDATE()
    `;

    const [vencidos] = await db.query(vencidosQuery);

    // Calcular porcentajes
    const total = parseInt(estadisticas.totalProyectos) || 0;
    const porcentajes = {
      aprobados:
        total > 0 ? Math.round((estadisticas.aprobados / total) * 100) : 0,
      completados:
        total > 0 ? Math.round((estadisticas.completados / total) * 100) : 0,
      enProgreso:
        total > 0 ? Math.round((estadisticas.enProgreso / total) * 100) : 0,
      conCotizacion:
        total > 0 ? Math.round((estadisticas.conCotizacion / total) * 100) : 0,
    };

    const resultado = {
      // Estadísticas básicas
      totalProyectos: parseInt(estadisticas.totalProyectos) || 0,
      planificados: parseInt(estadisticas.planificados) || 0,
      enProgreso: parseInt(estadisticas.enProgreso) || 0,
      pausados: parseInt(estadisticas.pausados) || 0,
      completados: parseInt(estadisticas.completados) || 0,
      cancelados: parseInt(estadisticas.cancelados) || 0,

      // Estadísticas de aprobación
      aprobados: parseInt(estadisticas.aprobados) || 0,
      pendientesAprobacion: parseInt(estadisticas.pendientesAprobacion) || 0,

      // Estadísticas financieras
      totalCotizacion: parseFloat(estadisticas.totalCotizacion) || 0,
      totalCotizacionAprobada:
        parseFloat(estadisticas.totalCotizacionAprobada) || 0,
      promedioCotizacion: parseFloat(estadisticas.promedioCotizacion) || 0,
      conCotizacion: parseInt(estadisticas.conCotizacion) || 0,

      // Estadísticas de fechas
      conFechaInicio: parseInt(estadisticas.conFechaInicio) || 0,
      proximosVencer: parseInt(proximosVencer[0].proximosVencer) || 0,
      vencidos: parseInt(vencidos[0].vencidos) || 0,

      // Porcentajes
      porcentajes,

      // Rankings
      topResponsables: responsables,
      topClientes: clientes,

      // Metadata
      fechaGeneracion: new Date().toISOString(),
    };

    console.log(
      `✅ Estadísticas calculadas: ${resultado.totalProyectos} proyectos analizados`
    );

    res.json({
      success: true,
      data: resultado,
    });
  } catch (error) {
    console.error("❌ Error al obtener estadísticas:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
};

// 📋 FUNCIONES HELPER ADICIONALES

// 🔍 BUSCAR PROYECTOS POR TÉRMINO (función opcional para búsquedas avanzadas)
const buscarProyectos = async (req, res) => {
  try {
    const { termino, estado, responsable, cliente } = req.query;

    let whereConditions = [`p.${TABLE_CONFIG.fields.statusRegistro} = 1`];
    let queryParams = [];

    if (termino) {
      whereConditions.push(`(
        p.${TABLE_CONFIG.fields.nombre} LIKE ? OR 
        p.${TABLE_CONFIG.fields.descripcion} LIKE ? OR 
        p.${TABLE_CONFIG.fields.ubicacion} LIKE ?
      )`);
      const terminoBusqueda = `%${termino}%`;
      queryParams.push(terminoBusqueda, terminoBusqueda, terminoBusqueda);
    }

    if (estado && estado !== "todos") {
      whereConditions.push(`p.${TABLE_CONFIG.fields.status} = ?`);
      queryParams.push(estado);
    }

    if (responsable) {
      whereConditions.push(`p.${TABLE_CONFIG.fields.responsableId} = ?`);
      queryParams.push(responsable);
    }

    if (cliente) {
      whereConditions.push(`p.${TABLE_CONFIG.fields.clienteId} = ?`);
      queryParams.push(cliente);
    }

    const query = `
      SELECT 
        p.${TABLE_CONFIG.primaryKey} as id,
        p.${TABLE_CONFIG.fields.nombre} as nombre,
        p.${TABLE_CONFIG.fields.descripcion} as descripcion,
        CONCAT(e.empleado_nombre, ' ', e.empleado_apellido) as responsableNombre,
        CONCAT(c.cliente_nombre, ' ', c.cliente_apellido) as clienteNombre,
        p.${TABLE_CONFIG.fields.status} as status,
        p.${TABLE_CONFIG.fields.cotizacion} as cotizacion,
        p.${TABLE_CONFIG.fields.aprobado} as aprobado
      FROM ${TABLE_CONFIG.tableName} p
      INNER JOIN tbl_empleado e ON p.${
        TABLE_CONFIG.fields.responsableId
      } = e.pk_empleado_id
      INNER JOIN tbl_cliente c ON p.${
        TABLE_CONFIG.fields.clienteId
      } = c.pk_cliente_id
      WHERE ${whereConditions.join(" AND ")}
      ORDER BY p.${TABLE_CONFIG.fields.nombre} ASC
    `;

    const [proyectos] = await db.query(query, queryParams);

    res.json({
      success: true,
      data: proyectos,
      total: proyectos.length,
      filtros: { termino, estado, responsable, cliente },
    });
  } catch (error) {
    console.error("❌ Error en búsqueda de proyectos:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
};

// 📊 OBTENER PROYECTO POR ID (función helper)
const obtenerProyectoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        p.${TABLE_CONFIG.primaryKey} as id,
        p.${TABLE_CONFIG.fields.nombre} as nombre,
        p.${TABLE_CONFIG.fields.descripcion} as descripcion,
        p.${TABLE_CONFIG.fields.responsableId} as responsableId,
        CONCAT(e.empleado_nombre, ' ', e.empleado_apellido) as responsableNombre,
        p.${TABLE_CONFIG.fields.clienteId} as clienteId,
        CONCAT(c.cliente_nombre, ' ', c.cliente_apellido) as clienteNombre,
        p.${TABLE_CONFIG.fields.ubicacion} as ubicacion,
        p.${TABLE_CONFIG.fields.fechaInicio} as fechaInicio,
        p.${TABLE_CONFIG.fields.fechaAproxFin} as fechaAproxFin,
        p.${TABLE_CONFIG.fields.fechaFin} as fechaFin,
        p.${TABLE_CONFIG.fields.cotizacion} as cotizacion,
        p.${TABLE_CONFIG.fields.aprobado} as aprobado,
        p.${TABLE_CONFIG.fields.status} as status
      FROM ${TABLE_CONFIG.tableName} p
      INNER JOIN tbl_empleado e ON p.${TABLE_CONFIG.fields.responsableId} = e.pk_empleado_id
      INNER JOIN tbl_cliente c ON p.${TABLE_CONFIG.fields.clienteId} = c.pk_cliente_id
      WHERE p.${TABLE_CONFIG.primaryKey} = ? AND p.${TABLE_CONFIG.fields.statusRegistro} = 1
    `;

    const [proyecto] = await db.query(query, [id]);

    if (proyecto.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Proyecto no encontrado",
      });
    }

    res.json({
      success: true,
      data: proyecto[0],
    });
  } catch (error) {
    console.error("❌ Error al obtener proyecto:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
};

module.exports = {
  obtenerProyectos,
  crearProyecto,
  actualizarProyecto,
  eliminarProyecto,
  obtenerEstadisticas,
  buscarProyectos,
  obtenerProyectoPorId,
};

// 📋 GUÍA DE ADAPTACIÓN PARA OTROS CRUDs:
/*
🔧 PARA ADAPTAR A OTRA TABLA (ej: herramientas):

1. Cambiar TABLE_CONFIG:
   - tableName: 'tbl_herramienta'
   - primaryKey: 'pk_herramienta_id'
   - fields: adaptar según campos de la tabla

2. Cambiar nombres de funciones:
   - obtenerProyectos → obtenerHerramientas
   - crearProyecto → crearHerramienta
   - etc.

3. Adaptar validaciones según los campos de la nueva tabla

4. Adaptar las consultas JOIN según las relaciones de la nueva tabla

5. Los métodos base (formatearFecha, validaciones, etc.) son reutilizables

EJEMPLO PARA HERRAMIENTAS:
- TABLE_CONFIG.tableName = 'tbl_herramienta'
- Cambiar mensajes de console.log
- Adaptar validaciones específicas de herramientas
- Todo lo demás queda igual
*/
