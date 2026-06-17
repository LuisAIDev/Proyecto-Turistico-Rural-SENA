import pool from '../config/db.js';

const huespedesController = {
  /**
   * Obtiene todos los huéspedes ordenados por el registro más reciente
   */
  getAll: async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM huespedes ORDER BY id DESC',
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error en getAll:', err);
      res.status(500).json({ error: 'Error al obtener la lista de huéspedes' });
    }
  },

  /**
   * Registra un nuevo huésped en la base de datos
   */
  create: async (req, res) => {
    const { nombre, email, telefono, documento } = req.body;
    try {
      const query = `
        INSERT INTO huespedes (nombre, email, telefono, documento) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `;
      const result = await pool.query(query, [
        nombre,
        email,
        telefono,
        documento,
      ]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error en create:', err);
      if (err.code === '23505') {
        return res
          .status(400)
          .json({ error: 'Este número de documento ya está registrado.' });
      }
      res.status(500).json({ error: 'Error al registrar el huésped' });
    }
  },

  /**
   * Actualiza los datos de un huésped existente por su ID
   */
  update: async (req, res) => {
    const { id } = req.params;
    const { nombre, email, telefono, documento } = req.body;
    try {
      const query = `
        UPDATE huespedes 
        SET nombre = $1, email = $2, telefono = $3, documento = $4 
        WHERE id = $5 
        RETURNING *
      `;
      const result = await pool.query(query, [
        nombre,
        email,
        telefono,
        documento,
        id,
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Huésped no encontrado' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error en update:', err);
      res
        .status(500)
        .json({ error: 'Error al actualizar los datos del huésped' });
    }
  },

  /**
   * Elimina un huésped y maneja posibles errores de integridad referencial
   */
  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        'DELETE FROM huespedes WHERE id = $1 RETURNING *',
        [id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Huésped no encontrado' });
      }
      res.json({ message: 'Huésped eliminado correctamente' });
    } catch (err) {
      console.error('Error en delete:', err);
      res.status(500).json({
        error:
          'No se puede eliminar: el huésped tiene historial de reservas activo.',
      });
    }
  },
};

export default huespedesController;
