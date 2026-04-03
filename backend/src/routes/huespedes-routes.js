import express from 'express';
// Importamos el controlador actualizado con extensión .js
import huespedesController from '../controllers/huespedes-controller.js';

const router = express.Router();

// CRUD COMPLETO DE HUÉSPEDES
router.get('/', huespedesController.getAll); // Leer todos
router.post('/', huespedesController.create); // Crear
router.put('/:id', huespedesController.update); // Actualizar (¡Clave para el CRUD!)
router.delete('/:id', huespedesController.delete); // Eliminar

export default router;
