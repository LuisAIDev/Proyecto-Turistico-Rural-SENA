import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const requiredDbVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD'];
const missingDbVars = requiredDbVars.filter((key) => !process.env[key]);
const usingDatabaseUrl = Boolean(process.env.DATABASE_URL);
const needsSsl =
  process.env.DB_SSL === 'true' ||
  process.env.NODE_ENV === 'production' ||
  process.env.DB_HOST?.includes('neon.tech');

if (!usingDatabaseUrl && missingDbVars.length > 0) {
  throw new Error(
    `Faltan variables de entorno de base de datos: ${missingDbVars.join(', ')}`,
  );
}

const dbConfig = usingDatabaseUrl
  ? {
      connectionString: process.env.DATABASE_URL,
    }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT) || 5432,
    };

if (needsSsl || usingDatabaseUrl) {
  dbConfig.ssl = {
    rejectUnauthorized: false,
  };
}

// 1. Configuración de la base de datos
export const pool = new Pool(dbConfig);

// 2. Verificación de conexión
pool
  .connect()
  .then((client) => {
    console.log('🔥 Conectado correctamente a PostgreSQL en la nube');
    client.release();
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
