import { Router } from 'express';
import { getAll, getBySlug, getLocations, create, update, deleteHotel } from '../controllers/hotelController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.get('/', getAll);
router.get('/locations', getLocations);    // GET /api/hotels/locations — distinct location list
router.get('/:slug', getBySlug);
router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, deleteHotel);

export default router;
