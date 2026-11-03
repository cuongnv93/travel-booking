import { Router } from 'express';
import { create, getAll, updateStatus, remove, getStats } from '../controllers/consultationController';
import { protect, adminOnly } from '../middleware/auth';
import { consultationLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public route to submit consultation / contact leads (protected with rate limiter)
router.post('/', consultationLimiter, create);

// Admin-only management routes
router.get('/', protect, adminOnly, getAll);
router.get('/stats', protect, adminOnly, getStats);
router.put('/:id', protect, adminOnly, updateStatus);
router.delete('/:id', protect, adminOnly, remove);

export default router;
