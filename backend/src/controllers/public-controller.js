import pool from '../config/db.js';

const calcularNoches = (fechaEntrada, fechaSalida) => {
  const inicio = new Date(fechaEntrada);
  const fin = new Date(fechaSalida);
  return Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
};

const publicController = {
  getAlojamientos: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          a.id,
          a.nombre,
          a.ubicacion,
          a.descripcion,
          a.capacidad,
          a.precio_noche,
          a.estado,
          COALESCE(json_agg(s.*) FILTER (WHERE s.id IS NOT NULL), '[]') AS servicios
        FROM alojamientos a
        LEFT JOIN alojamiento_servicios aser ON a.id = aser.alojamiento_id
        LEFT JOIN servicios_adicionales s ON aser.servicio_id = s.id
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

    const noches = calcularNoches(fecha_entrada, fecha_salida);

    if (Number.isNaN(noches) || noches <= 0) {
      return res.status(400).json({
        success: false,
        error: 'La fecha de salida debe ser mayor que la fecha de entrada.',
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

      if (documento) {
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
      const total = precio * noches;

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
};

export default publicController;
