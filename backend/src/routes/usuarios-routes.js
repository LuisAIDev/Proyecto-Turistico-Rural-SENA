import express from 'express';
import usuariosController from '../controllers/usuarios-controller.js';
import { verificarToken } from '../middleware/auth-middleware.js';
// 1️⃣ Importamos el nuevo middleware de roles que definimos en el paso anterior
import { verificarRol } from '../middleware/rol-middleware.js';

const router = express.Router();

/**
 * ==========================================
 * RUTAS DE USUARIOS - TURISMO RURAL
 * ==========================================
 */

// 1. Login (Público)
router.post('/login', usuariosController.loginUsuario);

// 2. Registro de nuevos usuarios
// PROFESIONALISMO: Una vez creado el primer admin, esta ruta debe ser protegida.
// Solo un administrador debería poder crear otros usuarios (empleados o admins).
router.post(
  '/',
  verificarToken,
  verificarRol(['admin']),
  usuariosController.crearUsuario,
);

// 3. Obtener lista completa
// Solo el 'admin' debe ver la lista de todos los usuarios/empleados.
router.get(
  '/',
  verificarToken,
  verificarRol(['admin']),
  usuariosController.obtenerUsuarios,
);

// 4. Actualizar datos
// Un admin puede editar a cualquiera, o podrías ampliarlo a ['admin', 'empleado']
// si permites que cada uno edite su propio perfil.
router.put(
  '/:id',
  verificarToken,
  verificarRol(['admin']),
  usuariosController.actualizarUsuario,
);

// 5. Eliminar usuario
// Acción crítica: Solo el administrador absoluto tiene este permiso.
router.delete(
  '/:id',
  verificarToken,
  verificarRol(['admin']),
  usuariosController.eliminarUsuario,
);

export default router;
