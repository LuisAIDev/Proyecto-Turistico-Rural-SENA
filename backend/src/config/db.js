import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// 1. Configuración de la base de datos
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// 2. Verificación de conexión
pool
  .connect()
  .then(() => {
    console.log('🔥 Conectado correctamente a PostgreSQL');
  })
  .catch((err) => {
    console.error('❌ Error conectando a PostgreSQL:', err);
  });

/**
 * 3. EXPORTACIÓN POR DEFECTO
 * Cambiamos 'export { pool }' por 'export default pool'
 * para que coincida con tus archivos de controladores.
 */
export default pool;