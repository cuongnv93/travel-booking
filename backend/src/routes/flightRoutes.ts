import { Router } from 'express';
import { getAll, getById, create, update, remove } from '../controllers/flightController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', getAll);
router.get('/:id', getById);

router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, remove);

export default router;
