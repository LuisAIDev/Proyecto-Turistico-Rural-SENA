import pool from '../config/db.js';
import { differenceInCalendarDays, isFuture, parseISO } from 'date-fns';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ensureValoracionesTable = async () => {
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

const publicController = {
  getAlojamientos: async (req, res) => {
    try {
      await ensureValoracionesTable();
      const result = await pool.query(`
        SELECT
          a.id,
          a.nombre,
          a.ubicacion,
          a.descripcion,
          a.capacidad,
          a.precio_noche,
          a.estado,
          a.imagenes,
          COALESCE(json_agg(s.*) FILTER (WHERE s.id IS NOT NULL), '[]') AS servicios,
          COALESCE(ROUND(AVG(v.calificacion), 1), 0)::float AS rating_promedio,
          COUNT(v.id)::int AS total_valoraciones
        FROM alojamientos a
        LEFT JOIN alojamiento_servicios aser ON a.id = aser.alojamiento_id
        LEFT JOIN servicios_adicionales s ON aser.servicio_id = s.id
        LEFT JOIN reservas r ON r.alojamiento_id = a.id AND r.estado = 'confirmada'
        LEFT JOIN valoraciones v ON v.reserva_id = r.id
        WHERE a.estado = 'disponible'
        GROUP BY a.id
        ORDER BY a.precio_noche ASC
      `);

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error('Error al cargar alojamientos públicos:', error.message);
      res.status(500).json({
        success: false,
        error: 'No se pudo cargar el catálogo de alojamientos.',
      });
    }
  },

  crearSolicitudReserva: async (req, res) => {
    const {
      alojamiento_id,
      nombre,
      email,
      telefono,
      documento,
      fecha_entrada,
      fecha_salida,
    } = req.body;

    if (!alojamiento_id || !nombre || !telefono || !fecha_entrada || !fecha_salida) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, teléfono, alojamiento y fechas son obligatorios.',
      });
    }

    if (email && !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'El formato del correo electrónico no es válido.',
      });
    }

    const fechaInicio = parseISO(fecha_entrada);
    const fechaFin = parseISO(fecha_salida);

    if (fechaFin <= fechaInicio) {
      return res.status(400).json({
        success: false,
        error: 'La fecha de salida debe ser mayor que la fecha de entrada.',
      });
    }

    if (!isFuture(fechaInicio)) {
      return res.status(400).json({
        success: false,
        error: 'La fecha de entrada debe ser a partir de mañana.',
      });
    }

    const noches = differenceInCalendarDays(fechaFin, fechaInicio);

    if (noches <= 0) {
      return res.status(400).json({
        success: false,
        error: 'La estadía debe ser de al menos 1 noche.',
      });
    }

    try {
      await pool.query('BEGIN');

      const alojamiento = await pool.query(
        `SELECT id, nombre, precio_noche
         FROM alojamientos
         WHERE id = $1 AND estado = 'disponible'`,
        [alojamiento_id],
      );

      if (alojamiento.rowCount === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'El alojamiento seleccionado no está disponible.',
        });
      }

      const cruce = await pool.query(
        `SELECT 1
         FROM reservas
         WHERE alojamiento_id = $1
           AND estado != 'cancelada'
           AND fecha_entrada < $3
           AND fecha_salida > $2`,
        [alojamiento_id, fecha_entrada, fecha_salida],
      );

      if (cruce.rowCount > 0) {
        await pool.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: 'Ese alojamiento ya tiene una reserva en las fechas seleccionadas.',
        });
      }

      let huesped;

      if (documento && documento.trim() !== '') {
        const existente = await pool.query(
          'SELECT id FROM huespedes WHERE documento = $1',
          [documento],
        );

        if (existente.rowCount > 0) {
          const actualizado = await pool.query(
            `UPDATE huespedes
             SET nombre = $1, email = $2, telefono = $3
             WHERE id = $4
             RETURNING *`,
            [nombre, email || null, telefono, existente.rows[0].id],
          );
          huesped = actualizado.rows[0];
        }
      }

      if (!huesped) {
        const creado = await pool.query(
          `INSERT INTO huespedes (nombre, email, telefono, documento)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [nombre, email || null, telefono, documento || null],
        );
        huesped = creado.rows[0];
      }

      const precio = Number(alojamiento.rows[0].precio_noche);
      const total = Math.round(precio * noches * 100) / 100;

      const reserva = await pool.query(
        `INSERT INTO reservas
         (alojamiento_id, huesped_id, usuario_id, fecha_entrada, fecha_salida, total_pago, noches, estado)
         VALUES ($1, $2, NULL, $3, $4, $5, $6, 'pendiente')
         RETURNING *`,
        [alojamiento_id, huesped.id, fecha_entrada, fecha_salida, total, noches],
      );

      await pool.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Solicitud de reserva recibida. El equipo la confirmará pronto.',
        data: {
          reserva: reserva.rows[0],
          huesped,
          alojamiento: alojamiento.rows[0],
        },
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error al crear solicitud pública:', error.message);
      res.status(500).json({
        success: false,
        error: 'No se pudo registrar la solicitud de reserva.',
      });
    }
  },

  consultarReservasCliente: async (req, res) => {
    try {
      const { email, documento } = req.body;

      if (!email && !documento) {
        return res.status(400).json({
          success: false,
          error: 'Debes proporcionar tu correo electrónico o número de documento.',
        });
      }

      let huespedQuery;
      let params;
      if (documento) {
        huespedQuery = 'SELECT id, nombre FROM huespedes WHERE documento = $1';
        params = [documento.trim()];
      } else {
        huespedQuery = 'SELECT id, nombre FROM huespedes WHERE email = $1';
        params = [email.trim().toLowerCase()];
      }

      const huesped = await pool.query(huespedQuery, params);

      if (huesped.rowCount === 0) {
        return res.json({
          success: true,
          data: [],
          mensaje: 'No encontramos reservas asociadas a ese dato.',
        });
      }

      const reservas = await pool.query(`
        SELECT
          r.id,
          r.fecha_entrada,
          r.fecha_salida,
          r.estado,
          r.estado_pago,
          r.total_pago,
          r.noches,
          a.nombre AS alojamiento_nombre,
          a.id AS alojamiento_id,
          v.id AS valoracion_id,
          v.calificacion AS valoracion_calificacion
        FROM reservas r
        JOIN alojamientos a ON r.alojamiento_id = a.id
        LEFT JOIN valoraciones v ON v.reserva_id = r.id
        WHERE r.huesped_id = $1
        ORDER BY r.created_at DESC
      `, [huesped.rows[0].id]);

      res.json({
        success: true,
        data: reservas.rows,
        huesped: huesped.rows[0],
      });
    } catch (error) {
      console.error('Error al consultar reservas del cliente:', error.message);
      res.status(500).json({
        success: false,
        error: 'Error al consultar tus reservas. Intenta de nuevo.',
      });
    }
  },
};

export default publicController;
