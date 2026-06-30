import pool from '../config/db.js';

const ensureTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS valoraciones (
      id SERIAL PRIMARY KEY,
      reserva_id INTEGER NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
      calificacion INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
      comentario TEXT,
      creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const valoracionesController = {
  crear: async (req, res) => {
    try {
      await ensureTable();

      const { reserva_id, calificacion, comentario } = req.body;

      if (!reserva_id || !calificacion) {
        return res.status(400).json({ error: 'Faltan datos obligatorios: reserva_id, calificacion' });
      }

      const nota = parseInt(calificacion);
      if (isNaN(nota) || nota < 1 || nota > 5) {
        return res.status(400).json({ error: 'La calificación debe ser un número entre 1 y 5' });
      }

      const reserva = await pool.query(
        'SELECT id, estado FROM reservas WHERE id = $1',
        [reserva_id]
      );

      if (reserva.rowCount === 0) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      if (reserva.rows[0].estado !== 'confirmada') {
        return res.status(400).json({ error: 'Solo se pueden calificar reservas confirmadas' });
      }

      const existente = await pool.query(
        'SELECT id FROM valoraciones WHERE reserva_id = $1',
        [reserva_id]
      );

      if (existente.rowCount > 0) {
        return res.status(400).json({ error: 'Esta reserva ya tiene una valoración registrada' });
      }

      const result = await pool.query(
        `INSERT INTO valoraciones (reserva_id, calificacion, comentario)
         VALUES ($1, $2, $3) RETURNING *`,
        [reserva_id, nota, comentario || null]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error al crear valoración:', err.message);
      if (err.code === '23503') {
        return res.status(400).json({ error: 'La reserva especificada no existe' });
      }
      res.status(500).json({ error: 'Error al registrar la valoración' });
    }
  },

  getPorAlojamiento: async (req, res) => {
    try {
      await ensureTable();

      const { alojamiento_id } = req.params;

      if (!alojamiento_id) {
        return res.status(400).json({ error: 'El ID del alojamiento es obligatorio' });
      }

      const result = await pool.query(`
        SELECT
          v.id,
          v.calificacion,
          v.comentario,
          v.creado_en,
          h.nombre AS huesped_nombre
        FROM valoraciones v
        JOIN reservas r ON v.reserva_id = r.id
        JOIN huespedes h ON r.huesped_id = h.id
        WHERE r.alojamiento_id = $1
        ORDER BY v.creado_en DESC
      `, [alojamiento_id]);

      const stats = await pool.query(`
        SELECT
          COUNT(*)::int AS total,
          COALESCE(ROUND(AVG(v.calificacion), 1), 0)::float AS promedio
        FROM valoraciones v
        JOIN reservas r ON v.reserva_id = r.id
        WHERE r.alojamiento_id = $1
      `, [alojamiento_id]);

      res.json({
        valoraciones: result.rows,
        estadisticas: stats.rows[0],
      });
    } catch (err) {
      console.error('Error al obtener valoraciones:', err.message);
      res.status(500).json({ error: 'Error al obtener valoraciones' });
    }
  },
};

export default valoracionesController;
