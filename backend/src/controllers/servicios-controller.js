// Importación corregida para ES Modules (sin llaves y con extensión .js)
import pool from '../config/db.js';

const serviciosController = {
  /**
   * 1. OBTENER TODO EL CATÁLOGO
   * Trae todos los servicios desde la tabla 'servicios_adicionales' ordenados por nombre.
   */
  getAll: async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM servicios_adicionales ORDER BY nombre ASC'
      );
      res.json(result.rows);
    } catch (error) {
      console.error('❌ Error en getAll:', error.message);
      res.status(500).json({ 
        error: 'Error al obtener el catálogo de servicios de la base de datos' 
      });
    }
  },

  /**
   * 2. CREAR NUEVO SERVICIO
   * Inserta nombre, icono, ref_code y precio en la base de datos.
   */
  create: async (req, res) => {
    const { nombre, icono, ref_code, precio } = req.body;

    // Validación básica de campos requeridos
    if (!nombre || !icono) {
      return res.status(400).json({
        error: 'El nombre y el icono son campos obligatorios.',
      });
    }

    try {
      // Generación automática de código de referencia si no se proporciona
      const codigoReferencia =
        ref_code && ref_code.trim() !== ''
          ? ref_code.toUpperCase().trim()
          : nombre.substring(0, 3).toUpperCase().trim();

      // Aseguramos que el precio sea un número válido
      const precioFinal = parseFloat(precio) || 0;

      const query = `
        INSERT INTO servicios_adicionales (nombre, icono, ref_code, precio) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `;

      const result = await pool.query(query, [
        nombre.trim(),
        icono.trim(),
        codigoReferencia,
        precioFinal,
      ]);

      console.log('✅ Servicio guardado correctamente:', result.rows[0].nombre);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('❌ Error detallado al insertar servicio:', error.message);

      // Manejo de error de clave duplicada en PostgreSQL
      if (error.code === '23505') {
        return res.status(400).json({
          error: 'Ya existe un servicio con este nombre o código de referencia.',
        });
      }

      res.status(500).json({
        error: 'Error interno del servidor al procesar el guardado.',
      });
    }
  },

  /**
   * 3. ELIMINAR UN SERVICIO
   * Elimina un registro por ID y verifica si existía.
   */
  delete: async (req, res) => {
    const { id } = req.params;

    try {
      const result = await pool.query(
        'DELETE FROM servicios_adicionales WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Servicio no encontrado.' });
      }

      console.log(`✅ Servicio con ID ${id} eliminado.`);
      res.json({ message: 'Servicio eliminado con éxito del sistema.' });
    } catch (error) {
      console.error('❌ Error al eliminar servicio:', error.message);
      res.status(500).json({
        error: 'No se pudo eliminar el servicio. Verifique si está siendo usado en alguna reserva.',
      });
    }
  },
};

// Exportación por defecto para ser usada en routes/servicios.js
export default serviciosController;