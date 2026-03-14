import { Router } from 'express';
import { locationController } from '../controllers/location.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', locationController.getAll);
router.post('/', locationController.create);
router.get('/:id', locationController.getById);
router.put('/:id', locationController.update);
router.delete('/:id', locationController.delete);

export default router;
