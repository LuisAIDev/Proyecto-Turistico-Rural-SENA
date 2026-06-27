import app from './app.js';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log('✅ Rutas activas:');
  console.log('  -> /api/usuarios');
  console.log('  -> /api/public');
  console.log('  -> /api/fincas');
  console.log('  -> /api/reservas');
  console.log('  -> /api/huespedes');
  console.log('  -> /api/servicios');
});
