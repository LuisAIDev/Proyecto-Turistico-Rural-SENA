import express from 'express';
import usuariosController from '../controllers/usuarios-controller.js';
import { verificarToken } from '../middleware/auth-middleware.js';
import { verificarRol } from '../middleware/rol-middleware.js';

const router = express.Router();

/**
 * ==========================================
 * RUTAS DE USUARIOS - TURISMO RURAL
 * ==========================================
 */

router.post('/login', usuariosController.loginUsuario);

router.post(
  '/',
  verificarToken,
  verificarRol(['admin']),
  usuariosController.crearUsuario,
);

router.get(
  '/',
  verificarToken,
  verificarRol(['admin']),
  usuariosController.obtenerUsuarios,
);

router.put(
  '/:id',
  verificarToken,
  verificarRol(['admin']),
  usuariosController.actualizarUsuario,
);

router.delete(
  '/:id',
  verificarToken,
  verificarRol(['admin']),
  usuariosController.eliminarUsuario,
);

export default router;
