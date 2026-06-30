import pool from '../config/db.js';

const ensureTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pagos_manuales (
      id SERIAL PRIMARY KEY,
      cliente VARCHAR(200) NOT NULL,
      alojamiento_id INTEGER REFERENCES alojamientos(id) ON DELETE SET NULL,
      alojamiento_nombre VARCHAR(200),
      monto NUMERIC(12,2) NOT NULL CHECK (monto > 0),
      estado VARCHAR(30) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente','completado','cancelado')),
      descripcion TEXT,
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const ensureSandboxColumns = async () => {
  await pool.query(`
    ALTER TABLE reservas
    ADD COLUMN IF NOT EXISTS estado_pago VARCHAR(30) NOT NULL DEFAULT 'Pendiente',
    ADD COLUMN IF NOT EXISTS transaccion_id VARCHAR(50) NULL
  `);
};

const pagosController = {
  getAll: async (req, res) => {
    try {
      await ensureTable();
      const result = await pool.query(
        'SELECT * FROM pagos_manuales ORDER BY created_at DESC',
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error en pagos getAll:', err.message);
      res.status(500).json({ error: 'Error al obtener pagos' });
    }
  },

  create: async (req, res) => {
    try {
      await ensureTable();

      const { cliente, alojamiento_id, alojamiento_nombre, monto, estado, descripcion } = req.body;

      if (!cliente || typeof cliente !== 'string' || cliente.trim().length === 0) {
        return res.status(400).json({ error: 'El campo cliente es obligatorio' });
      }

      if (monto === undefined || monto === null || isNaN(Number(monto)) || Number(monto) <= 0) {
        return res.status(400).json({ error: 'El monto debe ser un número mayor a 0' });
      }

      const montoNumerico = Math.round(parseFloat(monto) * 100) / 100;

      const estadosValidos = ['pendiente', 'completado', 'cancelado'];
      const estadoFinal = estado && estadosValidos.includes(estado.toLowerCase())
        ? estado.toLowerCase()
        : 'pendiente';

      const result = await pool.query(
        `INSERT INTO pagos_manuales (cliente, alojamiento_id, alojamiento_nombre, monto, estado, descripcion, usuario_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          cliente.trim(),
          alojamiento_id || null,
          alojamiento_nombre || null,
          montoNumerico,
          estadoFinal,
          descripcion || null,
          req.usuario?.id || null,
        ],
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error en pagos create:', err.message);
      if (err.code === '23503') {
        return res.status(400).json({ error: 'El alojamiento especificado no existe' });
      }
      res.status(500).json({ error: 'Error al registrar el pago' });
    }
  },

  procesar: async (req, res) => {
    try {
      await ensureSandboxColumns();

      const { reserva_id, monto, numero_tarjeta, nombre_titular, metodo_pago } = req.body;

      if (!reserva_id || !monto || !numero_tarjeta || !nombre_titular) {
        return res.status(400).json({ error: 'Faltan datos obligatorios: reserva_id, monto, numero_tarjeta, nombre_titular' });
      }

      const reserva = await pool.query(
        'SELECT id, estado, total_pago FROM reservas WHERE id = $1',
        [reserva_id]
      );

      if (reserva.rowCount === 0) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      if (reserva.rows[0].estado === 'cancelada') {
        return res.status(400).json({ error: 'No se puede procesar el pago de una reserva cancelada' });
      }

      if (reserva.rows[0].estado === 'confirmada') {
        return res.status(400).json({ error: 'La reserva ya está confirmada' });
      }

      const montoNumerico = Math.round(parseFloat(monto) * 100) / 100;
      if (montoNumerico <= 0) {
        return res.status(400).json({ error: 'El monto debe ser un número mayor a 0' });
      }

      const tarjetaLimpia = numero_tarjeta.replace(/\s+/g, '');
      if (!tarjetaLimpia.endsWith('4242')) {
        return res.status(400).json({ error: 'Tarjeta rechazada. Use una tarjeta de prueba que termine en 4242.' });
      }

      const transaccion_id = `TX-SENA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      await pool.query(
        `UPDATE reservas
         SET estado = 'confirmada',
             estado_pago = 'Pagada',
             transaccion_id = $2
         WHERE id = $1`,
        [reserva_id, transaccion_id]
      );

      res.json({
        success: true,
        transaccion_id,
        mensaje: 'Pago aprobado con éxito',
      });
    } catch (err) {
      console.error('Error al procesar pago sandbox:', err.message);
      res.status(500).json({ error: 'Error al procesar el pago' });
    }
  },
};

export default pagosController;
