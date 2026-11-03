import { Router } from 'express';
import {
  create,
  getAll,
  getByUser,
  getById,
  updateStatus,
  cancelBooking,
  lookupByCode,
  getStats,
} from '../controllers/bookingController';
import { protect, optionalProtect, adminOnly } from '../middleware/auth';
import { bookingCreateLimiter, sensitiveLookupLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public / Guest / Auth
router.post('/', bookingCreateLimiter, optionalProtect, create);
router.get('/lookup', sensitiveLookupLimiter, lookupByCode);

// Authenticated user
router.get('/my', protect, getByUser);
router.patch('/:id/cancel', protect, cancelBooking);

// Admin only
router.get('/stats', protect, adminOnly, getStats);
router.get('/', protect, adminOnly, getAll);
router.get('/:id', protect, getById);
router.patch('/:id/status', protect, adminOnly, updateStatus);

export default router;
