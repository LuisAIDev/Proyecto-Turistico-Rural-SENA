import express from 'express';
// Importamos el objeto completo para que coincida con el controlador
import reservasController from '../controllers/reservas-controller.js';
import { verificarToken } from '../middleware/auth-middleware.js';

const router = express.Router();

/**
 * ==========================================
 * RUTAS DE RESERVAS - SENA RURAL HUB
 * ==========================================
 */

// 1. Obtener todas las reservas (¡Vital para quitar la pantalla en blanco!)
// Esta ruta llama a 'getAll' que ahora sí devuelve un Array
router.get('/', verificarToken, reservasController.getAll);

// 2. Crear nueva reserva 
router.post('/', verificarToken, reservasController.create);

// 3. Eliminar reserva
// Si aún no tienes el método 'delete' en el controlador, el fallback evitará que el servidor se caiga
router.delete('/:id', verificarToken, reservasController.delete || ((req, res) => {
    res.status(404).json({ error: "El método para eliminar aún no ha sido implementado" });
}));

// 4. Actualizar estado (confirmar o cancelar)
router.put('/:id/:accion', verificarToken, reservasController.updateStatus || ((req, res) => {
    res.json({ message: "Ruta de actualización preparada para el siguiente paso" });
}));

export default router;