// 🔐 SCRIPT PARA HASHEAR CONTRASEÑAS EXISTENTES - MOLTEC S.A.
require('dotenv').config();
const pool = require('./db');
const bcrypt = require('bcrypt');

// 🛡️ CONFIGURACIÓN DE SEGURIDAD
const SALT_ROUNDS = 12; // Mayor seguridad (recomendado para producción)

/**
 * 🔍 Función para verificar si una contraseña ya está hasheada
 */
const esPasswordHasheada = (password) => {
    // bcrypt hashes empiezan con $2a$, $2b$, $2x$, $2y$
    return typeof password === 'string' && password.match(/^\$2[abyxy]?\$/);
};

/**
 * 🧪 Función para probar la conexión antes de empezar
 */
const probarConexion = async () => {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as total FROM tbl_usuario');
        console.log(`✅ Conexión exitosa. Usuarios encontrados: ${rows[0].total}`);
        return true;
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        return false;
    }
};

/**
 * 🔐 Función principal para hashear contraseñas
 */
const hashearContrasenas = async () => {
    console.log('🚀 Iniciando proceso de hasheo de contraseñas...\n');
    
    try {
        // 🧪 Probar conexión
        const conexionOk = await probarConexion();
        if (!conexionOk) {
            throw new Error('No se puede conectar a la base de datos');
        }

        // 🔍 Obtener todos los usuarios
        console.log('📋 Obteniendo usuarios de la base de datos...');
        const [users] = await pool.query(`
            SELECT 
                pk_usuario_id, 
                usuario_password,
                usuario_usuario,
                usuario_nombre_completo 
            FROM tbl_usuario 
            ORDER BY pk_usuario_id
        `);

        if (users.length === 0) {
            console.log('⚠️  No se encontraron usuarios en la base de datos');
            return;
        }

        console.log(`👥 Se encontraron ${users.length} usuarios\n`);

        let procesados = 0;
        let yaHasheados = 0;
        let nuevosHasheados = 0;

        // 🔄 Procesar cada usuario
        for (const user of users) {
            const { pk_usuario_id, usuario_password, usuario_usuario, usuario_nombre_completo } = user;
            
            console.log(`🔍 Procesando usuario ID ${pk_usuario_id} (${usuario_usuario})...`);

            // ✅ Verificar si ya está hasheada
            if (esPasswordHasheada(usuario_password)) {
                console.log(`   ✅ Password ya está hasheada, omitiendo...`);
                yaHasheados++;
            } else {
                try {
                    console.log(`   🔐 Hasheando password...`);
                    
                    // 🔒 Hashear la contraseña
                    const passwordHasheada = await bcrypt.hash(usuario_password, SALT_ROUNDS);
                    
                    // 💾 Actualizar en la base de datos
                    await pool.query(
                        `UPDATE tbl_usuario 
                         SET usuario_password = ? 
                         WHERE pk_usuario_id = ?`,
                        [passwordHasheada, pk_usuario_id]
                    );
                    
                    console.log(`   ✅ Password hasheada y actualizada exitosamente`);
                    nuevosHasheados++;
                    
                } catch (hashError) {
                    console.error(`   ❌ Error al hashear usuario ${pk_usuario_id}:`, hashError.message);
                }
            }
            
            procesados++;
            console.log(''); // Línea en blanco para separar
        }

        // 📊 Resumen final
        console.log('🎉 ¡PROCESO COMPLETADO!\n');
        console.log('📊 RESUMEN:');
        console.log(`   👥 Total usuarios procesados: ${procesados}`);
        console.log(`   ✅ Ya tenían hash: ${yaHasheados}`);
        console.log(`   🔐 Nuevos hasheados: ${nuevosHasheados}`);
        console.log(`   ❌ Errores: ${procesados - yaHasheados - nuevosHasheados}`);

        // 🧪 Verificar que el proceso fue exitoso
        if (nuevosHasheados > 0) {
            console.log('\n🧪 Verificando resultado...');
            const [verificacion] = await pool.query(`
                SELECT COUNT(*) as total_hasheados 
                FROM tbl_usuario 
                WHERE usuario_password REGEXP '^\\$2[abyxy]?\\$'
            `);
            console.log(`✅ Usuarios con password hasheada: ${verificacion[0].total_hasheados}/${users.length}`);
        }

    } catch (error) {
        console.error('\n❌ ERROR CRÍTICO en el proceso de hasheo:', error.message);
        console.error('📋 Stack trace:', error.stack);
        process.exit(1);
    } finally {
        // 🔚 Cerrar conexión
        console.log('\n🔚 Cerrando conexiones...');
        await pool.end();
        console.log('✅ Proceso finalizado correctamente');
        process.exit(0);
    }
};

/**
 * 🧪 Función para probar un login después del hasheo
 */
const probarLogin = async (usuario, passwordTextoPlano) => {
    try {
        const [rows] = await pool.query(
            'SELECT usuario_password FROM tbl_usuario WHERE usuario_usuario = ?',
            [usuario]
        );
        
        if (rows.length === 0) {
            console.log('❌ Usuario no encontrado');
            return false;
        }
        
        const resultado = await bcrypt.compare(passwordTextoPlano, rows[0].usuario_password);
        console.log(`🧪 Prueba de login para ${usuario}:`, resultado ? '✅ ÉXITO' : '❌ FALLÓ');
        return resultado;
        
    } catch (error) {
        console.error('❌ Error en prueba de login:', error.message);
        return false;
    }
};

// 🚀 EJECUTAR EL SCRIPT
console.log('🔐 SCRIPT DE HASHEO DE CONTRASEÑAS - MOLTEC S.A.');
console.log('=====================================\n');

// Verificar dependencias
if (!bcrypt) {
    console.error('❌ bcrypt no está instalado. Ejecuta: npm install bcrypt');
    process.exit(1);
}

// Ejecutar proceso principal
hashearContrasenas();

// 📤 Exportar funciones para uso en otros módulos
module.exports = {
    hashearContrasenas,
    probarLogin,
    esPasswordHasheada
};