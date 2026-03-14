import { Router } from 'express';
import { deliveryController } from '../controllers/delivery.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createDeliverySchema, addDeliveryLineSchema } from '../schemas/delivery.schema';

const router = Router();

router.use(authenticate);
router.get('/', deliveryController.getAll);
router.post('/', validate(createDeliverySchema), deliveryController.create);
router.get('/:id', deliveryController.getById);
router.put('/:id', deliveryController.update);
router.post('/:id/lines', validate(addDeliveryLineSchema), deliveryController.addLine);
router.post('/:id/validate', deliveryController.validate);

export default router;
