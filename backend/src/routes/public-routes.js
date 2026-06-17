import express from 'express';
import publicController from '../controllers/public-controller.js';

const router = express.Router();

router.get('/alojamientos', publicController.getAlojamientos);
router.post('/reservas', publicController.crearSolicitudReserva);

export default router;
