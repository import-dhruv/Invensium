import { Router } from 'express';
import { receiptController } from '../controllers/receipt.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createReceiptSchema, addReceiptLineSchema } from '../schemas/receipt.schema';

const router = Router();

router.use(authenticate);
router.get('/', receiptController.getAll);
router.post('/', validate(createReceiptSchema), receiptController.create);
router.get('/:id', receiptController.getById);
router.put('/:id', receiptController.update);
router.post('/:id/lines', validate(addReceiptLineSchema), receiptController.addLine);
router.post('/:id/validate', receiptController.validate);

export default router;
