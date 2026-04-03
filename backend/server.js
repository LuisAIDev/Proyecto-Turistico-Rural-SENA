import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import usuariosRoutes from './src/routes/usuarios-routes.js';
import fincasRoutes from './src/routes/fincas-routes.js';
import reservasRoutes from './src/routes/reservas-routes.js';
import huespedesRoutes from './src/routes/huespedes-routes.js';
import serviciosRoutes from './src/routes/servicios.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json());

// Rutas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/fincas', fincasRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/huespedes', huespedesRoutes);
app.use('/api/servicios-adicionales', serviciosRoutes);

const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send('Servidor SENA RURAL corriendo en puerto ' + PORT);
});

app.listen(PORT, () => {
  console.log('Servidor corriendo en http://localhost:' + PORT);
  console.log('Rutas activas:');
  console.log('  -> /api/usuarios');
  console.log('  -> /api/fincas');
  console.log('  -> /api/reservas');
  console.log('  -> /api/huespedes');
  console.log('  -> /api/servicios-adicionales');
});
