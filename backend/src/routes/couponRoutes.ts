import { Router } from 'express';
import { create, getAll, update, remove, validate } from '../controllers/couponController';
import { protect, adminOnly } from '../middleware/auth';
import { sensitiveLookupLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public validation with brute-force rate limiter
router.post('/validate', sensitiveLookupLimiter, validate);

// Admin only management
router.post('/', protect, adminOnly, create);
router.get('/', protect, adminOnly, getAll);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, remove);

export default router;
