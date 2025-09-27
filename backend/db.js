// const mysql = require('mysql2');
// require('dotenv').config();

// // Crear el pool de conexiones
// const pool = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

// // Convertir a promesas para usar async/await
// const promisePool = pool.promise();

// promisePool.getConnection()
//   .then(conn => {
//     console.log("✅ Conexión a la base de datos establecida correctamente");
//     conn.release(); // liberamos la conexión
//   })
//   .catch(err => {
//     console.error("❌ Error al conectar a la base de datos:", err.message);
//   });
  

// module.exports = promisePool;
const mysql = require('mysql2');
require('dotenv').config();

// 🔗 POOL CON PUERTO RAILWAY CONFIGURADO
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 17479,  // 🔧 USA LA VARIABLE ENV
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 30000,    // 30 segundos timeout
    timeout: 30000,
    reconnect: true,
    ssl: {
        rejectUnauthorized: false  // 🔐 REQUERIDO PARA RAILWAY
    }
});

// Convertir a promesas para usar async/await
const promisePool = pool.promise();

promisePool.getConnection()
  .then(conn => {
    console.log("✅ Conexión a la base de datos establecida correctamente");
    console.log(`🌐 Host: ${process.env.DB_HOST}:17479`);
    console.log(`🗄️ Base de datos: ${process.env.DB_NAME}`);
    conn.release(); // liberamos la conexión
  })
  .catch(err => {
    console.error("❌ Error al conectar a la base de datos:", err.message);
    console.error("📋 Detalles completos:", err);
  });
  
module.exports = promisePool;