import { Router } from 'express';
import { transferController } from '../controllers/transfer.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTransferSchema, addTransferLineSchema } from '../schemas/transfer.schema';

const router = Router();

router.use(authenticate);
router.get('/', transferController.getAll);
router.post('/', validate(createTransferSchema), transferController.create);
router.get('/:id', transferController.getById);
router.put('/:id', transferController.update);
router.post('/:id/lines', validate(addTransferLineSchema), transferController.addLine);
router.post('/:id/validate', transferController.validate);

export default router;
