import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importación de rutas
import usuariosRoutes from './src/routes/usuarios-routes.js';
import fincasRoutes from './src/routes/fincas-routes.js';
import reservasRoutes from './src/routes/reservas-routes.js';
import huespedesRoutes from './src/routes/huespedes-routes.js';
import serviciosRoutes from './src/routes/servicios.js';

dotenv.config();

const app = express();

// Configuración de CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json());

// Rutas base
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/fincas', fincasRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/huespedes', huespedesRoutes);
// Cambiado a /servicios para que coincida con el Dashboard.jsx
app.use('/api/servicios', serviciosRoutes); 

const PORT = process.env.PORT || 4000;

// Middleware para capturar rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({ error: 'Ruta no encontrada en el ecosistema SENA RURAL' });
});

// Middleware de manejo de errores global (Evita que el servidor muera)
app.use((err, req, res, next) => {
  console.error('❌ Error detectado:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.get('/', (req, res) => {
  res.send('Servidor SENA RURAL corriendo en puerto ' + PORT);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log('✅ Rutas activas:');
  console.log('  -> /api/usuarios');
  console.log('  -> /api/fincas');
  console.log('  -> /api/reservas');
  console.log('  -> /api/huespedes');
  console.log('  -> /api/servicios'); // Actualizado
});