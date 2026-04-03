import { pool } from '../config/db.js';

/**
 * Modelo para gestionar la lógica de datos de las Reservas
 * Sincronizado con las columnas reales de pgAdmin (marzo 2026)
 */
const ReservaModel = {
  // 1. Obtener todas las reservas con JOIN a alojamientos
  getAll: async () => {
    const query = `
      SELECT 
        r.id, 
        r.nombre_cliente AS huesped_nombre, 
        r.fecha_entrada, 
        r.fecha_salida, 
        r.estado, 
        r.usuario_id,
        a.nombre AS finca_nombre
      FROM reservas r
      LEFT JOIN alojamientos a ON r.alojamiento_id = a.id
      ORDER BY r.id ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  // 2. Crear una nueva reserva usando nombre_cliente y usuario_id
  create: async (datos) => {
    const {
      usuario_id,
      nombre_cliente,
      alojamiento_id,
      fecha_entrada,
      fecha_salida,
    } = datos;

    const query = `
      INSERT INTO reservas 
      (usuario_id, nombre_cliente, alojamiento_id, fecha_entrada, fecha_salida, estado) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`;

    const values = [
      usuario_id || null,
      nombre_cliente,
      alojamiento_id,
      fecha_entrada,
      fecha_salida,
      'pendiente',
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // 3. Cambiar el estado
  updateStatus: async (id, nuevoEstado) => {
    const query = 'UPDATE reservas SET estado = $1 WHERE id = $2 RETURNING *';
    const { rows } = await pool.query(query, [nuevoEstado, id]);
    return rows[0];
  },

  // 4. Eliminar por ID
  delete: async (id) => {
    const query = 'DELETE FROM reservas WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  },
};

export default ReservaModel;
