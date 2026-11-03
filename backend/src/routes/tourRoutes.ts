import { Router } from 'express';
import {
  getAll,
  getBySlug,
  create,
  update,
  deleteTour,
  toggleFeatured,
  toggleActive,
  duplicateTour,
  getDestinations,
} from '../controllers/tourController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', getAll);
router.get('/destinations', getDestinations);
router.get('/:slug', getBySlug);
router.post('/', protect, adminOnly, create);
router.post('/:id/duplicate', protect, adminOnly, duplicateTour);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, deleteTour);
router.patch('/:id/featured', protect, adminOnly, toggleFeatured);
router.patch('/:id/active', protect, adminOnly, toggleActive);

export default router;
