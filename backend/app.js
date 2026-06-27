import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import usuariosRoutes from './src/routes/usuarios-routes.js';
import fincasRoutes from './src/routes/fincas-routes.js';
import reservasRoutes from './src/routes/reservas-routes.js';
import huespedesRoutes from './src/routes/huespedes-routes.js';
import serviciosRoutes from './src/routes/servicios.js';
import pagosRoutes from './src/routes/pagos-routes.js';
import publicRoutes from './src/routes/public-routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
  res.send('Servidor SENA RURAL corriendo en puerto ' + PORT);
});

app.use('/api/public', publicRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/fincas', fincasRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/huespedes', huespedesRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/pagos', pagosRoutes);

app.use((req, res, next) => {
  res.status(404).json({ error: 'Ruta no encontrada en el ecosistema SENA RURAL' });
});

app.use((err, req, res, next) => {
  console.error('Error detectado:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

export default app;
