// helpers/bitacoraHelper.js - ADAPTADO A TU ESQUEMA ACTUAL
const db = require("../db");

/**
 * 🔍 HELPER PARA REGISTRAR EVENTOS EN LA BITÁCORA
 *
 * Registra todas las operaciones importantes del sistema en la tabla tbl_bitacora
 * para mantener un historial completo de actividades.
 */

// 📋 TIPOS DE EVENTOS PREDEFINIDOS
const TIPOS_EVENTO = {
  // 👥 CLIENTES
  CLIENTE_CREADO: "CLIENTE_CREADO",
  CLIENTE_ACTUALIZADO: "CLIENTE_ACTUALIZADO",
  CLIENTE_ELIMINADO: "CLIENTE_ELIMINADO",
  CLIENTE_REGISTRO_SILENCIOSO: "CLIENTE_REGISTRO_SILENCIOSO",

  // 👷 EMPLEADOS
  EMPLEADO_CREADO: "EMPLEADO_CREADO",
  EMPLEADO_ACTUALIZADO: "EMPLEADO_ACTUALIZADO",
  EMPLEADO_ELIMINADO: "EMPLEADO_ELIMINADO",

  // 🔧 HERRAMIENTAS
  HERRAMIENTA_CREADA: "HERRAMIENTA_CREADA",
  HERRAMIENTA_ACTUALIZADA: "HERRAMIENTA_ACTUALIZADA",
  HERRAMIENTA_ELIMINADA: "HERRAMIENTA_ELIMINADA",
  HERRAMIENTA_INGRESO_STOCK: "HERRAMIENTA_INGRESO_STOCK",
  HERRAMIENTA_SALIDA_STOCK: "HERRAMIENTA_SALIDA_STOCK",

  // 📦 MATERIALES
  MATERIAL_CREADO: "MATERIAL_CREADO",
  MATERIAL_ACTUALIZADO: "MATERIAL_ACTUALIZADO",
  MATERIAL_ELIMINADO: "MATERIAL_ELIMINADO",
  MATERIAL_INGRESO_STOCK: "MATERIAL_INGRESO_STOCK",
  MATERIAL_SALIDA_STOCK: "MATERIAL_SALIDA_STOCK",

  // 📋 PROYECTOS
  PROYECTO_CREADO: "PROYECTO_CREADO",
  PROYECTO_ACTUALIZADO: "PROYECTO_ACTUALIZADO",
  PROYECTO_ELIMINADO: "PROYECTO_ELIMINADO",

  // 🔐 SISTEMA
  USUARIO_LOGIN: "USUARIO_LOGIN",
  USUARIO_LOGOUT: "USUARIO_LOGOUT",
  ERROR_SISTEMA: "ERROR_SISTEMA",
};

/**
 * 📄 FUNCIÓN PRINCIPAL PARA REGISTRAR EN BITÁCORA
 * ADAPTADA A TU ESQUEMA SIMPLE
 */
const registrarEnBitacora = async (
  tipoEvento,
  usuarioId,
  detalles = {},
  req = null
) => {
  try {
    // 🛡️ Validaciones básicas
    if (!tipoEvento || !usuarioId) {
      console.error(
        "❌ Error en bitácora: tipoEvento y usuarioId son requeridos"
      );
      return false;
    }

    // 🔍 Construir descripción detallada del evento
    const descripcion = construirDescripcion(tipoEvento, detalles, req);

    // 💾 Insertar en la tabla bitácora (SOLO LOS CAMPOS QUE TIENES)
    const insertQuery = `
      INSERT INTO tbl_bitacora (
        bitacora_descripcion,
        fk_usuario_id
      ) VALUES (?, ?)
    `;

    await db.query(insertQuery, [descripcion, usuarioId]);

    console.log(
      `✅ Evento registrado en bitácora: ${tipoEvento} por usuario ${usuarioId}`
    );
    return true;
  } catch (error) {
    console.error("❌ Error al registrar en bitácora:", error);
    // No lanzar error para no afectar la operación principal
    return false;
  }
};

/**
 * 📄 CONSTRUIR DESCRIPCIÓN DETALLADA DEL EVENTO
 * INCLUYE IP EN LA DESCRIPCIÓN YA QUE NO HAY CAMPO SEPARADO
 */
const construirDescripcion = (tipoEvento, detalles, req) => {
  const timestamp = new Date().toISOString();
  const ip = req
    ? req.ip || req.connection?.remoteAddress || "IP desconocida"
    : "Interno";

  let descripcion = `[${timestamp}] ${tipoEvento}`;

  // 🔍 Agregar detalles específicos según el tipo de evento
  switch (tipoEvento) {
    case TIPOS_EVENTO.CLIENTE_CREADO:
      descripcion += ` - Cliente creado: "${detalles.nombre} ${detalles.apellido}"`;
      if (detalles.correo) descripcion += ` (${detalles.correo})`;
      if (detalles.id) descripcion += ` [ID: ${detalles.id}]`;
      break;

    case TIPOS_EVENTO.CLIENTE_ACTUALIZADO:
      descripcion += ` - Cliente actualizado: ID ${detalles.id}`;
      if (detalles.nombre)
        descripcion += ` - "${detalles.nombre} ${detalles.apellido}"`;
      break;

    case TIPOS_EVENTO.CLIENTE_ELIMINADO:
      descripcion += ` - Cliente eliminado: "${detalles.nombre} ${detalles.apellido}" [ID: ${detalles.id}]`;
      break;

    case TIPOS_EVENTO.EMPLEADO_CREADO:
      descripcion += ` - Empleado creado: "${detalles.nombre} ${detalles.apellido}"`;
      if (detalles.puesto) descripcion += ` - Puesto: ${detalles.puesto}`;
      if (detalles.id) descripcion += ` [ID: ${detalles.id}]`;
      break;

    case TIPOS_EVENTO.HERRAMIENTA_CREADA:
      descripcion += ` - Herramienta creada: "${detalles.nombre}"`;
      if (detalles.marca) descripcion += ` (${detalles.marca})`;
      if (detalles.id) descripcion += ` [ID: ${detalles.id}]`;
      break;

    case TIPOS_EVENTO.HERRAMIENTA_INGRESO_STOCK:
      descripcion += ` - Ingreso de stock: "${detalles.herramienta}"`;
      descripcion += ` - Cantidad: +${detalles.cantidad}`;
      descripcion += ` (${detalles.cantidadAnterior} → ${detalles.nuevaCantidad})`;
      if (detalles.motivo) descripcion += ` - Motivo: ${detalles.motivo}`;
      break;

    case TIPOS_EVENTO.HERRAMIENTA_SALIDA_STOCK:
      descripcion += ` - Salida de stock: "${detalles.herramienta}"`;
      descripcion += ` - Cantidad: -${detalles.cantidad}`;
      descripcion += ` (${detalles.cantidadAnterior} → ${detalles.nuevaCantidad})`;
      if (detalles.motivo) descripcion += ` - Motivo: ${detalles.motivo}`;
      break;

    case TIPOS_EVENTO.PROYECTO_CREADO:
      descripcion += ` - Proyecto creado: "${detalles.nombre}"`;
      if (detalles.cliente) descripcion += ` - Cliente: ${detalles.cliente}`;
      if (detalles.responsable)
        descripcion += ` - Responsable: ${detalles.responsable}`;
      if (detalles.id) descripcion += ` [ID: ${detalles.id}]`;
      break;

    case TIPOS_EVENTO.MATERIAL_INGRESO_STOCK:
      descripcion += ` - Ingreso de material: "${detalles.material}"`;
      descripcion += ` - Cantidad: +${detalles.cantidad}`;
      descripcion += ` (${detalles.cantidadAnterior} → ${detalles.nuevaCantidad})`;
      if (detalles.motivo) descripcion += ` - Motivo: ${detalles.motivo}`;
      break;

    default:
      // Para eventos no específicos, usar los detalles tal como vienen
      if (detalles.mensaje) {
        descripcion += ` - ${detalles.mensaje}`;
      }
      if (detalles.id) {
        descripcion += ` [ID: ${detalles.id}]`;
      }
  }

  // 🌐 Agregar información de IP DENTRO DE LA DESCRIPCIÓN
  descripcion += ` | IP: ${ip}`;

  return descripcion;
};

/**
 * 📊 OBTENER REGISTROS DE BITÁCORA
 * EXACTAMENTE SEGÚN TU ESQUEMA SQL
 */
const obtenerRegistrosBitacora = async (filtros = {}) => {
  try {
    let whereConditions = [];
    let queryParams = [];

    // Aplicar filtros
    if (filtros.fechaInicio) {
      whereConditions.push("DATE(b.bitacora_fecha) >= ?");
      queryParams.push(filtros.fechaInicio);
    }

    if (filtros.fechaFin) {
      whereConditions.push("DATE(b.bitacora_fecha) <= ?");
      queryParams.push(filtros.fechaFin);
    }

    if (filtros.usuarioId) {
      whereConditions.push("b.fk_usuario_id = ?");
      queryParams.push(filtros.usuarioId);
    }

    if (filtros.tipoEvento) {
      whereConditions.push("b.bitacora_descripcion LIKE ?");
      queryParams.push(`%${filtros.tipoEvento}%`);
    }

    // Consulta que coincide EXACTAMENTE con tu tabla SQL
    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    const query = `
      SELECT 
        b.pk_bitacora_id,
        b.bitacora_descripcion,
        b.bitacora_fecha,
        b.fk_usuario_id,
        u.usuario_nombre_completo as usuario_nombre
      FROM tbl_bitacora b
      INNER JOIN tbl_usuario u ON b.fk_usuario_id = u.pk_usuario_id
      ${whereClause}
      ORDER BY b.bitacora_fecha DESC
      LIMIT ${filtros.limite || 100}
    `;

    const [registros] = await db.query(query, queryParams);

    console.log(`Se obtuvieron ${registros.length} registros de bitácora`);

    return registros;
  } catch (error) {
    console.error("Error al obtener registros de bitácora:", error);
    throw error;
  }
};

module.exports = {
  registrarEnBitacora,
  obtenerRegistrosBitacora,
  TIPOS_EVENTO,
};