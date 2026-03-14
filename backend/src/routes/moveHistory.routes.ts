import { Router } from 'express';
import { moveHistoryController } from '../controllers/moveHistory.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', moveHistoryController.getAll);

export default router;
