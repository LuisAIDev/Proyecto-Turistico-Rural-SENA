import express from 'express';
import pagosController from '../controllers/pagos-controller.js';
import { verificarToken } from '../middleware/auth-middleware.js';

const router = express.Router();

router.get('/', verificarToken, pagosController.getAll);
router.post('/', verificarToken, pagosController.create);
router.post('/procesar', verificarToken, pagosController.procesar);

export default router;
