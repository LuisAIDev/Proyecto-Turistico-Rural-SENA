import express from 'express';
import publicController from '../controllers/public-controller.js';

const router = express.Router();

router.get('/alojamientos', publicController.getAlojamientos);
router.post('/reservas', publicController.crearSolicitudReserva);
router.post('/reservas/consultar', publicController.consultarReservasCliente);

export default router;
