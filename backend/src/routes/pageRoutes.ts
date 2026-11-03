import { Router } from 'express';
import { getBySlug, upsert } from '../controllers/pageController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/:slug', getBySlug);
router.put('/:slug', protect, adminOnly, upsert);

export default router;
