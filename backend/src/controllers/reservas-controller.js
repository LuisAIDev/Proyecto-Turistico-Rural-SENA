import pool from '../config/db.js';

const reservasController = {

  /* =====================================================
     1. OBTENER TODAS LAS RESERVAS
  ===================================================== */
  getAll: async (req, res) => {
    try {
      const query = `
        SELECT 
          r.id,
          r.fecha_entrada,
          r.fecha_salida,
          r.estado,
          r.total_pago,
          r.noches,
          h.nombre AS nombre_cliente,
          a.nombre AS alojamiento_nombre,
          a.precio_noche
        FROM reservas r
        LEFT JOIN huespedes h ON r.huesped_id = h.id
        LEFT JOIN alojamientos a ON r.alojamiento_id = a.id
        ORDER BY r.id DESC
      `;

      const result = await pool.query(query);
      res.json(result.rows);

    } catch (error) {
      console.error('❌ Error al obtener reservas:', error.message);
      res.status(500).json({ error: 'Error al obtener reservas' });
    }
  },


  /* =====================================================
     2. CREAR NUEVA RESERVA (CON CONTROL REAL DE FECHAS)
  ===================================================== */
  create: async (req, res) => {

    const { alojamiento_id, huesped_id, fecha_entrada, fecha_salida } = req.body;

    if (!alojamiento_id || !huesped_id || !fecha_entrada || !fecha_salida) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    try {

      const fechaInicio = new Date(fecha_entrada);
      const fechaFin = new Date(fecha_salida);

      if (fechaFin <= fechaInicio) {
        return res.status(400).json({
          error: 'La fecha de salida debe ser mayor que la de entrada'
        });
      }

      /* ============================
         VALIDAR DISPONIBILIDAD
         No permite fechas cruzadas
      ============================ */
      const existeReserva = await pool.query(`
        SELECT 1 FROM reservas
        WHERE alojamiento_id = $1
        AND estado != 'cancelada'
        AND (
          fecha_entrada < $3
          AND fecha_salida > $2
        )
      `, [alojamiento_id, fecha_entrada, fecha_salida]);

      if (existeReserva.rowCount > 0) {
        return res.status(400).json({
          error: 'El alojamiento ya está reservado en ese rango de fechas'
        });
      }

      /* ============================
         OBTENER PRECIO
      ============================ */
      const alojamiento = await pool.query(
        'SELECT precio_noche FROM alojamientos WHERE id = $1',
        [alojamiento_id]
      );

      if (alojamiento.rowCount === 0) {
        return res.status(404).json({ error: 'Alojamiento no encontrado' });
      }

      const precio = parseFloat(alojamiento.rows[0].precio_noche);

      const noches = Math.ceil(
        (fechaFin - fechaInicio) / (1000 * 60 * 60 * 24)
      );

      const total = precio * noches;

      /* ============================
         INSERTAR RESERVA
      ============================ */
      const insert = await pool.query(`
        INSERT INTO reservas
        (alojamiento_id, huesped_id, usuario_id, fecha_entrada, fecha_salida, total_pago, noches, estado)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *
      `, [
        alojamiento_id,
        huesped_id,
        req.user?.id || 1, // usa el usuario autenticado si existe
        fecha_entrada,
        fecha_salida,
        total,
        noches,
        'pendiente'
      ]);

      res.status(201).json(insert.rows[0]);

    } catch (error) {
      console.error('❌ Error al crear reserva:', error.message);
      res.status(500).json({ error: 'Error al crear la reserva' });
    }
  },


  /* =====================================================
     3. ACTUALIZAR ESTADO (CONFIRMAR / CANCELAR)
  ===================================================== */
  updateStatus: async (req, res) => {

    const { id, accion } = req.params;

    let nuevoEstado;

    if (accion === 'confirmar') {
      nuevoEstado = 'confirmada';
    } else if (accion === 'cancelar') {
      nuevoEstado = 'cancelada';
    } else {
      return res.status(400).json({ error: 'Acción no válida' });
    }

    try {
      const result = await pool.query(
        'UPDATE reservas SET estado = $1 WHERE id = $2 RETURNING *',
        [nuevoEstado, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      res.json(result.rows[0]);

    } catch (error) {
      console.error('❌ Error actualizando estado:', error.message);
      res.status(500).json({ error: 'Error al actualizar estado' });
    }
  },


  /* =====================================================
     4. ELIMINAR RESERVA
  ===================================================== */
  delete: async (req, res) => {

    const { id } = req.params;

    try {
      const result = await pool.query(
        'DELETE FROM reservas WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      res.json({ message: 'Reserva eliminada correctamente' });

    } catch (error) {
      console.error('❌ Error al eliminar reserva:', error.message);
      res.status(500).json({ error: 'Error al eliminar reserva' });
    }
  },


  /* =====================================================
     5. DASHBOARD ESTADÍSTICAS PROFESIONAL
  ===================================================== */
  getDashboardStats: async (req, res) => {

    try {

      const [
        total,
        confirmadas,
        pendientes,
        canceladas,
        ingresos,
        porMes
      ] = await Promise.all([

        pool.query("SELECT COUNT(*) FROM reservas"),

        pool.query("SELECT COUNT(*) FROM reservas WHERE estado = 'confirmada'"),

        pool.query("SELECT COUNT(*) FROM reservas WHERE estado = 'pendiente'"),

        pool.query("SELECT COUNT(*) FROM reservas WHERE estado = 'cancelada'"),

        pool.query("SELECT COALESCE(SUM(total_pago),0) as total FROM reservas WHERE estado = 'confirmada'"),

        pool.query(`
          SELECT 
            TO_CHAR(fecha_entrada, 'YYYY-MM') as mes,
            COALESCE(SUM(total_pago),0) as total
          FROM reservas
          WHERE estado = 'confirmada'
          GROUP BY mes
          ORDER BY mes ASC
        `)
      ]);

      res.json({
        total: parseInt(total.rows[0].count),
        confirmadas: parseInt(confirmadas.rows[0].count),
        pendientes: parseInt(pendientes.rows[0].count),
        canceladas: parseInt(canceladas.rows[0].count),
        ingresos: parseFloat(ingresos.rows[0].total),
        porMes: porMes.rows
      });

    } catch (error) {
      console.error('❌ Error dashboard:', error.message);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }

};

export default reservasController;