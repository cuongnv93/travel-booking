import { Router } from 'express';
import { create, getAll, updateStatus, remove, getStats } from '../controllers/consultationController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

// Public route to submit consultation / contact leads
router.post('/', create);

// Admin-only management routes
router.get('/', protect, adminOnly, getAll);
router.get('/stats', protect, adminOnly, getStats);
router.put('/:id', protect, adminOnly, updateStatus);
router.delete('/:id', protect, adminOnly, remove);

export default router;
