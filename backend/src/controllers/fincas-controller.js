import pool from '../config/db.js';

const fincasController = {
  // 1. Obtener todas las fincas con sus servicios (Estandarizado)
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

      // Respuesta estandarizada
      res.json({
        success: true,
        data: result.rows,
        count: result.rowCount,
      });
    } catch (error) {
      console.error('❌ Error al obtener alojamientos:', error.message);
      res.status(500).json({
        success: false,
        error: 'No se pudo cargar la lista de fincas. Intente más tarde.',
      });
    }
  },

  // 2. Crear una nueva finca (Usando el ID real del usuario logueado)
  create: async (req, res) => {
    const {
      nombre,
      ubicacion,
      descripcion,
      capacidad,
      precio_noche,
      servicios,
    } = req.body;

    // IMPORTANTE: Ya no usamos el ID 1 "quemado".
    // Usamos req.usuario.id que viene del token que desciframos en el middleware.
    const usuario_id = req.usuario.id;

    try {
      await pool.query('BEGIN');
      const queryFinca = `
        INSERT INTO alojamientos (nombre, ubicacion, descripcion, capacidad, precio_noche, estado, usuario_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
      `;

      const resultFinca = await pool.query(queryFinca, [
        nombre,
        ubicacion,
        descripcion,
        capacidad,
        precio_noche,
        'disponible',
        usuario_id,
      ]);

      if (servicios && servicios.length > 0) {
        await pool.query(
          `INSERT INTO alojamiento_servicios (alojamiento_id, servicio_id) 
           SELECT $1, unnest($2::int[])`,
          [resultFinca.rows[0].id, servicios],
        );
      }

      await pool.query('COMMIT');
      res.status(201).json({
        success: true,
        message: 'Finca creada exitosamente',
        data: resultFinca.rows[0],
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('❌ Error al crear finca:', error.message);
      res
        .status(500)
        .json({ success: false, error: 'Error al registrar la finca.' });
    }
  },

  // 3. Actualizar una finca (PUNTO CRÍTICO PARA EL PROFESOR)
  update: async (req, res) => {
    const { id } = req.params;
    const { nombre, ubicacion, descripcion, capacidad, precio_noche, estado } =
      req.body;

    try {
      const query = `
        UPDATE alojamientos 
        SET nombre = $1, ubicacion = $2, descripcion = $3, capacidad = $4, precio_noche = $5, estado = $6
        WHERE id = $7 RETURNING *
      `;
      const result = await pool.query(query, [
        nombre,
        ubicacion,
        descripcion,
        capacidad,
        precio_noche,
        estado,
        id,
      ]);

      if (result.rowCount === 0) {
        return res
          .status(404)
          .json({ success: false, error: 'Finca no encontrada' });
      }

      res.json({
        success: true,
        message: 'Información actualizada correctamente',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('❌ Error al actualizar finca:', error.message);
      res
        .status(500)
        .json({ success: false, error: 'Error al actualizar los datos.' });
    }
  },

  // 4. Eliminar una finca (PUNTO CRÍTICO PARA EL PROFESOR)
  delete: async (req, res) => {
    const { id } = req.params;
    try {
      // Primero eliminamos las relaciones en la tabla intermedia (alojamiento_servicios)
      await pool.query(
        'DELETE FROM alojamiento_servicios WHERE alojamiento_id = $1',
        [id],
      );

      // Luego eliminamos la finca
      const result = await pool.query(
        'DELETE FROM alojamientos WHERE id = $1',
        [id],
      );

      if (result.rowCount === 0) {
        return res
          .status(404)
          .json({ success: false, error: 'La finca no existe' });
      }

      res.json({
        success: true,
        message: 'Finca eliminada correctamente del sistema',
      });
    } catch (error) {
      console.error('❌ Error al eliminar finca:', error.message);
      res
        .status(500)
        .json({
          success: false,
          error: 'No se puede eliminar la finca si tiene reservas activas.',
        });
    }
  },
};

export default fincasController;
