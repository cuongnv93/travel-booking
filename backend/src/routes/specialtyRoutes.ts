import { Router } from 'express';
import { getAll, getBySlug, create, update, deleteSpecialty } from '../controllers/specialtyController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.get('/', getAll);
router.get('/:slug', getBySlug);
router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, deleteSpecialty);

export default router;
