import express from 'express';
import valoracionesController from '../controllers/valoraciones-controller.js';
import { verificarToken } from '../middleware/auth-middleware.js';

const router = express.Router();

router.post('/crear', verificarToken, valoracionesController.crear);
router.get('/alojamiento/:alojamiento_id', verificarToken, valoracionesController.getPorAlojamiento);

export default router;
