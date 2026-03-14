import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCategorySchema } from '../schemas/product.schema';

const router = Router();

router.use(authenticate);
router.get('/', categoryController.getAll);
router.post('/', validate(createCategorySchema), categoryController.create);
router.get('/:id', categoryController.getById);
router.put('/:id', validate(createCategorySchema), categoryController.update);
router.delete('/:id', categoryController.delete);

export default router;
