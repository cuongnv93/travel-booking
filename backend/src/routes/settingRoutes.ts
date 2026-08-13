import { Router } from 'express';
import { getAll, getByKey, upsert, seedMultiLang } from '../controllers/settingController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.get('/', getAll);
router.get('/:key', getByKey);
router.put('/:key', protect, adminOnly, upsert);

export default router;
