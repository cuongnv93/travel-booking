import { Router } from 'express';
import { getAll, getByGroup, getByKey, upsert, batchUpsert, seedMaster, seedMultiLang } from '../controllers/settingController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.get('/', getAll);
router.get('/group/:group', getByGroup);
router.get('/:key', getByKey);
router.put('/batch/update', protect, adminOnly, batchUpsert);
router.put('/:key', protect, adminOnly, upsert);
router.post('/seed-master', protect, adminOnly, seedMaster);
router.post('/seed-multilang', protect, adminOnly, seedMultiLang);

export default router;
