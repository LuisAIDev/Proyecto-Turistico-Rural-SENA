import pool from '../config/db.js';
import { differenceInCalendarDays, isFuture, parseISO } from 'date-fns';

const reservasController = {

  /* =====================================================
     1. OBTENER TODAS LAS RESERVAS (CON PAGINACIÓN)
  ===================================================== */
  getAll: async (req, res) => {
    try {
      const pagina = Math.max(parseInt(req.query.pagina) || 1, 1);
      const limite = Math.min(Math.max(parseInt(req.query.limite) || 50, 1), 200);
      const offset = (pagina - 1) * limite;

      await pool.query(`
        ALTER TABLE reservas
        ADD COLUMN IF NOT EXISTS estado_pago VARCHAR(30) NOT NULL DEFAULT 'Pendiente',
        ADD COLUMN IF NOT EXISTS transaccion_id VARCHAR(50) NULL
      `);

      const countResult = await pool.query('SELECT COUNT(*) FROM reservas');
      const total = parseInt(countResult.rows[0].count);

      const query = `
        SELECT 
          r.id,
          r.fecha_entrada,
          r.fecha_salida,
          r.estado,
          r.estado_pago,
          r.transaccion_id,
          r.total_pago,
          r.noches,
          h.nombre AS nombre_cliente,
          a.nombre AS alojamiento_nombre,
          a.precio_noche
        FROM reservas r
        LEFT JOIN huespedes h ON r.huesped_id = h.id
        LEFT JOIN alojamientos a ON r.alojamiento_id = a.id
        ORDER BY r.id DESC
        LIMIT $1 OFFSET $2
      `;

      const result = await pool.query(query, [limite, offset]);

      res.json({
        data: result.rows,
        paginacion: {
          pagina,
          limite,
          total,
          total_paginas: Math.ceil(total / limite),
        },
      });

    } catch (error) {
      console.error('ERROR CRÍTICO EN GET RESERVAS:', error.message);
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

      const fechaInicio = parseISO(fecha_entrada);
      const fechaFin = parseISO(fecha_salida);

      if (fechaFin <= fechaInicio) {
        return res.status(400).json({
          error: 'La fecha de salida debe ser mayor que la de entrada'
        });
      }

      if (!isFuture(fechaInicio)) {
        return res.status(400).json({
          error: 'La fecha de entrada debe ser a partir de mañana'
        });
      }

      const existeReserva = await pool.query(`
         SELECT 1 FROM reservas
         WHERE alojamiento_id = $1
         AND estado != 'cancelada'
         AND fecha_entrada < $3
         AND fecha_salida > $2
       `, [alojamiento_id, fecha_entrada, fecha_salida]);

      if (existeReserva.rowCount > 0) {
        return res.status(400).json({
          error: 'El alojamiento ya está reservado en ese rango de fechas'
        });
      }

      const alojamiento = await pool.query(
        'SELECT precio_noche FROM alojamientos WHERE id = $1',
        [alojamiento_id]
      );

      if (alojamiento.rowCount === 0) {
        return res.status(404).json({ error: 'Alojamiento no encontrado' });
      }

      const precio = Number(alojamiento.rows[0].precio_noche);
      const noches = differenceInCalendarDays(fechaFin, fechaInicio);
      const total = Math.round(precio * noches * 100) / 100;

      if (noches <= 0) {
        return res.status(400).json({ error: 'La estadía debe ser de al menos 1 noche' });
      }

      const insert = await pool.query(`
        INSERT INTO reservas
        (alojamiento_id, huesped_id, usuario_id, fecha_entrada, fecha_salida, total_pago, noches, estado)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *
      `, [
        alojamiento_id,
        huesped_id,
        req.usuario?.id ?? null,
        fecha_entrada,
        fecha_salida,
        total,
        noches,
        'pendiente'
      ]);

      res.status(201).json(insert.rows[0]);

    } catch (error) {
      console.error('Error al crear reserva:', error.message);
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
      const existente = await pool.query(
        'SELECT estado FROM reservas WHERE id = $1',
        [id]
      );

      if (existente.rowCount === 0) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      const estadoActual = existente.rows[0].estado;
      if (estadoActual === nuevoEstado) {
        return res.status(400).json({
          error: `La reserva ya está ${estadoActual}`
        });
      }

      if (estadoActual === 'cancelada') {
        return res.status(400).json({
          error: 'No se puede cambiar el estado de una reserva cancelada'
        });
      }

      const result = await pool.query(
        'UPDATE reservas SET estado = $1 WHERE id = $2 RETURNING *',
        [nuevoEstado, id]
      );

      res.json(result.rows[0]);

    } catch (error) {
      console.error('Error actualizando estado:', error.message);
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
      console.error('Error al eliminar reserva:', error.message);
      res.status(500).json({ error: 'Error al eliminar reserva' });
    }
  },


  /* =====================================================
     5. DASHBOARD ESTADÍSTICAS
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
      console.error('Error dashboard:', error.message);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  },


  /* =====================================================
     6. FACTURACIÓN - DATOS PARA EL MÓDULO DE CAJA
  ===================================================== */
  getFacturacion: async (req, res) => {
    try {
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

      const [reservasRes, pagosRes] = await Promise.all([
        pool.query(`
          SELECT
            r.id, r.fecha_entrada, r.fecha_salida, r.estado, r.total_pago,
            r.noches, r.created_at,
            h.nombre AS huesped_nombre,
            a.nombre AS finca_nombre
          FROM reservas r
          LEFT JOIN huespedes h ON r.huesped_id = h.id
          LEFT JOIN alojamientos a ON r.alojamiento_id = a.id
        `),
        pool.query(`SELECT * FROM pagos_manuales`),
      ]);

      const desdeReservas = reservasRes.rows.map((r) => ({
        id: `res-${r.id}`,
        fecha: r.fecha_entrada,
        cliente: r.huesped_nombre || 'Cliente General',
        finca: r.finca_nombre,
        monto: parseFloat(r.total_pago || 0),
        estado: r.estado?.toLowerCase() === 'confirmada' ? 'completado' : r.estado?.toLowerCase() === 'cancelada' ? 'cancelado' : 'pendiente',
        metodo: 'Transferencia',
        tipo: 'reserva',
        created_at: r.created_at,
      }));

      const desdePagos = pagosRes.rows.map((p) => ({
        id: `pag-${p.id}`,
        fecha: p.created_at ? p.created_at.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        cliente: p.cliente,
        finca: p.alojamiento_nombre || 'Pago Directo',
        monto: parseFloat(p.monto || 0),
        estado: p.estado,
        metodo: 'Efectivo',
        tipo: 'manual',
        created_at: p.created_at,
      }));

      const transacciones = [...desdeReservas, ...desdePagos]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      const totalRecaudado = transacciones
        .filter((t) => t.estado === 'completado')
        .reduce((acc, curr) => acc + curr.monto, 0);

      const pendientes = transacciones.filter((t) => t.estado === 'pendiente').length;
      const ahora = new Date();
      const transaccionesMes = transacciones.filter((t) => {
        const fecha = new Date(t.fecha);
        return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
      }).length;

      res.json({
        transacciones,
        resumen: {
          totalRecaudado,
          pagosPendientes: pendientes,
          transaccionesMes,
        },
      });
    } catch (error) {
      console.error('Error al obtener facturación:', error.message);
      res.status(500).json({ error: 'Error al obtener datos de facturación' });
    }
  },

  /* =====================================================
     7. KPI RENTABILIDAD - ALOJAMIENTO ESTRELLA
  ===================================================== */
  getKpiRentabilidad: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          a.nombre AS finca,
          COALESCE(SUM(r.total_pago), 0) AS total_generado
        FROM reservas r
        JOIN alojamientos a ON r.alojamiento_id = a.id
        WHERE r.estado = 'confirmada'
        GROUP BY a.id, a.nombre
        ORDER BY total_generado DESC
        LIMIT 1
      `);

      if (result.rowCount === 0) {
        return res.json({ finca: null, total_generado: 0 });
      }

      res.json(result.rows[0]);

    } catch (error) {
      console.error('Error al obtener KPI rentabilidad:', error.message);
      res.status(500).json({ error: 'Error al calcular rentabilidad' });
    }
  }

};

export default reservasController;
