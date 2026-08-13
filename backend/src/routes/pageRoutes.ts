import { Router } from 'express';
import { getBySlug, upsert } from '../controllers/pageController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.get('/:slug', getBySlug);
router.put('/:slug', protect, adminOnly, upsert);

export default router;
