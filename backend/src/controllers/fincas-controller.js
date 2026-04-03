import pool from '../config/db.js';

const fincasController = {
  getAll: async (req, res) => {
    try {
      const query = `
        SELECT a.*, 
        COALESCE(json_agg(s.*) FILTER (WHERE s.id IS NOT NULL), '[]') AS servicios
        FROM alojamientos a
        LEFT JOIN alojamiento_servicios aser ON a.id = aser.alojamiento_id
        LEFT JOIN servicios_adicionales s ON aser.servicio_id = s.id
        GROUP BY a.id ORDER BY a.id ASC
      `;
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error('❌ Error al obtener alojamientos:', error.message);
      res.status(500).json({ error: 'Error al obtener la lista de fincas' });
    }
  },

  create: async (req, res) => {
    const { nombre, ubicacion, descripcion, capacidad, precio_noche, servicios } = req.body;
    try {
      await pool.query('BEGIN');
      const queryFinca = `
        INSERT INTO alojamientos (nombre, ubicacion, descripcion, capacidad, precio_noche, estado, usuario_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
      `;
      // CAMBIO DEFINITIVO: Usamos ID 1
      const resultFinca = await pool.query(queryFinca, [nombre, ubicacion, descripcion, capacidad, precio_noche, 'disponible', 1]);
      
      if (servicios && servicios.length > 0) {
        await pool.query(`INSERT INTO alojamiento_servicios (alojamiento_id, servicio_id) SELECT $1, unnest($2::int[])`, [resultFinca.rows[0].id, servicios]);
      }
      await pool.query('COMMIT');
      res.status(201).json(resultFinca.rows[0]);
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('❌ Error al crear finca:', error.message);
      res.status(500).json({ error: 'Error interno' });
    }
  }
};

export default fincasController;