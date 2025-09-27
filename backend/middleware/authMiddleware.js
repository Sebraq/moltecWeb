// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware para verificar el token JWT
const verifyToken = (req, res, next) => {
  // Obtener el token del header Authorization
  const token = req.headers["authorization"]?.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(403).json({ message: "No se proporcionó un token" });
  }

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Guardar la información del usuario en la request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
};

// Middleware para verificar si es administrador
const isAdmin = (req, res, next) => {
  // Verifica tanto por ID como por nombre del rol
  const isAdminRole =
    req.user.roleId === 1 ||
    req.user.role_nombre === "Administrador" ||
    req.user.fk_role_id === 1;

  if (!isAdminRole) {
    return res
      .status(403)
      .json({
        message: "Acceso denegado. Se requieren permisos de administrador",
      });
  }
  next();
};

/**
 * 🆔 FUNCIÓN HELPER PARA OBTENER EL ID DEL USUARIO
 * Extrae el ID del usuario del objeto req.user de manera consistente
 */
const getUserId = (req) => {
  if (!req.user) return null;
  
  // Tu middleware puede poner el ID en diferentes campos
  return req.user.pk_usuario_id || req.user.id || req.user.userId || null;
};

/**
 * 👤 FUNCIÓN HELPER PARA OBTENER INFO COMPLETA DEL USUARIO
 */
const getUserInfo = (req) => {
  if (!req.user) return null;
  
  return {
    id: getUserId(req),
    nombre: req.user.usuario_nombre_completo || req.user.nombre || 'Usuario',
    usuario: req.user.usuario_usuario || req.user.usuario || 'unknown',
    roleId: req.user.fk_role_id || req.user.roleId || req.user.role_id,
    isAdmin: req.user.fk_role_id === 1 || req.user.roleId === 1 || req.user.role_nombre === "Administrador"
  };
};

// MODIFICAR la exportación para incluir las nuevas funciones
module.exports = { 
  verifyToken, 
  isAdmin,
  getUserId,
  getUserInfo 
};




//module.exports = { verifyToken, isAdmin };

// V1 Middleware para verificar si es administrador
// const isAdmin = (req, res, next) => {
//     if (req.user.role !== 'Administrador') { //Administrador
//         return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador' });
//     }
//     next();
// };

// // middleware/authMiddleware.js
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// function verifyToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   // esperar: "Bearer <token>"
//   const token = authHeader && authHeader.split(' ')[1];
//   if (!token) return res.status(401).json({ error: 'No token proporcionado' });

//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) return res.status(403).json({ error: 'Token inválido' });
//     req.user = user; // adjunta datos decodificados
//     next();
//   });
// }

// module.exports = { verifyToken };
