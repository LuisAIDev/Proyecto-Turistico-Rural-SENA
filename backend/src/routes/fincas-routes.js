import express from 'express';
// Importamos el objeto completo para evitar choques de nombres con el controlador
import fincasController from '../controllers/fincas-controller.js';
import { verificarToken } from '../middleware/auth-middleware.js';

const router = express.Router();

/**
 * ==========================================
 * RUTAS DE FINCAS (ALOJAMIENTOS) - SENA RURAL
 * Corregidas para sincronizar con el controlador
 * ==========================================
 */

// 1. Obtener todas las fincas (Listar)
// Si el método no existe en el controlador, muestra un mensaje amigable en vez de tumbar el servidor
router.get('/', fincasController.getAll || ((req, res) => res.json({ message: "Ruta de fincas activa" })));

// 2. Crear una nueva finca (Registrar)
// Requiere verificarToken para asegurar que el usuario esté autenticado
router.post('/', verificarToken, fincasController.create);

// 3. Actualizar datos de una finca por ID
router.put('/:id', verificarToken, fincasController.update || ((req, res) => res.status(404).json({ error: "Método update no implementado" })));

// 4. Eliminar una finca
router.delete('/:id', verificarToken, fincasController.delete || ((req, res) => res.status(404).json({ error: "Método delete no implementado" })));

export default router;