import pool from '../config/db.js';
import argon2 from 'argon2';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const verificarPassword = async (hash, password) => {
  if (hash?.startsWith('$argon2')) {
    return argon2.verify(hash, password);
  }

  if (hash?.startsWith('$2a$') || hash?.startsWith('$2b$')) {
    return bcrypt.compare(password, hash);
  }

  return false;
};

const usuariosController = {
  /* =====================================================
     1. LOGIN DE USUARIOS
  ===================================================== */
  loginUsuario: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y contraseña son obligatorios',
      });
    }

    try {
      const result = await pool.query(
        'SELECT * FROM usuarios WHERE email = $1',
        [email],
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          error: 'Usuario no encontrado',
        });
      }

      const usuario = result.rows[0];

      // 🔐 Verificar contraseña con ARGON2 o BCRYPT segun el hash guardado
      const passwordValida = await verificarPassword(usuario.password, password);

      if (!passwordValida) {
        return res.status(401).json({
          error: 'Contraseña incorrecta',
        });
      }

      // 🎟 Generar token para 30 días
      const token = jwt.sign(
        {
          id: usuario.id,
          email: usuario.email,
          rol: usuario.rol,
        },
        process.env.JWT_SECRET || 'clave_secreta_sena',
        { expiresIn: '30d' }, // <--- Cambia '8h' por '30d'
      );

      console.log(`✅ Login exitoso: ${usuario.nombre}`);

      res.json({
        message: 'Login exitoso',
        token,
        user: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        },
      });
    } catch (error) {
      console.error('❌ Error en login:', error.message);
      res.status(500).json({
        error: 'Error al iniciar sesión',
      });
    }
  },

  /* =====================================================
     2. OBTENER TODOS LOS USUARIOS
  ===================================================== */
  obtenerUsuarios: async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT id, nombre, email, rol FROM usuarios ORDER BY id ASC',
      );

      res.json(result.rows);
    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error.message);
      res.status(500).json({
        error: 'Error al obtener usuarios',
      });
    }
  },

  /* =====================================================
     3. CREAR NUEVO USUARIO
  ===================================================== */
  crearUsuario: async (req, res) => {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        error: 'Faltan datos obligatorios',
      });
    }

    try {
      // Verificar si ya existe
      const existe = await pool.query(
        'SELECT id FROM usuarios WHERE email = $1',
        [email],
      );

      if (existe.rowCount > 0) {
        return res.status(400).json({
          error: 'El usuario ya existe',
        });
      }

      // 🔐 Encriptar con ARGON2
      const passwordCifrada = await argon2.hash(password);

      const result = await pool.query(
        `INSERT INTO usuarios (nombre, email, password, rol)
         VALUES ($1, $2, $3, $4)
         RETURNING id, nombre, email, rol`,
        [nombre, email, passwordCifrada, rol || 'usuario'],
      );

      console.log(`✅ Usuario creado: ${nombre}`);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('❌ Error al crear usuario:', error.message);
      res.status(500).json({
        error: 'Error al crear usuario',
      });
    }
  },

  /* =====================================================
     4. ACTUALIZAR USUARIO
  ===================================================== */
  actualizarUsuario: async (req, res) => {
    const { id } = req.params;
    const { nombre, email, rol } = req.body;

    try {
      const result = await pool.query(
        `UPDATE usuarios
         SET nombre = $1,
             email = $2,
             rol = $3
         WHERE id = $4
         RETURNING id, nombre, email, rol`,
        [nombre, email, rol, id],
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          error: 'Usuario no encontrado',
        });
      }

      res.json({
        message: 'Usuario actualizado correctamente',
        usuario: result.rows[0],
      });
    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error.message);
      res.status(500).json({
        error: 'Error al actualizar usuario',
      });
    }
  },

  /* =====================================================
     5. ELIMINAR USUARIO
  ===================================================== */
  eliminarUsuario: async (req, res) => {
    const { id } = req.params;

    try {
      const result = await pool.query('DELETE FROM usuarios WHERE id = $1', [
        id,
      ]);

      if (result.rowCount === 0) {
        return res.status(404).json({
          error: 'Usuario no encontrado',
        });
      }

      res.json({
        message: 'Usuario eliminado correctamente',
      });
    } catch (error) {
      console.error('❌ Error al eliminar usuario:', error.message);
      res.status(500).json({
        error: 'Error al eliminar usuario',
      });
    }
  },
};

export default usuariosController;
