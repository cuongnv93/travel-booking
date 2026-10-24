import { Router } from 'express';
import {
  getAll,
  getBySlug,
  getLocations,
  create,
  update,
  deleteHotel,
  toggleActive,
  toggleFlashSale,
  duplicateHotel
} from '../controllers/hotelController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.get('/', getAll);
router.get('/locations', getLocations);
router.get('/:slug', getBySlug);
router.post('/', protect, adminOnly, create);
router.post('/:id/duplicate', protect, adminOnly, duplicateHotel);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, deleteHotel);
router.patch('/:id/active', protect, adminOnly, toggleActive);
router.patch('/:id/flash-sale', protect, adminOnly, toggleFlashSale);

export default router;
