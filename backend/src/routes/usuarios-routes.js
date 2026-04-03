import express from 'express';
import usuariosController from '../controllers/usuarios-controller.js';
// Asegúrate de que la ruta a tu middleware de autenticación sea la correcta
import { verificarToken } from '../middleware/auth-middleware.js'; 

const router = express.Router();

/**
 * ==========================================
 * RUTAS DE USUARIOS - TURISMO RURAL
 * ==========================================
 */

// 1. Login (Público: Siempre debe estar abierto para poder entrar)
router.post('/login', usuariosController.loginUsuario);

// 2. Registro de nuevos usuarios / Crear Admin
// IMPORTANTE: Hemos quitado 'verificarToken' de aquí temporalmente.
// Esto te permite usar Postman para crear tu usuario inicial sin que te pida un token.
router.post('/', usuariosController.crearUsuario);

// 3. Obtener lista completa (Protegido: Solo usuarios logueados pueden ver la lista)
router.get('/', verificarToken, usuariosController.obtenerUsuarios);

// 4. Actualizar datos (Protegido)
router.put('/:id', verificarToken, usuariosController.actualizarUsuario);

// 5. Eliminar empleado (Protegido)
router.delete('/:id', verificarToken, usuariosController.eliminarUsuario);

export default router;