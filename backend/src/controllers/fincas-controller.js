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

  create: async (req, res) => {
    console.log("=== CONTROL SENIOR - DATA ENTRANTE ===", req.body);
    const {
      nombre,
      ubicacion,
      descripcion,
      capacidad,
      precio_noche,
      servicios,
      servicios_ids,
      imagenes,
    } = req.body;

    const usuario_id = req.usuario.id;
    const serviciosSeleccionados = servicios_ids || servicios || [];

    const precioFinal = parseFloat(precio_noche);
    if (isNaN(precioFinal) || precioFinal <= 0) {
      return res.status(400).json({ success: false, error: 'El precio por noche debe ser un número válido mayor a 0' });
    }

    const capacidadFinal = capacidad ? parseInt(capacidad, 10) : 0;

    const imagenesFinal = Array.isArray(imagenes) && imagenes.length > 0
      ? imagenes.filter((u) => typeof u === 'string' && u.trim().length > 0)
      : ['https://placehold.co/800x600/0A4D27/FFFFFF?text=SENA+RURAL'];

    try {
      await pool.query('BEGIN');
      await pool.query('ALTER TABLE alojamientos ADD COLUMN IF NOT EXISTS imagenes TEXT[] DEFAULT $1', [['https://placehold.co/800x600/0A4D27/FFFFFF?text=SENA+RURAL']]);

      const queryFinca = `
        INSERT INTO alojamientos (nombre, ubicacion, descripcion, capacidad, precio_noche, estado, usuario_id, imagenes) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
      `;

      const resultFinca = await pool.query(queryFinca, [
        nombre,
        ubicacion,
        descripcion,
        capacidadFinal,
        precioFinal,
        'disponible',
        usuario_id,
        imagenesFinal,
      ]);

      if (serviciosSeleccionados.length > 0) {
        await pool.query(
          `INSERT INTO alojamiento_servicios (alojamiento_id, servicio_id) 
           SELECT $1, unnest($2::int[])`,
          [resultFinca.rows[0].id, serviciosSeleccionados],
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
      console.error("CRASH EN BACKEND DE FINCAS:", error);
      return res.status(500).json({
        error: error.message,
        detail: error.detail || "No sql detail available",
        stack: error.stack,
      });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    const { nombre, ubicacion, descripcion, capacidad, precio_noche, estado, imagenes, servicios_ids } =
      req.body;

    const imagenesFinal = Array.isArray(imagenes) && imagenes.length > 0
      ? imagenes.filter((u) => typeof u === 'string' && u.trim().length > 0)
      : ['https://placehold.co/800x600/0A4D27/FFFFFF?text=SENA+RURAL'];

    try {
      await pool.query('BEGIN');

      const query = `
        UPDATE alojamientos 
        SET nombre = $1, ubicacion = $2, descripcion = $3, capacidad = $4, precio_noche = $5, estado = $6, imagenes = $7
        WHERE id = $8 RETURNING *
      `;
      const result = await pool.query(query, [
        nombre,
        ubicacion,
        descripcion,
        capacidad,
        precio_noche,
        estado,
        imagenesFinal,
        id,
      ]);

      if (result.rowCount === 0) {
        await pool.query('ROLLBACK');
        return res
          .status(404)
          .json({ success: false, error: 'Finca no encontrada' });
      }

      if (servicios_ids && Array.isArray(servicios_ids)) {
        await pool.query('DELETE FROM alojamiento_servicios WHERE alojamiento_id = $1', [id]);
        if (servicios_ids.length > 0) {
          await pool.query(
            `INSERT INTO alojamiento_servicios (alojamiento_id, servicio_id)
             SELECT $1, unnest($2::int[])`,
            [id, servicios_ids],
          );
        }
      }

      await pool.query('COMMIT');

      res.json({
        success: true,
        message: 'Información actualizada correctamente',
        data: result.rows[0],
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error("Error detallado en backend:", error);
      return res.status(500).json({
        error: error.message,
        detail: error.detail,
        stack: error.stack,
      });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query(
        'DELETE FROM alojamiento_servicios WHERE alojamiento_id = $1',
        [id],
      );

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

  /* =====================================================
     5. AGREGAR IMAGEN A UNA FINCA
  ===================================================== */
  addImage: async (req, res) => {
    const { id } = req.params;
    const { url } = req.body;

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'La URL de la imagen es obligatoria' });
    }

    try {
      const result = await pool.query(
        `UPDATE alojamientos SET imagenes = COALESCE(array_append(imagenes, $1), ARRAY[$1]) WHERE id = $2 RETURNING *`,
        [url.trim(), id],
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, error: 'La finca no existe' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Error al agregar imagen:', error.message);
      res.status(500).json({ success: false, error: 'Error al agregar la imagen' });
    }
  },

  /* =====================================================
     6. ELIMINAR IMAGEN DE UNA FINCA POR ÍNDICE
  ===================================================== */
  removeImage: async (req, res) => {
    const { id, index } = req.params;
    const idx = parseInt(index, 10);

    if (isNaN(idx) || idx < 0) {
      return res.status(400).json({ success: false, error: 'Índice de imagen inválido' });
    }

    try {
      const finca = await pool.query('SELECT imagenes FROM alojamientos WHERE id = $1', [id]);
      if (finca.rowCount === 0) {
        return res.status(404).json({ success: false, error: 'La finca no existe' });
      }

      const imagenes = finca.rows[0].imagenes || [];
      if (idx >= imagenes.length) {
        return res.status(400).json({ success: false, error: 'Índice de imagen fuera de rango' });
      }

      const nuevasImagenes = imagenes.filter((_, i) => i !== idx);

      const result = await pool.query(
        'UPDATE alojamientos SET imagenes = $1 WHERE id = $2 RETURNING *',
        [nuevasImagenes, id],
      );

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Error al eliminar imagen:', error.message);
      res.status(500).json({ success: false, error: 'Error al eliminar la imagen' });
    }
  },
};

export default fincasController;
