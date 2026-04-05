import express from 'express';
import fincasController from '../controllers/fincas-controller.js';
import { verificarToken } from '../middleware/auth-middleware.js';
// 1️⃣ Importamos el nuevo portero de roles
import { verificarRol } from '../middleware/rol-middleware.js';

const router = express.Router();

/**
 * ==========================================
 * RUTAS DE FINCAS (ALOJAMIENTOS) - SENA RURAL
 * Protección de acceso por niveles de autoridad
 * ==========================================
 */

// 1. Obtener todas las fincas (Listar)
// Tanto el Administrador como el Empleado deben poder ver el catálogo
router.get(
  '/',
  verificarToken,
  verificarRol(['admin', 'empleado']),
  fincasController.getAll,
);

// 2. Crear una nueva finca (Registrar)
// Acción Crítica: Solo el Administrador puede dar de alta nuevas propiedades
router.post(
  '/',
  verificarToken,
  verificarRol(['admin']),
  fincasController.create,
);

// 3. Actualizar datos de una finca por ID
// Acción Crítica: Solo el Administrador puede modificar información oficial
router.put(
  '/:id',
  verificarToken,
  verificarRol(['admin']),
  fincasController.update,
);

// 4. Eliminar una finca
// Acción de máximo riesgo: Reservada exclusivamente para el Administrador
router.delete(
  '/:id',
  verificarToken,
  verificarRol(['admin']),
  fincasController.delete,
);

export default router;
