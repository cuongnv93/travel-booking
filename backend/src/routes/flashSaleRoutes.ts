import { Router } from 'express';
import { getFlashSaleItems, seedFlashSale } from '../controllers/flashSaleController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', getFlashSaleItems);
router.post('/seed', protect, adminOnly, seedFlashSale);

export default router;
