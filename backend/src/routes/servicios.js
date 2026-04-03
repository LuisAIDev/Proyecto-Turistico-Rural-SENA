import express from 'express';
import serviciosController from '../controllers/servicios-controller.js';

const router = express.Router();

router.get('/', serviciosController.getAll);
router.post('/', serviciosController.create);
router.delete('/:id', serviciosController.delete);

export default router;