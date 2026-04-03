import { pool } from '../config/db.js';

/**
 * Modelo para gestionar la lógica de datos de Alojamiento (Fincas)
 */
const FincaModel = {
  // Obtener todas las fincas de la tabla alojamientos
  getAll: async () => {
    const query = 'SELECT * FROM alojamientos ORDER BY id ASC';
    const { rows } = await pool.query(query);
    return rows;
  },

  // Buscar una finca específica por su ID
  getById: async (id) => {
    const query = 'SELECT * FROM alojamientos WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  // Crear un nuevo registro de alojamiento
  create: async (datos) => {
    const { nombre, descripcion, precio_noche, capacidad } = datos;
    const query = `
      INSERT INTO alojamientos (nombre, descripcion, precio_noche, capacidad) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *`;
    const values = [nombre, descripcion, precio_noche, capacidad];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // Eliminar una finca
  delete: async (id) => {
    const query = 'DELETE FROM alojamientos WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  },
};

export default FincaModel;
