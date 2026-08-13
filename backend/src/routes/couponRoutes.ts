import { Router } from 'express';
import { create, getAll, update, remove, validate } from '../controllers/couponController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

// Public
router.post('/validate', validate);

// Admin only
router.post('/', protect, adminOnly, create);
router.get('/', protect, adminOnly, getAll);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, remove);

export default router;
