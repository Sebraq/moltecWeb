// testBackend.js - Ejecutar con: node testBackend.js
const testLogin = async () => {
    try {
        console.log('🔄 Probando conexión al backend...\n');
        
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                usuario_usuario: 'jperez',      // Cambia estos valores por tus credenciales
                usuario_password: 'contraseña123'
            })
        });

        console.log('📡 Status:', response.status);
        console.log('📡 Status Text:', response.statusText);
        
        const data = await response.json();
        console.log('\n📦 Respuesta del servidor:');
        console.log(JSON.stringify(data, null, 2));
        
        if (response.ok) {
            console.log('\n✅ Login exitoso!');
            console.log('🔑 Token:', data.token ? 'Recibido' : 'No recibido');
            console.log('👤 Usuario:', data.user);
        } else {
            console.log('\n❌ Error en login:', data.message);
        }
    } catch (error) {
        console.error('\n🚨 Error de conexión:', error.message);
        console.log('\n💡 Verifica que:');
        console.log('1. El servidor backend esté corriendo en puerto 5000');
        console.log('2. La URL sea correcta');
        console.log('3. No haya problemas de CORS');
    }
};

// Ejecutar test
testLogin();