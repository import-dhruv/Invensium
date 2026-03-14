import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema';

const router = Router();

router.use(authenticate);
router.get('/', productController.getAll);
router.post('/', validate(createProductSchema), productController.create);
router.get('/:id', productController.getById);
router.put('/:id', validate(updateProductSchema), productController.update);
router.delete('/:id', productController.delete);
router.get('/:id/stock', productController.getStock);

// Reorder rules
router.get('/:id/reorder-rules', productController.getReorderRules);
router.post('/:id/reorder-rules', productController.createReorderRule);
router.put('/reorder-rules/:ruleId', productController.updateReorderRule);
router.delete('/reorder-rules/:ruleId', productController.deleteReorderRule);

export default router;
