import { Router } from 'express';
import { uploadMiddleware, uploadSingle, listMedia, deleteMedia } from '../controllers/uploadController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

// CMS Media Library — strictly protected for Admin only
router.get('/', protect, adminOnly, listMedia);
router.post('/', protect, adminOnly, uploadMiddleware.single('image'), uploadSingle);
router.delete('/:filename', protect, adminOnly, deleteMedia);

export default router;
