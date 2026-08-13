import { Router } from 'express';
import { getAll, getBySlug, create, update, deleteTour, toggleFeatured, getDestinations, fixLandmarkImages } from '../controllers/tourController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.get('/', getAll);
router.get('/destinations', getDestinations);
router.get('/:slug', getBySlug);
router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, deleteTour);
router.patch('/:id/featured', protect, adminOnly, toggleFeatured);

export default router;
