import express from 'express';
import huespedesController from '../controllers/huespedes-controller.js';

const router = express.Router();

router.get('/', huespedesController.getAll);
router.post('/', huespedesController.create);
router.put('/:id', huespedesController.update);
router.delete('/:id', huespedesController.delete);

export default router;
