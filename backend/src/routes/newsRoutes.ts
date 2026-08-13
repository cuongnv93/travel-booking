import { Router } from 'express';
import { getAll, getAllAdmin, getBySlug, create, update, deleteNews } from '../controllers/newsController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.get('/', getAll);
router.get('/admin/all', protect, adminOnly, getAllAdmin); // CMS: all including drafts
router.get('/:slug', getBySlug);
router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, deleteNews);

export default router;
