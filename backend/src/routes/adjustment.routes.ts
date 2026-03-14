import { Router } from 'express';
import { adjustmentController } from '../controllers/adjustment.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createAdjustmentSchema, addAdjustmentLineSchema } from '../schemas/adjustment.schema';

const router = Router();

router.use(authenticate);
router.get('/', adjustmentController.getAll);
router.post('/', validate(createAdjustmentSchema), adjustmentController.create);
router.get('/:id', adjustmentController.getById);
router.put('/:id', adjustmentController.update);
router.post('/:id/lines', validate(addAdjustmentLineSchema), adjustmentController.addLine);
router.post('/:id/validate', adjustmentController.validate);

export default router;
