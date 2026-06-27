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
router.delete('/:id', verificarToken, reservasController.delete);

// 4. Actualizar estado (confirmar o cancelar)
router.put('/:id/:accion', verificarToken, reservasController.updateStatus);

// 5. KPI rentabilidad (alojamiento con más ingresos)
router.get('/kpi/rentabilidad', verificarToken, reservasController.getKpiRentabilidad);

export default router;