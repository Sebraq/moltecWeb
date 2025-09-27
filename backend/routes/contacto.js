// routes/contacto.js - Backend simplificado para registro de clientes únicamente
const express = require('express');
const router = express.Router();
const db = require('../db');

// 🛡️ RATE LIMITING STORE
const registroLimitStore = new Map();

// 🛡️ RATE LIMITING PARA REGISTRO DE CLIENTES
const rateLimitRegistro = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minutos
  const maxRequests = 5; // Máximo 5 registros cada 5 minutos

  if (!registroLimitStore.has(clientIP)) {
    registroLimitStore.set(clientIP, []);
  }

  const requests = registroLimitStore.get(clientIP);
  const recentRequests = requests.filter(timestamp => now - timestamp < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return res.status(429).json({
      success: false,
      error: 'Demasiadas solicitudes de registro. Intenta en unos minutos.'
    });
  }

  recentRequests.push(now);
  registroLimitStore.set(clientIP, recentRequests);
  next();
};

// 🛡️ FUNCIÓN PARA SANITIZAR DATOS
const sanitizeInput = (input) => {
  if (!input) return '';
  return input
    .toString()
    .trim()
    .replace(/[<>"']/g, '') // Remover caracteres peligrosos
    .substring(0, 100); // Limitar longitud
};

// 🛡️ FUNCIÓN PARA VALIDAR EMAIL
const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// 🛡️ FUNCIÓN PARA VALIDAR TELÉFONO GUATEMALTECO
const isValidPhone = (phone) => {
  if (!phone) return true; // Campo opcional
  const cleanPhone = phone.replace(/\D/g, '');
  return /^[2345678]\d{7}$/.test(cleanPhone); // Números guatemaltecos válidos
};

// 🤫 REGISTRO SILENCIOSO DE CLIENTE DESDE FORMULARIO DE CONTACTO
router.post('/registro-contacto', rateLimitRegistro, async (req, res) => {
  try {
    console.log('🤫 REGISTRO CONTACTO - Request recibido');
    console.log('🌐 IP:', req.ip);
    
    let { nombre, apellido, email, telefono } = req.body;

    // 🛡️ SANITIZAR TODOS LOS INPUTS
    nombre = sanitizeInput(nombre);
    apellido = sanitizeInput(apellido);
    email = sanitizeInput(email);
    telefono = sanitizeInput(telefono);

    // 🔍 VALIDACIONES ESTRICTAS
    if (!nombre || !apellido || !email) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos: nombre, apellido y email son obligatorios'
      });
    }

    if (nombre.length < 2 || apellido.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Nombre y apellido deben tener al menos 2 caracteres'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email inválido'
      });
    }

    if (telefono && !isValidPhone(telefono)) {
      return res.status(400).json({
        success: false,
        error: 'Teléfono debe ser un número guatemalteco válido (8 dígitos)'
      });
    }

    // 🔍 VERIFICAR SI YA EXISTE EL CLIENTE
    const checkQuery = `
      SELECT 
        pk_cliente_id,
        cliente_fecha_registro,
        TIMESTAMPDIFF(HOUR, cliente_fecha_registro, NOW()) as horas_desde_registro
      FROM tbl_cliente 
      WHERE cliente_correo = ? AND cliente_status = 1
    `;
    
    const [existing] = await db.query(checkQuery, [email.toLowerCase()]);
    
    if (existing.length > 0) {
      const horasDesdeRegistro = existing[0].horas_desde_registro;
      
      console.log(`ℹ️ Cliente ya existe, registrado hace ${horasDesdeRegistro} horas`);
      
      return res.json({
        success: true,
        message: 'Cliente procesado exitosamente',
        existed: true,
        clientId: existing[0].pk_cliente_id
      });
    }

    // 🆕 INSERTAR NUEVO CLIENTE
    const insertQuery = `
      INSERT INTO tbl_cliente (
        cliente_nombre, 
        cliente_apellido, 
        cliente_correo, 
        cliente_telefono,
        cliente_fecha_registro
      ) VALUES (?, ?, ?, ?, NOW())
    `;
    
    const cleanPhone = telefono ? telefono.replace(/\D/g, '') : null;
    
    const [result] = await db.query(insertQuery, [
      nombre,
      apellido,
      email.toLowerCase(),
      cleanPhone
    ]);

    console.log(`✅ Nuevo cliente registrado con ID: ${result.insertId}`);

    res.json({
      success: true,
      message: 'Cliente registrado exitosamente',
      existed: false,
      clientId: result.insertId
    });

  } catch (error) {
    console.error('❌ Error en registro de cliente:', error);
    
    // Log más detallado para debugging
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState
    });
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al registrar cliente'
    });
  }
});

// 🧪 RUTA DE PRUEBA
router.get('/test', (req, res) => {
  res.json({
    message: 'Ruta de contacto funcionando correctamente',
    ip: req.ip,
    timestamp: new Date().toISOString(),
    endpoints: {
      registro: 'POST /api/contacto/registro-contacto'
    },
    rateLimits: {
      registro: '5 requests / 5 minutos por IP'
    }
  });
});

// 🔍 RUTA PARA VERIFICAR CONEXIÓN A BASE DE DATOS
router.get('/health', async (req, res) => {
  try {
    const [result] = await db.query('SELECT 1 as test');
    res.json({
      success: true,
      message: 'Conexión a base de datos OK',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error de conexión a BD:', error);
    res.status(500).json({
      success: false,
      error: 'Error de conexión a base de datos'
    });
  }
});

module.exports = router;