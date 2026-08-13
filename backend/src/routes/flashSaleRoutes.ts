import { Router } from 'express';
import { getFlashSaleItems, seedFlashSale } from '../controllers/flashSaleController';

const router = Router();

router.get('/', getFlashSaleItems);

export default router;
