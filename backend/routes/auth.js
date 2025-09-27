const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { usuario_usuario, usuario_password, usuario, password } = req.body;

    // Usa el formato que venga del frontend
    const userLogin = usuario_usuario || usuario;
    const userPassword = usuario_password || password;

    if (!userLogin || !userPassword) {
      return res.status(400).json({ message: "Faltan credenciales" });
    }

    // Query mejorada que incluye el JOIN con la tabla de roles
    const [rows] = await db.query(
      `SELECT 
        u.pk_usuario_id,
        u.usuario_nombre_completo,
        u.usuario_usuario,
        u.usuario_password,
        u.fk_role_id,
        r.role_nombre
      FROM tbl_usuario u
      INNER JOIN tbl_role r ON u.fk_role_id = r.pk_role_id
      WHERE u.usuario_usuario = ?`,
      [userLogin]
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ error: "Usuario o contraseña incorrectos" });
    }

    const user = rows[0];

    // Comparar password - CORRIGIDO: usar userPassword en lugar de usuario_password
    const match = await bcrypt.compare(userPassword, user.usuario_password);
    if (!match) {
      return res
        .status(401)
        .json({ error: "Usuario o contraseña incorrectos" });
    }

    // Payload del token con ESTRUCTURA CONSISTENTE
    const payload = {
      pk_usuario_id: user.pk_usuario_id,
      usuario_usuario: user.usuario_usuario,
      usuario_nombre_completo: user.usuario_nombre_completo,
      fk_role_id: user.fk_role_id,
      role_nombre: user.role_nombre,
      
      // AGREGAMOS CAMPOS ALIAS para compatibilidad con frontend
      id: user.pk_usuario_id,
      usuario: user.usuario_usuario,
      nombre: user.usuario_nombre_completo,
      roleId: user.fk_role_id,
      role: user.role_nombre
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    });

    // Respuesta con estructura consistente
    res.json({
      message: "Login exitoso",
      token,
      user: payload // Enviamos el payload completo con todos los alias
    });

  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// ENDPOINT VERIFY CORREGIDO - Este era uno de los problemas principales
router.get("/verify", verifyToken, async (req, res) => {
  try {
    // req.user contiene el payload decodificado del JWT
    // Lo devolvemos con la MISMA ESTRUCTURA que en el login
    res.json({
      valid: true,
      user: {
        pk_usuario_id: req.user.pk_usuario_id,
        usuario_usuario: req.user.usuario_usuario,
        usuario_nombre_completo: req.user.usuario_nombre_completo,
        fk_role_id: req.user.fk_role_id,
        role_nombre: req.user.role_nombre,
        
        // Campos alias para compatibilidad
        id: req.user.pk_usuario_id || req.user.id,
        usuario: req.user.usuario_usuario || req.user.usuario,
        nombre: req.user.usuario_nombre_completo || req.user.nombre,
        roleId: req.user.fk_role_id || req.user.roleId,
        role: req.user.role_nombre || req.user.role
      }
    });
  } catch (error) {
    console.error("Error en verify:", error);
    res.status(500).json({ message: "Error al verificar token" });
  }
});

module.exports = router;