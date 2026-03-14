import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import warehouseRoutes from './warehouse.routes';
import locationRoutes from './location.routes';
import receiptRoutes from './receipt.routes';
import deliveryRoutes from './delivery.routes';
import transferRoutes from './transfer.routes';
import adjustmentRoutes from './adjustment.routes';
import dashboardRoutes from './dashboard.routes';
import moveHistoryRoutes from './moveHistory.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/locations', locationRoutes);
router.use('/receipts', receiptRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/transfers', transferRoutes);
router.use('/adjustments', adjustmentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/move-history', moveHistoryRoutes);

export default router;
