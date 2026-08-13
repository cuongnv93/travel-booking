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
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

// Public
router.post('/', create);                                    // Create booking (guest or auth)
router.get('/lookup', lookupByCode);                         // GET /api/bookings/lookup?code=TRV-xxx

// Authenticated user
router.get('/my', protect, getByUser);                       // User's own bookings
router.patch('/:id/cancel', protect, cancelBooking);         // User self-cancel

// Admin only
router.get('/stats', protect, adminOnly, getStats);          // Dashboard stats
router.get('/', protect, adminOnly, getAll);                 // All bookings
router.get('/:id', protect, getById);                        // Single booking
router.patch('/:id/status', protect, adminOnly, updateStatus); // Admin update status

export default router;
