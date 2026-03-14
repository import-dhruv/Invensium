import { Router } from 'express';
import { warehouseController } from '../controllers/warehouse.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', warehouseController.getAll);
router.post('/', warehouseController.create);
router.get('/:id', warehouseController.getById);
router.put('/:id', warehouseController.update);
router.delete('/:id', warehouseController.delete);

export default router;
